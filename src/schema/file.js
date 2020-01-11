import { gql } from 'apollo-server';
import { format } from 'util';

import gcloud from '../services/gcloud';
import { generateNewFileName, checkBeforeFileUpload } from '../utils/files';


export const typeDefs = gql`

	type File {
		id: ID!
		name: String!
		originalName: String!
		size: Long!
		url: String!
		bucket: String
		hash: String!
		deleted: Boolean!
		createdAt: DateTime!
		updatedAt: DateTime!
		company: Company!
	}

	input FileInput {
		name: String
		originalName: String
		size: Long
		bucket: String
		hash: String
		deleted: Boolean
	}

	extend type Query {
		file(id: ID!): File!

		requestUploadUri(originalName: String!, size: Long!): String!
	}

	extend type Mutation {
		createFile(data: FileInput!): File!
		updateFile(id: ID!, data: FileInput!): File!

		checkDeletedFiles: [File]!
	}
`;

export const resolvers = {
	Query: {
		file: (_, { id }) => {
			return File.findByPk(id)
				.then(file => {
					if (!file) throw new Error('Arquivo não encontrado')
				})
		},
		requestUploadUri: async (_, { originalName, size }, ctx) => {
			if (await checkBeforeFileUpload({ company_id: ctx.company.get('id'), size })) {
				const newFileName = generateNewFileName(originalName);
				const newFile = ctx.bucket.file(newFileName);

				const [uri] = await newFile.createResumableUpload();

				return uri;
			}
		}
	},

	Mutation: {
		createFile: (_, { data }, { user }) => {
			// insert url in data
			data.url = format(`https://storage.googleapis.com/${data.bucket}/${data.name}`);

			// save file
			return user.createFile(data);
		},
		updateFile: (_, { id, data }) => {
			return File.findByPk(id)
				.then(file => {
					if (!file) throw new Error('Arquivo não encontrado');

					return file.update(data, { fields: ['deleted'] })
				})
		},
		checkDeletedFiles: (_, __, { user }) => {
			return user.getFiles({ where: { deleted: false } })
				.then(async (files) => {
					const returnFiles = [];

					await Promise.all(
						files.map(async (file) => {
							const bucket = gcloud.bucket(user.bucket);
							const [bucketExists] = await bucket.exists();
							if (!bucketExists) throw new Error('Bucket não foi encontrado');

							const gFile = bucket.file(file.name);
							const [fileExists] = await gFile.exists();

							if (!fileExists) {
								await file.update({ deleted: true });
								returnFiles.push(file);
							}
						})
					)

					return returnFiles;
				})
		}
	},


	File: {
		company: (parent) => {
			return parent.getCompany();
		}
	}
}
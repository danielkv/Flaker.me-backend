import { gql } from 'apollo-server';
import { format } from 'util';

import { File } from '../model';
import { generateNewFileName } from '../utils/files';


export const typeDefs = gql`

	type File {
		id: ID!
		name: String!
		originalName: String!
		size: Int!
		url: String!
		bucket: String
		hash: String!
		deleted: Boolean!
		createdAt: String!
		updatedAt: String!
		company: Company!
	}

	input FileInput {
		name: String
		originalName: String
		size: Int
		bucket: String
		#url: String
		hash: String
		deleted: Boolean
	}

	extend type Query {
		file(id: ID!): File!

		requestUploadUri(originalName: String!): String!
	}

	extend type Mutation {
		createFile(data: FileInput!): File!
		updateFile(id: ID!, data: FileInput!): File!
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
		requestUploadUri: async (_, { originalName }, ctx) => {
			const newFileName = generateNewFileName(originalName);
			const newFile = ctx.bucket.file(newFileName);

			const uri = await newFile.createResumableUpload();

			return uri;
		}
	},

	Mutation: {
		createFile: (_, { data }) => {
			// insert url in data
			data.url = format(`https://storage.googleapis.com/${data.bucket}/${data.name}`);

			// save file
			return File.create(data);
		},
		updateFile: (_, { id, data }) => {
			return File.findByPk(id)
				.then(file => {
					if (!file) throw new Error('Arquivo não encontrado');

					return file.update(data, { fields: ['deleted']})
				})
		},
	},


	File: {
		company: (parent) => {
			return parent.getCompany();
		}
	}
}
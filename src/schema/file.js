import { gql } from 'apollo-server';
import { format } from 'util';

// import { File from '../model/file';
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
		createFile: (_, { data }, ctx) => {
			// insert url in data
			data.url = format(`https://storage.googleapis.com/${data.bucket}/${data.name}`);

			// save file
			return ctx.user.createFile(data);
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
const { gql } = require('apollo-server');
const { File } = require('../model');
const { format } = require('util');
const { generateNewFileName } = require('../utils/files');

module.exports.typeDefs = gql`

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
	}

	extend type Mutation {
		createFile(data: FileInput!): File!
		updateFile(id: ID!, data: FileInput!): File!

		generateUploadUrl(originalName: String!): String!
	}
`;

module.exports.resolvers = {
	Query: {
		file: (_, { id }) => {
			return File.findByPk(id)
				.then(file => {
					if (!file) throw new Error('Arquivo não encontrado')
				})
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

					return file.update(data, { fields: ['deleted'] })
				})
		},
		generateUploadUrl: (_, originalName, ctx) => {
			const newFileName = generateNewFileName(originalName);
			const newFile = ctx.bucket.file(newFileName);

			newFile.createResumableUpload((err, uri)=>{
				if (err) throw new Error(err);

				return uri;
			});
		}
	},

	File: {
		company: (parent) => {
			return parent.getCompany();
		}
	}
}
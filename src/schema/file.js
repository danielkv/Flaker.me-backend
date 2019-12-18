const { gql } = require('apollo-server');

module.exports.typeDefs = gql`

	type File {
		id: ID!
		name: String!
		originalName: String!
		size: Int!
		url: String!
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
		url: String
		hash: String
		deleted: Boolean
	}

	extend type Query {
		file(id: ID!): File!
	}

	extend type Mutation {
		createFile(data: FileInput!): File!
		updateFile(id: ID!, data: FileInput!): File!
	}
`;

module.exports.resolvers = {
	Query: {
		file: (_, { id }) => {

		}
	},

	Mutation: {
		createFile: (_, { data }) => {

		},
		updateFile: (_, { id, data }) => {

		}
	},

	File: {
		company: () => {

		}
	}
}
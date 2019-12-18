const { gql } = require('apollo-server');

module.exports.typeDefs = gql`
	type Meta {
		id: ID!
		key: String!
		value: String!
		createdAt: String!
	}

	input MetaInput {
		id: ID
		action: String! #create | update | delete
		key: String
		meta_value: String
	}
`;

module.exports.resolvers = {}
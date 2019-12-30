import { gql } from 'apollo-server';

export const typeDefs = gql`
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

export const resolvers = {}
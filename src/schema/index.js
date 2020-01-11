import { makeExecutableSchema, gql } from 'apollo-server';
import { GraphQLScalarType } from 'graphql';
import GraphQLLong from 'graphql-type-long';
import { Kind } from 'graphql/language';
import { merge } from 'lodash';

//types
import { typeDefs as Address, resolvers as addressResolvers } from './address';
import { typeDefs as Company, resolvers as companyResolvers } from './company';
import { typeDefs as File, resolvers as fileResolvers } from './file';
import { typeDefs as Meta, resolvers as metaResolvers } from './meta';
import { typeDefs as Phone, resolvers as phoneResolvers } from './phone';
import { typeDefs as User, resolvers as userResolvers } from './user';

const typeDefs = gql`
	#directive @isAuthenticated on FIELD | FIELD_DEFINITION
	#directive @hasRole(permission: String!, scope: String = "master") on FIELD | FIELD_DEFINITION
	#directive @dateTime on FIELD | FIELD_DEFINITION

	#scalar Upload

	scalar Long
	scalar DateTime

	input Filter {
		showInactive: Boolean
		status: String
		createdAt: String
		search: String
	}

	input Pagination {
		page: Int!
		rowsPerPage: Int!
	}
`

const resolvers = {
	Long: GraphQLLong,
	DateTime: new GraphQLScalarType({
		name: 'Date',
		description: 'Date custom scalar type',
		parseValue(value) {
			return new Date(value); // value from the client
		},
		serialize(value) {
			return value.getTime(); // value sent to the client
		},
		parseLiteral(ast) {
			if (ast.kind === Kind.INT) {
				return new Date(ast.value) // ast value is always in string format
			}
			return null;
		},
	}),
}

export default makeExecutableSchema({
	typeDefs : [typeDefs, Company, User, File, Address, Phone, Meta],
	resolvers : merge(resolvers, companyResolvers, userResolvers, fileResolvers, addressResolvers, phoneResolvers, metaResolvers),
	//directiveResolvers : directives,
})
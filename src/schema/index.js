import { makeExecutableSchema, gql } from 'apollo-server';
import GraphQLLong from 'graphql-type-long';
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
	Long: GraphQLLong
}

export default makeExecutableSchema({
	typeDefs : [typeDefs, Company, User, File, Address, Phone, Meta],
	resolvers : merge(resolvers, companyResolvers, userResolvers, fileResolvers, addressResolvers, phoneResolvers, metaResolvers),
	//directiveResolvers : directives,
})
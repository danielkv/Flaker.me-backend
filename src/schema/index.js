const {makeExecutableSchema, gql} = require('apollo-server');
const {merge} = require('lodash');
//const directives = require('./directives');

//types
const {typeDefs: Company, resolvers: companyResolvers} = require('./company');
const {typeDefs: User, resolvers: userResolvers} = require('./user');
const {typeDefs: File, resolvers: fileResolvers} = require('./file');

const {typeDefs: Address, resolvers: addressResolvers} = require('./address');
const {typeDefs: Phone, resolvers: phoneResolvers} = require('./phone');

const typeDefs = gql`
	#directive @isAuthenticated on FIELD | FIELD_DEFINITION
	#directive @hasRole(permission: String!, scope: String = "master") on FIELD | FIELD_DEFINITION
	#directive @dateTime on FIELD | FIELD_DEFINITION

	#scalar Upload

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

const resolvers = {}

module.exports = makeExecutableSchema({
	typeDefs : [typeDefs, Company, User, File, Address, Phone],
	resolvers : merge(resolvers, companyResolvers, userResolvers, fileResolvers, addressResolvers, phoneResolvers),
	//directiveResolvers : directives,
})
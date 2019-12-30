import { gql } from 'apollo-server';

import { Company, CompanyMeta } from '../model'

export const typeDefs = gql`
	type Company {
		id: ID!
		name: String!
		display_name: String!
		active: Boolean!
		createdAt: String!
		updatedAt: String!

		metas: [Meta]!

		users(filter: Filter, pagination: Pagination): [User]!
	}

	input CompanyInput {
		name: String
		display_name: String
		active: Boolean
		metas: [MetaInput]
	}

	type Mutation {
		createCompany(data: CompanyInput!): Company!
		updateCompany(id: ID!, data: CompanyInput!): Company!
	}

	type Query {
		company(id: ID!): Company!
	}
`;

export const resolvers = {
	Mutation : {
		createCompany: (_, { data }) => {
			return sequelize.transaction(transaction => {
				return Companies.create(data, { include: [CompaniesMeta], transaction })
			})
		},
		updateCompany: (_, { id, data }) => {
			return sequelize.transaction(transaction => {
				return Companies.findByPk(id)
					.then(company => {
						if (!company) throw new Error('Empresa não encontrada');

						return company.update(data, { fields: ['name', 'display_name', 'active'], transaction })
					})
					.then(async (company_updated) => {
						if (data.metas) {
							await CompanyMeta.updateAll(data.metas, company_updated, transaction);
						}
						return company_updated;
					})
			})
		}
	},
	Query : {
		company: (_, { id }) => {
			return Company.findByPk(id)
				.then(company => {
					if (!company) throw new Error('Empresa não encontrada');

					return company;
				});
		}
	},
	
	Company: {
		metas: (parent) => {
			return parent.getMetas();
		},
		users: (parent) => {
			return parent.getMetas();
		}
	}
}
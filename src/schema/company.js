import { gql } from 'apollo-server';
import { randomBytes } from 'crypto';

import Company from '../model/company';
import CompanyMeta from '../model/companyMeta';
import conn from '../services/connection';
import { getCompanyFilesSize, getCompanyLimit } from '../utils/files';

export const typeDefs = gql`
	type Company {
		id: ID!
		name: String!
		display_name: String!
		active: Boolean!
		createdAt: DateTime!
		updatedAt: String!
		token: String!

		metas: [Meta]!

		users(filter: Filter, pagination: Pagination): [User]!
		limit: Long!
		size: Long!
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
		createCompany: (_, { data }, { user }) => {
			if (user.id !== 1) throw new Error('Você não tem autorização para criar uma empresa');

			data.token = randomBytes(8).toString('hex');

			return Company.create(data, { include: [CompanyMeta] })
		},
		updateCompany: (_, { id, data }) => {
			return conn.transaction(transaction => {
				return Company.findByPk(id)
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
			return parent.getUsers();
		},
		size: (parent) => {
			return getCompanyFilesSize(parent.get('id'));
		},
		limit: (parent) => {
			return getCompanyLimit(parent.get('id'));
		}
	}
}
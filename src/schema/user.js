import { gql } from 'apollo-server';
import { sign, verify } from 'jsonwebtoken';

import { User, UserMeta } from '../model';
import { salt } from '../utils';


export const typeDefs = gql`
	type User {
		id: ID!
		firstName: String!
		lastName: String!
		email: String!
		role: String!
		active: Boolean!
		createdAt: String!
		updatedAt: String!

		metas: [Meta]!
		company: Company!
		files: [File]!
		settings: [Meta]!
	}

	input UserInput {
		firstName: String
		lastName: String
		password: String
		role: String
		email: String
		active: Boolean
		metas: [MetaInput]
	}

	type Login {
		user: User!
		token: String!
	}

	extend type Mutation {
		login(email: String!, password: String!): Login!
		authenticate(token: String!): User!
		
		createUser(data: UserInput!): User!
		updateUser(id:ID!, data:UserInput!): User!
		
		setUserRole(id: ID!, role_id: ID!): User!

		removeUserAddress(id: ID!): Address!
		updateUserAddress(id: ID!, data: AddressInput!): Address!
		createUserAddress(data: AddressInput!): Address!
	}

	extend type Query {
		user(id: ID!): User!
	}

`;

export const resolvers = {
	Query : {
		user: (_, { id }) => {
			return User.findByPk(id)
				.then(user => {
					if (!user) throw new Error('Usuário não encontrada');

					return user;
				});
		}
	},
	Mutation : {
		createUser: (_, { data }, ctx) => {
			return ctx.company.createUser(data, { include: [UserMeta]});
		},
		updateUser: (_, { id, data }) => {
			return sequelize.transaction(transaction => {
				return User.findByPk(id)
					.then(user=>{
						if (!user) throw new Error('Usuário não encontrada');

						return user.update(data, { fields: ['first_name', 'last_name', 'password', 'active'], transaction })
					})
					.then(async (user_updated) => {
						if (data.metas) {
							await UserMeta.updateAll(data.metas, user_updated, transaction);
						}
						return user_updated;
					})
			})
		},
		setUserRole : (_, { id, role }, ctx) => {
			return User.findByPk(id)
				.then((user) => {
					if (!user) throw new Error('Usuário não encontrada');

					return user.update({ role }, { fields: ['role']});
				});
		},
		login: (_, { email, password }) => {
			return User.findOne({ where: { email } })
				.then ((user_found)=>{
					// verifies if user exists
					if (!user_found) throw new Error('Usuário não encotrado');
			
					// gera token com senha recebidos e salt encontrado e verifica se token salvo é igual
					const salted = salt(password, user_found.salt);
					if (user_found.password != salted.password) throw new Error('Senha incorreta');
					
					// generates webtoken with id e email
					const token = sign({
						id: user_found.get('id'),
						email: user_found.get('email'),
					}, process.env.PRIVATE_KEY);
			
					return {
						token,
						user: user_found,
					};
				});
		},
		authenticate: (_, { token }) => {
			const { id, email } = verify(token, process.env.PRIVATE_KEY);

			return User.findAll({ where: { id, email } })
				.then(([user_found])=>{
					if (!user_found) throw new Error('Usuário não encotrado');

					return user_found;
				})
		},
		removeUserAddress: (_, { id }) => {
			return UserMeta.findByPk(id)
				.then(async (address_found)=>{
					if (!address_found) throw new Error('Endereço não encontrado');

					const removed = await address_found.destroy();

					return { id, ...JSON.parse(removed.meta_value) };
				})
		},
		updateUserAddress: (parent, { id, data }, ctx) => {
			return ctx.user.getMetas({ where: { meta_type: 'address', id } })
				.then(async ([address_found])=>{
					if (!address_found) throw new Error('Endereço não encontrado');
					
					const updated = await address_found.update({ meta_value: JSON.stringify(data) })
					
					return { id, ...JSON.parse(updated.meta_value) };
				});
		},
		createUserAddress: (parent, { data }, ctx) => {
			return ctx.user.createMeta({ meta_type: 'address', meta_value: JSON.stringify(data) })
				.then((meta_address) => {
					return {
						id: meta_address.get('id'),
						...JSON.parse(meta_address.get('meta_value'))
					}
				})
		},
	},
	
	User: {
		metas: (parent) => {
			return parent.getMetas();
		},
		company: (parent) => {
			return parent.getCompany();
		},
		files: (parent) => {
			return parent.getFiles({ where: { deleted: false } });
		},
		settings: (parent) => {
			return parent.getMetas({ where: { key: ['watch', 'bucket']} });
		},
	}
}
import { gql } from 'apollo-server';
import jwt from 'jsonwebtoken';

import User from '../model/user';
import UserMeta from '../model/userMeta';
import conn from '../services/connection';
import gcloud from '../services/gcloud';
import { salt, slugify } from '../utils';


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

		saveSettings(data: [MetaInput!]!): [Meta]!
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
		createUser: (_, { data }) => {
			return conn.transaction(async (transaction) => {
				// create bucket name
				const bucketName = `${slugify(newUser.get('firstName'))}_${slugify(company)}_flaker`;
				const bucket = gcloud.bucket(bucketName);
				
				// check if bucket exists
				const [bucketExists] = await bucket.exists();
				if (bucketExists) throw new Error('Bucket já existe');
				
				// create bucket
				await bucket.create();
				
				// create new user
				const newUser = User.createUser({ ...data, bucket: bucketName }, { include: [UserMeta], transaction });
			})
		},
		updateUser: (_, { id, data }) => {
			return conn.transaction(transaction => {
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
		setUserRole : (_, { id, role }) => {
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
					const token = jwt.sign({
						id: user_found.get('id'),
						email: user_found.get('email'),
					// eslint-disable-next-line no-undef
					}, process.env.PRIVATE_KEY);
			
					return {
						token,
						user: user_found,
					};
				});
		},
		authenticate: (_, { token }) => {
			// eslint-disable-next-line no-undef
			const { id, email } = jwt.verify(token, process.env.PRIVATE_KEY);

			return User.findAll({ where: { id, email } })
				.then(([user_found])=>{
					if (!user_found) throw new Error('Usuário não encotrado');

					return user_found;
				})
		},
		saveSettings: (_, { data }, { user }) => {
			return UserMeta.updateAll(data, user)
				.then(() => {
					return user.getMetas({ where: { key: ['watch', 'bucket', 'lifecycle']} });
				})
		}
	},
	
	User: {
		metas: (parent) => {
			return parent.getMetas();
		},
		company: (parent) => {
			return parent.getCompany();
		},
		files: (parent) => {
			return parent.getFiles({ where: { deleted: false }, order: [['createdAt', 'DESC']]});
		},
		settings: (parent) => {
			return parent.getMetas({ where: { key: ['watch', 'bucket', 'lifecycle']} });
		},
	}
}
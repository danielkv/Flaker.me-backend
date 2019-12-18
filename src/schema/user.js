const conn = require('../services/connection');

module.exports.typeDefs = gql`

	type UserMeta {
		id:ID!
		meta_type:String!
		meta_value:String!
		createdAt:String!
	}

	type User {
		id: ID!
		first_name: String!
		last_name: String!
		email: String!
		role: String!
		active: Boolean!
		createdAt: String!
		updatedAt: String!

		metas: [UserMeta]!	
		company: Company!
	}

	input UserInput {
		first_name: String
		last_name: String
		password: String
		role:S tring
		email: String
		active: Boolean
	}

	input UserMetaInput {
		id:ID
		action:String! #create | update | delete
		meta_type:String
		meta_value:String
	}

	type Login {
		user: User!
		token: String!
	}

	extend type Mutation {
		login (email: String!, password:S tring!): Login!
		authenticate (token: String!): User!
		
		createUser (data: UserInput!): User!
		updateUser (id:ID!, data:UserInput!): User!
		
		setUserRole (id: ID!, role_id: ID!): User!

		removeUserAddress (id: ID!): Address!
		updateUserAddress (id: ID!, data: UserAddressInput!): Address!
		createUserAddress (data: UserAddressInput!): Address!
	}

	extend type Query {
		user(id: ID!): User!
	}

`;

module.exports.resolvers = {
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
			return sequelize.transaction(async transaction => {
				await ctx.company.getUsers({where:{email:data.email}})
					.then((users)=>{
						if (users.length) throw new Error('Já existe um usuário com esse email')
					})

				return Users.create(data, {include:[UsersMeta], transaction})
					.then(async (user_created)=> {
						await ctx.company.addUser(user_created, {through:{...data.assigned_company}, transaction});

						return user_created;
					})
					.then(async (user_created)=> {
						if (data.assigned_branches) {
							await Branches.assignAll(data.assigned_branches, user_created, transaction);
						}
						return user_created;
					})
			});
		},
		updateUser: (_, { id, data }) => {
			return sequelize.transaction(transaction => {
				return User.findByPk(id)
					.then(user=>{
						if (!user) throw new Error('Usuário não encontrada');

						return user.update(data, { fields: ['first_name', 'last_name', 'password', 'role', 'active'], transaction })
					})
					.then(async (user_updated) => {
						if (data.metas) {
							await UsersMeta.updateAll(data.metas, user_updated, transaction);
						}
						return user_updated;
					})
					.then(async (user_updated)=> {
						await ctx.company.addUser(user_updated, {through:{...data.assigned_company}, transaction});

						return user_updated;
					})
					.then(async (user_updated)=> {
						if (data.assigned_branches) {
							await Branches.assignAll(data.assigned_branches, user_updated, transaction);
						}
						return user_updated;
					})
			})
		},
		setUserRole : (_, { id, role_id }, ctx) => {
			return ctx.branch.getUsers({where:{id}})
				.then(async ([user])=>{
					if (!user || !user.branch_relation) throw new Error('Usuário não encontrada');
					const role = await Roles.findByPk(role_id);
					if (!role) throw new Error('Função não encontrada');

					await user.branch_relation.setRole(role);
					
					return user;
				});
		},
		login: (_, { email, password }) => {
			return User.findOne({
				where : {email},
			})
				.then ((user_found)=>{
					//Verifica se encontrou usuário
					if (!user_found) throw new Error('Usuário não encotrado');
			
					//gera token com senha recebidos e salt encontrado e verifica se token salvo é igual
					const salted = salt(password, user_found.salt);
					if (user_found.password != salted.password) throw new Error('Senha incorreta');
					
					//Gera webtoken com id e email
					const token = jwt.sign({
						id: user_found.id,
						email: user_found.email,
					}, process.env.SECRET);
					
					//Retira campos para retornar usuário
					const authorized = user_found.get();
			
					return {
						token,
						user:authorized,
					};
				});
		},
		authenticate: (_, { token }) => {
			const { id, email } = jwt.verify(token, process.env.SECRET);

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

					return {id, ...JSON.parse(removed.meta_value)};
				})
		},
		updateUserAddress: (parent, { id, data }, ctx) => {
			return ctx.user.getMetas({ where: { meta_type: 'address', id } })
				.then(async ([address_found])=>{
					if (!address_found) throw new Error('Endereço não encontrado');
					
					const updated = await address_found.update({ meta_value: JSON.stringify(data) })
					
					return {id, ...JSON.parse(updated.meta_value)};
				});
		},
		createUserAddress: (parent, { data }, ctx) => {
			return ctx.user.createMeta({ meta_type: 'address', meta_value: JSON.stringify(data) })
				.then((meta_address) => {
					console.log(meta_address.get());
					return {
						id: meta_address.get('id'),
						...JSON.parse(meta_address.get('meta_value'))
					}
				})
		},
	},
	User: {
		
	}
}
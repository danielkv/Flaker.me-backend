require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cors = require('cors');
const schema = require('./schema/');
const router = require('./router');
//const mid = require('./middlewares');

//const morgan = require('morgan');

const port = process.env.PORT || 3000;
const app = express();

// inicializa Apollo Server
const server = new ApolloServer({
	schema,
	context : async ({req, connection}) => {
		let ctx = {};

		if (connection) {
			console.log(connection.context)
		} else {
			const {authorization, company_id, branch_id} = req.headers;
			let user = null, company = null, branch = null;
			
			if (authorization) user = await mid.authenticate(authorization);
			if (company_id) company = await mid.selectCompany(company_id, user);
			if (branch_id) branch = await mid.selectBranch(company, user, branch_id);
			
			ctx = {
				user,
				company,
				branch,
				host: req.protocol + '://' + req.get('host')
			}
		}

		return ctx;
	},
});

// setup cors
app.use(cors());
// Rotas
app.use(router);

//configura apollo server
server.applyMiddleware({app, path:'/graphql'});

// Create server
app.listen(port, ()=> {
	console.log(`Server ready at port ${port}${server.graphqlPath}`)
}); 
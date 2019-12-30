import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import authentication from './controller/authentication';
import router from './router';
import schema from './schema/';

dotenv.config();

// eslint-disable-next-line no-undef
const port = process.env.PORT || 4000;
const app = express();

// inicializa Apollo Server
const server = new ApolloServer({
	schema,
	context: authentication
});

// setup cors
app.use(cors());
// Rotas
app.use(router);

//configura apollo server
server.applyMiddleware({ app, path:'/graphql' });

// Create server
app.listen(port, ()=> {
	console.log(`Server ready at port ${port}${server.graphqlPath}`)
});
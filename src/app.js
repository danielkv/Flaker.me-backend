require('dotenv').config();
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const cors = require('cors');
//const mid = require('./middlewares');
const router = require('./router');

//const morgan = require('morgan');

const port = process.env.PORT || 3000;
const app = express();

// setup cors
app.use(cors());

// Rotas
app.use(router);


// Create server
app.listen(port, ()=> {
	console.log(`Porta: ${port}`);
}); 
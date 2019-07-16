require('dotenv').config();
const express = require('express');
const cors = require('cors');
const filesRoutes = require('./routes/filesRoutes');
const userRoutes = require('./routes/usersRoutes');
const Users = require('./controller/usersController');
const Storage = require('./controller/storageController');
const morgan = require('morgan')

const port = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true, parameterLimit:150000, limit:'150mb' }));
app.use(express.json({limit:'150mb'}));

app.use(morgan('tiny'));

//Authentication
app.use('/files', Users.authenticate, Storage.selectBucket);

//Routes
app.use(filesRoutes); // Files
app.use(userRoutes); // Users

// Create server
app.listen(port, ()=> {
	console.log(`Porta: ${port}`);
}); 
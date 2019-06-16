const express = require('express');
const filesRoutes = require('./routes/filesRoutes');
const userRoutes = require('./routes/usersRoutes');
const Users = require('./controller/usersController');
const Storage = require('./controller/storageController');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Authentication
app.use('/files', Users.authenticate, Storage.selectBucket);

//Routes
app.use(filesRoutes); // Files
app.use(userRoutes); // Users

app.listen(process.env.PORT || 3000); // Create server
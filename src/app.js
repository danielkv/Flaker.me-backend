const express = require('express');
const filesRoutes = require('./routes/filesRoutes');
const userRoutes = require('./routes/usersRoutes');
const Users = require('./controllers/users');
const gcloud = require('./controllers/gcloud');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Authentication
app.use('/files', Users.authenticate, gcloud.selectBucket);

//Routes
app.use(filesRoutes); // Files
app.use(userRoutes); // Users

app.listen(process.env.PORT || 3000); // Create server
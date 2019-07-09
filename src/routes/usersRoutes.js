const routes = require('express').Router();
const Users = require('../controller/usersController');
const Settings = require('../controller/settingsController');

routes.post('/users', Users.create);
/* routes.put('/users', async (req, res) => {
	let result = await Users.update(req.query);
	res.send(result);
}); */
routes.post('/authorize', Users.authorize);
routes.post('/authenticate', Users.authenticate_endpoint);

routes.get('/user/settings', Users.authenticate, Settings.load);
routes.put('/user/settings', Users.authenticate, Settings.update);

module.exports = routes;
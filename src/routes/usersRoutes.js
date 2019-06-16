const routes = require('express').Router();
const Users = require('../controller/usersController');

routes.post('/users', Users.create);
routes.put('/users', async (req, res)=>{
	let result = await Users.update(req.query);
	res.send(result);
});
routes.post('/authorize', async (req, res)=>{
	try {
		let {email, password} = req.query;
		let result = await Users.authorize(email, password);
		res.send(result);
	} catch (e) {
		res.status(403).send(e);
	}
});

module.exports = routes;
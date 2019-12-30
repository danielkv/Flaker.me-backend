const routes = require('express').Router();

function log(req, res, next) {
	const {log, user, status} = req.body;
	req.logToFile = log;
	req.bucket = {name:user.bucket};
	req.user = user;

	res.status(status).send({
		log : req.log
	});
}

routes.put('/log', log);

module.exports = routes;
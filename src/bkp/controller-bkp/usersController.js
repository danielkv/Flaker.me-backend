const Users = require('../model/users');
const Storage = require('../model/storage');

function create(req, res) {
	const user = Object.keys(req.body).length ? req.body : req.query;

	Users.exists(user)
	.then(Storage.createBucket)
	.then(Users.add)
	
	// return to front
	.then((inserted)=>{
		res.send(inserted) 
	})
	.catch((e)=> {
		console.log(e);
		res.status(403).send(e);
	});
}

async function authorize(req, res, next) {
	try {
		const {email, password} = Object.keys(req.body).length ? req.body : req.query;
		if (!email || !password) throw {code:'no_data', message:'Não foi enviado nenhuma informação para autenticação'};

		const authorization = await Users.authorize(email, password);

		return res.send(authorization);

	} catch (e) {
		return res.status(403).send(e);
	}
}

async function authenticate(req, res, next) {
	try {
		const token = req.headers['authorization'];
		if (!token) throw {code:'no_token', message:'Não foi enviado nenhum token'};

		const user = await Users.authenticate(token);
		req.user = user;
		
		next();

	} catch (e) {
		return res.status(403).send(e);
	}
}

async function authenticate_endpoint (req, res, next) {
	try {
		const token = req.headers['authorization'];
		if (!token) throw {code:'no_token', message:'Não foi enviado nenhuma token'};

		const user = await Users.authenticate(token);
		
		res.send(user);

	} catch (e) {
		return res.status(403).send(e);
	}
}

function update (req, res, next) {
	const data = req.query;

	Users.update(data)
	.then((result)=>{
		res.send(result);
	});
}

module.exports = {
	authenticate_endpoint,
	authenticate,
	authorize,
	update,

	create,	
}
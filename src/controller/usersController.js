const Users = require('../model/users');
const Storage = require('../model/storage');
const jwt = require('../model/jwt');

async function create(req, res, next) {
	const user = req.query;

	const inserted = await Users.exists(user)
	.then(Storage.createBucket)
	.then(Users.add)
	.catch((e)=> {
		res.status(403).send(e);
	});

	return res.send(inserted);
}

async function authorize(req, res, next) {

	const {email, password} = req.query;
	
	if (!email || !password) return res.status(403).send({code:'no_data', message:'Não foi enviado nenhuma informação para autenticação'});

	let user_exists = await get({email : email}, ['salt']);
	if (user_exists.length != 1) return res.status(403).send({code: 'user_not_found', message:`Usuário não encontrado`});
	user_exists = user_exists[0];

	let salted = salt(password, user_exists.salt);

	const user = await get({email : email, password:salted.password});
	if (user.length != 1) return res.status(403).send({code: 'password_incorrect', message:`Senha incorreta`});
	user = user[0];
	
	const token = await jwt.sign({
		id:user.id,
		email:user.email,
	});

	return res.send({
		token,
		...user,
	});
}

async function authenticate(req, res, next) {
	try {
		let token = req.headers['authorization'];
		if (!token) throw {code:'no_token', message:'Não foi enviado nenhuma token'};

		let user = await jwt.verify(token);
		if (!user.id || !user.email) throw {code:'incorrect_token', message:'Não possível autenticar o token'};

		let user_exists = await get({id: user.id, email : user.email});
		if (user_exists.length != 1) throw {code: 'user_not_found', message:`Usuário não encontrado`};

		req.user = user_exists[0];

		next();

	} catch (e) {
		return res.status(403).send(e);
	}
}

module.exports = {
	authenticate,
	authorize,

	create,	
}
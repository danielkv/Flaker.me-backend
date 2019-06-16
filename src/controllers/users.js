const crypto = require('crypto');
const {conn, mysql, formatFilter} = require('./connection');
const jwt = require('./jwt');

function salt(password, salt) {
	let _salt = salt || crypto.randomBytes(16).toString('hex');
	var hash = crypto.createHmac('sha512', _salt);
	hash.update(password);
	let _password = hash.digest('hex');
	return {
		password:_password,
		salt,
	}
}

async function add (req, res, next) {
	try {
		let {query:user} = req;

		let user_exists = await get({email : user.email});
		if (user_exists.length) throw {code: 'email_exists', message:`Esse email (${user.email}) já foi cadastrado no banco de dados`};

		let salted = salt(user.password);
	
		let inserts = [user.name, user.limit, user.email, salted.password, salted.salt];
		let sql = 'INSERT INTO users (`name`, `limit`, `email`, `password`, `salt`) VALUES (?, ?, ?, ?, ?)';
		sql = mysql.format(sql, inserts);

		conn.query(sql, async (error, results) => {
			if (error) throw error;
			let inserted = await get({id : results.insertId});
			return res.send(inserted[0]);
		});

	} catch (e) {
		return res.status(403).send(e);
	}
}

async function get (filter, fields) {
	return new Promise((resolve, reject) => {
		try {
			let _fields = ['id', 'name', 'email', 'limit', 'created', 'bucket', 'active'];
			if (fields) _fields = [..._fields, fields];
			_fields = '\`' + _fields.join('\`, \`') + '\`';
			let sql = 'SELECT '+_fields+' FROM users';

			if (filter) sql += ` WHERE ${formatFilter(filter)}`;

			conn.query(sql, (error, results, fields) => {
				if (error) throw new Error(error);
				return resolve(results);
			});
		} catch (e) {
			return reject(e);
		}
	});
}

async function update(user) {
	return new Promise(async (resolve, reject) => {
		try {
			
			if (!user.id) throw {code:'id_not_set', message:'O id do usuário não foi definido'};

			let user_exists = await get({email : user.email, id:{value:user.id, compare:'!='}});
			if (user_exists.length) throw {code: 'email_exists', message:`Esse email (${user.email}) já foi cadastrado no banco de dados`};

			let inserts = ['name', user.name, 'limit', user.limit, 'email', user.email, 'active', user.active, 'id', user.id];
			let sql = 'UPDATE users SET ?? = ?, ?? = ?, ?? = ?, ?? = ? WHERE ?? = ?';
			sql = mysql.format(sql, inserts);

			conn.query(sql, (error, results, fields) => {
				if (error) throw new Error(error);
				return resolve(results);
			});
		} catch (e) {
			return reject(e);
		}
	});
}


async function authorize(email, password) {
	return new Promise(async (resolve, reject) => {
		try {
			if (!email || !password) throw {code:'no_data', message:'Não foi enviado nenhuma informação para autenticação'};

			let user_exists = await get({email : email}, ['salt']);
			if (user_exists.length != 1) throw {code: 'user_not_found', message:`Usuário não encontrado`};
			user_exists = user_exists[0];

			let salted = salt(password, user_exists.salt);

			let user = await get({email : email, password:salted.password});
			if (user.length != 1) throw {code: 'password_incorrect', message:`Senha incorreta`};
			user = user[0];
			
			let token = await jwt.sign({
				id:user.id,
				email:user.email,
			});

			return resolve({
				token,
				id : user.id,
				email : user.email,
			});

		} catch (e) {
			return reject(e);
		}
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
	add,
	get,
	update,
	authorize,
	authenticate,
}
const crypto = require('crypto');
const jwt = require('./jwt');
const {conn, mysql, formatFilter} = require('./connection');

function salt(password, salt=null) {
	const _salt = salt || crypto.randomBytes(16).toString('hex');
	var hash = crypto.createHmac('sha512', _salt);
	hash.update(password);
	let _password = hash.digest('hex');
	return {
		password:_password,
		salt:_salt,
	}
}

async function exists (user) {
	const user_exists = await get({email : user.email});
	if (user_exists.length) throw {code: 'user_exists', message:`Esse email (${user.email}) já foi cadastrado no banco de dados`};
	return user;
}

async function add (user) {
	return new Promise((resolve, reject) => {
		const salted = salt(user.password);
	
		const inserts = [user.name, user.limit, user.email, user.bucket.name, salted.password, salted.salt];
		let sql = 'INSERT INTO users (`name`, `limit`, `email`, `bucket`, `password`, `salt`) VALUES (?, ?, ?, ?, ?, ?)';
		sql = mysql.format(sql, inserts);

		conn.query(sql, async (error, results) => {
			if (error) return reject(error);
			let inserted = await get({id : results.insertId});
			return resolve(inserted[0]);
		});
	});
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
			if (!user.id) throw new Error('Usuário não selecionado');
			let inserts=[], sets='', sql, value;

			Object.keys(user).forEach((key)=>{
				if (key != 'id')
				if (key == 'password') {
					value = salt(user[key]);
					inserts = [...inserts, 'password', value.password, 'salt', value.salt];
					sets = (sets) ? ', ?? = ?, ?? = ?' : '?? = ?, ?? = ?';
				} else {
					value = user[key];
					inserts = [...inserts, key, value];
					sets = (sets) ? ', ?? = ?' : '?? = ?';
				}
			});

			sql = 'UPDATE users SET '+sets+' WHERE `id` = '+user.id;
			
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

async function authorize (email, password) {
	let user_exists = await get({email : email}, ['salt']);
	if (user_exists.length != 1) throw {code: 'user_not_found', message:`Usuário não encontrado`};

	user_exists = user_exists[0];
	if (user_exists.active != true) throw {code: 'inactive_user', message:'Usuário inativo'};

	const salted = salt(password, user_exists.salt);

	let user = await get({email : email, password:salted.password});
	if (user.length != 1) throw {code: 'password_incorrect', message:`Senha incorreta`};
	user = user[0];
	
	const token = await jwt.sign({
		id:user.id,
		email:user.email,
	});

	return {
		token,
		...user,
	};
}

async function authenticate (token) {

	let user = await jwt.verify(token);
	if (!user.id || !user.email) throw {code:'incorrect_token', message:'Não foi possível autenticar o token'};

	let user_exists = await get({id: user.id, email : user.email});
	if (user_exists.length != 1) throw {code: 'user_not_found', message:`Usuário não encontrado`};

	user_exists = user_exists[0];
	if (user_exists.active != true) throw {code: 'inactive_user', message:'Usuário inativo'};

	return user_exists;
}

module.exports = {
	add,
	get,
	update,
	exists,

	authenticate,
	authorize
}
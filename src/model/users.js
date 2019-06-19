const crypto = require('crypto');
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
		let sql = 'INSERT INTO users (`name`, `limit`, `email`, `bucket`, `password`, `salt`, `private`) VALUES (?, ?, ?, ?, ?, ?)';
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

module.exports = {
	add,
	get,
	update,
	exists,
}
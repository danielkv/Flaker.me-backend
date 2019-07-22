const {conn, mysql, formatFilter} = require('./connection');

function getDefaults() {
	return {
		watch : {
			path : null
		},
		lifecycle : {
			action : 'delete',
			condition : {
				age : 15,
			}
		},

	}
}

async function add(user, settings) {
	return new Promise((resolve, reject) => {
		const user_id = user.id || user;
		const _settings = settings;
		const settings_save = JSON.stringify(_settings);
		
		let sql = 'INSERT INTO users_settings (`user_id`, `settings`) VALUES (?, ?)';
		sql = mysql.format(sql, [user_id, settings_save]);

		conn.query(sql, async (error, results) => {
			if (error) return reject(error);
			return resolve(_settings);
		});
	});
}

async function get(user, filter={}) {
	return new Promise((resolve, reject) => {
		const user_id = user.id || user;

		let sql = 'SELECT * FROM users_settings';

		filter = {...filter, user_id:user_id};
		if (filter) sql += ` WHERE ${formatFilter(filter)}`;

		conn.query(sql, (error, results) => {
			if (error) return reject(error);
			let settings = results.length == 1 ? JSON.parse(results[0].settings) : {};

			return resolve(settings);
		});
	});
}

async function update(user, _settings) {
	return new Promise((resolve, reject) => {
		if (!_settings) return reject({code:'no_settigs', message:'Nenhuma configuração para salvar'});
		const user_id = user.id || user;
		const new_settings = _settings;

		let sql = 'UPDATE users_settings SET `settings` = ?';
		sql = mysql.format(sql, [JSON.stringify(new_settings)]);

		let filter = {user_id:user_id};
		if (filter) sql += ` WHERE ${formatFilter(filter)}`;

		conn.query(sql, (error, results) => {
			if (error) return reject(error);

			return resolve(new_settings);
		});
	});
}

function sanitize(settings) {
	let _settings = {};
	Object.entries(settings).forEach(([key, value])=>{
		if (sanitize_functions[key])
			return _settings[key] = sanitize_functions[key](value);
		
		_settings[key] = value;
	});
	
	return _settings;
}

const sanitize_functions = {
	lifecycle: function (value) {
		if (value.action && value.condition && value.condition.age)
			return value;
		return {
			action : 'delete',
			condition : {
				age : value,
			}
		}
	},
	watch : function (value) {
		return {
			path : value
		}
	}
}

module.exports = {
	add,
	get,
	update,
	getDefaults,
	sanitize
}
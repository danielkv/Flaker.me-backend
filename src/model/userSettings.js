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

async function add(user) {
	return new Promise((resolve, reject) => {

		const _settings = getDefaults();
		const user_id = user.id || user;

		if (sql_values === '') return reject({code:'no_settings_to_add', message:'Não foi possível salvar configurações'});
		
		let sql = 'INSERT INTO users_settings (`user_id`, `settings`) VALUES (?, ?)';
		sql = mysql.format(sql, [user_id, JSON.stringify(_settings)]);

		conn.query(sql, async (error, results) => {
			if (error) return reject(error);
			user.settings = _settings;
			return resolve(user);
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
			let settings = getDefaults();

			if (results.length == 1) {
				settings = {...settings, ...JSON.parse(results[0])};
			}

			return resolve(user.id ? {...user, settings} : settings);
		});
	});
}

async function update(user, _settings) {
	return new Promise((resolve, reject) => {
		const user_id = user.id || user;
		const new_settings = {...getDefaults(), ..._settings};

		let sql = 'UPDATE users_settings SET `settings` = ?';
		sql = mysql.format(sql, [JSON.stringify(sanitize(new_settings))]);

		let filter = {...filter, user_id:user_id};
		if (filter) sql += ` WHERE ${formatFilter(filter)}`;

		conn.query(sql, (error, results) => {
			if (error) return reject(error);

			return resolve(user.id ? {...user, settings:new_settings} : new_settings);
		});
	});
}

function sanitize(settings) {
	return Object.entries(settings).map(([key, value])=>{
		if (sanitize_functions[key])
			return sanitize_functions[key](value);
		
		return value;
	});
}

const sanitize_functions = {
	lifecycle: function (value) {
		return {
			action : 'delete',
			condition : {
				age : value,
			}
		}
	}
}

module.exports = {
	add,
	get,
	update,
	getDefaults,
}
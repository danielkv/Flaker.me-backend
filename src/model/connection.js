const mysql = require('mysql');

const connection_settings = {
	connectionLimit 	: 10,
	user     			: process.env.MYSQL_USER,
	host				: process.env.MYSQL_HOST,
	password 			: process.env.MYSQL_PASSWORD,
	database 			: process.env.MYSQL_DB,
}

//if (process.env.MYSQL_DSN) connection_settings.socketPath = `/cloudsql/${process.env.MYSQL_DSN}`;

const connection = mysql.createPool(connection_settings);

connection.on('release', (conn)=> {
	conn.destroy();
})

function formatFilter (filter) {
	let formatted = '';
	let filtered = Object.entries(filter).map(([key, value]) => {
		let field = {
			key : value.key || key,
			value : value.value || value,
			compare : value.compare || '=',
		};
		return field;
	});
	
	Object.entries(filtered).forEach(([key, field]) => {
		if (formatted) formatted += ' AND';
		formatted += ` \`${field.key}\` ${field.compare} '${field.value}'`;
	})

	return formatted;
}

//connection.connect();

module.exports = {
	conn : connection,
	formatFilter,
	mysql,
}
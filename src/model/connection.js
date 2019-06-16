const mysql = require('mysql');

const connection = mysql.createPool({
	connectionLimit 	: 10,
	host		    	: '35.199.99.140',
	user     			: 'user_system',
	password 			: 'p42e7WNVdnfVcS5',
	database 			: 'BackupSystem',
});

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
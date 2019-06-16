const {conn, formatFilter} = require('./connection');

async function get(filter) {
	return new Promise((resolve, reject) => {
		try {
			let sql = 'SELECT * FROM files';

			if (filter) sql += ` WHERE ${formatFilter(filter)}`;
			
			conn.query(sql, (err, res) => {
				if (err) throw new Error(err);
				return resolve(res);
			})
		} catch (e) {
			return reject(e);
		}
	});
}

function add(req, res) {
	try {
		let {uploaded:file, user} = req;
		let sql = `INSERT INTO files (name, originalname, user_id, size, url, hash) VALUES ('${file.name}', '${file.originalname}', '${user.id}', '${file.size}', '${file.url}', '${file.hash}')`;
		
		conn.query(sql, async (err, results) => {
			if (err) throw new Error(err);

			let inserted_row = await get({id:results.insertId});

			return res.send(inserted_row[0]);
		})
	} catch (e) {
		return res.status(403).send(e);
	}
}

module.exports = {
	get,
	add,
}
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

async function add(file) {
	return new Promise((resolve, reject) => {
		const sql = `INSERT INTO files (name, originalname, user_id, size, url, hash) VALUES ('${file.name}', '${file.originalname}', '${file.user_id}', '${file.size}', '${file.url}', '${file.metadata.md5Hash}')`;
		
		conn.query(sql, async (err, results) => {
			if (err) return reject(err);

			let inserted_row = await get({id:results.insertId});

			return resolve(inserted_row[0]);
		})
	});
}

async function getSize(bucket) {
	const [files] = await bucket.getFiles();
	let total = 0;

	files.forEach((file) => {
		total += file.metadata.size;
	});

	return total;
}

module.exports = {
	get,
	add,
	getSize,
}
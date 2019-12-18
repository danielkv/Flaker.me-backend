const jwt = require('jsonwebtoken');

async function sign (data) {
	return new Promise( (resolve, reject) => {
		try {
			jwt.sign(data, process.env.PRIVATE_KEY, { algorithm: 'HS256' }, (err, token)=> {
				if (err) throw err;
				return resolve(token);
			});
		} catch (e) {
			return reject(e);
		}
	});
}

function verify(token) {
	return new Promise( (resolve, reject) => {
		try {
			jwt.verify(token, process.env.PRIVATE_KEY, (err, decoded)=> {
				if (err) throw err;
				return resolve(decoded);
			});
		} catch (e) {
			return reject(e);
		}
	});
}

module.exports = {
	sign,
	verify,
}
const Files = require('../model/files');

async function create(req, res) {
	const file = {
		...req.file,
		user_id : user.id,
	}
	
	const inserted = fileFiles.add(file).catch((e)=>{
		return res.status(403).send(e);
	});

	return res.send(inserted);
}

module.exports = {
	create,
}
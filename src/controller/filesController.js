const Files = require('../model/files');

async function create(req, res) {
	const file = {
		...req.file,
		user_id : user.id,
	}
	
	const inserted = Files.add(file).catch((e)=>{
		return res.status(403).send(e);
	});

	return res.send(inserted);
}

function read (req, res, next) {
	Files.get()
	.then((files) => {
		return res.send(files);
	})
	.catch((e) => {
		return res.status(403).send(e);
	});
}

module.exports = {
	create,
	read,
}
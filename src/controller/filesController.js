const Files = require('../model/files');

async function create(req, res) {
	const {user} = req;
	const file = {
		...req.uploaded,
		user_id : user.id,
	}
	
	Files.add(file)
	.then((inserted) =>{
		return res.json(inserted);
	})
	.catch((e)=>{
		return res.status(403).send(e);
	});
}

function read (req, res, next) {
	const {user} = req;
	Files.get({user_id:user.id})
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
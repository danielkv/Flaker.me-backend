const Files = require('../model/files');
const {format} = require('util');

async function create(req, res) {
	const {user, bucket} = req;
	const {name, originalname, timeCreated, size, hash} = Object.keys(req.body).length ? req.body : req.query;
	
	const file = {
		name,
		originalname,
		size,
		url : format(`https://storage.googleapis.com/${bucket.name}/${name}`),
		hash,
		
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
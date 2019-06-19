const {format} = require('util');
const crypto = require('crypto');
const Storage = require('../model/storage');

function selectBucket(req, res, next) {
	
	let {user} = req;
	const bucket = Storage.instance.bucket(user.bucket);
	
	bucket.exists((err, exists)=>{
		if (err) return res.status(403).send(err);
		if (!exists) return res.status(403).send({code:'bucket_not_found', message:'Pasta do usuário não encontrada'});

		req.bucket = bucket;
		next();
	});
}

async function verifyLimit (req, res, next) {
	const {bucket, user} = req;

	const size = await Files.getSize(bucket).catch((e)=>{
		return res.status(403).send(e);
	});

	if ((user.limit !== 0) && ((size / 1024 / 1024 / 1024) >= user.limit))
		return res.status(403).send({code:'limit exceeded', message:'O limite de armazenamento foi atingido.'});
		
	next();
}

function upload (req, res, next) {
	try {
		let {file, bucket} = req;
		const random = crypto.randomBytes(16).toString('hex');
		const _file = bucket.file(`${random}-${file.originalname}`);
		const blobStream = _file.createWriteStream();
		
		blobStream.on('error', (err) => {
			throw err;
		});

		blobStream.on('finish', () => {
			// The public URL can be used to directly access the file via HTTP.
			//const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);

			req.uploaded = {
				name : _file.name,
				originalname : file.originalname,
				size : file.size,
				url : format(`https://storage.googleapis.com/${bucket.name}/${_file.name}`),
				metadata : _file.metadata,
			};
			
			next();
		});
		
		blobStream.end(file.buffer);
	} catch (e) {
		return res.status(403).send(e);
	}
}

module.exports = {
	upload, 
	selectBucket,
	verifyLimit,
}
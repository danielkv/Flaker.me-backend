const {Storage} = require('@google-cloud/storage');
const {format} = require('util');
const crypto = require('crypto');

const storage = new Storage({
	projectId: 'backupsystem',
	keyFilename: './credentials.json',
});

function selectBucket(req, res, next) {
	try {
		let {user} = req;
		const bucket = storage.bucket(user.bucket);
		bucket.exists((err, exists)=>{
			if (err) throw err;
			if (!exists) throw {code:'bucket_not_found', message:'Pasta do usuário não encontrada'};

			req.bucket = bucket;
			console.log(exists);
			next();
		});
	} catch (e) {
		return res.status(403).send(e);
	}
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
				hash : 'null',
			};
			
			next();
		});
		
		blobStream.end(file.buffer);
	} catch (e) {
		return res.status(403).send(e);
	}
}

function _delete () {

}

module.exports = {
	upload,
	delete:_delete,

	selectBucket,
}
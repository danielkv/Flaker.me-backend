const crypto = require('crypto');
const Storage = require('../model/storage');
const Files = require('../model/files');

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
	const filesize = parseInt(req.headers['filesize']);

	const size = await Files.getSize(bucket).catch((e)=>{
		return res.status(403).send(e);
	});

	const finalSize = size + filesize; //actual size + file to upload size

	if ((user.limit !== 0) && (finalSize / 1024 / 1024 / 1024) >= user.limit) // file size in GB
		return res.status(403).send({code:'limit exceeded', message:'O limite de armazenamento foi atingido.'});

	next();
}

async function download (req, res) {
	const {bucket} = req;
	const file = JSON.parse(req.query.file);

	const fileDownload = bucket.file(file.name);

	fileDownload.exists((err, exists)=>{
		if (err) return res.status(403).send(err);
		fileDownload.createReadStream().pipe(res);
	});
}

function listFiles (req, res) {
	const {bucket, user} = req;

	bucket.getFiles()
	.then((files)=> {
		return res.send(files[0]);
	})
	.catch((e)=>{
		return res.status(403).send(e);
	});
}

function createResumableUpload(req, res) {
	const {bucket} = req;
	const {originalname} = req.body.length ? req.body : req.query;

	const random = crypto.randomBytes(16).toString('hex');
	
	const _file = bucket.file(`${random}-${originalname}`);

	_file.createResumableUpload((err, uri)=>{
		if (err) res.status(403).send(err);

		res.send({
			uri,
			file : _file
		});
	});
}

module.exports = {
	selectBucket,
	verifyLimit,
	listFiles,
	download,
	createResumableUpload
}
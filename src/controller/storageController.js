const crypto = require('crypto');
const Storage = require('../model/storage');
const Files = require('../model/files');
const {slugify} = require('../utils');

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
	const {size:filesize} = Object.keys(req.body).length ? req.body : req.query;

	const size = await Files.getSize(bucket).catch((e)=>{
		return res.status(403).send(e);
	});

	const finalSize = size + parseInt(filesize); //actual size + file to upload size
	const userLimit = user.limit * 1024 * 1024 * 1024; // file size in bytes

	if (user.limit !== 0 && finalSize >=  userLimit) {
		req.logToFile = 'O limite de armazenamento foi atingido';
		return res.status(403).send({code:'limit_exceeded', message:'O limite de armazenamento foi atingido.'});
	}

	next();
}

async function download (req, res) {
	const {bucket} = req;
	const file = JSON.parse(req.query.file);

	const fileDownload = bucket.file(file.name);

	fileDownload.exists((err, exists)=>{
		if (err) return res.status(403).send(err);
		if (!exists) return res.status(403).send({code:'file_not_found', message:'O arquivo não foi encontrado no servidor.'});
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
	const {originalname} = Object.keys(req.body).length ? req.body : req.query;

	const random = crypto.randomBytes(16).toString('hex');
	const slug_name = slugify(originalname);
	
	const _file = bucket.file(`${random}-${slug_name}`);

	_file.createResumableUpload((err, uri)=>{
		if (err) res.status(403).send(err);

		const r = {
			uri,
			file : _file
		}

		res.send(r);
	});
}

module.exports = {
	selectBucket,
	verifyLimit,
	listFiles,
	download,
	createResumableUpload
}
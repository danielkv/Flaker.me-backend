const routes = require('express').Router();
const Files = require('../controllers/files');
const multer = require('multer');
const multerConfig = require('../config/multer');
const gcloud = require('../controllers/gcloud');

routes.get('/files', async function (req, res, next) {
	try {
		let _files = await Files.get();
		res.status(200).send(_files);
	} catch (e) {
		res.status(403).send(e);
	}
});

routes.post('/files', multer(multerConfig).single('file'), gcloud.upload, Files.add);

module.exports = routes;
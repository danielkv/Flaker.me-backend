const routes = require('express').Router();
const multer = require('multer');
const multerConfig = require('../config/multer');
const Files = require('../controller/filesController');
const Storage = require('../controller/storageController');

routes.get('/files', async function (req, res, next) {
	try {
		let _files = await Files.get();
		res.status(200).send(_files);
	} catch (e) {
		res.status(403).send(e);
	}
});

routes.post('/files', Storage.verifyLimit, multer(multerConfig).single('file'), Storage.upload, Files.create);

//routes.get('/files/list', Storage.verifyLimit);

module.exports = routes;
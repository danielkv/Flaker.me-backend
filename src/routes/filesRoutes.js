const routes = require('express').Router();
const Files = require('../controller/filesController');
const Storage = require('../controller/storageController');

routes.get('/files', Files.read);
routes.get('/files/list', Storage.listFiles);
routes.get('/files/download', Storage.download);
routes.post('/files', Storage.verifyLimit, Files.create);

routes.get('/files/resumable', Storage.verifyLimit, Storage.createResumableUpload);

module.exports = routes;
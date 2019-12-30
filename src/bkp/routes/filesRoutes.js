import { Router } from 'express';

import { read, create } from '../controller/filesController';
import { listFiles, download, verifyLimit, createResumableUpload } from '../controller/storageController';

const routes = Router();

routes.get('/files', read);
routes.get('/files/list', listFiles);
routes.get('/files/download', download);
routes.post('/files', verifyLimit, create);

routes.get('/files/resumable', verifyLimit, createResumableUpload);

export default routes;
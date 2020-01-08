import { Storage } from '@google-cloud/storage';
import { join } from 'path';

export default new Storage({
	// eslint-disable-next-line no-undef
	keyFilename: join(__dirname, '../', '../', 'BackupSystem-a755b54e85e3.json'),
	projectId: 'backupsystem',
});
const {Storage} = require('@google-cloud/storage');

const myUtils = require('../utils');

const storage = new Storage({
	projectId: 'backupsystem',
	keyFilename: './credentials.json',
});

async function createBucket(user) {
	return new Promise((resolve, reject)=>{
		const slug_name = myUtils.slugify(user.bucket_name || user.name);
		const bucket = storage.bucket(slug_name);
		bucket.create((err, bucket) => {
			if (err) return reject(err);
			user.bucket = slug_name;
			return resolve(user);
		});
	})
}



function _delete () {

}

module.exports = {
	delete:_delete,

	instance:storage,
	createBucket,
}
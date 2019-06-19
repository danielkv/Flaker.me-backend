const {Storage} = require('@google-cloud/storage');

const myUtils = require('../utils');
const UserSettings = require('./userSettings');

const storage = new Storage({
	projectId: 'backupsystem',
	keyFilename: './credentials.json',
});

async function createBucket(user) {
	//return new Promise((resolve, reject)=>{
		const slug_name = myUtils.slugify(user.bucket_name || user.name);
		const bucket = storage.bucket(slug_name);

		await bucket.create({nearline:true});
		user.bucket = bucket;
		return user;
	//})
}

async function addLifecycleRule(user, _rule={}) {
	const bucket = user.bucket || user;
	const rule = {
		...UserSettings.getDefaults().lifecycle,
		..._rule,
	}
	await bucket.addLifecycleRule(rule, {append:false});

	return user;
}


module.exports = {
	instance:storage,
	createBucket,
	addLifecycleRule,
}
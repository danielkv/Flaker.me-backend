import gcloud from '../services/gcloud';

export async function updateLifecycle(user, days) {
	// get bucket
	const bucketName = user.get('bucket');
	const bucket = gcloud.bucket(bucketName);

	// check if bucket exists
	const [bucketExists] = await bucket.exists();
	if (!bucketExists) throw new Error('Bucket não existe');

	// define rule
	const rule = !days ? {} : {
		action: 'delete',
		condition: {
			age: days
		}
	}

	// set rule on bucket
	await bucket.addLifecycleRule(rule, { append:false })
}
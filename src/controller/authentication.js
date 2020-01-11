import { AuthenticationError } from 'apollo-server';
import jwt from 'jsonwebtoken';

import User from '../model/user';
import gcloud from '../services/gcloud';


export default async ({ req, connection }) => {
	// if subscription
	if (connection) return;

	// continue when normal headers
	const { authorization, company_id } = req.headers;
	let user = null, company = null, bucket = null;
	
	// check authorization token
	if (authorization) {
		const authSplit = authorization.split(' ');
		const authType = authSplit[0];
		const token = authSplit[1];
		
		if (authType !== 'Bearer') throw new AuthenticationError('Autorização desconhecida');

		// eslint-disable-next-line no-undef
		const { id, email } = jwt.verify(token, process.env.PRIVATE_KEY);

		user = await User.findByPk(id)
			.then((user_found) => {
				return user_found.get('email') === email ? user_found : null;
			});
	}

	// check company
	if (user && company_id) {
		company = await user.getCompany({ where: { id: company_id } });
		if (!company) throw new AuthenticationError('Empresa não encontrada');
	}

	// include bucket in ctx
	if (user && company) {
		const bucketName = user.get('bucket');
		bucket = gcloud.bucket(bucketName);

		const [bucketExists] = await bucket.exists();

		if (!bucketExists) throw new AuthenticationError('Bucket não encontrado');
	}
	
	return {
		user,
		company,
		bucket,
	}
}
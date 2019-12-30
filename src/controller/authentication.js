import { AuthenticationError } from 'apollo-server';
import { verify } from 'jsonwebtoken';

import { User } from '../model';

export default async ({ req, connection }) => {
	// if subscription
	if (connection) return {};

	// continue when normal headers
	const { authorization, company_id } = req.headers;
	let user = null, company = null;
	
	// check authorization token
	if (authorization) {
		const [authType, token] = authorization.split(' ');
		if (authType !== 'Bearer') throw new AuthenticationError('Autorização desconhecida');

		// eslint-disable-next-line no-undef
		const { id, email } = verify(token, process.env.PRIVATE_KEY);

		user = await User.findAll({ where: { id, email } });
	}

	// check company
	if (user && company_id) {
		company = user.getCompany({ where: { id: company_id } });
	}
	
	return {
		user,
		company,
	}
}
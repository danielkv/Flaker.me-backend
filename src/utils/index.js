import { randomBytes, createHmac } from 'crypto';

/*
 * Cria o salt para ser adicionado/verificar senha do usuário
 *
 */
export function salt(password, salt=null) {
	const _salt = salt || randomBytes(16).toString('hex');
	var hash = createHmac('sha512', _salt);
	hash.update(password);
	let _password = hash.digest('hex');
	return {
		password:_password,
		salt:_salt,
	}
}

/*
 * Retira todos acentos, converte espaços em hífens e
 * transforma texto em minúsculo
 * 
 */
export function slugify(text) {
	let newText = text.trim().toLowerCase();

	newText = newText.replace(new RegExp('[ÁÀÂÃ][áàâã]','gi'), 'a');
	newText = newText.replace(new RegExp('[ÉÈÊ][éèê]','gi'), 'e');
	newText = newText.replace(new RegExp('[ÍÌÎ][íìî]','gi'), 'i');
	newText = newText.replace(new RegExp('[ÓÒÔÕ][óòôõ]','gi'), 'o');
	newText = newText.replace(new RegExp('[ÚÙÛ][úùû]','gi'), 'u');
	newText = newText.replace(new RegExp('[Ç][ç]','gi'), 'c');
	newText = newText.replace(new RegExp('[\(\)]', 'g'), '');
	
	newText = newText.replace(new RegExp(' - | ', 'g'), '-');
	return newText;
}
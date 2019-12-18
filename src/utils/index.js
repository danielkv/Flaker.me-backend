const crypto = require('crypto');

/*
 * Cria o salt para ser adicionado/verificar senha do usuário
 *
 */
function salt(password, salt=null) {
	const _salt = salt || crypto.randomBytes(16).toString('hex');
	var hash = crypto.createHmac('sha512', _salt);
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
function slugify(text) {
	text = text.trim().toLowerCase();

    text = text.replace(new RegExp('[ÁÀÂÃ][áàâã]','gi'), 'a');
    text = text.replace(new RegExp('[ÉÈÊ][éèê]','gi'), 'e');
    text = text.replace(new RegExp('[ÍÌÎ][íìî]','gi'), 'i');
    text = text.replace(new RegExp('[ÓÒÔÕ][óòôõ]','gi'), 'o');
    text = text.replace(new RegExp('[ÚÙÛ][úùû]','gi'), 'u');
	text = text.replace(new RegExp('[Ç][ç]','gi'), 'c');
	text = text.replace(new RegExp('[\(\)]', 'g'), '');
	
	text = text.replace(new RegExp(' - | ', 'g'), '-');
    return text;                 
}

module.exports = {
	slugify,
	salt,
}
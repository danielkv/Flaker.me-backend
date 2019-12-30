import Sequelize from 'sequelize';

import conn from '../services/connection';
import { salt } from '../utils';

/*
 * Define modelo (tabela) de usuários
 */

class User extends Sequelize.Model {

	/**
	 * Verifica as permissões de um usuário
	 */
	can(perms, options={}) {
		if (!Array.isArray(perms)) perms = [perms];
		if (!this.permissions) throw new Error('As permissões não foram definidas');
		
		const every = options.every || true;
		const scope = options.scope || 'master';
		const user_permissions = this.permissions;

		if (user_permissions.includes('master')) return true;
		if (scope && user_permissions.includes(scope)) return true;
		
		if (every) {
			if (perms.every(r => user_permissions.includes(r))) return true;
		} else {
			if (user_permissions.some(r => perms.includes(r))) return true;
		}

		return false;
	}
}

User.init({
	firstName: Sequelize.STRING,
	lastName: Sequelize.STRING,
	email: Sequelize.STRING,
	password: {
		type: Sequelize.STRING,
		allowNull:false,
		set(val) {
			//Adiciona o salt para salvar a senha do usuário
			const salted = salt(val);
			this.setDataValue('password', salted.password);
			this.setDataValue('salt', salted.salt);
		}
	},
	salt: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
	role: {
		type: Sequelize.STRING,
		defaultValue: 'customer',
		allowNull: false,
		comment: 'master | adm | customer | default'
	}
}, {
	modelName : 'users', //nome da tabela
	sequelize: conn,
});

module.exports = User;
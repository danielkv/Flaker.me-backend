import { Model, STRING, BOOLEAN } from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de empresas
 */

class Company extends Model {}

Company.init({
	name: STRING,
	displayName: STRING,
	email: STRING,
	token: STRING,
	active: {
		type: BOOLEAN,
		defaultValue: true,
	},
}, {
	modelName : 'companies', //nome da tabela
	sequelize: conn,
});

export default Company;
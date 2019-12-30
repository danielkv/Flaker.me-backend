import { Model, STRING, INTEGER, BOOLEAN } from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de empresas
 */

class Company extends Model {}

Company.init({
	name: STRING,
	displayName: STRING,
	email: STRING,
	limit: {
		type: INTEGER,
		defaultValue: 512000,
	},
	active: {
		type: BOOLEAN,
		defaultValue: true,
	},
}, {
	modelName : 'companies', //nome da tabela
	sequelize: conn,
});

export default Company;
const conn = require('../services/connection');
const Sequelize = require('sequelize');

/*
 * Define modelo (tabela) de empresas
 */

class Company extends Sequelize.Model {}

Company.init({
	name: Sequelize.STRING,
	displayName: Sequelize.STRING,
	email: Sequelize.STRING,
	active: {
		type: Sequelize.BOOLEAN,
		defaultValue: true,
	},
}, {
	modelName : 'companies', //nome da tabela
	sequelize: conn,
});

module.exports = Company;
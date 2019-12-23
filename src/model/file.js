const conn = require('../services/connection');
const Sequelize = require('sequelize');

/*
 * Define modelo (tabela) de arquivos
 */

class File extends Sequelize.Model {};

File.init({
	name: Sequelize.STRING,
	originalName: Sequelize.STRING,
	size: Sequelize.INTEGER,
	url: Sequelize.TEXT,
	bucket: Sequelize.STRING,
	hash: Sequelize.STRING,
	deleted: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
},{
	modelName : 'files', //nome da tabela
	sequelize: conn,
});

module.exports = File;
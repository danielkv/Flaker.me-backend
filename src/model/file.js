import { Model, STRING, INTEGER, TEXT, BOOLEAN } from 'sequelize';

import conn from '../services/connection';

/*
 * Define modelo (tabela) de arquivos
 */

class File extends Model {}

File.init({
	name: STRING,
	originalName: STRING,
	size: INTEGER,
	url: TEXT,
	bucket: STRING,
	hash: STRING,
	deleted: {
		type: BOOLEAN,
		defaultValue: false,
	},
},{
	modelName : 'files', //nome da tabela
	sequelize: conn,
});

export default File;
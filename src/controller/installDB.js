import { Company, UserMeta } from '../model/index';
import conn from '../services/connection';

function install (req, res) {
	if (!process.env.SETUP || process.env.SETUP !== 'true') return res.status(404).send('Not Found');
	
	let result = '';

	conn.authenticate()
		.then(async (t)=>{
			result += '<li>Connected to Database</li>';

			await conn.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true }).then(()=>conn.drop());
			result += '<li>Dropped all tables</li>';

			await conn.sync({ force: true });
			result += '<li>Tables created</li>';

			//createDummyData
			if (req.query.installDummyData) {
				await createDummyData();
				result += '<li>Dummy data ok</li>';
			}
		
			result += '<li><b>Database ok</b></li>';
			result = `<ul>${result}</ul>`;

			return res.type('html').send(result);
		})
		.catch((err)=>{
			return res.status(404).type('html').send(`${result} <br> <font color='red'>${err}</font>`);
		});
}

function createDummyData() {
	return Company.create({
		name: 'Empresa Razão Social',
		displayName: 'Empresa Nome fantasia',
		email: 'danielkv@gmail.com',
	}).then( (company)=>{
		company.createUser({
			firstName: 'Daniel',
			lastName: 'Guolo',
			email: 'danielkv@gmail.com',
			password: '123456',
			metas: [
				{
					key: 'watch',
					value: '["C:/Users/danie/Desktop/imas"]',
				}
			]
		}, { include: [UserMeta]})
	})
}

module.exports = install;
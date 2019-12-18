const Company = require('./company');
const CompanyMeta = require('./companyMeta');
const User = require('./user');
const UserMeta = require('./userMeta');
const File = require('./file');

Company.hasMany(User);
User.belongsTo(Company);

Company.hasMany(CompanyMeta);
CompanyMeta.belongsTo(Company);

User.hasMany(UserMeta);
UserMeta.belongsTo(User);

Company.hasMany(File);
File.belongsTo(Company);

module.exports = {
	Company,
	CompanyMeta,
	User,
	UserMeta,
	File,
}
import Company from './company';
import CompanyMeta from './companyMeta';
import File from './file';
import User from './user';
import UserMeta from './userMeta';

Company.hasMany(User);
User.belongsTo(Company);

Company.hasMany(CompanyMeta);
CompanyMeta.belongsTo(Company);

User.hasMany(UserMeta);
UserMeta.belongsTo(User);
User.hasMany(File);
File.belongsTo(User);

export default {
	Company,
	CompanyMeta,
	User,
	UserMeta,
	File,
}
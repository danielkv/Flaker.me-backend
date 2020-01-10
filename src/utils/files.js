import { randomBytes } from 'crypto';
import { extname, basename } from 'path';

import Company from '../model/company';
import File from '../model/file';
import User from '../model/user';
import conn from '../services/connection';
import { slugify } from './index';

export function generateNewFileName(originalName, bytes=16) {
	const fileExtension = extname(originalName);
	const fileName = basename(originalName, fileExtension)
	const hash = randomBytes(bytes);
	const new_name = `${slugify(fileName)}-${hash.toString("hex")}${fileExtension}`;

	return new_name;
}

export async function getCompanyFilesSize(company_id) {
	const [file] = await File.findAll({
		attributes: [
			[conn.fn('SUM', conn.col('size')), 'size']
		],
		where: {
			['$user.companyId$']: company_id,
			deleted: false,
		},
		include: [User]
	});

	return parseInt(file.size);
}

export async function getCompanyLimit(company_id) {
	const company = await Company.findByPk(company_id);
	if (!company) throw new Error('Empresa não encontrada');

	const [meta] = await company.getMetas({ where: { key: 'limit' } })
	if (!meta) throw new Error('Limite não encontrado');
			
	return parseInt(meta.value);
}

export async function checkBeforeFileUpload({ company_id, size: fileSize }) {
	const totalSize = await getCompanyFilesSize(company_id);
	const limit = await getCompanyLimit(company_id);
	const nextTotal = totalSize + fileSize;

	if (nextTotal > limit) throw new Error('O limite de espaço foi atingido');

	return true;
}
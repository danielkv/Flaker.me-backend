const crypto = require('crypto');
const { slugify } = require('./index');
const { extname, basename } = require('path');

function generateNewFileName(originalName, bytes=16) {
	const fileExtension = extname(originalName);
	const fileName = basename(originalName, fileExtension)
	const hash = crypto.randomBytes(bytes);
	const new_name = `${slugify(fileName)}-${hash.toString("hex")}${fileExtension}`;

	return new_name;
}

module.exports = {
	generateNewFileName,
}
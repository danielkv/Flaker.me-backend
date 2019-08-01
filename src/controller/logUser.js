const morgan = require('morgan');

morgan.token('bucket', (req, res)=>{
	if (req.bucket) return req.bucket.name;
	return null;
});
morgan.token('log', (req, res)=>{
	if (req.logToFile) return req.logToFile;
	return null;
});

morgan.token('user', (req, res)=>{
	if (req.user) return req.user.name;
	return null;
});

module.exports = function () {
	return morgan('[:method] [:status] :user [:bucket] :log | :url');
}

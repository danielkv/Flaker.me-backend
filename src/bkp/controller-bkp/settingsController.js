const Settings = require('../model/userSettings');
const Storage = require('../model/storage');

async function load (req, res) {
	try {
		const {user} = req;
		const settings = await Settings.get(user);
		
		res.send(settings);

	} catch (e) {
		return res.status(403).send(e);
	}
}

async function update (req, res) {
	try {

		if (Object.keys(req.old_settings).length)
			await Settings.update(req.user, req.new_settings);
		else
			await Settings.add(req.user, req.new_settings);
		
		res.send(req.new_settings);

	} catch (e) {
		return res.status(403).send(e);
	}
}

async function setupSettingsVars(req, res, next) {
	const {user, body} = req;
	req.old_settings = await Settings.get(user);
	req.new_settings = Settings.sanitize(body);
	next();
}

function setNewSettings(req, res, next) {
	//lifecycle
	Storage.addLifecycleRule(req.bucket, req.new_settings.lifecycle)
	.then(()=>{
		next();
	})
	.catch((e) => {
		return res.status(403).send(e);
	});
}

module.exports = {
	load,
	update,
	setNewSettings, 
	setupSettingsVars,
}
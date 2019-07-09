const Settings = require('../model/userSettings');

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
		const {user, body} = req;
		const existing_settings = await Settings.get(user);
		let settings;

		if (Object.keys(existing_settings).length)
			settings = await Settings.update(user, body);
		else
			settings = await Settings.add(user, body);
		
		res.send(settings);

	} catch (e) {
		return res.status(403).send(e);
	}
}

module.exports = {
	load,
	update,
}
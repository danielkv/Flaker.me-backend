const { Router } = require('express');
const installDataBase = require('./controller/installDB');

const router = Router();

// networt test
router.get('/networkTest', (req, res) => {
	if (!process.env.SETUP || process.env.SETUP !== 'true') return res.status(404).send('Not Found');

	res.send(`Connected at ${req.hostname}<br>Host: ${req.headers.host}<br>Secure connection: ${!!req.secure}<br>Protocol: ${req.protocol}`);
});

// rota de instalação
router.get('/setup', installDataBase);

module.exports = router;
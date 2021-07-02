const { name, version, homepage, author } = require('./package.json');
const rateLimit = require('express-rate-limit');
const nocache = require('nocache');
const express = require('express');
const app = express();

// Response codes
const HTTP_CODE = {
	NO_CONTENT: 204
};

// Port numbers (see here: https://en.wikipedia.org/wiki/Registered_port)
const PORTS = {
	MIN: 1024,
	MAX: 49151
};

/**
 * Generate a new random number between a minimum and maximum (INCLUSIVE)
 * @param {Number} min The minimum value
 * @param {Number} max The maximum value
 * @returns A random number
 */
function between(min, max) {
	return Math.floor(Math.random() * ((max + 1) - min) + min);
}

/**
 * Builds the Express app and starts the listener
 */
function buildServer() {
	// Enable/disable certain features of Express
	app.enable('case sensitive routing');
	app.disable('x-powered-by');
	app.disable('etag');

	// Disable cache via middleware
	app.use(nocache());

	// Rate limit middleware
	app.use(rateLimit({
		windowMs: 1000 * 60, // 60 seconds
		max: 90 // Limit each IP to 30 requests per windowMs
	}));

	// Don't process favicon requests (custom middleware)
	app.use((req, res, next) => (req.url.includes('favicon.ico') ? res.sendStatus(HTTP_CODE.NO_CONTENT) : next()));

	// Attach site & contact details to response headers
	app.use((_, res, next) => (res
		.header('X-Server', `${name} v${version}`)
		.header('X-Homepage', homepage)
		.header('X-Contact', author), next()));

	// Generate a port on all methods
	app.all('/', (_, res) => res.type('text').send(`${between(PORTS.MIN, PORTS.MAX)}`));

	// Host the server
	app.listen(PORTS.MAX, () => console.log(`Server listening on 0.0.0.0:${PORTS.MAX} (click to view in browser: http://127.0.0.1:${PORTS.MAX})`));
}

buildServer();

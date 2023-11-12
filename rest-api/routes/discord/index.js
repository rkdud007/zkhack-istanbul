const express = require('express');

const app = express.Router();

const api = require('./api.js');

/**
 * IMPORTANT: make sure to always send bad response from a known error
 *            catch error and return to be a suitable response instead
 * @param error, expected type to be a object {userNotFoundError: true}, etc.
 * else @returns/response {submitError: true}
 */
/// COMMENT ENDPOINT

app.put('/discord/verify', async (req, res) => {
	try {
		const { accessToken, tokenType } = req.body;

		const response = await api.verifyDiscord(tokenType, accessToken);

		const cookieSettings = {
			path: '/',
			expires: new Date(response.authTokenExpirationTimestamp * 1000),
			httpOnly: true,
			encode: String,
			secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
			domain: process.env.NODE_ENV === 'development' ? '' : utils.getDomainFromUrl(config.productionWebsiteUrl),
		};

		res.cookie('user', response.username + '&' + response.authToken, cookieSettings);

		res.json({ success: true });
	} catch (error) {
		console.log(error);
		if (!(error instanceof Error)) {
			res.json(error);
		} else {
			res.json({ submitError: true });
		}
	}
});

module.exports = app;

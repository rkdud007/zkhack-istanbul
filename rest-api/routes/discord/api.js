const moment = require('moment');
const linkifyUrls = require('linkify-urls');
const xss = require('xss');

const CommentModel = require('../../models/comment.js');
const UserModel = require('../../models/user.js');
const ItemModel = require('../../models/item.js');
const UserVoteModel = require('../../models/userVote.js');
const UserFavoriteModel = require('../../models/userFavorite.js');

const utils = require('../utils.js');
const config = require('../../config.js');

const searchApi = require('../search/api.js');
const { default: axios } = require('axios');

/// COMMENT API
module.exports = {
	verifyDiscord: async (tokenType, accessToken) => {
		const response = (
			await axios.get('https://discord.com/api/users/@me', {
				headers: {
					authorization: `${tokenType} ${accessToken}`,
				},
			})
		).data;

		let user = await UserModel.findOne({ discordId: response.id }).exec();

		if (!user) {
			user = await UserModel.create({
				username: response.username,
				discordId: response.id,
				discordUsername: response.username,
			});
		}

		if (user.banned) {
			throw { bannedError: true };
		}

		const authTokenString = utils.generateUniqueId(40);
		const authTokenExpirationTimestamp = moment().unix() + 86400 * config.userCookieExpirationLengthInDays;

		user.authToken = authTokenString;
		user.authTokenExpiration = authTokenExpirationTimestamp;

		await user.save();

		return {
			success: true,
			username: response.username,
			authToken: authTokenString,
			authTokenExpirationTimestamp: authTokenExpirationTimestamp,
		};
	},
};

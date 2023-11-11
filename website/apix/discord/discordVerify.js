import axios from "axios";

import apiBaseUrl from "../../utils/apiBaseUrl.js";

export default function discordVerify(tokenType, accessToken, callback) {
    axios
        .put(
            `${apiBaseUrl}/discord/verify`,
            {
                accessToken,
                tokenType,
            },
            { withCredentials: true }
        )
        .then(function (response) {
            callback(response.data);
        })
        .catch(function (error) {
            callback({ submitError: true });
        });
}

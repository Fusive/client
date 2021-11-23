const fetch = require('electron-fetch').default

const gFuncs = {
    // A Function That Generates A Random Number In A Selected Range
    randomInRange(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    },

    // Validate A Twitch Token By Making A Twitch API Call
    async twitchValidateToken(token) {
        let options = {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        };
        let response = await fetch("https://id.twitch.tv/oauth2/validate", options);
        const data = await response.json();
        if (data.status && data.status >= 400) return false;
        else if (data.login) return data;
        else return false;
    }
}

module.exports = gFuncs;
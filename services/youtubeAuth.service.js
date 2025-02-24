const { google } = require("googleapis");

function getYoutubeClient(accessToken) {
    const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET,
        "http://localhost:3000/auth/google/callback" // Certifique-se de que o redirect URI está correto
    );
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.youtube({ version: "v3", auth: oauth2Client });
}

module.exports = { getYoutubeClient };
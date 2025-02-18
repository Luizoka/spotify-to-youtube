const { google } = require("googleapis");

function getYoutubeClient() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.YOUTUBE_CLIENT_ID,
        process.env.YOUTUBE_CLIENT_SECRET
        // ...caso precise de redirect...
    );
    oauth2Client.setCredentials({ refresh_token: process.env.YOUTUBE_REFRESH_TOKEN });
    return google.youtube({ version: "v3", auth: oauth2Client });
}

async function createYoutubePlaylist(playlistName, tracks) {
    const youtube = getYoutubeClient();
    // Criar playlist
    const playlistResponse = await youtube.playlists.insert({
        part: ["snippet,status"],
        resource: {
            snippet: { title: playlistName, description: "Playlist gerada a partir do Spotify" },
            status: { privacyStatus: "private" }
        }
    });
    // Adicionar músicas
    for (const track of tracks) {
        const query = `${track.name} ${track.artist}`;
        // ...buscar vídeo no YouTube e inserir na playlist...
    }
    return { success: true, message: "Playlist criada com sucesso!" };
}

module.exports = { createYoutubePlaylist };

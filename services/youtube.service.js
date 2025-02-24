const { getYoutubeClient } = require("./youtubeAuth.service");

async function createYoutubePlaylist(playlistName, tracks, accessToken) {
    const youtube = getYoutubeClient(accessToken);
    
    // Criar playlist
    const playlistResponse = await youtube.playlists.insert({
        part: ["snippet,status"],
        resource: {
            snippet: { title: playlistName, description: "Playlist gerada a partir do Spotify" },
            status: { privacyStatus: "private" }
        }
    });

    const playlistId = playlistResponse.data.id;

    // Adicionar músicas
    for (const track of tracks) {
        const query = `${track.name} ${track.artist}`;
        
        // Buscar vídeo no YouTube
        const searchResponse = await youtube.search.list({
            part: "snippet",
            q: query,
            maxResults: 1,
            type: "video"
        });

        const videoId = searchResponse.data.items[0]?.id?.videoId;
        if (videoId) {
            // Inserir vídeo na playlist
            await youtube.playlistItems.insert({
                part: ["snippet"],
                resource: {
                    snippet: {
                        playlistId: playlistId,
                        resourceId: {
                            kind: "youtube#video",
                            videoId: videoId
                        }
                    }
                }
            });
        }
    }

    return { success: true, message: "Playlist criada com sucesso!" };
}

module.exports = { createYoutubePlaylist };
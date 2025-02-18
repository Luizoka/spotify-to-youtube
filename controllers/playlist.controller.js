const { getPlaylistTracks, getSpotifyToken } = require("../services/spotify.service");
const { createYoutubePlaylist: createYT } = require("../services/youtube.service");

async function getPlaylist(req, res) {
    const { playlistUrl } = req.query;

    if (!playlistUrl) {
        return res.status(400).json({ error: "O parâmetro playlistUrl é obrigatório." });
    }

    // Extrair o ID da playlist da URL
    const match = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)(\?|$)/);
    if (!match) {
        return res.status(400).json({ error: "URL da playlist inválida." });
    }
    const playlistId = match[1];

    try {
        const accessToken = await getSpotifyToken();

        // Obter nome da playlist
        const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!playlistResponse.ok) throw new Error("Erro ao obter informações da playlist");

        const playlistData = await playlistResponse.json();
        const playlistName = playlistData.name || "Nome não disponível";

        // Obter todas as músicas da playlist
        const tracks = await getPlaylistTracks(playlistId, accessToken);

        res.json({ playlistName, tracks });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message || "Erro desconhecido ao processar a requisição." });
    }
}

async function createYoutubePlaylist(req, res) {
    try {
        const { playlistUrl } = req.body;

        if (!playlistUrl) {
            return res.status(400).json({ error: "O parâmetro playlistUrl é obrigatório." });
        }

        // Extrair o ID da playlist da URL
        const match = playlistUrl.match(/playlist\/([a-zA-Z0-9]+)(\?|$)/);
        if (!match) {
            return res.status(400).json({ error: "URL da playlist inválida." });
        }
        const playlistId = match[1];

        const accessToken = await getSpotifyToken();

        // Obter nome da playlist
        const playlistResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!playlistResponse.ok) throw new Error("Erro ao obter informações da playlist");

        const playlistData = await playlistResponse.json();
        const playlistName = playlistData.name || "Nome não disponível";

        // Obter todas as músicas da playlist
        const tracks = await getPlaylistTracks(playlistId, accessToken);

        const result = await createYT(playlistName, tracks, req.user.accessToken);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { getPlaylist, createYoutubePlaylist };
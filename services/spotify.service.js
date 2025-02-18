require("dotenv").config();

// Função para obter token de acesso do Spotify
async function getSpotifyToken() {
    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ grant_type: "client_credentials" }),
    });

    if (!response.ok) throw new Error("Falha ao obter o token do Spotify");

    const data = await response.json();
    return data.access_token;
}

// Função para obter todas as músicas da playlist (com paginação)
async function getPlaylistTracks(playlistId, accessToken) {
    let tracks = [];
    let offset = 0;
    const limit = 100; // Spotify permite no máximo 100 músicas por requisição

    while (true) {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=${limit}&offset=${offset}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) throw new Error("Erro ao obter as músicas da playlist");

        const data = await response.json();
        if (!data.items || data.items.length === 0) break; // Se não houver mais músicas, saímos do loop

        // Adicionar as músicas ao array
        tracks = tracks.concat(
            data.items.map((item) => ({
                name: item.track?.name || "Desconhecido",
                artist: item.track?.artists?.map((artist) => artist.name).join(", ") || "Desconhecido",
            }))
        );

        offset += limit; // Pular para o próximo lote de músicas

        // Se a API indicar que já retornamos todas as músicas, podemos parar
        if (offset >= data.total) break;
    }

    return tracks;
}

module.exports = { getSpotifyToken, getPlaylistTracks };

const express = require("express");
const router = express.Router();
const { getPlaylist, createYoutubePlaylist } = require("../controllers/playlist.controller");

router.get("/playlist", getPlaylist);
router.post("/playlist/youtube", createYoutubePlaylist);

module.exports = router;

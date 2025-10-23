import express from "express";
import {
  getAllAlbum,
  getAllsongs,
  getAllSongsOfAlbum,
  getSingleSong,
} from "./controller.js";

const router = express.Router();

router.get("/album/all", getAllAlbum);
router.get("/song/all", getAllsongs);
router.get("/album/:id", getAllSongsOfAlbum);
router.get("/song/:id", getSingleSong);

export default router;
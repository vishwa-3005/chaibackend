import { Router } from "express";
import {
  createPlaylist,
  getUserPlaylist,
  getPlayListById,
  removeVideoFromPlaylist,
  deletePlayList,
  updatePlaylist,
} from "../controllers/playlist.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
const router = Router();

router.use(verifyJWT);

router.route("/").post(createPlaylist);
router.route("/user/playlists").get(getUserPlaylist);
router.route("/:playlistId").get(getPlayListById);
router.route("/:playlistId/videos/:videoId").delete(removeVideoFromPlaylist);
router.route("/:playlistId").delete(deletePlayList);
router.route("/:playlistId/videos/:videoId").post(updatePlaylist);

export default router;

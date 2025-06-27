import {
  toggleLikeComment,
  toggleLikeTweet,
  toggleLikevideo,
  getAllLikedvideos,
} from "../controllers/like.controller.js";
import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/comment/commentId").post(toggleLikeComment);
router.route("/tweet/tweetId").post(toggleLikeTweet);
router.route("/video/video").post(getAllLikedvideos);
router.route("/u/videoId").get(getAllLikedvideos);

export default router;

import verifyJWT from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  getUserTweets,
  createTweet,
  updateTweet,
  deleteTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create-tweet").post(createTweet);
router.route("/u/:userId").get(getUserTweets);
router.route("/t/:tweetId").delete(deleteTweet);
router.route("/t/:tweetId").patch(updateTweet);

export default router;

import {
  getSubscribers,
  getSubscribedChannels,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

import verifyJWT from "../middlewares/auth.middleware.js";

import { Router } from "express";
const router = Router();

router.use(verifyJWT);
//apply verifyJWT to ll routes in this file

router
  .route("/c/:channelId")
  .get(getSubscribedChannels)
  .post(toggleSubscription);

router.route("/u/:subscriberId").get(getSubscribers);

export default router;

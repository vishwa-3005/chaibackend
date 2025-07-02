import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  getProfile,
  channelStatistics,
  recentActivities,
  engagementSummary,
} from "../controllers/dashboard.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/profile/:userId").get(getProfile);
router.route("/channel-stats/:userId").get(channelStatistics);
router.route("/recent-activity/:userId").get(recentActivities);
router.route("/summar/:userId").get(engagementSummary);

export default router;

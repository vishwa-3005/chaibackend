import { Router } from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import { healthCheck } from "../controllers/healthCheck.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/").get(healthCheck);

export default router;

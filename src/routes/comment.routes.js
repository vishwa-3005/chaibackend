import verifyJWT from "../middlewares/auth.middleware.js";
import { Router } from "express";
import {
  getAllComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/:videoId").get(getAllComments);
router.route("/:videoId").post(addComment);
router.route("/c/:commentId").delete(deleteComment);
router.route("/c/:commentId").patch(updateComment);

export default router;

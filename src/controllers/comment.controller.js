import asyncHandler from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { UploadStream } from "cloudinary";
import Comment from "../models/comment.model.js";
//1.get all comment for a video
const getAllComments = asyncHandler(async (req, res) => {});
//2.add comment
const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  // Validate input
  if (!videoId) {
    throw new ApiError(400, "Video ID is missing");
  }
  if (!content) {
    throw new ApiError(400, "Comment content is required");
  }

  // Check if video exists
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Create comment
  const commentInfo = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!commentInfo) {
    throw new ApiError(
      500,
      "Something went wrong while publishing the comment"
    );
  }

  return res
    .status(201)
    .json(new ApiResponse(201, commentInfo, "Comment added successfully"));
});

//3.update comment
const updateComment = asyncHandler(async (req, res) => {});
//4.delete comment
const deleteComment = asyncHandler(async (req, res) => {});

export { getAllComments, addComment, updateComment, deleteComment };

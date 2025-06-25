import asyncHandler from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { UploadStream } from "cloudinary";
import Comment from "../models/comment.model.js";
import mongoose from "mongoose";
//1.get all comment for a video
const getAllComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "video id is missing in request parameters");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found !");
  }

  const comments = await Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        foreignField: "_id",
        localField: "owner",
        as: "ownerDetails",
      },
    },
    {
      $unwind: "$ownerDetails",
    },
    {
      $project: {
        _id: 1,
        content: 1,
        ownerName: "$ownerDetails.userName",
        avatar: "$ownerDetails.avatar",
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, comments, "All comments fetched successfully"));
});
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
const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment ID is missing from request parameters");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found!");
  }

  const { content } = req.body;
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user._id.toString() !== comment.owner.toString()) {
    throw new ApiError(403, "You are not allowed to update this comment");
  }

  comment.content = content.trim();
  const updatedComment = await comment.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "comment updated successfully !")
    );
});
//4.delete comment
const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Comment ID is missing from request parameters");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "comment not found!");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user._id.toString() !== comment.owner.toString()) {
    throw new ApiError(401, "You are not allowed to delete this comment");
  }

  await Comment.deleteOne({ _id: new mongoose.Types.ObjectId(commentId) });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted Successfully!"));
});

export { getAllComments, addComment, updateComment, deleteComment };

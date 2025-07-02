import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import asyncHandler from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";
//get all liked videos
const getAllLikedvideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const likedvideos = await Like.aggregate([
    {
      $match: {
        comment: null,
        tweet: null,
        likedBy: userId,
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "likedvideoDetails",
      },
    },
    {
      $unwind: "$likedvideoDetails",
    },
    {
      $project: {
        title: "$likedvideoDetails.title",
        description: "$likedvideoDetails.description",
        videoFile: "$likedvideoDetails.videoFile",
        duration: "$likedvideoDetails.duration",
        thumbnail: "$likedvideoDetails.thumbnail",
        owner: "$likedvideoDetails.owner",
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedvideos, "liked videos fetched successFully !")
    );
});
//toggle like on comment
const toggleLikeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "comment id is missing in params");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found!");
  }

  const userId = req.user._id;

  //find if comment is liked by this user
  const isCommentLiked = await Like.findOne({
    comment: commentId,
    likedBy: userId,
  });
  if (isCommentLiked) {
    await Like.deleteOne({ _id: isCommentLiked._id });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "comment unliked succesfylly!"));
  } else {
    const likedComment = await Like.create({
      comment: commentId,
      video: null,
      tweet: null,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, likedComment, "comment liked succesfully"));
  }
});
//toggle like on tweet
const toggleLikeTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "tweetId id is missing in params");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "tweet not found!");
  }

  const userId = req.user._id;

  //find if comment is liked by this user
  const isTweetLiked = await Like.findOne({
    tweet: tweetId,
    likedBy: userId,
  });
  if (isTweetLiked) {
    await Like.deleteOne({ _id: isTweetLiked._id });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "tweet unliked succesfylly!"));
  } else {
    const likedTweet = await Like.create({
      comment: null,
      video: null,
      tweet: tweetId,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, likedTweet, "tweet liked succesfully"));
  }
});
//toggle like on video
const toggleLikevideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "videoId id is missing in params");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found!");
  }

  const userId = req.user._id;

  //find if comment is liked by this user
  const isvideoLiked = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });
  if (isvideoLiked) {
    await Like.deleteOne({ _id: isvideoLiked._id });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "video unliked succesfylly!"));
  } else {
    const likedvideo = await Like.create({
      comment: null,
      video: videoId,
      tweet: null,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, likedvideo, "Video liked succesfully"));
  }
});

export {
  toggleLikeComment,
  toggleLikeTweet,
  toggleLikevideo,
  getAllLikedvideos,
};

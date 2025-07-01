import asyncHandler from "../utils/asyncHandlers.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Subscription } from "../models/subcription.model.js";
import { Playlist } from "../models/playlist.model.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";
//1.user profile -> username, fullname, avatar, coverImage, email
const getProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "user ID is missing from request params");
  }

  const user = await User.findById(userId).select(
    "-password -refreshToken -watchHistory -"
  );

  if (!user) {
    throw new ApiError(404, "User not found !");
  }

  if (req.user._id.toString() !== userId) {
    throw new ApiError(
      403,
      "Unauthorization: You are not allowed to see channel stats"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "personal info fetched"));
});
//2.channel statistics
const channelStatistics = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "user ID is missing from request params");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "user ID is not of mongoose ObjectId type");
  }
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found !");
  }

  if (req.user._id.toString() !== userId) {
    throw new ApiError(
      403,
      "Unauthorization: You are not allowed to see channel stats"
    );
  }

  //total subscribers
  const totalSubscribers = await User.aggregate([
    {
      $match: {
        channel: userId,
      },
    },
    {
      $count: "subscriberCount",
    },
  ]);
  const subscribersCount = totalSubscribers[0]?.subscriberCount || 0;

  //total views
  const totalViews = await Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $group: {
        _id: null,
        viewsCount: {
          $sum: "$views",
        },
      },
    },
  ]);
  const totalViewsCount = totalViews[0]?.viewsCount;

  //total videos
  const totalVideos = await Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $group: {
        _id: null,
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  const totalVideosCount = totalVideos[0]?.count || 0;

  //total likes
  const totalVideoLikes = await Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $project: {
        likeCount: { $size: "$likes" },
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: "$likeCount" },
      },
    },
  ]);
  const totalVideoLikesCount = totalVideoLikes[0]?.totalLikes || 0;

  const totalTweetLikes = await Tweet.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likes",
      },
    },
    {
      $project: {
        likesOnTweet: { $size: "$likes" },
      },
    },
    {
      $group: {
        _id: null,
        totalLikes: { $sum: "$likesOnTweet" },
      },
    },
  ]);
  const totalTweetLikeCount = totalTweetLikes[0]?.totalLikes || 0;

  //total comments
  const totalComments = await Video.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $project: {
        commentsOnVideo: { $size: "$comments" },
      },
    },
    {
      $group: {
        _id: null,
        totalComments: {
          $sum: "$commentsOnVideo",
        },
      },
    },
  ]);
  const totalCommentsCount = totalComments[0]?.totalComments || 0;

  //total tweets
  const totalTweets = await Tweet.aggregate([
    {
      $match: {
        owner: userId,
      },
    },
    {
      $group: {
        _id: null,
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  const totalTweetsCount = totalTweets[0]?.count || 0;

  const result = {
    netSubscribers: subscribersCount,
    netViews: totalViewsCount,
    netVideos: totalVideosCount,
    netVideoLikes: totalVideoLikesCount,
    netTweetLikes: totalTweetLikeCount,
    netComments: totalCommentsCount,
    netTweets: totalTweetsCount,
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "channel stats fetched successfully"));
});

//3.recent activity

//4.engagement summary

export { getProfile, channelStatistics };

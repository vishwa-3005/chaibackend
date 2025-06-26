import asyncHandler from "../utils/asyncHandlers";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { Tweet } from "../models/tweet.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";
//1.create tweet
const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content || content.trim() === "") {
    throw new ApiError(400, "Content is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "user not found");
  }

  const tweet = await Tweet.create({
    content: content,
    owner: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet added successfully"));
});
//2.get user tweets
const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return new ApiError(400, "User Id is missing from params");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const tweets = await tweets.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "All tweets fetched succesfully"));
});
//3.update tweet
const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { newContent } = req.body;
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is missing from params");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    return new ApiError(404, "Tweet not found");
  }

  if (!newContent) {
    throw new ApiError(400, "tweet content is required");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: newContent,
      },
    },
    { new: true }
  );
  await updateTweet.save();
  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
});

//4.delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is missing from params");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    return new ApiError(404, "Tweet not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted succesfully!"));
});

export { getUserTweets, createTweet, updateTweet, deleteTweet };

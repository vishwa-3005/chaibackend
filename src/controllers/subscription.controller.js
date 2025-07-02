import asyncHandler from "../utils/asyncHandlers.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subcription.model.js";
import { ApiError } from "../utils/apiError.js";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/apiResponse.js";
import { json } from "express";

//1.toggle subscriptions
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Invalid request!");
  }
  const subscriber = await User.findById(req.user._id);
  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }
  if (!subscriber) {
    throw new ApiError(404, "user not found");
  }
  const isSubscribed = await Subscription.findOne({
    subscriber: subscriber._id,
    channel: channel._id,
  });

  if (isSubscribed) {
    await Subscription.deleteOne({
      subscriber: subscriber._id,
      channel: channel._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "unsubscribed successfully !"));
  } else {
    const subscription = await Subscription.create({
      subscriber: subscriber._id,
      channel: channel._id,
    });

    if (!subscription) {
      throw new ApiError(500, "subscription Request failed !");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, subscription, "subscribed successfully !"));
  }
});
//2.get all subscribers
const getSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "Channel ID is missing!");
  }

  const channel = await User.findById(subscriberId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },
    {
      $unwind: "$subscriberDetails",
    },
    {
      $project: {
        _id: 0,
        subscriberName: "$subscriberDetails.userName",
        avatar: "$subscriberDetails.avatar",
        coverImage: "$subscriberDetails.coverImage",
      },
    },
  ]);

  if (subscribers.length > 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { result: subscribers },
          "Subscribers fetched successfully!"
        )
      );
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "No subscribers found"));
  }
});

//3.get subscribed channels
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!channelId) {
    throw new ApiError(404, "Channel ID is missing!");
  }

  const channel = await User.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannelDetails",
      },
    },
    {
      $unwind: "$subscribedChannelDetails",
    },
    {
      $project: {
        _id: 0,
        channelName: "$subscribedChannelDetails.userName",
        avatar: "$subscribedChannelDetails.avatar",
        coverImage: "$subscribedChannelDetails.coverImage",
      },
    },
  ]);

  if (subscribedChannels.length > 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { result: subscribedChannels },
          "subscribedChannels fetched successfully!"
        )
      );
  } else {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "No subscribedChannels found"));
  }
});
export { toggleSubscription, getSubscribers, getSubscribedChannels };

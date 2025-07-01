import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandlers.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
//1.create playlist
const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, "name is required!");
  }

  const playlist = await Playlist.create({
    name: name,
    description: description,
    videos: [],
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});
//2.get user plalists
const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "userId is missing request params");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError("User not found!");
  }

  const userPlayLists = await Playlist.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoList",
      },
    },
  ]);

  if (userPlayLists.length > 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userPlayLists,
          "All playlists fetched successfully!"
        )
      );
  } else {
    return res.status(200).json(new ApiResponse(200, {}, "no playlists found"));
  }
});
//3.get playlist by id
const getPlayListById = asyncHandler(async (req, res) => {
  const { playListId } = req.params;

  if (!playListId) {
    throw new ApiError(400, "Playlist ID is missing from request parameters");
  }

  const playList = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playListId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videoList",
      },
    },
  ]);

  if (playList.length === 0) {
    throw new ApiError(404, "Playlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playList[0], "Playlist fetched successfully"));
});

//4.remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playListId, videoId } = req.params;
  if (!playListId || !videoId) {
    throw new ApiError(
      400,
      "playlistId or videoId are missing from request params"
    );
  }

  const playList = await Playlist.findById(playListId);
  const video = await Video.findById(videoId);

  if (!playList) {
    throw new ApiError(404, "Playlist id is invalid");
  }
  if (!video) {
    throw new ApiError(404, "Video id is invalid");
  }

  if (playList.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(401, "Unauthorised request");
  }

  playList.videos = playList.videos.filter(
    (item) => item.toString() !== videoId
  );

  await playList.save({ validateBeforeSave: true });

  const resultPlaylist = await Playlist.aggregate([
    {
      $match: {
        _id: playListId,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, resultPlaylist[0], "video deleted successfully")
    );
});
//5.delete playlist
const deletePlayList = asyncHandler(async (req, res) => {
  const { playListId } = req.params;
  if (!playListId) {
    throw new ApiError(400, "playlistId is missing from request params");
  }
  if (!mongoose.Types.ObjectId.isValid(playListId)) {
    throw new ApiError(400, "Invalid Playlist ID format");
  }
  const playList = await Playlist.findById(playListId);

  if (!playList) {
    throw new ApiError(404, "Playlist id is invalid");
  }

  if (playList.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Unauthorized: You are not the owner of this playlist"
    );
  }

  await Playlist.deleteOne({ _id: new mongoose.Types.ObjectId(playListId) });

  return res
    .status(200)
    .json(new ApiResponse(200, "Playlist deleted Successfully"));
});
//6.update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
  const { playListId } = req.params;
});

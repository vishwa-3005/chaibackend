import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandlers.js";
import { Playlist } from "../models/playlist.model.js";
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
const getUserPlaylist = asyncHandler(async (req, res) => {});
//3.get playlist by id
const getPlayListById = asyncHandler(async (req, res) => {});
//4.remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {});
//5.delete playlist
const deletePlayList = asyncHandler(async (req, res) => {});
//6.update playlist
const updatePlaylist = asyncHandler(async (req, res) => {});

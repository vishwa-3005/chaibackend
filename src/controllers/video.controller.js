import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import asyncHandler from "../utils/asyncHandlers.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import fs from "fs";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video
  const { title, description } = req.body;
  //const { video, thumbnail } = req.files;
  const user = req.user;

  if (!title || !description) {
    throw new ApiError(400, "All fields are required!");
  }

  //upload videofile anf thubnail to cloudinary
  const videoLocalPath = req.files?.video?.[0].path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "video file or thumbnail is missing!");
  }

  const videoUpload = await uploadOnCloudinary(videoLocalPath);
  const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoUpload || !thumbnailUpload) {
    throw new ApiError(500, "video or thumbnail is required");
  }

  console.log(videoUpload);
  //create video in DB
  const publishedvideo = await Video.create({
    title,
    description,
    videoFile: videoUpload.secure_url,
    thumbnail: thumbnailUpload.secure_url,
    duration: videoUpload.duration,
    owner: user,
  });

  if (!publishedvideo) {
    throw new ApiError(501, "Something went wrong while publishing video!");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, publishedvideo, "video published succesfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!videoId) {
    throw new ApiError(400, "videoId is missing!");
  }

  //check for format
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }
  video.views += 1;
  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched succesfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!videoId) {
    throw new ApiError(404, "videoId not found");
  }

  //check for format
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId format!");
  }

  //find video
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "video not found");
  }

  //check for req.user is owner
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to update this video");
  }

  const { title, description } = req.body;
  const videoLocalPath = req.files?.video?.[0].path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

  //let videoUrl, thumbnailUrl;
  if (videoLocalPath) {
    const videoUpload = await uploadOnCloudinary(videoLocalPath);
    video.videoFile = videoUpload.secure_url;
  }
  if (thumbnailLocalPath) {
    const thumbnailUpload = await uploadOnCloudinary(thumbnailLocalPath);
    video.thumbnail = thumbnailUpload.secure_url;
  }

  //find video
  if (title) video.title = title;
  if (description) video.description = description;

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "Missing required parameter: videoId");
  }

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId format");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  //check for onwer
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "unauthorised delete action!");
  }

  //const deleteResponse = await Video.deleteOne({_id : video._id});
  const result = await video.deleteOne();
  console.log(result);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "video deleted successfully !"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "videoId is missing!");
  }
  console.log("togglePublishStatus hit with videoId:", videoId);
  //check for format
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid video id format");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found!");
  }

  video.isPublished = !video.isPublished;
  const toggledVideo = await video.save();
  console.log(toggledVideo);
  return res
    .status(200)
    .json(
      new ApiResponse(200, toggledVideo, "publish status toggled successfully!")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};

import asyncHandler from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { pipeline } from "stream";
import { match } from "assert";

const generateAccessAndRefreshTOken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    user.accessToken = accessToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, userName, email, password } = req.body;

  //data validation
  if (
    [userName, email, fullName, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "All feilds are required !!");
  }

  //check user existance
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "username or email already exists !");
  }

  //check for avatar file
  //console.log(req.files);
  const avtarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || null;
  console.log(avtarLocalPath);
  if (!avtarLocalPath) {
    throw new ApiError(400, "Avatar file is required !");
  }

  //uplaod to cloudinary
  const avatar = await uploadOnCloudinary(avtarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("file uploaded succesfully");
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required !");
  }

  //create user object
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });
  console.log("User created succesfully");
  //remove refreshToken and password
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //check weather user created
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering user");
  }

  //return response
  return res.status(201).json({
    userResponse: new ApiResponse(
      200,
      createdUser,
      "User register succesfully"
    ),
  });
});

//login controller

const loginUser = asyncHandler(async (req, res) => {
  //fetch data from req body
  const { userName, email, password } = req.body;
  //username or email
  if (!userName && !email) {
    throw new ApiError(400, "Username or password is required");
  }
  //find user
  const conditions = [];

  if (userName) {
    conditions.push({ userName });
  }

  if (email) {
    conditions.push({ email });
  }

  const user = await User.findOne({
    $or: conditions, //since mongoDb accepts feildnames than raw values
  });

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  //check for password
  const isPassWordValid = await user.isPasswordCorrect(password);
  if (!isPassWordValid) {
    throw new ApiError(401, "Invalis credentials");
  }
  //access refreshtoken and accesstoken
  const { accessToken, refreshToken } = await generateAccessAndRefreshTOken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  //send cookie and response
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accesToken", accessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedIn succesfully"
      )
    );
});

//logount controller
const logoutUser = asyncHandler(async (req, res) => {
  //clear access and refresh token from cookie
  //clear tokens from user
  const loggedOutUser = User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User logged Out !"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorised request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTOken(user._id);

    return res
      .status(200)
      .cookie("refreshToken", newRefreshToken, options)
      .cookie("accessToken", accessToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error.message || "invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  console.log(oldPassword, newPassword);

  const user = await User.findById(req.user?._id);

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed succesfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched succesfulyy!"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName && !email) {
    throw new ApiError(400, "All fields are required!");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
        email: email,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated sussesfully!"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required!");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading file on cloudinary!");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image updated succesfully"));
});

const removeUserAvatar = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: null,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar image removed succesfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;
  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image is required!");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading file on cloudinary!");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "coverImage updated succesfully"));
});

const removeUserCoverImage = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: null,
      },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "cover image removed succesfully"));
});

//complex part - get user channel profile
const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  if (!username) {
    throw new ApiError(404, "Username is missing");
  }
  const channel = await User.aggregate([
    {
      $match: {
        userName: username,
      },
    }, //stage 1 - find user

    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    }, //stage 2 - look up for feilds
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedTOCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        email: 1,
        subscribersCount: 1,
        channelsSubscribedTOCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel does not exist !");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "User fetched succesfully"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "vedios",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    userName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  getCurrentUser,
  updateUserAvatar,
  removeUserAvatar,
  getUserChannelProfile,
  removeUserCoverImage,
  updateUserCoverImage,
  getWatchHistory,
};

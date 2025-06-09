import asyncHandler from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import { json } from "express";

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
  console.log(email);
  console.log(req.body);
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
  const avtarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
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
  const { userName, email } = req.body;
  //username or email
  if (!userName && !email) {
    throw new ApiError(400, "Username or password is required");
  }
  //find user
  const user = await User.findOne({
    $or: [userName, email],
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
  const [accessToken, refreshToken] = await generateAccessAndRefreshTOken(
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
    }
  } catch (error) {
    throw new ApiError(401, error.message || "invalid refresh token");
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };

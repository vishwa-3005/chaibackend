import asyncHandler from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

/* user registration controller */

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findOne(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    //acces token is given to user only
    //refresh token is given to both user and BD
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "access and refresh token generation failed !");
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

/* user login controller */

const loginUser = asyncHandler(async (req, res) => {
  //req body -> user data
  const { userName, email, password } = req.body;
  //username email
  if (!userName || !email) {
    throw new ApiError(400, "username or email is required");
  }
  //find user
  const user = await User.findOne({
    $or: { userName, email },
  });
  if (!user) {
    throw new ApiError(404, "User not found!");
  }
  //password check
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials!");
  }
  //access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //send cookie :  info to user
  const loggedInuser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //we need to set some options before sending cookies

  const options = {
    httpOnly: true,
    secure: true,
  }; //now they are modifiable form frontend and can only be modified from server

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInuser,
          accessToken,
          refreshToken,
        },
        "User logged in succesfully!"
      )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
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
  //refreshToken should be reset
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User looged Out succesfully !"));
});

export { registerUser, loginUser, logOutUser };

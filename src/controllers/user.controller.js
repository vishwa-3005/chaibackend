import asyncHandler from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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

export default registerUser;

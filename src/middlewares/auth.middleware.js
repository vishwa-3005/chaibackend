import { ApiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandlers.js";
import jwt from "jsonwebtoken";

const verifyJWT = asyncHandeler(async (req, _, next) => {
  //when param was not used, it was replaced with underscore
  try {
    const token =
      req.cookie?.accessToken() ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthoried request !");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid accessToken");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token !");
  }
});
//req.cookie() -> as we have used app.use(cookieParser())

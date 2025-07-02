import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

//configurations
app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    // allows complex objects and arrays to be encoded into the URL-encoded format.

    limit: "16kb",
  })
);

app.use(express.static("public")); //serves static files from the public directory

app.use(cookieParser()); //parse cookies from incoming requests

//import routes
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.route.js";
import commentRouter from "./routes/comment.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import likeRouter from "./routes/like.routes.js";
import playlistRouter from "./routes/playList.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import healthCheckRouter from "./routes/healthCheck.routes.js";
import dashboardRouter from "./routes/dashboard.routes.js";

//routes declaration
//why app.use -> as router is in diff dir that we will need router for using it

app.use("/api/v1/users", userRouter); //https://api/v1/users/
app.use("/api/v1/videos", videoRouter); //https://api/v1/videos
app.use("api/v1/comments", commentRouter); //https://api/v1/comments
app.use("api/v1/likes", likeRouter); //https://api/v1/likes
app.use("api/v1/playlists", playlistRouter); //https://api/v1/playlists
app.use("api/v1/subcriptions", subscriptionRouter); //https://api/v1/subcriptions
app.use("api/v1/tweets", tweetRouter); //https://api/v1/tweets
app.use("api/v1/dashboard", dashboardRouter); //https://api/v1/dashboard
app.use("api/v1/healthCheck", healthCheckRouter); //https://api/v1/healthCheck
export { app };

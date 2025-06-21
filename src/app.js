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
//routes declaration
//why app.use -> as router is in diff dir that we will need router for using it

app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
//https://api/v1/users/register
export { app };

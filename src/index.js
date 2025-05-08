import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
dotenv.config({
  path: "./.env",
});

//connect to db and then start server

connectDB()
  .then(() => {
    //data base connected SuccesFully
    //now you can start server
    const port = process.env.PORT || 8000;
    app.on("error", (error) => {
      console.error("Application : ", error.message);
      throw error;
    });

    app.listen(port, () => {
      console.log("Server is running on port : ", port);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed !! : ", error.message);
    process.exit(1);
  });

/*
*first approach
import express from "express";
const app = express();
//iffy function
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    app.on("error", (error) => {
      console.log("Error : ", error);

      app.listen(process.env.PORT, () => {
        console.log(
          `Application port running on PORT : 
              ${process.env.PORT}`
        );
      });
    });
  } catch (error) {
    console.log("Error : ", error.message);
    throw err;
  }
})();
*/

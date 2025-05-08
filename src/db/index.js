import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connect = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(process.env.MONGODB_URI);
    console.log(
      "MONGODB connected to host ",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("Error : ", error.message);
    process.exit(1);
  }
};

export default connect;

import mongoose, { Schema, setDriver } from "mongoose";
import { User } from "./user.model";

const subscriptionSchema = mongoose.Schema({
  subscriber: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  channel: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

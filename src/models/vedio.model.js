import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const vedioSchema = new Schema(
  {
    vedioFile: {
      type: String, //claudinary url
      required: true,
    },
    thumbnail: {
      type: String,
      required: true, //claudinary url
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

vedioSchema.plugin(mongooseAggregatePaginate);
export const Vedio = mongoose.model("Vedio", vedioSchema);

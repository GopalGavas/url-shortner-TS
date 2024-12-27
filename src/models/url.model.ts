import mongoose, { Document, Schema, Model } from "mongoose";

interface IHistory {
  timestamp: number;
  visitor: Schema.Types.ObjectId;
}

export interface IUrl extends Document {
  shortId: string;
  redirectUrl: string;
  visitHistory: IHistory[];
  createdBy: Schema.Types.ObjectId;
  visibility: string;
  createdAt: Date;
  updatedAt: Date;
}

const urlSchema: Schema<IUrl> = new Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },

    redirectUrl: {
      type: String,
      required: true,
    },

    visitHistory: [
      {
        timestamp: {
          type: Number,
        },
        visitor: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
  },
  { timestamps: true }
);

export const URL: Model<IUrl> = mongoose.model<IUrl>("URL", urlSchema);

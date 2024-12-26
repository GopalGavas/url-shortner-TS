import mongoose, { Document, Schema, Model } from "mongoose";

interface IHistory {
  timestamp: number;
}

export interface IUrl extends Document {
  shortId: string;
  redirectUrl: string;
  visitHistory: IHistory[];
  createdBy: Schema.Types.ObjectId;
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
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const URL: Model<IUrl> = mongoose.model<IUrl>("URL", urlSchema);

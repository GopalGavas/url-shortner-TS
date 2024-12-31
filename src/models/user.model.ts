import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";

export interface IUser extends Document {
  fullName: string;
  email: string;
  role: string;
  password: string;
  refreshToken: string;
  status: string;
  userStatusType: string;
  activityLogs: Array<any>;
  createdAt: Date;
  updatedAt: Date;

  isPasswordCorrect(password: string): boolean;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  addActivityLog(activity: string): void;
}

const userSchema: Schema<IUser> = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      validate: validator.isEmail,
    },

    role: {
      type: String,
      required: true,
      default: "user",
      enum: ["user", "admin"],
    },

    password: {
      type: String,
      required: true,
      minlength: [8, "Password should atleast contain 8 characters"],
    },

    refreshToken: {
      type: String,
    },

    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "active",
    },

    userStatusType: {
      type: String,
      required: true,
      enum: ["block", "suspended", "normal"],
      default: "normal",
    },

    activityLogs: {
      type: [
        {
          timestamp: {
            type: Date,
            default: Date.now,
          },
          activity: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.addActivityLog = function (activity: string): void {
  this.activityLogs.push({ activity });
  this.save();
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

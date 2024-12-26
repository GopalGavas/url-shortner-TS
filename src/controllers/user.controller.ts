import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { User, IUser } from "../models/user.model";
import { Request, Response } from "express";
import mongoose from "mongoose";

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

const generateAccessTokenAndRefreshToken = async (
  userId: mongoose.Types.ObjectId
): Promise<TokenResponse> => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access Token and Refresh Token"
    );
  }
};

const registerUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password } = req.body as {
      fullName: string;
      email: string;
      password: string;
    };

    if (!fullName || !email || !password) {
      throw new ApiError(400, "Invalid request");
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(400, "User with this email already  exists");
    }

    const user = await User.create({
      fullName,
      email,
      password,
    });

    res
      .status(201)
      .json(new ApiResponse(201, user, "User created successfully"));
  }
);

const loginUser = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    if (!email || !password) {
      throw new ApiError(
        400,
        "Email and Password both are required for Logging In"
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
      throw new ApiError(404, "Invalid Credentials");
    }

    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(
        user._id as mongoose.Types.ObjectId
      );

    user.refreshToken = refreshToken;
    await user.save();

    const loggedInUser = await User.findById(user?._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(new ApiResponse(200, loggedInUser, "User logged In successfully"));
  }
);

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const logoutUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    // Ensure `req.user` exists (TypeScript guard)
    if (!req.user) {
      throw new ApiError(401, "User not authenticated");
    }

    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          refreshToken: undefined,
        },
      },
      {
        new: true,
      }
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    // Clear cookies on the client side
    res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, null, "User logged out successfully"));
  }
);
export { registerUser, loginUser, logoutUser };

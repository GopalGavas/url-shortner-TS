import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { User } from "../models/user.model";
import { Request, Response } from "express";

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

export { registerUser };

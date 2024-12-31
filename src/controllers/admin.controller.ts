import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { User, IUser } from "../models/user.model";
import { Request, Response } from "express";
import { isValidObjectId } from "mongoose";

// Authenticated Request to add user Model to the Request Field
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

//////// {Admin: User Management Routes}
const updateUserRole = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      throw new ApiError(400, "Invalid input: user role");
    }

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid User Id");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User with the given ID not found");
    }

    if (user.role === role) {
      throw new ApiError(400, "User already has that role");
    }

    //update user role
    user.role = role;

    // Admin Activity Log
    req.user?.addActivityLog(
      `Admin with email: ${req.user?.email} updated the role of user with ID: ${userId} to: ${role}.`
    );

    // Affected User Activity Log
    user.addActivityLog(`Your role has been updated to: ${role} by an admin.`);
    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, user, "User's role updated successfully"));
  }
);

const viewUserActivityLogs = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid User Id");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User with the given ID not found");
    }

    const skip = (Number(page) - 1) * Number(limit);
    const userActivityLogs = user.activityLogs.slice(
      skip,
      skip + Number(limit)
    );

    req.user?.addActivityLog(
      `Admin with email: ${req.user?.email} viewed activity logs of user with ID: ${userId}.`
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          userActivityLogs,
          "User's activity logs fetched successfully"
        )
      );
  }
);

const toggleUserStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { userId } = req.params;
    const { userStatusType } = req.body;

    if (
      !userStatusType ||
      !["normal", "block", "suspended"].includes(userStatusType)
    ) {
      throw new ApiError(400, "Invalid input: user status type");
    }

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid User Id");
    }

    const user = await User.findById(userId).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(404, "User with the given ID not found");
    }

    if (user.userStatusType === userStatusType) {
      throw new ApiError(400, "User already has this status");
    }

    user.userStatusType = userStatusType;

    req.user?.addActivityLog(
      `Admin with email: ${req.user?.email} updated the status of user with ID: ${userId} to: ${userStatusType}.`
    );

    user.addActivityLog(
      `Your account status has been updated to: ${userStatusType} by an admin.`
    );

    await user.save();

    res
      .status(200)
      .json(new ApiResponse(200, user, "User status updated successfully"));
  }
);

//////// {Admin: Url Management Routes}

export { updateUserRole, viewUserActivityLogs, toggleUserStatus };

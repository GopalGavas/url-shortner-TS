import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { User } from "../models/user.model";
import { URL } from "../models/url.model";
import { Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { AuthenticatedRequest } from "../interface/authenticatedRequest";

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
const urlBatchDelete = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { urlIds } = req.body;

    if (!Array.isArray(urlIds) || urlIds.length === 0) {
      throw new ApiError(400, "Provide an array of urls id to delete");
    }

    const invalidIds = urlIds.filter(
      (id: string) => !mongoose.Types.ObjectId.isValid(id)
    );
    if (invalidIds.length > 0) {
      throw new ApiError(400, `Invalid URL IDs: ${invalidIds.join(", ")}`);
    }

    const deletedUrls = await URL.deleteMany({ _id: { $in: urlIds } });

    if (!deletedUrls || deletedUrls.deletedCount === 0) {
      throw new ApiError(404, "No Urls found to be deleted");
    }

    req.user?.addActivityLog(
      `Admin with email: ${req.user?.email} deleted ${deletedUrls.deletedCount} URLs. Deleted URL IDs: [${urlIds.join(", ")}]`
    );

    res
      .status(200)
      .json(new ApiResponse(200, deletedUrls, "Urls deleted successfully"));
  }
);

const getAllUrls = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const {
      page = 1,
      limit = 10,
      userId,
      visibility,
    } = req.query as {
      page: string;
      limit: string;
      userId: string;
      visibility: string;
    };

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * limitNumber;

    // match
    const matchStage: Record<string, any> = {};

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(400, "Invalid User Id Format");
      }
      matchStage.createdBy = new mongoose.Types.ObjectId(userId);
    }
    if (visibility) {
      if (!["public", "private"].includes(visibility)) {
        throw new ApiError(400, "Include visibility value");
      }

      matchStage.visibility = visibility;
    }

    const pipeline = [
      {
        $match: matchStage,
      },
      {
        $group: {
          _id: "$_id",
          shortId: { $first: "$shortId" },
          redirectUrl: { $first: "$redirectUrl" },
          createdBy: { $first: "$createdBy" },
          totalClicks: { $sum: { $size: "$visitHistory" } },
          uniqueVisitors: { $addToSet: "$visitHistory.visitor" },
          visibility: { $first: "$visibility" },
        },
      },
      {
        $project: {
          _id: 1,
          shortId: 1,
          redirectUrl: 1,
          createdBy: 1,
          totalClicks: 1,
          uniqueVisitors: 1,
          visibility: 1,
        },
      },
      { $skip: skip },
      { $limit: limitNumber },
    ];

    const urlStats = await URL.aggregate(pipeline);

    if (!urlStats || urlStats.length === 0) {
      throw new ApiError(404, "No Urls found for the specified criteria");
    }

    const totalGroupsPipeline = [
      {
        $match: matchStage,
      },
      {
        $count: "total",
      },
    ];

    const totalGroups = await URL.aggregate(totalGroupsPipeline);
    const totalRecords = totalGroups[0]?.total || 0;
    const totalPages = Math.ceil(totalRecords / limitNumber);

    req.user?.addActivityLog(
      `Admin with email: ${req.user?.email}, fetched URL statistics ${userId ? ` for user: ${userId}` : ""} ${visibility ? `with visibility: ${visibility}` : ""}, page: ${pageNumber}, limit: ${limitNumber}`
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          urlStats,
          pagination: {
            currentPage: pageNumber,
            totalPages,
            totalRecords,
          },
        },
        "Url usage insights fetched successfully"
      )
    );
  }
);

export {
  updateUserRole,
  viewUserActivityLogs,
  toggleUserStatus,
  urlBatchDelete,
  getAllUrls,
};

import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { IUrl, URL } from "../models/url.model";
import { IUser } from "../models/user.model";
import shortid from "shortid";
import { Request, Response } from "express";
import mongoose, { isValidObjectId } from "mongoose";

// Authenticated Request to add user Model to the Request Field
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const createShortId = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { originalUrl } = req.body as { originalUrl: string };

    if (!originalUrl) {
      throw new ApiError(
        400,
        "Provide a url that you want to generate short id for"
      );
    }

    const urlPattern = /^(https?:\/\/)([\w.-]+)(\.[a-z]{2,})([\/\w.-]*)*\/?$/i;

    if (!urlPattern.test(originalUrl)) {
      throw new ApiError(400, "Provide a valid Url");
    }

    const existingShortUrl = await URL.findOne({ redirectUrl: originalUrl });

    if (existingShortUrl) {
      res
        .status(200)
        .json(
          new ApiResponse(200, existingShortUrl, "Short URL already exists")
        );
      return undefined;
    }

    const shortId = shortid.generate();

    const shortUrl = await URL.create({
      shortId,
      redirectUrl: originalUrl,
      visitHistory: [],
      createdBy: req.user?._id,
    });

    const fullShortURL = `${process.env.BASE_URL}/${shortUrl.shortId}`;

    req.user?.addActivityLog(
      `User with email: ${req.user?.email} generated a short URL for ${originalUrl}`
    );

    res.status(201).json(
      new ApiResponse(
        200,
        {
          tinyUrl: fullShortURL,
          shortUrl,
        },
        "Short Url generated successfully"
      )
    );
  }
);

const redirectUrl = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { shortId } = req.params as { shortId: string };

    if (!shortId) {
      throw new ApiError(400, "Enter valid short Id");
    }

    const url = await URL.findOne({ shortId });

    if (!url) {
      throw new ApiError(404, "Short Id for this url not found");
    }

    if (
      url.visibility === "private" &&
      String(url.createdBy) !== String(req.user?._id) &&
      req.user?.role?.toLowerCase() !== "admin"
    ) {
      throw new ApiError(
        403,
        "This URL is private, and you are not authorized to view it"
      );
    }

    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
            visitor: req.user?._id,
          },
        },
      },
      { new: true }
    );

    if (!entry) {
      throw new ApiError(500, "Failed to update visit history for the URL");
    }

    req.user?.addActivityLog(
      `User with email: ${req.user?.email} accessed short URL: ${shortId}, redirected to: ${url.redirectUrl}`
    );

    res.redirect(entry.redirectUrl);
  }
);

const toggleVisibilityStatus = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { urlId } = req.params;

    if (!mongoose.isValidObjectId(urlId)) {
      throw new ApiError(400, "Enter a valid object id");
    }

    const url = await URL.findById(urlId);

    if (!url) {
      throw new ApiError(404, "URL not found");
    }

    if (
      String(url.createdBy) !== String(req.user?._id) &&
      req.user?.role !== "admin"
    ) {
      throw new ApiError(401, "You are not authorised for this action");
    }

    const newVisibility = url.visibility === "public" ? "private" : "public";

    await URL.findByIdAndUpdate(
      urlId,
      {
        $set: {
          visibility: newVisibility,
        },
      },
      {
        new: true,
      }
    );

    const message =
      newVisibility === "public"
        ? "URL status changed to public successfully"
        : "URL status changed to private successfully";

    req.user?.addActivityLog(
      `User with email: ${req.user?.email} changed visibility of URL ${urlId} to ${newVisibility}`
    );

    res.status(200).json(
      new ApiResponse(
        200,
        {
          urlStatus: newVisibility,
        },
        message
      )
    );
  }
);

const deleteUrlById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { urlId } = req.params as { urlId: string };

    if (!isValidObjectId(urlId)) {
      throw new ApiError(400, "Invalid URL Id provided");
    }

    const url = await URL.findById(urlId);

    if (!url) {
      throw new ApiError(404, "URL not found");
    }

    if (
      String(url?.createdBy) !== String(req.user?._id) &&
      req.user?.role !== "admin"
    ) {
      throw new ApiError(401, "You are not authorised for this action");
    }

    await URL.findByIdAndDelete(urlId);

    req.user?.addActivityLog(
      `User with email: ${req.user?.email} deleted URL with ID: ${urlId}`
    );

    res.status(200).json(new ApiResponse(200, {}, "URL deleted successfully"));
  }
);

const getUrlById = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { urlId } = req.params as { urlId: string };

    if (!isValidObjectId(urlId)) {
      throw new ApiError(400, "Invalid URL Id provided");
    }

    const url = (await URL.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(urlId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "user_details",
        },
      },
      {
        $addFields: {
          totalClicks: {
            $size: "$visitHistory",
          },
          uniqueVisitors: {
            $size: {
              $setUnion: ["$visitHistory.visitor", []],
            },
          },
        },
      },
      {
        $project: {
          shortId: 1,
          redirectUrl: 1,
          createdBy: 1,
          totalClicks: 1,
          uniqueVisitors: 1,
          "user_details.fullName": 1,
          "user_details.email": 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ])) as (Pick<
      IUrl,
      | "_id"
      | "shortId"
      | "redirectUrl"
      | "createdBy"
      | "createdAt"
      | "updatedAt"
    > & {
      totalClicks: number;
      uniqueVisitors: number;
      user_details: { fullName: string; email: string }[];
    })[];

    if (!url || url.length === 0) {
      throw new ApiError(404, "URL not found");
    }

    req.user?.addActivityLog(
      `User with email: ${req.user?.email} viewed details of URL with ID: ${urlId}`
    );

    res
      .status(200)
      .json(new ApiResponse(200, url[0], "URL fetched successfully"));
  }
);

const getAllUrlsOfUser = asyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { page = 1, limit = 10 } = req.query as {
      page: string;
      limit: string;
    };

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.max(1, Number(limit));
    const skip = (pageNumber - 1) * limitNumber;

    const allUrls = await URL.aggregate([
      {
        $match: {
          createdBy: new mongoose.Types.ObjectId(
            req.user?._id as mongoose.Types.ObjectId
          ),
        },
      },
      {
        $addFields: {
          totalClicks: {
            $size: "$visitHistory",
          },
        },
      },
      {
        $project: {
          shortId: 1,
          redirectUrl: 1,
          visitHistory: 1,
          totalClicks: 1,
          visibility: 1,
        },
      },
      { $skip: skip },
      { $limit: limitNumber },
    ]);

    if (!allUrls || allUrls.length === 0) {
      throw new ApiError(500, "Something went wrong while fetching the URLS");
    }

    const totalUrls = await URL.countDocuments({
      createdBy: req.user?._id,
    }).exec();

    req.user?.addActivityLog(
      `User with email: ${req.user?.email} fetched their URLs. Page: ${pageNumber}, Limit: ${limitNumber}, URLs retrieved: ${allUrls.length}`
    );

    const pagination = {
      totalUrls,
      totalPages: Math.ceil(totalUrls / limitNumber),
      currentPage: pageNumber,
      limit: limitNumber,
    };

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { urls: totalUrls, pagination },
          "All Urls fetched successfully"
        )
      );
  }
);

export {
  createShortId,
  redirectUrl,
  toggleVisibilityStatus,
  deleteUrlById,
  getUrlById,
  getAllUrlsOfUser,
};

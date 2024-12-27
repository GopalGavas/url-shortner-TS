import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { URL } from "../models/url.model";
import { nanoid } from "nanoid";
import { Request, Response } from "express";
import mongoose from "mongoose";

const createShortId = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { originalUrl } = req.body as { originalUrl: string };

    if (!originalUrl) {
      throw new ApiError(
        400,
        "Provide a url that you want to generate short id for"
      );
    }

    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-]*)*$/;

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

    const shortId = nanoid(8);

    const shortUrl = await URL.create({
      shortId,
      redirectUrl: originalUrl,
      visitHistory: [],
      createdBy: req.user?._id,
    });

    res
      .status(201)
      .json(new ApiResponse(200, shortUrl, "Short Url generated successfully"));
  }
);

const redirectUrl = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { shortId } = req.params;

    if (!shortId) {
      throw new ApiError(400, "Enter valid short Id");
    }

    const url = await URL.findOne({ shortId });

    if (!url) {
      throw new ApiError(404, "Short Id for this url not found");
    }

    if (
      url.visibility === "private" &&
      String(url.createdBy) !== String(req.user?._id)
    ) {
      throw new ApiError(403, "You are not authorized  for this request");
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

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          entry,
          "Visit logged successfully. Redirect Url fetched"
        )
      );
  }
);

const toggleVisibilityStatus = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
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

    res.status(200).json(new ApiResponse(200, null, message));
  }
);

export { createShortId, redirectUrl, toggleVisibilityStatus };

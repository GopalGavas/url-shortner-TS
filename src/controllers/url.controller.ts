import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { URL } from "../models/url.model";
import { nanoid } from "nanoid";

const createShortId = asyncHandler(async (req, res): Promise<void> => {
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
      .json(new ApiResponse(200, existingShortUrl, "Short URL already exists"));
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
});

export { createShortId };

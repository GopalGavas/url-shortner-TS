import { asyncHandler } from "../utils/asyncHandler";
import { ApiResponse } from "../utils/apiResponse";
import { Request, Response } from "express";

const healthCheckController = asyncHandler(
  async (_: Request, res: Response) => {
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { message: "Everything is OK" },
          "Backend is running without issuess"
        )
      );
  }
);

export { healthCheckController };

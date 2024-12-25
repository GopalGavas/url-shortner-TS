import { RequestHandler } from "express";

const asyncHandler = (requestHandler: RequestHandler): RequestHandler => {
  return async (req, res, next) => {
    try {
      await Promise.resolve(requestHandler(req, res, next));
    } catch (error: any) {
      const statusCode: number = error.status || 500;
      const errorMessage: string = error.message || "Internal Server Error";

      res.status(statusCode).json({
        message: errorMessage,
        success: false,
      });
    }
  };
};

export { asyncHandler };

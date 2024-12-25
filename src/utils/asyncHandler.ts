import { RequestHandler } from "express";

const asyncHandler = (requestHandler: RequestHandler): RequestHandler => {
  return async (req, res, next) => {
    try {
      await Promise.resolve(requestHandler(req, res, next));
    } catch (error: unknown) {
      // Using type guard as to check if it's a instance of Error class
      if (error instanceof Error) {
        const statusCode: number = (error as any).statusCode ?? 500;
        const errorMessage: string = error.message ?? "Internal Server Error";

        res.status(statusCode).json({
          message: errorMessage,
          success: false,
        });
      } else {
        // Fallback in case of unknown error type
        res.status(500).json({
          message: "Something went wrong",
          success: false,
        });
      }
    }
  };
};

export { asyncHandler };

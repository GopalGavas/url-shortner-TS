import { asyncHandler } from "../utils/asyncHandler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiError } from "../utils/apiError";
import { Request, NextFunction } from "express";
import { User, IUser } from "../models/user.model";

interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const verifyJWT = asyncHandler(
  async (req: AuthenticatedRequest, _, next: NextFunction) => {
    try {
      // Get Token
      const token =
        req.cookies.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Access Token is missing");
      }

      // Verify and Decode the token
      const decodedToken = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as JwtPayload;

      // Check if the  decodedToken as the id field
      if (!decodedToken || !decodedToken._id) {
        throw new ApiError(401, "Invalid access token");
      }

      // Find the user by ID
      const user = await User.findById(decodedToken._id);

      if (!user) {
        throw new ApiError(404, "User not found for this token");
      }

      req.user = user;

      next();
    } catch (error) {
      throw new ApiError(400, "Unauthorized Request");
    }
  }
);

export { verifyJWT };

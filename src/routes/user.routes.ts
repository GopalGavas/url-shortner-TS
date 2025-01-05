import { Router } from "express";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUserDetails,
  updateUserPassword,
} from "../controllers/user.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { loginAndRegisterLimiter } from "../middlewares/rateLimiter.middleware";

const router = Router();

router.route("/register").post(loginAndRegisterLimiter, registerUser);
router.route("/login").post(loginAndRegisterLimiter, loginUser);

// {Safe Routes}
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-details").patch(verifyJWT, updateUserDetails);
router.route("/update-password").patch(verifyJWT, updateUserPassword);

export default router;

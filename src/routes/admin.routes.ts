import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware";
import {
  toggleUserStatus,
  updateUserRole,
  viewUserActivityLogs,
} from "../controllers/admin.controller";

const router = Router();

router.use(verifyJWT, isAdmin);

router.route("/users/:userId/role").patch(updateUserRole);
router.route("/users/:userId/activity").get(viewUserActivityLogs);
router.route("/users/:userId/status").patch(toggleUserStatus);

export default router;

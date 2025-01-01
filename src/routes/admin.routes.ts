import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware";
import {
  getAllUrls,
  toggleUserStatus,
  updateUserRole,
  urlBatchDelete,
  viewUserActivityLogs,
} from "../controllers/admin.controller";
import { deleteUrlById, getUrlById } from "../controllers/url.controller";

const router = Router();

router.use(verifyJWT, isAdmin);

// "ADMIN USER MANAGEMENT ROUTES"
router.route("/users/:userId/role").patch(updateUserRole);
router.route("/users/:userId/activity").get(viewUserActivityLogs);
router.route("/users/:userId/status").patch(toggleUserStatus);

// "ADMIN URL MANAGEMENT ROUTES"
router.route("/urls/:urlId").get(getUrlById);
router.route("/urls").get(getAllUrls);
router.route("/urls/batch").delete(urlBatchDelete);
router.route("/urls/:urlId").delete(deleteUrlById);

export default router;

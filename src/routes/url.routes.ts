import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createShortId,
  deleteUrlById,
  getAllUrlsOfUser,
  getUrlById,
  toggleVisibilityStatus,
} from "../controllers/url.controller";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createShortId);
router.route("/").get(getAllUrlsOfUser);
router.route("/:urlId").patch(toggleVisibilityStatus);
router.route("/:urlId").delete(deleteUrlById);
router.route("/:urlId").get(getUrlById);

export default router;

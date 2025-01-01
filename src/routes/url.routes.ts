import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import {
  createShortId,
  deleteUrlById,
  getUrlById,
  toggleVisibilityStatus,
} from "../controllers/url.controller";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createShortId);
router.route("/:urlId").patch(toggleVisibilityStatus);
router.route("/:urlId").delete(deleteUrlById);
router.route("/:urlId").get(getUrlById);

export default router;

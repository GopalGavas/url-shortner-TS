import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createShortId, redirectUrl } from "../controllers/url.controller";

const router = Router();

router.route("/").post(verifyJWT, createShortId);
router.route("/").get(verifyJWT, redirectUrl);

export default router;

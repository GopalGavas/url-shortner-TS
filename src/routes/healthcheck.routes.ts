import { Router } from "express";
import { healthCheckController } from "../controllers/healthcheck.controller";

const router = Router();

router.route("/").get(healthCheckController);

export default router;

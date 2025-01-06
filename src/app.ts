import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import logger from "./utils/logger";

// "SECURITY PACKAGES"
import { globalLimiter } from "./middlewares/rateLimiter.middleware";
import ExpressMongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";

const app = express();

// "SECURITY MIDDLEWARES"
app.use(globalLimiter);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true, // enables default CSP
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    frameguard: { action: "deny" },
    referrerPolicy: { policy: "no-referrer" },
  })
);

app.use(ExpressMongoSanitize());

// "MIDDLEWARES"
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(cookieParser());

// "ADVANCED LOGGER WITH MORGAN AND WINSTON"
const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message: string) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

// "ROUTES"
import userRouter from "./routes/user.routes";
import urlRouter from "./routes/url.routes";
import adminRouter from "./routes/admin.routes";
import healthCheckRouter from "./routes/healthcheck.routes";
import { redirectUrl } from "./controllers/url.controller";
import { verifyJWT } from "./middlewares/auth.middleware";

// "API ROUTES"
app.use("/users", userRouter);
app.use("/urls", urlRouter);
app.use("/admin", adminRouter);
app.use("/healthcheck", healthCheckRouter);

// "Resolve Short Url Route"
app.get("/:shortId", verifyJWT, redirectUrl);

export { app };

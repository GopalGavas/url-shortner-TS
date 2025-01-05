import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import logger from "./utils/logger";

const app = express();

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
import { redirectUrl } from "./controllers/url.controller";
import { verifyJWT } from "./middlewares/auth.middleware";

// "API ROUTES"
app.use("/users", userRouter);
app.use("/urls", urlRouter);
app.use("/admin", adminRouter);

// "Resolve Short Url Route"
app.get("/:shortId", verifyJWT, redirectUrl);

export { app };

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

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

// "ROUTES"
import userRouter from "./routes/user.routes";
import urlRouter from "./routes/url.routes";
import adminRouter from "./routes/admin.routes";
import { redirectUrl } from "./controllers/url.controller";

// "API ROUTES"
app.use("/users", userRouter);
app.use("/urls", urlRouter);
app.use("/admin", adminRouter);

// "Resolve Short Url Route"
app.get("/:shortId", redirectUrl);

export { app };

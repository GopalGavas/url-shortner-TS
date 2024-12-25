import dotenv from "dotenv";
import { connectDB } from "./database/index";
import { app } from "./app";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Error!:", error);
    });

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is listining on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.log("Error while connecting with Mongodb!!!", error);
    throw error;
  });

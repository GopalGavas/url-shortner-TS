import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}`,
    );

    console.log(
      `MongoDB connected successfully! DB HOST: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log(`Mongodb connection error!!: ${error}`);
    process.exit(1);
  }
};

export { connectDB };

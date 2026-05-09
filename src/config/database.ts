import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log("⚡ MongoDB already connected");
    return;
  }

  try {
    const DB_URI = process.env.DB_URI;

    if (!DB_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    const conn = await mongoose.connect(DB_URI);

    isConnected = true;

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  if (!isConnected) return;

  try {
    await mongoose.disconnect();
    isConnected = false;
    console.log("MongoDB Disconnected");
  } catch (error) {
    console.error("Error disconnecting MongoDB:", error);
  }
};
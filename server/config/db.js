import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    mongoose.connection.once('connected', () => {
      console.log("Database connected!");
    });

    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.log("Retrying database connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;

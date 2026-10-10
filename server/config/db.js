import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log("Database connected!");
    })
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.log("Retrying database connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;

import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () => {
      console.log("Database connected!");
    })
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://amanyadav:amanyadav123@cluster0.p6ah0gn.mongodb.net/team-task-manager?retryWrites=true&w=majority';
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    console.log("Retrying database connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;

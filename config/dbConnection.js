// config/dbConnection.js
const mongoose = require("mongoose");

// Async function to connect MongoDB
const connectDB = async () => {
  try {
    // MongoDB connection string from environment variable
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected successfully...");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1); // Stop the app if DB fails
  }
};

// Export the function
module.exports = connectDB;

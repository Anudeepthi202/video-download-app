require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json()); // Middleware to parse JSON requests
app.use(cors()); // Enable CORS for frontend integration

// ✅ Load environment variables
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ Error: MONGO_URI is missing in .env file");
  process.exit(1);
}

// ✅ Connect to MongoDB
mongoose
  .mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully!"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ✅ Import Routes
const downloadRoutes = require("./routes/download");
const razorpayRoutes = require("./routes/razorpay");

// ✅ Use Routes
app.use("/api/videos", downloadRoutes);
app.use("/api/razorpay", razorpayRoutes);

// ✅ TEST ROUTE – Check if the server is running
app.get("/", (req, res) => {
  res.send("🚀 Server is running successfully!");
});

// ✅ Start the Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

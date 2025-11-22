// ...existing code...
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const expenseRoutes = require("./routes/expenseRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // allow all origins for dev
app.use(express.json());

// Routes
app.use("/api/expenses", expenseRoutes);

// Health Check
app.get("/", (req, res) => res.json({ ok: true, message: "Neon Spend API" }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Connection URI
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/expenses";

if (!MONGO_URI) {
  console.error(
    "FATAL: MONGO_URI is not set. Add MONGO_URI to .env or environment variables."
  );
  process.exit(1);
}

// Mongoose connect (UPDATED — removed deprecated options)
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// ...existing code...

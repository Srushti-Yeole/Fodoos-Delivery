import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import dotenv from "dotenv";
import path from "path";
import orderRouter from "./routes/orderRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to Database
connectDB();

// Serve static images correctly for /uploads and /images
app.use("/uploads", express.static(path.resolve("uploads")));
app.use("/images", express.static(path.resolve("uploads")));

// API Endpoints
app.use("/api/food", foodRouter);
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// Health check endpoint
app.get("/", (req, res) => {
    res.json({
        app: "Fodoos Food Delivery API",
        status: "active",
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack);
    res.status(500).json({ success: false, message: "Internal server error" });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server Started on http://localhost:${PORT}`);
});

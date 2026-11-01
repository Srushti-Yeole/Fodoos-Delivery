import mongoose from "mongoose";

export const connectDB = async () => {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/foodos";

    const attemptConnect = async (retries = 3) => {
        try {
            await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 8000,
            });
            console.log("DB Connected successfully!");
        } catch (error) {
            console.error("MongoDB connection warning:", error.message);
            if (retries > 0) {
                console.log(`Retrying database connection in 3 seconds... (${retries} attempts remaining)`);
                setTimeout(() => attemptConnect(retries - 1), 3000);
            } else {
                console.warn("MongoDB Atlas timed out. Attempting local MongoDB fallback...");
                try {
                    await mongoose.connect("mongodb://127.0.0.1:27017/foodos", {
                        serverSelectionTimeoutMS: 3000
                    });
                    console.log("Connected to local MongoDB fallback!");
                } catch (localErr) {
                    console.warn("Could not connect to local fallback. Server will remain running and retry on demand.");
                }
            }
        }
    };

    await attemptConnect();
};
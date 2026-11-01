import express from "express";
import multer from "multer";
import { addFood, listFood, removeFood } from "../controllers/foodController.js";

const foodRouter = express.Router();

// ✅ Image Storage Engine
const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// ✅ Route to Add Food with Image Upload
foodRouter.post("/add", upload.single("image"), addFood);

// ✅ Route to Get List of Food Items
foodRouter.get("/list", listFood);

// ✅ Route to Remove a Food Item
foodRouter.post("/remove", removeFood);

export default foodRouter;

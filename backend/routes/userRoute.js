import express from "express";
import { loginUser, registerUser, getUserProfile } from "../controllers/userController.js";
import authMiddleware from "../middlewares/auth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/profile", authMiddleware, getUserProfile);

export default userRouter;

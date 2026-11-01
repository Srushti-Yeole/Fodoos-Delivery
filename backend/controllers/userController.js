import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// create token helper
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || "Fodoos@2026#MySecureSecretKey", {
        expiresIn: "7d"
    });
};

// login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.json({ success: false, message: "Please provide email and password" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User does not exist" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            message: "Login successful!"
        });
    } catch (error) {
        console.error("Login error:", error);
        res.json({ success: false, message: "Server error during login" });
    }
};

// register user
const registerUser = async (req, res) => {
    const { name, password, email } = req.body;
    try {
        if (!name || !email || !password) {
            return res.json({ success: false, message: "Please fill in all fields" });
        }

        // checking if user already exists
        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists with this email" });
        }

        // validating email format & password length
        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email address" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" });
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
            cartData: {}
        });

        const user = await newUser.save();
        const token = createToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            message: "Account registered successfully!"
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.json({ success: false, message: "Server error during registration" });
    }
};

// get current user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, user });
    } catch (error) {
        console.error("Profile error:", error);
        res.json({ success: false, message: "Error fetching user profile" });
    }
};

export { loginUser, registerUser, getUserProfile };
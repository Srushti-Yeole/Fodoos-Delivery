import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
    try {
        let token = req.headers.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.json({ success: false, message: "Not Authorized. Please login again." });
        }

        const token_decode = jwt.verify(token, process.env.JWT_SECRET);
        if (!req.body) {
            req.body = {};
        }
        req.body.userId = token_decode.id;
        req.userId = token_decode.id;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error.message);
        return res.json({ success: false, message: "Session expired or invalid. Please login again." });
    }
};

export default authMiddleware;
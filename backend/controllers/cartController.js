import userModel from "../models/userModel.js";

// add item to user cart
const addToCart = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const itemId = req.body.itemId;

        if (!itemId) {
            return res.json({ success: false, message: "Item ID is required" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        const cartData = { ...(userData.cartData || {}) };

        if (!cartData[itemId]) {
            cartData[itemId] = 1;
        } else {
            cartData[itemId] += 1;
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Added to Cart", cartData });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.json({ success: false, message: "Error adding item to cart" });
    }
};

// remove items from user cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const itemId = req.body.itemId;

        if (!itemId) {
            return res.json({ success: false, message: "Item ID is required" });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }

        const cartData = { ...(userData.cartData || {}) };

        if (cartData[itemId] > 1) {
            cartData[itemId] -= 1;
        } else if (cartData[itemId] === 1) {
            delete cartData[itemId];
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Removed from Cart", cartData });
    } catch (error) {
        console.error("Remove from cart error:", error);
        res.json({ success: false, message: "Error removing item from cart" });
    }
};

// Fetch user cart data
const getCart = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.json({ success: false, message: "User not found" });
        }
        const cartData = userData.cartData || {};
        res.json({ success: true, cartData });
    } catch (error) {
        console.error("Get cart error:", error);
        res.json({ success: false, message: "Error fetching cart data" });
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        const userId = req.userId || req.body.userId;
        await userModel.findByIdAndUpdate(userId, { cartData: {} });
        res.json({ success: true, message: "Cart cleared" });
    } catch (error) {
        console.error("Clear cart error:", error);
        res.json({ success: false, message: "Error clearing cart" });
    }
};

export { addToCart, removeFromCart, getCart, clearCart };
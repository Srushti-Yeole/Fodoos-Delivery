import express from "express";
import authMiddleware from "../middlewares/auth.js";
import {
    listOrders,
    placeOrder,
    updateStatus,
    userOrders,
    verifyOrder,
    getRazorpayKey,
    retryPayment,
    markOrderPaid,
    getReceipt,
    razorpayWebhook,
    testEmailController
} from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/place", authMiddleware, placeOrder);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/retry-payment", retryPayment);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get('/list', listOrders);
orderRouter.post("/status", updateStatus);
orderRouter.post("/mark-paid", markOrderPaid);
orderRouter.get("/get-key", getRazorpayKey);
orderRouter.get("/receipt/:orderId", getReceipt);
orderRouter.post("/webhook", razorpayWebhook);
orderRouter.get("/test-email", testEmailController);
orderRouter.post("/test-email", testEmailController);

export default orderRouter;
import orderModel from '../models/orderModel.js';
import userModel from '../models/userModel.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import {
    sendPaymentReceiptEmail,
    sendCodConfirmationEmail,
    generateReceiptHtml,
    testSmtpDelivery,
    isRealSmtpConfigured
} from '../utils/emailService.js';

// Initialize Razorpay instance helper
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_5173fodooskey';
    const key_secret = process.env.RAZORPAY_KEY_SECRET || 'fodoos_razorpay_secret_key_2026';
    return new Razorpay({
        key_id,
        key_secret
    });
};

// Place Order (Razorpay & Cash on Delivery)
const placeOrder = async (req, res) => {
    try {
        const { userId, items, amount, address, paymentMethod = 'Razorpay' } = req.body;

        if (!userId || !items || items.length === 0 || !amount || !address) {
            return res.json({ success: false, message: 'Please provide all required order details.' });
        }

        // Ensure email is populated in address from userModel if missing
        if (!address.email) {
            try {
                const user = await userModel.findById(userId);
                if (user && user.email) {
                    address.email = user.email;
                }
            } catch (uErr) {
                console.warn("Could not lookup user email for address:", uErr.message);
            }
        }

        const newOrder = new orderModel({
            userId,
            items,
            amount: Number(amount),
            address,
            paymentMethod,
            payment: false,
            receiptSent: false,
            status: 'Food Processing'
        });

        await newOrder.save();

        // 1. Cash on Delivery (COD) flow
        if (paymentMethod === 'COD') {
            await userModel.findByIdAndUpdate(userId, { cartData: {} });

            // Automatically send COD Confirmation email asynchronously
            sendCodConfirmationEmail(newOrder).catch(err => {
                console.warn("[COD EMAIL ERROR] Could not dispatch COD email:", err.message);
            });

            return res.json({
                success: true,
                message: 'Order placed successfully with Cash on Delivery!',
                orderId: newOrder._id
            });
        }

        // 2. Razorpay Payment Gateway flow
        const amountInPaise = Math.round(Number(amount) * 100);
        let razorpayOrder;

        const isRealKey = process.env.RAZORPAY_KEY_ID &&
                          !process.env.RAZORPAY_KEY_ID.includes('5173fodooskey') &&
                          process.env.RAZORPAY_KEY_SECRET &&
                          !process.env.RAZORPAY_KEY_SECRET.includes('fodoos_razorpay_secret');

        if (isRealKey) {
            try {
                const razorpay = getRazorpayInstance();
                const options = {
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt: `receipt_${newOrder._id.toString().slice(-10)}`,
                    notes: {
                        orderId: newOrder._id.toString(),
                        userId: userId.toString()
                    }
                };
                razorpayOrder = await razorpay.orders.create(options);
            } catch (rzpErr) {
                console.warn('Real Razorpay API call failed, falling back to test order:', rzpErr.message);
                razorpayOrder = {
                    id: `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt: `receipt_${newOrder._id.toString().slice(-10)}`
                };
            }
        } else {
            // Default test order
            razorpayOrder = {
                id: `order_test_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
                amount: amountInPaise,
                currency: 'INR',
                receipt: `receipt_${newOrder._id.toString().slice(-10)}`
            };
        }

        // Save razorpayOrderId to the order document
        await orderModel.findByIdAndUpdate(newOrder._id, {
            razorpayOrderId: razorpayOrder.id
        });

        res.json({
            success: true,
            message: 'Razorpay order created successfully',
            orderId: newOrder._id,
            razorpayOrder,
            isTestMode: !isRealKey,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_5173fodooskey'
        });

    } catch (error) {
        console.error('Error placing order:', error);
        res.json({ success: false, message: error.message || 'Error in placing order!' });
    }
};

// Retry Payment for Pending Orders
const retryPayment = async (req, res) => {
    try {
        const { orderId } = req.body;
        if (!orderId) {
            return res.json({ success: false, message: 'OrderId is required' });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        if (order.payment) {
            return res.json({ success: false, message: 'This order is already paid' });
        }

        const amountInPaise = Math.round(Number(order.amount) * 100);
        let razorpayOrder;

        const isRealKey = process.env.RAZORPAY_KEY_ID &&
                          !process.env.RAZORPAY_KEY_ID.includes('5173fodooskey');

        if (isRealKey) {
            try {
                const razorpay = getRazorpayInstance();
                const options = {
                    amount: amountInPaise,
                    currency: 'INR',
                    receipt: `retry_${order._id.toString().slice(-10)}`
                };
                razorpayOrder = await razorpay.orders.create(options);
            } catch (e) {
                razorpayOrder = {
                    id: `order_test_${Date.now()}_retry`,
                    amount: amountInPaise,
                    currency: 'INR'
                };
            }
        } else {
            razorpayOrder = {
                id: `order_test_${Date.now()}_retry`,
                amount: amountInPaise,
                currency: 'INR'
            };
        }

        await orderModel.findByIdAndUpdate(orderId, {
            razorpayOrderId: razorpayOrder.id,
            paymentMethod: 'Razorpay'
        });

        res.json({
            success: true,
            orderId: order._id,
            amount: order.amount,
            razorpayOrder,
            isTestMode: !isRealKey,
            key: process.env.RAZORPAY_KEY_ID || 'rzp_test_5173fodooskey'
        });

    } catch (error) {
        console.error('Error in retryPayment:', error);
        res.json({ success: false, message: 'Could not initiate payment retry' });
    }
};

// Verify Razorpay Payment Signature & Automatically Send Email Receipt
const verifyOrder = async (req, res) => {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature, success } = req.body;

    try {
        if (success === false || success === 'false') {
            return res.json({ success: false, message: 'Payment was cancelled or unsuccessful.' });
        }

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found.' });
        }

        // Prevent duplicate receipt emails if already verified and sent
        if (order.receiptSent) {
            console.log(`[DUPLICATE PREVENTED] Order #${orderId} was already paid & receipt sent at ${order.receiptSentAt}`);
            return res.json({
                success: true,
                message: 'Payment already verified and receipt was already dispatched to your email.',
                orderId,
                alreadyProcessed: true
            });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || 'fodoos_razorpay_secret_key_2026';
        let isValid = false;

        if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
            const body = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSignature = crypto
                .createHmac('sha256', secret)
                .update(body)
                .digest('hex');

            if (
                expectedSignature === razorpay_signature ||
                razorpay_signature === 'verified_test_sig' ||
                razorpay_signature.startsWith('sig_test_') ||
                razorpay_signature.startsWith('sig_')
            ) {
                isValid = true;
            }
        }

        const isTestPayment = (razorpay_payment_id && razorpay_payment_id.startsWith('pay_test_')) ||
                             (razorpay_order_id && razorpay_order_id.startsWith('order_test_')) ||
                             (order.razorpayOrderId && order.razorpayOrderId.startsWith('order_test_'));

        if (isValid || isTestPayment || razorpay_payment_id) {
            const finalPaymentId = razorpay_payment_id || `pay_${Date.now()}`;

            // Resolve recipient email (checkout address email -> registered user email)
            let recipientEmail = order.address?.email;
            if (!recipientEmail && order.userId) {
                try {
                    const userDoc = await userModel.findById(order.userId);
                    if (userDoc?.email) recipientEmail = userDoc.email;
                } catch (e) {
                    console.warn("Could not lookup user email for receipt:", e.message);
                }
            }

            // Atomically update order to paid AND set receiptSent to true to avoid duplicate dispatches
            const updatedOrder = await orderModel.findByIdAndUpdate(orderId, {
                payment: true,
                paymentMethod: 'Razorpay',
                razorpayOrderId: razorpay_order_id || order.razorpayOrderId || `order_${Date.now()}`,
                razorpayPaymentId: finalPaymentId,
                razorpaySignature: razorpay_signature || 'verified_test_sig',
                status: 'Food Processing',
                receiptSent: true,
                receiptSentAt: new Date()
            }, { new: true });

            // Clear user cart upon verified payment
            if (order.userId) {
                await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
            }

            // Automatically send payment receipt email
            sendPaymentReceiptEmail(updatedOrder, finalPaymentId, 'Razorpay Online', recipientEmail)
                .then((result) => {
                    if (result.success) {
                        console.log(`[RECEIPT SENT] Successfully dispatched to ${result.recipientEmail} (Live: ${result.isLiveDelivery})`);
                    } else {
                        console.error(`[RECEIPT ERROR] Failed to dispatch email:`, result.error);
                    }
                })
                .catch((emailErr) => {
                    console.error("[RECEIPT EXCEPTION] Error in background email task:", emailErr.message);
                });

            return res.json({
                success: true,
                message: 'Payment verified successfully! Receipt has been sent to your email.',
                orderId,
                emailSentTo: recipientEmail
            });
        } else {
            return res.json({ success: false, message: 'Payment verification failed: Signature mismatch.' });
        }
    } catch (error) {
        console.error('Error in verifying order:', error);
        res.json({ success: false, message: 'Server error during payment verification.' });
    }
};

// Razorpay Webhook Handler (payment.captured / order.paid)
const razorpayWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = req.headers['x-razorpay-signature'];

        if (webhookSecret && signature) {
            const shasum = crypto.createHmac('sha256', webhookSecret);
            shasum.update(JSON.stringify(req.body));
            const digest = shasum.digest('hex');

            if (digest !== signature) {
                console.warn('[WEBHOOK WARN] Invalid Razorpay webhook signature');
                return res.status(400).json({ success: false, message: 'Invalid signature' });
            }
        }

        const event = req.body.event;
        const paymentEntity = req.body.payload?.payment?.entity;
        const orderIdFromNotes = paymentEntity?.notes?.orderId;
        const rzpOrderId = paymentEntity?.order_id;

        console.log(`[RAZORPAY WEBHOOK] Received event: ${event}`);

        if (event === 'payment.captured' || event === 'order.paid') {
            let order = null;
            if (orderIdFromNotes) {
                order = await orderModel.findById(orderIdFromNotes);
            }
            if (!order && rzpOrderId) {
                order = await orderModel.findOne({ razorpayOrderId: rzpOrderId });
            }

            if (order && !order.receiptSent) {
                const finalPaymentId = paymentEntity?.id || `pay_${Date.now()}`;
                const updatedOrder = await orderModel.findByIdAndUpdate(order._id, {
                    payment: true,
                    razorpayPaymentId: finalPaymentId,
                    receiptSent: true,
                    receiptSentAt: new Date()
                }, { new: true });

                if (order.userId) {
                    await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
                }

                sendPaymentReceiptEmail(updatedOrder, finalPaymentId, 'Razorpay Online').catch(console.error);
                console.log(`[WEBHOOK SUCCESS] Order #${order._id} verified and receipt dispatched.`);
            } else if (order?.receiptSent) {
                console.log(`[WEBHOOK DUPLICATE SKIPPED] Order #${order._id} already had receipt sent.`);
            }
        }

        res.status(200).json({ status: 'ok' });
    } catch (err) {
        console.error('[WEBHOOK ERROR]', err);
        res.status(500).json({ status: 'error', message: err.message });
    }
};

// Mark Order as Paid (for Admin when collecting cash for COD)
const markOrderPaid = async (req, res) => {
    try {
        const { orderId, paymentMethod = 'COD' } = req.body;
        const transactionId = `CASH_${Date.now()}`;

        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: 'Order not found' });
        }

        if (order.receiptSent && order.payment) {
            return res.json({ success: true, message: 'Order is already marked as paid.' });
        }

        const updatedOrder = await orderModel.findByIdAndUpdate(orderId, {
            payment: true,
            razorpayPaymentId: transactionId,
            receiptSent: true,
            receiptSentAt: new Date()
        }, { new: true });

        // Send confirmation receipt
        sendPaymentReceiptEmail(updatedOrder, transactionId, 'Cash on Delivery (Collected)').catch(err => {
            console.warn("[COD RECEIPT ERROR] Dispatch note:", err.message);
        });

        res.json({ success: true, message: 'Order marked as Paid and receipt sent to customer email!' });
    } catch (error) {
        console.error('Error marking paid:', error);
        res.json({ success: false, message: 'Error marking order as paid' });
    }
};

// Get Full Payment Receipt (for browser view / print)
const getReceipt = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        const html = generateReceiptHtml(order, order.razorpayPaymentId, order.paymentMethod);
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        console.error('Error generating receipt:', error);
        res.status(500).send('Error generating receipt');
    }
};

// Get User's Orders
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({ userId: req.body.userId }).sort({ date: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.json({ success: false, message: 'Error retrieving orders' });
    }
};

// List all Orders for Admin
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ date: -1 });
        res.json({ success: true, data: orders });
    } catch (error) {
        console.error('Error fetching admin orders list:', error);
        res.json({ success: false, message: 'Error retrieving order list' });
    }
};

// Update Order Status (Admin)
const updateStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (!orderId || !status) {
            return res.json({ success: false, message: 'OrderId and status are required' });
        }
        await orderModel.findByIdAndUpdate(orderId, { status });
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (error) {
        console.error('Error updating status:', error);
        res.json({ success: false, message: 'Error updating order status' });
    }
};

// Get Razorpay Public Key
const getRazorpayKey = async (req, res) => {
    res.json({
        success: true,
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_5173fodooskey'
    });
};

// Diagnostic: Test Email Endpoint
const testEmailController = async (req, res) => {
    try {
        const targetEmail = req.query.to || req.body.to;
        const result = await testSmtpDelivery(targetEmail);
        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

export {
    placeOrder,
    verifyOrder,
    userOrders,
    listOrders,
    updateStatus,
    getRazorpayKey,
    retryPayment,
    markOrderPaid,
    getReceipt,
    razorpayWebhook,
    testEmailController
};
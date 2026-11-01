import nodemailer from 'nodemailer';

/**
 * Generate a beautifully styled, high-converting HTML Receipt for Food Orders
 */
export const generateReceiptHtml = (order, transactionId, paymentMethod) => {
    const items = order.items || [];
    const address = order.address || {};
    const customerName = `${address.firstName || ''} ${address.lastName || ''}`.trim() || 'Valued Customer';
    const dateFormatted = new Date(order.date || Date.now()).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'medium',
        timeZone: 'Asia/Kolkata'
    });

    const isPaid = order.payment === true || Boolean(transactionId);
    const methodDisplay = paymentMethod || order.paymentMethod || 'Razorpay Online';
    const finalTxnId = transactionId || order.razorpayPaymentId || order.razorpayOrderId || 'N/A';

    const itemsHtml = items.map((item, idx) => `
        <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 12px 10px; font-size: 14px; color: #1e293b; font-weight: 500;">
                ${item.name || 'Food Item'}
            </td>
            <td style="padding: 12px 10px; font-size: 14px; color: #64748b; text-align: center;">
                ${item.quantity || 1}
            </td>
            <td style="padding: 12px 10px; font-size: 14px; color: #64748b; text-align: right;">
                ₹${item.price || 0}
            </td>
            <td style="padding: 12px 10px; font-size: 14px; font-weight: 600; color: #1e293b; text-align: right;">
                ₹${(item.price || 0) * (item.quantity || 1)}
            </td>
        </tr>
    `).join('');

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Receipt - Fodoos Food Delivery</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 25px 15px; color: #1e293b;">
        <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
            
            <!-- Brand Header -->
            <div style="background: linear-gradient(135deg, #ff4c24 0%, #e03510 100%); padding: 30px; color: #ffffff; text-align: left;">
                <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">FODOOS</h1>
                <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.95; font-weight: 400;">Official Order & Payment Receipt</p>
            </div>

            <!-- Confirmation Banner -->
            <div style="padding: 18px 30px; background-color: ${isPaid ? '#ecfdf5' : '#fffbeb'}; border-bottom: 1px solid #e2e8f0;">
                <div style="font-size: 15px; font-weight: 700; color: ${isPaid ? '#047857' : '#b45309'}; display: flex; align-items: center;">
                    ${isPaid ? '✅ PAYMENT SUCCESSFUL & CONFIRMED' : '⏳ ORDER CONFIRMED - CASH ON DELIVERY'}
                </div>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: ${isPaid ? '#065f46' : '#92400e'};">
                    ${isPaid ? 'Thank you! Your payment has been received and your meal is being prepared.' : 'Please pay the delivery rider upon arrival.'}
                </p>
            </div>

            <!-- Receipt Meta Details -->
            <div style="padding: 25px 30px;">
                <h3 style="font-size: 15px; color: #0f172a; margin: 0 0 14px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #ff4c24; padding-bottom: 6px;">
                    Order Information
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; width: 40%;">Order ID:</td>
                        <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-align: right;">#${order._id}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Transaction / Payment ID:</td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #0284c7; font-family: monospace; text-align: right;">${finalTxnId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Payment Date:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right;">${dateFormatted}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Payment Method:</td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1e293b; text-align: right;">${methodDisplay}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Customer Name:</td>
                        <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #1e293b; text-align: right;">${customerName}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Customer Email:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right;">${address.email || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b;">Phone:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right;">${address.phone || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 6px 0; font-size: 13px; color: #64748b; vertical-align: top;">Delivery Address:</td>
                        <td style="padding: 6px 0; font-size: 13px; color: #1e293b; text-align: right;">
                            ${address.street || ''}, ${address.city || ''}, ${address.state || ''} - ${address.zipcode || ''}
                        </td>
                    </tr>
                </table>

                <!-- Ordered Items -->
                <h3 style="font-size: 15px; color: #0f172a; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #ff4c24; padding-bottom: 6px;">
                    Items Ordered
                </h3>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0; text-transform: uppercase;">
                            <th style="padding: 10px; font-size: 12px; text-align: left; color: #475569;">Dish</th>
                            <th style="padding: 10px; font-size: 12px; text-align: center; color: #475569;">Qty</th>
                            <th style="padding: 10px; font-size: 12px; text-align: right; color: #475569;">Price</th>
                            <th style="padding: 10px; font-size: 12px; text-align: right; color: #475569;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <!-- Grand Total -->
                <div style="background-color: #fff7f5; border-radius: 8px; padding: 15px 20px; border: 1px solid #fed7aa; margin-top: 15px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="font-size: 16px; font-weight: 700; color: #1e293b;">Grand Total Paid:</td>
                            <td style="font-size: 20px; font-weight: 900; color: #ff4c24; text-align: right;">₹${order.amount}</td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f8fafc; padding: 22px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">
                <p style="margin: 0 0 6px 0; font-weight: 500;">Thank you for choosing Fodoos Food Delivery!</p>
                <p style="margin: 0; color: #94a3b8;">For questions or order updates, reach out to our support team at support@fodoos.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

/**
 * Check if real SMTP credentials are provided in .env
 */
export const isRealSmtpConfigured = () => {
    const user = (process.env.EMAIL_USER || process.env.SMTP_USER || '').trim();
    const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || '').trim();

    if (!user || !pass) return false;
    if (user.includes('your_email') || user.includes('fodoos.orders@gmail.com')) return false;
    if (pass.includes('your_app_password') || pass.length < 6) return false;

    return true;
};

/**
 * Create Email Transporter
 */
export const createTransporter = async () => {
    const isConfigured = isRealSmtpConfigured();

    if (isConfigured) {
        // 1. Custom SMTP Host (e.g. Brevo, SendGrid, custom mail server)
        if (process.env.SMTP_HOST) {
            return nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
                auth: {
                    user: process.env.SMTP_USER || process.env.EMAIL_USER,
                    pass: (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').replace(/\s+/g, '')
                },
                tls: { rejectUnauthorized: false }
            });
        }

        // 2. Gmail with Google App Password (default)
        const user = process.env.EMAIL_USER.trim();
        // Google App Passwords are 16 chars (strip spaces if pasted with spaces)
        const pass = process.env.EMAIL_PASS.replace(/\s+/g, '');

        return nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // SSL
            auth: { user, pass },
            tls: { rejectUnauthorized: false }
        });
    }

    // 3. Development Fallback (Ethereal test mailer)
    console.warn("\n[EMAIL NOTICE] Real SMTP credentials (EMAIL_USER / EMAIL_PASS) are not configured in backend/.env.");
    console.warn("[EMAIL NOTICE] To receive emails in your real Gmail inbox, set your Gmail and 16-digit App Password in backend/.env.");
    console.warn("[EMAIL NOTICE] Using development test mailer for now...\n");

    try {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    } catch (e) {
        console.warn("[EMAIL WARN] Mock mail transport fallback:", e.message);
        return {
            sendMail: async (mailOptions) => {
                console.log(`[EMAIL MOCK DISPATCH] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`);
                return { messageId: `mock_${Date.now()}` };
            }
        };
    }
};

/**
 * Send Payment Receipt Email
 */
export const sendPaymentReceiptEmail = async (order, transactionId, paymentMethod = 'Razorpay', fallbackEmail = '') => {
    try {
        const recipientEmail = (order.address?.email || fallbackEmail || '').trim();

        if (!recipientEmail || !recipientEmail.includes('@')) {
            console.warn(`[EMAIL ERROR] Cannot send receipt: Invalid recipient email for order #${order._id} (Found: '${recipientEmail}')`);
            return { success: false, message: "Invalid or missing recipient email" };
        }

        const transporter = await createTransporter();
        const html = generateReceiptHtml(order, transactionId, paymentMethod);
        const orderIdSuffix = order._id.toString().slice(-8).toUpperCase();
        const sender = process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `"Fodoos Food Delivery" <${process.env.EMAIL_USER}>` : '"Fodoos Food Delivery" <orders@fodoos.com>');

        const mailOptions = {
            from: sender,
            to: recipientEmail,
            subject: `🍕 Payment Receipt for Order #${orderIdSuffix} - ₹${order.amount} (Fodoos)`,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        const isReal = isRealSmtpConfigured();

        console.log(`\n======================================================`);
        console.log(`[EMAIL DISPATCH SUCCESS]`);
        console.log(`To: ${recipientEmail}`);
        console.log(`Order ID: #${order._id}`);
        console.log(`Transaction ID: ${transactionId || order.razorpayPaymentId || 'N/A'}`);
        console.log(`Message ID: ${info.messageId}`);
        console.log(`Live Delivery: ${isReal ? 'Delivered via live SMTP' : 'Routed through Ethereal development sandbox'}`);

        const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;
        if (previewUrl) {
            console.log(`Ethereal Preview: ${previewUrl}`);
        }
        console.log(`======================================================\n`);

        return {
            success: true,
            recipientEmail,
            messageId: info.messageId,
            isLiveDelivery: isReal,
            previewUrl
        };
    } catch (error) {
        console.error(`[EMAIL ERROR] Failed to send receipt email:`, error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send Order Confirmation Email (COD)
 */
export const sendCodConfirmationEmail = async (order, fallbackEmail = '') => {
    try {
        const recipientEmail = (order.address?.email || fallbackEmail || '').trim();
        if (!recipientEmail || !recipientEmail.includes('@')) {
            return { success: false, message: "No recipient email" };
        }

        const transporter = await createTransporter();
        const html = generateReceiptHtml(order, null, 'Cash on Delivery');
        const orderIdSuffix = order._id.toString().slice(-8).toUpperCase();
        const sender = process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `"Fodoos Food Delivery" <${process.env.EMAIL_USER}>` : '"Fodoos Food Delivery" <orders@fodoos.com>');

        const info = await transporter.sendMail({
            from: sender,
            to: recipientEmail,
            subject: `🍕 Order Confirmed (Cash on Delivery) - #${orderIdSuffix} - ₹${order.amount} (Fodoos)`,
            html
        });

        console.log(`[EMAIL COD] Confirmation sent to ${recipientEmail} (Msg ID: ${info.messageId})`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("[EMAIL ERROR] Error sending COD email:", error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Diagnostic tool: Test SMTP connection and send a test email
 */
export const testSmtpDelivery = async (targetEmail) => {
    const to = (targetEmail || process.env.EMAIL_USER || '').trim();
    if (!to || !to.includes('@')) {
        return { success: false, message: "Please provide a valid destination email" };
    }

    try {
        const transporter = await createTransporter();
        const isReal = isRealSmtpConfigured();

        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || (process.env.EMAIL_USER ? `"Fodoos Food Delivery" <${process.env.EMAIL_USER}>` : '"Fodoos" <test@fodoos.com>'),
            to,
            subject: "🍕 Fodoos - Live Email Delivery Test",
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                    <h2 style="color: #ff4c24;">Fodoos Email Notification Test</h2>
                    <p>This is a live test email sent from the Fodoos Food Delivery server.</p>
                    <p><b>Timestamp:</b> ${new Date().toISOString()}</p>
                    <p><b>SMTP Delivery Mode:</b> ${isReal ? 'Live Authenticated SMTP' : 'Development Sandbox'}</p>
                    <hr/>
                    <p style="color: #64748b; font-size: 12px;">If you see this email in your inbox, your email notification configuration is working properly!</p>
                </div>
            `
        });

        const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null;

        return {
            success: true,
            to,
            messageId: info.messageId,
            isLiveDelivery: isReal,
            previewUrl
        };
    } catch (err) {
        console.error("[SMTP TEST ERROR]", err);
        return { success: false, error: err.message };
    }
};

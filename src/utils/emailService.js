/**
 * Email Service - Nodemailer Configuration
 *
 * Handles email transmission for reminder notifications
 *
 * Author: Fayez Ahmad Protik
 */

const nodemailer = require('nodemailer');

/**
 * Create and configure Nodemailer transporter
 * Supports Gmail and other SMTP services
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

/**
 * Send reminder email
 * @param {Object} reminder - Reminder object with email, title, description, datetime
 * @returns {Promise} Send mail result
 */
const sendReminderEmail = async (reminder) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"JARVIS Productivity" <${process.env.EMAIL_USER}>`,
        to: reminder.email,
        subject: `🔔 Reminder: ${reminder.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px 10px 0 0;">
                    <h2 style="color: #fff; margin: 0;">🔔 Reminder Notification</h2>
                </div>
                <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0;">
                    <p><strong>Title:</strong> ${reminder.title}</p>
                    <p><strong>Description:</strong> ${reminder.description || 'No description provided'}</p>
                    <p><strong>Scheduled For:</strong> ${new Date(reminder.datetime).toLocaleString()}</p>
                    <p><strong>Type:</strong> ${reminder.type || 'General'}</p>
                </div>
                <div style="background: #f0f0f0; padding: 15px; border-radius: 0 0 10px 10px; font-size: 12px; color: #666;">
                    <p style="margin: 0;">This is an automated reminder from <strong>JARVIS Productivity Platform</strong>.</p>
                    <p style="margin: 5px 0 0 0;">Manage your reminders at: <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a></p>
                </div>
            </div>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { createTransporter, sendReminderEmail };
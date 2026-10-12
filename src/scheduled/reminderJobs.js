/**
 * Scheduled Jobs - Cron Tasks
 *
 * Automated background jobs for email reminders
 * Runs every minute to check for pending reminders
 *
 * Author: Fayez Ahmad Protik
 */

const cron = require('node-cron');
const { getDB } = require('../config/db');
const { sendReminderEmail } = require('../utils/emailService');

/**
 * Check for upcoming reminders and send email notifications
 * Runs every minute (cron: '**/1 * * * *')
 */
const startReminderCronJob = () => {
    cron.schedule('*/1 * * * *', async () => {
        console.log('⏰ Checking for upcoming reminders...');

        try {
            const db = getDB();
            const now = new Date();

            // Find reminders due within next 5 minutes that haven't been notified
            const upcomingReminders = await db.collection('reminders')
                .find({
                    datetime: { $lte: new Date(now.getTime() + 5 * 60 * 1000) },
                    completed: false,
                    notified: { $ne: true }
                })
                .toArray();

            if (upcomingReminders.length === 0) {
                console.log('✅ No reminders to send');
                return;
            }

            console.log(`📧 Sending ${upcomingReminders.length} reminder(s)...`);

            for (const reminder of upcomingReminders) {
                try {
                    await sendReminderEmail(reminder);

                    // Mark as notified
                    await db.collection('reminders').updateOne(
                        { _id: reminder._id },
                        { $set: { notified: true } }
                    );

                    console.log(`✅ Reminder sent: ${reminder.title}`);
                } catch (err) {
                    console.error(`❌ Failed to send reminder "${reminder.title}":`, err.message);
                }
            }
        } catch (err) {
            console.error('❌ Reminder cron job error:', err.message);
        }
    });

    console.log('⏰ Reminder cron job scheduled (runs every minute)');
};

/**
 * Cleanup old completed reminders
 * Runs daily at midnight (cron: '0 0 * * *')
 */
const startCleanupCronJob = () => {
    cron.schedule('0 0 * * *', async () => {
        console.log('🧹 Running daily cleanup...');

        try {
            const db = getDB();

            // Delete reminders older than 30 days and completed
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const result = await db.collection('reminders').deleteMany({
                completed: true,
                datetime: { $lt: thirtyDaysAgo }
            });

            console.log(`🧹 Cleaned up ${result.deletedCount} old reminders`);
        } catch (err) {
            console.error('❌ Cleanup cron job error:', err.message);
        }
    });

    console.log('🧹 Cleanup cron job scheduled (runs daily at midnight)');
};

/**
 * Initialize all scheduled jobs
 */
const initializeScheduledJobs = () => {
    startReminderCronJob();
    startCleanupCronJob();
};

module.exports = { initializeScheduledJobs };
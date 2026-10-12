const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to check and send reminder emails
const checkAndSendReminders = async () => {
  try {
    const db = getDB();
    const now = new Date();
    const upcomingReminders = await db.collection('reminders')
      .find({
        datetime: { $lte: new Date(now.getTime() + 5 * 60000) }, // 5 minutes before
        completed: false,
        notified: { $ne: true }
      })
      .toArray();

    for (const reminder of upcomingReminders) {
      try {
        // Send email
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: reminder.email,
          subject: `🔔 Reminder: ${reminder.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ff6b35;">Reminder Notification</h2>
              <p><strong>Title:</strong> ${reminder.title}</p>
              <p><strong>Description:</strong> ${reminder.description || 'No description'}</p>
              <p><strong>Type:</strong> ${reminder.type}</p>
              <p><strong>Scheduled Time:</strong> ${new Date(reminder.datetime).toLocaleString()}</p>
              <hr style="border: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                This is an automated reminder from your JARVIS application.
              </p>
            </div>
          `
        };

        await transporter.sendMail(mailOptions);
        
        // Mark as notified
        await db.collection('reminders').updateOne(
          { _id: reminder._id },
          { $set: { notified: true } }
        );

        console.log(`Reminder email sent to ${reminder.email}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${reminder.email}:`, emailError);
      }
    }
  } catch (error) {
    console.error('Error checking reminders:', error);
  }
};

// Schedule email checking every minute
cron.schedule('* * * * *', checkAndSendReminders);

// Create new reminder
exports.createReminder = async (req, res) => {
  try {
    const db = getDB();
    const { email, title, description, type, datetime } = req.body;
    
    if (!email || !title || !datetime) {
      return res.status(400).json({ error: 'Email, title, and datetime are required' });
    }

    const newReminder = { 
      email,
      title,
      description: description || '',
      type: type || 'general',
      datetime: new Date(datetime),
      completed: false,
      notified: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('reminders').insertOne(newReminder);
    res.status(201).json({ _id: result.insertedId, ...newReminder });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all reminders for user
exports.getUserReminders = async (req, res) => {
  try {
    const db = getDB();
    const reminders = await db.collection('reminders')
      .find({ email: req.params.email })
      .sort({ datetime: 1 })
      .toArray();
    
    res.status(200).json(reminders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single reminder by ID
exports.getReminder = async (req, res) => {
  try {
    const db = getDB();
    const reminder = await db.collection('reminders').findOne({ _id: new ObjectId(req.params.id) });
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    
    res.status(200).json(reminder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update reminder
exports.updateReminder = async (req, res) => {
  try {
    const db = getDB();
    const { title, description, type, datetime, completed } = req.body;
    
    const updateData = {
      updatedAt: new Date(),
      notified: false // Reset notification status if datetime changes
    };
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (datetime !== undefined) updateData.datetime = new Date(datetime);
    if (completed !== undefined) updateData.completed = completed;
    
    const result = await db.collection('reminders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    res.status(200).json(updateData);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete reminder
exports.deleteReminder = async (req, res) => {
  try {
    const db = getDB();
    const result = await db.collection('reminders').deleteOne({ _id: new ObjectId(req.params.id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    res.status(200).json({ 
      _id: req.params.id,
      deleted: true,
      message: 'Reminder deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Test email endpoint
exports.testEmail = async (req, res) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: req.body.email || process.env.EMAIL_USER,
      subject: 'Test Email from JARVIS',
      text: 'This is a test email from your JARVIS application.'
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: 'Test email sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
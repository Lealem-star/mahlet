const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Subscriber = require('../models/Subscriber');
const auth = require('../middleware/auth');

// Helper function to check DB connection
const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

// Subscribe (public route - anyone can subscribe)
router.post('/subscribe', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ message: 'Database not available. Please check MongoDB connection.' });
  }

  try {
    const { email, name, source, notes } = req.body;

    // Validation
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    // Handle contact form submissions (source: 'partner') differently
    if (source === 'partner') {
      // For contact forms, allow multiple submissions and update/create record
      const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
      
      if (existingSubscriber) {
        // Update existing record with new contact message
        if (name) existingSubscriber.name = name;
        existingSubscriber.source = 'partner';
        // Append new message to notes or replace if it's a contact form
        if (notes) {
          const timestamp = new Date().toLocaleString();
          existingSubscriber.notes = notes;
        }
        // Don't change subscription status for contact forms
        await existingSubscriber.save();
        return res.status(201).json({ 
          message: 'Thank you for your message. I will be in touch soon.',
          subscriber: {
            email: existingSubscriber.email,
            name: existingSubscriber.name,
          }
        });
      } else {
        // Create new record for contact form
        const subscriber = new Subscriber({
          email: email.toLowerCase(),
          name: name || '',
          source: 'partner',
          subscribed: false, // Contact form doesn't auto-subscribe
          ...(notes ? { notes } : {}),
        });

        await subscriber.save();
        return res.status(201).json({ 
          message: 'Thank you for your message. I will be in touch soon.',
          subscriber: {
            email: subscriber.email,
            name: subscriber.name,
          }
        });
      }
    }

    // Handle regular email subscriptions (homepage, fan, etc.)
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.subscribed) {
        return res.status(400).json({ message: 'This email is already subscribed' });
      } else {
        // Re-subscribe
        existingSubscriber.subscribed = true;
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribedAt = undefined;
        if (name) existingSubscriber.name = name;
        if (source) existingSubscriber.source = source;
        if (notes) existingSubscriber.notes = notes;
        await existingSubscriber.save();
        return res.json({ 
          message: 'Welcome back! You have been re-subscribed.',
          subscriber: existingSubscriber 
        });
      }
    }

    // Create new subscriber
    const subscriber = new Subscriber({
      email: email.toLowerCase(),
      name: name || '',
      source: source || 'homepage',
      subscribed: true,
      ...(notes ? { notes } : {}),
    });

    await subscriber.save();

    res.status(201).json({ 
      message: 'Thank you for joining the family! You will receive updates about Mahlet\'s work.',
      subscriber: {
        email: subscriber.email,
        name: subscriber.name,
      }
    });
  } catch (error) {
    console.error('Subscription error:', error);
    if (error.code === 11000) {
      // For contact forms, don't show subscription error
      if (req.body.source === 'partner') {
        return res.status(400).json({ message: 'Failed to submit your message. Please try again.' });
      }
      return res.status(400).json({ message: 'This email is already subscribed' });
    }
    res.status(500).json({ message: 'Failed to submit. Please try again.' });
  }
});

// Unsubscribe (public route)
router.post('/unsubscribe', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ message: 'Database not available. Please check MongoDB connection.' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const subscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (!subscriber) {
      return res.status(404).json({ message: 'Email not found in our list' });
    }

    subscriber.subscribed = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.json({ message: 'You have been unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ message: 'Failed to unsubscribe. Please try again.' });
  }
});

// Get all subscribers (admin only - protected)
router.get('/admin', auth, async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ 
      message: 'Database not available. Please check MongoDB connection.',
      subscribers: []
    });
  }

  try {
    const { subscribed, search } = req.query;
    let query = {};

    if (subscribed !== undefined) {
      query.subscribed = subscribed === 'true';
    }

    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    // For contact messages (source: 'partner'), sort by unread first, then by date (newest first)
    // For other sources, sort by date (newest first)
    let sortOrder = { createdAt: -1 };
    if (query.source === 'partner') {
      sortOrder = { read: 1, createdAt: -1 }; // Unread first (read: false = 0, read: true = 1)
    }

    const subscribers = await Subscriber.find(query)
      .sort(sortOrder)
      .select('-__v');

    res.json(subscribers);
  } catch (error) {
    console.error('Error fetching subscribers:', error.message);
    res.status(500).json({ message: error.message, subscribers: [] });
  }
});

// Get subscriber stats (admin only - protected)
router.get('/admin/stats', auth, async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ 
      message: 'Database not available. Please check MongoDB connection.',
      stats: {}
    });
  }

  try {
    const total = await Subscriber.countDocuments();
    const subscribed = await Subscriber.countDocuments({ subscribed: true });
    const unsubscribed = await Subscriber.countDocuments({ subscribed: false });
    
    // Count by source
    const bySource = await Subscriber.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      total,
      subscribed,
      unsubscribed,
      bySource: bySource.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    res.status(500).json({ message: error.message });
  }
});

router.get('/admin/unread-contact-count', auth, async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ 
      message: 'Database not available. Please check MongoDB connection.',
      count: 0
    });
  }

  try {
    const count = await Subscriber.countDocuments({ source: 'partner', read: false });
    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread contact message count:', error.message);
    res.status(500).json({ message: error.message, count: 0 });
  }
});

// Update subscriber (admin only - protected)
router.put('/admin/:id', auth, async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ message: 'Database not available. Please check MongoDB connection.' });
  }

  try {
    const { name, source, tags, notes, subscribed, read } = req.body;
    
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    if (name !== undefined) subscriber.name = name;
    if (source !== undefined) subscriber.source = source;
    if (tags !== undefined) subscriber.tags = tags;
    if (notes !== undefined) subscriber.notes = notes;
    if (subscribed !== undefined) {
      subscriber.subscribed = subscribed;
      if (subscribed) {
        subscriber.subscribedAt = new Date();
        subscriber.unsubscribedAt = undefined;
      } else {
        subscriber.unsubscribedAt = new Date();
      }
    }
    if (read !== undefined) {
      subscriber.read = read;
      if (read) {
        subscriber.readAt = new Date();
      } else {
        subscriber.readAt = undefined;
      }
    }

    await subscriber.save();
    res.json(subscriber);
  } catch (error) {
    console.error('Error updating subscriber:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// Delete subscriber (admin only - protected)
router.delete('/admin/:id', auth, async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ message: 'Database not available. Please check MongoDB connection.' });
  }

  try {
    const subscriber = await Subscriber.findById(req.params.id);
    if (!subscriber) {
      return res.status(404).json({ message: 'Subscriber not found' });
    }

    await Subscriber.findByIdAndDelete(req.params.id);
    res.json({ message: 'Subscriber deleted successfully' });
  } catch (error) {
    console.error('Error deleting subscriber:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Broadcast message to all subscribers (admin only - protected)
router.post('/admin/broadcast', auth, async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ message: 'Database not available. Please check MongoDB connection.' });
  }

  try {
    console.log('Broadcast request received:', { 
      hasSubject: !!req.body.subject, 
      hasMessage: !!req.body.message, 
      sendToAll: req.body.sendToAll 
    });
    
    const { subject, message, sendToAll = false } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    // Get all active subscribers
    const query = sendToAll ? {} : { subscribed: true };
    const subscribers = await Subscriber.find(query).select('email name');

    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No subscribers found to send message to' });
    }

    // Check if email is configured
    let nodemailer;
    try {
      nodemailer = require('nodemailer');
    } catch (requireError) {
      console.error('Failed to load nodemailer:', requireError);
      return res.status(500).json({ 
        message: 'Email service module not available. Please install nodemailer: npm install nodemailer',
        error: requireError.message 
      });
    }
    
    // Create transporter - using environment variables or default to console log for testing
    let transporter;
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        
        // Try to verify transporter configuration (optional - some servers don't support this)
        try {
          await transporter.verify();
          console.log('Email transporter verified successfully');
        } catch (verifyError) {
          console.warn('Email transporter verification failed (will still attempt to send):', verifyError.message);
          // Don't fail here - some SMTP servers don't support verify but still work
        }
      } catch (configError) {
        console.error('Email transporter configuration error:', configError.message);
        return res.status(500).json({ 
          message: 'Email service configuration error. Check server logs for details.',
          error: configError.message 
        });
      }
    } else {
      // For development/testing - just log the emails
      console.log('Email not configured. Would send to:', subscribers.map(s => s.email).join(', '));
      console.log('Subject:', subject);
      console.log('Message:', message);
      
      return res.json({
        message: 'Email service not configured. Check server logs for email details.',
        recipients: subscribers.length,
        emails: subscribers.map(s => s.email),
      });
    }

    // Send emails
    const results = {
      sent: 0,
      failed: 0,
      errors: [],
    };

    for (const subscriber of subscribers) {
      try {
        const mailOptions = {
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: subscriber.email,
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">${subject}</h2>
              <div style="line-height: 1.6; color: #555;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #999;">
                You received this email because you subscribed to updates from Mahlet Solomon.<br>
                <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}">Unsubscribe</a>
              </p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        results.sent++;
      } catch (error) {
        results.failed++;
        let errorMsg = error.message || 'Unknown error';
        if (error.response) {
          errorMsg = `${error.response.code || 'SMTP Error'}: ${error.response.response || error.message}`;
        } else if (error.code) {
          errorMsg = `${error.code}: ${error.message}`;
        }
        results.errors.push({
          email: subscriber.email,
          error: errorMsg,
        });
        console.error(`Failed to send email to ${subscriber.email}:`, errorMsg);
        if (error.stack) {
          console.error('Error stack:', error.stack);
        }
      }
    }

    res.json({
      message: `Broadcast completed. ${results.sent} sent, ${results.failed} failed.`,
      results,
    });
  } catch (error) {
    console.error('Error broadcasting message:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: error.message || 'Failed to send broadcast',
      error: error.toString()
    });
  }
});

module.exports = router;


const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const LatestPost = require('../models/LatestPost');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure storage for latest posts using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'latest-posts',
    format: async (req, file) => 'png', // supports promises. 
    public_id: (req, file) => Date.now() + '-' + Math.round(Math.random() * 1E9), 
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|webm|ogg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || /video/.test(file.mimetype) || /image/.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Get all active posts, newest first (public)
router.get('/', async (req, res) => {
  try {
    const posts = await LatestPost.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching latest posts:', err);
    res.status(500).json({ message: 'Server error fetching latest posts' });
  }
});

// Get all posts including inactive (admin only)
router.get('/admin', auth, async (req, res) => {
  try {
    const posts = await LatestPost.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error('Error fetching all posts:', err);
    res.status(500).json({ message: 'Server error fetching posts' });
  }
});

// Create a post (protected) - supports file upload
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, body, type, mediaUrl, isActive } = req.body;
    if (!type) {
      return res.status(400).json({ message: 'type is required' });
    }

    let finalMediaUrl = mediaUrl;
    let finalPublicId = null;
    
    // If file was uploaded, use the uploaded file path and public_id
    if (req.file) {
      finalMediaUrl = req.file.path;
      finalPublicId = req.file.filename;
    }

    const post = await LatestPost.create({ 
      title, 
      body, 
      type, 
      mediaUrl: finalMediaUrl, 
      public_id: finalPublicId,
      isActive: isActive !== undefined ? isActive : true 
    });
    res.status(201).json(post);
  } catch (err) {
    console.error('Error creating latest post:', err);
    res.status(500).json({ message: 'Server error creating post' });
  }
});

// Update a post (protected) - supports file upload
router.put('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, body, type, mediaUrl, isActive } = req.body;
    const post = await LatestPost.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If new file is uploaded, delete old file from Cloudinary and use new one
    if (req.file) {
      if (post.public_id) {
        await cloudinary.uploader.destroy(post.public_id);
      }
      post.mediaUrl = req.file.path;
      post.public_id = req.file.filename;
    } else if (mediaUrl !== undefined) {
      post.mediaUrl = mediaUrl;
      if (post.public_id && !mediaUrl) { // If mediaUrl is being cleared, also clear public_id
        await cloudinary.uploader.destroy(post.public_id);
        post.public_id = null;
      }
    }

    if (title !== undefined) post.title = title;
    if (body !== undefined) post.body = body;
    if (type !== undefined) post.type = type;
    if (isActive !== undefined) post.isActive = isActive;

    const updated = await post.save();
    res.json(updated);
  } catch (err) {
    console.error('Error updating latest post:', err);
    res.status(500).json({ message: 'Server error updating post' });
  }
});

// Delete a post (protected)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await LatestPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete the file from Cloudinary if it was an uploaded file
    if (post.public_id) {
      await cloudinary.uploader.destroy(post.public_id);
    }

    await LatestPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error('Error deleting latest post:', err);
    res.status(500).json({ message: 'Server error deleting post' });
  }
});

module.exports = router;


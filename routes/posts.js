const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2; 
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/', upload.single('image'), async (req, res) => {
  try {
   
    const result = await cloudinary.uploader.upload_stream(
      {
        folder: 'feed', 
      },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: 'Error uploading image to Cloudinary' });
        }

        
        const newPost = new Post({
          caption: req.body.caption,
          image: result.secure_url, 
          userId: req.body.userId,
        });

        await newPost.save();
        res.status(201).json(newPost);
      }
    );

    const bufferStream = require('stream').Readable.from(req.file.buffer);
    bufferStream.pipe(result);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
});


router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({userId: req.query.userId}).sort({ createdAt: -1 }); 
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

module.exports = router;

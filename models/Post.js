
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  caption: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId:
   { type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', required: true
   },
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

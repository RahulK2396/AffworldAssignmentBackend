const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const crypto = require('crypto');
const secret = crypto.randomBytes(64).toString('hex');
require('dotenv').config();

router.post('/register', async (req, res) => {
  const { name, email, password, googleId } = req.body;

  try {
    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    let user;
    if (googleId) {
     
      user = new User({ name, email, googleId });
    } else {
     
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = new User({ name, email, password: hashedPassword });
    }

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/google-login', async (req, res) => {
  const { token } = req.body;

  try {
   
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, 
    });

    const { name, email, sub: googleId } = ticket.getPayload();
    let user = await User.findOne({ email });

    if (!user) {
      
      user = new User({ name, email, googleId });
      await user.save();
    }

    
    const jwtToken = jwt.sign({ id: user._id }, secret, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token: jwtToken });
  } catch (error) {
    console.error('Google OAuth error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

router.post('/login', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const users = await User.find({ email });
    console.log("users", users.length);
    
    
    if (users.length === 0) {
      console.log("User not found for email:");
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = users[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required." });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await User.updateOne(
      { email },
      { $set: { password: hashedPassword } }
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "User not found or password not updated." });
    }

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
});


module.exports = router;
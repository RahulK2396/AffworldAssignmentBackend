const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks'); 
const postRoutes = require('./routes/posts'); 
require('dotenv').config();

const app = express();

const corsOptions = {
  origin: 'https://affworldassignmentfrontend.vercel.app', // Allow only your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true, // Allow cookies if needed
 headers: {
        "Access-Control-Allow-Origin": "https://affworldassignmentfrontend.vercel.app", // incorrect
        "Access-Control-Allow-Credentials": true // incorrect
    },
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
}));

app.options('*', cors(corsOptions)); 

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes); 
app.use('/api/posts', postRoutes); 


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

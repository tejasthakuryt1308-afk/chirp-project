require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/db');
const { connectCloudinary } = require('./config/cloudinary');
const scheduleNewsJob = require('./jobs/fetchNews');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tweetRoutes = require('./routes/tweets');
const newsRoutes = require('./routes/news');
const uploadRoutes = require('./routes/upload');

const app = express();

connectDB();
connectCloudinary();
scheduleNewsJob().catch(err => console.error(err));

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200
}));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tweets', tweetRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ message: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

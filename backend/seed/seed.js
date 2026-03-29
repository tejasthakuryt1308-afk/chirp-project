require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const NewsSource = require('../models/NewsSource');
const Tweet = require('../models/Tweet');

const seed = async () => {
  await connectDB();
  await User.deleteMany({});
  await Tweet.deleteMany({});
  await NewsSource.deleteMany({});

  const password = await bcrypt.hash('Password123!', 12);

  const users = await User.insertMany([
    {
      name: 'Aarav Sharma',
      email: 'aarav@chirp.in',
      password,
      handle: 'aarav',
      bio: 'Technology, startups, and product design.',
      avatar: 'https://i.pravatar.cc/150?img=12',
      verified: true
    },
    {
      name: 'Neha Verma',
      email: 'neha@chirp.in',
      password,
      handle: 'neha',
      bio: 'News, culture, and short-form storytelling.',
      avatar: 'https://i.pravatar.cc/150?img=32',
      verified: false
    }
  ]);

  await NewsSource.insertMany([
    {
      name: 'The New York Times',
      handle: 'nytimes',
      logo: 'https://logo.clearbit.com/nytimes.com',
      description: 'Breaking news and analysis from The New York Times',
      category: 'general',
      website: 'https://nytimes.com',
      verified: true
    }
  ]);

  await Tweet.insertMany([
    {
      text: 'Building products that feel like magic. #startup #design',
      author: users[0]._id,
      images: [{ url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200' }],
      category: 'technology',
      hashtags: ['startup', 'design'],
      likes: [users[1]._id]
    },
    {
      text: 'The internet moves fast. Good design makes it feel human. #ui #ux',
      author: users[1]._id,
      images: [],
      category: 'general',
      hashtags: ['ui', 'ux']
    }
  ]);

  console.log('Seed complete');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

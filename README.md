# Chirp — The Kinetic Stream

Full-stack social media starter built around the glassmorphism design system you specified.

## Stack
- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Auth: JWT + bcrypt
- Uploads: Multer + Cloudinary
- Email: Nodemailer
- News: NewsAPI job + MongoDB cache

## What is included
- Login, signup, forgot/reset password
- Feed with posts, likes, retweets, replies, bookmarks
- Profile pages and edit profile modal
- News source profiles and category feeds
- Search with debounce and recent searches
- Mobile nav and pull-to-refresh hook
- Backend schemas, routes, controllers, cron job
- Seed scripts and `.env.example`

## Important note
The pasted HTML design block was not present in the prompt body, so this project preserves the named design system ("The Kinetic Stream") and its specified visual tokens in React instead of doing a literal line-by-line conversion.

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment
Set:
- `MONGODB_URI`
- `JWT_SECRET`
- `NEWS_API_KEY`
- `CLOUDINARY_*`
- `EMAIL_*`

## API endpoints
Auth:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password/:token`
- `GET /api/auth/me`

Users:
- `GET /api/users/:id`
- `PUT /api/users/:id`
- `GET /api/users/:id/tweets`
- `GET /api/users/:id/followers`
- `GET /api/users/:id/following`
- `POST /api/users/:id/follow`
- `DELETE /api/users/:id/follow`

Tweets:
- `GET /api/tweets`
- `GET /api/tweets/:id`
- `POST /api/tweets`
- `DELETE /api/tweets/:id`
- `POST /api/tweets/:id/like`
- `DELETE /api/tweets/:id/like`
- `POST /api/tweets/:id/retweet`
- `DELETE /api/tweets/:id/retweet`
- `POST /api/tweets/:id/reply`
- `GET /api/tweets/search?q=keyword&category=sports`

News:
- `GET /api/news`
- `GET /api/news/sources`
- `GET /api/news/category/:category`
- `GET /api/news/source/:source`

Upload:
- `POST /api/upload/image`

## Production notes
- Add rate limiting, Redis cache, and object storage policies before launch.
- Use a CDN for uploaded media and front-end assets.
- Run the NewsAPI fetch job on a scheduler in production.

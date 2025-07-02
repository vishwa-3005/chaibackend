# Video Hosting Platform (Backend)

This project is a complex backend project that is built with nodejs, expressjs, mongodb, mongoose, jwt, bcrypt, and many more. This project is a complete backend project that has all the features that a backend project should have.

# Summary of this project

A **production-ready backend** for a modern video-sharing and content platform — inspired by platforms like YouTube, X (Twitter), and more.  
This system supports **videos**, **tweets**, **comments**, **likes**, **playlists**, and more — fully built in **Node.js, Express, and MongoDB**.

> 🔧 Backend completed — Frontend development coming soon.

---

## ✨ Features

### 🔑 Authentication & User Management

- Signup, Login, Logout with secure JWT
- Refresh token support
- Update profile, avatar, and account information

### 📼 Video Management

- Upload videos and thumbnails
- Track views and engagement
- Like/Unlike, Comment, and Playlist support

### 📝 Tweet System (Micro Content)

- Post short tweet-like content
- Like/Unlike tweets
- Delete or update tweets
- Fetch user tweets and timelines

### 💬 Comments & Engagement

- Add/update/delete comments on videos
- Like/Unlike comments
- Fetch all comments for a video with user info

### 📁 Playlists

- Create/delete/update playlists
- Add/remove videos to/from playlist
- Fetch full playlist with embedded video details

### ❤️ Likes System

- Like videos, comments, and tweets
- Unlike with toggle-like behavior
- Fetch most liked videos, user’s liked content

### 👥 Subscriptions

- Subscribe to other channels
- Get subscriber count and latest subscribers

### 📊 Dashboard Insights

- Profile overview (name, avatar, email)
- Creator statistics: total views, uploads, likes, comments
- Most liked/commented videos
- Recently uploaded videos, recent comments

---

## 🧠 Tech Stack

| Layer        | Technology                |
| ------------ | ------------------------- |
| Backend      | Node.js, Express.js       |
| Database     | MongoDB, Mongoose         |
| Auth         | JWT + Refresh Tokens      |
| File Uploads | Multer                    |
| Dev Tools    | Nodemon, ESLint, Prettier |

---

## 📂 Folder Structure

📦 src/
┣ 📁controllers → Business logic for videos, tweets, likes, etc.
┣ 📁models → Mongoose schemas
┣ 📁routes → Modular API routes
┣ 📁middlewares → JWT, error handling
┣ 📁utils → Response & error classes
┣ 📄app.js
┗ 📄index.js

---

## 🚀 Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/vishwa-3005/chaibackend.git
cd chaibackend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```
PORT=5000

# MongoDB
MONGO_URI=mongodb://localhost:27017/vidverse

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_API_KEY=you_api_key
```

### 4. Start Development Server

```
npm run dev
```

## 🙌 Acknowledgements

Thanks to [Hitesh Choudhary sir](https://github.com/hiteshchoudhary) for inspiring this project through his excellent production-grade backend series.

📣 Let’s Connect
If you liked the project, feel free to fork, ⭐️ star, or drop feedback.

## 👤 Author

**Vishwadeep**  
📧 [mail](vishwadeep108@gmail.com)
🔗 [LinkedIn](https://www.linkedin.com/in/vishwadeep-sankpal-2b3a4a279)

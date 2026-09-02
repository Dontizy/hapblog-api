
# Hapblog

> A modern full-stack blogging and social publishing platform built for writers, readers, and online communities.

Hapblog combines a rich blogging experience with social features such as following, likes, bookmarks, comments, replies, profiles, and notifications.

## 🌐 Live Application

**Frontend:** https://hapblog-frontend.vercel.app

**API:** https://hapblog-api.onrender.com

**Interactive API Documentation:** https://hapblog-api.onrender.com/api-docs/

---

## 📸 Overview

Hapblog is a production-style full-stack web application designed around content publishing and community interaction.

Users can create and manage articles, save drafts, publish content, interact with other users, follow authors, and manage their profiles.

Administrators have additional tools for managing users, moderating accounts, creating categories, and broadcasting notifications.

---

## ✨ Features

### Authentication & Accounts

- User registration and login
- Login using username or email
- JWT-based authentication
- Password change
- Forgot-password flow
- Password reset
- Profile management
- Avatar upload
- Bio management

### Blogging & Publishing

- Rich-text blog editor
- Create blog posts
- Save posts as drafts
- Publish drafts
- Edit published posts
- Delete posts
- Cover image uploads
- Blog categories
- SEO-friendly post slugs
- Published-post discovery
- Blog search
- Pagination

### Social Features

- Like and unlike posts
- Bookmark and unbookmark posts
- Follow and unfollow users
- Followers and following lists
- Public author profiles
- Author search
- User published-post listings

### Comments & Replies

- Create comments
- Edit comments
- Delete comments
- Like comments
- Create replies
- Edit replies
- Delete replies
- Like replies
- Paginated replies

### Notifications

- In-app notifications
- Unread notification count
- Mark notifications as read
- Administrator broadcast notifications

### Administration

- User management
- Search users
- Delete users
- Add/remove administrator privileges
- Create blog categories
- Suspend user accounts
- Broadcast notifications to all users

User suspension supports durations between **1 and 7 days**.

---

## 🛠️ Tech Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack React Query
- Axios
- Lucide React
- Tiptap

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Swagger / OpenAPI

### Infrastructure & Services

- MongoDB Atlas
- Cloudinary
- Vercel
- Render

---

## 🏗️ Architecture

Hapblog uses a separate frontend and backend architecture.

```text
                    ┌─────────────────────┐
                    │    Hapblog Client   │
                    │  React + TypeScript │
                    │       + Vite        │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │     Hapblog API     │
                    │ Express + TypeScript│
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
                 ▼                           ▼
        ┌─────────────────┐         ┌─────────────────┐
        │     MongoDB     │         │    Cloudinary   │
        │     Database    │         │ Image Storage   │
        └─────────────────┘         └─────────────────┘
```

---

## 📁 Project Structure

The project is separated into two applications:

```text
hapblog-frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── types/
│   └── ...
├── public/
├── package.json
└── vite.config.ts

hapblog-api/
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── seed/
│   └── ...
├── package.json
└── tsconfig.json
```

---

# 🚀 Getting Started

## Requirements

Before running Hapblog locally, install:

- Node.js
- npm
- MongoDB or a MongoDB Atlas database
- Cloudinary account

Clone the frontend and backend repositories.

```bash
git clone <frontend-repository-url>
git clone <backend-repository-url>
```

---

# ⚙️ Backend Setup

Navigate to the API project:

```bash
cd hapblog-api
```

Install dependencies:

```bash
npm install
```

Create a `.env` file based on `.env.example`.

Example:

```env
PORT=5000
DB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

CLIENT_URL=http://localhost:5173
```

If the project contains additional environment variables in `.env.example`, configure those as well.

Start the development server:

```bash
npm run dev
```

The API will normally run at:

```text
http://localhost:5000
```

---

# 💻 Frontend Setup

Navigate to the frontend:

```bash
cd hapblog-frontend
```

Install dependencies:

```bash
npm install
```

Create the required environment file.

Example:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 🔐 Environment Variables

Environment variables contain application configuration and sensitive credentials.

The recommended setup is:

```text
.env.example  → safe template committed to the repository
.env          → local/private configuration
```

Never commit production credentials, API keys, database passwords, JWT secrets, or Cloudinary secrets to Git.

For deployment, configure environment variables through the hosting provider's environment settings.

---

# 📚 API Documentation

Hapblog's backend provides interactive Swagger/OpenAPI documentation.

**API Documentation:**

https://hapblog-api.onrender.com/api-docs/

The documentation can be used to inspect endpoints, request parameters, authentication requirements, request bodies, and responses.

Protected endpoints use bearer authentication:

```http
Authorization: Bearer <token>
```

---

# 🔌 API Overview

## Authentication & Users

| Method | Endpoint | Description |
|---|---|---|
| POST | `/user/register` | Register a new user |
| POST | `/user/login` | Login with username or email |
| GET | `/user/auth/profile` | Get authenticated user's profile |
| DELETE | `/user/auth/delete/{id}` | Delete a user (admin) |
| PUT | `/user/auth/password-update` | Change password |
| PATCH | `/user/auth/avatar` | Update avatar |
| PATCH | `/user/auth/bio/update` | Update bio |
| POST | `/user/auth/forgot-password` | Request password reset |
| POST | `/user/auth/reset-password/{token}` | Reset password |

## Profiles & Social

| Method | Endpoint | Description |
|---|---|---|
| GET | `/user/auth/{username}` | Get user profile |
| GET | `/user/auth/followers` | Get current user's followers |
| GET | `/user/auth/following` | Get current user's following |
| GET | `/user/auth/{username}/followers` | Get a user's followers |
| GET | `/user/auth/{username}/following` | Get a user's following |
| PATCH | `/user/auth/{userId}/follow` | Follow/unfollow a user |
| GET | `/user/authors/search` | Search authors |

## Blog Posts

| Method | Endpoint | Description |
|---|---|---|
| POST | `/blog/post` | Create a post or draft |
| GET | `/blog/posts` | Get published posts |
| GET | `/blog/post/{slug}` | Get a post by slug |
| PUT | `/blog/post/{id}` | Update a post |
| DELETE | `/blog/post/{id}` | Delete a post |
| PATCH | `/blog/post/{id}/like` | Like/unlike a post |
| PATCH | `/blog/post/{id}/publish` | Publish a draft |
| GET | `/blog/drafts` | Get drafts |
| GET | `/blog/bookmarks` | Get bookmarked posts |
| PATCH | `/blog/{id}/bookmark` | Bookmark/unbookmark a post |

## Comments & Replies

| Method | Endpoint | Description |
|---|---|---|
| GET | `/blog/post/{id}/comments` | Get comments |
| POST | `/blog/post/{id}/comment` | Create a comment |
| PATCH | `/blog/{id}/comment/{commentId}` | Update a comment |
| DELETE | `/blog/{id}/comment/{commentId}` | Delete a comment |
| PATCH | `/blog/{id}/comment/{commentId}/like` | Like/unlike a comment |
| GET | `/blog/comment/{commentId}/replies` | Get replies |
| POST | `/blog/comment/{commentId}/reply` | Create a reply |
| PATCH | `/blog/comment/{id}/reply/{replyId}` | Update a reply |
| DELETE | `/blog/comment/{id}/reply/{replyId}` | Delete a reply |
| PATCH | `/blog/comment/{id}/reply/{replyId}/like` | Like/unlike a reply |

## Categories

| Method | Endpoint | Description |
|---|---|---|
| POST | `/blog/create-category` | Create a category (admin) |
| GET | `/blog/get-category` | Get categories |

## User Posts & Drafts

| Method | Endpoint | Description |
|---|---|---|
| GET | `/user/my-posts` | Get authenticated user's published posts |
| GET | `/user/blog/drafts` | Get authenticated user's drafts |
| GET | `/posts/public/{userId}` | Get a user's published posts |

## Notifications

| Method | Endpoint | Description |
|---|---|---|
| GET | `/user/auth/notifications` | Get notifications |
| PATCH | `/user/auth/notifications/{id}/read` | Mark notification as read |

## Administration

| Method | Endpoint | Description |
|---|---|---|
| GET | `/user/admin/users` | Search/manage users |
| PATCH | `/user/auth/admin/{id}` | Add/remove admin privileges |
| DELETE | `/user/auth/delete/{id}` | Delete a user |
| PATCH | `/user/admin/{userId}/suspend` | Suspend a user |
| POST | `/user/admin/broadcast` | Broadcast a notification |

---

# 🖼️ Image Uploads

Hapblog uses Cloudinary for image storage.

Images are used for:

- Blog cover images
- User avatars

Blog images are uploaded using:

```text
multipart/form-data
```

with the field:

```text
image
```

Avatar uploads use:

```text
multipart/form-data
```

with the field:

```text
avatar
```

---

# 🗄️ Database

Hapblog uses MongoDB with Mongoose.

The backend contains models for core application entities including:

- Users
- Blogs
- Categories
- Comments
- Replies
- Notifications

MongoDB Atlas can be used for a hosted production database.

---

# 🌱 Seeding

The backend includes seed utilities for creating development/demo data.

Seed data can include:

- Users
- Categories
- Blog posts
- Comments
- Replies

Use the seed utilities with a development database and review the seed script before running it against any database containing data you want to preserve.

---

# 🚢 Deployment

## Frontend — Vercel

The React/Vite frontend can be deployed to Vercel.

Build the project:

```bash
npm run build
```

The production build is generated in:

```text
dist/
```

Configure the frontend API URL to point to the deployed backend:

```env
VITE_API_URL=https://hapblog-api.onrender.com
```

## Backend — Render

The Express API can be deployed to Render or another Node.js-compatible hosting provider.

Configure all required environment variables in the hosting provider's environment settings.

The deployed Hapblog API is currently available at:

https://hapblog-api.onrender.com

---

# 🛡️ Authorization & Moderation

Hapblog uses authentication and authorization middleware to protect sensitive operations.

Protected functionality includes:

- Creating content
- Editing content
- Deleting content
- Likes
- Bookmarks
- Comments
- Replies
- Following users
- Account management
- Administrative actions

Author-specific resources are protected so users cannot modify content belonging to another author.

Administrative actions require administrator privileges.

Suspended accounts are restricted from relevant content-creation and interaction operations.

---

# 📦 What's Included

A Hapblog source-code handover can include:

- React + TypeScript frontend
- Express + TypeScript backend
- MongoDB/Mongoose data layer
- Authentication system
- JWT authorization
- Blog publishing system
- Rich-text editor
- Draft management
- Categories
- Cover image uploads
- Avatar uploads
- Likes
- Bookmarks
- Comments
- Replies
- Follow/follower system
- Author search
- User profiles
- Notifications
- Admin management
- User suspension
- Swagger/OpenAPI documentation
- Database seed utilities
- Deployment configuration

---

# 🔮 Future Improvements

Hapblog provides a foundation that can be extended with features such as:

- Real-time notifications
- Notification preferences
- Post analytics
- Author analytics
- Content recommendations
- Advanced moderation tools
- Additional admin analytics
- Automated testing
- CI/CD pipelines
- Additional social/community features

These are optional extensions and are not required for the core Hapblog experience.

---

# 🔒 Security Notes

Never commit sensitive credentials to the repository.

Keep the following private:

- Database credentials
- JWT secrets
- Cloudinary API credentials
- Email credentials
- Production environment variables
- Private API keys

Use `.env` locally and your hosting provider's secret/environment-variable management for production.

---

# 📄 License

Specify the license applicable to the Hapblog source code here.

For a commercial source-code sale, the final license and transfer terms should be defined separately in the purchase agreement.

---

# 🤝 Project Handover

The buyer should receive the source code and setup information necessary to run and deploy the application.

A complete handover should include:

1. Frontend source code
2. Backend/API source code
3. Environment-variable template
4. Database setup instructions
5. Cloudinary configuration instructions
6. Local development instructions
7. Deployment instructions
8. API documentation
9. Seed/development utilities

Production secrets should be transferred securely and never published in the repository.

---

## 📌 Project Status

Hapblog is a functional full-stack blogging and social publishing platform featuring authentication, rich-text publishing, drafts, categories, likes, bookmarks, comments, replies, profiles, following, notifications, image uploads, and administrative moderation.

It is designed as a foundation that can be deployed, customized, and extended into a larger blogging or creator-community platform.

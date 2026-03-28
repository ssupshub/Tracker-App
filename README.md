# Tracker App

A modernized, full-stack web application designed to track learning subjects and topics. It features a secure backend architecture and a highly polished Neumorphic and Glassmorphic user interface.

## Overview

The Tracker App allows users to create an account, securely log in, and actively manage a customizable list of subjects and related topics. It provides visual progress indicators to monitor completion rates across all created learning paths. 

This project demonstrates the implementation of modern web development standards, including stateless authentication, modular front-end architecture, and strict security middlewares.

## Architecture

The application is structured as a monolithic Express server that serves static frontend assets, abstracting the complexity into clean, separated concerns.

### Frontend
- **Design System:** Neumorphism and Glassmorphism driven by CSS Custom Properties (Variables).
- **Architecture:** Modular ES6 JavaScript (`api.js`, `state.js`, `ui.js`, `main.js`).
- **State Management:** Custom lightweight Publish/Subscribe pattern managing UI hydration and remote data synchronization.
- **Typography:** Outfit (Display) and JetBrains Mono (Data).

### Backend
- **Framework:** Node.js with Express.
- **Database:** MongoDB, managed via Mongoose ODM.
- **Authentication:** JWT (JSON Web Tokens) delivered via HttpOnly, Secure, SameSite=Strict cookies to prevent cross-site scripting (XSS) risks.
- **Security Middlewares:** 
  - Helmet (HTTP Header security & Content-Security-Policy)
  - Express Rate Limit (Brute-force protection on authentication routes)
  - Express Mongo Sanitize (NoSQL Injection protection)
  - Bcrypt (Password hashing)

## Project Structure

```text
/Tracker-App
├── package.json
├── server.js               # Unified application entry point
├── config/                 # Environment validation and Database connection
├── middleware/             # Authentication, Rate Limiting, and Error Handlers
├── controllers/            # Route business logic and data processing
├── routes/                 # Express router definitions
├── models/                 # Mongoose schemas (User, Subject, Topic)
└── public/                 # Static frontend assets (HTML, CSS, JS)
```

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher recommended)
- MongoDB instance (Local or Cloud/Atlas)

### 1. Installation

Clone the repository and install the required dependencies:

```bash
git clone https://github.com/ssupshub/Tracker-App.git
cd Tracker-App
npm install
```

### 2. Environment Configuration

The application requires specific environment variables to function correctly. The application will fail to start if any of the required variables are missing.

1. Create a `.env` file in the root directory.
2. Copy the reference variables from `.env.example`.
3. Provide your own secrets and database URIs.

Example `.env` configuration:
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tracker_db
JWT_SECRET=your_secure_random_64_character_hex_string
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:3000
```

### 3. Execution

To run the application in development mode (with hot-reloading via Nodemon):

```bash
npm run dev
```

To run the application in a production environment:

```bash
npm start
```

Once the server is running, navigate to `http://localhost:3000` in your web browser.

## API Endpoints

The backend provides the following RESTful endpoints:

### Authentication
- `POST /api/auth/register` - Register a new user account.
- `POST /api/auth/login` - Authenticate a user and receive an HttpOnly cookie.
- `POST /api/auth/logout` - Invalidate the active session cookie.

### Subjects
- `GET /api/subjects` - Retrieve all subjects mapped to the authenticated user.
- `POST /api/subjects` - Create a new subject.
- `DELETE /api/subjects/:id` - Delete a specific subject and its topics.

### Topics
- `POST /api/subjects/:id/topics` - Append a new topic to a subject.
- `PATCH /api/subjects/:subjectId/topics/:topicId` - Toggle the completion state of a specific topic.

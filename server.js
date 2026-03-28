require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const path = require('path');
const checkEnvVars = require('./config/env');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorHandler');

// 1) Verify Environment Vars
checkEnvVars();

// 2) Connect to Database
connectDB();

const app = express();

// 3) Security Middlewares
// set secure HTTP headers (using Helmet) - customize CSP for dev
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
      },
    },
  })
);

// Body parser
app.use(express.json({ limit: '10kb' }));
// Cookie parser (for JWTs)
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// CORS configuration - allow explicit origins
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000'];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Need this to pass cookies
  })
);

// 4) Static Files (Frontend)
app.use(express.static(path.join(__dirname, 'public')));

// 5) Application Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/subjects', require('./routes/subjectRoutes'));

// 6) Fallback route for SPA (redirect to index.html if not an API route)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 7) Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

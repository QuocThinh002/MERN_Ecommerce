const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); // Enhanced security
require('dotenv').config(); // Load environment variables;
const cron = require('node-cron');

const deleteInactiveUsers = require('./ultils/deleteInactiveUsers');
const connectToDatabase = require('./config/dbconnect'); // Renamed for clarity
const apiRoutes = require('./routes/index.route'); // Renamed for clarity


const app = express();
const port = process.env.PORT || 8080; // Default port

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet()); // Security middleware

// Database connection
connectToDatabase();

// Routes
apiRoutes(app); // Group API routes under '/api' prefix

//Cron delete inactive users every mid-day
cron.schedule('0 0 * * *', deleteInactiveUsers);

// Default route (only if no other route matches)
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// 404 Not Found handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Not found' });
});

// General error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log error details
  res.status(500).json({ message: 'Internal server error', error: err.stack});
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`); 
});

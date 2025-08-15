const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '.env'),
});

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const reportRoutes = require('./routes/reportRoutes');

if (!process.env.MONGO_URI) {
  console.error('FATAL: MONGO_URI is not loaded from .env');
  process.exit(1);
}

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/reports', reportRoutes);

// Export the app object for testing
if (require.main === module) {
  const mongo = process.env.MONGO_URI;
  if (!mongo) {
    console.error('FATAL: MONGO_URI is not set (env or backend/.env).');
    process.exit(1);
  }

  connectDB();

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/student_feedback';

mongoose
  .connect(mongoUri)
  .then(() => {
    app.listen(port, () => {
      console.log(`Student Feedback API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
    process.exitCode = 1;
  });

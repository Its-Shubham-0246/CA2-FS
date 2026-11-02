require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const feedbackRouter = require('./routes/feedback');

const port = Number(process.env.PORT ?? 3000);
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/student_feedback';
const app = express();

app.use(express.json({ strict: false }));
app.use('/api/feedback', feedbackRouter);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ error: 'Invalid JSON request body' });
  }

  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

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

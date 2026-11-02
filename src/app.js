const express = require('express');
const feedbackRouter = require('./routes/feedback');

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

module.exports = app;

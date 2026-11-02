const express = require('express');
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');

const router = express.Router();
const validStatuses = ['Pending', 'Reviewed'];

router.post('/', async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  try {
    const feedback = await Feedback.create({
      studentName: req.body.studentName,
      courseName: req.body.courseName,
      message: req.body.message,
      rating: req.body.rating
    });

    res.status(201).json(feedback);
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
      return res.status(400).json({ error: error.message });
    }

    next(error);
  }
});

router.get('/', async (req, res, next) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return res.status(400).json({ error: 'Page and limit must be positive integers' });
  }

  try {
    const [feedback, totalRecords] = await Promise.all([
      Feedback.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Feedback.countDocuments()
    ]);

    res.json({
      feedback,
      currentPage: page,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      limit
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: 'Invalid feedback ID' });
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({ error: 'Request body must be a JSON object' });
  }

  if (!validStatuses.includes(req.body.status)) {
    return res.status(400).json({ error: 'Status must be Pending or Reviewed' });
  }

  try {
    const feedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

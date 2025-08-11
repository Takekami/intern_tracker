const Feedback = require('../models/Feedback');

exports.createFeedback = async (req, res, next) => {
  try {
    const saved = await Feedback.create(req.body);
    res.status(201).json({ id: saved._id, message: 'ok' });
  } catch (err) { next(err); }
};

exports.getFeedback = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.internId)  query.internId = req.query.internId;
    if (req.query.mentorId)  query.mentorId = req.query.mentorId;
    if (req.query.weekStart) query.weekStart = new Date(req.query.weekStart);
    const rows = await Feedback.find(query).sort({ submittedAt: -1 }).lean();
    res.json(rows);
  } catch (err) { next(err); }
};

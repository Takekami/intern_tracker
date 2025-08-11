const Feedback = require('../models/Feedback');
const getFeedbacks = async (req, res) => {
try {
const feedbacks = await Feedback.find({ mentorId: req.user.id });
res.json(feedbacks);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const addFeedback = async (req, res) => {
const { internId, weekStart, comment, score } = req.body;
try {
const feedback = await Feedback.create({ mentorId: req.user.id, internId, weekStart, comment, score: Number(score) });
res.status(201).json(feedback);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const updateFeedback = async (req, res) => {
const { internId, weekStart, comment, score, submittedAt } = req.body;
try {
const feedback = await feedback.findById(req.params.id);
if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

feedback.internId = internId || feedback.internId;
feedback.weekStart = weekStart || feedback.weekStart;
feedback.comment = comment || feedback.comment;
feedback.score = Number(score) || feedback.score;
feedback.submittedAt = submittedAt || feedback.submittedAt;

const updatedFeedback = await feedback.save();
res.json(updatedFeedback);
} catch (error) {
res.status(500).json({ message: error.message });
}
};

const deleteFeedback = async (req, res) => {
try {
const feedback = await Feedback.findById(req.params.id);
if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

await feedback.remove();
res.json({ message: 'Feedback deleted' });
} catch (error) {
res.status(500).json({ message: error.message });
}
};

module.exports = { getFeedbacks, addFeedback, updateFeedback, deleteFeedback };
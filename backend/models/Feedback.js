const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  mentorId:  { type: String, required: true },
  internId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  taskId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: false },
  weekStart: { type: Date,   required: true },
  comment:   { type: String, required: true },
  score:     { type: Number, required: true },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Feedback', FeedbackSchema);
const mongoose = require('mongoose');

const canon = (v) => {
  if (typeof v !== 'string') return 'To Do';
  const s = v.trim().toLowerCase();
  if (s.startsWith('in')) return 'In Progress';
  if (s.startsWith('comp')) return 'Completed';
  return 'To Do';
};

const taskSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title:    { type: String, required: true },
  description: String,
  deadline: Date,
  status:   { type: String, default: 'To Do' }, // To Do, In Progress, Completed
  completed:{ type: Boolean, default: false },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

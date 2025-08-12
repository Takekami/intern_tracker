
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    deadline: { type: Date },
    status: { type: String, enum: ['To Do', 'In Progress', 'Completed'], default: 'To Do' },
    finalComment: { type: String },
});

module.exports = mongoose.model('Task', taskSchema);

const Task = require('../models/Task');
const mongoose = require('mongoose');

// Mentor: a list of tasks created by the mentor
const getTasks = async (req, res) => {
  try {
    const filter = req.user.role === 'mentor' ? { userId: req.user._id } : {};
    let query = Task.find(filter);

    if (Task.schema.path('assignee')) {
      query = query.populate('assignee', 'name email');
    }

    const tasks = await query.exec();
    res.json(tasks);
  } catch (error) {
    console.error('[getTasks]', error);
    res.status(500).json({ message: error.message });
  }
};

// Mentor: create task
const addTask = async (req, res) => {
  const { title, description, deadline, assignee } = req.body;
  try {
    const payload = { userId: req.user._id, title, description, deadline };

    // assignee が送られてきたら ObjectId を検証
    if (assignee !== undefined && assignee !== '') {
      if (!mongoose.Types.ObjectId.isValid(assignee)) {
        return res.status(400).json({ message: 'Invalid assignee id' });
      }
      payload.assignee = assignee;
    }

    const task = await Task.create(payload);
    const populated = await task.populate({ path: 'assignee', select: 'name email' });
    res.status(201).json(populated);
  } catch (error) {
    console.error('[addTask]', error);
    res.status(500).json({ message: error.message });
  }
};

// Mentor: update tasks（only their created tasks）
const updateTask = async (req, res) => {
  const { title, description, completed, deadline, status, assignee } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // mentor cannot update tasks of other mentors or interns
    if (String(task.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.completed = completed ?? task.completed;
    task.deadline = deadline ?? task.deadline;
    task.status = status ?? task.status;

    if (assignee !== undefined) {
      if (assignee === '' || assignee === null) {
        task.assignee = undefined;
      } else if (!mongoose.Types.ObjectId.isValid(assignee)) {
        return res.status(400).json({ message: 'Invalid assignee id' });
      } else {
        task.assignee = assignee;
      }
    }

    const updatedTask = await task.save();
    const populated = await updatedTask.populate({ path: 'assignee', select: 'name email' });
    res.json(populated);
  } catch (error) {
    console.error('[updateTask]', error);
    res.status(500).json({ message: error.message });
  }
};

// Mentor: delete tasks（only their created tasks）
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (String(task.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Intern or Mentor: update status
// - Intern: only their own tasks
// - Mentor: mentor can update only their created tasks
const updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'intern') {
      const isMine = task.assignee && String(task.assignee) === String(req.user._id);
      if (!isMine) return res.status(403).json({ message: 'Only the assignee can update status' });
    }

    task.status = status;
    task.completed = String(status).toLowerCase().startsWith('comp');
    const updated = await task.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, addTask, updateTask, deleteTask, updateTaskStatus };

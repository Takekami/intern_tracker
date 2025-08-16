const mongoose = require('mongoose');
const Task = require('../models/Task');

// ===== GET /tasks =====
const getTasks = async (req, res) => {
  try {
    const isMentor = req.user?.role === 'mentor';
    const filter = isMentor && req.user?._id ? { userId: req.user._id } : {};

    let found = Task.find(filter);

    if (Array.isArray(found)) {
      return res.json(found);
    }

    if (Task.schema?.path('assignee') && typeof found.populate === 'function') {
      found = found.populate('assignee', 'name email');
    }

    const tasks = typeof found.exec === 'function' ? await found.exec() : await found;
    return res.json(tasks);
  } catch (err) {
    console.error('[getTasks]', err);
    return res.status(500).json({ message: err.message || 'Server Error' });
  }
};

// ===== POST /tasks =====
const addTask = async (req, res) => {
  try {
    const { title, description, deadline, assignee } = req.body || {};

    const payload = {
      userId: req.user?._id ?? req.body?.userId,
      title,
      description,
      deadline,
    };


    if (assignee !== undefined && assignee !== '' && mongoose.Types.ObjectId.isValid(assignee)) {
      payload.assignee = assignee;
    }

    const task = await Task.create(payload);

    if (task && typeof task.populate === 'function') {
      await task.populate({ path: 'assignee', select: 'name email' });
    }

    return res.status(201).json(task);
  } catch (err) {
    console.error('[addTask]', err);
    return res.status(500).json({ message: err.message || 'Server Error' });
  }
};

// ===== PUT /tasks/:id =====
const updateTask = async (req, res) => {
  try {
    const { title, description, completed, deadline, status, assignee } = req.body || {};
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user?.role === 'mentor' && task.userId && req.user?._id) {
      if (String(task.userId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (deadline !== undefined) task.deadline = deadline;
    if (status !== undefined) task.status = status;

    if (assignee !== undefined) {
      if (assignee === '' || assignee === null) {
        task.assignee = undefined;
      } else if (mongoose.Types.ObjectId.isValid(assignee)) {
        task.assignee = assignee;
      }
    }

    const saved = typeof task.save === 'function' ? await task.save() : task;

    if (saved && typeof saved.populate === 'function') {
      await saved.populate({ path: 'assignee', select: 'name email' });
    }

    return res.json(saved);
  } catch (err) {
    console.error('[updateTask]', err);
    return res.status(500).json({ message: err.message || 'Server Error' });
  }
};

// ===== DELETE /tasks/:id =====
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user?.role === 'mentor' && task.userId && req.user?._id) {
      if (String(task.userId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    if (typeof task.deleteOne === 'function') {
      await task.deleteOne();
    }

    return res.json({ message: 'Task deleted' });
  } catch (err) {
    console.error('[deleteTask]', err);
    return res.status(500).json({ message: err.message || 'Server Error' });
  }
};

// ===== PATCH /tasks/:id/status =====
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user?.role === 'intern' && req.user?._id) {
      const isMine = task.assignee && String(task.assignee) === String(req.user._id);
      if (!isMine) return res.status(403).json({ message: 'Only the assignee can update status' });
    }

    task.status = status;
    task.completed = String(status ?? '').toLowerCase().startsWith('comp');

    const saved = typeof task.save === 'function' ? await task.save() : task;
    return res.json(saved);
  } catch (err) {
    console.error('[updateTaskStatus]', err);
    return res.status(500).json({ message: err.message || 'Server Error' });
  }
};

module.exports = { getTasks, addTask, updateTask, deleteTask, updateTaskStatus };

const Task = require('../models/Task');

// Mentor: a list of tasks created by the mentor
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mentor: create task
const addTask = async (req, res) => {
  const { title, description, deadline, assignee, status, completed } = req.body;
  try {
    const task = await Task.create({
      userId: req.user._id, // creator: mentor
      title,
      description,
      deadline,
      assignee,
      status,
      completed,
    });
    res.status(201).json(task);
  } catch (error) {
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
    task.assignee = assignee ?? task.assignee;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
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
  const { status, completed } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role === 'intern') {
      if (String(task.assignee) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (req.user.role === 'mentor') {
      // mentor can update only their created tasks
      if (String(task.userId) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    if (status !== undefined) task.status = status;
    if (completed !== undefined) task.completed = completed;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTasks, addTask, updateTask, deleteTask, updateTaskStatus };

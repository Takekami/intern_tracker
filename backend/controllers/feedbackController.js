const Feedback = require('../models/Feedback');
const Task = require('../models/Task');

// GET /api/feedback?taskId=&internId=
exports.getFeedbacks = async (req, res) => {
  try {
    const { taskId, internId } = req.query;
    const q = {};
    if (taskId) q.taskId = taskId;
    if (internId) q.internId = internId;

    const items = await Feedback.find(q)
      .sort({ weekStart: -1, createdAt: -1 })
      .populate('mentorId', 'name email')
      .populate('internId', 'name email')
      .populate('taskId', 'title');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/feedback
exports.addFeedback = async (req, res) => {
  try {
    const { taskId, internId: rawInternId, weekStart, comment, score } = req.body;

    // Ensure at least one of taskId or internId is provided
    if (!taskId && !rawInternId) {
      return res.status(400).json({ message: 'Provide taskId or internId' });
    }

    let internId = rawInternId;

    // If taskId is provided but internId is not, fetch internId from the task
    if (taskId && !internId) {
      const Task = require('../models/Task');
      const task = await Task.findById(taskId).select('assignee');
      internId = task?.assignee || null;
    }

    const fb = await Feedback.create({
      mentorId: req.user._id,   // mentor who is login
      internId: internId || undefined, // undefined if not provided
      taskId: taskId || undefined,
      weekStart,
      comment,
      score,
    });

    const populated = await fb.populate([
      { path: 'mentorId', select: 'name email' },
      { path: 'internId', select: 'name email' },
      { path: 'taskId', select: 'title' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/feedback/:id
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { taskId, internId, weekStart, comment, score } = req.body;

    const fb = await Feedback.findById(id);
    if (!fb) return res.status(404).json({ message: 'Feedback not found' });

    // Only creator (mentor) can update
    if (String(fb.mentorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const norm = {
      taskId: taskId === '' ? undefined : taskId,
      internId: internId === '' ? undefined : internId,
      weekStart: weekStart === '' ? undefined : weekStart,
      comment: comment === '' ? '' : comment,
      score: (score === '' || score === undefined || score === null) ? undefined : Number(score),
    };

    if (norm.taskId !== undefined) fb.taskId = norm.taskId;
    if (norm.internId !== undefined) fb.internId = norm.internId;
    if (norm.weekStart !== undefined) fb.weekStart = norm.weekStart;
    if (comment !== undefined) fb.comment = norm.comment;
    if (norm.score !== undefined) fb.score = norm.score;

    const saved = await fb.save();
    const populated = await saved.populate([
      { path: 'mentorId', select: 'name email' },
      { path: 'internId', select: 'name email' },
      { path: 'taskId', select: 'title' },
    ]);

    res.json(populated);
  } catch (err) {
    console.error('[updateFeedback]', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// DELETE /api/feedback/:id
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const fb = await Feedback.findById(id);
    if (!fb) return res.status(404).json({ message: 'Feedback not found' });

    if (String(fb.mentorId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await fb.deleteOne();
    res.json({ message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

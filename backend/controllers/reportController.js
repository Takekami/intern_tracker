const mongoose = require('mongoose');
const Task = require('../models/Task');
const Feedback = require('../models/Feedback');
const User = require('../models/User');

const toObjectId = (id) => {
  try { return new mongoose.Types.ObjectId(id); }
  catch { return null; }
};

/** Progress rate = done / total (0% if there are no tasks) */
async function calcProgress(internId) {
  const oid = toObjectId(internId);
  if (!oid) return 0;
  const query = { userId: oid };
  const [total, done] = await Promise.all([
    Task.countDocuments(query),
    Task.countDocuments({ ...query, status: 'Completed' })
  ]);
  if (!total) return 0;
  return Math.round((100 * done) / total);
}

/** GET /api/reports  List of interns in charge (progress/average score/final FB date/final comment) */
exports.getReports = async (req, res) => {
  try {
    const mentorKey = String(req.user._id); 
    const internIds = await Feedback.distinct('internId', { mentorId: mentorKey });

    const oids = internIds.map(toObjectId).filter(Boolean);
    const users = await User.find({ _id: { $in: oids } })
                            .select('_id name email finalComment')
                            .lean();
    const userMap = new Map(users.map(u => [String(u._id), u]));

    const rows = await Promise.all(internIds.map(async (iid) => {
      const progress = await calcProgress(iid);
      const [lastFb, avgAgg] = await Promise.all([
        Feedback.findOne({ internId: iid }).sort({ submittedAt: -1, createdAt: -1 }).lean(),
        Feedback.aggregate([
          { $match: { internId: iid } },
          { $group: { _id: '$internId', avg: { $avg: '$score' } } }
        ])
      ]);
      const avgScore = avgAgg[0]?.avg != null ? Number(avgAgg[0].avg.toFixed(1)) : null;
      const u = userMap.get(iid) || { _id: iid, name: `(user ${iid.slice(-6)})`, email: '' };

      return {
        intern: { id: iid, name: u.name, email: u.email },
        progress,
        avgScore,
        lastFeedbackAt: lastFb?.submittedAt || lastFb?.createdAt || null,
        finalComment: u.finalComment || ''
      };
    }));

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load reports' });
  }
};

/** GET /api/reports/:internId  Individual details (history + summary) */
exports.getReportDetail = async (req, res) => {
  try {
    const { internId } = req.params;
    const mentorKey = String(req.user._id);

    const permitted = await Feedback.exists({ mentorId: mentorKey, internId });
    if (!permitted && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [progress, feedbacks, avgAgg, user] = await Promise.all([
      calcProgress(internId),
      Feedback.find({ internId }).sort({ submittedAt: -1, createdAt: -1 }).lean(),
      Feedback.aggregate([
        { $match: { internId } },
        { $group: { _id: '$internId', avg: { $avg: '$score' } } }
      ]),
      User.findById(toObjectId(internId)).select('_id name email finalComment').lean()
    ]);

    const avgScore = avgAgg[0]?.avg != null ? Number(avgAgg[0].avg.toFixed(1)) : null;

    res.json({
      intern: {
        id: internId,
        name: user?.name || `(user ${internId.slice(-6)})`,
        email: user?.email || '',
        finalComment: user?.finalComment || ''
      },
      progress,
      avgScore,
      feedbacks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load report detail' });
  }
};

/** PUT /api/reports/:internId/final-comment  Save final comment */
exports.saveFinalComment = async (req, res) => {
  try {
    const { internId } = req.params;
    const { finalComment } = req.body;
    const mentorKey = String(req.user._id);

    const permitted = await Feedback.exists({ mentorId: mentorKey, internId });
    if (!permitted && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const u = await User.findById(toObjectId(internId));
    if (!u) return res.status(404).json({ message: 'Intern not found' });

    u.finalComment = (finalComment || '').trim();
    await u.save();

    res.json({ message: 'Final comment saved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save final comment' });
  }
};

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const generateToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '12h' });

/**
 * POST /api/auth/register
 * if email domain is interntracker.com >> mentor, other >> intern
 */
exports.registerUser = async (req, res) => {
    const { name, email, password, university, address } = req.body;

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'name, email, password are required' });
        }

        const normEmail = email.toLowerCase().trim();
        const exists = await User.findOne({ email: normEmail });
        if (exists) return res.status(400).json({ message: 'User already exists' });

        const mentorDomain = 'interntracker.com';
        const emailDomain = (normEmail.split('@')[1] || '').toLowerCase();
        const role = emailDomain === mentorDomain ? 'mentor' : 'intern';

        const user = await User.create({ name, email: normEmail, password, role });

        res.status(201).json({
            token: generateToken(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role },
        });
    } catch (err) {
        console.error('[registerUser]', err);
        res.status(500).json({ message: err.message || 'Server error' });
    }
};

// POST /api/auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const normEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normEmail });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('[loginUser]', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/auth/profile  (protect)
exports.getProfile = async (req, res) => {
  const { _id, name, email, role } = req.user;
  res.json({ id: _id, name, email, role });
};

//PUT /api/auth/profile  (protect)
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, password } = req.body; // ← university/address は扱わない
    if (name !== undefined) user.name = name;
    if (password) user.password = password;

    const saved = await user.save();
    res.json({ id: saved._id, name: saved.name, email: saved.email, role: saved.role });
  } catch (err) {
    console.error('[updateUserProfile]', err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

// GET /api/auth/interns  (for mentor)
exports.listInterns = async (req, res) => {
  try {
    const interns = await User.find({ role: 'intern' }).select('_id name email');
    res.json(interns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
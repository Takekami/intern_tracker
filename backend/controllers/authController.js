const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');              // User.comparePassword が無い場合に備え
const User = require('../models/User');

// 共通: JWT発行
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '12h' });

/**
 * POST /api/auth/register
 * メールドメインが interntracker.com なら mentor、他は intern
 */
exports.registerUser = async (req, res) => {
  const { name, email, password, university, address } = req.body;

  try {
    const normEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: normEmail });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const mentorDomain = 'interntracker.com';
    const emailDomain = normEmail.split('@')[1] || '';
    const role = emailDomain.toLowerCase() === mentorDomain ? 'mentor' : 'intern';

    const user = await User.create({
      name,
      email: normEmail,
      password,
      university,
      address,
      role,
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        address: user.address,
      },
    });
  } catch (err) {
    console.error('[registerUser]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/auth/login
 * 成功時 { token, user:{... role含む} } を返す
 */
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normEmail });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Userモデルに comparePassword があればそれを使い、無ければ bcrypt で比較
    const ok = user.comparePassword
      ? await user.comparePassword(password)
      : await bcrypt.compare(password, user.password);

    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    return res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        university: user.university,
        address: user.address,
      },
    });
  } catch (err) {
    console.error('[loginUser]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/auth/profile  (protect)
 */
exports.getProfile = async (req, res) => {
  // protect で req.user に { _id, name, email, role, ... } が入っている想定（password除外済み）
  return res.json(req.user);
};

/**
 * PUT /api/auth/profile  (protect)
 * name / university / address / password を更新可能
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { name, university, address, password } = req.body;

    if (name !== undefined) user.name = name;
    if (university !== undefined) user.university = university;
    if (address !== undefined) user.address = address;
    if (password) user.password = password; // pre('save') でハッシュ化

    const saved = await user.save();

    return res.json({
      id: saved._id,
      name: saved.name,
      email: saved.email,
      role: saved.role,
      university: saved.university,
      address: saved.address,
    });
  } catch (err) {
    console.error('[updateUserProfile]', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

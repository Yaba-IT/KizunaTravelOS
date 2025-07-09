const Profile = require('../models/Profile');
const { supabase } = require('../configs/config.js');

exports.createUser = async (req, res) => {
  try {
    const { email, password, ...profileData } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (error) return res.status(400).json({ error: error.message });

    const userId = data.user.id;

    const exists = await Profile.findOne({ userId });
    if (exists) return res.status(409).json({ error: 'Profile already exists' });

    const profile = await Profile.create({ userId, ...profileData });

    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const profile = await Profile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteUserById = async (req, res) => {
  try {
    const result = await Profile.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Profile not found' });

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate({ userId: req.user.id }, req.body, {
      new: true,
    });

    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteMyProfile = async (req, res) => {
  try {
    const result = await Profile.findOneAndDelete({ userId: req.user.id });
    if (!result) return res.status(404).json({ error: 'Profile not found' });

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

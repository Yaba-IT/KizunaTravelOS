const { supabase } = require('../configs/config.js');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) return res.status(401).json({ error: 'No token' });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Token Invalid' });

  req.user = user;
  next();
};

module.exports = (req, res, next) => {
  if (!req.user?.id) return res.status(401).json({ error: 'User not authenticated' });
  if (req.user.id === req.params.userId) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
};

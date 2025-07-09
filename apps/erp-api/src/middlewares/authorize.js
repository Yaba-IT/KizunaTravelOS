module.exports = (allowedRoles) => (req, res, next) => {
  const role = req.user && req.user.role;
  if (
    !role ||
    (Array.isArray(allowedRoles) ? !allowedRoles.includes(role) : role !== allowedRoles)
  ) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

const roleAuth = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        requiredRole: allowedRoles,
        userRole: req.user.role
      });
    }

    next();
  };
};

const permissionAuth = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!req.user.permissions || !req.user.permissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        requiredPermission,
        userPermissions: req.user.permissions
      });
    }

    next();
  };
};

module.exports = { roleAuth, permissionAuth };
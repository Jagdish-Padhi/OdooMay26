/**
 * authorize middleware
 * Checks if the authenticated user has the required role or permissions.
 * Must be used AFTER verifyToken middleware.
 */

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const { role } = req.auth;

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ 
        message: 'Forbidden: You do not have permission to perform this action.',
        requiredRoles: allowedRoles,
        currentRole: role
      });
    }

    next();
  };
};

/**
 * Granular permission check (Advanced)
 * @param {string[]} requiredPermissions 
 */
export const hasPermission = (...requiredPermissions) => {
  return (req, res, next) => {
    // In a production app, permissions would be fetched from DB/Cache
    // For now, we use roles as a proxy or check a 'permissions' array in JWT
    const { role, permissions = [] } = req.auth;

    if (role === 'admin') return next(); // Admins bypass all

    const hasAll = requiredPermissions.every(p => permissions.includes(p));

    if (!hasAll) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }

    next();
  };
};

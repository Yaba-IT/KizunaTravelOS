/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/authorize.js - Authorization middleware
* Controls access based on user roles and permissions
*
* coded by farid212@Yaba-IT!
*/

// Enhanced authorization middleware with comprehensive logging, role validation, and hierarchy support
module.exports = (allowedRoles) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    try {
      // Check if user exists and has role
      if (!req.user) {
        const errorData = {
          type: 'AUTHORIZATION_ERROR',
          error: 'User not authenticated',
          method: req.method,
          url: req.url,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString()
        };
        
        console.error('Authorization failed - no user:', errorData);
        
        return res.status(401).json({ 
          error: 'Authentication required',
          message: 'User must be authenticated before authorization',
          code: 'USER_NOT_AUTHENTICATED'
        });
      }

      const userRole = req.user.role || req.user.user_metadata?.role;
      
      if (!userRole) {
        const errorData = {
          type: 'AUTHORIZATION_ERROR',
          error: 'User has no role assigned',
          userId: req.user.id,
          userEmail: req.user.email,
          method: req.method,
          url: req.url,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString()
        };
        
        console.error('Authorization failed - no role:', errorData);
        
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          message: 'User has no role assigned',
          code: 'NO_ROLE_ASSIGNED'
        });
      }

      // Define role hierarchy (higher roles can access lower role permissions)
      const roleHierarchy = {
        'admin': 5,
        'manager': 4,
        'agent': 3,
        'guide': 2,
        'customer': 1
      };

      // Check if user's role is allowed
      let isAuthorized = false;
      
      if (Array.isArray(allowedRoles)) {
        // Check if user has any of the allowed roles or higher
        isAuthorized = allowedRoles.some(allowedRole => {
          const userRoleLevel = roleHierarchy[userRole] || 0;
          const allowedRoleLevel = roleHierarchy[allowedRole] || 0;
          return userRoleLevel >= allowedRoleLevel;
        });
      } else {
        // Single role check with hierarchy
        const userRoleLevel = roleHierarchy[userRole] || 0;
        const allowedRoleLevel = roleHierarchy[allowedRoles] || 0;
        isAuthorized = userRoleLevel >= allowedRoleLevel;
      }

      if (!isAuthorized) {
        const errorData = {
          type: 'AUTHORIZATION_ERROR',
          error: 'Insufficient role permissions',
          userId: req.user.id,
          userEmail: req.user.email,
          userRole,
          requiredRoles: allowedRoles,
          method: req.method,
          url: req.url,
          ip: req.ip || req.connection.remoteAddress,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString()
        };
        
        console.error('Authorization failed - insufficient role:', errorData);
        
        return res.status(403).json({ 
          error: 'Access denied',
          message: `Role '${userRole}' is not authorized for this resource`,
          code: 'INSUFFICIENT_PERMISSIONS',
          requiredRoles: allowedRoles,
          userRole
        });
      }

      // Log successful authorization
      const authData = {
        type: 'AUTHORIZATION_SUCCESS',
        userId: req.user.id,
        userEmail: req.user.email,
        userRole,
        requiredRoles: allowedRoles,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
        duration: `${Date.now() - startTime}ms`
      };
      
      console.log('Authorization successful:', authData);

      // Add authorization info to request
      req.userRole = userRole;
      req.authorizedRoles = allowedRoles;
      req.authorizationTime = startTime;
      req.roleHierarchy = roleHierarchy;

      next();
    } catch (error) {
      const errorData = {
        type: 'AUTHORIZATION_EXCEPTION',
        error: error.message,
        stack: error.stack,
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      console.error('Authorization exception:', errorData);
      
      return res.status(500).json({ 
        error: 'Authorization service error',
        message: 'An unexpected error occurred during authorization',
        code: 'AUTHORIZATION_SERVICE_ERROR'
      });
    }
  };
};

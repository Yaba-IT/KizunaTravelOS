/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/middlewares/canAccessOwnData.js - Data access control middleware
* Ensures users can only access their own data
*
* coded by farid212@Yaba-IT!
*/

// Enhanced canAccessOwnData middleware with comprehensive logging and validation
module.exports = (req, res, next) => {
  const startTime = Date.now();
  
  try {
    // Check if user is authenticated
    if (!req.user?.id) {
      const errorData = {
        type: 'ACCESS_CONTROL_ERROR',
        error: 'User not authenticated',
        method: req.method,
        url: req.url,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      console.error('Access control failed - no user:', errorData);
      
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'User must be authenticated to access data',
        code: 'USER_NOT_AUTHENTICATED'
      });
    }

    // Check if userId parameter exists
    if (!req.params.userId) {
      const errorData = {
        type: 'ACCESS_CONTROL_ERROR',
        error: 'Missing userId parameter',
        userId: req.user.id,
        userEmail: req.user.email,
        method: req.method,
        url: req.url,
        params: req.params,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      console.error('Access control failed - missing userId:', errorData);
      
      return res.status(400).json({ 
        error: 'Missing parameter',
        message: 'userId parameter is required',
        code: 'MISSING_USER_ID'
      });
    }

    // Validate userId parameter format
    const requestedUserId = req.params.userId.trim();
    if (!requestedUserId || requestedUserId.length < 1) {
      const errorData = {
        type: 'ACCESS_CONTROL_ERROR',
        error: 'Invalid userId parameter',
        userId: req.user.id,
        userEmail: req.user.email,
        requestedUserId,
        method: req.method,
        url: req.url,
        params: req.params,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      console.error('Access control failed - invalid userId:', errorData);
      
      return res.status(400).json({ 
        error: 'Invalid parameter',
        message: 'userId parameter is invalid',
        code: 'INVALID_USER_ID'
      });
    }

    // Check if user can access the requested data
    const canAccess = req.user.id === requestedUserId;
    
    if (!canAccess) {
      const errorData = {
        type: 'ACCESS_CONTROL_ERROR',
        error: 'Access denied - user cannot access other user data',
        userId: req.user.id,
        userEmail: req.user.email,
        requestedUserId,
        method: req.method,
        url: req.url,
        params: req.params,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      };
      
      console.error('Access control failed - unauthorized access:', errorData);
      
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'You can only access your own data',
        code: 'UNAUTHORIZED_DATA_ACCESS',
        requestedUserId,
        currentUserId: req.user.id
      });
    }

    // Log successful access control
    const accessData = {
      type: 'ACCESS_CONTROL_SUCCESS',
      userId: req.user.id,
      userEmail: req.user.email,
      requestedUserId,
      method: req.method,
      url: req.url,
      params: req.params,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
      duration: `${Date.now() - startTime}ms`
    };
    
    console.log('Access control successful:', accessData);

    // Add access control info to request
    req.accessControlTime = startTime;
    req.requestedUserId = requestedUserId;

    next();
  } catch (error) {
    const errorData = {
      type: 'ACCESS_CONTROL_EXCEPTION',
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    };
    
    console.error('Access control exception:', errorData);
    
    return res.status(500).json({ 
      error: 'Access control service error',
      message: 'An unexpected error occurred during access control',
      code: 'ACCESS_CONTROL_SERVICE_ERROR'
    });
  }
};

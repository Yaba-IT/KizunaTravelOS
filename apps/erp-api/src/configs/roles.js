/* Yaba-IT/KizunaTravelOS
*
* apps/erp-api/src/configs/roles.js - Roles and permissions configuration
* Defines user roles, permissions, and access control policies
*
* coded by farid212@Yaba-IT!
*/

module.exports = {
  // User Roles Definition
  roles: {
    // Anonymous users (not authenticated)
    ANONYMOUS: 'anonymous',
    
    // Customer roles
    CUSTOMER: 'customer',
    PREMIUM_CUSTOMER: 'premium_customer',
    VIP_CUSTOMER: 'vip_customer',
    
    // Staff roles
    STAFF: 'staff',
    GUIDE: 'guide',
    AGENT: 'agent',
    MANAGER: 'manager',
    SUPERVISOR: 'supervisor',
    
    // Administrative roles
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    SYSTEM_ADMIN: 'system_admin'
  },

  // Permission Definitions
  permissions: {
    // User Management
    USER_CREATE: 'user:create',
    USER_READ: 'user:read',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',
    USER_LIST: 'user:list',
    
    // Profile Management
    PROFILE_READ: 'profile:read',
    PROFILE_UPDATE: 'profile:update',
    PROFILE_DELETE: 'profile:delete',
    
    // Booking Management
    BOOKING_CREATE: 'booking:create',
    BOOKING_READ: 'booking:read',
    BOOKING_UPDATE: 'booking:update',
    BOOKING_DELETE: 'booking:delete',
    BOOKING_LIST: 'booking:list',
    BOOKING_APPROVE: 'booking:approve',
    BOOKING_REJECT: 'booking:reject',
    BOOKING_CANCEL: 'booking:cancel',
    
    // Journey Management
    JOURNEY_CREATE: 'journey:create',
    JOURNEY_READ: 'journey:read',
    JOURNEY_UPDATE: 'journey:update',
    JOURNEY_DELETE: 'journey:delete',
    JOURNEY_LIST: 'journey:list',
    JOURNEY_PUBLISH: 'journey:publish',
    JOURNEY_UNPUBLISH: 'journey:unpublish',
    
    // Provider Management
    PROVIDER_CREATE: 'provider:create',
    PROVIDER_READ: 'provider:read',
    PROVIDER_UPDATE: 'provider:update',
    PROVIDER_DELETE: 'provider:delete',
    PROVIDER_LIST: 'provider:list',
    PROVIDER_APPROVE: 'provider:approve',
    PROVIDER_REJECT: 'provider:reject',
    
    // Financial Management
    PAYMENT_CREATE: 'payment:create',
    PAYMENT_READ: 'payment:read',
    PAYMENT_UPDATE: 'payment:update',
    PAYMENT_DELETE: 'payment:delete',
    PAYMENT_LIST: 'payment:list',
    PAYMENT_REFUND: 'payment:refund',
    
    // Reporting and Analytics
    REPORT_READ: 'report:read',
    REPORT_CREATE: 'report:create',
    REPORT_EXPORT: 'report:export',
    ANALYTICS_READ: 'analytics:read',
    
    // System Administration
    SYSTEM_CONFIG: 'system:config',
    SYSTEM_MAINTENANCE: 'system:maintenance',
    SYSTEM_BACKUP: 'system:backup',
    SYSTEM_RESTORE: 'system:restore',
    
    // Security and Audit
    AUDIT_READ: 'audit:read',
    AUDIT_EXPORT: 'audit:export',
    SECURITY_CONFIG: 'security:config',
    
    // Content Management
    CONTENT_CREATE: 'content:create',
    CONTENT_READ: 'content:read',
    CONTENT_UPDATE: 'content:update',
    CONTENT_DELETE: 'content:delete',
    CONTENT_PUBLISH: 'content:publish',
    
    // Communication
    NOTIFICATION_SEND: 'notification:send',
    EMAIL_SEND: 'email:send',
    SMS_SEND: 'sms:send',
    
    // API Access
    API_READ: 'api:read',
    API_WRITE: 'api:write',
    API_DELETE: 'api:delete'
  },

  // Role-Permission Mapping
  rolePermissions: {
    // Anonymous users - very limited access
    anonymous: [
      'journey:read',
      'content:read'
    ],
    
    // Customer roles
    customer: [
      'user:read',
      'profile:read',
      'profile:update',
      'booking:create',
      'booking:read',
      'booking:update',
      'booking:cancel',
      'journey:read',
      'content:read',
      'payment:create',
      'payment:read'
    ],
    
    premium_customer: [
      'user:read',
      'profile:read',
      'profile:update',
      'booking:create',
      'booking:read',
      'booking:update',
      'booking:cancel',
      'journey:read',
      'content:read',
      'payment:create',
      'payment:read',
      'payment:refund',
      'analytics:read'
    ],
    
    vip_customer: [
      'user:read',
      'profile:read',
      'profile:update',
      'booking:create',
      'booking:read',
      'booking:update',
      'booking:cancel',
      'journey:read',
      'content:read',
      'payment:create',
      'payment:read',
      'payment:refund',
      'analytics:read',
      'notification:send'
    ],
    
    // Staff roles
    staff: [
      'user:read',
      'profile:read',
      'profile:update',
      'booking:read',
      'booking:update',
      'journey:read',
      'content:read',
      'payment:read',
      'report:read'
    ],
    
    guide: [
      'user:read',
      'profile:read',
      'profile:update',
      'booking:read',
      'booking:update',
      'journey:read',
      'journey:update',
      'content:read',
      'payment:read',
      'report:read',
      'notification:send'
    ],
    
    agent: [
      'user:read',
      'profile:read',
      'profile:update',
      'booking:create',
      'booking:read',
      'booking:update',
      'booking:approve',
      'booking:reject',
      'journey:read',
      'content:read',
      'payment:create',
      'payment:read',
      'payment:refund',
      'report:read',
      'notification:send'
    ],
    
    manager: [
      'user:read',
      'user:list',
      'profile:read',
      'profile:update',
      'booking:create',
      'booking:read',
      'booking:update',
      'booking:delete',
      'booking:approve',
      'booking:reject',
      'booking:list',
      'journey:create',
      'journey:read',
      'journey:update',
      'journey:delete',
      'journey:list',
      'journey:publish',
      'journey:unpublish',
      'provider:read',
      'provider:list',
      'content:create',
      'content:read',
      'content:update',
      'content:delete',
      'content:publish',
      'payment:create',
      'payment:read',
      'payment:update',
      'payment:refund',
      'payment:list',
      'report:read',
      'report:create',
      'report:export',
      'analytics:read',
      'notification:send',
      'email:send',
      'sms:send'
    ],
    
    supervisor: [
      'user:read',
      'user:list',
      'user:update',
      'profile:read',
      'profile:update',
      'booking:create',
      'booking:read',
      'booking:update',
      'booking:delete',
      'booking:approve',
      'booking:reject',
      'booking:list',
      'journey:create',
      'journey:read',
      'journey:update',
      'journey:delete',
      'journey:list',
      'journey:publish',
      'journey:unpublish',
      'provider:create',
      'provider:read',
      'provider:update',
      'provider:list',
      'provider:approve',
      'provider:reject',
      'content:create',
      'content:read',
      'content:update',
      'content:delete',
      'content:publish',
      'payment:create',
      'payment:read',
      'payment:update',
      'payment:delete',
      'payment:refund',
      'payment:list',
      'report:read',
      'report:create',
      'report:export',
      'analytics:read',
      'notification:send',
      'email:send',
      'sms:send',
      'audit:read'
    ],
    
    // Administrative roles
    admin: [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'user:list',
      'profile:read',
      'profile:update',
      'profile:delete',
      'booking:create',
      'booking:read',
      'booking:update',
      'booking:delete',
      'booking:approve',
      'booking:reject',
      'booking:list',
      'journey:create',
      'journey:read',
      'journey:update',
      'journey:delete',
      'journey:list',
      'journey:publish',
      'journey:unpublish',
      'provider:create',
      'provider:read',
      'provider:update',
      'provider:delete',
      'provider:list',
      'provider:approve',
      'provider:reject',
      'content:create',
      'content:read',
      'content:update',
      'content:delete',
      'content:publish',
      'payment:create',
      'payment:read',
      'payment:update',
      'payment:delete',
      'payment:refund',
      'payment:list',
      'report:read',
      'report:create',
      'report:export',
      'analytics:read',
      'notification:send',
      'email:send',
      'sms:send',
      'audit:read',
      'audit:export',
      'security:config',
      'system:config',
      'system:maintenance'
    ],
    
    super_admin: [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'user:list',
      'profile:read',
      'profile:update',
      'profile:delete',
      'booking:create',
      'booking:read',
      'booking:update',
      'booking:delete',
      'booking:approve',
      'booking:reject',
      'booking:list',
      'journey:create',
      'journey:read',
      'journey:update',
      'journey:delete',
      'journey:list',
      'journey:publish',
      'journey:unpublish',
      'provider:create',
      'provider:read',
      'provider:update',
      'provider:delete',
      'provider:list',
      'provider:approve',
      'provider:reject',
      'content:create',
      'content:read',
      'content:update',
      'content:delete',
      'content:publish',
      'payment:create',
      'payment:read',
      'payment:update',
      'payment:delete',
      'payment:refund',
      'payment:list',
      'report:read',
      'report:create',
      'report:export',
      'analytics:read',
      'notification:send',
      'email:send',
      'sms:send',
      'audit:read',
      'audit:export',
      'security:config',
      'system:config',
      'system:maintenance',
      'system:backup',
      'system:restore',
      'api:read',
      'api:write',
      'api:delete'
    ],
    
    system_admin: [
      'user:create',
      'user:read',
      'user:update',
      'user:delete',
      'user:list',
      'profile:read',
      'profile:update',
      'profile:delete',
      'booking:create',
      'booking:read',
      'booking:update',
      'booking:delete',
      'booking:approve',
      'booking:reject',
      'booking:list',
      'journey:create',
      'journey:read',
      'journey:update',
      'journey:delete',
      'journey:list',
      'journey:publish',
      'journey:unpublish',
      'provider:create',
      'provider:read',
      'provider:update',
      'provider:delete',
      'provider:list',
      'provider:approve',
      'provider:reject',
      'content:create',
      'content:read',
      'content:update',
      'content:delete',
      'content:publish',
      'payment:create',
      'payment:read',
      'payment:update',
      'payment:delete',
      'payment:refund',
      'payment:list',
      'report:read',
      'report:create',
      'report:export',
      'analytics:read',
      'notification:send',
      'email:send',
      'sms:send',
      'audit:read',
      'audit:export',
      'security:config',
      'system:config',
      'system:maintenance',
      'system:backup',
      'system:restore',
      'api:read',
      'api:write',
      'api:delete'
    ]
  },

  // Permission Hierarchies
  permissionHierarchies: {
    // User permissions hierarchy
    'user:create': ['user:read', 'user:list'],
    'user:update': ['user:read'],
    'user:delete': ['user:read', 'user:list'],
    
    // Booking permissions hierarchy
    'booking:update': ['booking:read'],
    'booking:delete': ['booking:read', 'booking:list'],
    'booking:approve': ['booking:read', 'booking:update'],
    'booking:reject': ['booking:read', 'booking:update'],
    'booking:cancel': ['booking:read', 'booking:update'],
    
    // Journey permissions hierarchy
    'journey:update': ['journey:read'],
    'journey:delete': ['journey:read', 'journey:list'],
    'journey:publish': ['journey:read', 'journey:update'],
    'journey:unpublish': ['journey:read', 'journey:update'],
    
    // Provider permissions hierarchy
    'provider:update': ['provider:read'],
    'provider:delete': ['provider:read', 'provider:list'],
    'provider:approve': ['provider:read', 'provider:update'],
    'provider:reject': ['provider:read', 'provider:update'],
    
    // Payment permissions hierarchy
    'payment:update': ['payment:read'],
    'payment:delete': ['payment:read', 'payment:list'],
    'payment:refund': ['payment:read', 'payment:update'],
    
    // Content permissions hierarchy
    'content:update': ['content:read'],
    'content:delete': ['content:read'],
    'content:publish': ['content:read', 'content:update'],
    
    // Report permissions hierarchy
    'report:create': ['report:read'],
    'report:export': ['report:read'],
    
    // Audit permissions hierarchy
    'audit:export': ['audit:read'],
    
    // System permissions hierarchy
    'system:maintenance': ['system:config'],
    'system:backup': ['system:config'],
    'system:restore': ['system:config', 'system:backup']
  },

  // Role Hierarchies
  roleHierarchies: {
    'premium_customer': ['customer'],
    'vip_customer': ['premium_customer'],
    'guide': ['staff'],
    'agent': ['staff'],
    'manager': ['agent'],
    'supervisor': ['manager'],
    'admin': ['supervisor'],
    'super_admin': ['admin'],
    'system_admin': ['super_admin']
  },

  // Default roles for new users
  defaultRoles: {
    newUser: 'customer',
    newStaff: 'staff',
    newAdmin: 'admin'
  },

  // Role descriptions
  roleDescriptions: {
    anonymous: 'Unauthenticated users with limited access',
    customer: 'Regular customers with basic booking capabilities',
    premium_customer: 'Premium customers with enhanced features',
    vip_customer: 'VIP customers with exclusive privileges',
    staff: 'General staff members',
    guide: 'Tour guides and travel experts',
    agent: 'Travel agents and booking specialists',
    manager: 'Department managers and supervisors',
    supervisor: 'Senior managers with oversight responsibilities',
    admin: 'System administrators with full access',
    super_admin: 'Super administrators with system-wide control',
    system_admin: 'System-level administrators with complete control'
  }
};

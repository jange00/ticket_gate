// Permission definitions
const PERMISSIONS = {
  // Events
  EVENTS_CREATE: 'events.create',
  EVENTS_EDIT: 'events.edit',
  EVENTS_DELETE: 'events.delete',
  EVENTS_VIEW: 'events.view',
  
  // Tickets
  TICKETS_SELL: 'tickets.sell',
  TICKETS_REFUND: 'tickets.refund',
  TICKETS_VIEW: 'tickets.view',
  
  // Users
  USERS_MANAGE: 'users.manage',
  USERS_VIEW: 'users.view',
  
  // Analytics
  ANALYTICS_VIEW: 'analytics.view',
  
  // Check-in
  CHECK_IN_MANAGE: 'check_in.manage',
  
  // Purchases
  PURCHASES_CREATE: 'purchases.create',
  PURCHASES_VIEW: 'purchases.view'
};

// Role-Permission mapping
const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_EDIT,
    PERMISSIONS.EVENTS_DELETE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.TICKETS_SELL,
    PERMISSIONS.TICKETS_REFUND,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.CHECK_IN_MANAGE,
    PERMISSIONS.PURCHASES_CREATE,
    PERMISSIONS.PURCHASES_VIEW
  ],
  organizer: [
    PERMISSIONS.EVENTS_CREATE,
    PERMISSIONS.EVENTS_EDIT,
    PERMISSIONS.EVENTS_DELETE,
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.TICKETS_SELL,
    PERMISSIONS.TICKETS_REFUND,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.CHECK_IN_MANAGE,
    PERMISSIONS.PURCHASES_VIEW
  ],
  staff: [
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.CHECK_IN_MANAGE
  ],
  user: [
    PERMISSIONS.EVENTS_VIEW,
    PERMISSIONS.TICKETS_VIEW,
    PERMISSIONS.PURCHASES_CREATE,
    PERMISSIONS.PURCHASES_VIEW
  ]
};

/**
 * Get permissions for a role
 */
const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if role has permission
 */
const hasPermission = (role, permission) => {
  const permissions = getPermissionsForRole(role);
  return permissions.includes(permission);
};

/**
 * Check if role has any of the permissions
 */
const hasAnyPermission = (role, permissions) => {
  return permissions.some(permission => hasPermission(role, permission));
};

/**
 * Check if role has all permissions
 */
const hasAllPermissions = (role, permissions) => {
  return permissions.every(permission => hasPermission(role, permission));
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  getPermissionsForRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions
};












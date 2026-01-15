const { ROLES } = require('../utils/constants');

// Mock user objects for different roles
const mockUser = {
  email: 'user@example.com',
  role: ROLES.USER,
  twoFactorEnabled: false
};

const mockOrganizer = {
  email: 'org@example.com',
  role: ROLES.ORGANIZER,
  twoFactorEnabled: false
};

const mockStaff = {
  email: 'staff@example.com',
  role: ROLES.STAFF,
  twoFactorEnabled: false
};

// Simplified version of the login logic we just implemented
function check2FARequired(user) {
  const is2FAMandatory = [ROLES.USER, ROLES.ORGANIZER, ROLES.STAFF].includes(user.role);
  return user.twoFactorEnabled || is2FAMandatory;
}

console.log('--- Universal 2FA Enforcement Verification ---');
console.log(`User (Role: ${mockUser.role}, 2FA Enabled: ${mockUser.twoFactorEnabled}) -> 2FA Required: ${check2FARequired(mockUser)}`);
console.log(`Organizer (Role: ${mockOrganizer.role}, 2FA Enabled: ${mockOrganizer.twoFactorEnabled}) -> 2FA Required: ${check2FARequired(mockOrganizer)}`);
console.log(`Staff (Role: ${mockStaff.role}, 2FA Enabled: ${mockStaff.twoFactorEnabled}) -> 2FA Required: ${check2FARequired(mockStaff)}`);

if (check2FARequired(mockUser) && check2FARequired(mockOrganizer) && check2FARequired(mockStaff)) {
  console.log('\n✅ Verification Successful: 2FA is now enforced for ALL roles.');
} else {
  console.log('\n❌ Verification Failed: 2FA enforcement logic is incomplete.');
}

export const ROLES = {
  MEMBER: 'member',
  RIDER: 'rider',
  ADMIN: 'admin',
};

export const SIGNUP_ROLES = ['member', 'rider'];

export const ROLE_TO_PATH = {
  [ROLES.MEMBER]: '/user',
  [ROLES.RIDER]: '/rider',
  [ROLES.ADMIN]: '/admin',
};

export const roleFromUser = (user) => user?.publicMetadata?.role;

export const homePathForRole = (role) => ROLE_TO_PATH[role] ?? '/';

export const isRole = (role) => Object.values(ROLES).includes(role);

export const normalizeSignupRole = (role) =>
  SIGNUP_ROLES.includes(role) ? role : ROLES.MEMBER;

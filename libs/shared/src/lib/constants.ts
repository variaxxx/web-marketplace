export const MS_IN_DAY = 1000 * 60 * 60 * 24;
export const MS_IN_HOUR = 1000 * 60 * 60;
export const MS_IN_MIN = 1000 * 60;

export const USER_ROLE = {
  USER: "USER",
  SELLER: "SELLER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

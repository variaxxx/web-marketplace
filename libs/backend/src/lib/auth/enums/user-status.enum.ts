export const USER_STATUS = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

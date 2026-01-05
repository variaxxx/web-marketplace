import { MS_IN_DAY, MS_IN_HOUR, MS_IN_MIN } from "../constants";

export const TokensAges = {
  accessToken: 15 * MS_IN_MIN,
  refreshToken: 7 * MS_IN_DAY,
  emailVerificationToken: 1 * MS_IN_HOUR,
};

export const USER_ROLE = {
  USER: "USER",
  ADMIN: "ADMIN",
  SELLER: "SELLER",
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

export const USER_STATUS = {
  INACTIVE: "INACTIVE",
  ACTIVE: "ACTIVE",
} as const;

export type UserStatus = typeof USER_STATUS[keyof typeof USER_STATUS];

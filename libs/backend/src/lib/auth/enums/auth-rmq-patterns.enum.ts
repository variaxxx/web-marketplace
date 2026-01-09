export const AUTH_RMQ_PATTERN = {
  REVOKE_REFRESH_TOKEN: "auth.revoke-refresh-token",
  CHANGE_USER_ROLE: "auth.change-user-role",
} as const;

export type AuthRmqPattern = typeof AUTH_RMQ_PATTERN[keyof typeof AUTH_RMQ_PATTERN];

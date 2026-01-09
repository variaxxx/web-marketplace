export const USER_RMQ_PATTERN = {
  USER_REGISTERED: "user.registered",
};

export type UserRmqPattern = typeof USER_RMQ_PATTERN[keyof typeof USER_RMQ_PATTERN];

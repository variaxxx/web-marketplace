export const RMQ_QUEUE = {
  AUTH_SERVICE: "auth_queue",
  NOTIFICATION_SERVICE: "notification_queue",
  USER_SERVICE: "user_queue",
  PRODUCT_SERVICE: "product_queue",
  REVIEW_SERVICE: "review_queue",
  MEDIA_SERVICE: "media_queue",
} as const;

export type RmqQueue = typeof RMQ_QUEUE[keyof typeof RMQ_QUEUE];

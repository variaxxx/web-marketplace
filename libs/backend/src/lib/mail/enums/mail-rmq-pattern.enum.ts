export const MAIL_RMQ_PATTERN = {
  SEND_EMAIL_VERIFICATION: "mail.send-email-verification",
  SELLER_APPLICATION_REVIEWED: "mail.seller-application-reviewed",
} as const;

export type MailRmqPattern = typeof MAIL_RMQ_PATTERN[keyof typeof MAIL_RMQ_PATTERN];

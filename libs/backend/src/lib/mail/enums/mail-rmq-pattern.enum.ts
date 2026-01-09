export const MAIL_RMQ_PATTERN = {
  SEND_EMAIL_VERIFICATION: "mail.send-email-verification",
} as const;

export type MailRmqPattern = typeof MAIL_RMQ_PATTERN[keyof typeof MAIL_RMQ_PATTERN];

export const STORE_FIELDS_CONFIG = {
  name: {
    maxLength: 64,
    required: true,
  },
  description: {
    maxLength: 256,
    required: false,
  },
  avatarUrl: {
    maxLength: 500,
    required: false,
  },
} as const;

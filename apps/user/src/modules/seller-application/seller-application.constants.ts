export const SELLER_APPLICATION_SELECT = {
  id: true,
  createdAt: true,
  userId: true,
  status: true,
  storeName: true,
  storeDescription: true,
  decisionMadeAt: true,
  rejectionReason: true,
  reviewedBy: {
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
  },
} as const;

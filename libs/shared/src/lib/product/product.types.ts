export const PRODUCT_STATUS = {
  REMOVED: "REMOVED",
  HIDDEN: "HIDDEN",
  ON_SALE: "ON_SALE",
  SOLD: "SOLD",
} as const;

export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

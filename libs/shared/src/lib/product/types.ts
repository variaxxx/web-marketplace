import { PRODUCT_STATUS } from "./constants";

export type ProductStatus = typeof PRODUCT_STATUS[keyof typeof PRODUCT_STATUS];

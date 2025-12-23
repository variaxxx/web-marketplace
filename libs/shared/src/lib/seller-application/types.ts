import { SELLER_APPLICATION_STATUS } from "./constants";

export type SellerApplicationStatus = typeof SELLER_APPLICATION_STATUS[keyof typeof SELLER_APPLICATION_STATUS];

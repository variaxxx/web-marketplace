import { SellerApplicationStatus } from "@web-marketplace/backend";

// TODO: refactor
export interface SellerApplicationInfoResponse {
  id: string;
  createdAt: Date;
  userId: string;
  status: SellerApplicationStatus;
  storeName: string;
  storeDescription: string;
  note?: string;
}

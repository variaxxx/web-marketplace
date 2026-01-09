import { UserDisplayInfoResponse } from "../../user";
import { SellerApplicationStatus } from "@web-marketplace/backend";

export interface SellerApplicationInfoResponse {
  id: string;
  createdAt: Date;
  userId: string;
  status: SellerApplicationStatus;
  storeName: string;
  storeDescription: string | null;
  decisionMadeAt?: Date;
  reviewedBy?: UserDisplayInfoResponse;
  rejectionReason?: string;
}

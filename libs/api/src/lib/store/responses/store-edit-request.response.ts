import { UserDisplayInfoResponse } from "../../user";
import { ValueChangeResponse } from "./value-change.response";
import { StoreEditRequestStatus } from "@web-marketplace/backend";

export interface StoreEditRequestResponse {
  id: string;
  createdAt: Date;
  status: StoreEditRequestStatus;
  storeId: string;
  changes: ValueChangeResponse[];
  decisionMadeAt?: Date;
  reviewedBy?: UserDisplayInfoResponse;
}

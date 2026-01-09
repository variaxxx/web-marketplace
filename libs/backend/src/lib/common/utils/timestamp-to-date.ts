import { Timestamp } from "@web-marketplace/contracts/gen/google/protobuf/timestamp";

export function timestampToDate(timestamp: Timestamp): Date {
  return new Date(Number(timestamp.seconds) * 1000);
}

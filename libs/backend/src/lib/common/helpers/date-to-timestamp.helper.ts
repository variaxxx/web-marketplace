import { Timestamp } from "@web-marketplace/contracts/gen/google/protobuf/timestamp";

export function dateToTimestamp(date: Date): Timestamp {
  return {
    seconds: Math.floor(date.getTime() / 1000),
    nanos: (date.getTime() % 1000) * 1_000_000,
  };
}

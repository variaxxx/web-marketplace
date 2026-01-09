import { MS_IN_DAY, MS_IN_MIN } from "../../common";

export const TOKEN_AGE = {
  ACCESS_TOKEN: 15 * MS_IN_MIN,
  REFRESH_TOKEN: 7 * MS_IN_DAY,
} as const;

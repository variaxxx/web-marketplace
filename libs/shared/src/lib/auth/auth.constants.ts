import { MS_IN_DAY, MS_IN_HOUR, MS_IN_MIN } from "../constants";

export const TokensAges = {
  accessToken: 2 * MS_IN_MIN,
  refreshToken: 7 * MS_IN_DAY,
  emailVerificationToken: 1 * MS_IN_HOUR,
};

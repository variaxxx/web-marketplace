export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface EmailVerificationTokenPayload {
  userId: string;
  email: string;
}

export interface IEmailVerificationRepository {
  createVerificationCode(userId: string, email: string, code: string, expiresAt: Date): Promise<void>;
  findValidCode(userId: string, code: string): Promise<TVerificationCodeRow | null>;
  markAsVerified(userId: string, code: string): Promise<void>;
  incrementAttempts(userId: string, code: string): Promise<void>;
  deleteUserCodes(userId: string): Promise<void>;
}

export interface TVerificationCodeRow {
  id: string;
  user_id: string;
  email: string;
  code: string;
  expires_at: Date;
  verified: boolean;
  attempts: number;
  created_at: Date;
}
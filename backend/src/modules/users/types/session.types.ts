export type TSessionDbRow = {
  id: string;
  user_id: string;
  token: string;
  ip_address: string;
  user_agent: string;
  device_info: string;
  expires_at: Date;
  ultima_atividade_em: Date;
};

export interface ISessionRepository {
  createSession(userId: string, token: string, ipAddress: string, userAgent: string, deviceInfo: object, expiresAt: Date): Promise<void>;
  deleteSession(userId: string, token: string): Promise<void>;
  findValidSession(userId: string, token: string): Promise<TSessionDbRow | null>;
  updateLastActivity(userId: string, token: string): Promise<void>;
}
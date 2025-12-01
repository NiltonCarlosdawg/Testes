import db from "@/config/database.js";

export class EmailVerificationRepository {
async create(userId: string, code: string, expiresAt: Date): Promise<void> {
  await db.query(
    `INSERT INTO email_verification_codes (user_id, code, expires_at)
      VALUES ($1, $2, $3)
      ON CONFLICT (user_id) DO UPDATE
      SET code = $2, expires_at = $3, used = FALSE`,
    [userId, code, expiresAt]
  );
}

  async findValid(userId: string, code: string): Promise<boolean> {
    const res = await db.query(
      `SELECT 1 FROM email_verification_codes
       WHERE user_id = $1 AND code = $2 AND expires_at > NOW() AND used = FALSE`,
      [userId, code]
    );
    return (res.rowCount ?? 0) > 0;
  }

  async markAsUsed(userId: string, code: string): Promise<void> {
    await db.query(
      `UPDATE email_verification_codes SET used = TRUE WHERE user_id = $1 AND code = $2`,
      [userId, code]
    );
  }
}
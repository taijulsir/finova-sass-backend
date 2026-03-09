import bcrypt from 'bcrypt';
import crypto from 'crypto';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../user/user.model';
import { UserSession } from './user-session.model';
import { LoginActivity } from './login-activity.model';
import { ApiError } from '../../utils/api-error';
import { UAParser } from 'ua-parser-js';

// ── Helpers ─────────────────────────────────────────────────────────────────

function parseUA(userAgent: string) {
  const parser = new UAParser(userAgent);
  const ua = parser.getResult();
  return {
    browser: [ua.browser.name, ua.browser.version].filter(Boolean).join(' ') || 'Unknown Browser',
    device: ua.device.type
      ? `${ua.device.vendor ?? ''} ${ua.device.model ?? ''}`.trim() || 'Mobile Device'
      : ua.os.name
      ? `${ua.os.name} ${ua.os.version ?? ''}`.trim()
      : 'Desktop',
  };
}

// ── Profile ──────────────────────────────────────────────────────────────────

export class AccountService {
  static async getProfile(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  static async updateProfile(userId: string, dto: {
    name?: string;
    phone?: string;
    timezone?: string;
    avatar?: string;
  }) {
    const allowed: Record<string, any> = {};
    if (dto.name !== undefined) allowed.name = dto.name.trim();
    if (dto.phone !== undefined) allowed.phone = dto.phone.trim();
    if (dto.timezone !== undefined) allowed.timezone = dto.timezone;
    if (dto.avatar !== undefined) allowed.avatar = dto.avatar;

    const user = await User.findByIdAndUpdate(userId, { $set: allowed }, { new: true, runValidators: true }).lean();
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }

  // ── Password ────────────────────────────────────────────────────────────────

  static async changePassword(userId: string, currentSessionId: string, dto: {
    currentPassword: string;
    newPassword: string;
  }) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw ApiError.notFound('User not found');

    const isMatch = await user.comparePassword(dto.currentPassword);
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect');

    const strength = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(dto.newPassword);
    if (!strength) {
      throw ApiError.badRequest(
        'Password must be at least 8 characters and contain uppercase, lowercase, and a number'
      );
    }

    user.password = dto.newPassword;
    (user as any).passwordChangedAt = new Date();
    await user.save();

    // Revoke all sessions except current
    await UserSession.deleteMany({ userId, sessionId: { $ne: currentSessionId } });
  }

  // ── 2FA ─────────────────────────────────────────────────────────────────────

  static async setup2FA(userId: string) {
    const user = await User.findById(userId).lean();
    if (!user) throw ApiError.notFound('User not found');
    if ((user as any).twoFactorEnabled) throw ApiError.badRequest('2FA is already enabled');

    const secret = speakeasy.generateSecret({
      name: `Finova Admin (${user.email})`,
      issuer: 'Finova',
    });

    // Temporarily save secret (not yet enabled) so verify step can read it
    await User.findByIdAndUpdate(userId, { $set: { twoFactorSecret: secret.base32 } });

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);
    return { secret: secret.base32, qrCodeUrl };
  }

  static async verify2FA(userId: string, token: string) {
    const user = await User.findById(userId).select('+twoFactorSecret +twoFactorBackupCodes');
    if (!user) throw ApiError.notFound('User not found');
    if (!(user as any).twoFactorSecret) throw ApiError.badRequest('2FA setup not initiated');

    const verified = speakeasy.totp.verify({
      secret: (user as any).twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) throw ApiError.badRequest('Invalid verification code');

    // Generate backup codes
    const backupCodes = Array.from({ length: 8 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase()
    );

    await User.findByIdAndUpdate(userId, {
      $set: {
        twoFactorEnabled: true,
        twoFactorBackupCodes: backupCodes,
      },
    });

    return { backupCodes };
  }

  static async disable2FA(userId: string, token: string) {
    const user = await User.findById(userId).select('+twoFactorSecret');
    if (!user) throw ApiError.notFound('User not found');
    if (!(user as any).twoFactorEnabled) throw ApiError.badRequest('2FA is not enabled');

    const verified = speakeasy.totp.verify({
      secret: (user as any).twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!verified) throw ApiError.badRequest('Invalid verification code');

    await User.findByIdAndUpdate(userId, {
      $set: { twoFactorEnabled: false },
      $unset: { twoFactorSecret: '', twoFactorBackupCodes: '' },
    });
  }

  // ── Sessions ─────────────────────────────────────────────────────────────────

  static async getSessions(userId: string, currentSessionId: string) {
    const sessions = await UserSession.find({ userId }).sort({ lastActiveAt: -1 }).lean();
    return sessions.map((s) => ({ ...s, isCurrent: s.sessionId === currentSessionId }));
  }

  static async revokeSession(userId: string, sessionId: string, currentSessionId: string) {
    if (sessionId === currentSessionId) throw ApiError.badRequest('Cannot revoke your current session');
    const result = await UserSession.deleteOne({ sessionId, userId });
    if (result.deletedCount === 0) throw ApiError.notFound('Session not found');
  }

  static async revokeAllSessions(userId: string, currentSessionId: string) {
    await UserSession.deleteMany({ userId, sessionId: { $ne: currentSessionId } });
  }

  // ── Session create / update (called from auth) ───────────────────────────────

  static async createSession(userId: string, sessionId: string, userAgent: string, ipAddress: string) {
    const { browser, device } = parseUA(userAgent);
    await UserSession.create({
      sessionId,
      userId,
      browser,
      device,
      ipAddress,
      userAgent,
      lastActiveAt: new Date(),
    });
  }

  static async refreshSession(sessionId: string) {
    await UserSession.updateOne({ sessionId }, { $set: { lastActiveAt: new Date() } });
  }

  static async deleteSession(sessionId: string) {
    await UserSession.deleteOne({ sessionId });
  }

  // ── Login Activity ────────────────────────────────────────────────────────────

  static async getLoginHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [activity, total] = await Promise.all([
      LoginActivity.find({ userId }).sort({ loginTime: -1 }).skip(skip).limit(limit).lean(),
      LoginActivity.countDocuments({ userId }),
    ]);
    return { activity, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  static async recordLoginActivity(
    userId: string,
    userAgent: string,
    ipAddress: string,
    status: 'success' | 'failed'
  ) {
    const { browser, device } = parseUA(userAgent);
    await LoginActivity.create({ userId, browser, device, ipAddress, userAgent, status, loginTime: new Date() });
  }
}

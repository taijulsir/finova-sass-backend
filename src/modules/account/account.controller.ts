import { Response, NextFunction } from 'express';
import { AccountService } from './account.service';
import { AuthenticatedRequest } from '../../types/interfaces';
import { sendSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/api-error';

// Helper: extract current sessionId from auth token (stored in Authorization header via JWT sub)
// We use the JWT jti claim (or userId+iat) as a proxy session ID for revocation matching.
// For real session IDs, the login flow injects sessionId via cookie/header.
function getSessionId(req: AuthenticatedRequest): string {
  return req.cookies?.sessionId ?? req.headers['x-session-id'] as string ?? req.user!.userId;
}

export class AccountController {
  // ── Profile ──────────────────────────────────────────────────────────────────

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await AccountService.getProfile(req.user!.userId);
      sendSuccess(res, { user });
    } catch (e) { next(e); }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const user = await AccountService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, { user }, 'Profile updated successfully');
    } catch (e) { next(e); }
  }

  // ── Password ─────────────────────────────────────────────────────────────────

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await AccountService.changePassword(req.user!.userId, getSessionId(req), req.body);
      sendSuccess(res, null, 'Password changed successfully');
    } catch (e) { next(e); }
  }

  // ── 2FA ──────────────────────────────────────────────────────────────────────

  static async setup2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await AccountService.setup2FA(req.user!.userId);
      sendSuccess(res, result, '2FA setup initiated. Scan the QR code.');
    } catch (e) { next(e); }
  }

  static async verify2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await AccountService.verify2FA(req.user!.userId, token);
      sendSuccess(res, result, '2FA enabled successfully');
    } catch (e) { next(e); }
  }

  static async disable2FA(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      await AccountService.disable2FA(req.user!.userId, token);
      sendSuccess(res, null, '2FA disabled successfully');
    } catch (e) { next(e); }
  }

  // ── Sessions ──────────────────────────────────────────────────────────────────

  static async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const sessions = await AccountService.getSessions(req.user!.userId, getSessionId(req));
      sendSuccess(res, { sessions });
    } catch (e) { next(e); }
  }

  static async revokeSession(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await AccountService.revokeSession(req.user!.userId, req.params.sessionId, getSessionId(req));
      sendSuccess(res, null, 'Session revoked');
    } catch (e) { next(e); }
  }

  static async revokeAllSessions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await AccountService.revokeAllSessions(req.user!.userId, getSessionId(req));
      sendSuccess(res, null, 'All other sessions revoked');
    } catch (e) { next(e); }
  }

  // ── Login History ─────────────────────────────────────────────────────────────

  static async getLoginHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const result = await AccountService.getLoginHistory(req.user!.userId, page, limit);
      sendSuccess(res, result);
    } catch (e) { next(e); }
  }
}

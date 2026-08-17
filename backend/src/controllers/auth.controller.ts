import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/errors';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, resetSecuritySchema } from '../../../shared/validation/auth.schema';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const validation = registerSchema.safeParse(req.body);
      if (!validation.success) {
        const formattedErrors: Record<string, string[]> = {};
        validation.error.issues.forEach((issue: { path: (string | number)[]; message: string }) => {
          const field = issue.path[0]?.toString() || 'global';
          if (!formattedErrors[field]) formattedErrors[field] = [];
          formattedErrors[field].push(issue.message);
        });
        return sendError(res, 'Validation failed', 400, formattedErrors);
      }

      const result = await AuthService.register(validation.data);
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Registration failed', err.statusCode || 500);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        const formattedErrors: Record<string, string[]> = {};
        validation.error.issues.forEach((issue: { path: (string | number)[]; message: string }) => {
          const field = issue.path[0]?.toString() || 'global';
          if (!formattedErrors[field]) formattedErrors[field] = [];
          formattedErrors[field].push(issue.message);
        });
        return sendError(res, 'Validation failed', 400, formattedErrors);
      }

      const result = await AuthService.login(validation.data);
      return sendSuccess(res, result, 'Login successful');
    } catch (err: any) {
      return sendError(res, err.message || 'Login failed', err.statusCode || 401);
    }
  }

  static async logout(req: Request, res: Response) {
    return sendSuccess(res, null, 'Logged out successfully');
  }

  static async getSecurityQuestion(req: Request, res: Response) {
    try {
      const email = typeof req.params.email === 'string' ? req.params.email : Array.isArray(req.params.email) ? req.params.email[0] : '';
      if (!email) return sendError(res, 'Email address is required', 400);

      const result = await AuthService.getSecurityQuestion(email);
      return sendSuccess(res, result);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch security question', err.statusCode || 404);
    }
  }

  static async resetWithSecurityQuestion(req: Request, res: Response) {
    try {
      const validation = resetSecuritySchema.safeParse(req.body);
      if (!validation.success) {
        const formattedErrors: Record<string, string[]> = {};
        validation.error.issues.forEach((issue: { path: (string | number)[]; message: string }) => {
          const field = issue.path[0]?.toString() || 'global';
          if (!formattedErrors[field]) formattedErrors[field] = [];
          formattedErrors[field].push(issue.message);
        });
        return sendError(res, 'Validation failed', 400, formattedErrors);
      }

      const result = await AuthService.resetPasswordWithSecurityAnswer(validation.data);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Password reset failed', err.statusCode || 400);
    }
  }

  static async forgotPassword(req: Request, res: Response) {
    try {
      const validation = forgotPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        return sendError(res, 'Invalid email address', 400);
      }

      const result = await AuthService.forgotPassword(validation.data.email);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Password reset request failed', err.statusCode || 500);
    }
  }

  static async resetPassword(req: Request, res: Response) {
    try {
      const validation = resetPasswordSchema.safeParse(req.body);
      if (!validation.success) {
        const formattedErrors: Record<string, string[]> = {};
        validation.error.issues.forEach((issue: { path: (string | number)[]; message: string }) => {
          const field = issue.path[0]?.toString() || 'global';
          if (!formattedErrors[field]) formattedErrors[field] = [];
          formattedErrors[field].push(issue.message);
        });
        return sendError(res, 'Validation failed', 400, formattedErrors);
      }

      const result = await AuthService.resetPassword(validation.data);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Password reset failed', err.statusCode || 400);
    }
  }

  static async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return sendError(res, 'Unauthorized', 401);
      }
      const user = await AuthService.getUserById(req.user.id);
      return sendSuccess(res, { user });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch user profile', err.statusCode || 500);
    }
  }

  static async exportData(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const exportData = await AuthService.exportUserData(userId);
      return sendSuccess(res, exportData, 'User data exported successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to export user data', err.statusCode || 500);
    }
  }

  static async deleteAccount(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const result = await AuthService.deleteAccount(userId);
      return sendSuccess(res, result, result.message);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to delete account', err.statusCode || 500);
    }
  }
}

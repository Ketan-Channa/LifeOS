import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../config/prisma';
import { AppError } from '../utils/errors';
import { RegisterInput, LoginInput, ResetPasswordInput, ResetSecurityInput } from '../../../shared/validation/auth.schema';

const JWT_SECRET = process.env.JWT_SECRET || '';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  static formatUser(user: any) {
    return {
      id: user.id,
      name: user.name,
      age: user.age ?? null,
      dob: user.dob ?? null,
      sex: user.sex ?? null,
      bloodGroup: user.bloodGroup ?? null,
      email: user.email,
      phone: user.phone ?? null,
      securityQuestion: user.securityQuestion ?? null,
      avatarUrl: user.avatarUrl || null,
      timezone: user.timezone || 'UTC',
      currentPlan: user.currentPlan || 'FREE',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
  }

  static async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() }
    });

    if (existing) {
      throw new AppError('Email address is already registered', 400);
    }

    // Hash password & security answer with bcrypt (Never store plaintext)
    const passwordHash = await bcrypt.hash(input.password, 10);
    const securityAnswerHash = await bcrypt.hash(input.securityAnswer.toLowerCase().trim(), 10);

    const user = await prisma.user.create({
      data: {
        name: input.name.trim(),
        age: input.age ? Number(input.age) : null,
        dob: input.dob || null,
        sex: input.sex || null,
        bloodGroup: input.bloodGroup || null,
        email: input.email.toLowerCase().trim(),
        phone: input.phone || null,
        password: '', // Plaintext permanently removed
        passwordHash,
        securityQuestion: input.securityQuestion.trim(),
        securityAnswer: securityAnswerHash,
        currentPlan: 'FREE'
      }
    });

    const token = this.generateToken(user.id);

    return {
      user: this.formatUser(user),
      token
    };
  }

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() }
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Validate bcrypt hash
    let isValid = false;
    if (user.passwordHash) {
      isValid = await bcrypt.compare(input.password, user.passwordHash);
    }

    // Auto-migration for legacy plaintext password accounts
    if (!isValid && user.password && user.password === input.password) {
      isValid = true;
      const newHash = await bcrypt.hash(input.password, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: '', passwordHash: newHash }
      });
    }

    if (!isValid) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken(user.id);

    return {
      user: this.formatUser(user),
      token
    };
  }

  static async getSecurityQuestion(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { securityQuestion: true }
    });

    if (!user || !user.securityQuestion) {
      throw new AppError('If an account exists, security instructions have been initialized', 200);
    }

    return { securityQuestion: user.securityQuestion };
  }

  static async resetPasswordWithSecurityAnswer(input: ResetSecurityInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase().trim() }
    });

    if (!user || !user.securityAnswer) {
      throw new AppError('Invalid email or security records', 400);
    }

    // Check bcrypt hashed security answer or legacy plaintext comparison
    let isAnswerValid = await bcrypt.compare(input.securityAnswer.toLowerCase().trim(), user.securityAnswer);
    if (!isAnswerValid && user.securityAnswer.toLowerCase().trim() === input.securityAnswer.toLowerCase().trim()) {
      isAnswerValid = true;
    }

    if (!isAnswerValid) {
      throw new AppError('Security answer is incorrect', 400);
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: '',
        passwordHash
      }
    });

    return { message: 'Password reset successful. Please log in with your new password.' };
  }

  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      return {
        message: 'If an account exists with that email, a password reset link has been initialized.'
      };
    }

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() }
    });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt
      }
    });

    return {
      message: 'Password reset link initialized successfully.'
    };
  }

  static async resetPassword(input: ResetPasswordInput) {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: input.token }
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw new AppError('Invalid or expired password reset token', 400);
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: {
          password: '',
          passwordHash
        }
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() }
      })
    ]);

    return { message: 'Password has been reset successfully.' };
  }

  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return this.formatUser(user);
  }

  static async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tasks: true,
        goals: { include: { milestones: true } },
        scheduleEvents: true,
        habits: { include: { habitLogs: true } },
        knowledgeDocuments: { select: { id: true, title: true, category: true, fileSize: true, pageCount: true, createdAt: true } },
        agentRuns: { select: { id: true, objective: true, status: true, autonomyLevel: true, createdAt: true } }
      }
    });

    if (!user) throw new AppError('User not found', 404);

    return {
      profile: this.formatUser(user),
      tasksCount: user.tasks.length,
      goalsCount: user.goals.length,
      scheduleEventsCount: user.scheduleEvents.length,
      habitsCount: user.habits.length,
      documentsCount: user.knowledgeDocuments.length,
      exportedAt: new Date().toISOString(),
      data: {
        tasks: user.tasks,
        goals: user.goals,
        scheduleEvents: user.scheduleEvents,
        habits: user.habits,
        documentsMetadata: user.knowledgeDocuments,
        agentRunsMetadata: user.agentRuns
      }
    };
  }

  static async deleteAccount(userId: string) {
    await prisma.user.delete({
      where: { id: userId }
    });
    return { success: true, message: 'Account and all associated personal data have been permanently deleted.' };
  }
}

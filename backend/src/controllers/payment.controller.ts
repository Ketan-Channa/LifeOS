import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import prisma from '../config/prisma';
import { sendSuccess, sendError } from '../utils/errors';
import { AuthService } from '../services/auth.service';

const PLAN_DETAILS: Record<string, { name: string; price: number; months: number }> = {
  FREE: { name: 'Free Plan', price: 0, months: 120 }, // 10 years lifetime
  INTERMEDIATE: { name: 'Intermediate Plan', price: 499, months: 3 },
  ADVANCED: { name: 'Advanced Plan', price: 899, months: 6 },
  ELITE: { name: 'Elite Plan', price: 1499, months: 12 }
};

export class PaymentController {
  static async checkout(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const { planId, paymentMethod = 'UPI' } = req.body;

      if (!planId || !PLAN_DETAILS[planId]) {
        return sendError(res, 'Invalid subscription plan selected', 400);
      }

      const plan = PLAN_DETAILS[planId];
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + plan.months);

      const paymentId = `PAY_LIFEOS_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

      // Create subscription and update user's current plan in database
      const [subscription, updatedUser] = await prisma.$transaction([
        prisma.subscription.create({
          data: {
            userId,
            planName: planId,
            amount: plan.price,
            status: 'ACTIVE',
            currentPeriodStart: startDate,
            currentPeriodEnd: endDate
          }
        }),
        prisma.user.update({
          where: { id: userId },
          data: { currentPlan: planId }
        })
      ]);

      return sendSuccess(
        res,
        {
          subscription,
          user: AuthService.formatUser(updatedUser)
        },
        `Successfully subscribed to ${plan.name}!`
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Payment processing failed', 500);
    }
  }

  static async getMyPlan(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) return sendError(res, 'Unauthorized', 401);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          subscriptions: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!user) return sendError(res, 'User not found', 404);

      return sendSuccess(res, {
        currentPlan: user.currentPlan,
        user: AuthService.formatUser(user),
        subscriptions: user.subscriptions
      });
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch subscription status', 500);
    }
  }
}

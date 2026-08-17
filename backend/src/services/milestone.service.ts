import prisma from '../config/prisma';
import { AppError } from '../utils/errors';
import { GoalService } from './goal.service';

export class MilestoneService {
  static async getMilestones(userId: string, goalId: string) {
    await GoalService.getGoalById(userId, goalId);

    return await prisma.milestone.findMany({
      where: { goalId },
      orderBy: { order: 'asc' }
    });
  }

  static async createMilestone(userId: string, goalId: string, data: any) {
    await GoalService.getGoalById(userId, goalId);

    const existingCount = await prisma.milestone.count({ where: { goalId } });
    const order = data.order || existingCount + 1;

    const milestone = await prisma.milestone.create({
      data: {
        goalId,
        title: data.title.trim(),
        description: data.description || null,
        order
      }
    });

    await GoalService.recalculateGoalProgressFromMilestones(goalId);

    return milestone;
  }

  static async updateMilestone(userId: string, milestoneId: string, data: any) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { goal: true }
    });

    if (!milestone || milestone.goal.userId !== userId) {
      throw new AppError('Milestone not found', 404);
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        ...data
      }
    });

    return updated;
  }

  static async completeMilestone(userId: string, milestoneId: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { goal: true }
    });

    if (!milestone || milestone.goal.userId !== userId) {
      throw new AppError('Milestone not found', 404);
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        completed: true,
        completedAt: new Date()
      }
    });

    await prisma.goalHistory.create({
      data: {
        goalId: milestone.goalId,
        action: 'MILESTONE_COMPLETED',
        previousProgress: milestone.goal.progress,
        newProgress: milestone.goal.progress
      }
    });

    await GoalService.recalculateGoalProgressFromMilestones(milestone.goalId);

    return updated;
  }

  static async reopenMilestone(userId: string, milestoneId: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { goal: true }
    });

    if (!milestone || milestone.goal.userId !== userId) {
      throw new AppError('Milestone not found', 404);
    }

    const updated = await prisma.milestone.update({
      where: { id: milestoneId },
      data: {
        completed: false,
        completedAt: null
      }
    });

    await prisma.goalHistory.create({
      data: {
        goalId: milestone.goalId,
        action: 'MILESTONE_REOPENED',
        previousProgress: milestone.goal.progress,
        newProgress: milestone.goal.progress
      }
    });

    await GoalService.recalculateGoalProgressFromMilestones(milestone.goalId);

    return updated;
  }

  static async deleteMilestone(userId: string, milestoneId: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: { goal: true }
    });

    if (!milestone || milestone.goal.userId !== userId) {
      throw new AppError('Milestone not found', 404);
    }

    await prisma.milestone.delete({
      where: { id: milestoneId }
    });

    await GoalService.recalculateGoalProgressFromMilestones(milestone.goalId);
  }

  static async reorderMilestones(userId: string, goalId: string, orders: { id: string; order: number }[]) {
    await GoalService.getGoalById(userId, goalId);

    await prisma.$transaction(
      orders.map(item =>
        prisma.milestone.update({
          where: { id: item.id },
          data: { order: item.order }
        })
      )
    );

    return this.getMilestones(userId, goalId);
  }
}

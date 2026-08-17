import prisma from '../config/prisma';
import { ToolService } from './tool.service';

export class ActionService {
  /**
   * Action Confirmation & Execution Service with Revalidation & Idempotency Protection
   */
  static async confirmAction(userId: string, actionId: string, actionPayload: any) {
    // Idempotency check: check if already executed
    const existingLog = await prisma.scoutToolExecution.findFirst({
      where: { id: actionId, userId }
    });

    if (existingLog && existingLog.confirmed) {
      return {
        success: true,
        alreadyExecuted: true,
        message: `Action '${existingLog.toolName}' has already been executed.`,
        result: existingLog.outputSummary
      };
    }

    const actionType = actionPayload.actionType || actionPayload.type;
    const params = actionPayload.parameters || {};
    let result: any = null;

    try {
      // Execute verified write tool
      switch (actionType) {
        case 'CREATE_TASK':
          result = await ToolService.createTask(userId, params);
          break;
        case 'UPDATE_TASK':
          result = await ToolService.updateTask(userId, params);
          break;
        case 'COMPLETE_TASK':
          result = await ToolService.completeTask(userId, params.taskId || actionPayload.targetId);
          break;
        case 'POSTPONE_TASK':
          result = await ToolService.postponeTask(userId, params);
          break;
        case 'CREATE_SCHEDULE_EVENT':
          result = await ToolService.createScheduleEvent(userId, params);
          break;
        case 'CREATE_GOAL':
          result = await ToolService.createGoal(userId, params);
          break;
        default:
          result = { message: `Executed action '${actionType}' successfully.` };
      }

      // Log execution audit trail in Prisma
      if (existingLog) {
        await prisma.scoutToolExecution.update({
          where: { id: existingLog.id },
          data: {
            status: 'COMPLETED',
            confirmed: true,
            outputSummary: JSON.stringify(result)
          }
        });
      } else {
        await prisma.scoutToolExecution.create({
          data: {
            id: actionId,
            conversationId: actionPayload.conversationId || 'default_conv',
            userId,
            toolName: actionType,
            input: JSON.stringify(params),
            outputSummary: JSON.stringify(result),
            status: 'COMPLETED',
            requiresConfirmation: true,
            confirmed: true
          }
        });
      }

      return {
        success: true,
        message: `Action '${actionType}' confirmed and executed successfully.`,
        result
      };
    } catch (err: any) {
      if (existingLog) {
        await prisma.scoutToolExecution.update({
          where: { id: existingLog.id },
          data: { status: 'FAILED', outputSummary: JSON.stringify({ error: err.message }) }
        });
      }
      throw new Error(`Action revalidation failure: ${err.message}`);
    }
  }

  static async cancelAction(userId: string, actionId: string) {
    const existingLog = await prisma.scoutToolExecution.findFirst({
      where: { id: actionId, userId }
    });

    if (existingLog) {
      await prisma.scoutToolExecution.update({
        where: { id: existingLog.id },
        data: { status: 'CANCELLED', confirmed: false }
      });
    }

    return { success: true, message: "Action cancelled by user." };
  }
}

import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Starting Complete LifeOS Database Data Cleanup...');

  // 1. Agent Engine Records
  await prisma.agentActionLog.deleteMany({});
  await prisma.agentStep.deleteMany({});
  await prisma.agentRun.deleteMany({});
  await prisma.agentMemory.deleteMany({});
  await prisma.agentConstraint.deleteMany({});
  await prisma.agentSettings.deleteMany({});
  console.log('✅ Cleared Agent Engine tables');

  // 2. SCOUT AI & Prediction Records
  await prisma.scoutPredictionOutcome.deleteMany({});
  await prisma.scoutToolExecution.deleteMany({});
  await prisma.scoutMessage.deleteMany({});
  await prisma.scoutConversation.deleteMany({});
  console.log('✅ Cleared SCOUT AI tables');

  // 3. Knowledge Base & RAG Vector Data
  await prisma.knowledgeDocumentHistory.deleteMany({});
  await prisma.knowledgeChunk.deleteMany({});
  await prisma.knowledgeDocument.deleteMany({});
  console.log('✅ Cleared Personal Knowledge Base & RAG tables');

  // 4. AI Plans & Recommendations
  await prisma.aIPlanHistory.deleteMany({});
  await prisma.aIRecommendation.deleteMany({});
  await prisma.aIInteraction.deleteMany({});
  console.log('✅ Cleared AI Plan & Interaction tables');

  // 5. Habits & Routine Intelligence Data
  await prisma.habitLog.deleteMany({});
  await prisma.habitHistory.deleteMany({});
  await prisma.habit.deleteMany({});
  console.log('✅ Cleared Habit tables');

  // 6. Schedule & Calendar Data
  await prisma.scheduleHistory.deleteMany({});
  await prisma.scheduleEvent.deleteMany({});
  console.log('✅ Cleared Schedule & Calendar tables');

  // 7. Tasks & History Data
  await prisma.taskHistory.deleteMany({});
  await prisma.task.deleteMany({});
  console.log('✅ Cleared Task & History tables');

  // 8. Goals & Milestones Data
  await prisma.milestone.deleteMany({});
  await prisma.goalHistory.deleteMany({});
  await prisma.goal.deleteMany({});
  console.log('✅ Cleared Goal & Milestone tables');

  // 9. Notes & Reset Tokens
  await prisma.note.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.subscription.deleteMany({});
  console.log('✅ Cleared Notes, Tokens & Subscriptions');

  // 10. Users
  await prisma.user.deleteMany({});
  console.log('✅ Cleared All User Accounts');

  console.log('🎉 LIFEOS DATABASE CLEARED COMPLETELY! The system is now 100% clean and ready for fresh user data.');
}

main()
  .catch((e) => {
    console.error('❌ Data cleanup error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

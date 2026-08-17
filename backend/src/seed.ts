import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting LifeOS Database Seed for Phase 8 (Predictive ML Engine)...');

  // ============================================================
  // DEMO ACCOUNT CONFIGURATION
  // ============================================================
  //
  // IMPORTANT:
  // Never hardcode personal credentials in source code.
  //
  // Set these values in backend/.env:
  //
  // SEED_EMAIL="demo@lifeos.app"
  // SEED_PASSWORD="ChangeMe123!"
  //
  // The fallback values below are generic demo values only.
  // ============================================================

  const plainPassword = process.env.SEED_PASSWORD || 'ChangeMe123!';
  const demoEmail = process.env.SEED_EMAIL || 'demo@lifeos.app';

  const passwordHash = await bcrypt.hash(plainPassword, 10);

  // ============================================================
  // 1. CREATE OR FIND DEMO USER
  // ============================================================

  let user = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'LifeOS Demo User',
        email: demoEmail,

        // Legacy password field retained because the current
        // Prisma schema requires it.
        //
        // IMPORTANT:
        // This should eventually be removed from the production
        // schema once the legacy plaintext-password migration
        // is completely finished.
        password: plainPassword,

        // Secure password representation.
        passwordHash,

        // Generic non-personal demo profile information.
        age: 25,
        dob: null,
        sex: null,
        bloodGroup: null,
        phone: null,

        // Generic security question/answer for demo purposes.
        securityQuestion: 'What is your favorite color?',
        securityAnswer: 'blue',

        timezone: 'Asia/Kolkata',
        currentPlan: 'ELITE',
      },
    });

    console.log(
      `✅ Created demo user: ${user.name} (${user.email})`
    );
  } else {
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: plainPassword,
        passwordHash,
        timezone: 'Asia/Kolkata',
        currentPlan: 'ELITE',
      },
    });

    console.log(
      `ℹ️ Demo user exists & updated: ${user.name} (${user.email})`
    );
  }

  const userId = user.id;

  // ============================================================
  // CLEAN EXISTING DEMO ENTRIES
  // ============================================================

  await prisma.habitLog.deleteMany({
    where: { userId },
  });

  await prisma.habitHistory.deleteMany({
    where: {
      habit: {
        userId,
      },
    },
  });

  await prisma.habit.deleteMany({
    where: { userId },
  });

  await prisma.taskHistory.deleteMany({
    where: {
      task: {
        userId,
      },
    },
  });

  await prisma.task.deleteMany({
    where: { userId },
  });

  await prisma.goalHistory.deleteMany({
    where: {
      goal: {
        userId,
      },
    },
  });

  await prisma.milestone.deleteMany({
    where: {
      goal: {
        userId,
      },
    },
  });

  await prisma.goal.deleteMany({
    where: { userId },
  });

  await prisma.scheduleHistory.deleteMany({
    where: {
      event: {
        userId,
      },
    },
  });

  await prisma.scheduleEvent.deleteMany({
    where: { userId },
  });

  await prisma.note.deleteMany({
    where: { userId },
  });

  console.log('🧹 Cleaned existing sample records for demo user.');

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================

  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  const makeDate = (
    daysAgo: number,
    hour: number,
    minute: number = 0
  ) => {
    const d = new Date();

    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour, minute, 0, 0);

    return d;
  };

  // ============================================================
  // 2. SEED GOALS & MILESTONES
  // ============================================================

  console.log('🎯 Seeding Goals, Milestones & GoalHistories...');

  const goal1 = await prisma.goal.create({
    data: {
      userId,

      title: 'Become Job Ready',

      description:
        'Complete MERN stack mastery, Data Structures & Algorithms, and System Architecture for placement interviews.',

      category: 'Career',

      priority: 'URGENT',

      startDate: addDays(-30),

      targetDate: addDays(30),

      progress: 66.7,

      status: 'ACTIVE',

      milestones: {
        create: [
          {
            title: 'Master HTML5, CSS3 & Responsive Design',
            order: 1,
            completed: true,
            completedAt: makeDate(25, 18),
          },

          {
            title: 'Complete Advanced React & TypeScript',
            order: 2,
            completed: true,
            completedAt: makeDate(18, 19),
          },

          {
            title: 'Build Node.js & Express REST Backend',
            order: 3,
            completed: true,
            completedAt: makeDate(10, 20),
          },

          {
            title: 'Solve 100+ LeetCode DSA Questions',
            order: 4,
            completed: true,
            completedAt: makeDate(2, 19),
          },

          {
            title: 'Implement AI & Microservices Layer',
            order: 5,
            completed: false,
          },

          {
            title: 'Finalize Portfolio & Mock Interviews',
            order: 6,
            completed: false,
          },
        ],
      },

      goalHistories: {
        create: [
          {
            action: 'CREATED',
            newProgress: 0,
            newStatus: 'ACTIVE',
            timestamp: addDays(-30),
          },

          {
            action: 'MILESTONE_COMPLETED',
            previousProgress: 0,
            newProgress: 16.7,
            timestamp: addDays(-25),
          },

          {
            action: 'MILESTONE_COMPLETED',
            previousProgress: 16.7,
            newProgress: 33.3,
            timestamp: addDays(-18),
          },

          {
            action: 'MILESTONE_COMPLETED',
            previousProgress: 33.3,
            newProgress: 50.0,
            timestamp: addDays(-10),
          },

          {
            action: 'MILESTONE_COMPLETED',
            previousProgress: 50.0,
            newProgress: 66.7,
            timestamp: addDays(-2),
          },
        ],
      },
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      userId,

      title: 'Complete LifeOS Platform Architecture',

      description:
        'Build full-stack personal AI operating system with Task Telemetry, Goal Intelligence, Analytics, and Smart Schedule.',

      category: 'Project',

      priority: 'HIGH',

      startDate: addDays(-14),

      targetDate: addDays(7),

      progress: 80.0,

      status: 'ACTIVE',

      milestones: {
        create: [
          {
            title: 'Phase 1: Auth & JWT System',
            order: 1,
            completed: true,
            completedAt: makeDate(12, 17),
          },

          {
            title: 'Phase 2: App Shell & Dashboard',
            order: 2,
            completed: true,
            completedAt: makeDate(8, 19),
          },

          {
            title: 'Phase 3: Intelligent Task Telemetry',
            order: 3,
            completed: true,
            completedAt: makeDate(4, 20),
          },

          {
            title: 'Phase 4: Goal Intelligence & Milestones',
            order: 4,
            completed: true,
            completedAt: makeDate(1, 18),
          },

          {
            title:
              'Phase 5, 6, 7 & 8: Analytics, AI Schedule, Habits & ML Engine',
            order: 5,
            completed: false,
          },
        ],
      },

      goalHistories: {
        create: [
          {
            action: 'CREATED',
            newProgress: 0,
            newStatus: 'ACTIVE',
            timestamp: addDays(-14),
          },

          {
            action: 'MILESTONE_COMPLETED',
            previousProgress: 0,
            newProgress: 20.0,
            timestamp: addDays(-12),
          },

          {
            action: 'MILESTONE_COMPLETED',
            previousProgress: 20.0,
            newProgress: 40.0,
            timestamp: addDays(-8),
          },

          {
            action: 'MILESTONE_COMPLETED',
            previousProgress: 40.0,
            newProgress: 60.0,
            timestamp: addDays(-4),
          },

          {
            action: 'MILESTONE_COMPLETED',
            previousProgress: 60.0,
            newProgress: 80.0,
            timestamp: addDays(-1),
          },
        ],
      },
    },
  });

  // ============================================================
  // 3. SEED 110 TASKS
  // ============================================================

  console.log(
    '📌 Seeding 110 Tasks for Scikit-Learn Machine Learning Training...'
  );

  const categories = [
    'Project',
    'Academic',
    'Career',
    'Health',
    'General',
    'Personal',
  ];

  const priorities: (
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'URGENT'
  )[] = [
      'LOW',
      'MEDIUM',
      'HIGH',
      'URGENT',
    ];

  for (let i = 1; i <= 110; i++) {
    const isCompleted = i <= 85;

    const daysAgo =
      Math.floor(((110 - i) / 110) * 45) + 1;

    const cat =
      categories[i % categories.length];

    const prio =
      priorities[i % priorities.length];

    const estMins =
      [30, 45, 60, 90, 120][i % 5];

    const isOverdueTarget =
      i % 4 === 0;

    const actualMins = isCompleted
      ? isOverdueTarget
        ? Math.round(estMins * 1.35)
        : Math.round(estMins * 0.95)
      : 0;

    const createdDate =
      makeDate(daysAgo + 3, 10);

    const dueDate = isCompleted
      ? makeDate(daysAgo, 17)
      : addDays(
        i % 5 === 0
          ? 1
          : i % 3 === 0
            ? 3
            : 7
      );

    const completedDate = isCompleted
      ? makeDate(
        daysAgo,
        19,
        (i * 7) % 60
      )
      : null;

    const task = await prisma.task.create({
      data: {
        userId,

        goalId:
          i % 3 === 0
            ? goal1.id
            : i % 4 === 0
              ? goal2.id
              : null,

        title:
          `Task Feature Sample #${i}: ${cat} Sprint`,

        description:
          `Dataset task sample for machine learning prediction models #${i}`,

        category: cat,

        priority: prio,

        status: isCompleted
          ? 'COMPLETED'
          : i % 2 === 0
            ? 'IN_PROGRESS'
            : 'TODO',

        dueDate,

        estimatedMinutes: estMins,

        actualMinutes: actualMins,

        energyLevel:
          i % 3 === 0
            ? 'HIGH'
            : 'MEDIUM',

        createdAt: createdDate,

        startedAt: isCompleted
          ? makeDate(daysAgo, 18)
          : null,

        completedAt: completedDate,
      },
    });

    // ----------------------------------------------------------
    // Create postponement histories for a subset of tasks.
    // ----------------------------------------------------------

    if (i % 3 === 0) {
      await prisma.taskHistory.create({
        data: {
          taskId: task.id,

          action: 'POSTPONED',

          previousDueDate:
            makeDate(daysAgo + 2, 17),

          newDueDate: dueDate,

          timestamp:
            makeDate(daysAgo + 1, 14),
        },
      });
    }
  }

  // ============================================================
  // 4. SEED HABITS
  // ============================================================

  console.log(
    '🔄 Seeding 6 Realistic Habits & 30-Day Logs...'
  );

  const habit1 = await prisma.habit.create({
    data: {
      userId,

      goalId: goal1.id,

      name: 'DSA & System Design Practice',

      description:
        'Solve 1 complex algorithmic or system design problem daily.',

      category: 'Learning',

      frequency: 'DAILY',

      targetValue: 60,

      targetUnit: 'minutes',

      preferredTime: '19:00',

      priority: 'URGENT',

      currentStreak: 21,

      longestStreak: 28,

      isActive: true,

      habitHistories: {
        create: {
          action: 'CREATED',
        },
      },
    },
  });

  const habit2 = await prisma.habit.create({
    data: {
      userId,

      name: 'Daily 45-Min High Intensity Exercise',

      description:
        'Cardio and strength training session.',

      category: 'Fitness',

      frequency: 'WEEKDAYS',

      targetValue: 45,

      targetUnit: 'minutes',

      preferredTime: '07:00',

      priority: 'HIGH',

      currentStreak: 14,

      longestStreak: 20,

      isActive: true,

      habitHistories: {
        create: {
          action: 'CREATED',
        },
      },
    },
  });

  const habit3 = await prisma.habit.create({
    data: {
      userId,

      goalId: goal2.id,

      name: 'Work on LifeOS Architecture',

      description:
        'Daily code sprint on full-stack AI features.',

      category: 'Work',

      frequency: 'DAILY',

      targetValue: 90,

      targetUnit: 'minutes',

      preferredTime: '18:00',

      priority: 'HIGH',

      currentStreak: 18,

      longestStreak: 25,

      isActive: true,

      habitHistories: {
        create: {
          action: 'CREATED',
        },
      },
    },
  });

  const habit4 = await prisma.habit.create({
    data: {
      userId,

      name: 'Read 20 Pages of Tech & Philosophy',

      description:
        'Expand knowledge horizons daily.',

      category: 'Personal',

      frequency: 'DAILY',

      targetValue: 20,

      targetUnit: 'pages',

      preferredTime: '21:30',

      priority: 'MEDIUM',

      currentStreak: 8,

      longestStreak: 15,

      isActive: true,

      habitHistories: {
        create: {
          action: 'CREATED',
        },
      },
    },
  });

  const habit5 = await prisma.habit.create({
    data: {
      userId,

      name: 'Sleep Before 11:00 PM',

      description:
        'Circadian rhythm optimization.',

      category: 'Health',

      frequency: 'DAILY',

      targetValue: 1,

      targetUnit: 'session',

      preferredTime: '23:00',

      priority: 'MEDIUM',

      currentStreak: 5,

      longestStreak: 12,

      isActive: true,

      habitHistories: {
        create: {
          action: 'CREATED',
        },
      },
    },
  });

  // ============================================================
  // 5. SEED 30-DAY HABIT LOGS
  // ============================================================

  const habitLogSeed: any[] = [];

  const habitsToSeed = [
    habit1,
    habit2,
    habit3,
    habit4,
    habit5,
  ];

  for (let i = 0; i < 30; i++) {
    const d = addDays(-i);

    const dateStr =
      d.toISOString().split('T')[0];

    habitsToSeed.forEach((h, hIdx) => {
      let status = 'COMPLETED';

      let val = h.targetValue;

      if (i % (hIdx + 3) === 0 && i > 5) {
        status = 'PARTIAL';

        val = Math.round(
          h.targetValue * 0.6
        );
      } else if (
        i % (hIdx + 7) === 0 &&
        i > 10
      ) {
        status = 'MISSED';

        val = 0;
      }

      habitLogSeed.push({
        habitId: h.id,

        userId,

        date: dateStr,

        status,

        value: val,

        targetValue: h.targetValue,

        completedAt:
          status === 'COMPLETED'
            ? makeDate(
              i,
              19 + (hIdx % 3)
            )
            : null,
      });
    });
  }

  await prisma.habitLog.createMany({
    data: habitLogSeed,

    skipDuplicates: true,
  });

  // ============================================================
  // COMPLETE
  // ============================================================

  console.log(
    '✨ Seed Script Finished Successfully for Phase 8 (Predictive ML Engine)!'
  );

  console.log('');
  console.log('────────────────────────────────────────────');
  console.log('LifeOS Demo Account');
  console.log('────────────────────────────────────────────');
  console.log(`Email: ${demoEmail}`);
  console.log(
    'Password: value supplied through SEED_PASSWORD'
  );
  console.log('────────────────────────────────────────────');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
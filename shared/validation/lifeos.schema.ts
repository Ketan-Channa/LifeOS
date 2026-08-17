import { z } from 'zod';

export const priorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
export const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']);
export const energyLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const goalStatusEnum = z.enum(['ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED']);
export const eventTypeEnum = z.enum(['TASK', 'CLASS', 'WORK', 'PERSONAL', 'MEETING', 'EXERCISE', 'OTHER']);
export const frequencyEnum = z.enum(['DAILY', 'WEEKLY', 'WEEKDAYS', 'CUSTOM']);
export const habitLogStatusEnum = z.enum(['COMPLETED', 'PARTIAL', 'MISSED', 'SKIPPED']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional().nullable(),
  category: z.string().default('General'),
  priority: priorityEnum.default('MEDIUM'),
  status: taskStatusEnum.default('TODO'),
  dueDate: z.string().optional().nullable(),
  estimatedMinutes: z.number().int().min(1, 'Estimated duration must be positive').default(30),
  actualMinutes: z.number().int().min(0).default(0),
  energyLevel: energyLevelEnum.default('MEDIUM'),
  scheduledStart: z.string().optional().nullable(),
  scheduledEnd: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  milestoneId: z.string().optional().nullable()
});

export const updateTaskSchema = createTaskSchema.partial();

export const postponeTaskSchema = z.object({
  newDueDate: z.string().min(1, 'New due date is required')
});

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required').max(200),
  description: z.string().optional().nullable(),
  category: z.string().default('General'),
  priority: priorityEnum.default('MEDIUM'),
  startDate: z.string().optional().nullable(),
  targetDate: z.string().min(1, 'Target date is required'),
  progress: z.number().min(0).max(100).default(0),
  status: goalStatusEnum.default('ACTIVE')
});

export const updateGoalSchema = createGoalSchema.partial();

export const createMilestoneSchema = z.object({
  title: z.string().min(1, 'Milestone title is required').max(200),
  description: z.string().optional().nullable(),
  order: z.number().int().min(1).default(1)
});

export const updateMilestoneSchema = createMilestoneSchema.partial();

export const createScheduleEventSchema = z.object({
  title: z.string().min(1, 'Event title is required').max(200),
  description: z.string().optional().nullable(),
  type: eventTypeEnum.default('OTHER'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  priority: priorityEnum.default('MEDIUM'),
  location: z.string().optional().nullable(),
  isAllDay: z.boolean().default(false),
  recurrenceRule: z.string().optional().nullable(),
  reminderMinutes: z.number().int().optional().nullable(),
  linkedTaskId: z.string().optional().nullable(),
  linkedGoalId: z.string().optional().nullable()
});

export const updateScheduleEventSchema = createScheduleEventSchema.partial();

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(150),
  description: z.string().optional().nullable(),
  category: z.string().default('Health'),
  frequency: frequencyEnum.default('DAILY'),
  customDays: z.string().optional().nullable(),
  targetValue: z.number().min(0.1, 'Target value must be positive').default(1.0),
  targetUnit: z.string().default('session'),
  preferredTime: z.string().optional().nullable(),
  priority: priorityEnum.default('MEDIUM'),
  startDate: z.string().optional().nullable(),
  reminderMinutes: z.number().int().optional().nullable(),
  goalId: z.string().optional().nullable()
});

export const updateHabitSchema = createHabitSchema.partial();

export const logHabitSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  status: habitLogStatusEnum.default('COMPLETED'),
  value: z.number().min(0).default(1.0),
  notes: z.string().optional().nullable()
});

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Note title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  category: z.string().default('General')
});

export const updateNoteSchema = createNoteSchema.partial();

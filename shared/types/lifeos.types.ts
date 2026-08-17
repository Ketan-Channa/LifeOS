export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | 'ALL' | string;
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ALL' | string;
export type EnergyLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED' | 'ALL' | string;
export type EventType = 'TASK' | 'CLASS' | 'WORK' | 'PERSONAL' | 'MEETING' | 'EXERCISE' | 'OTHER';
export type Frequency = 'DAILY' | 'WEEKLY' | 'WEEKDAYS' | 'CUSTOM';
export type HabitLogStatus = 'COMPLETED' | 'PARTIAL' | 'MISSED' | 'SKIPPED';

export type TaskAction = 
  | 'CREATED' 
  | 'STARTED' 
  | 'PAUSED' 
  | 'RESUMED' 
  | 'POSTPONED' 
  | 'COMPLETED' 
  | 'REOPENED' 
  | 'PRIORITY_CHANGED' 
  | 'EDITED';

export type GoalAction =
  | 'CREATED'
  | 'UPDATED'
  | 'PROGRESS_CHANGED'
  | 'MILESTONE_COMPLETED'
  | 'MILESTONE_REOPENED'
  | 'STATUS_CHANGED'
  | 'PAUSED'
  | 'RESUMED'
  | 'COMPLETED'
  | 'ARCHIVED';

export type ScheduleAction =
  | 'CREATED'
  | 'UPDATED'
  | 'MOVED'
  | 'RESIZED'
  | 'DELETED';

export type HabitAction =
  | 'CREATED'
  | 'UPDATED'
  | 'COMPLETED'
  | 'SKIPPED'
  | 'PAUSED'
  | 'RESUMED'
  | 'TARGET_CHANGED'
  | 'FREQUENCY_CHANGED'
  | 'ARCHIVED';

export interface TaskHistoryItem {
  id: string;
  taskId: string;
  action: TaskAction | string;
  previousStatus?: string | null;
  newStatus?: string | null;
  previousDueDate?: string | Date | null;
  newDueDate?: string | Date | null;
  timestamp: string | Date;
}

export interface GoalHistoryItem {
  id: string;
  goalId: string;
  action: GoalAction | string;
  previousProgress?: number | null;
  newProgress?: number | null;
  previousStatus?: string | null;
  newStatus?: string | null;
  timestamp: string | Date;
}

export interface ScheduleHistoryItem {
  id: string;
  eventId: string;
  action: ScheduleAction | string;
  previousStartTime?: string | Date | null;
  newStartTime?: string | Date | null;
  previousEndTime?: string | Date | null;
  newEndTime?: string | Date | null;
  timestamp: string | Date;
}

export interface HabitHistoryItem {
  id: string;
  habitId: string;
  action: HabitAction | string;
  metadata?: string | null;
  timestamp: string | Date;
}

export interface TaskItem {
  id: string;
  userId: string;
  goalId?: string | null;
  milestoneId?: string | null;
  title: string;
  description?: string | null;
  category: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string | null;
  estimatedMinutes: number;
  actualMinutes: number;
  energyLevel: EnergyLevel;
  scheduledStart?: string | null;
  scheduledEnd?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  updatedAt: string;
  goal?: GoalItem | null;
  taskHistories?: TaskHistoryItem[];
  riskPrediction?: TaskRiskPrediction | null;
}

export interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  dueToday?: number;
  postponedTasks?: number;
  completionRate: number;
  onTimeRate: number;
  estimationErrorPercentage?: number;
  averageDelayMinutes?: number;
  mostPostponedCategory?: string;
  totalTimeSpentMinutes: number;
  averageTimeSpentMinutes: number;
}

export interface TaskFilterParams {
  status?: TaskStatus;
  priority?: Priority;
  category?: string;
  goalId?: string;
  deadline?: string;
  energy?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface MilestoneItem {
  id: string;
  goalId: string;
  title: string;
  description?: string | null;
  order: number;
  completed: boolean;
  completedAt?: string | null;
  createdAt: string;
}

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  category: string;
  priority: Priority;
  startDate: string;
  targetDate?: string | null;
  progress: number;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
  milestones?: MilestoneItem[];
  tasks?: TaskItem[];
  goalHistories?: GoalHistoryItem[];
  riskEstimate?: string;
  isOverdue?: boolean;
  daysRemaining?: number;
  velocity?: number;
}

export interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overdueGoals?: number;
  averageProgress: number;
  averageGoalProgress?: number;
  mostActiveCategory?: string;
  milestoneCompletionRate: number;
  milestonesTotal?: number;
  milestonesCompleted?: number;
  goalVelocity?: number;
  averageVelocity?: number;
}

export interface GoalFilterParams {
  status?: GoalStatus;
  priority?: Priority;
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ScheduleEventItem {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  type: EventType;
  startTime: string;
  endTime: string;
  priority: Priority;
  location?: string | null;
  isAllDay: boolean;
  recurrenceRule?: string | null;
  reminderMinutes?: number | null;
  linkedTaskId?: string | null;
  linkedGoalId?: string | null;
  createdAt: string;
  updatedAt: string;
  linkedTask?: TaskItem | null;
  linkedGoal?: GoalItem | null;
  scheduleHistories?: ScheduleHistoryItem[];
}

export interface ScheduleStats {
  totalScheduledHours: number;
  scheduledHoursToday?: number;
  completedScheduledHours: number;
  freeHours: number;
  freeHoursToday?: number;
  conflictCount: number;
}

export interface ScheduleConflict {
  eventId1: string;
  title1: string;
  eventId2: string;
  title2: string;
  eventA?: any;
  eventB?: any;
  overlapMinutes: number;
}

export interface FreeTimeSlot {
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface ScheduleAdherence {
  adherencePercentage: number;
  scheduledTasksCompletedCount: number;
  totalScheduledTasksCount: number;
}

export interface HabitLogItem {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  status: HabitLogStatus;
  value: number;
  targetValue: number;
  completedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HabitItem {
  id: string;
  userId: string;
  goalId?: string | null;
  name: string;
  description?: string | null;
  category: string;
  frequency: Frequency;
  customDays?: string | null;
  targetValue: number;
  targetUnit: string;
  preferredTime?: string | null;
  priority: Priority;
  startDate: string;
  reminderMinutes?: number | null;
  isActive: boolean;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
  updatedAt: string;
  goal?: GoalItem | null;
  habitLogs?: HabitLogItem[];
  habitHistories?: HabitHistoryItem[];
  completedToday?: boolean;
  todayLog?: HabitLogItem | null;
}

export interface HabitSummaryStats {
  totalHabits: number;
  activeHabits: number;
  todayCompletedCount: number;
  completedToday?: number;
  overallConsistencyPercentage: number;
  averageConsistency?: number;
  longestActiveStreak: number;
  bestCurrentStreak?: number;
  routineScore?: number;
}

export interface NoteItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIPlanItem {
  title: string;
  category: string;
  priority: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  relatedTaskId?: string;
  relatedGoalId?: string;
  reason: string;
}

export interface AIDailyPlan {
  available: boolean;
  date: string;
  totalScheduledHours: number;
  freeHoursRemaining: number;
  scheduleItems: AIPlanItem[];
  reasoning: string;
}

export interface AIRecommendationItem {
  type: string;
  title: string;
  reason: string;
  priority: Priority;
  suggestedAction?: string;
}

export interface ProductivityScoreData {
  score: number;
  trend: 'UP' | 'DOWN' | 'STABLE' | 'IMPROVING';
  componentScores: {
    completionRateScore: number;
    onTimeScore: number;
    habitConsistencyScore: number;
    focusHoursScore: number;
  };
  explanation: string;
}

export interface BehavioralPattern {
  id: string;
  name: string;
  title?: string;
  type?: string;
  description: string;
  confidenceScore: number;
  confidence?: number;
  confidenceLabel?: string;
  metric?: string;
  dataPoints?: number;
  period?: string;
  impact: 'HIGH_POSITIVE' | 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'HIGH_NEGATIVE';
  supportingData: string;
}

export interface HabitCorrelationData {
  habitId: string;
  habitName: string;
  correlatedHabitId: string;
  correlatedHabitName: string;
  correlationCoefficient: number;
  relationshipStrength: 'STRONG_POSITIVE' | 'MODERATE_POSITIVE' | 'WEAK' | 'NEGATIVE';
  insightText: string;
  description?: string;
}

export interface RoutineAnalyticsData {
  available?: boolean;
  reason?: string | null;
  bestHabitDay?: string;
  bestHabitHour?: any;
  bestHabitDays: { day: string; completionRate: number }[];
  bestHabitTimes: { window: string; successRate: number }[];
  routineScore: number;
  routineScoreTrend?: string;
  averageConsistencyPercentage?: number;
  habitCorrelations: HabitCorrelationData[];
  correlations?: HabitCorrelationData[];
  dataPoints: number;
  period: string;
}

export interface AnalyticsOverviewData {
  available: boolean;
  reason?: string | null;
  productivityScore: ProductivityScoreData;
  taskCompletionRate: number;
  onTimeCompletionRate: number;
  averageEstimationErrorPercentage: number;
  averageDelayMinutes: number;
  postponementRatePercentage: number;
  workloadPressure: 'LOW' | 'MEDIUM' | 'HIGH';
  topPatterns: BehavioralPattern[];
  routineAnalytics?: RoutineAnalyticsData | null;
}

export interface DashboardOverview {
  user: {
    id: string;
    name: string;
    email: string;
    currentPlan: string;
  };
  stats: {
    productivityScore: number;
    tasksTodayCount: number;
    focusTimeMinutes: number;
    activeGoalsCount: number;
    habitStreakDays: number;
    upcomingDeadlinesCount: number;
    routineScore?: number;
  };
  tasks: {
    today: TaskItem[];
    completedTodayCount: number;
    pendingCount: number;
    overdueCount: number;
  };
  deadlines: TaskItem[];
  goals: GoalItem[];
  habits: HabitItem[];
  scheduleEventsToday: ScheduleEventItem[];
  recentNotes: NoteItem[];
  productivityData: {
    day: string;
    completedTasks: number;
    focusHours: number;
  }[];
}

/* Phase 8 ML Prediction Interfaces */
export interface TaskRiskPrediction {
  available: boolean;
  taskId?: string;
  riskScore: number; // 0 - 100
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH';
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
  riskProbability?: number;
  postponementProbability?: number;
  modelVersion?: string;
  reason?: string;
  topFactors: { factor: string; impact: string }[];
  recommendedBufferMinutes: number;
}

export interface GoalRiskPrediction {
  available: boolean;
  goalId?: string;
  completionProbability: number; // 0 - 100
  riskLevel?: string;
  onTrack: boolean;
  historicalVelocity?: number;
  recommendation?: string;
  requiredDailyProgress: number;
  currentVelocity: number;
}

export interface ProductivityForecast {
  available: boolean;
  forecastScore: number;
  tomorrowForecast?: number;
  forecastRange?: any;
  predictedProductivityTrend: { day: string; score: number }[];
}

export interface WorkloadPrediction {
  available: boolean;
  workloadRisk: 'LOW' | 'NORMAL' | 'HIGH';
  riskProbability?: number;
  capacityUsagePercentage: number;
  scheduledHours: number;
  capacityHours: number;
  historicalCapacity?: number;
  suggestedAction?: string;
}

export interface PredictionsOverview {
  available: boolean;
  reason?: string;
  highRiskTasksCount: number;
  mediumRiskTasksCount: number;
  highRiskGoalsCount: number;
  tomorrowWorkloadRisk: 'LOW' | 'NORMAL' | 'HIGH';
  tomorrowProductivityForecast: number;
  modelsLoaded: string[];
}

/* AI Plan My Day 2.0 Multi-Event Planner Interfaces */
export interface PlanItemInput {
  id?: string;
  title: string;
  description?: string;
  durationMinutes: number;
  priority: Priority;
  category: string;
  energyLevel: EnergyLevel;
  deadline?: string | null;
  preferredStartTime?: string | null;
  preferredEndTime?: string | null;
  isFixed?: boolean;
  isFlexible?: boolean;
  linkedTaskId?: string | null;
  linkedGoalId?: string | null;
  dependencyIds?: string[];
  breakAfter?: number;
  notes?: string;
}

export interface ScheduledPlanBlock {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  energyLevel: EnergyLevel;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isBreak: boolean;
  isFixed: boolean;
  linkedTaskId?: string | null;
  linkedGoalId?: string | null;
  deadlineRisk?: number | null;
  reason: string;
}

export interface PlanScoreBreakdown {
  deadlineHandling: number;
  priorityHandling: number;
  scheduleFit: number;
  workloadBalance: number;
  goalAlignment: number;
  riskReduction: number;
}

export interface CandidatePlanData {
  planId: string;
  planName: string;
  strategyKey: 'BALANCED' | 'DEADLINE_FIRST' | 'FOCUS_OPTIMIZED' | 'LOW_STRESS';
  overallScore: number;
  scoreBreakdown: PlanScoreBreakdown;
  totalScheduledHours: number;
  freeHoursRemaining: number;
  scheduledItemsCount: number;
  unscheduledItemsCount: number;
  breakCount: number;
  highPriorityScheduledCount: number;
  scheduleBlocks: ScheduledPlanBlock[];
  unscheduledItems: { item: PlanItemInput; reason: string }[];
  aiExplanation: string;
  whyThisPlanReasons: string[];
  strength: string;
  tradeOff: string;
  evidenceLevel: string;
}

export interface MultiPlanGenerationResponse {
  available: boolean;
  date: string;
  windowStart: string;
  windowEnd: string;
  isOverloaded: boolean;
  requiredMinutes: number;
  availableMinutes: number;
  overloadMessage?: string | null;
  plans: CandidatePlanData[];
  recommendedPlanId: string;
}

/* Phase 9 Personal Knowledge Base & RAG Interfaces */
export type DocumentProcessingStatus = 'UPLOADED' | 'PROCESSING' | 'READY' | 'FAILED';

export interface KnowledgeChunkItem {
  id?: string;
  documentId: string;
  userId: string;
  chunkIndex: number;
  content: string;
  tokenCount: number;
  metadata?: string | { pageNumber?: number; section?: string; heading?: string } | null;
  createdAt: string;
}

export interface KnowledgeDocumentHistoryItem {
  id: string;
  documentId: string;
  userId: string;
  action: 'UPLOADED' | 'PROCESSING_STARTED' | 'PROCESSING_COMPLETED' | 'PROCESSING_FAILED' | 'UPDATED' | 'DELETED' | 'QUERIED' | string;
  timestamp: string;
  metadata?: string | null;
}

export interface KnowledgeDocumentItem {
  id: string;
  userId: string;
  title: string;
  originalFileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  description?: string | null;
  tags?: string | null;
  storagePath: string;
  processingStatus: DocumentProcessingStatus;
  pageCount: number;
  wordCount: number;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  chunks?: KnowledgeChunkItem[];
  history?: KnowledgeDocumentHistoryItem[];
  _count?: { chunks: number };
}

export interface KnowledgeStats {
  totalDocuments: number;
  totalPages: number;
  totalWords: number;
  totalChunks: number;
  categoriesCount: number;
  categories: string[];
  recentDocuments: KnowledgeDocumentItem[];
}

export interface SourceCitation {
  documentId: string;
  documentTitle: string;
  pageNumber: number;
  section: string;
  chunkId: string;
  relevanceScore: number;
  excerpt: string;
}

export interface GroundedAnswerResponse {
  available: boolean;
  answer: string;
  sources: SourceCitation[];
  retrievalAvailable: boolean;
  intentCategory?: string;
  insufficientEvidence?: boolean;
}

export interface DocumentComparisonResponse {
  documentATitle: string;
  documentBTitle: string;
  commonInformation: string[];
  onlyInA: string[];
  onlyInB: string[];
  keyDifferences: string[];
  summaryComparison: string;
}

/* Phase 10 SCOUT AI Agent Interfaces */
export interface ScoutActionItem {
  id?: string;
  actionType: string;
  targetId?: string | null;
  title: string;
  parameters?: Record<string, any>;
  oldValue?: any;
  newValue?: any;
  reason: string;
  requiresConfirmation: boolean;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  confirmed?: boolean;
}

export interface ScoutSourceBadge {
  type: 'LIFEOS_DATA' | 'KNOWLEDGE_BASE' | 'ML_PREDICTION' | 'AI_RECOMMENDATION' | string;
  label: string;
  details?: string | null;
  documentId?: string | null;
  pageNumber?: number | null;
}

export interface ScoutRecommendationItem {
  title: string;
  reason: string;
  actionText: string;
  actionType?: string | null;
  parameters?: Record<string, any> | null;
}

export interface ScoutStructuredResponse {
  success: boolean;
  conversationId?: string | null;
  answer: string;
  intent: string;
  sources: ScoutSourceBadge[];
  data?: Record<string, any>;
  recommendations: ScoutRecommendationItem[];
  actions: ScoutActionItem[];
  requiresConfirmation: boolean;
  thinkingState?: string;
}

export interface ScoutConversationItem {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages?: ScoutMessageItem[];
  _count?: { messages: number };
}

export interface ScoutMessageItem {
  id: string;
  conversationId: string;
  userId: string;
  role: 'USER' | 'ASSISTANT' | 'TOOL' | 'SYSTEM';
  content: string;
  intent?: string | null;
  sources?: string | ScoutSourceBadge[] | null;
  actions?: string | ScoutActionItem[] | null;
  createdAt: string;
}

export interface ScoutBriefingItem {
  date: string;
  greeting: string;
  overviewText: string;
  scheduledEventsCount: number;
  highRiskDeadlinesCount: number;
  habitsCount: number;
  atRiskGoalTitle?: string | null;
  topRecommendedFocus: string;
  whyThisFocus: string[];
  actions: ScoutActionItem[];
}

export interface ScoutWeeklyReviewItem {
  startDate: string;
  endDate: string;
  productivityScoreTrend: number;
  tasksCompletedCount: number;
  taskCompletionRate: number;
  postponementsCount: number;
  goalProgressSummary: string;
  habitConsistencyRate: number;
  mlAccuracyRate: number;
  wins: string[];
  patternsObserved: string[];
  recommendations: ScoutRecommendationItem[];
}

/* Phase 11 Autonomous AI Agent Interfaces */
export interface AgentStepItem {
  id?: string;
  agentRunId?: string;
  stepNumber: number;
  stepType: 'OBSERVE' | 'PLAN' | 'TOOL_CALL' | 'USER_APPROVAL' | 'EVALUATION' | string;
  description: string;
  toolName?: string | null;
  inputSummary?: any;
  outputSummary?: any;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  requiresApproval: boolean;
  approved?: boolean;
  startedAt?: string | null;
  completedAt?: string | null;
}

export interface AgentRunItem {
  id: string;
  userId: string;
  conversationId?: string | null;
  objective: string;
  intent: string;
  status: 'IDLE' | 'OBSERVING' | 'PLANNING' | 'WAITING_FOR_APPROVAL' | 'EXECUTING' | 'EVALUATING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'RUNNING' | string;
  autonomyLevel: 'AUTONOMY_0' | 'AUTONOMY_1' | 'AUTONOMY_2' | 'AUTONOMY_3' | 'AUTONOMY_4' | string;
  startedAt: string;
  completedAt?: string | null;
  currentStep?: number;
  result?: string | null;
  error?: string | null;
  steps?: AgentStepItem[];
  requiresApproval?: boolean;
  approvalRequest?: any;
  trace?: string[];
}

export interface AgentSettingsItem {
  id?: string;
  userId: string;
  autonomyLevel: 'AUTONOMY_0' | 'AUTONOMY_1' | 'AUTONOMY_2' | 'AUTONOMY_3' | 'AUTONOMY_4' | string;
  allowLowRiskActions: boolean;
  allowTaskCreation: boolean;
  allowScheduleChanges: boolean;
  allowGoalChanges: boolean;
  allowNotifications: boolean;
  requireConfirmationForWrites: boolean;
}

export interface AgentMemoryItem {
  id: string;
  userId: string;
  type: 'PREFERENCE' | 'WORKFLOW' | 'USER_DEFINED' | 'IMPORTANT_CONTEXT' | string;
  key: string;
  value: string;
  source: string;
  confidence: number;
  createdAt?: string;
}

export interface AgentConstraintItem {
  id: string;
  userId: string;
  type: 'NO_EARLY_MORNING' | 'MAX_DAILY_WORKLOAD' | 'FIXED_EVENT' | 'PREFERRED_FOCUS_WINDOW' | 'GOAL_PRIORITY' | string;
  value: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  active: boolean;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: 'TASK_DUE' | 'TASK_OVERDUE' | 'GOAL_RISK' | 'SCHEDULE_CONFLICT' | 'HABIT_REMINDER' | 'PRODUCTIVITY_INSIGHT' | 'AI_RECOMMENDATION' | 'SYSTEM' | 'SUBSCRIPTION' | 'AGENT_ACTION' | 'GENERAL' | string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  actionUrl?: string | null;
  metadata?: any;
  createdAt: string;
  readAt?: string | null;
}





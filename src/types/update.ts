export type UpdateCategory = 
  | 'Security' 
  | 'Driver' 
  | 'Cumulative' 
  | 'Quality' 
  | 'Defender' 
  | 'Feature';

export type UpdateStatus = 
  | 'Available' 
  | 'Installed' 
  | 'Pending Download' 
  | 'Pending Reboot' 
  | 'Failed';

export type UpdateSeverity = 'Critical' | 'Important' | 'Moderate' | 'Low';

export interface WindowsUpdate {
  id: string;
  kbNumber: string;
  title: string;
  category: UpdateCategory;
  releaseDate: string;
  status: UpdateStatus;
  severity: UpdateSeverity;
  sizeBytes: number;
  rebootRequired: boolean;
  affectedComponents: string[];
  msrcNumber?: string;
  cves?: string[];
  supportUrl?: string;
  rawDescription: string;
  installedDate?: string;
  failureReason?: string;
  isNewDetected?: boolean;
}

export type MemoryType = 'history' | 'preference' | 'feedback' | 'outcome';

export interface HindsightMemory {
  id: string;
  type: MemoryType;
  title: string;
  content: string;
  timestamp: string;
  category?: UpdateCategory | 'general';
  tags: string[];
  impactWeight: number; // 1 to 5
  sourceEvent?: string; // e.g. "KB5042211 outcome" or "User direct feedback"
}

export interface HindsightContext {
  recalledMemories: HindsightMemory[];
  userPreferencesApplied: string[];
  previousOutcomesConsidered: string[];
  reasoningSteps: string[];
  adaptationExplanation: string;
}

export interface UpdateExplanation {
  updateId: string;
  kbNumber: string;
  summary: string;
  updateType: UpdateCategory;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  userImpact: string;
  restartRequired: boolean;
  recommendedAction: string;
  simpleExplanation: string;
  technicalDetails: string;
  mode: 'hindsight' | 'no_memory';
  hindsightContext?: HindsightContext;
  confidenceScore: number;
  generatedAt: string;
}

export interface FeedbackRecord {
  id: string;
  updateId: string;
  kbNumber: string;
  rating: 'positive' | 'negative';
  tag: 'too_technical' | 'too_long' | 'need_details' | 'display_issue' | 'audio_issue' | 'helpful' | 'other';
  comment?: string;
  timestamp: string;
  learnedMemoryId?: string;
}

export interface AgentLearningMetrics {
  totalInteractions: number;
  memoriesStored: number;
  preferenceAdaptations: number;
  outcomesUsed: number;
  readabilityScore: number; // e.g. 92
  lastLearnedEvent: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  modeUsed?: 'hindsight' | 'no_memory';
  recalledMemoriesCount?: number;
  hindsightNotes?: string[];
}

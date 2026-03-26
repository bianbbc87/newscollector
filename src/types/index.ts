export type OpportunityType = 'job' | 'hackathon' | 'program' | 'conference' | 'opensource' | 'trend' | 'paper';
export type OpportunityStatus = 'active' | 'expired' | 'unknown' | 'flagged';
export type CrawlerType = 'api' | 'rss' | 'scraping';
export type ActionType = 'view' | 'click' | 'bookmark' | 'dismiss' | 'apply' | 'deep_dive_request' | 'deep_dive_approve' | 'deep_dive_reject';
export type ApplicationStatus = 'interested' | 'preparing' | 'applied' | 'interview' | 'offered' | 'rejected' | 'withdrawn';
export type ReportType = 'expired' | 'irrelevant' | 'ai_generated' | 'inaccurate' | 'duplicate' | 'spam';
export type DeepLinkType = 'team_blog' | 'maintainer_twitter' | 'past_winners' | 'related_repo' | 'interview_experience' | 'engineering_blog' | 'jd_analysis';
export type NotificationType = 'deadline_approaching' | 'new_match' | 'signal_spike' | 'link_expired' | 'follow_up_reminder' | 'crawl_error';
export type SignalTrend = 'up' | 'down' | 'stable' | 'spike';
export type Priority = 'high' | 'medium' | 'low';

export interface Opportunity {
  id: string;
  type: OpportunityType;
  title: string;
  organization: string;
  url: string;
  description: string;
  deadline: string | null;
  start_date: string | null;
  location: string;
  tags: string[];
  eligibility: string;
  status: OpportunityStatus;
  source_url: string;
  crawl_depth: number;
  relevance_score: number;
  verified_at: string | null;
  created_at: string;
  raw_data: Record<string, unknown>;
}

export interface DeepLink {
  id: string;
  opportunity_id: string;
  link_type: DeepLinkType;
  url: string;
  title: string;
  summary: string;
  relevance_score: number;
  approved: boolean | null;
  crawled_at: string;
}

export interface Signal {
  id: string;
  source: string;
  keyword: string;
  mention_count: number;
  period: string;
  trend: SignalTrend;
  related_opportunities: string[];
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  skills: string[];
  experience: Record<string, unknown>;
  interests: string[];
  target_companies: string[];
  projects: Record<string, unknown>[];
  resume_data: Record<string, unknown>;
  skill_gaps: Record<string, unknown>;
  updated_at: string;
}

export interface UserAction {
  id: string;
  opportunity_id: string | null;
  deep_link_id: string | null;
  action_type: ActionType;
  context: Record<string, unknown>;
  created_at: string;
}

export interface Application {
  id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  applied_at: string | null;
  notes: Record<string, unknown>;
  resume_version: string | null;
  follow_up_date: string | null;
  result_notes: string | null;
  updated_at: string;
}

export interface SkillGap {
  id: string;
  target_company: string;
  target_role: string;
  required_skills: string[];
  my_skills: string[];
  gaps: string[];
  gap_score: number;
  recommendations: Record<string, unknown>;
  analyzed_at: string;
}

export interface Bookmark {
  id: string;
  opportunity_id: string | null;
  deep_link_id: string | null;
  signal_id: string | null;
  collection: string;
  priority: Priority;
  memo: string;
  created_at: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_id: string | null;
  related_type: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  opportunity_id: string;
  report_type: ReportType;
  detail: string;
  resolved: boolean;
  resolution: string | null;
  created_at: string;
}

export interface CrawlConfig {
  id: string;
  source_name: string;
  crawler_type: CrawlerType;
  source_url: string;
  cron_expression: string;
  enabled: boolean;
  priority: Priority;
  adaptive: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  avg_run_duration: number | null;
  error_count: number;
  created_at: string;
}

export interface UserModel {
  id: string;
  user_id: string;
  model_type: string;
  model_version: number;
  training_data_count: number;
  accuracy: number;
  parameters: Record<string, unknown>;
  trained_at: string;
  active: boolean;
}

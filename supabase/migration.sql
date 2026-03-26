-- =============================================
-- NewsCollector: Career Intelligence Dashboard
-- Database Migration - All 12 Tables
-- =============================================

-- 1. opportunities (메인 기회 데이터)
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('job', 'hackathon', 'program', 'conference', 'opensource', 'trend', 'paper')),
  title TEXT NOT NULL,
  organization TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  deadline TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  location TEXT NOT NULL DEFAULT 'global',
  tags TEXT[] NOT NULL DEFAULT '{}',
  eligibility TEXT NOT NULL DEFAULT 'anyone',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'unknown', 'flagged')),
  source_url TEXT NOT NULL DEFAULT '',
  crawl_depth INT NOT NULL DEFAULT 0,
  relevance_score FLOAT NOT NULL DEFAULT 0.5,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_data JSONB NOT NULL DEFAULT '{}'
);

CREATE INDEX idx_opportunities_type ON opportunities(type);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_deadline ON opportunities(deadline);
CREATE INDEX idx_opportunities_relevance ON opportunities(relevance_score DESC);
CREATE INDEX idx_opportunities_tags ON opportunities USING GIN(tags);
CREATE INDEX idx_opportunities_created ON opportunities(created_at DESC);

-- 2. deep_links (딥 크롤링 연결 데이터)
CREATE TABLE IF NOT EXISTS deep_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  link_type TEXT NOT NULL CHECK (link_type IN ('team_blog', 'maintainer_twitter', 'past_winners', 'related_repo', 'interview_experience', 'engineering_blog', 'jd_analysis')),
  url TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  relevance_score FLOAT NOT NULL DEFAULT 0.5,
  approved BOOLEAN,
  crawled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deep_links_opportunity ON deep_links(opportunity_id);
CREATE INDEX idx_deep_links_approved ON deep_links(approved);

-- 3. signals (기술 시그널 트래킹)
CREATE TABLE IF NOT EXISTS signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  keyword TEXT NOT NULL,
  mention_count INT NOT NULL DEFAULT 0,
  period TEXT NOT NULL,
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('up', 'down', 'stable', 'spike')),
  related_opportunities UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_signals_keyword ON signals(keyword);
CREATE INDEX idx_signals_period ON signals(period);
CREATE INDEX idx_signals_trend ON signals(trend);
CREATE UNIQUE INDEX idx_signals_unique ON signals(source, keyword, period);

-- 4. profile (유저 프로필 + 포트폴리오)
CREATE TABLE IF NOT EXISTS profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  skills TEXT[] NOT NULL DEFAULT '{}',
  experience JSONB NOT NULL DEFAULT '{}',
  interests TEXT[] NOT NULL DEFAULT '{}',
  target_companies TEXT[] NOT NULL DEFAULT '{}',
  projects JSONB NOT NULL DEFAULT '[]',
  resume_data JSONB NOT NULL DEFAULT '{}',
  skill_gaps JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. user_actions (행동 로그 — 학습 데이터)
CREATE TABLE IF NOT EXISTS user_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  deep_link_id UUID REFERENCES deep_links(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('view', 'click', 'bookmark', 'dismiss', 'apply', 'deep_dive_request', 'deep_dive_approve', 'deep_dive_reject')),
  context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_actions_opportunity ON user_actions(opportunity_id);
CREATE INDEX idx_user_actions_type ON user_actions(action_type);
CREATE INDEX idx_user_actions_created ON user_actions(created_at DESC);

-- 6. applications (지원 트래킹)
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'interested' CHECK (status IN ('interested', 'preparing', 'applied', 'interview', 'offered', 'rejected', 'withdrawn')),
  applied_at TIMESTAMPTZ,
  notes JSONB NOT NULL DEFAULT '{}',
  resume_version TEXT,
  follow_up_date TIMESTAMPTZ,
  result_notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_follow_up ON applications(follow_up_date);

-- 7. skill_gaps (스킬 갭 분석)
CREATE TABLE IF NOT EXISTS skill_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_company TEXT NOT NULL,
  target_role TEXT NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT '{}',
  my_skills TEXT[] NOT NULL DEFAULT '{}',
  gaps TEXT[] NOT NULL DEFAULT '{}',
  gap_score FLOAT NOT NULL DEFAULT 100,
  recommendations JSONB NOT NULL DEFAULT '{}',
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skill_gaps_company ON skill_gaps(target_company);
CREATE INDEX idx_skill_gaps_analyzed ON skill_gaps(analyzed_at DESC);

-- 8. bookmarks (저장/컬렉션)
CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  deep_link_id UUID REFERENCES deep_links(id) ON DELETE SET NULL,
  signal_id UUID REFERENCES signals(id) ON DELETE SET NULL,
  collection TEXT NOT NULL DEFAULT 'default',
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  memo TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_collection ON bookmarks(collection);
CREATE INDEX idx_bookmarks_opportunity ON bookmarks(opportunity_id);

-- 9. notifications (알림)
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('deadline_approaching', 'new_match', 'signal_spike', 'link_expired', 'follow_up_reminder', 'crawl_error')),
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  related_id UUID,
  related_type TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- 10. reports (이슈 신고)
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL CHECK (report_type IN ('expired', 'irrelevant', 'ai_generated', 'inaccurate', 'duplicate', 'spam')),
  detail TEXT NOT NULL DEFAULT '',
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_opportunity ON reports(opportunity_id);
CREATE INDEX idx_reports_resolved ON reports(resolved);

-- 11. crawl_configs (수집 설정)
CREATE TABLE IF NOT EXISTS crawl_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_name TEXT NOT NULL UNIQUE,
  crawler_type TEXT NOT NULL CHECK (crawler_type IN ('api', 'rss', 'scraping')),
  source_url TEXT NOT NULL,
  cron_expression TEXT NOT NULL DEFAULT '0 */6 * * *',
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  adaptive BOOLEAN NOT NULL DEFAULT FALSE,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  avg_run_duration FLOAT,
  error_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. user_models (개별 모델 학습)
CREATE TABLE IF NOT EXISTS user_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL DEFAULT 'default',
  model_type TEXT NOT NULL,
  model_version INT NOT NULL DEFAULT 1,
  training_data_count INT NOT NULL DEFAULT 0,
  accuracy FLOAT NOT NULL DEFAULT 0,
  parameters JSONB NOT NULL DEFAULT '{}',
  trained_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_user_models_active ON user_models(active);

-- =============================================
-- Initial Data: Default profile + Crawl configs
-- =============================================

-- Default profile for 은지
INSERT INTO profile (user_id, skills, interests, target_companies, experience)
VALUES (
  'default',
  ARRAY['kubernetes', 'terraform', 'aws', 'docker', 'ci-cd', 'linux', 'monitoring', 'python', 'go'],
  ARRAY['devops', 'sre', 'platform-engineering', 'cloud-native', 'infrastructure', 'observability', 'ebpf'],
  ARRAY['google', 'aws', 'microsoft', 'nvidia', 'meta', 'apple', 'netflix'],
  '{"current_role": "DevOps/SRE Engineer", "level": "senior", "years": 5}'::jsonb
);

-- Default crawl configs
INSERT INTO crawl_configs (source_name, crawler_type, source_url, cron_expression, priority, enabled) VALUES
  ('hacker_news_jobs', 'api', 'https://hacker-news.firebaseio.com/v0/jobstories.json', '0 */2 * * *', 'high', true),
  ('hacker_news_top', 'api', 'https://hacker-news.firebaseio.com/v0/topstories.json', '0 */3 * * *', 'medium', true),
  ('google_sre_blog', 'rss', 'https://sre.google/feed.xml', '0 8,20 * * *', 'high', true),
  ('aws_architecture_blog', 'rss', 'https://aws.amazon.com/blogs/architecture/feed/', '0 8,20 * * *', 'high', true),
  ('netflix_tech_blog', 'rss', 'https://netflixtechblog.com/feed', '0 8,20 * * *', 'medium', true),
  ('cloudflare_blog', 'rss', 'https://blog.cloudflare.com/rss/', '0 8,20 * * *', 'medium', true),
  ('cncf_blog', 'rss', 'https://www.cncf.io/blog/feed/', '0 8,20 * * *', 'high', true),
  ('kubernetes_blog', 'rss', 'https://kubernetes.io/feed.xml', '0 */12 * * *', 'high', true),
  ('devto_devops', 'rss', 'https://dev.to/feed/tag/devops', '0 */6 * * *', 'low', true),
  ('devto_sre', 'rss', 'https://dev.to/feed/tag/sre', '0 */6 * * *', 'low', true),
  ('arxiv_distributed', 'api', 'https://export.arxiv.org/api/query?search_query=cat:cs.DC&sortBy=submittedDate&sortOrder=descending&max_results=20', '0 6 * * *', 'medium', true),
  ('github_cncf', 'api', 'https://api.github.com/orgs/cncf/repos?sort=updated&per_page=10', '0 */12 * * *', 'high', true);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_opportunities_updated
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_applications_updated
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_profile_updated
  BEFORE UPDATE ON profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

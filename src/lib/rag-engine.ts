import Anthropic from '@anthropic-ai/sdk';
import { getServiceSupabase } from './supabase';
import { generateEmbedding, searchSimilarOpportunities } from './embeddings';

const client = new Anthropic();

interface PortfolioData {
  name: string;
  title: string;
  bio: string;
  experiences: Array<{
    company: string;
    role: string;
    period: string;
    description: string;
    techStack: string[];
  }>;
  projects: Array<{
    title: string;
    description: string;
    techStack: string[];
  }>;
  skills: Array<{
    category: string;
    name: string;
    level: string;
  }>;
  certifications: Array<{
    title: string;
    issuer: string;
  }>;
}

interface CoachingResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  checklist: Array<{ item: string; checked: boolean }>;
  detailedFeedback: Record<string, string>;
}

interface RecommendationResult {
  opportunities: Array<{
    opportunity_id: string;
    title: string;
    reason: string;
    matchScore: number;
  }>;
  insights: string;
}

/**
 * Build context string from user's portfolio data
 */
function buildPortfolioContext(portfolio: PortfolioData): string {
  const parts: string[] = [];

  parts.push(`이름: ${portfolio.name}`);
  parts.push(`직함: ${portfolio.title}`);
  if (portfolio.bio) parts.push(`소개: ${portfolio.bio}`);

  if (portfolio.experiences.length > 0) {
    parts.push('\n경력:');
    portfolio.experiences.forEach((exp) => {
      parts.push(`- ${exp.role} @ ${exp.company} (${exp.period})`);
      if (exp.description) parts.push(`  ${exp.description}`);
      if (exp.techStack.length > 0) parts.push(`  기술: ${exp.techStack.join(', ')}`);
    });
  }

  if (portfolio.projects.length > 0) {
    parts.push('\n프로젝트:');
    portfolio.projects.forEach((proj) => {
      parts.push(`- ${proj.title}: ${proj.description}`);
      if (proj.techStack.length > 0) parts.push(`  기술: ${proj.techStack.join(', ')}`);
    });
  }

  if (portfolio.skills.length > 0) {
    parts.push('\n기술 스택:');
    const byCategory: Record<string, string[]> = {};
    portfolio.skills.forEach((s) => {
      if (!byCategory[s.category]) byCategory[s.category] = [];
      byCategory[s.category].push(`${s.name}(${s.level})`);
    });
    Object.entries(byCategory).forEach(([cat, skills]) => {
      parts.push(`- ${cat}: ${skills.join(', ')}`);
    });
  }

  if (portfolio.certifications.length > 0) {
    parts.push('\n자격증:');
    portfolio.certifications.forEach((cert) => {
      parts.push(`- ${cert.title} (${cert.issuer})`);
    });
  }

  return parts.join('\n');
}

/**
 * Build context from user's interaction history
 */
async function buildInteractionContext(userId: string): Promise<string> {
  const db = getServiceSupabase();

  // Get recent interactions
  const { data: interactions } = await db
    .from('user_interactions')
    .select(`
      action,
      metadata,
      created_at,
      opportunities (title, type, source, tags)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  if (!interactions || interactions.length === 0) {
    return '사용자 활동 이력이 없습니다.';
  }

  const actionLabels: Record<string, string> = {
    bookmark: '북마크',
    apply: '지원',
    view: '조회',
    report: '신고',
    dismiss: '관심없음',
  };

  const parts: string[] = ['최근 활동 이력:'];
  interactions.forEach((i: Record<string, unknown>) => {
    const opp = i.opportunities as Record<string, unknown> | null;
    const action = actionLabels[i.action as string] || (i.action as string);
    if (opp) {
      parts.push(`- [${action}] ${opp.title} (${opp.type}/${opp.source})`);
    }
  });

  // Summarize patterns
  const actionCounts: Record<string, number> = {};
  interactions.forEach((i: Record<string, unknown>) => {
    actionCounts[i.action as string] = (actionCounts[i.action as string] || 0) + 1;
  });

  parts.push(`\n활동 요약: 북마크 ${actionCounts['bookmark'] || 0}건, 지원 ${actionCounts['apply'] || 0}건, 조회 ${actionCounts['view'] || 0}건`);

  return parts.join('\n');
}

/**
 * Get relevant opportunities context via vector search
 */
async function buildOpportunityContext(
  queryText: string,
  limit: number = 5
): Promise<string> {
  const results = await searchSimilarOpportunities(queryText, limit, 0.4);

  if (results.length === 0) {
    return '관련 기회 정보가 없습니다.';
  }

  const parts: string[] = ['관련 기회:'];
  results.forEach((r) => {
    const meta = r.metadata as Record<string, unknown>;
    parts.push(
      `- [유사도 ${(r.similarity * 100).toFixed(0)}%] ${r.content_text.slice(0, 200)}`
    );
    if (meta?.tags) {
      parts.push(`  태그: ${(meta.tags as string[]).join(', ')}`);
    }
  });

  return parts.join('\n');
}

/**
 * RAG-powered Portfolio Coach
 * Analyzes portfolio with full context (user data + behavior + market trends)
 */
export async function analyzePortfolio(
  userId: string,
  portfolio: PortfolioData
): Promise<CoachingResult> {
  try {
    // Build rich context from multiple sources
    const portfolioContext = buildPortfolioContext(portfolio);
    const interactionContext = await buildInteractionContext(userId);

    // Search for relevant opportunities based on user's skills
    const skillsQuery = portfolio.skills.map((s) => s.name).join(' ') +
      ' ' + portfolio.title + ' DevOps SRE';
    const opportunityContext = await buildOpportunityContext(skillsQuery, 5);

    const systemPrompt = `당신은 세계 최고의 DevOps/SRE 커리어 코치입니다.
빅테크(Google, AWS, Microsoft, Meta, Netflix, NVIDIA 등) 채용 기준에 맞춰 포트폴리오를 분석하는 전문가입니다.

다음을 고려하여 분석해주세요:
1. 빅테크 SRE/DevOps 포지션의 채용 기준
2. 사용자의 실제 활동 이력과 관심사
3. 현재 시장에서 인기 있는 기회와 트렌드
4. STAR 기법 기반 경력 기술
5. 정량적 성과 표현 (비용 절감 %, 가용성 개선 등)

반드시 유효한 JSON으로만 응답하세요.`;

    const userPrompt = `아래 정보를 바탕으로 이 사용자의 포트폴리오를 분석해주세요.

=== 포트폴리오 ===
${portfolioContext}

=== 사용자 활동 이력 ===
${interactionContext}

=== 관련 시장 기회 ===
${opportunityContext}

다음 JSON 형식으로 응답해주세요:
{
  "score": 0-100 정수,
  "summary": "한 문장 요약",
  "strengths": ["강점1", "강점2", ...],
  "improvements": ["개선점1", "개선점2", ...],
  "checklist": [
    {"item": "System Design 경험 시연", "checked": true/false},
    {"item": "Open Source 기여", "checked": true/false},
    {"item": "프로젝트 설명에 영향도 메트릭 포함", "checked": true/false},
    {"item": "정량화된 성과", "checked": true/false},
    {"item": "기술 블로그", "checked": true/false},
    {"item": "컨퍼런스 발표 경험", "checked": true/false},
    {"item": "안정성 개선 사례", "checked": true/false},
    {"item": "비용 최적화 사례", "checked": true/false}
  ],
  "detailedFeedback": {
    "bio": "소개 섹션에 대한 구체적 피드백",
    "experience": "경력 섹션에 대한 구체적 피드백",
    "projects": "프로젝트 섹션에 대한 구체적 피드백",
    "skills": "기술 스택에 대한 구체적 피드백"
  }
}`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '{}';

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

    // Save coaching history for learning
    const db = getServiceSupabase();
    await db.from('ai_coaching_history').insert({
      user_id: userId,
      coaching_type: 'portfolio_analysis',
      input_context: { portfolio, interactionSummary: interactionContext.slice(0, 500) },
      ai_response: responseText,
    });

    return {
      score: typeof result.score === 'number' ? Math.max(0, Math.min(100, result.score)) : 50,
      summary: result.summary || '포트폴리오 분석을 완료했습니다.',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      improvements: Array.isArray(result.improvements) ? result.improvements : [],
      checklist: Array.isArray(result.checklist) ? result.checklist : [],
      detailedFeedback: result.detailedFeedback || {},
    };
  } catch (error) {
    console.error('Portfolio analysis error:', error);
    const errMsg = error instanceof Error ? error.message : String(error);
    let summary = '분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    if (errMsg.includes('credit') || errMsg.includes('billing') || errMsg.includes('too low')) {
      summary = 'AI API 크레딧이 부족합니다. Anthropic 계정에서 크레딧을 충전해주세요.';
    } else if (errMsg.includes('deprecated') || errMsg.includes('not found')) {
      summary = 'AI 모델 오류입니다. 관리자에게 문의해주세요.';
    }
    return {
      score: 0,
      summary,
      strengths: [],
      improvements: [],
      checklist: [],
      detailedFeedback: {},
    };
  }
}

/**
 * RAG-powered Section Improvement
 * Gives specific AI feedback for a portfolio section
 */
export async function improveSectionWithAI(
  userId: string,
  sectionType: string,
  sectionContent: string,
  portfolio: PortfolioData
): Promise<string> {
  try {
    const portfolioContext = buildPortfolioContext(portfolio);
    const interactionContext = await buildInteractionContext(userId);

    const sectionLabels: Record<string, string> = {
      bio: '소개/자기소개',
      experience: '경력 설명',
      projects: '프로젝트 설명',
      skills: '기술 스택',
    };

    const systemPrompt = `당신은 빅테크(FAANG+) DevOps/SRE 채용 전문 커리어 코치입니다.
포트폴리오의 특정 섹션을 개선하는 구체적이고 실용적인 조언을 해주세요.
한국어로 답변하되, 기술 용어는 영어 원문 그대로 사용하세요.
조언은 300자 이내로 핵심만 전달하세요.`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `이 사용자의 "${sectionLabels[sectionType] || sectionType}" 섹션을 개선해주세요.

=== 전체 포트폴리오 컨텍스트 ===
${portfolioContext}

=== 개선 대상 섹션 내용 ===
${sectionContent || '(비어 있음)'}

=== 사용자 활동 패턴 ===
${interactionContext}

빅테크 채용 기준에 맞춰 구체적인 개선 방안을 제시해주세요.
1) 현재 내용의 문제점
2) 구체적 개선 제안 (예시 포함)
3) 빅테크 합격자들의 일반적인 패턴`,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    // Save to coaching history
    const db = getServiceSupabase();
    await db.from('ai_coaching_history').insert({
      user_id: userId,
      coaching_type: `improve_${sectionType}`,
      input_context: { sectionType, sectionContent: sectionContent?.slice(0, 500) },
      ai_response: responseText,
    });

    return responseText;
  } catch (error) {
    console.error('Section improvement error:', error);
    return '개선 제안을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
}

/**
 * RAG-powered Skill Gap Analysis
 * Compares user's skills against market demand using vector search
 */
export async function analyzeSkillGapRAG(
  userId: string,
  portfolio: PortfolioData,
  targetRole?: string
): Promise<{
  missingSkills: string[];
  matchingSkills: string[];
  gapScore: number;
  recommendations: string[];
  trendingSkills: string[];
}> {
  try {
    const currentSkills = portfolio.skills.map((s) => s.name);
    const role = targetRole || portfolio.title || 'DevOps/SRE Engineer';

    // Search for relevant job opportunities to understand market demand
    const marketContext = await buildOpportunityContext(
      `${role} hiring requirements skills qualifications`,
      10
    );

    const interactionContext = await buildInteractionContext(userId);

    const systemPrompt = `당신은 DevOps/SRE 분야 기술 트렌드 분석 전문가입니다.
시장 데이터와 사용자 프로필을 비교하여 스킬 갭을 분석합니다.
반드시 유효한 JSON으로만 응답하세요.`;

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `목표 역할: ${role}

현재 보유 기술: ${currentSkills.join(', ')}

=== 시장 수요 데이터 ===
${marketContext}

=== 사용자 활동 패턴 ===
${interactionContext}

다음 JSON으로 응답해주세요:
{
  "missingSkills": ["부족한 스킬1", "부족한 스킬2"],
  "matchingSkills": ["보유한 관련 스킬1", "보유한 관련 스킬2"],
  "gapScore": 0.0-1.0 (0=완벽 매치, 1=매치 없음),
  "recommendations": ["학습 추천1", "학습 추천2"],
  "trendingSkills": ["현재 트렌딩 스킬1", "현재 트렌딩 스킬2"]
}`,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : '{}');

    return {
      missingSkills: Array.isArray(result.missingSkills) ? result.missingSkills : [],
      matchingSkills: Array.isArray(result.matchingSkills) ? result.matchingSkills : [],
      gapScore: typeof result.gapScore === 'number' ? result.gapScore : 0.5,
      recommendations: Array.isArray(result.recommendations) ? result.recommendations : [],
      trendingSkills: Array.isArray(result.trendingSkills) ? result.trendingSkills : [],
    };
  } catch (error) {
    console.error('Skill gap analysis error:', error);
    return {
      missingSkills: [],
      matchingSkills: [],
      gapScore: 0.5,
      recommendations: ['분석 중 오류가 발생했습니다.'],
      trendingSkills: [],
    };
  }
}

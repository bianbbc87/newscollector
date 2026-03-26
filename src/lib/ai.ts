import Anthropic from '@anthropic-ai/sdk';

interface TagOpportunityResult {
  tags: string[];
  relevanceScore: number;
  deadline?: string;
  isAIGenerated: boolean;
}

interface SkillGapAnalysisResult {
  missingSkills: string[];
  matchingSkills: string[];
  gapScore: number;
  recommendations: string[];
}

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an expert DevOps/SRE recruiter and technical analyst.
Your task is to analyze job opportunities, articles, and open source projects for relevance to DevOps/SRE engineers.
You should extract relevant tags, determine relevance scores, identify deadlines, and detect AI-generated content.
Always respond with valid JSON that can be parsed.`;

export async function tagOpportunity(
  title: string,
  description: string,
  url: string
): Promise<TagOpportunityResult> {
  try {
    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze this opportunity and provide tags, relevance score, deadline, and whether it appears AI-generated.

Title: ${title}
Description: ${description}
URL: ${url}

Return a JSON object with:
{
  "tags": ["array", "of", "relevant", "tags"],
  "relevanceScore": 0.0-1.0,
  "deadline": "YYYY-MM-DD" or null,
  "isAIGenerated": true/false
}

Only respond with valid JSON.`,
        },
      ],
    });

    // Extract the text content from the response
    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '{}';

    // Parse the JSON response
    const result = JSON.parse(responseText);

    return {
      tags: Array.isArray(result.tags) ? result.tags : [],
      relevanceScore:
        typeof result.relevanceScore === 'number'
          ? Math.max(0, Math.min(1, result.relevanceScore))
          : 0,
      deadline: result.deadline || undefined,
      isAIGenerated: Boolean(result.isAIGenerated),
    };
  } catch (error) {
    console.error('Error in tagOpportunity:', error);

    // Return a safe default on error
    return {
      tags: [],
      relevanceScore: 0.5,
      isAIGenerated: false,
    };
  }
}

export async function analyzeSkillGap(
  jdText: string,
  mySkills: string[]
): Promise<SkillGapAnalysisResult> {
  try {
    const skillsList = mySkills.join(', ');

    const message = await client.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 600,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Analyze the skill gap between this job description and my current skills.

Job Description:
${jdText}

My Current Skills:
${skillsList}

Return a JSON object with:
{
  "missingSkills": ["skill1", "skill2"],
  "matchingSkills": ["skill1", "skill2"],
  "gapScore": 0.0-1.0,
  "recommendations": ["recommendation1", "recommendation2"]
}

Where:
- missingSkills: skills required in the JD that I don't have
- matchingSkills: skills from my list that appear in the JD
- gapScore: 0.0 (perfect fit) to 1.0 (no matching skills)
- recommendations: actionable learning recommendations

Only respond with valid JSON.`,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '{}';
    const result = JSON.parse(responseText);

    return {
      missingSkills: Array.isArray(result.missingSkills)
        ? result.missingSkills
        : [],
      matchingSkills: Array.isArray(result.matchingSkills)
        ? result.matchingSkills
        : [],
      gapScore:
        typeof result.gapScore === 'number'
          ? Math.max(0, Math.min(1, result.gapScore))
          : 0.5,
      recommendations: Array.isArray(result.recommendations)
        ? result.recommendations
        : [],
    };
  } catch (error) {
    console.error('Error in analyzeSkillGap:', error);

    // Return a safe default on error
    return {
      missingSkills: [],
      matchingSkills: [],
      gapScore: 0.5,
      recommendations: [
        'Unable to analyze skill gap - try again later',
      ],
    };
  }
}

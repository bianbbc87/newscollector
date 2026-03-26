import { NextRequest, NextResponse } from 'next/server';
import { analyzePortfolio, improveSectionWithAI, analyzeSkillGapRAG } from '@/lib/rag-engine';

/**
 * POST /api/ai/coach
 * RAG-powered AI coaching endpoints
 *
 * Actions:
 * - analyze: Full portfolio analysis with score
 * - improve: Improve a specific section (bio, experience, projects, skills)
 * - skillgap: Skill gap analysis against market demand
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, portfolio, sectionType, sectionContent, targetRole } = body;

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'action and userId are required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'analyze': {
        if (!portfolio) {
          return NextResponse.json({ error: 'portfolio data is required' }, { status: 400 });
        }

        const result = await analyzePortfolio(userId, portfolio);
        return NextResponse.json({ success: true, ...result });
      }

      case 'improve': {
        if (!sectionType || !portfolio) {
          return NextResponse.json(
            { error: 'sectionType and portfolio are required' },
            { status: 400 }
          );
        }

        const suggestion = await improveSectionWithAI(
          userId,
          sectionType,
          sectionContent || '',
          portfolio
        );
        return NextResponse.json({ success: true, suggestion });
      }

      case 'skillgap': {
        if (!portfolio) {
          return NextResponse.json({ error: 'portfolio data is required' }, { status: 400 });
        }

        const gapResult = await analyzeSkillGapRAG(userId, portfolio, targetRole);
        return NextResponse.json({ success: true, ...gapResult });
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}. Use 'analyze', 'improve', or 'skillgap'` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('AI Coach error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'AI Coach failed' },
      { status: 500 }
    );
  }
}

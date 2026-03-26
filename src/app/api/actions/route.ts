import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { ActionType } from '@/types';

interface ActionPayload {
  opportunity_id?: string;
  deep_link_id?: string;
  action_type: ActionType;
  context?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ActionPayload;
    const { opportunity_id, deep_link_id, action_type, context } = body;

    if (!action_type) {
      return NextResponse.json(
        { error: 'action_type is required' },
        { status: 400 }
      );
    }

    if (!opportunity_id && !deep_link_id) {
      return NextResponse.json(
        { error: 'Either opportunity_id or deep_link_id is required' },
        { status: 400 }
      );
    }

    const db = getServiceSupabase();

    const actionData = {
      opportunity_id: opportunity_id || null,
      deep_link_id: deep_link_id || null,
      action_type,
      context: context || {},
      created_at: new Date().toISOString(),
    };

    const { data, error } = await db
      .from('user_actions')
      .insert([actionData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      action: data?.[0],
    });
  } catch (error) {
    console.error('Action logging error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to log action',
      },
      { status: 500 }
    );
  }
}

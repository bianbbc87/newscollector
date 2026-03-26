import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { ApplicationStatus } from '@/types';

interface ApplicationPayload {
  opportunity_id: string;
  status?: ApplicationStatus;
}

interface ApplicationUpdatePayload {
  id: string;
  status: ApplicationStatus;
  notes?: Record<string, unknown>;
  follow_up_date?: string;
}

export async function GET(request: NextRequest) {
  try {
    const db = getServiceSupabase();

    // Get applications with their opportunity details
    const { data, error } = await db
      .from('applications')
      .select(
        `
        *,
        opportunity:opportunities(*)
      `
      )
      .order('updated_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('Applications fetch error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch applications',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ApplicationPayload;
    const { opportunity_id, status = 'interested' } = body;

    if (!opportunity_id) {
      return NextResponse.json(
        { error: 'opportunity_id is required' },
        { status: 400 }
      );
    }

    const db = getServiceSupabase();

    const applicationData = {
      opportunity_id,
      status,
      applied_at: status === 'applied' ? new Date().toISOString() : null,
      notes: {},
      resume_version: null,
      follow_up_date: null,
      result_notes: null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await db
      .from('applications')
      .insert([applicationData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      application: data?.[0],
    });
  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create application',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as ApplicationUpdatePayload;
    const { id, status, notes, follow_up_date } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'id and status are required' },
        { status: 400 }
      );
    }

    const db = getServiceSupabase();

    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'applied') {
      updateData.applied_at = new Date().toISOString();
    }

    if (notes) {
      updateData.notes = notes;
    }

    if (follow_up_date) {
      updateData.follow_up_date = follow_up_date;
    }

    const { data, error } = await db
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      application: data?.[0],
    });
  } catch (error) {
    console.error('Application update error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update application',
      },
      { status: 500 }
    );
  }
}

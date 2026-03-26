import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { ReportType } from '@/types';

interface ReportPayload {
  opportunity_id: string;
  report_type: ReportType;
  detail?: string;
}

export async function GET(request: NextRequest) {
  try {
    const db = getServiceSupabase();

    // Get unresolved reports
    const { data, error } = await db
      .from('reports')
      .select('*')
      .eq('resolved', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      data: data || [],
      total: data?.length || 0,
    });
  } catch (error) {
    console.error('Reports fetch error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch reports',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ReportPayload;
    const { opportunity_id, report_type, detail } = body;

    if (!opportunity_id || !report_type) {
      return NextResponse.json(
        { error: 'opportunity_id and report_type are required' },
        { status: 400 }
      );
    }

    const db = getServiceSupabase();

    const reportData = {
      opportunity_id,
      report_type,
      detail: detail || '',
      resolved: false,
      resolution: null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await db
      .from('reports')
      .insert([reportData])
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      report: data?.[0],
    });
  } catch (error) {
    console.error('Report creation error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create report',
      },
      { status: 500 }
    );
  }
}

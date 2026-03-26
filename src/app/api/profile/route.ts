import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';

interface ProfileUpdatePayload {
  skills?: string[];
  experience?: Record<string, unknown>;
  interests?: string[];
  target_companies?: string[];
  projects?: Record<string, unknown>[];
  resume_data?: Record<string, unknown>;
  skill_gaps?: Record<string, unknown>;
}

// Default user ID (single user for this application)
const DEFAULT_USER_ID = 'default-user';

export async function GET(request: NextRequest) {
  try {
    const db = getServiceSupabase();

    const { data, error } = await db
      .from('profiles')
      .select('*')
      .eq('user_id', DEFAULT_USER_ID)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error
      throw error;
    }

    // If no profile exists, return empty profile structure
    if (!data) {
      return NextResponse.json({
        id: null,
        user_id: DEFAULT_USER_ID,
        skills: [],
        experience: {},
        interests: [],
        target_companies: [],
        projects: [],
        resume_data: {},
        skill_gaps: {},
        updated_at: null,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as ProfileUpdatePayload;

    const db = getServiceSupabase();

    // First, try to get the existing profile
    const { data: existingProfile } = await db
      .from('profiles')
      .select('id')
      .eq('user_id', DEFAULT_USER_ID)
      .single();

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    let result;

    if (existingProfile) {
      // Update existing profile
      result = await db
        .from('profiles')
        .update(updateData)
        .eq('user_id', DEFAULT_USER_ID)
        .select();
    } else {
      // Create new profile if it doesn't exist
      result = await db
        .from('profiles')
        .insert([
          {
            user_id: DEFAULT_USER_ID,
            ...updateData,
            skills: body.skills || [],
            experience: body.experience || {},
            interests: body.interests || [],
            target_companies: body.target_companies || [],
            projects: body.projects || [],
            resume_data: body.resume_data || {},
            skill_gaps: body.skill_gaps || {},
          },
        ])
        .select();
    }

    const { data, error } = result;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      profile: data?.[0],
    });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update profile',
      },
      { status: 500 }
    );
  }
}

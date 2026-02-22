import { NextResponse } from 'next/server';
import { db, PLAN_LIMITS } from '@/lib/db';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
        return NextResponse.json({ error: 'Missing API Key' }, { status: 400, headers: corsHeaders });
    }

    const project = await db.projects.findUnique({ where: { apiKey: key } });

    if (!project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404, headers: corsHeaders });
    }

    const user = db.users.get(); // MVP logic simulates single user system
    const planLimits = PLAN_LIMITS[user.plan];
    const finalMode = planLimits.devModeAllowed ? project.mode : 'CLIENT';

    return NextResponse.json({
        id: project.id,
        name: project.name,
        mode: finalMode,
        language: project.language,
        clarityProjectId: project.clarityProjectId
    }, { headers: corsHeaders });
}

import { NextResponse } from 'next/server';
import { db, prisma, PLAN_LIMITS, Project } from '@/lib/db';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { generateBugTriage } from '@/lib/ai';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            projectKey, description, url, userAgent, claritySessionId,
            clarityUserId, timestamp, clientTimestamp, recordingEvents,
            assetPaths, mode, consoleErrors, networkLog, jsErrors,
            appState
        } = body;

        if (!projectKey) {
            return NextResponse.json({ error: 'Missing projectKey' }, { status: 400 });
        }

        const project = await db.projects.findUnique({
            where: { apiKey: projectKey }
        });

        if (!project) {
            return NextResponse.json({ error: 'Invalid projectKey' }, { status: 404 });
        }

        const owner = await prisma.user.findUnique({ where: { id: project.ownerId } });
        if (!owner) {
            return NextResponse.json({ error: 'Project owner not found' }, { status: 404 });
        }
        const limits = PLAN_LIMITS[owner.plan as keyof typeof PLAN_LIMITS];

        // 1. Quota Check
        const allUserProjectIds = (await db.projects.findMany(owner.id))
            .map((p: Project) => p.id);

        const currentReportsCount = await prisma.report.count({
            where: { projectId: { in: allUserProjectIds } }
        });

        if (currentReportsCount >= limits.reportsPerMonth) {
            return NextResponse.json({
                error: `Quota Exceeded: Your ${owner.plan} plan is limited to ${limits.reportsPerMonth} reports/month.`
            }, { status: 403 });
        }

        // 2. Feature Gating (Dev Mode protection)
        const finalMode = limits.devModeAllowed ? (mode || 'CLIENT') : 'CLIENT';
        const finalConsoleErrors = limits.devModeAllowed ? (consoleErrors || []) : [];
        const finalNetworkLog = limits.devModeAllowed ? (networkLog || []) : [];
        const finalJSErrors = limits.devModeAllowed ? (jsErrors || []) : [];
        const finalAppState = limits.devModeAllowed ? appState : undefined;

        // Construct Clarity Session URL if ID exists
        let claritySessionUrl = null;
        if (claritySessionId && project.clarityProjectId) {
            claritySessionUrl = `https://clarity.microsoft.com/projects/view/${project.clarityProjectId}/sessions/${claritySessionId}`;
        }

        const report = await db.reports.create({
            data: {
                projectId: project.id,
                description,
                pageUrl: url,
                userAgent,
                claritySessionUrl: claritySessionUrl || null,
                status: 'OPEN',
                severity: 'MEDIUM',
                events: recordingEvents || [],
                assetPaths: assetPaths || [],
                mode: finalMode,
                consoleErrors: finalConsoleErrors,
                networkLog: finalNetworkLog,
                metadata: {
                    rawClarityId: claritySessionId,
                    rawClarityUserId: clarityUserId,
                    clientTimestamp: clientTimestamp || timestamp,
                    jsErrors: finalJSErrors,
                    appState: finalAppState
                }
            }
        });

        // Run AI triage in the background to avoid blocking the client response
        (async () => {
            try {
                const triage = await generateBugTriage({
                    description,
                    url,
                    userAgent,
                    timestamp: timestamp || new Date().toISOString(),
                    events: recordingEvents || [],
                    screenshots: assetPaths || [],
                    consoleErrors,
                    networkLog,
                    jsErrors,
                    appState
                });

                await db.reports.update({
                    where: { id: report.id },
                    data: {
                        aiSummary: triage.aiSummary,
                        reproductionSteps: triage.reproductionSteps,
                        severity: triage.severity,
                        replayInsights: triage.replayInsights
                    }
                });

                // Trigger Webhook if configured
                if (project.webhookUrl) {
                    try {
                        await fetch(project.webhookUrl, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                event: 'report_created',
                                reportId: report.id,
                                projectId: project.id,
                                severity: triage.severity,
                                aiSummary: triage.aiSummary,
                                rootCause: triage.rootCause,
                                reporter: userAgent
                            })
                        });
                    } catch (whError) {
                        console.warn('BugCatcher: Failed to fire webhook', whError);
                    }
                }
            } catch (error) {
                console.error('Background Triage Error:', error);
            }
        })();

        return NextResponse.json({ success: true, id: report.id }, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
            }
        });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, {
            status: 500,
            headers: {
                'Access-Control-Allow-Origin': '*',
            }
        });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, data-project',
        },
    });
}

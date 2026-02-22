import { NextResponse } from 'next/server';
import { db, PLAN_LIMITS } from '@/lib/db';
import { generateBugTriage } from '@/lib/ai';

// Hack to access raw data for counting since findMany on reports isn't implemented
function getDb() {
    return require('fs').existsSync(process.cwd() + '/db.json')
        ? JSON.parse(require('fs').readFileSync(process.cwd() + '/db.json', 'utf8'))
        : { reports: [] };
}

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

        const user = db.users.get();
        const limits = PLAN_LIMITS[user.plan];

        // 1. Quota Check
        // MVP: simplified to total reports across all user projects.
        // Real-world: Should check current month exactly.
        const allUserProjectIds = (await db.projects.findMany())
            .filter(p => p.ownerId === user.id)
            .map(p => p.id);

        // Mocking db.reports.count behavior for MVP
        const allReports = getDb().reports;
        const currentReportsCount = allReports.filter(r => allUserProjectIds.includes(r.projectId)).length;

        if (currentReportsCount >= limits.reportsPerMonth) {
            return NextResponse.json({
                error: `Quota Exceeded: Your ${user.plan} plan is limited to ${limits.reportsPerMonth} reports/month.`
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
                claritySessionUrl: claritySessionUrl || undefined,
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
                    screenshots: assetPaths || [], // ai.ts will need updating to handle paths next, passing for now
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
                        console.log(`BugCatcher: Webhook fired to ${project.webhookUrl}`);
                    } catch (whError) {
                        console.warn('BugCatcher: Failed to fire webhook', whError);
                    }
                }
            } catch (error) {
                console.error('Background Triage Error:', error);
            }
        })();

        return NextResponse.json({ success: true, id: report.id });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Handle CORS for the widget
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

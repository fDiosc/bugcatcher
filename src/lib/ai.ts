import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export interface BugContext {
    description: string;
    url: string;
    userAgent: string;
    timestamp: string;
    events?: any[];
    screenshots?: string[]; // Esses agora são local file paths
    consoleErrors?: any[];
    networkLog?: any[];
    jsErrors?: any[];
    appState?: any;
}

function parseRrwebEvents(events: any[]) {
    // Basic parser to extract interesting data points from rrweb stream
    // types: 0=Meta, 1=Load, 2=FullSnapshot, 3=IncrementalSnapshot, 4=Meta, 5=Custom
    const actions: string[] = [];

    events.forEach(e => {
        if (e.type === 3) { // IncrementalSnapshot
            const data = e.data;
            if (data.source === 2) { // Mouse Interaction
                // MouseInteraction Type 2 is Click. 0 is MouseUp, 1 is MouseDown, etc.
                if (data.type === 2) {
                    actions.push(`[Click] at x:${data.x}, y:${data.y}`);
                }
            } else if (data.source === 5) { // Input
                actions.push(`[Input] User typed something`);
            } else if (data.source === 4) { // Viewport resize
                actions.push(`[Resize] Window to ${data.width}x${data.height}`);
            }
        } else if (e.type === 4) { // Meta/URL change
            actions.push(`[Navigate] to ${e.data.href}`);
        }
    });

    // Return the last 30 actions to keep prompt size manageable (increased from 20 for more context)
    return actions.slice(-30).join('\n');
}

export async function generateBugTriage(context: BugContext) {
    if (!process.env.OPENAI_API_KEY) {
        return {
            aiSummary: "AI Triage skipped: Missing API Key.",
            reproductionSteps: "N/A",
            severity: "MEDIUM",
            replayInsights: "Replay available but not analyzed (Missing API Key)."
        };
    }

    const behavioralLogs = context.events ? parseRrwebEvents(context.events) : "No recording data available.";

    try {
        const userContent: any[] = [
            {
                type: "text",
                text: `Bug Report Analysis:
Description: ${context.description}
URL: ${context.url}
User Agent: ${context.userAgent}
Reported At: ${context.timestamp}

The following Behavioral Logs list the user's manual actions.
The following images are chronological frames (1 frame every 3 seconds) captured prior to the report. Use them to understand the UI state at each step.

Behavioral Replay Logs:
${behavioralLogs}

---
TECHNICAL CONTEXT (DEV MODE DATA):
Console Errors: ${JSON.stringify(context.consoleErrors || [])}
Network Log: ${JSON.stringify(context.networkLog || [])}
JS Exceptions: ${JSON.stringify(context.jsErrors || [])}
App State Dump: ${JSON.stringify(context.appState || null)}
---
`
            }
        ];

        // Add each screenshot as a separate image_url content block
        if (context.screenshots && context.screenshots.length > 0) {
            context.screenshots.forEach((filePath, index) => {
                let base64Url = filePath;

                // If it's a local path from our upload API, we must read it as base64 for OpenAI
                if (filePath.startsWith('/uploads/')) {
                    try {
                        const absolutePath = path.join(process.cwd(), 'public', filePath);
                        if (fs.existsSync(absolutePath)) {
                            const buffer = fs.readFileSync(absolutePath);
                            const ext = path.extname(absolutePath).replace('.', '') || 'jpeg';
                            base64Url = `data:image/${ext};base64,${buffer.toString('base64')}`;
                        } else {
                            console.warn(`BugCatcher AI: Screenshot file not found: ${absolutePath}`);
                            return; // Skip this frame if missing
                        }
                    } catch (e) {
                        console.warn(`BugCatcher AI: Error reading screenshot: ${e}`);
                        return; // Skip this frame on error
                    }
                }

                userContent.push({
                    type: "text",
                    text: `Frame ${index + 1} (Captured ~${(context.screenshots!.length - index) * 3}s before report):`
                });
                userContent.push({
                    type: "image_url",
                    image_url: {
                        url: base64Url,
                        detail: "low"
                    }
                });
            });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are a senior QA engineer. Analyze the bug report, behavioral logs, and the chronological sequence of screenshots (Stop-Motion).
                    
Your goal is to reconstruct the user's journey. Use the chronological sequence of images to verify the visual state of the application across time.

CRITICAL VISUAL CUE: This is an event-driven timeline. ANY frame might contain a highly visible transparent red circle with a solid red border. This synthetic tracking marker represents EXACTLY where the user clicked at that specific moment in time. 
Trace the user's journey frame-by-frame. Pay special attention to the frames with red markers to precisely identify the elements they interacted with, especially the final few interactions (the "dead clicks") right before they formulated the bug report.

Also, analyze the TECHNICAL CONTEXT (Console Errors, Network Log, JS Exceptions) to find the root cause of the bug.

Provide:
1. Technical Summary
2. Detailed Reproduction Steps
3. Suggested Severity (LOW, MEDIUM, HIGH, CRITICAL)
4. Replay Insights: A human-readable narrative of the user's journey, describing the visible transitions and state changes seen across the frames.
5. Root Cause: The technical hypothesis for the bug.
6. Suggested Fix: Actionable step to solve it.
7. Affected Component: Probable component or route.
8. Is Recurring: Boolean.
9. Dev Time Estimate: LOW, MEDIUM, HIGH.

Format the output as JSON with keys: technical_summary, reproduction_steps, severity, replay_insights, root_cause, suggested_fix, affected_component, is_recurring, dev_time_estimate.`
                },
                {
                    role: "user",
                    content: userContent
                }
            ],
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error("No content from OpenAI");

        const parsed = JSON.parse(content);
        return {
            aiSummary: parsed.technical_summary || parsed.summary,
            reproductionSteps: Array.isArray(parsed.reproduction_steps)
                ? parsed.reproduction_steps.join('\n')
                : parsed.reproduction_steps || "None provided",
            severity: (parsed.severity || "MEDIUM").toUpperCase(),
            replayInsights: parsed.replay_insights || "No specific insights from replay sequence.",
            rootCause: parsed.root_cause,
            suggestedFix: parsed.suggested_fix,
            devTimeEstimate: parsed.dev_time_estimate || "MEDIUM"
        };
    } catch (error) {
        console.error("AI Triage Error:", error);
        return {
            aiSummary: "Failed to generate AI summary.",
            reproductionSteps: "Check original description.",
            severity: "MEDIUM",
            replayInsights: "Error processing visual timeline.",
            rootCause: null,
            suggestedFix: null,
            devTimeEstimate: "MEDIUM"
        };
    }
}



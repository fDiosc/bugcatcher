import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReplayPlayer from '@/components/ReplayPlayer';
import StatusDropdown from './StatusDropdown';

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await db.users.get();

    if (!user) notFound();

    const report = await db.reports.findUniqueWithOwnership({
        id,
        ownerId: user.id
    });

    if (!report) notFound();

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link href={`/dashboard/projects/${report.projectId}`} className="text-sm text-blue-600 flex items-center gap-1 hover:gap-2 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Back to Project
            </Link>

            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-slate-900">Bug Report</h2>
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100 flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            NATIVE REPLAY
                        </span>
                        <StatusDropdown reportId={report.id} initialStatus={report.status} />
                    </div>
                    <p className="text-slate-500">ID: {report.id}</p>
                </div>
                <div className="flex gap-3">
                    {report.claritySessionUrl && (
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <a
                                    href={report.claritySessionUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /></svg>
                                    Recording Dashboard
                                </a>
                                <a
                                    href={
                                        report.metadata?.rawClarityUserId
                                            ? `https://clarity.microsoft.com/player/${report.project?.clarityProjectId}/${report.metadata.rawClarityUserId}/${report.metadata.rawClarityId}`
                                            : `${report.claritySessionUrl}?q=BugReported`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm text-sm"
                                >
                                    <svg className="w-5 h-5 text-blue-200 animate-pulse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                                    Direct Smart Replay
                                </a>
                            </div>
                            <p className="text-[10px] text-slate-400 italic">
                                * Note: Clarity recordings may take 1-2 minutes to appear.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Native Replay Player - THE HERO SECTION */}
            <section className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        Instant Smart Replay
                    </h3>
                    <span className="text-xs text-slate-400">Captured rolling 60s events buffer</span>
                </div>
                <ReplayPlayer events={report.events || []} />
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                    {/* AI Insights Section */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V6H8a1 1 0 010-2h1V3a1 1 0 011-1zm-3 7a1 1 0 00-1 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm10 0a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1v-1a1 1 0 011-1z" clipRule="evenodd" /></svg>
                                AI Triage Insights
                            </h3>
                        </div>

                        <div className="space-y-6">
                            {report.assetPaths && report.assetPaths.length > 0 && (
                                <div className="space-y-4">
                                    <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Visual Timeline (Last 30s)</h4>

                                    {/* Main Frame (Latest) */}
                                    <div className="relative group">
                                        <a href={report.assetPaths[report.assetPaths.length - 1]} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={report.assetPaths[report.assetPaths.length - 1]}
                                                alt="Latest Frame"
                                                className="rounded-xl border border-slate-200 w-full object-cover max-h-96 shadow-sm hover:shadow-md transition-shadow"
                                            />
                                            <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-mono">
                                                LATEST FRAME
                                            </div>
                                        </a>
                                    </div>

                                    {/* Film Strip */}
                                    <div className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide">
                                        {report.assetPaths.map((src, idx) => (
                                            <a
                                                key={idx}
                                                href={src}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-shrink-0 relative group"
                                            >
                                                <img
                                                    src={src}
                                                    alt={`Frame ${idx}`}
                                                    className="w-24 h-16 object-cover rounded-lg border border-slate-200 hover:border-indigo-400 transition-colors"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center">
                                                    <span className="text-[8px] text-white font-bold opacity-0 group-hover:opacity-100">{idx + 1}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic text-center">Capture interval: 3 seconds • Total: {report.assetPaths.length} frames</p>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Replay Timeline Analysis</h4>
                                <div className="text-slate-700 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3 italic">
                                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <p>{report.replayInsights || 'Replay analysis ready shortly...'}</p>
                                </div>
                            </div>

                            {report.rootCause && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                        <h4 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                            Root Cause Hypothesis
                                        </h4>
                                        <p className="text-sm text-red-900">{report.rootCause}</p>
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                        <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Suggested Fix
                                        </h4>
                                        <p className="text-sm text-emerald-900">{report.suggestedFix}</p>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Technical Summary</h4>
                                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    {report.aiSummary || 'AI analysis in progress...'}
                                </p>
                            </div>

                            <div>
                                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Reproduction Steps</h4>
                                <div className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl whitespace-pre-line border border-slate-100 text-sm">
                                    {report.reproductionSteps || 'No steps generated.'}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* User Description */}
                    <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Original Description</h3>
                        <p className="p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-700">
                            "{report.description || 'No description provided.'}"
                        </p>
                    </section>

                    {/* Developer Telemetry (If Dev Mode) */}
                    {report.mode === 'DEV' && (
                        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                                Dev Telemetry
                            </h3>

                            <div className="space-y-6">
                                {/* Console Logs */}
                                {report.consoleErrors && report.consoleErrors.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Console Operations</h4>
                                        <div className="bg-[#1e1e1e] rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs text-slate-300">
                                            {report.consoleErrors.map((log: any, i: number) => (
                                                <div key={i} className={`py-1 border-b border-white/5 ${log.level === 'error' ? 'text-red-400' : log.level === 'warn' ? 'text-yellow-400' : ''}`}>
                                                    <span className="opacity-50 mr-2">[{new Date(log.timestamp).toISOString().split('T')[1].split('.')[0]}]</span>
                                                    [{log.level.toUpperCase()}] {log.message}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Network Logs */}
                                {report.networkLog && report.networkLog.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Network Warnings (Failed / Slow &gt;1s)</h4>
                                        <div className="bg-[#1e1e1e] rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs text-slate-300">
                                            {report.networkLog.map((net: any, i: number) => (
                                                <div key={i} className={`py-1 flex gap-4 border-b border-white/5 ${net.status >= 400 || net.error ? 'text-red-400' : 'text-yellow-400'}`}>
                                                    <span className="font-bold w-12">{net.method}</span>
                                                    <span className="w-12">{net.status || 'ERR'}</span>
                                                    <span className="w-16">{net.duration}ms</span>
                                                    <span className="truncate flex-1">{net.url} {net.error ? `(${net.error})` : ''}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* JS Exceptions */}
                                {report.metadata?.jsErrors && report.metadata.jsErrors.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700 mb-2">Uncaught JS Exceptions</h4>
                                        <div className="bg-red-950/50 border border-red-900/50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs text-red-300">
                                            {report.metadata.jsErrors.map((err: any, i: number) => (
                                                <div key={i} className="mb-4 last:mb-0">
                                                    <div className="font-bold text-red-400 mb-1">{err.type}: {err.message || err.reason}</div>
                                                    {err.filename && <div className="text-red-500/80 mb-1">at {err.filename}:{err.lineno}:{err.colno}</div>}
                                                    {err.error && <pre className="whitespace-pre-wrap opacity-70 mt-2">{err.error}</pre>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* App State (Redux/Zustand etc) */}
                                {report.metadata?.appState && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center justify-between">
                                            Global App State (Snapshot)
                                        </h4>
                                        <div className="bg-[#1e1e1e] rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-xs text-indigo-300">
                                            <pre className="whitespace-pre-wrap">{JSON.stringify(report.metadata.appState, null, 2)}</pre>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar Context */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Status & Metadata</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Dev Time Est.</label>
                                <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 text-slate-600">
                                    {report.devTimeEstimate || 'UNKNOWN'}
                                </span>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Is Recurring?</label>
                                <span className={`px-2 py-1 rounded text-xs font-bold ${report.isRecurring ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                    {report.isRecurring ? 'Yes' : 'No'}
                                </span>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Severity</label>
                                <span className={`px-2 py-1 rounded text-xs font-bold 
                  ${report.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {report.severity}
                                </span>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Status</label>
                                <div className="flex items-center gap-2">
                                    <select className="text-sm border-slate-200 rounded-lg w-full bg-slate-50" defaultValue={report.status}>
                                        <option value="OPEN">Open</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="FIXED">Fixed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 space-y-3 font-sans">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">Page URL</span>
                                    <a href={report.pageUrl} className="text-[11px] text-blue-600 underline truncate hover:text-blue-800">{report.pageUrl}</a>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">User Agent</span>
                                    <span className="text-[11px] text-slate-600 line-clamp-2">{report.userAgent}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400">Project</span>
                                    <span className="text-[11px] text-slate-600">{report.project?.name || 'Unknown'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


/* eslint-disable */
'use client';

import { useState, useTransition } from 'react';
import { Project, Report } from '@/lib/db';
import Link from 'next/link';
import { changeProjectMode, changeProjectLanguage } from './actions';

export default function ProjectTabs({ project }: { project: Project }) {
    const [activeTab, setActiveTab] = useState<'REPORTS' | 'CONFIG'>('REPORTS');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [severityFilter, setSeverityFilter] = useState('ALL');
    const [isPending, startTransition] = useTransition();
    const [currentMode, setCurrentMode] = useState(project.mode);
    const [currentLanguage, setCurrentLanguage] = useState(project.language || 'en');
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(project.apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleModeToggle = (projectId: string, current: string) => {
        const newMode = current === 'DEV' ? 'CLIENT' : 'DEV';
        setCurrentMode(newMode); // Optimistic UI update
        startTransition(() => {
            changeProjectMode(projectId, newMode);
        });
    };

    const handleLanguageChange = (projectId: string, e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLanguage = e.target.value;
        setCurrentLanguage(newLanguage);
        startTransition(() => {
            changeProjectLanguage(projectId, newLanguage);
        });
    };

    const filteredReports = (project.reports || []).filter((report: Report) => {
        const matchesSearch = (report.description || '').toLowerCase().includes(search.toLowerCase()) ||
            (report.pageUrl || '').toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || report.status === statusFilter;
        const matchesSeverity = severityFilter === 'ALL' || report.severity === severityFilter;

        return matchesSearch && matchesStatus && matchesSeverity;
    });

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('REPORTS')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'REPORTS' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Bug Reports
                </button>
                <button
                    onClick={() => setActiveTab('CONFIG')}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'CONFIG' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    Installation & Config
                </button>
            </div>

            {/* TAB CONTENT: REPORTS */}
            {activeTab === 'REPORTS' && (
                <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Search bugs or URLs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="RESOLVED">Resolved</option>
                        </select>
                        <select
                            value={severityFilter}
                            onChange={(e) => setSeverityFilter(e.target.value)}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                            <option value="ALL">All Severities</option>
                            <option value="CRITICAL">Critical</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>

                    {/* Table */}
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Bug Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Severity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reported</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                                            No bugs matched your filters.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report: any) => (
                                        <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900 line-clamp-1">{report.description || 'No description'}</p>
                                                <p className="text-xs text-slate-400 truncate">{report.pageUrl}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                ${report.severity === 'CRITICAL' ? 'bg-red-100 text-red-600' :
                                                        report.severity === 'HIGH' ? 'bg-orange-100 text-orange-600' :
                                                            'bg-blue-100 text-blue-600'}`}>
                                                    {report.severity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`flex items-center gap-1.5 text-sm font-medium
                                ${report.status === 'OPEN' ? 'text-amber-600' : 'text-green-600'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${report.status === 'OPEN' ? 'bg-amber-600' : 'bg-green-600'}`}></span>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(report.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-right">
                                                <Link href={`/dashboard/reports/${report.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                                                    Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: CONFIG */}
            {activeTab === 'CONFIG' && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 relative z-10">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">Quick Installation</h3>
                            <p className="text-slate-400 max-w-2xl">
                                Choose the method that best fits your workflow to start capturing bugs effortlessly.
                            </p>
                        </div>

                        {/* API Key Copy Box */}
                        <div className="flex items-center space-x-3 bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700/50 shadow-inner">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest hidden md:inline">API KEY</span>
                            <code className="text-blue-400 font-mono font-bold tracking-tight bg-blue-900/20 px-2 py-0.5 rounded">{project.apiKey}</code>
                            <button
                                onClick={handleCopy}
                                className="text-slate-400 hover:text-white transition-colors bg-slate-700/50 hover:bg-slate-600 p-1.5 rounded-md flex items-center justify-center relative group"
                                aria-label="Copy API Key"
                            >
                                {copied ? (
                                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 relative z-10">
                        {/* Option 1: CLI (Recommended) */}
                        <div>
                            <p className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                                <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Recommended</span>
                                Option 1: Automagic CLI 🪄
                            </p>
                            <p className="text-sm text-slate-400 mb-2">Run this from your project root. It will ask for your API key and auto-inject the component into your layout.</p>
                            <div className="bg-[#0d1117] border border-slate-800/60 rounded-xl p-4 font-mono text-sm text-green-400 overflow-x-auto shadow-inner">
                                <pre>{`npx bugcatcher-init`}</pre>
                            </div>
                        </div>

                        {/* Option 2: NPM Package */}
                        <div>
                            <p className="text-sm font-bold text-white mb-2">Option 2: React Component (NPM)</p>
                            <p className="text-sm text-slate-400 mb-2">Install the package and drop the headless component into your main <code>layout.tsx</code> or <code>App.tsx</code>.</p>
                            <div className="bg-[#0d1117] border border-slate-800/60 rounded-xl p-4 font-mono text-sm text-blue-300 overflow-x-auto shadow-inner space-y-2">
                                <div className="text-green-400">npm install @bugcatcher/react</div>
                                <div className="text-slate-500">{"// Then in your code:"}</div>
                                <div>import &#123; BugCatcherWidget &#125; from &quot;@bugcatcher/react&quot;;</div>
                                <div>&lt;BugCatcherWidget apiKey=&quot;{project.apiKey}&quot; /&gt;</div>
                            </div>
                        </div>

                        {/* Option 3: Raw HTML */}
                        <div>
                            <p className="text-sm font-bold text-white mb-2">Option 3: Vanilla HTML Script</p>
                            <p className="text-sm text-slate-400 mb-2">Paste this right before the closing <code>&lt;/body&gt;</code> tag of any website.</p>
                            <div className="bg-[#0d1117] border border-slate-800/60 rounded-xl p-4 font-mono text-sm text-yellow-300 overflow-x-auto shadow-inner">
                                <pre>
                                    {`<!-- BugCatcher Widget -->
<script src="https://bugcatcher.app/widget.js" data-project="${project.apiKey}"></script>`}
                                </pre>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 text-sm relative">
                            <div className="flex justify-between items-start mb-2">
                                <p className="font-bold text-blue-400">Remote Configuration Sync</p>

                                <button
                                    onClick={() => handleModeToggle(project.id, currentMode)}
                                    disabled={isPending}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${currentMode === 'DEV' ? 'bg-blue-600' : 'bg-slate-600'} ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${currentMode === 'DEV' ? 'translate-x-6' : 'translate-x-1'}`}
                                    />
                                </button>
                            </div>

                            <p className="text-slate-400 mb-3">
                                The widget remotely syncs its settings. Current mode: <span className={`font-bold ${currentMode === 'DEV' ? 'text-blue-400' : 'text-slate-300'}`}>{currentMode}</span>. You can change this setting from the Dashboard anytime.
                            </p>
                            <ul className="text-slate-400 space-y-2 text-xs">
                                <li><strong className="text-slate-200">DEV</strong>: Network, console, errors & <kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-white text-[10px]">Ctrl+Shift+B</kbd></li>
                                <li><strong className="text-slate-200">CLIENT</strong>: Floating button, privacy-focused.</li>
                            </ul>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 text-sm">
                            <p className="font-bold text-purple-400 mb-2">Capture Global App State</p>
                            <p className="text-slate-400 mb-3">
                                (Optional) Inject a function into the global window object. BugCatcher will call it to snapshot your Redux/Zustand state on bug creation.
                            </p>
                            <div className="bg-[#0d1117] border border-slate-800 rounded p-3 font-mono text-xs text-purple-300">
                                {`window.BugCatcherStateGetter = () => store.getState();`}
                            </div>
                        </div>
                        <div className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/50 text-sm">
                            <p className="font-bold text-teal-400 mb-2">Widget Language</p>
                            <p className="text-slate-400 mb-3">
                                Changes the language of the BugCatcher UI (Client Mode button, forms, and messages) in real-time.
                            </p>
                            <select
                                value={currentLanguage}
                                onChange={(e) => handleLanguageChange(project.id, e)}
                                disabled={isPending}
                                className="w-full bg-[#0d1117] border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                            >
                                <option value="en">English (Default)</option>
                                <option value="pt-br">Português (Brasil)</option>
                                <option value="pt-pt">Português (Portugal)</option>
                                <option value="es">Español</option>
                                <option value="fr">Français</option>
                                <option value="de">Deutsch</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

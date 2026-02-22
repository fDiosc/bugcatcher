import { db } from '@/lib/db';
import Link from 'next/link';

export default async function DashboardPage() {
    const projects = await db.projects.findMany();

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">No projects yet</h2>
                <p className="text-slate-500 mb-6 max-w-sm">Create your first project to start capturing bugs with session replays.</p>
                <Link href="/dashboard/projects/new" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block mt-4">
                    Create Project
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: any) => (
                <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-lg transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{project.name}</h3>
                            <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded">
                                {project._count.reports} reports
                            </span>
                        </div>
                        <div className="space-y-2 mb-6">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-slate-500 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Active
                                </p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${project.mode === 'DEV' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {project.mode || 'CLIENT'} MODE
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-mono truncate">KEY: {project.apiKey}</p>
                        </div>
                        <div className="flex justify-end pt-4 border-t border-slate-50">
                            <span className="text-blue-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                                View Reports
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

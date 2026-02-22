import { db } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProjectTabs from './ProjectTabs';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await db.users.get();
    const project = await db.projects.includeReports(id);

    if (!project || project.ownerId !== user?.id) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Project Not Found</h2>
                <p className="text-slate-500 mb-8 max-w-sm">
                    This project doesn't exist or you don't have permission to access it.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/dashboard"
                        className="px-6 py-2.5 rounded-lg font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        Back to Dashboard
                    </Link>
                    <Link
                        href="/dashboard/projects/new"
                        className="px-6 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        + Create New Project
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">{project.name}</h2>
                    <p className="text-slate-500">Manage and analyze your captured bugs</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm text-slate-600">
                        API Key: <code className="bg-slate-50 px-1 rounded">{project.apiKey}</code>
                    </div>
                </div>
            </div>

            <ProjectTabs project={project} />
        </div>
    );
}

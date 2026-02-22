import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import ProjectTabs from './ProjectTabs';

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const project = await db.projects.includeReports(id);

    if (!project) notFound();

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

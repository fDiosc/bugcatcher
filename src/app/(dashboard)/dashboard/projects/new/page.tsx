import { db, PLAN_LIMITS, Project } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default function NewProjectPage() {
    async function createProject(formData: FormData) {
        'use server';
        const name = formData.get('name') as string;
        const mode = formData.get('mode') as string;
        const clarityProjectId = formData.get('clarityProjectId') as string;
        const webhookUrl = formData.get('webhookUrl') as string;

        const user = await db.users.get();
        if (!user) redirect('/login');

        const currentProjects = (await db.projects.findMany()).filter((p: Project) => p.ownerId === user.id);
        const limit = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS].projects;

        if (currentProjects.length >= limit) {
            throw new Error(`Plan limit reached: Your ${user.plan} plan is limited to ${limit} project(s).`);
        }

        // Simulating crypto in server action if next.js allows Node crypto, but randomUUID is global
        const project = await db.projects.create({
            data: {
                name,
                mode,
                language: 'en',
                clarityProjectId: clarityProjectId || null,
                webhookUrl: webhookUrl || null,
                apiKey: `bc_${globalThis.crypto.randomUUID().split('-')[0]}`,
                ownerId: user.id,
                captureConfig: null
            }
        });

        redirect(`/dashboard/projects/${project.id}`);
    }

    return (
        <div className="max-w-2xl mx-auto py-8 space-y-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-slate-900">Create New Project</h1>
                </div>
            </div>

            <form action={createProject} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Project Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. My Awesome App"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 bg-slate-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">BugCatcher Mode</label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none has-[:checked]:border-blue-600 has-[:checked]:ring-1 disabled:opacity-50 border-slate-200">
                            <input type="radio" name="mode" value="DEV" className="sr-only" defaultChecked />
                            <span className="flex flex-1">
                                <span className="flex flex-col">
                                    <span className="block text-sm font-medium text-slate-900">Dev Mode</span>
                                    <span className="mt-1 flex items-center text-xs text-slate-500">Collects full network, console, and state payload.</span>
                                </span>
                            </span>
                            <svg className="h-5 w-5 text-blue-600 absolute top-4 right-4 hidden [.group:has(:checked)_&]:block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </label>

                        <label className="relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none has-[:checked]:border-blue-600 has-[:checked]:ring-1 disabled:opacity-50 border-slate-200">
                            <input type="radio" name="mode" value="CLIENT" className="sr-only" />
                            <span className="flex flex-1">
                                <span className="flex flex-col">
                                    <span className="block text-sm font-medium text-slate-900">Client Mode</span>
                                    <span className="mt-1 flex items-center text-xs text-slate-500">Privacy focused. Hides technical inputs from user.</span>
                                </span>
                            </span>
                            <svg className="h-5 w-5 text-blue-600 absolute top-4 right-4 hidden [.group:has(:checked)_&]:block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </label>
                    </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Clarity Project ID <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                        type="text"
                        name="clarityProjectId"
                        placeholder="e.g. 5x9jz7..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 bg-slate-50"
                    />
                    <p className="text-xs text-slate-500 mt-2">Required only if you want native Clarity deep links from the Dashboard.</p>
                </div>

                <div className="pt-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Slack Webhook URL <span className="text-slate-400 font-normal">(Optional)</span></label>
                    <input
                        type="url"
                        name="webhookUrl"
                        placeholder="https://hooks.slack.com/..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 bg-slate-50"
                    />
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end">
                    <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">
                        Create Project
                    </button>
                </div>
            </form>
        </div>
    );
}

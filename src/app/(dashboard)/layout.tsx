import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db, prisma, PLAN_LIMITS } from '@/lib/db';
import LogoutButton from '@/components/LogoutButton';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await db.users.get();

    if (!user) {
        redirect('/login');
    }

    const limits = PLAN_LIMITS[user.plan as keyof typeof PLAN_LIMITS];
    // ...

    // Compute current usage
    const allUserProjects = await db.projects.findMany(user.id);
    const projectsCount = allUserProjects.length;

    // Official Prisma count for reports
    const allUserProjectIds = allUserProjects.map((p: any) => p.id);
    const reportsCount = await prisma.report.count({
        where: { projectId: { in: allUserProjectIds } }
    });

    const reportsPercentage = Math.min(100, Math.round((reportsCount / limits.reportsPerMonth) * 100));
    const isCloseToLimit = reportsPercentage >= 80;
    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col hidden md:flex">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-10">
                    BugCatcher
                </div>
                <nav className="space-y-2 flex-grow">
                    <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100 transition-colors text-slate-700 font-medium">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Dashboard
                    </Link>
                </nav>
                <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reports Limit</span>
                            <span className={`text-xs font-bold ${isCloseToLimit ? 'text-red-500' : 'text-slate-700'}`}>
                                {reportsCount} / {limits.reportsPerMonth}
                            </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3 overflow-hidden">
                            <div className={`h-1.5 rounded-full transition-all ${isCloseToLimit ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${reportsPercentage}%` }}></div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                            <span>Projects: {projectsCount}/{limits.projects}</span>
                            <span>{user.plan} Plan</span>
                        </div>
                        {user.plan !== 'STUDIO' && (
                            <button className="w-full mt-2 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300 transition-colors text-xs font-semibold py-1.5 rounded-lg shadow-sm">
                                Upgrade Plan
                            </button>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-3 group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">{user.name?.charAt(0) || 'U'}</div>
                            <div className="text-sm">
                                <p className="font-semibold text-slate-900 truncate w-32">{user.name}</p>
                                <p className="text-slate-500 text-xs truncate w-32">{user.email}</p>
                            </div>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow flex flex-col">
                <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
                    <h1 className="text-lg font-semibold text-slate-800">Overview</h1>
                    <Link href="/dashboard/projects/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                        + New Project
                    </Link>
                </header>
                <div className="p-8 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

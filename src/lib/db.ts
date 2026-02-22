import { prisma } from './prisma';
import { getSessionId } from './auth';

// Re-exporting prisma for direct use if needed
export { prisma };

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    plan: 'FREE' | 'BUILDER' | 'STUDIO' | 'ENTERPRISE';
    createdAt: string;
}

export const PLAN_LIMITS = {
    FREE: { projects: 1, reportsPerMonth: 10, devModeAllowed: false },
    BUILDER: { projects: 5, reportsPerMonth: 500, devModeAllowed: true },
    STUDIO: { projects: 15, reportsPerMonth: 2000, devModeAllowed: true },
    ENTERPRISE: { projects: 9999, reportsPerMonth: 999999, devModeAllowed: true }
};

export interface Project {
    id: string;
    name: string;
    apiKey: string;
    clarityProjectId?: string;
    ownerId: string;
    mode: string;
    language: string;
    webhookUrl?: string;
    captureConfig?: Record<string, unknown>;
    createdAt: string;
}

export interface Report {
    id: string;
    projectId: string;
    claritySessionUrl?: string;
    pageUrl: string;
    userAgent: string;
    description?: string;
    aiSummary?: string;
    reproductionSteps?: string;
    severity: string;
    status: string;
    events?: unknown[];
    screenshots?: string[];
    replayInsights?: string;
    metadata?: Record<string, unknown>;
    consoleErrors?: unknown[];
    networkLog?: unknown[];
    performanceMetrics?: Record<string, unknown>;
    rootCause?: string;
    suggestedFix?: string;
    devTimeEstimate?: string;
    isRecurring?: boolean;
    relatedBugIds?: string[];
    assetPaths?: string[];
    mode?: string;
    createdAt: string;
}

export const db = {
    users: {
        findUnique: async ({ where }: { where: { email: string } }) => {
            return prisma.user.findUnique({ where });
        },
        get: async () => {
            const sid = await getSessionId();
            if (!sid) return null;

            return prisma.user.findUnique({
                where: { id: sid }
            });
        },
        updatePlan: async (userId: string, plan: 'FREE' | 'BUILDER' | 'STUDIO' | 'ENTERPRISE') => {
            return prisma.user.update({
                where: { id: userId },
                data: { plan }
            });
        }
    },
    projects: {
        findMany: async (ownerId?: string) => {
            return prisma.project.findMany({
                where: ownerId ? { ownerId } : undefined,
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { reports: true } } }
            });
        },
        findUnique: async ({ where, ownerId }: { where: { id?: string, apiKey?: string }, ownerId?: string }) => {
            return prisma.project.findFirst({
                where: {
                    ...where,
                    ownerId: ownerId ? ownerId : undefined
                },
                include: { _count: { select: { reports: true } } }
            });
        },
        includeReports: async (id: string, ownerId?: string) => {
            return prisma.project.findFirst({
                where: {
                    id,
                    ownerId: ownerId ? ownerId : undefined
                },
                include: {
                    reports: {
                        orderBy: { createdAt: 'desc' }
                    }
                }
            });
        },
        create: async ({ data }: { data: Omit<Project, 'id' | 'createdAt'> }) => {
            return prisma.project.create({ data });
        },
        update: async ({ where, data }: { where: { id: string }, data: Partial<Project> }) => {
            return prisma.project.update({ where, data: data as never });
        }
    },
    reports: {
        create: async ({ data }: { data: Omit<Report, 'id' | 'createdAt'> }) => {
            return prisma.report.create({ data });
        },
        update: async ({ where, data }: { where: { id: string }, data: Partial<Report> }) => {
            return prisma.report.update({ where, data });
        },
        findUnique: async ({ where }: { where: { id: string } }) => {
            return prisma.report.findUnique({
                where,
                include: { project: true }
            });
        },
        findUniqueWithOwnership: async ({ id, ownerId }: { id: string, ownerId: string }) => {
            const report = await prisma.report.findUnique({
                where: { id },
                include: { project: true }
            });

            if (report && report.project.ownerId !== ownerId) {
                return null;
            }

            return report;
        }
    }
};

export default db;

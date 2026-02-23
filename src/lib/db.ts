/* eslint-disable */
import { PrismaClient } from '@prisma/client';
import { getSessionId } from './auth';

const prisma = new PrismaClient();

// Re-exporting prisma for direct use if needed
export { prisma };

export interface User {
    id: string;
    email: string;
    name?: string | null;
    role: string;
    plan: string;
    createdAt: Date;
}

export const PLAN_LIMITS: Record<string, { projects: number; reportsPerMonth: number; devModeAllowed: boolean }> = {
    FREE: { projects: 1, reportsPerMonth: 10, devModeAllowed: false },
    BUILDER: { projects: 5, reportsPerMonth: 500, devModeAllowed: true },
    STUDIO: { projects: 15, reportsPerMonth: 2000, devModeAllowed: true },
    ENTERPRISE: { projects: 9999, reportsPerMonth: 999999, devModeAllowed: true }
};

export interface Project {
    id: string;
    name: string;
    apiKey: string;
    clarityProjectId?: string | null;
    ownerId: string;
    mode: string;
    language: string;
    webhookUrl?: string | null;
    captureConfig?: any;
    createdAt: Date;
    _count?: {
        reports: number;
    };
    reports?: Report[];
}

export interface ConsoleLog {
    type: string;
    message: string;
    timestamp: number;
    stack?: string;
}

export interface NetworkLog {
    url: string;
    method: string;
    status: number;
    duration: number;
    timestamp: number;
}

export interface Report {
    id: string;
    projectId: string;
    project?: Project; // Added to avoid 'as any' when included
    claritySessionUrl?: string | null;
    pageUrl: string;
    userAgent: string;
    description?: string | null;
    aiSummary?: string | null;
    reproductionSteps?: string | null;
    severity?: string | null;
    status: string;
    events?: any;
    screenshots?: string[];
    replayInsights?: string | null;
    metadata?: any;
    consoleErrors?: any[];
    networkLog?: any[];
    performanceMetrics?: any;
    rootCause?: string | null;
    suggestedFix?: string | null;
    devTimeEstimate?: string | null;
    isRecurring?: boolean;
    relatedBugIds?: string[];
    assetPaths?: string[];
    mode: string;
    createdAt: Date;
    updatedAt?: Date; // Added for compatibility
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
        create: async ({ data }: { data: any }) => {
            return prisma.project.create({ data });
        },
        update: async ({ where, data }: { where: { id: string }, data: any }) => {
            return prisma.project.update({ where, data });
        }
    },
    reports: {
        create: async ({ data }: { data: any }) => {
            return prisma.report.create({ data });
        },
        update: async ({ where, data }: { where: { id: string }, data: any }) => {
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

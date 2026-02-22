import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'db.json');

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
    language: string; // e.g. 'en', 'pt-br', 'es'
    webhookUrl?: string;
    captureConfig?: any;
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
    events?: any[]; // Store rrweb event stream
    screenshots?: string[]; // Array of base64 frames (legacy flow) or keys
    replayInsights?: string; // AI generated insights from replay
    status: string;
    metadata?: {
        rawClarityId?: string | null;
        rawClarityUserId?: string | null;
        clientTimestamp?: string | number;
        jsErrors?: any[];
        appState?: any;
    };
    consoleErrors?: any[];
    networkLog?: any[];
    performanceMetrics?: any;
    rootCause?: string;
    suggestedFix?: string;
    devTimeEstimate?: string;
    isRecurring?: boolean;
    relatedBugIds?: string[];
    assetPaths?: string[]; // URLs/Paths to local files
    mode?: string;
    createdAt: string;
}

interface Database {
    users: User[];
    projects: Project[];
    reports: Report[];
}

const initialDb: Database = {
    users: [
        {
            id: 'demo-user',
            email: 'demo@bugcatcher.app',
            name: 'Demo User',
            role: 'ADMIN',
            plan: 'FREE',
            createdAt: new Date().toISOString()
        }
    ],
    projects: [
        {
            id: 'demo-project',
            name: 'My Awesome App',
            apiKey: 'bc_demo_key_123',
            clarityProjectId: 'p8f3w5qx2a',
            ownerId: 'demo-user',
            mode: 'CLIENT',
            language: 'en',
            createdAt: new Date().toISOString()
        }
    ],
    reports: []
};

let cachedDb: Database | null = null;

function getDb(): Database {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
        cachedDb = initialDb;
        return initialDb;
    }

    try {
        const content = fs.readFileSync(DB_PATH, 'utf-8');
        if (!content || content.trim() === '') {
            // Race condition string/truncation protection
            return cachedDb || initialDb;
        }
        cachedDb = JSON.parse(content);
        return cachedDb as Database;
    } catch (error) {
        console.warn('BugCatcher: JSON parse error during db sync (expected in Next.js fast refresh/concurrency). Using cache.');
        return cachedDb || initialDb;
    }
}

function saveDb(db: Database) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

export const db = {
    users: {
        findUnique: async ({ where }: { where: { email: string } }) => {
            const db = getDb();
            return db.users.find(u => u.email === where.email);
        },
        get: () => {
            return getDb().users.find(u => u.id === 'user_123') || getDb().users[0];
        },
        updatePlan: async (userId: string, plan: 'FREE' | 'BUILDER' | 'STUDIO' | 'ENTERPRISE') => {
            const database = getDb();
            const idx = database.users.findIndex(u => u.id === userId);
            if (idx > -1) {
                database.users[idx].plan = plan;
                saveDb(database);
            }
        }
    },
    projects: {
        findMany: async (args?: any) => {
            const db = getDb();
            return db.projects.map(p => ({
                ...p,
                _count: { reports: db.reports.filter(r => r.projectId === p.id).length }
            }));
        },
        findUnique: async ({ where }: { where: { id?: string, apiKey?: string } }) => {
            const db = getDb();
            if (where.id) return db.projects.find(p => p.id === where.id);
            if (where.apiKey) return db.projects.find(p => p.apiKey === where.apiKey);
        },
        includeReports: async (id: string) => {
            const db = getDb();
            const project = db.projects.find(p => p.id === id);
            if (!project) return null;
            return {
                ...project,
                reports: db.reports.filter(r => r.projectId === id).sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
            };
        },
        create: async ({ data }: { data: Omit<Project, 'id' | 'createdAt'> }) => {
            const db = getDb();
            const newProject: Project = {
                id: crypto.randomUUID(),
                ...data,
                createdAt: new Date().toISOString()
            };
            db.projects.push(newProject);
            saveDb(db);
            return newProject;
        },
        update: async ({ where, data }: { where: { id: string }, data: Partial<Project> }) => {
            const db = getDb();
            const index = db.projects.findIndex(p => p.id === where.id);
            if (index === -1) throw new Error('Project not found');

            db.projects[index] = { ...db.projects[index], ...data };
            saveDb(db);
            return db.projects[index];
        }
    },
    reports: {
        create: async ({ data }: { data: Omit<Report, 'id' | 'createdAt'> }) => {
            const db = getDb();
            const newReport: Report = {
                ...data,
                id: 'rep_' + Math.random().toString(36).substring(2, 9),
                createdAt: new Date().toISOString()
            };
            db.reports.push(newReport);
            saveDb(db);
            return newReport;
        },
        update: async ({ where, data }: { where: { id: string }, data: Partial<Report> }) => {
            const db = getDb();
            const index = db.reports.findIndex(r => r.id === where.id);
            if (index === -1) return null;
            db.reports[index] = { ...db.reports[index], ...data };
            saveDb(db);
            return db.reports[index];
        },
        findUnique: async ({ where }: { where: { id: string } }) => {
            const database = getDb();
            const report = database.reports.find(r => r.id === where.id);
            if (!report) return null;
            const project = database.projects.find(p => p.id === report.projectId);
            return { ...report, project };
        }
    }
};

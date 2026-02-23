/* eslint-disable */
require('dotenv').config();
/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Cleanup ALL existing data to ensure a clean slate for tests
    await prisma.report.deleteMany({});
    await prisma.project.deleteMany({});
    // Keep the user to avoid ID mismatches, but ensure plan is FREE

    // 2. Upsert User
    const user = await prisma.user.upsert({
        where: { email: 'demo@bugcatcher.app' },
        update: { plan: 'FREE' },
        create: {
            id: 'user_123',
            email: 'demo@bugcatcher.app',
            name: 'Demo User',
            role: 'ADMIN',
            plan: 'FREE',
        },
    });

    // 3. Create Demo Project
    const project = await prisma.project.create({
        data: {
            id: 'demo-project-id',
            name: 'My Awesome App',
            apiKey: 'bc_demo_key_123',
            clarityProjectId: 'p8f3w5qx2a',
            ownerId: user.id,
            mode: 'CLIENT',
            language: 'en'
        },
    });

    // 4. Create Initial Report
    await prisma.report.create({
        data: {
            projectId: project.id,
            description: 'The login button is unresponsive on mobile Safari.',
            pageUrl: 'https://example.com/login',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
            claritySessionUrl: `https://clarity.microsoft.com/projects/view/${project.clarityProjectId}/sessions/demo-session`,
            aiSummary: 'User reports UI interaction failure specifically on mobile Safari browsers.',
            reproductionSteps: '1. Open Safari on iPhone\n2. Navigate to /login',
            severity: 'HIGH',
            status: 'OPEN',
        },
    });

    console.log('Seed data created successfully with fixed API key!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

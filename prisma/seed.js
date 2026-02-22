const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.upsert({
        where: { email: 'demo@bugcatcher.app' },
        update: {},
        create: {
            email: 'demo@bugcatcher.app',
            name: 'Demo User',
            role: 'ADMIN',
            plan: 'FREE',
        },
    });

    const project = await prisma.project.create({
        data: {
            name: 'My Awesome App',
            apiKey: 'bc_' + Math.random().toString(36).substring(2, 15),
            clarityProjectId: 'p8f3w5qx2a', // Example ID
            ownerId: user.id,
        },
    });

    await prisma.report.create({
        data: {
            projectId: project.id,
            description: 'The login button is unresponsive on mobile Safari.',
            pageUrl: 'https://example.com/login',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Mobile/15E148 Safari/604.1',
            claritySessionUrl: `https://clarity.microsoft.com/projects/view/${project.clarityProjectId}/sessions/demo-session`,
            aiSummary: 'User reports UI interaction failure specifically on mobile Safari browsers. The login trigger fails to execute, potentially due to event listener incompatibilities or CSS overlaying.',
            reproductionSteps: '1. Open Safari on iPhone\n2. Navigate to /login\n3. Tap login button repeatedly\n4. Observe no server request or UI feedback',
            severity: 'HIGH',
            status: 'OPEN',
        },
    });

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

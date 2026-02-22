const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const users = await prisma.user.findMany();
        console.log('Users found:', users.map(u => ({ id: u.id, email: u.email, plan: u.plan })));

        const projects = await prisma.project.findMany();
        console.log('Projects found:', projects.map(p => ({ id: p.id, name: p.name, apiKey: p.apiKey, ownerId: p.ownerId })));
    } catch (e) {
        console.error('Query failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

test();

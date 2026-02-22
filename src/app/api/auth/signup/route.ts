import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { name, email } = await request.json();

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and Email are required' }, { status: 400 });
        }

        // Check if user exists
        let user = await prisma.user.findUnique({ where: { email } });

        if (user) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // Create user
        user = await prisma.user.create({
            data: {
                name,
                email,
                plan: 'FREE'
            }
        });

        await setSession(user.id);

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Signup Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

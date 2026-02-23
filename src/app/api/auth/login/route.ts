import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Simulating simple passwordless login for MVP: if user exists, log them in
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            console.log(`Login failed: User not found for email ${email}`);
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        console.log(`Login success for user: ${user.email} (${user.id})`);
        await setSession(user.id);

        return NextResponse.json({ success: true, user: { id: user.id, name: user.name, email: user.email } });
    } catch (error) {
        console.error('Login Error detailed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

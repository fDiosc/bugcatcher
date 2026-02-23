import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'bc_user_id';

export async function getSessionId() {
    const cookieStore = await cookies();
    const sid = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    console.log(`[AUTH] getSessionId: ${sid || 'NONE'}`);
    return sid;
}

export async function setSession(userId: string) {
    const cookieStore = await cookies();
    const isProd = process.env.NODE_ENV === 'production';

    console.log(`[AUTH] setSession for userId: ${userId} (isProd: ${isProd})`);

    cookieStore.set(SESSION_COOKIE_NAME, userId, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        // Don't set explicit domain yet, let it be host-only which is safer for now
        // unless we find it's a www/root issue
    });
}

export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

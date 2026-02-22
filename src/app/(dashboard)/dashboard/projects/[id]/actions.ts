'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function changeProjectMode(projectId: string, newMode: string) {
    try {
        await db.projects.update({
            where: { id: projectId },
            data: { mode: newMode }
        });

        // Invalidate the project page cache to reflect the database change
        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true };
    } catch (e) {
        console.error('Failed to change project mode', e);
        return { success: false };
    }
}
export async function changeProjectLanguage(projectId: string, newLanguage: string) {
    try {
        await db.projects.update({
            where: { id: projectId },
            data: { language: newLanguage }
        });

        revalidatePath(`/dashboard/projects/${projectId}`);
        return { success: true };
    } catch (e) {
        console.error('Failed to change project language', e);
        return { success: false };
    }
}

'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function changeReportStatus(reportId: string, newStatus: string) {
    try {
        await db.reports.update({
            where: { id: reportId },
            data: { status: newStatus }
        });

        // Revalidate the report page and the project dashboard
        revalidatePath(`/dashboard/reports/${reportId}`);
        // We can't know the exact project ID here simply unless we fetch it, 
        // but revalidating the layout or specific paths usually helps.
        revalidatePath('/dashboard/projects/[id]', 'page');

        return { success: true };
    } catch (e) {
        console.error('Failed to update report status', e);
        return { success: false };
    }
}

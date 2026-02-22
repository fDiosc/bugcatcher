'use client';

import { useState, useTransition } from 'react';
import { changeReportStatus } from './actions';

interface StatusDropdownProps {
    reportId: string;
    initialStatus: string;
}

export default function StatusDropdown({ reportId, initialStatus }: StatusDropdownProps) {
    const [status, setStatus] = useState(initialStatus || 'OPEN');
    const [isPending, startTransition] = useTransition();

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setStatus(newStatus);
        startTransition(() => {
            changeReportStatus(reportId, newStatus);
        });
    };

    const getStatusColors = (currentStatus: string) => {
        switch (currentStatus) {
            case 'RESOLVED': return 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-emerald-500';
            case 'IN_PROGRESS': return 'bg-blue-50 border-blue-200 text-blue-700 ring-blue-500';
            default: return 'bg-amber-50 border-amber-200 text-amber-700 ring-amber-500';
        }
    };

    return (
        <div className="relative inline-block">
            <select
                value={status}
                onChange={handleStatusChange}
                disabled={isPending}
                className={`appearance-none font-bold text-xs uppercase tracking-wider px-3 py-1.5 pr-8 rounded-lg border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${getStatusColors(status)} ${isPending ? 'opacity-50' : ''}`}
            >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
            </select>
            {/* Custom dropdown arrow */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-current opacity-70">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
        </div>
    );
}

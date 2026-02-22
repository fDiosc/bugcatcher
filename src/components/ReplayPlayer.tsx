'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ReplayPlayerProps {
    events: any[];
}

export default function ReplayPlayer({ events }: ReplayPlayerProps) {
    const playerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        // Load rrweb-player assets dynamically
        if (typeof window === 'undefined') return;

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/style.css';
        document.head.appendChild(link);

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/rrweb-player@latest/dist/index.js';
        script.onload = () => setIsLoaded(true);
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(link);
            document.head.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (isLoaded && playerRef.current && events.length > 0) {
            // Clear previous player if any
            playerRef.current.innerHTML = '';

            try {
                // @ts-ignore
                new rrwebPlayer({
                    target: playerRef.current,
                    props: {
                        events,
                        width: playerRef.current.offsetWidth,
                        height: 400,
                        autoPlay: false,
                    },
                });
            } catch (err) {
                console.error('Error initializing rrweb-player:', err);
            }
        }
    }, [isLoaded, events]);

    if (!events || events.length === 0) {
        return (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl h-64 flex items-center justify-center text-slate-400 italic">
                No recording data available for this report.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800" style={{ minHeight: '400px' }}>
                {!isLoaded && (
                    <div className="h-full flex items-center justify-center text-slate-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                        Loading Replay Player...
                    </div>
                )}
                <div ref={playerRef} className="w-full h-full" />
            </div>
        </div>
    );
}

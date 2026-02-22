'use client';
import React, { useEffect } from 'react';

interface BugCatcherProps {
    apiKey: string;
}

export const BugCatcherWidget: React.FC<BugCatcherProps> = ({ apiKey }) => {
    useEffect(() => {
        // Only inject on the client side
        if (typeof window === 'undefined') return;

        // Check if the script is already injected to prevent duplication during React re-renders or Strict Mode
        if (document.querySelector('script[data-bugcatcher-injected]')) return;

        const script = document.createElement('script');
        // Using absolute localhost URL for the local simulation instead of a public CDN
        script.src = 'http://localhost:3000/widget.js';
        script.setAttribute('data-project', apiKey);
        script.setAttribute('data-bugcatcher-injected', 'true');
        script.async = true;

        document.head.appendChild(script);

        return () => {
            // Optional: Cleanup if the component is fully unmounted, though usually we want monitoring to persist
            // document.head.removeChild(script);
        };
    }, [apiKey]);

    // This is a headless component, it renders nothing directly.
    // The injected widget.js handles its own UI (the floating button or invisible monitoring).
    return null;
};

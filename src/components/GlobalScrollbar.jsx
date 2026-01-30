import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useLocation } from 'react-router-dom';
import './GlobalScrollbar.css'; // We'll create this to share styles

const GlobalScrollbar = ({ isLoading }) => {
    const [scrollProgress, setScrollProgress] = useState(5);
    const [isVisible, setIsVisible] = useState(false);
    const location = useLocation();

    // Check if we are on a page that handles its own scrolling (like AdminDashboard)
    // If AdminDashboard uses a localized overflow container, we might want to hide this global one
    // to avoid double bars or confusion.
    // However, if the window doesn't scroll (overflow: hidden on body), this bar won't show anyway.
    // So we rely on the implementation: if window.scrollHeight <= clientHeight, it hides.

    useEffect(() => {
        const updateScrollProgress = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            // Only show if content overflows AND not loading
            if (!isLoading && scrollHeight > clientHeight) {
                setIsVisible(true);

                const maxScroll = scrollHeight - clientHeight;
                const progress = (scrollTop / maxScroll) * 100;
                setScrollProgress(Math.min(100, Math.max(5, progress)));
            } else {
                setIsVisible(false);
            }
        };

        const handleScroll = () => {
            requestAnimationFrame(updateScrollProgress);
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', updateScrollProgress);

        // Initial check
        if (!isLoading) {
            setTimeout(updateScrollProgress, 300);
            updateScrollProgress();
        }

        const resizeObserver = new ResizeObserver(() => {
            if (!isLoading) updateScrollProgress();
        });
        resizeObserver.observe(document.body);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateScrollProgress);
            resizeObserver.disconnect();
        };
    }, [isLoading, location.pathname]); // Re-check on route change

    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <div className="scroll-progress-container visible" style={{ zIndex: 9990 }}>
            <div
                className="scroll-progress-fill"
                style={{ height: `${scrollProgress}%` }}
            />
        </div>,
        document.body
    );
};

export default GlobalScrollbar;

import { useEffect } from 'react';

const UNICORN_SCRIPT_SRC = "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.0.1/dist/unicornStudio.umd.js";

export const useUnicornScript = () => {
    useEffect(() => {
        const initUnicorn = () => {
            if (window.UnicornStudio) {
                // Destroy previous instance if method exists to prevent duplicates?
                // UnicornStudio documentation isn't clear on destroy, but init() usually re-scans.
                window.UnicornStudio.init();
            }
        };

        // 1. Check if script is already present
        let script = document.querySelector(`script[src="${UNICORN_SCRIPT_SRC}"]`);

        if (!script) {
            // 2. Load script if missing
            script = document.createElement("script");
            script.src = UNICORN_SCRIPT_SRC;
            script.async = true; // Non-blocking
            script.onload = initUnicorn;
            script.onerror = () => console.error("Failed to load Unicorn Studio script");
            document.body.appendChild(script);
        } else {
            // 3. If present, might be loaded or loading
            // We can't easily check .loaded state standardly, but if window.UnicornStudio exists, it's loaded.
            if (window.UnicornStudio) {
                // Add a small delay for React DOM to be ready
                setTimeout(initUnicorn, 100);
            } else {
                // Script tag exists but global not ready? Wait for load event?
                // Hard to attach second onload to existing script tag safely.
                // Poll for it.
                const interval = setInterval(() => {
                    if (window.UnicornStudio) {
                        window.UnicornStudio.init();
                        clearInterval(interval);
                    }
                }, 100);

                // Safety timeout to stop polling
                setTimeout(() => clearInterval(interval), 5000);
            }
        }

        // Re-init on unmount/remount? 
        // No cleanup needed normally for this script style.
    }, []);
};

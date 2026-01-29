import { useNavigate } from 'react-router-dom';
import { useTransitionContext } from './TransitionContext';

const PHRASES = {
    HOME: [
        "ENTERING HAWKINS",
        "CONNECTING TO CEREBRO",
        "AVOIDING THE DEMOGORGON",
        "WELCOME HOME"
    ],
    LOGIN: [
        "ACCESSING CLASSIFIED DATA",
        "DECRYPTING FILES",
        "VERIFYING CLEARANCE",
        "ACCESS GRANTED"
    ],
    REGISTER: [
        "RECRUITING SUBJECTS",
        "PREPARING SENSORY TANK",
        "ASSIGNING ID NUMBER",
        "WELCOME TO THE PARTY"
    ],
    ADMIN: [
        "BYPASSING SECURITY",
        "ACCESSING HAWKINS LAB",
        "CLEARANCE LEVEL: TOP SECRET",
        "MONITORING SUBJECTS"
    ],
    ORGANIZER: [
        "SYNCING WITH THE UPSIDE DOWN",
        "GATHERING SUPPLIES",
        "PREPARING THE ARCADE",
        "GAME MASTER CONTROL"
    ],
    EVENTS: [
        "SCANNING FREQUENCIES",
        "LOCATING SIGNALS",
        "TUNING RADIO TO CHANNEL 4",
        "SEARCHING FOR WILL"
    ],
    DEFAULT: [
        "ENTERING THE UPSIDE DOWN",
        "DON'T BLINK",
        "SOMETHING IS COMING",
        "RUNNING..."
    ]
};

export const usePageTransition = () => {
    const navigate = useNavigate();
    const { startTransition, endTransition } = useTransitionContext();

    const navigateWithTransition = async (to, options = {}) => {
        const { transitionText, ...navOptions } = options;

        // 1. Determine Text Array
        let phrases = transitionText ? [transitionText] : PHRASES.DEFAULT;

        if (!transitionText && typeof to === 'string') {
            if (to === '/home' || to === '/') phrases = PHRASES.HOME;
            else if (to === '/login') phrases = PHRASES.LOGIN;
            else if (to === '/register') phrases = PHRASES.REGISTER;
            else if (to.includes('admin')) phrases = PHRASES.ADMIN;
            else if (to.includes('organizer')) phrases = PHRASES.ORGANIZER;
            else if (to.includes('events')) phrases = PHRASES.EVENTS;
        }

        // 2. Show Overlay
        // Pass array directly to context
        startTransition(phrases);

        // 3. Wait for entrance animation and AT LEAST 1s visibility
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Navigate
        navigate(to, navOptions);

        // 5. Extended wait for heavy assets (Unicorn Studio/Spline)
        // 3 seconds to ensure background is likely loaded or at least overlay masked the glitch
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 6. Hide Overlay
        endTransition();
    };

    return navigateWithTransition;
};

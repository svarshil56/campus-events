import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TransitionSystem.css';

// --- 1. Context & Provider ---
const TransitionContext = createContext();

export const TransitionProvider = ({ children }) => {
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [transitionPhrases, setTransitionPhrases] = useState(["LOADING..."]);
    const [overlayVisible, setOverlayVisible] = useState(false);

    const startTransition = (phrases = ["LOADING..."]) => {
        const phrasesArray = Array.isArray(phrases) ? phrases : [phrases];
        setTransitionPhrases(phrasesArray);
        setOverlayVisible(true);
        setIsTransitioning(true);
    };

    const endTransition = () => {
        setOverlayVisible(false);
        // Delay resetting isTransitioning to allow fade out
        setTimeout(() => {
            setIsTransitioning(false);
            setTransitionPhrases([""]);
        }, 1000); // Match CSS transition duration
    };

    return (
        <TransitionContext.Provider value={{
            isTransitioning,
            transitionPhrases,
            overlayVisible,
            startTransition,
            endTransition,
            setTransitionPhrases
        }}>
            {children}
            {/* Render Component Automatically? Or let App do it? 
                Let's follow previous pattern: App renders PageTransition explicitly or we export it.
                For cleaner usage, we could render it here if it's truly global.
                But App.jsx currently renders it within layout. Let's export it.
            */}
        </TransitionContext.Provider>
    );
};

export const useTransitionContext = () => useContext(TransitionContext);

// --- 2. Phrases & Hook ---
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
        startTransition(phrases);

        // 3. Wait for entrance animation and AT LEAST 1s visibility
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 4. Navigate
        navigate(to, navOptions);

        // 5. Extended wait for heavy assets (Unicorn Studio/Spline)
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 6. Hide Overlay
        endTransition();
    };

    return navigateWithTransition;
};

// --- 3. UI Component ---
export const PageTransition = () => {
    const { overlayVisible, transitionPhrases } = useTransitionContext();
    const [currentText, setCurrentText] = useState("");
    const [displayChars, setDisplayChars] = useState([]);
    const [barExpand, setBarExpand] = useState(false);

    // Phrase rotation logic
    useEffect(() => {
        if (!overlayVisible || !transitionPhrases || transitionPhrases.length === 0) return;

        let phraseIndex = 0;
        setCurrentText(transitionPhrases[0]);

        if (transitionPhrases.length > 1) {
            const interval = setInterval(() => {
                phraseIndex = (phraseIndex + 1) % transitionPhrases.length;
                setCurrentText(transitionPhrases[phraseIndex]);
            }, 600);
            return () => clearInterval(interval);
        }
    }, [overlayVisible, transitionPhrases]);

    // Text typing/reveal effect
    useEffect(() => {
        if (!currentText || !overlayVisible) {
            setDisplayChars([]);
            setBarExpand(false);
            return;
        }

        const chars = currentText.split('');
        const totalTime = 200;
        const stepTime = totalTime / chars.length;

        setDisplayChars(new Array(chars.length).fill(''));
        setBarExpand(false);

        let timeouts = [];

        chars.forEach((char, index) => {
            const timeout = setTimeout(() => {
                setDisplayChars(prev => {
                    const newArr = [...prev];
                    newArr[index] = char;
                    return newArr;
                });
            }, index * stepTime);
            timeouts.push(timeout);
        });

        const barTimeout = setTimeout(() => {
            setBarExpand(true);
        }, 100);
        timeouts.push(barTimeout);

        return () => timeouts.forEach(clearTimeout);
    }, [currentText, overlayVisible]);

    return (
        <div className={`stranger-transition-overlay ${overlayVisible ? 'active' : ''}`}>
            <div className="stranger-bg">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="dust-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 10}s`
                        }}
                    ></div>
                ))}
            </div>

            <div className="stranger-text-container">
                <div className="stranger-title">
                    {currentText.split('').map((char, i) => (
                        <span
                            key={i}
                            className={`stranger-char ${displayChars[i] ? 'filled' : ''}`}
                            style={{
                                opacity: displayChars[i] ? 1 : 0.3,
                                transform: displayChars[i] ? 'scale(1)' : 'scale(0.8)',
                                transition: 'all 0.1s ease'
                            }}
                        >
                            {char === ' ' ? '\u00A0' : char}
                        </span>
                    ))}
                </div>
                <div className={`stranger-bar ${barExpand ? 'expand' : ''}`}></div>
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import './PageTransition.css';
import { useTransitionContext } from './TransitionContext';

const PageTransition = () => {
    const { overlayVisible, transitionPhrases } = useTransitionContext();
    const [currentText, setCurrentText] = useState("");
    const [displayChars, setDisplayChars] = useState([]);
    const [barExpand, setBarExpand] = useState(false);

    // Phrase rotation logic
    useEffect(() => {
        if (!overlayVisible || !transitionPhrases || transitionPhrases.length === 0) return;

        let phraseIndex = 0;
        setCurrentText(transitionPhrases[0]);

        // Only rotate if multiple phrases exist
        if (transitionPhrases.length > 1) {
            const interval = setInterval(() => {
                phraseIndex = (phraseIndex + 1) % transitionPhrases.length;
                setCurrentText(transitionPhrases[phraseIndex]);
            }, 600); // Slightly slower rotation for readability

            return () => clearInterval(interval);
        }
    }, [overlayVisible, transitionPhrases]);

    // Text typing/reveal effect (re-runs every time text changes)
    useEffect(() => {
        if (!currentText || !overlayVisible) {
            setDisplayChars([]);
            setBarExpand(false);
            return;
        }

        const chars = currentText.split('');
        // Faster reveal because text rotates quickly
        const totalTime = 200;
        const stepTime = totalTime / chars.length;

        setDisplayChars(new Array(chars.length).fill('')); // Reset
        setBarExpand(false);

        let timeouts = [];

        // 1. Reveal Characters
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

        // 2. Expand Bar immediately after text starts appearing to look dynamic
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
                                opacity: displayChars[i] ? 1 : 0.3, // Show faint outline maybe? Or just 0
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

export default PageTransition;

import React, { createContext, useContext, useState, useEffect } from 'react';

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
        </TransitionContext.Provider>
    );
};

export const useTransitionContext = () => useContext(TransitionContext);

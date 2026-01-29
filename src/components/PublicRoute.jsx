import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

const PublicRoute = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        // Can optionally render a spinner here, but strictly relying on App's global loading 
        // usually provides a smoother experience. 
        // For now, render nothing to avoid flash.
        return null;
    }

    if (user) {
        // User is logged in, redirect to home
        return <Navigate to="/home" replace />;
    }

    // User is not logged in, render the page (Login/Register)
    return <Outlet />;
};

export default PublicRoute;

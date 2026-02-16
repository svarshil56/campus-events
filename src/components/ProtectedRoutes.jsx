import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, database } from '../services/firebase';
import { useTransitionContext } from '../transition/TransitionContext'; // Import Context

const ProtectedRoutes = ({ roleRequired }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    // Use the global transition system
    const { startTransition, endTransition } = useTransitionContext();

    useEffect(() => {
        // Start animation when we begin checking auth
        startTransition([
            "VERIFYING IDENTITY",
            "SCANNING RETINA",
            "ACCESSING CLASSIFIED FILES"
        ]);

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Fetch role from Firestore
                try {
                    const userDoc = await getDoc(doc(database, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role);
                    }
                } catch (e) {
                    console.error("Error fetching user role:", e);
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);

            // Stop animation after check is done
            // Small delay to make it feel smooth
            setTimeout(() => {
                endTransition();
            }, 500);
        });
        return () => unsubscribe();
    }, []);

    const location = useLocation();

    if (loading) {
        // While loading, we return NULL because the Global Overlay from App.jsx 
        // will be covering the screen anyway.
        return null;
    }

    if (!user || !user.emailVerified) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roleRequired && role !== roleRequired) {
        // User authorized but wrong role
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;

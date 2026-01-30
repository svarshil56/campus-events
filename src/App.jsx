import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './services/firebase';
import { TransitionProvider, useTransitionContext } from './transition/TransitionContext';


import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import EventDetails from './pages/EventDetails';

import AdminRequests from './pages/admin/AdminRequests';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminEventList from './pages/admin/AdminEventList';
import OrganizerRequest from './pages/organizer-request/OrganizerRequest';
import OrganizerEventForm from './pages/organizer/OrganizerEventForm';
import OrganizerMyEvents from './pages/organizer/OrganizerMyEvents';
import EventRegistrations from './pages/organizer/EventRegistrations';
import MyEvents from './pages/MyEvents';
import ProtectedRoutes from './components/ProtectedRoutes';
import PublicRoute from './components/PublicRoute';
import PageTransition from './transition/PageTransition';

import { SpeedInsights } from "@vercel/speed-insights/react"

// Wrapper to handle route changes
const AppContent = ({ user, loadingAuth }) => {
    // We can use the context here if we want to trigger initial load animation
    // But PageTransition is inside the Provider, so we need to be careful.
    // Actually, AppContent IS inside the Router, but we need TransitionProvider INSIDE Router?
    // Or outside? Context usually outside everything or inside Router if it uses navigation?
    // usePageTransition uses useNavigate, so TransitionProvider must be inside Router.
    // But AppContent is inside Router.
    // So we can wrap the return of AppContent or wrap AppContent in App.
    // Let's look at App function.
    return (
        <TransitionProvider>
            <InnerAppContent user={user} loadingAuth={loadingAuth} />
        </TransitionProvider>
    );
};

const InnerAppContent = ({ user, loadingAuth }) => {
    const location = useLocation();
    const { startTransition, endTransition, isTransitioning } = useTransitionContext();

    // Handle Global Auth Loading (Initial Load)
    useEffect(() => {
        if (loadingAuth) {
            // Initial load
            startTransition([
                "ENTERING THE UPSIDE DOWN",
                "CONNECTING TO HAWKINS LAB",
                "OPENING THE GATE"
            ]);
        } else {
            endTransition();
        }
    }, [loadingAuth]);

    // We no longer trigger transition on location change because we want manual control.
    // But for browser back/forward, we might want a fallback?
    // For now, adhere to "Navigation should be controlled manually".
    // Browser back button will just change route.
    // If we strictly want animation on back button, we'd need useLocation check
    // but that flags AFTER route change.
    // Let's stick to manual for now.

    // Prevent rendering main app until initial auth check is done (to stop redirects)
    if (loadingAuth) {
        return <PageTransition />;
    }

    return (
        <>
            <PageTransition />
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<LandingPage />} />

                <Route element={<PublicRoute />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Route>

                <Route path="/about" element={<About />} />

                <Route element={<ProtectedRoutes roleRequired="student" />}>
                    <Route path="/become-organizer" element={<OrganizerRequest />} />
                    <Route path="/my-events" element={<MyEvents />} />
                </Route>

                <Route element={<ProtectedRoutes roleRequired="organizer" />}>
                    <Route path="/add-event" element={<OrganizerEventForm />} />
                    <Route path="/organizer/request-credits" element={<OrganizerRequest />} />
                    <Route path="/organizer/my-events" element={<OrganizerMyEvents />} />
                    <Route path="/organizer/event/:eventId/registrations" element={<EventRegistrations />} />
                </Route>

                <Route element={<ProtectedRoutes roleRequired="admin" />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/requests" element={<AdminRequests />} />
                    <Route path="/admin/users" element={<AdminUserManagement />} />
                    <Route path="/admin/events" element={<AdminEventList />} />
                </Route>

                <Route path="/events/:eventId" element={<EventDetails />} />
            </Routes>
        </>
    );
};

function App() {
    const [user, loading] = useAuthState(auth);

    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SpeedInsights />
            <AppContent user={user} loadingAuth={loading} />
        </Router>
    );
}

export default App;

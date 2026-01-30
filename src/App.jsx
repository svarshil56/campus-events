import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './services/firebase';
import { TransitionProvider, useTransitionContext } from './transition/TransitionContext';
import { SpeedInsights } from "@vercel/speed-insights/react";

import GlobalScrollbar from './components/GlobalScrollbar';
import PageTransition from './transition/PageTransition';

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

const AppContent = ({ user, loadingAuth }) => {
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
            startTransition([
                "ENTERING THE UPSIDE DOWN",
                "CONNECTING TO HAWKINS LAB",
                "OPENING THE GATE"
            ]);
        } else {
            endTransition();
        }
    }, [loadingAuth]);

    // Prevent rendering main app until initial auth check is done
    if (loadingAuth) {
        return <PageTransition />;
    }

    return (
        <>
            <GlobalScrollbar isLoading={isTransitioning} />
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

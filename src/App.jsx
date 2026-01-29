import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import EventDetails from './pages/EventDetails';

import AdminRequests from './pages/admin/AdminRequests';
import AdminDashboard from './pages/admin/AdminDashboard'; // Import Dashboard
import AdminUserManagement from './pages/admin/AdminUserManagement';
import OrganizerRequest from './pages/organizer-request/OrganizerRequest';
import OrganizerEventForm from './pages/organizer/OrganizerEventForm';
import OrganizerMyEvents from './pages/organizer/OrganizerMyEvents';
import EventRegistrations from './pages/organizer/EventRegistrations';
import MyEvents from './pages/MyEvents';
import ProtectedRoutes from './components/ProtectedRoutes'; // Import the new component

import { SpeedInsights } from "@vercel/speed-insights/react"

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <SpeedInsights />
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />

                <Route element={<ProtectedRoutes roleRequired="student" />}>
                    <Route path="/become-organizer" element={<OrganizerRequest />} />
                    <Route path="/my-events" element={<MyEvents />} />
                </Route>

                <Route element={<ProtectedRoutes roleRequired="organizer" />}>
                    {/* Protected routes can be added here in future */}
                    <Route path="/add-event" element={<OrganizerEventForm />} />
                    <Route path="/organizer/request-credits" element={<OrganizerRequest />} />
                    <Route path="/organizer/my-events" element={<OrganizerMyEvents />} />
                    <Route path="/organizer/event/:eventId/registrations" element={<EventRegistrations />} />
                </Route>

                <Route element={<ProtectedRoutes roleRequired="admin" />}>
                    {/* Dashboard is the new main entry for admins */}
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/requests" element={<AdminRequests />} />
                    <Route path="/admin/users" element={<AdminUserManagement />} />
                </Route>

                <Route path="/events/:eventId" element={<EventDetails />} />
            </Routes>
        </Router>
    );
}

export default App;

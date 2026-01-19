import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import EventDetails from './pages/EventDetails';

import AdminEventForm from './pages/admin/AdminEventForm';
import ProtectedRoutes from './components/ProtectedRoutes'; // Import the new component

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/about" element={<About />} />

                <Route element={<ProtectedRoutes roleRequired="organizer" />}>
                    {/* Protected routes can be added here in future */}
                    <Route path="/add-event" element={<AdminEventForm />} />
                </Route>
                <Route path="/events/:eventId" element={<EventDetails />} />
            </Routes>
        </Router>
    );
}

export default App;

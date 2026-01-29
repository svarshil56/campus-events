import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { database, auth } from '../../services/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import './OrganizerMyEvents.css';

const OrganizerMyEvents = () => {
    const [user, loadingUser] = useAuthState(auth);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loadingUser && !user) navigate('/login');
        if (user) fetchOrganizerEvents();
    }, [user, loadingUser]);

    const fetchOrganizerEvents = async () => {
        try {
            const q = query(collection(database, "events"), where("organizerId", "==", user.uid));
            const querySnapshot = await getDocs(q);
            const eventList = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventList);
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (eventId, eventTitle) => {
        if (!window.confirm(`Delete event "${eventTitle}"? This cannot be undone.`)) return;

        try {
            await deleteDoc(doc(database, "events", eventId));
            setEvents(events.filter(e => e.id !== eventId));
            alert("Event deleted successfully.");
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete event.");
        }
    };

    return (
        <div className="organizer-events-container">
            <Navbar />
            <div className="content-wrapper">
                <h1 className="page-title">My Created Events</h1>
                <div className="events-grid">
                    {loading ? (
                        <p>Loading your events...</p>
                    ) : events.length === 0 ? (
                        <div className="no-events">
                            <p>You haven't created any events yet.</p>
                            <button onClick={() => navigate('/add-event')} className="create-btn">
                                Create Event
                            </button>
                        </div>
                    ) : (
                        events.map(event => (
                            <div key={event.id} className="org-event-card">
                                <div className="event-info">
                                    <h3>{event.title}</h3>
                                    <p className="event-date">{event.date}</p>
                                    <p className="event-stats">
                                        Registrations: <strong>{event.currentRegNo || 0}</strong>
                                    </p>
                                </div>
                                <div className="event-actions">
                                    <button
                                        className="action-btn view-regs-btn"
                                        onClick={() => navigate(`/organizer/event/${event.id}/registrations`)}
                                    >
                                        View Registrations
                                    </button>
                                    <button
                                        className="action-btn delete-event-btn"
                                        onClick={() => handleDelete(event.id, event.title)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrganizerMyEvents;

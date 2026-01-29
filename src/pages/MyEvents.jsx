import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collectionGroup, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { database, auth } from '../services/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import Navbar from '../components/Navbar';
import registerTextImg from '../assets/regeve.png';
import { motion } from 'framer-motion';
import './MyEvents.css'; // We'll create this next

const MyEvents = () => {
    const navigate = useNavigate();
    const [user, loadingUser] = useAuthState(auth);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRegisteredEvents = async () => {
            if (!user) return;

            try {
                console.log("Fetching registrations for user:", user.uid);
                // 1. Find all registrations for this user across all events
                const q = query(
                    collectionGroup(database, 'registrations'),
                    where('uid', '==', user.uid)
                );

                const querySnapshot = await getDocs(q);
                console.log("Registrations found:", querySnapshot.size);

                // 2. Extract event IDs and fetch event details
                const eventPromises = querySnapshot.docs.map(async (regDoc) => {
                    // Structure: events/{eventId}/registrations/{regId}
                    // regDoc.ref.parent is 'registrations' collection
                    // regDoc.ref.parent.parent is the event document reference
                    const eventRef = regDoc.ref.parent.parent;

                    if (eventRef) {
                        const eventSnap = await getDoc(eventRef);
                        if (eventSnap.exists()) {
                            return {
                                id: eventSnap.id,
                                ...eventSnap.data(),
                                regId: regDoc.id, // Keep track of registration ID too if needed
                                path: `/events/${eventSnap.id}`,
                                button: 'View Details'
                            };
                        }
                    }
                    return null;
                });

                const fetchedEvents = (await Promise.all(eventPromises)).filter(e => e !== null);

                setEvents(fetchedEvents);
            } catch (err) {
                console.error("Error fetching registered events:", err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        if (!loadingUser) {
            if (!user) {
                navigate('/login');
            } else {
                fetchRegisteredEvents();
            }
        }
    }, [user, loadingUser, navigate]);

    // Loading state covered by global transition
    if (loading || loadingUser) return <div className="landing-container" style={{ minHeight: '100vh', background: '#000' }}></div>;

    return (
        <div className="landing-container" style={{ minHeight: '100vh', background: '#000' }}>
            {/* Background Overlay reused from landing */}
            <div className="landing-bg-overlay"></div>

            <Navbar />

            <div className="my-events-section" style={{ paddingTop: '100px' }}>
                <div className="my-events-content-wrapper">
                    <img
                        src={registerTextImg}
                        alt="Register Text"
                        className="my-events-header-image"
                    />
                    <p className="my-events-header-text">
                        See you there.
                    </p>
                </div>

                {error && (
                    <div style={{ padding: '20px', background: 'rgba(255,0,0,0.1)', border: '1px solid red', borderRadius: '8px', margin: '20px 0', color: '#ff6b6b' }}>
                        <h3>Error fetching events</h3>
                        <p>{error.message}</p>
                        {error.message.includes("index") && (
                            <p style={{ marginTop: '10px' }}>
                                <strong>Action Required:</strong> Please check the browser console (F12) for a link to create the required Firestore index.
                            </p>
                        )}
                    </div>
                )}

                {events.length === 0 && !error ? (
                    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', marginTop: '2rem' }}>
                        <h3>You haven't registered for any events yet.</h3>
                        <button
                            onClick={() => navigate('/home#events')}
                            className="event-button"
                            style={{ marginTop: '1rem', display: 'inline-block' }}
                        >
                            Browse Events
                        </button>
                    </div>
                ) : (
                    <div className="my-events-list">
                        {events.map((event, idx) => (
                            <motion.div
                                key={event.regId}
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.15, duration: 0.6 }}
                                className="ticket-card"
                            >
                                {/* Left Side: Event Info */}
                                <div className="ticket-left">
                                    <div className="ticket-header">
                                        <span className="ticket-tag">{event.tag}</span>
                                        <span className="ticket-id">#{event.regId.split('_').pop()}</span>
                                    </div>
                                    <h2 className="ticket-title">{event.title}</h2>
                                    <div className="ticket-meta">
                                        <div className="meta-item">
                                            <span className="meta-label">DATE</span>
                                            <span className="meta-value">{event.date}</span>
                                        </div>
                                        <div className="meta-item">
                                            <span className="meta-label">LOCATION</span>
                                            <span className="meta-value">{event.location}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Perforation Line */}
                                <div className="ticket-divider">
                                    <div className="notch-top"></div>
                                    <div className="dashed-line"></div>
                                    <div className="notch-bottom"></div>
                                </div>

                                {/* Right Side: Action */}
                                <div className="ticket-right">
                                    <div className="ticket-barcode"></div>
                                    <button
                                        className="ticket-button"
                                        onClick={() => navigate(event.path)}
                                    >
                                        VIEW TICKET
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyEvents;

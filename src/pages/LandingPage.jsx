import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { database } from '../services/firebase';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import eventsTitleImage from '../assets/events-title.png';
import './LandingPage.css';
import { eventCoverDefaults } from '../utils/eventCovers';

const LandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Helper to get a stable cover for events without one
    const getStableCover = (id) => {
        const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return eventCoverDefaults[index % eventCoverDefaults.length];
    };

    // Dual Filter State
    const [statusFilter, setStatusFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Status Mapping: Display Name -> Internal Value
    const statusMap = {
        'All': 'All',
        'Upcoming Events': 'Upcoming',
        'Live Events': 'Live',
        'Past Events': 'Completed'
    };

    // Fetch events from Firestore
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(database, 'events'), (snapshot) => {
            const fetchedEvents = snapshot.docs.map(doc => {
                const data = doc.data();

                // Calculate Status
                const now = new Date();
                let status = 'Upcoming';

                // Convert Firestore Timestamp to Date objects
                const start = data.startTimestamp ? data.startTimestamp.toDate() : null;
                const end = data.endTimestamp ? data.endTimestamp.toDate() : null;

                if (start && end) {
                    if (now >= start && now <= end) {
                        status = 'Live';
                    } else if (now > end) {
                        status = 'Completed';
                    } else {
                        status = 'Upcoming';
                    }
                } else {
                    status = 'Upcoming';
                }

                return {
                    id: doc.id,
                    ...data,
                    path: `/events/${doc.id}`,
                    button: status === 'Completed' ? 'View Highlights' : 'View Details',
                    computedStatus: status
                };
            });
            setEvents(fetchedEvents);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching events:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Dual Filter Logic
    const filteredEvents = events.filter(event => {
        // 1. Check Status
        // Get internal status from the selected display filter
        const targetStatus = statusMap[statusFilter];
        const statusMatch = statusFilter === 'All' || event.computedStatus === targetStatus;

        // 2. Check Category
        const categoryMatch = categoryFilter === 'All' || event.tag === categoryFilter;

        return statusMatch && categoryMatch;
    });

    useEffect(() => {
        if (location.hash === '#events') {
            const element = document.getElementById('events');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            window.scrollTo(0, 0);
        }
    }, [location.hash]);

    // Filter Options - "All" removed as per user request
    const statusOptions = ['Upcoming Events', 'Live Events', 'Past Events'];
    const categoryOptions = ['Concerts', 'Technical', 'Cultural', 'Sports', 'Workshops'];

    return (
        <div className="landing-container">
            <div className="landing-bg-overlay"></div>
            <div className="navbar-wrapper">
                <Navbar />
            </div>

            <div className="events-section">
                <div className="events-content-wrapper">

                    <div className="events-header-group">
                        <div className="events-header-content">
                            <img
                                src={eventsTitleImage}
                                alt="Experience Campus Life with DAU Events"
                                className="events-header-image"
                                fetchPriority="high"
                            />
                            <p className="events-header-text">
                                Stay looped in with the pulse of DAU. Don't blink, or you might miss the action.
                            </p>
                        </div>

                        {/* Updated Filters: Two Rows */}
                        <div className="event-filters" id="events" style={{ scrollMarginTop: '100px', flexDirection: 'column', gap: '1rem' }}>

                            {/* Row 1: Status Filters */}
                            <div className="filter-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {statusOptions.map((filter) => (
                                    <button
                                        key={filter}
                                        className={`filter-btn ${statusFilter === filter ? 'active' : ''} ${filter === 'Live Events' ? 'live-filter' : ''}`}
                                        onClick={() => setStatusFilter(prev => prev === filter ? 'All' : filter)}>
                                        {filter === 'Live Events' && <span className="live-dot"></span>}
                                        {filter.toUpperCase()}
                                    </button>
                                ))}
                            </div>

                            {/* Separator Line */}
                            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', maxWidth: '200px', margin: '0 auto' }}></div>

                            {/* Row 2: Category Filters */}
                            <div className="filter-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                                {categoryOptions.map((filter) => (
                                    <button
                                        key={filter}
                                        className={`filter-btn ${categoryFilter === filter ? 'active' : ''}`}
                                        onClick={() => setCategoryFilter(prev => prev === filter ? 'All' : filter)}>
                                        {filter}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="events-cards-grid">
                        {filteredEvents.map((event, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15, duration: 0.8 }}
                                className="event-card group"
                            >
                                <div className="event-card-glow" />
                                <div className="event-card-image" style={{ backgroundImage: `url(${event.image || getStableCover(event.id)})` }}>
                                    <div className="event-card-overlay" />
                                </div>
                                <div className="event-card-content">
                                    <div className="event-card-bottom">
                                        <div className="event-card-meta">
                                            {event.computedStatus === 'Live' && (
                                                <span className="live-badge">
                                                    <span className="live-dot"></span> LIVE
                                                </span>
                                            )}
                                            <span className="event-tag">
                                                {event.tag}
                                            </span>
                                            <span className="event-date">
                                                {event.date}
                                            </span>
                                        </div>
                                        
                                        <h3 className="event-title">
                                            {event.title}
                                        </h3>

                                        <p className="event-card-desc">
                                            {event.description?.length > 100 
                                                ? `${event.description.substring(0, 100)}...` 
                                                : event.description}
                                        </p>

                                        <div className="event-card-actions">
                                            <button
                                                className="event-button"
                                                onClick={() => navigate(event.path)}
                                            >
                                                {event.button}
                                            </button>

                                            {/* Progress Bar */}
                                            <div className="event-progress-wrapper">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
                                                        Seats
                                                    </span>
                                                    <span style={{ fontSize: '0.6rem', color: '#FFD700', fontWeight: 'bold' }}>
                                                        {event.currentRegNo || 0}/100
                                                    </span>
                                                </div>
                                                <div className="event-progress-bar-bg" style={{ width: '60px', height: '4px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                                                    <div
                                                        className="event-progress-bar-fill"
                                                        style={{
                                                            width: `${Math.min(((event.currentRegNo || 0) / 100) * 100, 100)}%`,
                                                            height: '100%',
                                                            backgroundColor: '#FFD700',
                                                            borderRadius: '2px',
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default LandingPage;

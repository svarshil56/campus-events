import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { database } from '../services/firebase';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import eventsTitleImage from '../assets/events-title.png';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeFilter, setActiveFilter] = useState('All');
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch events from Firestore
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(database, 'events'), (snapshot) => {
            const fetchedEvents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                path: `/events/${doc.id}`, // Dynamic path
                button: 'View Details'
            }));
            setEvents(fetchedEvents);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching events:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredEvents = activeFilter === 'All' ? events : events.filter(event => event.tag === activeFilter);

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

    return (
        <div className="landing-container">

            {/* Background Image/Gradient */}
            <div className="landing-bg-overlay"></div>

            {/* Navbar */}
            <div className="navbar-wrapper">
                <Navbar />
            </div>
            {/* Content Section: Events */}
            <div className="events-section">
                <div className="events-content-wrapper">

                    {/* Header Group */}
                    <div className="events-header-group">
                        <div className="events-header-content">
                            {/* Replaced Text Title with Image */}
                            <img
                                src={eventsTitleImage}
                                alt="Experience Campus Life with DAU Events"
                                className="events-header-image"
                            />
                            <p className="events-header-text">
                                Stay looped in with the pulse of DAU. Don't blink, or you might miss the action.
                            </p>
                        </div>

                        {/* Filters - Centered below */}
                        <div className="event-filters" id="events" style={{ scrollMarginTop: '100px' }}>
                            {['All', 'Concerts', 'Technical', 'Cultural', 'Sports', 'Workshops'].map((filter, i) => (
                                <button
                                    key={filter}
                                    className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                                    onClick={() => setActiveFilter(filter)}>
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Cards Grid */}
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
                                {/* Hover Glow Effect */}
                                <div className="event-card-glow" />
                                <div className="event-card-content">
                                    <div className="event-card-header">
                                        <div className="event-card-meta">
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
                                        <p className="event-desc">
                                            {event.description || event.desc}
                                        </p>
                                        <button
                                            className="event-button"
                                            onClick={() => navigate(event.path)}
                                        >
                                            {event.button}
                                        </button>
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

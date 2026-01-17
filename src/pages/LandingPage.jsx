import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { motion } from 'framer-motion';
import eventsTitleImage from '../assets/events-title.png';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeFilter, setActiveFilter] = useState('All');
    const allEvents = [
        {
            tag: 'Concerts',
            title: 'Pre-SYNAPSE',
            date: 'JAN 10 • Weekends',
            desc: 'Its just the beginning',
            button: 'View Details',
            path: '/events/synapse'
        },
        {
            tag: 'Concerts',
            title: 'SYNAPSE',
            date: 'FEB 28 - MARCH 1 • Weekends',
            desc: 'Largest Gujarat Techno-Cultural fest',
            button: 'View Details',
            path: '/events/synapse'
        },
        {
            tag: 'Workshops',
            title: 'TEDx-DAIICT',
            date: 'MAR 10 • Weekends',
            desc: 'Inter-branch cricket showdown. Glory awaits the victors.',
            button: 'View Details',
            path: '/events/tarang'
        },
        {
            tag: 'Cultural',
            title: 'TARANG',
            date: 'Oct 20 • 6 PM',
            desc: 'A retro-synthwave musical journey under the stars.',
            button: 'View Details',
            path: '/events/tarang'
        },
        {
            tag: 'Sports',
            title: 'CONCOURS',
            date: 'Nov 02 • Weekends',
            desc: 'Inter-branch cricket showdown. Glory awaits the victors.',
            button: 'View Details',
            path: '/events/tarang'
        },
        {
            tag: 'Technical',
            title: 'I-FEST 2027',
            date: 'Oct 14 • 48 Hrs',
            desc: 'Code, caffeine, and chaos. Build the future in 48 hours.',
            button: 'View Details',
            path: '/events/synapse'
        },
    ];
    const filteredEvents = activeFilter === 'All' ? allEvents : allEvents.filter(event => event.tag === activeFilter);

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
                                            {event.desc}
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

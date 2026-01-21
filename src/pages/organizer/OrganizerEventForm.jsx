import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { database, auth } from '../../services/firebase';
import Navbar from '../../components/Navbar';
import './OrganizerEventForm.css';

const OrganizerEventForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        tag: 'Concerts', // Default tag
        description: '',
        date: '',
        time: '',
        location: '',
        convenerName: '',
        convenerId: '',
        deputyName: '',
        deputyId: '',
        contact1Name: '',
        contact1Phone: '',
        contact2Name: '',
        contact2Phone: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    // Limit Logic
    const [limitInfo, setLimitInfo] = useState({ created: 0, limit: 0, reached: false, loaded: false });

    // Fetch user limit on mount
    React.useEffect(() => {
        const checkLimit = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await import('firebase/firestore').then(mod => mod.getDoc(mod.doc(database, "users", auth.currentUser.uid)));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        const created = data.eventsCreated || 0;
                        const limit = data.eventLimit || 2; // Default 2
                        setLimitInfo({
                            created,
                            limit,
                            reached: created >= limit,
                            loaded: true
                        });
                    }
                } catch (e) {
                    console.error("Error checking limit:", e);
                }
            }
        };
        checkLimit();
    }, []);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (limitInfo.reached) {
            setStatus({ type: 'error', message: 'Event limit reached. Request more credits.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Create a safe ID from the event name
            const docId = formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            // 1. Create Event
            await setDoc(doc(database, 'events', docId), {
                title: formData.name,
                tag: formData.tag,
                description: formData.description,
                date: `${formData.date} • ${formData.time}`,
                location: formData.location,
                venue: formData.location,
                // Convener Info (For Admin/Organizer view)
                convener: `${formData.convenerName} (${formData.convenerId})`,
                deputy: `${formData.deputyName} (${formData.deputyId})`,
                // Coordinator Info (for Contact Us)
                contact1: `${formData.contact1Name} (${formData.contact1Phone})`,
                contact2: `${formData.contact2Name} (${formData.contact2Phone})`,
                organizerId: auth.currentUser ? auth.currentUser.uid : 'unknown',
                organizerName: auth.currentUser ? auth.currentUser.displayName : 'Anonymous',
                createdAt: new Date(),
                currentRegNo: 0
            });

            // 2. Increment User's Event Counter
            if (auth.currentUser) {
                const userRef = doc(database, "users", auth.currentUser.uid);
                // `updateDoc` and `increment` are already imported from 'firebase/firestore' in previous steps (lines 200+ edits), 
                // BUT let's verify imports at top of file.
                // Ah, line 3 only has: import { collection, doc, setDoc } from 'firebase/firestore';
                // I need to update the imports first or use dynamic import properly (awaiting outside).
                // Let's use dynamic import *outside* to be safe if I can't touch top imports easily in one go? 
                // No, standard way is better. 

                // Since I cannot see the top imports easily in this replace_block context (it's line 3),
                // I will use fully qualified dynamic import awaiting *before* the call.

                const { updateDoc, increment } = await import('firebase/firestore');
                await updateDoc(userRef, {
                    eventsCreated: increment(1)
                });
            }

            setStatus({ type: 'success', message: 'Event added successfully!' });

            // Redirect to home after a brief delay to show success message
            setTimeout(() => {
                navigate('/home');
            }, 1000);

            // ... reset form ...
            setFormData({
                name: '',
                tag: 'Concerts',
                description: '',
                date: '',
                time: '',
                location: '',
                convenerName: '',
                convenerId: '',
                deputyName: '',
                deputyId: '',
                contact1Name: '',
                contact1Phone: '',
                contact2Name: '',
                contact2Phone: ''
            });
        } catch (error) {
            console.error("Error adding document: ", error);
            setStatus({ type: 'error', message: `Error adding event: ${error.message}` });
        } finally {
            setLoading(false);
        }
    }

    const eventTags = ['Concerts', 'Technical', 'Cultural', 'Sports', 'Workshops'];

    return (
        <div className="event-form-container">
            <Navbar />
            <div className="landing-bg-overlay"></div>

            <div className="event-form-wrapper">
                <h2 className="event-form-title">Add New Event</h2>
                <form onSubmit={handleSubmit}>
                    <div className="event-form-group">
                        <label className="event-form-label" htmlFor="name">Event Name</label>
                        <input
                            required
                            className="event-form-input"
                            type="text"
                            id="name"
                            placeholder="e.g. SYNAPSE"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="event-form-group">
                        <label className="event-form-label" htmlFor="tag">Category</label>
                        <select
                            className="event-form-select"
                            id="tag"
                            value={formData.tag}
                            onChange={handleChange}
                        >
                            {eventTags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>

                    <div className="event-form-group">
                        <label className="event-form-label" htmlFor="description">Description</label>
                        <textarea
                            required
                            className="event-form-textarea"
                            id="description"
                            placeholder="Short description of the event..."
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="event-form-group">
                        <label className="event-form-label" htmlFor="date">Date</label>
                        <input
                            required
                            className="event-form-input"
                            type="text"
                            id="date"
                            placeholder="e.g. Oct 20 or JAN 10"
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="event-form-group">
                        <label className="event-form-label" htmlFor="time">Time / Duration</label>
                        <input
                            required
                            className="event-form-input"
                            type="text"
                            id="time"
                            placeholder="e.g. 6 PM or 48 Hrs"
                            value={formData.time}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="event-form-group">
                        <label className="event-form-label" htmlFor="location">Location</label>
                        <input
                            required
                            className="event-form-input"
                            type="text"
                            id="location"
                            placeholder="e.g. OAT or LT-1"
                            value={formData.location}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Conveners (Internal/Admin Info) */}
                    <div className="event-form-group">
                        <label className="event-form-label">Convener</label>
                        <div className="coordinator-group">
                            <input
                                required
                                className="event-form-input"
                                type="text"
                                id="convenerName"
                                placeholder="Name"
                                value={formData.convenerName}
                                onChange={handleChange}
                            />
                            <input
                                required
                                className="event-form-input"
                                type="text"
                                id="convenerId"
                                placeholder="Student ID"
                                value={formData.convenerId}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="event-form-group">
                        <label className="event-form-label">Deputy Convener</label>
                        <div className="coordinator-group">
                            <input
                                required
                                className="event-form-input"
                                type="text"
                                id="deputyName"
                                placeholder="Name"
                                value={formData.deputyName}
                                onChange={handleChange}
                            />
                            <input
                                required
                                className="event-form-input"
                                type="text"
                                id="deputyId"
                                placeholder="Student ID"
                                value={formData.deputyId}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {/* Coordinators (Student Contact Info) */}
                    <div className="event-form-group">
                        <label className="event-form-label">Coordinator 1 (Student Contact)</label>
                        <div className="coordinator-group">
                            <input
                                required
                                className="event-form-input"
                                type="text"
                                id="contact1Name"
                                placeholder="Name"
                                value={formData.contact1Name}
                                onChange={handleChange}
                            />
                            <input
                                required
                                className="event-form-input"
                                type="text"
                                id="contact1Phone"
                                placeholder="Phone Number"
                                value={formData.contact1Phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="event-form-group">
                        <label className="event-form-label">Coordinator 2 (Student Contact)</label>
                        <div className="coordinator-group">
                            <input
                                required
                                className="event-form-input"
                                type="text"
                                id="contact2Name"
                                placeholder="Name"
                                value={formData.contact2Name}
                                onChange={handleChange}
                            />
                            <input
                                required
                                className="event-form-input"
                                type="text"
                                id="contact2Phone"
                                placeholder="Phone Number"
                                value={formData.contact2Phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button className="event-form-submit" type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Event'}
                    </button>

                    {status.message && (
                        <div className={`event-form-message ${status.type}`}>
                            {status.message}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default OrganizerEventForm;
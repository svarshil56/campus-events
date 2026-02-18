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
        tag: 'Concerts',
        description: '',
        // New Date/Time Fields
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
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

    React.useEffect(() => {
        const checkLimit = async () => {
            if (auth.currentUser) {
                try {
                    const userDoc = await import('firebase/firestore').then(mod => mod.getDoc(mod.doc(database, "users", auth.currentUser.uid)));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        const created = data.eventsCreated || 0;
                        const limit = data.eventLimit || 2;
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

        // Basic Validation
        if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
            setStatus({ type: 'error', message: 'Please fill in all date and time fields.' });
            return;
        }

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Create JavaScript Date Objects for Timestamps
            const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
            const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

            if (endDateTime <= startDateTime) {
                setStatus({ type: 'error', message: 'End time must be after start time.' });
                setLoading(false);
                return;
            }

            // Create display string (e.g., "Oct 20 • 6:00 PM")
            const options = { month: 'short', day: 'numeric' };
            const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
            const dateDisplay = `${startDateTime.toLocaleDateString('en-US', options)} • ${startDateTime.toLocaleTimeString('en-US', timeOptions)}`;

            // Create a safe ID
            const docId = formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            const { Timestamp } = await import('firebase/firestore');

            // 1. Create Event
            await setDoc(doc(database, 'events', docId), {
                title: formData.name,
                tag: formData.tag,
                description: formData.description,

                // New Timestamp Fields for Logic
                startTimestamp: Timestamp.fromDate(startDateTime),
                endTimestamp: Timestamp.fromDate(endDateTime),

                // Display Fields
                date: dateDisplay, // Kept for backward compatibility with UI
                location: formData.location,
                venue: formData.location,

                convener: `${formData.convenerName} (${formData.convenerId})`,
                deputy: `${formData.deputyName} (${formData.deputyId})`,
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
                const { updateDoc, increment } = await import('firebase/firestore');
                await updateDoc(userRef, {
                    eventsCreated: increment(1)
                });
            }

            setStatus({ type: 'success', message: 'Event added successfully!' });

            setTimeout(() => {
                navigate('/home');
            }, 1000);

            // Reset form
            setFormData({
                name: '',
                tag: 'Concerts',
                description: '',
                startDate: '',
                startTime: '',
                endDate: '',
                endTime: '',
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

                    {/* NEW DATE/TIME SECTION */}
                    <div className="event-form-row">
                        <div className="event-form-group half">
                            <label className="event-form-label" htmlFor="startDate">Start Date</label>
                            <input
                                required
                                className="event-form-input"
                                type="date"
                                id="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="event-form-group half">
                            <label className="event-form-label" htmlFor="startTime">Start Time</label>
                            <input
                                required
                                className="event-form-input"
                                type="time"
                                id="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="event-form-row">
                        <div className="event-form-group half">
                            <label className="event-form-label" htmlFor="endDate">End Date</label>
                            <input
                                required
                                className="event-form-input"
                                type="date"
                                id="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="event-form-group half">
                            <label className="event-form-label" htmlFor="endTime">End Time</label>
                            <input
                                required
                                className="event-form-input"
                                type="time"
                                id="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                            />
                        </div>
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
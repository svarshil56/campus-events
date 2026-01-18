import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, setDoc } from 'firebase/firestore';
import { database } from '../services/firebase';
import Navbar from '../components/Navbar';
import './Eventform.css';

const Eventform = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        tag: 'Concerts', // Default tag
        description: '',
        date: '',
        time: '',
        location: '',
        contact1Name: '',
        contact1Phone: '',
        contact2Name: '',
        contact2Phone: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            // Create a safe ID from the event name
            const docId = formData.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            await setDoc(doc(database, 'events', docId), {
                title: formData.name, 
                tag: formData.tag,
                description: formData.description, 
                date: `${formData.date} • ${formData.time}`, 
                location: formData.location,
                venue: formData.location, 
                contact1: `${formData.contact1Name} (${formData.contact1Phone})`,
                contact2: `${formData.contact2Name} (${formData.contact2Phone})`,
                createdAt: new Date(),
                currentRegNo: 0
            });
            setStatus({ type: 'success', message: 'Event added successfully!' });

            // Redirect to home after a brief delay to show success message
            setTimeout(() => {
                navigate('/home');
            }, 1000);

            setFormData({
                name: '',
                tag: 'Concerts',
                description: '',
                date: '',
                time: '',
                location: '',
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

                    <div className="event-form-group">
                        <label className="event-form-label">Coordinator 1</label>
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
                        <label className="event-form-label">Coordinator 2</label>
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

export default Eventform;
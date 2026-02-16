import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { database, auth } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './OrganizerRequest.css';

const OrganizerRequest = () => {
    const [formData, setFormData] = useState({
        clubName: '',
        category: 'Cultural',
        requestedEventCount: 1,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const [isOrganizer, setIsOrganizer] = useState(false);

    // Ensure user is authenticated
    useEffect(() => {
        if (!auth.currentUser) {
            navigate('/login');
        } else {
            // Check if already organizer
            import('firebase/firestore').then(mod => {
                mod.getDoc(mod.doc(database, "users", auth.currentUser.uid)).then(snap => {
                    if (snap.exists() && snap.data().role === 'organizer') {
                        setIsOrganizer(true);
                    }
                });
            });
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        if (!formData.clubName) {
            setError('Please fill in all required fields.');
            setSubmitting(false);
            return;
        }

        try {
            const user = auth.currentUser;
            await addDoc(collection(database, "organizerRequests"), {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName || 'Unknown',

                proposedEventName: formData.clubName, // Keeping field name for backend compatibility
                category: formData.category,
                requestedEventCount: parseInt(formData.requestedEventCount),

                // Defaults for removed fields to keep DB consistent
                eventDescription: 'No description provided (Simplified Request)',
                phoneNumber: 'Not provided',

                status: 'pending',
                createdAt: serverTimestamp(),
            });

            setSuccess('Proposal submitted! If approved, you will gain organizer access.');
            setTimeout(() => navigate('/home'), 3000);
        } catch (err) {
            console.error("Error submitting request:", err);
            setError('Failed to submit request. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="request-page-container">
            <Navbar />
            <div className="landing-bg-overlay"></div>

            <div className="request-card">
                <h2 className="request-heading">{isOrganizer ? 'Get More Credits' : 'Pitch Your Event'}</h2>
                {error && <p className="error-msg">{error}</p>}
                {success && <p className="success-msg">{success}</p>}

                <form className="request-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Club/Committee Name</label>
                        <input
                            type="text"
                            name="clubName"
                            value={formData.clubName}
                            onChange={handleChange}
                            placeholder="e.g. CMC"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Category</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="form-select">
                            <option value="Cultural">Cultural</option>
                            <option value="Technical">Technical</option>
                            <option value="Sports">Sports</option>
                            <option value="Workshops">Workshops</option>
                            <option value="Concerts">Concerts</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Credits Requested (Events to Create)</label>
                        <input
                            type="number"
                            name="requestedEventCount"
                            value={formData.requestedEventCount}
                            onChange={handleChange}
                            min="1"
                            max="5"
                            className="form-input"
                            required
                        />
                        <small style={{ color: '#ccc', display: 'block', marginTop: '5px' }}>Max 5 events per request</small>
                    </div>

                    <button type="submit" className="submit-btn" disabled={submitting}>
                        {submitting ? 'Submitting Proposal...' : 'Submit Proposal'}
                    </button>
                </form>
            </div>
        </div >
    );
};

export default OrganizerRequest;

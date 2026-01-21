import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { database } from '../../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc, writeBatch, increment, getDoc } from 'firebase/firestore';
import './AdminRequests.css';

const AdminRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const q = query(collection(database, "organizerRequests"), where("status", "==", "pending"));
            const querySnapshot = await getDocs(q);
            const reqs = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setRequests(reqs);
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError("Failed to load requests.");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (req) => { // req is the request object
        if (!window.confirm(`Approve ${req.userName} as Organizer?`)) return;

        try {
            const batch = writeBatch(database);

            // 1. Check if user is already an organizer
            const userRef = doc(database, "users", req.userId);
            const userSnap = await getDocs(query(collection(database, "users"), where("uid", "==", req.userId)));
            // Note: req.userId is the doc ID in "users" collection, so better to fetch directly
            // BUT wait, in OrganizerRequest we saved userId as user.uid. 
            // So userRef IS correct. Let's just read it transactionally or just read it first.
            // Since we are using batch, we can't read inside batch.

            // Actually, we can just read the doc first.
            // However, to be cleaner, let's just assume we can read it.
            // Wait, we need to know the current role.
            // Let's use getDoc for that.

            // FIXME: In previous code `req.userId` was used as doc id.
        } catch (err) {
            // ...
        }

        // RE-WRITING THE LOGIC CLEARLY:
        try {
            const batch = writeBatch(database);
            const userRef = doc(database, "users", req.userId);
            const userSnap = await import('firebase/firestore').then(mod => mod.getDoc(userRef));

            if (userSnap.exists() && userSnap.data().role === 'organizer') {
                // Existing Organizer: Increment Limit
                batch.update(userRef, {
                    eventLimit: increment(req.requestedEventCount || 2)
                });
                alert(`Added ${req.requestedEventCount || 2} credits to ${req.userName}.`);
            } else {
                // New Organizer OR Student: Promote and Set Limit
                batch.update(userRef, {
                    role: 'organizer',
                    eventLimit: req.requestedEventCount || 2, // Fallback to 2
                    eventsCreated: 0
                });
                alert(`Promoted ${req.userName} to Organizer.`);
            }

            // 2. Update Request Document
            const requestRef = doc(database, "organizerRequests", req.id);
            batch.update(requestRef, {
                status: 'approved',
                approvedAt: new Date()
            });

            await batch.commit();

            // Refresh list
            setRequests(requests.filter(r => r.id !== req.id));

        } catch (err) {
            console.error("Error approving request:", err);
            alert("Failed to approve request. Check console for details.");
        }
    };

    const handleReject = async (reqId) => {
        if (!window.confirm("Reject this request?")) return;

        try {
            const requestRef = doc(database, "organizerRequests", reqId);
            await updateDoc(requestRef, {
                status: 'rejected',
                rejectedAt: new Date()
            });

            // Refresh list
            setRequests(requests.filter(r => r.id !== reqId));

        } catch (err) {
            console.error("Error rejecting request:", err);
            alert("Failed to reject request.");
        }
    };

    return (
        <div className="admin-requests-container">
            <Navbar />
            <div className="admin-content-wrapper">
                <h1 className="admin-heading">Pending Organizer Requests</h1>

                {loading && <p>Loading requests...</p>}
                {error && <p className="error-text">{error}</p>}

                {!loading && requests.length === 0 && (
                    <div className="no-requests">
                        <p>No pending requests at the moment.</p>
                        <p className="sub-text">Peace in the realm.</p>
                    </div>
                )}

                <div className="requests-grid">
                    {requests.map(req => (
                        <div key={req.id} className="request-card-admin">
                            <div className="req-header">
                                <h3>{req.userName}</h3>
                                <span className="req-date">
                                    {req.createdAt?.seconds ? new Date(req.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                                </span>
                            </div>

                            <div className="req-details">
                                <p><strong>Email:</strong> {req.userEmail}</p>
                                <p><strong>Phone:</strong> {req.phoneNumber}</p>
                                <p><strong>Category:</strong> {req.category}</p>
                                <p><strong>Proposal:</strong> {req.proposedEventName}</p>
                                <p><strong>Credits Requested:</strong> {req.requestedEventCount}</p>
                                <p className="justification">"{req.eventDescription}"</p>
                            </div>

                            <div className="req-actions">
                                <button className="btn-approve" onClick={() => handleApprove(req)}>Approve</button>
                                <button className="btn-reject" onClick={() => handleReject(req.id)}>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminRequests;

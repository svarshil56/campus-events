import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { database, auth } from '../../services/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { exportToExcel } from '../../utils/excelExport';
import './OrganizerMyEvents.css'; // Reusing styles

const EventRegistrations = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [registrations, setRegistrations] = useState([]);
    const [eventTitle, setEventTitle] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Verify ownership (optional but good security practice locally)
                const eventSnap = await getDoc(doc(database, "events", eventId));
                if (!eventSnap.exists()) {
                    alert("Event not found");
                    navigate('/organizer/my-events');
                    return;
                }
                const eventData = eventSnap.data();
                if (eventData.organizerId !== auth.currentUser?.uid) {
                    // Start of rudimentary check, actual security is in Firestore Rules
                    alert("You do not have permission to view this event's registrations.");
                    navigate('/organizer/my-events');
                    return;
                }
                setEventTitle(eventData.title);

                // 2. Fetch Registrations
                const regSnap = await getDocs(collection(database, "events", eventId, "registrations"));
                const regList = regSnap.docs.map(d => ({
                    id: d.id, // Firestore doc id
                    ...d.data()
                }));
                setRegistrations(regList);

            } catch (error) {
                console.error("Error fetching registrations:", error);
                if (error.code === 'permission-denied') {
                    console.error("PERMISSION DENIED: Check if Organizer ID matches or if Rules allow access.");
                    console.log("Current User:", auth.currentUser?.uid);
                    console.log("Event ID:", eventId);
                }
            } finally {
                setLoading(false);
            }
        };

        if (auth.currentUser) {
            fetchData();
        } else {
            // Wait for auth or redirect? usually handled by ProtectedRoute
        }
    }, [eventId, navigate]);

    const handleExport = () => {
        const data = registrations.map(reg => ({
            "Registration ID": reg.regId || reg.id,
            "Name": reg.name,
            "Email": reg.email
        }));
        exportToExcel(data, `${eventTitle}_Participants`);
    };

    return (
        <div className="organizer-events-container">
            <Navbar />
            <div className="content-wrapper">
                <button
                    onClick={() => navigate('/organizer/my-events')}
                    className="back-btn"
                >
                    &larr; Back to My Events
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="page-title" style={{ border: 'none', margin: 0 }}>
                        {eventTitle}: Participants
                    </h1>
                    <button onClick={handleExport} className="create-btn" style={{ margin: 0, backgroundColor: '#006400', color: 'white' }}>
                        Export directly to Excel
                    </button>
                </div>

                {loading ? (
                    <p>Loading registrations...</p>
                ) : registrations.length === 0 ? (
                    <p>No registrations found for this event yet.</p>
                ) : (
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>Reg ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                </tr>
                            </thead>
                            <tbody>
                                {registrations.map(reg => (
                                    <tr key={reg.id}>
                                        <td style={{ fontFamily: 'monospace' }}>{reg.regId ? '#' + reg.regId.split('_').pop() : reg.id}</td>
                                        <td>{reg.name}</td>
                                        <td>{reg.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventRegistrations;

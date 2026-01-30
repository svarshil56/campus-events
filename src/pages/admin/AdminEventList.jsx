import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { database } from '../../services/firebase';
import { collection, getDocs, doc, writeBatch, query, where } from 'firebase/firestore';
import './AdminUserManagement.css'; // Reusing existing styles for consistency

const AdminEventList = () => {
    const [groupedEvents, setGroupedEvents] = useState({});
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Users to map IDs to Names
            const usersSnap = await getDocs(collection(database, "users"));
            const userMap = {};
            usersSnap.docs.forEach(doc => {
                userMap[doc.id] = doc.data();
            });
            setUsers(userMap);

            // 2. Fetch All Events
            const eventsSnap = await getDocs(collection(database, "events"));

            // 3. Group by Organizer
            const groups = {};
            eventsSnap.docs.forEach(doc => {
                const event = { id: doc.id, ...doc.data() };
                const orgId = event.organizerId || 'unknown'; // Handle orphans

                if (!groups[orgId]) {
                    groups[orgId] = [];
                }
                groups[orgId].push(event);
            });

            setGroupedEvents(groups);
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to load events.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEvent = async (eventId, eventName) => {
        if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE "${eventName}"? This removes the event and ALL its registrations.`)) {
            return;
        }

        try {
            const batch = writeBatch(database);

            // 1. Delete Event Document
            // Note: We use the logic from our recent fix: just in case it's a ghost, 
            // handle the doc ref directly.
            batch.delete(doc(database, "events", eventId));

            // 2. Delete Registrations (Subcollection)
            const regSnap = await getDocs(collection(database, "events", eventId, "registrations"));
            regSnap.forEach(reg => {
                batch.delete(reg.ref);
            });

            await batch.commit();

            alert(`Deleted "${eventName}" and ${regSnap.size} registrations.`);

            // Refresh Data to update UI
            fetchAllData();

        } catch (error) {
            console.error("Delete failed:", error);
            alert("Delete failed: " + error.message);
        }
    };

    return (
        <div className="admin-users-container">
            <Navbar />
            <div className="admin-content-wrapper">
                <h1 className="admin-heading">Master Event List</h1>
                <p style={{ color: '#aaa', marginBottom: '20px' }}>
                    View and manage all events grouped by their organizer.
                </p>

                {loading ? (
                    <div className="loading-text">Loading Events...</div>
                ) : (
                    <div className="users-table-container">
                        {Object.keys(groupedEvents).length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center' }}>No events found.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {Object.keys(groupedEvents).map(orgId => {
                                    const organizerName = users[orgId]?.name || `Unknown (ID: ${orgId})`;
                                    const organizerEmail = users[orgId]?.email || 'N/A';
                                    const isOrphan = !users[orgId];

                                    return (
                                        <div key={orgId} style={{
                                            backgroundColor: '#1a1a1a',
                                            borderRadius: '8px',
                                            padding: '15px',
                                            border: isOrphan ? '1px solid #ff3333' : '1px solid #333'
                                        }}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                borderBottom: '1px solid #333',
                                                paddingBottom: '10px',
                                                marginBottom: '10px'
                                            }}>
                                                <div>
                                                    <h3 style={{ margin: 0, color: '#fff' }}>
                                                        {organizerName} {isOrphan && <span style={{ color: 'red', fontSize: '0.8em' }}>(ORPHANED)</span>}
                                                    </h3>
                                                    <small style={{ color: '#888' }}>{organizerEmail}</small>
                                                </div>
                                                <div style={{
                                                    backgroundColor: '#333',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.8em'
                                                }}>
                                                    {groupedEvents[orgId].length} Events
                                                </div>
                                            </div>

                                            <table className="users-table" style={{ marginTop: '0' }}>
                                                <thead>
                                                    <tr>
                                                        <th>Event Title</th>
                                                        <th>Date</th>
                                                        <th>ID</th>
                                                        <th>Registrations</th>
                                                        <th>Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {groupedEvents[orgId].map(event => (
                                                        <tr key={event.id}>
                                                            <td>{event.title}</td>
                                                            <td>{event.date}</td>
                                                            <td style={{ fontFamily: 'monospace', color: '#888' }}>{event.id}</td>
                                                            <td>{event.currentRegNo || 0}</td>
                                                            <td>
                                                                <button
                                                                    className="delete-btn"
                                                                    style={{ padding: '5px 10px', fontSize: '0.8em' }}
                                                                    onClick={() => handleDeleteEvent(event.id, event.title)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminEventList;

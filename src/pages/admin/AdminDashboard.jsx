import React, { useEffect, useState } from 'react';
import { database } from '../../services/firebase';
import { collection, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        users: 0,
        events: 0,
        totalRegistrations: 0,
        pendingRequests: 0
    });
    const [graphData, setGraphData] = useState([]);
    const [eventPopularity, setEventPopularity] = useState([]);
    const [lastEvents, setLastEvents] = useState([]); // Store actual event objects for list
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Total Users
                const usersSnap = await getDocs(collection(database, "users"));
                const totalUsers = usersSnap.size;

                // 2. Events & Registrations
                const eventsSnap = await getDocs(collection(database, "events"));
                const totalEvents = eventsSnap.size;

                let totalReg = 0;
                const popularityData = [];
                const allEvents = [];

                eventsSnap.docs.forEach(doc => {
                    const data = doc.data();
                    const regCount = data.currentRegNo || 0;
                    totalReg += regCount;
                    popularityData.push({
                        name: data.title,
                        registrations: regCount
                    });
                    allEvents.push({ id: doc.id, ...data });
                });

                setLastEvents(allEvents);

                // Sort for Top 5 Events
                popularityData.sort((a, b) => b.registrations - a.registrations);
                setEventPopularity(popularityData.slice(0, 5));

                // 3. Pending Requests Listener
                const unsubscribeRequests = onSnapshot(
                    query(collection(database, "organizerRequests"), where("status", "==", "pending")),
                    (snap) => {
                        setStats(prev => ({
                            ...prev,
                            pendingRequests: snap.size
                        }));
                    }
                );

                setStats(prev => ({
                    ...prev,
                    users: totalUsers,
                    events: totalEvents,
                    totalRegistrations: totalReg
                }));

                // 4. Mock Activity Data
                const activityMock = [
                    { name: 'Mon', active: 10 },
                    { name: 'Tue', active: 25 },
                    { name: 'Wed', active: 18 },
                    { name: 'Thu', active: 30 },
                    { name: 'Fri', active: 45 },
                    { name: 'Sat', active: 60 },
                    { name: 'Sun', active: 55 },
                ];
                setGraphData(activityMock);

                setLoading(false);
                return () => unsubscribeRequests();

            } catch (error) {
                console.error("Error loading dashboard:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleExportRegistrations = async (eventId, eventTitle) => {
        try {
            const regsSnap = await getDocs(collection(database, "events", eventId, "registrations"));
            if (regsSnap.empty) {
                alert("No registrations found for this event.");
                return;
            }

            const data = regsSnap.docs.map(doc => {
                const d = doc.data();
                return {
                    "Registration ID": d.regId || doc.id,
                    "Name": d.name || "N/A",
                    "Email": d.email || "N/A"
                };
            });

            exportToExcel(data, `${eventTitle}_Registrations`);
        } catch (error) {
            console.error("Error exporting:", error);
            alert("Failed to export registrations.");
        }
    };

    // Custom Tooltip for Charts
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: '#1a1a1a',
                    border: '1px solid #333',
                    padding: '10px',
                    color: '#fff',
                    borderRadius: '8px'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
                    <p style={{ margin: 0, color: '#FFD700' }}>
                        {payload[0].value} {payload[0].name === 'active' ? 'Users' : 'Regs'}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="admin-dashboard-container">
            <Navbar />

            <div className="dashboard-content-wrapper">
                <header className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Overview</h1>
                        <p style={{ color: '#666', marginTop: '5px' }}>Welcome back, Admin.</p>
                    </div>
                    <div className="dashboard-badge">Live Updates</div>
                </header>


                {loading ? (
                    // Visual covered by global transition
                    <div style={{ minHeight: '50vh' }}></div>
                ) : (
                    <>
                        {/* Key Metrics Cards */}
                        <div className="stats-grid">
                            <div
                                className="stat-card"
                                style={{
                                    borderColor: stats.pendingRequests > 0 ? '#FF0000' : '',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate('/admin/users')}
                            >
                                <div className="stat-label" style={{ color: stats.pendingRequests > 0 ? '#FF3333' : '' }}>
                                    Total Users
                                </div>
                                <div className="stat-value">{stats.users}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-label">Total Events</div>
                                <div className="stat-value">{stats.events}</div>
                            </div>
                            <div
                                className="stat-card"
                                style={{
                                    borderColor: stats.pendingRequests > 0 ? '#FF0000' : '',
                                    cursor: 'pointer'
                                }}
                                onClick={() => navigate('/admin/requests')}
                            >
                                <div className="stat-label" style={{ color: stats.pendingRequests > 0 ? '#FF3333' : '' }}>
                                    Pending Requests
                                </div>
                                <div className="stat-value" style={{ color: stats.pendingRequests > 0 ? '#FF3333' : '' }}>
                                    {stats.pendingRequests}
                                </div>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="charts-grid">
                            {/* Main Activity Chart */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <div className="chart-title">Weekly User Activity</div>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={graphData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis dataKey="name" stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                                        <YAxis stroke="#666" tick={{ fill: '#888' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#FF0000', strokeWidth: 1 }} />
                                        <Line
                                            type="monotone"
                                            dataKey="active"
                                            stroke="#FF0000"
                                            strokeWidth={3}
                                            dot={{ fill: '#FF0000', r: 4 }}
                                            activeDot={{ r: 8, fill: '#FFD700' }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Top Events Chart */}
                            <div className="chart-card">
                                <div className="chart-header">
                                    <div className="chart-title">Top Events</div>
                                </div>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={eventPopularity} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={100}
                                            tick={{ fill: '#ccc', fontSize: 12 }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
                                        <Bar dataKey="registrations" barSize={20} radius={[0, 4, 4, 0]}>
                                            {eventPopularity.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#FFD700' : '#FF0000'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* All Events List for Admin */}
                        <div className="chart-card" style={{ marginTop: '20px' }}>
                            <div className="chart-header">
                                <div className="chart-title">All Events Management</div>
                            </div>
                            <div className="table-wrapper">
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Event Name</th>
                                            <th>Date</th>
                                            <th>Registrations</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lastEvents.map(event => (
                                            <tr key={event.id}>
                                                <td>{event.title}</td>
                                                <td>{event.date}</td>
                                                <td style={{ textAlign: 'center' }}>{event.currentRegNo || 0}</td>
                                                <td>
                                                    <button
                                                        className="action-btn-small export-btn"
                                                        onClick={() => handleExportRegistrations(event.id, event.title)}
                                                    >
                                                        Details (Excel)
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

import React, { useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { database } from '../../services/firebase';
import { collection, getDocs, query, where, onSnapshot, collectionGroup, Timestamp } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { exportToExcel } from '../../utils/excelExport';
import './AdminDashboard.css';

const CustomScrollbar = ({ containerRef, contentRef, isLoading }) => {
    const [scrollProgress, setScrollProgress] = useState(5); // Default start at 5%
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const container = containerRef.current;
        const content = contentRef?.current;
        if (!container) return;

        const updateScrollProgress = () => {
            const { clientHeight, scrollHeight, scrollTop } = container;

            // Only show if content overflows and NOT loading
            if (!isLoading && scrollHeight > clientHeight) {
                setIsVisible(true);

                // Calculate scroll percentage (0 to 100)
                const maxScroll = scrollHeight - clientHeight;
                const progress = (scrollTop / maxScroll) * 100;

                // Clamp between 5 (min visibility) and 100
                setScrollProgress(Math.min(100, Math.max(5, progress)));
            } else {
                setIsVisible(false);
            }
        };

        const handleScroll = () => {
            requestAnimationFrame(updateScrollProgress);
        };

        // Listeners
        container.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', updateScrollProgress);

        // Initial calc & update when loading finishes
        if (!isLoading) {
            // Small delay to allow layout to settle after loading
            setTimeout(updateScrollProgress, 300);
            // Also run immediately just in case
            updateScrollProgress();
        }

        // ResizeObserver
        const resizeObserver = new ResizeObserver(() => {
            if (!isLoading) updateScrollProgress();
        });

        if (content) {
            resizeObserver.observe(content);
        }
        resizeObserver.observe(container);

        return () => {
            container.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateScrollProgress);
            resizeObserver.disconnect();
        };
    }, [containerRef, contentRef, isLoading]);

    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <div className="scroll-progress-container visible">
            <div
                className="scroll-progress-fill"
                style={{ height: `${scrollProgress}%` }}
            />
        </div>,
        document.body
    );
};

const AdminDashboard = () => {
    const containerRef = useRef(null);
    const contentRef = useRef(null);
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
                
                // For Activity Chart (Unique Users per day)
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const activitySets = {};
                const lastSevenDaysNames = [];
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
                sevenDaysAgo.setHours(0, 0, 0, 0);

                // Initialize last 7 days with empty Sets
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dayName = days[d.getDay()];
                    lastSevenDaysNames.push(dayName);
                    activitySets[dayName] = new Set();
                }

                // 1. Process User Signups and Last Logins (from usersSnap)
                usersSnap.forEach(userDoc => {
                    const userData = userDoc.data();
                    const createdAt = userData.createdAt?.toDate ? userData.createdAt.toDate() : (userData.createdAt ? new Date(userData.createdAt) : null);
                    const lastLogin = userData.lastLogin?.toDate ? userData.lastLogin.toDate() : (userData.lastLogin ? new Date(userData.lastLogin) : null);

                    if (createdAt && createdAt >= sevenDaysAgo) {
                        const dayName = days[createdAt.getDay()];
                        if (activitySets[dayName]) activitySets[dayName].add(userDoc.id);
                    }
                    if (lastLogin && lastLogin >= sevenDaysAgo) {
                        const dayName = days[lastLogin.getDay()];
                        if (activitySets[dayName]) activitySets[dayName].add(userDoc.id);
                    }
                });

                // 2. Fetch Dedicated Daily Activity Records
                try {
                    const activitySnap = await getDocs(query(
                        collection(database, "daily_activity"),
                        where('timestamp', '>=', Timestamp.fromDate(sevenDaysAgo))
                    ));
                    activitySnap.forEach(doc => {
                        const data = doc.data();
                        if (data.timestamp) {
                            const date = data.timestamp.toDate ? data.timestamp.toDate() : new Date(data.timestamp);
                            const dayName = days[date.getDay()];
                            if (activitySets[dayName]) activitySets[dayName].add(data.uid);
                        }
                    });
                } catch (e) {
                    console.warn("Could not fetch daily_activity logs:", e);
                }

                // 3. Fetch registrations per event
                for (const eventDoc of eventsSnap.docs) {
                    const data = eventDoc.data();
                    const regCount = Number(data.currentRegNo) || 0;
                    totalReg += regCount;
                    
                    popularityData.push({
                        name: data.title,
                        registrations: regCount
                    });
                    allEvents.push({ id: eventDoc.id, ...data });

                    try {
                        const regsSnap = await getDocs(collection(database, "events", eventDoc.id, "registrations"));
                        regsSnap.forEach(regDoc => {
                            const regData = regDoc.data();
                            if (regData.createdAt) {
                                const date = regData.createdAt.toDate ? regData.createdAt.toDate() : new Date(regData.createdAt);
                                if (date >= sevenDaysAgo) {
                                    const dayName = days[date.getDay()];
                                    if (activitySets[dayName]) activitySets[dayName].add(regData.uid);
                                }
                            }
                        });
                    } catch (e) {
                        console.warn(`Error fetching regs for event ${eventDoc.id}:`, e);
                    }
                }

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

                // 4. Update Activity Graph with unique counts
                const realGraphData = lastSevenDaysNames.map(name => ({
                    name,
                    active: activitySets[name].size
                }));
                setGraphData(realGraphData);

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
        <div className="admin-dashboard-container" ref={containerRef}>
            <CustomScrollbar containerRef={containerRef} contentRef={contentRef} isLoading={loading} />
            <Navbar />

            <div className="dashboard-content-wrapper" ref={contentRef}>
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
                            <div
                                className="stat-card"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('/admin/events')}
                            >
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
                                    <div className="chart-title">Active Users (Last 7 days)</div>
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

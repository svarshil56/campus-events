import React from 'react';
import QRCode from "react-qr-code";

const StatsCard = ({ event, user, userRole, regId, processing, onRegister }) => {
    const isStaff = userRole === 'organizer' || userRole === 'admin';

    return (
        <>
            <div className="event-stats-card" style={isStaff ? { padding: '1.5rem', gap: '1rem' } : {}}>
                <div>
                    <div className="stat-item">
                        <div className="stat-label" style={{ fontSize: '0.9rem' }}>Venue</div>
                        <div className="stat-value" style={{ fontSize: '1.2rem' }}>{event.venue}</div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label" style={{ fontSize: '0.9rem' }}>Date & Time</div>
                        <div className="stat-value" style={{ fontSize: '1.1rem' }}>
                            {event.startAt?.toDate
                                ? event.startAt.toDate().toLocaleString()
                                : event.startAt
                                    ? new Date(event.startAt).toLocaleString()
                                    : event.date}
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label" style={{ fontSize: '0.9rem' }}>Participants</div>
                        <div className="stat-value" style={{ fontSize: '1.2rem' }}>{event.currentRegNo} / 100</div>
                    </div>
                </div>

                {/* Registration Button Logic - HIDE for Staff */}
                {!isStaff && (
                    <>
                        {!user && (
                            <button className="buy-ticket-btn" disabled>
                                Login to Register
                            </button>
                        )}

                        {user && !regId && (
                            <button className="buy-ticket-btn" onClick={onRegister} disabled={processing}>
                                {processing ? 'Registering...' : 'Register Now'}
                            </button>
                        )}

                        {user && regId && (
                            <button
                                className="buy-ticket-btn"
                                style={{ background: "#10b981", cursor: "default" }}
                            >
                                Registered ({regId})
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* QR Section / Organizer Info */}
            <div className="event-qr-container">
                {isStaff ? (
                    <div className="organizer-info-box" style={{
                        textAlign: 'left',
                        color: '#ccc',
                        width: '100%',
                        height: '100%',
                        padding: '1.5rem',
                        boxSizing: 'border-box',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        gap: '1rem'
                    }}>
                        <h3 style={{ margin: 0, color: '#FFD700', fontSize: '1.2rem', textTransform: 'uppercase' }}>Event Management</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>
                                <strong style={{ color: '#fff' }}>Managed By: </strong> {event.organizerName || 'Unknown Committee'}
                            </p>
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>
                                <strong style={{ color: '#fff' }}>Category: </strong> {event.tag}
                            </p>
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>
                                <strong style={{ color: '#fff' }}>Convener: </strong> {event.convener || 'N/A'}
                            </p>
                            <p style={{ fontSize: '1.1rem', margin: 0 }}>
                                <strong style={{ color: '#fff' }}>Deputy Convener: </strong> {event.deputy || 'N/A'}
                            </p>
                        </div>
                    </div>
                ) : (
                    regId ? (
                        <QRCode value={regId} size={150} />
                    ) : (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '150px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '8px',
                            color: '#ccc',
                            backdropFilter: 'blur(4px)'
                        }}>
                            <span style={{ fontSize: '0.9rem', textTransform: 'uppercase' }}>Register to Reveal QR</span>
                        </div>
                    )
                )}
            </div>
        </>
    );
};

export default StatsCard;

import React from 'react';
import QRCode from "react-qr-code";

const StatsCard = ({ event, user, regId, onRegister }) => {
    return (
        <>
            <div className="event-stats-card">
                <div>
                    <div className="stat-item">
                        <div className="stat-label">Venue</div>
                        <div className="stat-value">{event.venue}</div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label">Date & Time</div>
                        <div className="stat-value">
                            {event.startAt?.toDate
                                ? event.startAt.toDate().toLocaleString()
                                : event.startAt
                                    ? new Date(event.startAt).toLocaleString()
                                    : event.date}
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-label">Participants</div>
                        <div className="stat-value">{event.currentRegNo} / 10000</div>
                    </div>
                </div>

                {/* Registration Button Logic */}
                {!user && (
                    <button className="buy-ticket-btn" disabled>
                        Login to Register
                    </button>
                )}

                {user && !regId && (
                    <button className="buy-ticket-btn" onClick={onRegister}>
                        Register Now
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
            </div>

            {/* QR Section */}
            <div className="event-qr-container">
                {regId ? (
                    <QRCode value={regId} size={150} />
                ) : (
                    <div className="qr-blur">
                        <span>Register to Reveal QR</span>
                    </div>
                )}
            </div>
        </>
    );
};

export default StatsCard;

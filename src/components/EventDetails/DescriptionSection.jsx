import React from 'react';

const DescriptionSection = ({ description, contact1, contact2 }) => {
    return (
        <div className="event-description-container" style={{ display: 'flex', gap: '2rem' }}>
            <div style={{ flex: 1 }}>
                <h3>About the Event:</h3>
                <p>{description}</p>
            </div>

            <div style={{ flex: 1, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2rem' }}>
                <h3>For any Query contact us:</h3>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {contact1 && (
                        <div className="contact-item">
                            <span style={{ fontSize: '1.1rem' }}>{contact1}</span>
                        </div>
                    )}
                    {contact2 && (
                        <div className="contact-item">
                            <span style={{ fontSize: '1.1rem' }}>{contact2}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DescriptionSection;

import React from 'react';

const DescriptionSection = ({ description }) => {
    return (
        <div className="event-description-container">
            <h3>About the Event</h3>
            <p>{description}</p>
        </div>
    );
};

export default DescriptionSection;

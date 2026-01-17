import React from 'react';
import placeholderHero from "../../assets/events-title.png";

const HeroSection = ({ title, image }) => {
    return (
        <div className="event-image-container">
            <img
                src={image || placeholderHero}
                alt={title}
                className="event-image"
            />
        </div>
    );
};

export default HeroSection;

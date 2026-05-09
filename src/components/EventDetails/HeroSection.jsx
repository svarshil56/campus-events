import React, { useMemo } from 'react';
import { getRandomCover } from '../../utils/eventCovers';

const HeroSection = ({ title, image }) => {
    // Memoize the fallback so it doesn't change on every render
    const fallbackImage = useMemo(() => getRandomCover(), []);

    return (
        <div className="event-image-container">
            <img
                src={image || fallbackImage}
                alt={title}
                className="event-image"
                style={{ 
                    transform: 'scale(0.9)', // Subtle 'size' adjustment for a unique framed look
                    borderRadius: '8px',
                    transition: 'transform 0.5s ease'
                }}
            />
        </div>
    );
};

export default HeroSection;

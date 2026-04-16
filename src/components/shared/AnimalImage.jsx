import React, { useState, useEffect } from 'react';
import { Cat } from 'lucide-react';

const AnimalImage = ({ src, alt = "Animal", className = "w-full h-full object-cover", iconSize = 24 }) => {
    const [imageError, setImageError] = useState(false);
    const [imageSrc, setImageSrc] = useState(src);

    useEffect(() => {
        setImageSrc(src);
        setImageError(false);
    }, [src]);

    const handleError = () => {
        console.warn('Image failed to load:', imageSrc);
        setImageError(true);
    };

    if (!imageSrc || imageError) {
        return <Cat size={iconSize} className="text-gray-400" />;
    }

    return (
        <img 
            src={imageSrc} 
            alt={alt} 
            className={className}
            onError={handleError}
            loading="lazy"
        />
    );
};

export default AnimalImage;

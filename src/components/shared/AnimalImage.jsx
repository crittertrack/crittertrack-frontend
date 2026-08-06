import React from 'react';
import { Cat } from 'lucide-react';

const AnimalImage = ({ src, alt = 'Animal', className = 'w-full h-full object-cover', iconSize = 24 }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageSrc, setImageSrc] = React.useState(src);

    React.useEffect(() => { setImageSrc(src); setImageError(false); }, [src]);

    if (imageError || !imageSrc) {
        return (
            <div className="w-full h-full bg-gray-100 dark:bg-dark-surface-hover rounded-md flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                <Cat size={iconSize} />
            </div>
        );
    }
    return <img src={imageSrc} alt={alt} className={className} onError={() => setImageError(true)} />;
};

export default AnimalImage;
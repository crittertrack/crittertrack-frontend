import React from 'react';
import { getOrderedLitterImages } from '../../../utils/litterGallery';

const GalleryTab = ({ images = [] }) => {
    if (!images.length) return <div className="py-8 text-center text-sm text-gray-500 dark:text-dark-text-muted">No photos have been added to this litter.</div>;
    const orderedImages = getOrderedLitterImages(images);
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {orderedImages.map(({ image, index, isCover }) => {
                const { url, caption, captureDate, offspringId_public: offspringId } = image;
                return (
                    <figure key={image?.r2Key || url || index} className="overflow-hidden rounded-lg border border-gray-200 dark:border-dark-border">
                        <a href={url} target="_blank" rel="noreferrer">
                            <img src={url} alt={caption || `Litter gallery ${index + 1}`} className="w-full aspect-square object-cover" />
                        </a>
                        {(isCover || caption || captureDate || offspringId) && (
                            <figcaption className="space-y-1 p-2 text-sm text-gray-700 dark:text-dark-text">
                                {isCover && <div className="text-xs font-semibold text-primary dark:text-dark-primary">Cover image</div>}
                                {caption && <div>{caption}</div>}
                                {captureDate && <div className="text-xs text-gray-500 dark:text-dark-text-muted">Captured {captureDate}</div>}
                                {offspringId && <div className="text-xs text-gray-500 dark:text-dark-text-muted">Offspring: {offspringId}</div>}
                            </figcaption>
                        )}
                    </figure>
                );
            })}
        </div>
    );
};

export default GalleryTab;

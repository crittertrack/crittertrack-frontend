import React, { useState, useMemo } from 'react';
import { Camera } from 'lucide-react';
// This component is used in AnimalModalV2.jsx
export const GalleryTabContent = ({ animal }) => {
    const allImages = useMemo(() => [animal.imageUrl || animal.photoUrl, ...(animal.extraImages || [])].filter(Boolean), [animal]);
    const [selectedImage, setSelectedImage] = useState(allImages[0] || null);

    if (allImages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg text-gray-400">
                <Camera size={48} className="mb-2" />
                <p className="text-sm">No images available for this animal.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200">
                <img src={selectedImage} alt="Selected" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-wrap gap-2 justify-center p-2 bg-gray-50 rounded-lg border">
                {allImages.map((img, idx) => (
                    <button key={idx} onClick={() => setSelectedImage(img)} className={`w-24 h-24 rounded-md overflow-hidden border-2 transition-all ${selectedImage === img ? 'border-primary scale-105 shadow-md' : 'border-transparent hover:border-gray-300'}`}>
                        <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
};
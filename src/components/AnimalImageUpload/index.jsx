import React from 'react';
import AnimalImage from '../shared/AnimalImage';

const AnimalImageUpload = ({ imageUrl, onFileChange, onDeleteImage, disabled = false, Trash2 }) => (
    <div data-tutorial-target="animal-image-upload" className="flex items-center space-x-4">
        <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border">
            <AnimalImage src={imageUrl} alt="Animal" className="w-full h-full object-cover" iconSize={36} />
        </div>
        <div className="flex-1">
            <div className="flex items-center space-x-2">
                <label className={`inline-flex items-center px-4 py-2 bg-primary text-black rounded-md cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/90'}`}>
                    Change Photo
                    <input type="file" accept="image/*" onChange={onFileChange} disabled={disabled} className="hidden" />
                </label>
                {imageUrl && onDeleteImage && Trash2 && (
                    <button
                        type="button"
                        onClick={onDeleteImage}
                        disabled={disabled}
                        className={`inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-md ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                        title="Delete Image"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>
            <p className="text-sm text-gray-500 mt-2">Images are automatically compressed for upload.</p>
        </div>
    </div>
);

export default AnimalImageUpload;

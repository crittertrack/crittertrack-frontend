import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2, X, Upload, Image as ImageIcon, AlertCircle, CheckCircle, Bug, Lightbulb, MessageSquare, ArrowLeft } from 'lucide-react';
import { compressImageToMaxSize } from '../utils/imageCompression';

const API_BASE_URL = '/api';

const CATEGORY_OPTIONS = [
    { value: 'Bug', label: 'Bug Report', icon: <Bug size={16} />, description: 'Something is not working correctly' },
    { value: 'Feature Request', label: 'Feature Request', icon: <Lightbulb size={16} />, description: 'Suggest an improvement or new feature' },
    { value: 'General Feedback', label: 'General Feedback', icon: <MessageSquare size={16} />, description: 'Share your thoughts or ask a question' },
];

const MAX_IMAGES = 5;

export default function ReportPage({ authToken, userProfile, showModalMessage }) {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [stepsToReproduce, setStepsToReproduce] = useState('');
    const [images, setImages] = useState([]); // Array of { file: File, preview: string, uploading: boolean, url: string | null }
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    // Handle image file selection
    const handleImageSelect = useCallback(async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        // Check total images limit
        if (images.length + files.length > MAX_IMAGES) {
            setError(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more.`);
            return;
        }

        const newImages = [];
        for (const file of files) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setError(`"${file.name}" is not a valid image file.`);
                continue;
            }
            if (file.type === 'image/gif') {
                setError('GIF images are not supported. Please use PNG or JPEG.');
                continue;
            }

            // Create preview
            const preview = URL.createObjectURL(file);
            newImages.push({ file, preview, uploading: false, url: null });
        }

        setImages(prev => [...prev, ...newImages]);
        setError('');

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [images.length]);

    // Remove an image from the list
    const removeImage = useCallback((index) => {
        setImages(prev => {
            const img = prev[index];
            if (img?.preview) URL.revokeObjectURL(img.preview);
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    // Upload a single image to the server
    const uploadImage = async (image) => {
        try {
            // Compress image first
            const compressedBlob = await compressImageToMaxSize(image.file, 500 * 1024, {
                maxWidth: 1600,
                maxHeight: 1600,
                startQuality: 0.85,
                minQuality: 0.4,
                qualityStep: 0.05,
                minDimension: 300,
            });

            const mime = compressedBlob.type || image.file.type;
            const baseName = image.file.name.replace(/\.[^/.]+$/, '');
            const ext = mime === 'image/png' ? '.png' : '.jpg';
            const compressedFile = new File([compressedBlob], `${baseName}_compressed${ext}`, { type: mime });

            // Upload to server
            const formData = new FormData();
            formData.append('file', compressedFile);
            formData.append('type', 'report');

            const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 30000,
            });

            return response.data?.url || null;
        } catch (err) {
            console.error('[ReportPage] Image upload failed:', err);
            return null;
        }
    };

    // Submit the report
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate
        if (!category) {
            setError('Please select a category.');
            return;
        }
        if (!description.trim()) {
            setError('Please provide a description.');
            return;
        }
        if (description.length > 5000) {
            setError('Description is too long (max 5000 characters).');
            return;
        }

        setSubmitting(true);

        try {
            // Upload images first
            const uploadedUrls = [];
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                if (img.url) {
                    uploadedUrls.push(img.url);
                    continue;
                }
                setImages(prev => {
                    const updated = [...prev];
                    updated[i] = { ...updated[i], uploading: true };
                    return updated;
                });

                const url = await uploadImage(img);
                if (url) {
                    uploadedUrls.push(url);
                    setImages(prev => {
                        const updated = [...prev];
                        updated[i] = { ...updated[i], uploading: false, url };
                        return updated;
                    });
                } else {
                    setImages(prev => {
                        const updated = [...prev];
                        updated[i] = { ...updated[i], uploading: false };
                        return updated;
                    });
                }
            }

            // Submit the report
            const payload = {
                category: category,
                description: description.trim(),
                stepsToReproduce: stepsToReproduce.trim() || null,
                images: uploadedUrls,
                page: window.location.pathname,
            };

            const response = await axios.post(`${API_BASE_URL}/bug-reports`, payload, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 201) {
                setSubmitted(true);
                // Cleanup previews
                images.forEach(img => {
                    if (img.preview) URL.revokeObjectURL(img.preview);
                });
            }
        } catch (err) {
            console.error('[ReportPage] Submit failed:', err);
            const message = err.response?.data?.message || err.response?.data?.error || 'Failed to submit report. Please try again.';
            setError(message);
        } finally {
            setSubmitting(false);
        }
    };

    // Reset and go back
    const handleReset = () => {
        setCategory('');
        setDescription('');
        setStepsToReproduce('');
        images.forEach(img => {
            if (img.preview) URL.revokeObjectURL(img.preview);
        });
        setImages([]);
        setSubmitted(false);
        setError('');
    };

    // Already submitted - show success
    if (submitted) {
        return (
            <div className="w-full max-w-2xl mx-auto bg-white dark:bg-dark-surface rounded-xl shadow-lg p-8">
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                        <CheckCircle size={32} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-dark-text mb-2">Thank You!</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                        Your report has been submitted successfully.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
                        Our team will review it and follow up if needed. Your feedback helps make CritterTrack better!
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleReset}
                            className="px-6 py-2.5 bg-primary dark:bg-primary-dark text-black font-semibold rounded-lg hover:bg-primary/80 transition"
                        >
                            Submit Another Report
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white dark:bg-dark-surface rounded-xl shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                <MessageSquare size={20} />
                                Report an Issue
                            </h1>
                            <p className="text-purple-100 text-sm mt-1">
                                Help us improve CritterTrack by reporting bugs, suggesting features, or sharing feedback
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition"
                            title="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-3">
                            What type of report is this? *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {CATEGORY_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setCategory(opt.value)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                                        category === opt.value
                                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-md'
                                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                                    }`}
                                >
                                    <div className={`flex items-center gap-2 mb-1.5 ${
                                        category === opt.value ? 'text-purple-700 dark:text-purple-300' : 'text-gray-600 dark:text-gray-400'
                                    }`}>
                                        {opt.icon}
                                        <span className="font-semibold text-sm">{opt.label}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{opt.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                            Description *
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={category === 'Bug'
                                ? 'Describe the bug in detail. What happened? What did you expect to happen?'
                                : category === 'Feature Request'
                                ? 'Describe the feature you\'d like to see. How would it work? Why would it be useful?'
                                : 'Share your feedback, thoughts, or questions...'
                            }
                            rows={6}
                            maxLength={5000}
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white dark:bg-gray-800 text-gray-800 dark:text-dark-text resize-none"
                            disabled={submitting}
                        />
                        <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/5000</p>
                    </div>

                    {/* Steps to Reproduce (shown for Bug category) */}
                    {category === 'Bug' && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                                Steps to Reproduce
                                <span className="text-gray-400 font-normal ml-1">(optional)</span>
                            </label>
                            <textarea
                                value={stepsToReproduce}
                                onChange={(e) => setStepsToReproduce(e.target.value)}
                                placeholder="1. Go to...&#10;2. Click on...&#10;3. Scroll down to...&#10;4. See error..."
                                rows={4}
                                maxLength={2000}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition bg-white dark:bg-gray-800 text-gray-800 dark:text-dark-text resize-none"
                                disabled={submitting}
                            />
                            <p className="text-xs text-gray-400 mt-1 text-right">{stepsToReproduce.length}/2000</p>
                        </div>
                    )}

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-dark-text mb-2">
                            Attach Images
                            <span className="text-gray-400 font-normal ml-1">(optional, max {MAX_IMAGES})</span>
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Screenshots help us understand the issue better. Images will be compressed and uploaded securely.
                        </p>

                        {/* Image grid */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                                {images.map((img, index) => (
                                    <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={img.preview}
                                            alt={`Screenshot ${index + 1}`}
                                            className="w-full h-24 object-cover"
                                        />
                                        {/* Uploading overlay */}
                                        {img.uploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Loader2 size={20} className="animate-spin text-white" />
                                            </div>
                                        )}
                                        {/* Remove button */}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            disabled={img.uploading || submitting}
                                            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0"
                                        >
                                            <X size={12} />
                                        </button>
                                        {/* Success badge */}
                                        {img.url && (
                                            <div className="absolute bottom-1 right-1 p-0.5 bg-green-500 rounded-full">
                                                <CheckCircle size={10} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Add more button */}
                                {images.length < MAX_IMAGES && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={submitting}
                                        className="h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition group"
                                    >
                                        <div className="text-center">
                                            <ImageIcon size={20} className="mx-auto text-gray-400 group-hover:text-purple-500 mb-1" />
                                            <span className="text-xs text-gray-400 group-hover:text-purple-500">Add Image</span>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Upload button (hidden when grid is full) */}
                        {(images.length === 0 || images.length < MAX_IMAGES) && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition"
                            >
                                <div className="text-center">
                                    <Upload size={24} className="mx-auto text-gray-400 mb-1" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Click to upload screenshots
                                    </p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                        PNG or JPEG, max 5MB each
                                    </p>
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            multiple
                            className="hidden"
                            onChange={handleImageSelect}
                            disabled={submitting}
                        />
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={submitting}
                            className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !category || !description.trim()}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <MessageSquare size={16} />
                                    Submit Report
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Privacy note */}
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4 px-6">
                Your report includes your account information so we can follow up if needed.
                We take your privacy seriously and will only use this information to improve CritterTrack.
            </p>
        </div>
    );
}


import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaEdit, FaTrash, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';
import api, { postRequest } from '../../services/Axios';
import { OverlayLoader } from '../common/LoadingSpinner';

const Gallery = () => {
    const [showAddForm, setShowAddForm] = useState(false);
    const [galleries, setGalleries] = useState([]);
    const [trips, setTrips] = useState([]);
    const [galleryImages, setGalleryImages] = useState({}); // mapping imageUrl -> blobURL
    const [isEditing, setIsEditing] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(null);
    const [isEditingSingle, setIsEditingSingle] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const API_BASE_URL = 'http://localhost:4000/';
    const scrollContainerRef = useRef(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    const [cardWidth, setCardWidth] = useState(0);
    const [updating, setUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('Saving...');

    const [newGallery, setNewGallery] = useState({
        trip_id: '',
        tourName: '',
        title: '',
        images: []
    });
    const [selectedFiles, setSelectedFiles] = useState([]);

    // Detect if device is mobile and calculate card width
    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);

            // Calculate card width based on viewport
            if (width < 640) { // Mobile
                setCardWidth(width * 0.85); // 85vw
            } else if (width < 768) { // Small tablet
                setCardWidth(width * 0.48); // calc(50% - gap)
            } else if (width < 1024) { // Medium tablet
                setCardWidth(width * 0.38); // calc(40% - gap)
            } else { // Desktop
                setCardWidth(width * 0.3); // calc(33.33% - gap)
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);

        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    // Load data from API on component mount
    const fetchData = async () => {
        try {
            // Fetch Galleries
            const galleryRes = await api.get('/Gallery/getGalleries');
            if (galleryRes.data.success) {
                const fetchedGalleries = galleryRes.data.data;
                setGalleries(fetchedGalleries);
                // Load images as blobs
                loadImagesAsBlobs(fetchedGalleries);
            }

            // Fetch Trips for the selection dropdown
            const tripsRes = await api.get('/Trip/getTrips');
            if (tripsRes.data.success) {
                setTrips(tripsRes.data.data);
            }
        } catch (error) {
            console.error('Error fetching gallery data:', error);
        }
    };

    const loadImagesAsBlobs = async (galleryList) => {
        const allImagePaths = [];
        galleryList.forEach(gallery => {
            gallery.images.forEach(path => {
                allImagePaths.push(path);
            });
        });

        const uniquePaths = [...new Set(allImagePaths)];

        const imagePromises = uniquePaths.map(async (path) => {
            try {
                if (galleryImages[path]) return { path, blobUrl: galleryImages[path] };
                const normalizedPath = path.replace(/\\/g, '/');
                const response = await api.get(
                    `/Trip/getFilepath?filePath=${encodeURIComponent(normalizedPath)}`,
                    { responseType: 'blob' }
                );
                const blobUrl = URL.createObjectURL(response.data);
                return { path, blobUrl };
            } catch (err) {
                console.error(`Error loading image ${path}:`, err);
                return { path, blobUrl: null };
            }
        });

        const results = await Promise.all(imagePromises);
        setGalleryImages(prev => {
            const next = { ...prev };
            results.forEach(res => {
                if (res.blobUrl) next[res.path] = res.blobUrl;
            });
            return next;
        });
    };

    useEffect(() => {
        fetchData();
        return () => {
            // Only revoke on final unmount to prevent flickering
            Object.values(galleryImages).forEach(url => URL.revokeObjectURL(url));
        };
    }, []); // Only on mount

    // Separate keyboard navigation effect
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!lightboxOpen) return;
            if (e.key === 'ArrowRight') handleNextImage();
            if (e.key === 'ArrowLeft') handlePrevImage();
            if (e.key === 'Escape') setLightboxOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, currentImageIndex, currentGalleryIndex]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (showAddForm || lightboxOpen || isEditingSingle) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showAddForm, lightboxOpen, isEditingSingle]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewGallery(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setSelectedFiles(prev => [...prev, ...files]);
            files.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreviews(prev => [...prev, reader.result]);
                };
                reader.readAsDataURL(file);
            });
        }
    };

    const handleEdit = (gallery) => {
        setIsEditing(true);
        setEditingFolder(gallery);
        setNewGallery({
            trip_id: gallery.trip_id,
            tourName: gallery.tourName,
            title: gallery.title,
            images: []
        });
        setImagePreviews([]);
        setSelectedFiles([]);
        setShowAddForm(true);
    };

    const handleOpenLightbox = (gallery, imgIndex) => {
        const gallIndex = galleries.findIndex(g => g.id === gallery.id);
        setCurrentGalleryIndex(gallIndex);
        setCurrentImageIndex(imgIndex);
        setZoomLevel(1);
        setLightboxOpen(true);
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 0.5));

    const handleNextImage = () => {
        setZoomLevel(1);
        const gallery = galleries[currentGalleryIndex];
        if (currentImageIndex < gallery.images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        } else if (currentGalleryIndex < galleries.length - 1) {
            setCurrentGalleryIndex(prev => prev + 1);
            setCurrentImageIndex(0);
        }
    };

    const handlePrevImage = () => {
        setZoomLevel(1);
        if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        } else if (currentGalleryIndex > 0) {
            const prevGallIndex = currentGalleryIndex - 1;
            setCurrentGalleryIndex(prevGallIndex);
            setCurrentImageIndex(galleries[prevGallIndex].images.length - 1);
        }
    };

    const handleDeleteSingle = async (e) => {
        e.stopPropagation();
        const gallery = galleries[currentGalleryIndex];
        const imageId = gallery.ids[currentImageIndex];

        if (window.confirm("Are you sure you want to delete this specific image?")) {
            try {
                setUpdating(true);
                setUpdateMessage('Deleting Image...');
                const response = await api.delete(`/Gallery/deleteGalleryById?gallery_id=${imageId}`);
                if (response.data.success) {
                    setLightboxOpen(false);
                    fetchData();
                }
            } catch (error) {
                console.error('Error deleting image:', error);
                alert('Failed to delete image');
            } finally {
                setUpdating(false);
            }
        }
    };

    const handleEditSingle = (e) => {
        e.stopPropagation();
        const gallery = galleries[currentGalleryIndex];
        const imageId = gallery.ids[currentImageIndex];
        const imageUrl = gallery.images[currentImageIndex];

        setEditingImage({
            id: imageId,
            tourName: gallery.tourName,
            title: gallery.title,
            imageUrl: imageUrl
        });
        setIsEditingSingle(true);
    };

    const handleSingleUpdateSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('gallery_id', editingImage.id);
        formData.append('folder_name', editingImage.tourName);
        formData.append('image_title', editingImage.title);

        if (selectedFiles.length > 0) {
            formData.append('images', selectedFiles[0]);
        }

        try {
            setUpdating(true);
            setUpdateMessage('Updating Image...');
            const response = await api.put('/Gallery/updateGalleryById', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.success) {
                setIsEditingSingle(false);
                setEditingImage(null);
                setSelectedFiles([]);
                setImagePreviews([]);
                fetchData();
            }
        } catch (error) {
            console.error('Error updating image:', error);
            alert('Failed to update image');
        } finally {
            setUpdating(false);
        }
    };

    const handleDelete = async (gallery) => {
        if (window.confirm(`Are you sure you want to delete the gallery "${gallery.tourName}"?`)) {
            try {
                setUpdating(true);
                setUpdateMessage('Deleting Gallery...');
                const response = await api.delete(`/Gallery/deleteGalleryByFolder?folder_name=${encodeURIComponent(gallery.tourName)}&trip_id=${gallery.trip_id}`);
                if (response.data.success) {
                    fetchData();
                }
            } catch (error) {
                console.error('Error deleting gallery:', error);
                alert('Failed to delete gallery');
            } finally {
                setUpdating(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('trip_id', newGallery.trip_id);
        formData.append('image_title', newGallery.title);

        if (isEditing) {
            formData.append('old_folder_name', editingFolder.tourName);
            formData.append('new_folder_name', newGallery.tourName);
        } else {
            formData.append('folder_name', newGallery.tourName);
        }

        selectedFiles.forEach(file => {
            formData.append('images', file);
        });

        try {
            setUpdating(true);
            setUpdateMessage(isEditing ? 'Updating Gallery...' : 'Adding Gallery Photos...');
            const url = isEditing ? '/Gallery/updateGalleryByFolder' : '/Gallery/insertGallery';
            const response = isEditing
                ? await api.put(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
                : await postRequest(url, formData);

            if (response.data.success) {
                fetchData();
                setNewGallery({ trip_id: '', tourName: '', title: '', images: [] });
                setImagePreviews([]);
                setSelectedFiles([]);
                setShowAddForm(false);
                setIsEditing(false);
                setEditingFolder(null);
            }
        } catch (error) {
            console.error('Error saving gallery:', error);
            alert('Failed to save gallery');
        } finally {
            setUpdating(false);
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const gap = 24;
            const scrollAmount = cardWidth + gap;
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const gap = 24;
            const scrollAmount = cardWidth + gap;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section id="gallery" className="py-8 sm:py-12 px-4 sm:px-6 md:px-12 bg-white min-h-screen">
            {updating && <OverlayLoader message={updateMessage} />}
            <div className="max-w-8xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center md:text-left mb-4 md:mb-0 text-gray-800 relative">
                        <span className="relative z-10">OUR GALLERY</span>
                        <span className="absolute bottom-0 left-0 w-full h-3 bg-orange-200 opacity-50 -z-10 transform -rotate-1"></span>
                    </h2>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-yellow-500 text-black px-6 py-2.5 hover:bg-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap font-semibold rounded-lg text-sm sm:text-base"
                    >
                        <FaPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Add gallery photos</span>
                        <span className="sm:hidden">Add Photos</span>
                    </button>
                </div>

                <div className="relative px-4 sm:px-6 md:px-8">
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 rounded-full p-1.5 sm:p-2 shadow-md"
                        aria-label="Scroll left"
                    >
                        <FaChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
                    </button>

                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 rounded-full p-1.5 sm:p-2 shadow-md"
                        aria-label="Scroll right"
                    >
                        <FaChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {galleries.map((gallery) => (
                            <div
                                key={gallery.id}
                                className="flex-shrink-0 w-[85vw] sm:w-[calc(50%-1rem)] md:w-[calc(40%-1rem)] lg:w-[calc(33.333%-1rem)] max-w-[400px] bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative group"
                            >
                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleEdit(gallery); }}
                                        className="p-2 bg-white/90 rounded-full text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                        title="Edit Gallery"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(gallery); }}
                                        className="p-2 bg-white/90 rounded-full text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                        title="Delete Gallery"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="p-3 sm:p-4">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">{gallery.tourName}</h3>
                                    <p className="text-gray-600 mb-3 sm:mb-4 text-sm">{gallery.title}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {gallery.images.slice(0, 4).map((image, index) => (
                                            <div
                                                key={index}
                                                className="relative overflow-hidden rounded-lg cursor-pointer group/img"
                                                onClick={() => handleOpenLightbox(gallery, index)}
                                            >
                                                <img
                                                    src={galleryImages[image] || 'https://via.placeholder.com/400x300?text=Loading...'}
                                                    alt={`${gallery.title} ${index + 1}`}
                                                    className="w-full h-24 sm:h-32 object-cover transition-transform duration-500 hover:scale-110"
                                                />
                                                {index === 3 && gallery.images.length > 4 ? (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center transition-all group-hover/img:bg-black/60">
                                                        <span className="text-white text-lg font-bold">+{gallery.images.length - 4}</span>
                                                    </div>
                                                ) : (
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">View</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Minimalist Lightbox Modal */}
            {lightboxOpen && currentGalleryIndex !== null && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
                    {/* Close Button - Subtle and floating */}
                    <button
                        onClick={() => setLightboxOpen(false)}
                        className="fixed top-8 right-8 text-white/50 hover:text-white p-3 hover:bg-white/10 rounded-full transition-all duration-300 z-[70]"
                        title="Close (Esc)"
                    >
                        <FaTimes className="w-7 h-7" />
                    </button>

                    {/* Navigation Buttons - Clean side arrows */}
                    <button
                        onClick={handlePrevImage}
                        className="fixed left-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-4 z-[70] transition-all bg-white/5 hover:bg-white/10 rounded-2xl backdrop-blur-md"
                    >
                        <FaChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                        onClick={handleNextImage}
                        className="fixed right-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-4 z-[70] transition-all bg-white/5 hover:bg-white/10 rounded-2xl backdrop-blur-md"
                    >
                        <FaChevronRight className="w-8 h-8" />
                    </button>

                    {/* Image View Center */}
                    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
                        <div
                            className="relative transition-all duration-500 ease-in-out group pointer-events-auto"
                            style={{ transform: `scale(${zoomLevel})` }}
                        >
                            {/* Action Icons - Hover Only */}
                            <div className="absolute top-6 right-6 flex flex-col gap-3 z-[80] opacity-0 group-hover:opacity-100 transition-all duration-500">
                                <button
                                    onClick={handleEditSingle}
                                    className="p-3 bg-blue-600/30 border border-blue-500/40 text-blue-200 rounded-2xl backdrop-blur-xl hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                                >
                                    <FaEdit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={handleDeleteSingle}
                                    className="p-3 bg-red-600/30 border border-red-500/40 text-red-200 rounded-2xl backdrop-blur-xl hover:bg-red-600 hover:text-white transition-all shadow-xl"
                                >
                                    <FaTrash className="w-5 h-5" />
                                </button>
                                <div className="w-px h-8 bg-white/10 mx-auto my-1"></div>
                                <button onClick={handleZoomIn} className="p-3 bg-white/5 text-white/70 hover:text-white rounded-2xl backdrop-blur-xl transition-all">
                                    <FaSearchPlus className="w-5 h-5" />
                                </button>
                                <button onClick={handleZoomOut} className="p-3 bg-white/5 text-white/70 hover:text-white rounded-2xl backdrop-blur-xl transition-all">
                                    <FaSearchMinus className="w-5 h-5" />
                                </button>
                            </div>

                            <img
                                src={galleryImages[galleries[currentGalleryIndex].images[currentImageIndex]]}
                                alt="Gallery View"
                                className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)] select-none"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Add Gallery Modal with Yellow Theme - Matching WeekendTrips UI */}
            {showAddForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fadeIn">
                        <div className="h-full max-h-[90vh] overflow-y-auto scrollbar-hide">
                            {/* High-End Container */}
                            <div className="bg-white/95 backdrop-blur-lg border border-yellow-200 shadow-2xl rounded-2xl overflow-hidden">
                                {/* Modal Header - Yellow Gradient */}
                                <div className="relative h-20 sm:h-24 bg-gradient-to-r from-yellow-400 to-yellow-500 border-b border-yellow-300">
                                    <div className="relative flex justify-between items-center h-full px-4 sm:px-8">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-black drop-shadow-sm">
                                                {isEditing ? 'Edit Gallery Folder' : 'Create New Gallery'}
                                            </h2>
                                            <p className="text-black/70 text-xs sm:text-sm mt-0.5">Share your amazing travel moments</p>
                                        </div>
                                        <button
                                            onClick={() => { setShowAddForm(false); setIsEditing(false); }}
                                            className="text-black/50 hover:text-black transition-colors bg-white/30 rounded-full p-2 hover:bg-white/50"
                                        >
                                            <FaTimes className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 sm:p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Trip Selection */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Select Associated Trip</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all appearance-none cursor-pointer"
                                                    name="trip_id"
                                                    value={newGallery.trip_id}
                                                    onChange={handleInputChange}
                                                    disabled={isEditing}
                                                >
                                                    <option value="">Choosing a tour...</option>
                                                    {trips.map(trip => <option key={trip.id} value={trip.id}>{trip.title}</option>)}
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                                    <FaChevronRight className="rotate-90 w-4 h-4" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Folder Name */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Folder / Tour Name</label>
                                            <input
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                name="tourName"
                                                type="text"
                                                placeholder="e.g. Manali Adventure"
                                                value={newGallery.tourName}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        {/* Gallery Title */}
                                        <div className="md:col-span-2 mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Gallery Display Title</label>
                                            <input
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                name="title"
                                                type="text"
                                                placeholder="e.g. Trekking & Bonfire Series"
                                                value={newGallery.title}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        {/* File Upload */}
                                        <div className="md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Upload High-Res Photos</label>
                                            <div className="flex flex-col items-center">
                                                <label className="flex flex-col items-center justify-center w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-yellow-50 hover:border-yellow-300 transition-all group">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <FaPlus className="w-8 h-8 mb-4 text-gray-400 group-hover:text-yellow-600 transition-colors" />
                                                        <p className="mb-2 text-sm text-gray-500 font-semibold text-center px-4">Click to select photos or drag & drop</p>
                                                        <p className="text-xs text-gray-400">Multi-select supported (JPG, PNG)</p>
                                                    </div>
                                                    <input type="file" multiple onChange={handleImageUpload} className="hidden" />
                                                </label>

                                                {imagePreviews.length > 0 && (
                                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 mt-6 w-full">
                                                        {imagePreviews.map((p, i) => (
                                                            <div key={i} className="relative group">
                                                                <img src={p} className="w-full h-20 object-cover rounded-xl border border-gray-100 shadow-sm" alt="preview" />
                                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-10 gap-4 pt-8 border-t border-gray-100">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddForm(false)}
                                            className="px-6 py-3 text-gray-500 font-bold hover:text-black transition-colors text-sm uppercase tracking-widest"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-10 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-extrabold rounded-xl transition-all shadow-xl hover:shadow-yellow-500/20 active:scale-95 text-sm uppercase tracking-widest"
                                        >
                                            {isEditing ? 'Save Changes' : 'Upload Gallery'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Single Metadata Modal */}
            {isEditingSingle && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4">
                    <div className="bg-white/10 border border-white/20 p-8 rounded-2xl max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6 text-white font-bold text-xl">
                            Edit Image Info
                            <button onClick={() => setIsEditingSingle(false)}><FaTimes /></button>
                        </div>
                        <form onSubmit={handleSingleUpdateSubmit} className="space-y-4">
                            <div>
                                <label className="text-white/60 text-sm">Folder</label>
                                <input className="w-full bg-white/5 border border-white/10 p-3 text-white" value={editingImage.tourName} onChange={(e) => setEditingImage({ ...editingImage, tourName: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-white/60 text-sm">Title</label>
                                <input className="w-full bg-white/5 border border-white/10 p-3 text-white" value={editingImage.title} onChange={(e) => setEditingImage({ ...editingImage, title: e.target.value })} />
                            </div>
                            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg mt-4">Update Image</button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.5s ease-out forwards;
                }
            `}</style>
        </section>
    );
};

export default Gallery;
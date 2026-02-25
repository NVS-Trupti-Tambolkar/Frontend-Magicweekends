import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../services/Axios';
import { SkeletonGrid, OverlayLoader } from '../common/LoadingSpinner';

const WeekendTrips = () => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [trips, setTrips] = useState([]);
    const [tripImages, setTripImages] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [currentTripId, setCurrentTripId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('Saving...');

    const scrollContainerRef = useRef(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [cardWidth, setCardWidth] = useState(0);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const [newTrip, setNewTrip] = useState({
        title: '',
        image: null,
        tours: 0,
        price: '',
        duration: '',
        difficulty: '',
        highlights: '',
        available_days: [],
        from_location: '',
        to_location: '',
        overview: '',
        things_to_carry: '',
        max_group_size: '',
        age_limit: '',
        status: true,
        itineraries: [
            { day_number: 1, day_title: '', description: '', meals: '', accommodation: '', activities: '' }
        ]
    });

    // Detect if device is mobile and calculate card width
    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);

            if (width < 640) {
                setCardWidth(width * 0.75);
            } else if (width < 768) {
                setCardWidth(width * 0.55);
            } else if (width < 1024) {
                setCardWidth(width * 0.40);
            } else if (width < 1280) {
                setCardWidth(width * 0.33);
            } else {
                setCardWidth(width * 0.28);
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    const fetchTrips = async () => {
        try {
            setLoading(true);
            const response = await api.get('/WeekendTrip/getWeekendallTrips');
            if (response.data.success) {
                const tripData = response.data.data;

                // Fetch images for each trip as blobs
                const imagePromises = tripData.map(async (trip) => {
                    const id = trip.id;
                    const imagePath = trip.uploadimage;

                    if (imagePath) {
                        try {
                            const filePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
                            const imageResponse = await api.get(
                                `/Trip/getFilepath?filePath=${encodeURIComponent(filePath)}`,
                                { responseType: 'blob' }
                            );
                            const imageUrl = URL.createObjectURL(imageResponse.data);
                            return { id, imageUrl };
                        } catch (imageErr) {
                            console.error(`Error fetching image for trip ${id}:`, imageErr);
                            return { id, imageUrl: 'https://picsum.photos/seed/placeholder/600/400' };
                        }
                    }
                    return { id, imageUrl: 'https://picsum.photos/seed/placeholder/600/400' };
                });

                const images = await Promise.all(imagePromises);
                const imageMap = images.reduce((acc, { id, imageUrl }) => {
                    acc[id] = imageUrl;
                    return acc;
                }, {});

                setTripImages(imageMap);
                setTrips(tripData);
            }
        } catch (error) {
            console.error('Error fetching weekend trips:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrips();
        return () => {
            Object.values(tripImages).forEach((url) => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewTrip(prev => ({ ...prev, [name]: value }));
    };

    const handleDayToggle = (day) => {
        setNewTrip(prev => {
            const currentDays = [...prev.available_days];
            if (currentDays.includes(day)) {
                return { ...prev, available_days: currentDays.filter(d => d !== day) };
            } else {
                return { ...prev, available_days: [...currentDays, day] };
            }
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewTrip(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const addItineraryDay = () => {
        setNewTrip(prev => ({
            ...prev,
            itineraries: [
                ...prev.itineraries,
                { day_number: prev.itineraries.length + 1, day_title: '', description: '', meals: '', accommodation: '', activities: '' }
            ]
        }));
    };

    const removeItineraryDay = (index) => {
        setNewTrip(prev => {
            const updated = prev.itineraries.filter((_, i) => i !== index);
            // Re-order day numbers
            const reordered = updated.map((item, i) => ({ ...item, day_number: i + 1 }));
            return { ...prev, itineraries: reordered };
        });
    };

    const handleItineraryChange = (index, field, value) => {
        setNewTrip(prev => {
            const updated = [...prev.itineraries];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, itineraries: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEditing && !newTrip.image) {
            alert("Please upload a trip image.");
            return;
        }

        if (newTrip.available_days.length === 0) {
            alert("Please select at least one available day.");
            return;
        }

        try {
            setUpdating(true);
            setUpdateMessage(isEditing ? 'Updating Weekend Trip...' : 'Creating Weekend Trip...');

            const formData = new FormData();
            formData.append('title', newTrip.title);
            formData.append('duration', newTrip.duration);
            formData.append('tours', newTrip.tours);
            formData.append('price', newTrip.price);
            formData.append('difficulty', newTrip.difficulty);
            formData.append('highlights', newTrip.highlights);
            formData.append('available_days', newTrip.available_days.join(', '));
            formData.append('from_location', newTrip.from_location);
            formData.append('to_location', newTrip.to_location);
            formData.append('overview', newTrip.overview);
            formData.append('things_to_carry', newTrip.things_to_carry);
            formData.append('max_group_size', newTrip.max_group_size);
            formData.append('age_limit', newTrip.age_limit);
            formData.append('status', newTrip.status);

            if (isEditing) {
                formData.append('id', currentTripId);
            }

            if (newTrip.image) {
                formData.append('uploadimage', newTrip.image);
            }

            let response;
            if (isEditing) {
                response = await api.put('/WeekendTrip/updateWeekendTrip', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                response = await api.post('/WeekendTrip/insertWeekendTrip', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            if (response.data.success) {
                const tripId = isEditing ? currentTripId : response.data.data.id;

                // Save Itineraries
                if (newTrip.itineraries.length > 0) {
                    try {
                        setUpdateMessage('Saving Itineraries...');
                        // If it's an edit, delete existing ones first for a clean update
                        if (isEditing) {
                            await api.delete(`/Itineraries/deleteByTrip?trip_id=${tripId}&trip_type=weekend`);
                        }

                        await api.post('/Itineraries/itineraries', {
                            trip_id: tripId,
                            trip_type: 'weekend',
                            itineraries: newTrip.itineraries.map(item => ({
                                ...item,
                                activities: Array.isArray(item.activities) ? item.activities.join(', ') : item.activities
                            }))
                        });
                    } catch (itinError) {
                        console.error('Error saving itineraries:', itinError);
                    }
                }

                await fetchTrips();
                resetForm();
            }
        } catch (error) {
            console.error('Error saving trip:', error);
            alert('Failed to save trip. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const resetForm = () => {
        setNewTrip({
            title: '',
            image: null,
            tours: 0,
            price: '',
            duration: '',
            difficulty: '',
            highlights: '',
            available_days: [],
            from_location: '',
            to_location: '',
            overview: '',
            things_to_carry: '',
            max_group_size: '',
            age_limit: '',
            status: true,
            itineraries: [
                { day_number: 1, day_title: '', description: '', meals: '', accommodation: '', activities: '' }
            ]
        });
        setImagePreview(null);
        setShowAddForm(false);
        setIsEditing(false);
        setCurrentTripId(null);
    };

    const handleEdit = (e, trip) => {
        e.stopPropagation();
        setIsEditing(true);
        setCurrentTripId(trip.id);
        const days = trip.available_days ? trip.available_days.split(',').map(d => d.trim()) : [];
        setNewTrip({
            title: trip.title,
            image: null,
            tours: trip.tours,
            price: trip.price,
            duration: trip.duration,
            difficulty: trip.difficulty,
            highlights: trip.highlights,
            available_days: days,
            from_location: trip.from_location || '',
            to_location: trip.to_location || '',
            overview: trip.overview || '',
            things_to_carry: trip.things_to_carry || '',
            max_group_size: trip.max_group_size || '',
            age_limit: trip.age_limit || '',
            status: trip.status,
            itineraries: [] // Will fetch separately
        });

        // Fetch itineraries
        const fetchItineraries = async () => {
            try {
                const itinResp = await api.get(`/Itinerary/getItinerariesByTrip?trip_id=${trip.id}&type=weekend`);
                if (itinResp.data.success) {
                    const itinData = itinResp.data.data.map(item => ({
                        day_number: item.day_number,
                        day_title: item.day_title || '',
                        description: item.description || '',
                        meals: item.meals || '',
                        accommodation: item.accommodation || '',
                        activities: item.activities || ''
                    }));
                    setNewTrip(prev => ({
                        ...prev,
                        itineraries: itinData.length > 0 ? itinData : [{ day_number: 1, day_title: '', description: '', meals: '', accommodation: '', activities: '' }]
                    }));
                }
            } catch (err) {
                console.error("Error fetching itineraries for edit:", err);
                setNewTrip(prev => ({
                    ...prev,
                    itineraries: [{ day_number: 1, day_title: '', description: '', meals: '', accommodation: '', activities: '' }]
                }));
            }
        };
        fetchItineraries();
        setImagePreview(tripImages[trip.id]);
        setShowAddForm(true);
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this weekend trip?")) {
            try {
                setUpdating(true);
                setUpdateMessage('Deleting Weekend Trip...');
                const response = await api.delete('/WeekendTrip/deleteWeekendTrip', { data: { id } });
                if (response.data.success) {
                    // Also delete itineraries
                    try {
                        await api.delete(`/Itineraries/deleteByTrip?trip_id=${id}&trip_type=weekend`);
                    } catch (itinErr) {
                        console.error("Error deleting itineraries for trip:", itinErr);
                    }
                    await fetchTrips();
                }
            } catch (error) {
                console.error("Error deleting trip:", error);
                alert("Failed to delete trip");
            } finally {
                setUpdating(false);
            }
        }
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            const gap = isMobile ? 12 : 16;
            const scrollAmount = cardWidth + gap;
            scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            const gap = isMobile ? 12 : 16;
            const scrollAmount = cardWidth + gap;
            scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section id="weekend-trips" className="py-8 sm:py-12 px-4 sm:px-6 md:px-12 bg-white">
            {updating && <OverlayLoader message={updateMessage} />}
            <div className="max-w-8xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center md:text-left mb-4 md:mb-0 text-gray-800 relative">
                        <span className="relative z-10">WEEKEND TRIPS</span>
                        <span className="absolute bottom-0 left-0 w-full h-3 bg-orange-200 opacity-50 -z-10 transform -rotate-1"></span>
                    </h2>
                    <button
                        onClick={() => { resetForm(); setShowAddForm(true); }}
                        className="bg-yellow-500 text-black px-6 py-2.5 hover:bg-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap font-semibold rounded-lg text-sm sm:text-base"
                    >
                        <FaPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Add weekends plan</span>
                        <span className="sm:hidden">Add Plan</span>
                    </button>
                </div>

                <div className="relative px-4 sm:px-6 md:px-8">
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 sm:left-2 top-1/2 transform -translate-y-1/2 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 rounded-full p-1.5 sm:p-2 shadow-md sm:shadow-lg"
                    >
                        <FaChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
                    </button>

                    <button
                        onClick={scrollRight}
                        className="absolute right-0 sm:right-2 top-1/2 transform -translate-y-1/2 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 rounded-full p-1.5 sm:p-2 shadow-md sm:shadow-lg"
                    >
                        <FaChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {loading ? (
                            <SkeletonGrid count={3} cols="flex gap-3 sm:gap-4" />
                        ) : (
                            trips.map((trip) => (
                                <div
                                    key={trip.id}
                                    className="flex-shrink-0 w-[75vw] sm:w-[calc(55%-0.5rem)] md:w-[calc(40%-0.5rem)] lg:w-[calc(33%-0.5rem)] xl:w-[calc(28%-0.5rem)] max-w-[380px] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                    onMouseEnter={() => setHoveredCard(trip.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                >
                                    <div className="relative overflow-hidden" style={{ paddingTop: '66.67%' }}>
                                        <img
                                            src={tripImages[trip.id] || 'https://picsum.photos/seed/placeholder/600/400'}
                                            alt={trip.title}
                                            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        />

                                        <div className="absolute top-4 right-4 flex gap-2 z-20">
                                            <button
                                                onClick={(e) => handleEdit(e, trip)}
                                                className="bg-white/80 p-2 rounded-full hover:bg-white text-gray-800 hover:text-blue-600 transition-all shadow-lg"
                                                title="Edit Trip"
                                            >
                                                <FaEdit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, trip.id)}
                                                className="bg-white/80 p-2 rounded-full hover:bg-white text-gray-800 hover:text-red-600 transition-all shadow-lg"
                                                title="Delete Trip"
                                            >
                                                <FaTrash className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="absolute inset-0 bg-black/30"></div>

                                        <div className={`absolute bottom-0 left-0 w-full px-6 py-4 transition-all duration-500 ${hoveredCard === trip.id ? 'translate-y-[-140px]' : ''}`}>
                                            <h3 className="text-xl font-bold text-white">{trip.title}</h3>
                                            {trip.available_days && !hoveredCard && (
                                                <p className="text-white/80 text-xs mt-1">{trip.available_days}</p>
                                            )}
                                        </div>

                                        <div className={`absolute inset-0 transition-all duration-500 transform ${hoveredCard === trip.id ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                                <div className="flex items-start mb-2 gap-2">
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-[10px] font-bold text-white uppercase tracking-wider opacity-80 mb-1">TOURS</div>
                                                        <div className="px-3 py-2">
                                                            <div className="text-xl text-white font-bold text-center">{trip.tours}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col items-center">
                                                        <div className="text-center">
                                                            <div className="text-[10px] font-bold text-white uppercase tracking-wider opacity-80">STARTING FROM</div>
                                                        </div>
                                                        <div className="px-3 py-2">
                                                            <div className="text-xl font-bold text-white">{trip.price}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/travel/${trip.id}?type=weekend`)}
                                                        className="bg-transparent border border-white/40 text-white font-montserrat py-3 px-4 hover:bg-white/30 hover:border-white/40 transition-all duration-300 text-sm tracking-[0.2em]">
                                                        EXPLORE MORE
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {showAddForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden animate-fadeIn">
                        <div className="h-full max-h-[90vh] overflow-y-auto">
                            <div className="bg-white/95 backdrop-blur-lg border border-yellow-200 shadow-2xl rounded-2xl overflow-hidden">
                                <div className="relative h-20 sm:h-24 bg-gradient-to-r from-yellow-400 to-yellow-500 border-b border-yellow-300">
                                    <div className="relative flex justify-between items-center h-full px-4 sm:px-8">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-bold text-black drop-shadow-sm">{isEditing ? 'Edit Weekend Trip' : 'Add New Weekend Trip'}</h2>
                                            <p className="text-black/70 text-xs sm:text-sm mt-0.5 sm:mt-1">{isEditing ? 'Update your travel details' : 'Create your amazing weekend travel plan'}</p>
                                        </div>
                                        <button
                                            onClick={resetForm}
                                            className="text-black/50 hover:text-black transition-colors bg-white/30 rounded-full p-1.5 sm:p-2 hover:bg-white/50"
                                        >
                                            <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="p-4 sm:p-8 md:p-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                                            <input
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400 text-sm"
                                                name="title"
                                                type="text"
                                                value={newTrip.title}
                                                onChange={handleInputChange}
                                                placeholder="Enter weekend trip title"
                                                required
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Duration</label>
                                            <input
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400 text-sm"
                                                name="duration"
                                                type="text"
                                                value={newTrip.duration}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 2 days"
                                                required
                                            />
                                        </div>

                                        <div className="mb-4 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Available Days</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                {daysOfWeek.map(day => (
                                                    <label key={day} className="flex items-center space-x-2 cursor-pointer group">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                className="hidden"
                                                                checked={newTrip.available_days.includes(day)}
                                                                onChange={() => handleDayToggle(day)}
                                                            />
                                                            <div className={`w-5 h-5 border-2 rounded-md transition-all ${newTrip.available_days.includes(day) ? 'bg-yellow-500 border-yellow-500' : 'border-gray-300 bg-white'}`}>
                                                                {newTrip.available_days.includes(day) && (
                                                                    <svg className="w-full h-full text-black p-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <span className="text-sm text-gray-700 group-hover:text-black transition-colors">{day}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-4 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Upload Image</label>
                                            <div className="flex flex-col items-center">
                                                <div className="w-full">
                                                    <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 sm:h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-yellow-50 hover:border-yellow-300 transition-all group">
                                                        <FaPlus className="w-8 h-8 sm:w-10 sm:h-10 mb-2 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                                                        <p className="text-gray-500 text-xs sm:text-sm font-medium">Click to upload or drag and drop</p>
                                                        <p className="text-gray-400 text-[10px] sm:text-xs">PNG, JPG, GIF up to 10MB</p>
                                                    </label>
                                                    <input
                                                        id="image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="hidden"
                                                    />
                                                </div>
                                                {imagePreview && (
                                                    <div className="mt-4 sm:mt-6 w-full">
                                                        <div className="relative w-full shadow-lg rounded-xl overflow-hidden" style={{ paddingTop: '66.67%' }}>
                                                            <img src={imagePreview} alt="Preview" className="absolute top-0 left-0 w-full h-full object-cover" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Number of Tours</label>
                                            <input
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400 text-sm"
                                                name="tours"
                                                type="number"
                                                value={newTrip.tours}
                                                onChange={handleInputChange}
                                                placeholder="Enter number of tours"
                                                required
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Price</label>
                                            <input
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400 text-sm"
                                                name="price"
                                                type="text"
                                                value={newTrip.price}
                                                onChange={handleInputChange}
                                                placeholder="e.g. ₹999"
                                                required
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Difficulty</label>
                                            <select
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all text-sm appearance-none"
                                                name="difficulty"
                                                value={newTrip.difficulty}
                                                onChange={handleInputChange}
                                                required
                                            >
                                                <option value="">Select Difficulty</option>
                                                <option value="Easy">Easy</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="Difficult">Difficult</option>
                                            </select>
                                        </div>

                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">From Location</label>
                                            <input
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all text-sm"
                                                name="from_location"
                                                type="text"
                                                value={newTrip.from_location}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Dehradun"
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">To Location</label>
                                            <input
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all text-sm"
                                                name="to_location"
                                                type="text"
                                                value={newTrip.to_location}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Mussoorie"
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Group Size</label>
                                            <input
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all text-sm"
                                                name="max_group_size"
                                                type="number"
                                                value={newTrip.max_group_size}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 15"
                                            />
                                        </div>

                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Age Limit</label>
                                            <input
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all text-sm"
                                                name="age_limit"
                                                type="text"
                                                value={newTrip.age_limit}
                                                onChange={handleInputChange}
                                                placeholder="e.g. 10-50"
                                            />
                                        </div>

                                        <div className="mb-4 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Highlights (comma separated)</label>
                                            <textarea
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400 text-sm"
                                                name="highlights"
                                                value={newTrip.highlights}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Camping, Trekking, Sunrise view"
                                                rows="3"
                                                required
                                            />
                                        </div>

                                        <div className="mb-4 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Overview</label>
                                            <textarea
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all text-sm"
                                                name="overview"
                                                value={newTrip.overview}
                                                onChange={handleInputChange}
                                                placeholder="Describe the trip..."
                                                rows="3"
                                            />
                                        </div>

                                        <div className="mb-4 md:col-span-2">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-bold text-gray-800">Itinerary Plan</h3>
                                                <button
                                                    type="button"
                                                    onClick={addItineraryDay}
                                                    className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-200 transition-all flex items-center gap-2"
                                                >
                                                    <FaPlus className="w-3 h-3" />
                                                    Add more another day plan
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {newTrip.itineraries.map((itin, index) => (
                                                    <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 relative group">
                                                        {newTrip.itineraries.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItineraryDay(index)}
                                                                className="absolute top-4 right-4 text-red-400 hover:text-red-600 transition-colors"
                                                            >
                                                                <FaTrash className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="md:col-span-2">
                                                                <h4 className="text-orange-600 font-bold text-sm mb-3">Day {itin.day_number}</h4>
                                                                <label className="block text-gray-700 text-xs font-bold mb-1">Day Title</label>
                                                                <input
                                                                    className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 text-sm"
                                                                    value={itin.day_title}
                                                                    onChange={(e) => handleItineraryChange(index, 'day_title', e.target.value)}
                                                                    placeholder="e.g. Arrival & Orientation"
                                                                    required
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-gray-700 text-xs font-bold mb-1">Description</label>
                                                                <textarea
                                                                    className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 text-sm"
                                                                    value={itin.description}
                                                                    onChange={(e) => handleItineraryChange(index, 'description', e.target.value)}
                                                                    placeholder="Describe the day's events..."
                                                                    rows="2"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-gray-700 text-xs font-bold mb-1">Meals</label>
                                                                <input
                                                                    className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 text-sm"
                                                                    value={itin.meals}
                                                                    onChange={(e) => handleItineraryChange(index, 'meals', e.target.value)}
                                                                    placeholder="e.g. Breakfast, Lunch"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-gray-700 text-xs font-bold mb-1">Accommodation</label>
                                                                <input
                                                                    className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 text-sm"
                                                                    value={itin.accommodation}
                                                                    onChange={(e) => handleItineraryChange(index, 'accommodation', e.target.value)}
                                                                    placeholder="e.g. Hotel name"
                                                                />
                                                            </div>
                                                            <div className="md:col-span-2">
                                                                <label className="block text-gray-700 text-xs font-bold mb-1">Activities (comma separated)</label>
                                                                <input
                                                                    className="w-full py-2 px-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 text-sm"
                                                                    value={itin.activities}
                                                                    onChange={(e) => handleItineraryChange(index, 'activities', e.target.value)}
                                                                    placeholder="e.g. Sightseeing, Trekking"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-4 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Things to Carry</label>
                                            <textarea
                                                className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all text-sm"
                                                name="things_to_carry"
                                                value={newTrip.things_to_carry}
                                                onChange={handleInputChange}
                                                placeholder="e.g. Backpack, Shoes, Water bottle..."
                                                rows="3"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end mt-6 sm:mt-10 gap-3 sm:gap-4 pt-4 sm:pt-8 border-t border-gray-100">
                                        <button
                                            type="button"
                                            className="px-4 sm:px-8 py-2 sm:py-3 text-gray-600 font-bold hover:text-black hover:bg-gray-100 rounded-xl transition-all text-sm"
                                            onClick={resetForm}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 sm:py-3 px-6 sm:px-10 rounded-xl transition-all shadow-xl hover:shadow-yellow-500/20 active:scale-95 text-sm"
                                        >
                                            {isEditing ? 'Update Weekend Trip' : 'Add Weekend Trip'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
            `}</style>
        </section>
    );
};

export default WeekendTrips;

import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaSearch, FaFilter, FaMapMarkerAlt, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../services/Axios';
import { SkeletonGrid, OverlayLoader } from '../common/LoadingSpinner';

const ExploreWithUs = () => {
    const [hoveredDestination, setHoveredDestination] = useState(null);
    const navigate = useNavigate();
    const [showAddDestinationForm, setShowAddDestinationForm] = useState(false);
    const [tripImages, setTripImages] = useState({}); // Store blob URLs for trip images
    const [destinations, setDestinations] = useState([]); // Initialized as empty array to rely on API
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('Saving...');

    const [destinationImagePreview, setDestinationImagePreview] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTripId, setCurrentTripId] = useState(null);
    const [filter, setFilter] = useState({
        search: ''
    });

    const [newDestination, setNewDestination] = useState({
        title: '',
        image: null,
        tours: 0,
        price: '',
        duration: '',
        difficulty: '',
        highlights: '',
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

    // Fetch trips from API
    const fetchTrips = async () => {
        try {
            setLoading(true);
            const response = await api.get('/Trip/getTrips');
            if (response.data.success) {
                const tripData = response.data.data;

                // Use Cloudinary URLs directly - no local file fetching
                const imagePromises = tripData.map(async (trip) => {
                    const id = trip.id;
                    const imagePath = trip.uploadimage;
                    return { id, imageUrl: imagePath || 'https://picsum.photos/seed/placeholder/600/400' };
                });

                const images = await Promise.all(imagePromises);
                const imageMap = images.reduce((acc, { id, imageUrl }) => {
                    acc[id] = imageUrl;
                    return acc;
                }, {});

                setTripImages(imageMap);

                // Transform API data to match component structure
                const transformedTrips = tripData.map(trip => ({
                    id: trip.id.toString(),
                    title: trip.title,
                    image: imageMap[trip.id] || 'https://picsum.photos/seed/placeholder/600/400',
                    price: trip.price,
                    tours: trip.tours,
                    duration: trip.duration,
                    difficulty: trip.difficulty,
                    highlights: trip.highlights,
                    from_location: trip.from_location,
                    to_location: trip.to_location,
                    overview: trip.overview,
                    things_to_carry: trip.things_to_carry,
                    max_group_size: trip.max_group_size,
                    age_limit: trip.age_limit,
                    status: trip.status
                }));

                setDestinations(transformedTrips);
            }
        } catch (error) {
            console.error('Error fetching trips:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load destinations from API on mount
    useEffect(() => {
        fetchTrips();

        // Cleanup blob URLs on unmount
        return () => {
            // Cleanup blob URLs only (not Cloudinary URLs)
            Object.values(tripImages).forEach((url) => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, []);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilter(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDestinationInputChange = (e) => {
        const { name, value } = e.target;
        setNewDestination(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const addItineraryDay = () => {
        setNewDestination(prev => ({
            ...prev,
            itineraries: [
                ...prev.itineraries,
                { day_number: prev.itineraries.length + 1, day_title: '', description: '', meals: '', accommodation: '', activities: '' }
            ]
        }));
    };

    const removeItineraryDay = (index) => {
        setNewDestination(prev => {
            const updated = prev.itineraries.filter((_, i) => i !== index);
            const reordered = updated.map((item, i) => ({ ...item, day_number: i + 1 }));
            return { ...prev, itineraries: reordered };
        });
    };

    const handleItineraryChange = (index, field, value) => {
        setNewDestination(prev => {
            const updated = [...prev.itineraries];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, itineraries: updated };
        });
    };

    const handleDestinationImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Store the file object for FormData
            setNewDestination(prev => ({
                ...prev,
                image: file
            }));

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setDestinationImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent card click
        if (window.confirm("Are you sure you want to delete this trip?")) {
            try {
                setUpdating(true);
                setUpdateMessage('Deleting Trip...');
                const response = await api.delete('/Trip/deleteTrip', { data: { id } });
                if (response.data.success) {
                    // Also delete itineraries
                    try {
                        await api.delete(`/Itineraries/deleteByTrip?trip_id=${id}&trip_type=normal`);
                    } catch (itinErr) {
                        console.error("Error deleting itineraries for trip:", itinErr);
                    }
                    fetchTrips();
                }
            } catch (error) {
                console.error("Error deleting trip:", error);
                alert("Failed to delete trip");
            } finally {
                setUpdating(false);
            }
        }
    };

    const handleEdit = (e, trip) => {
        e.stopPropagation(); // Prevent card click
        setIsEditing(true);
        setCurrentTripId(trip.id);
        setNewDestination({
            title: trip.title,
            image: null, // Keep null, if changed it will be uploaded
            tours: trip.tours,
            price: trip.price,
            duration: trip.duration,
            difficulty: trip.difficulty,
            highlights: trip.highlights,
            from_location: trip.from_location,
            to_location: trip.to_location,
            overview: trip.overview,
            things_to_carry: trip.things_to_carry,
            max_group_size: trip.max_group_size,
            age_limit: trip.age_limit,
            status: trip.status,
            itineraries: [] // Will fetch separately
        });

        // Fetch itineraries
        const fetchItineraries = async () => {
            try {
                const itinResp = await api.get(`/Itinerary/getItinerariesByTrip?trip_id=${trip.id}&type=normal`);
                if (itinResp.data.success) {
                    const itinData = itinResp.data.data.map(item => ({
                        day_number: item.day_number,
                        day_title: item.day_title || '',
                        description: item.description || '',
                        meals: item.meals || '',
                        accommodation: item.accommodation || '',
                        activities: item.activities || ''
                    }));
                    setNewDestination(prev => ({
                        ...prev,
                        itineraries: itinData.length > 0 ? itinData : [{ day_number: 1, day_title: '', description: '', meals: '', accommodation: '', activities: '' }]
                    }));
                }
            } catch (err) {
                console.error("Error fetching itineraries for edit:", err);
                setNewDestination(prev => ({
                    ...prev,
                    itineraries: [{ day_number: 1, day_title: '', description: '', meals: '', accommodation: '', activities: '' }]
                }));
            }
        };
        fetchItineraries();

        // Disable file input preview since we have existing image logic in component but not easy to show blob as file
        // We can show existing image as preview if needed but for now simple edit
        if (trip.image) {
            setDestinationImagePreview(trip.image);
        } else {
            setDestinationImagePreview(null);
        }

        setShowAddDestinationForm(true);
    };

    const handleAddDestination = async (e) => {
        e.preventDefault();

        // Manual validation for image on create
        if (!isEditing && !newDestination.image) {
            alert("Please upload a destination image.");
            return;
        }

        try {
            setUpdating(true);
            setUpdateMessage(isEditing ? 'Updating Destination...' : 'Creating Destination...');
            // Create FormData for multipart/form-data submission
            const formData = new FormData();
            formData.append('title', newDestination.title);
            formData.append('duration', newDestination.duration);
            formData.append('tours', newDestination.tours);
            formData.append('price', newDestination.price);
            formData.append('difficulty', newDestination.difficulty);
            formData.append('highlights', newDestination.highlights);
            formData.append('from_location', newDestination.from_location);
            formData.append('to_location', newDestination.to_location);
            formData.append('overview', newDestination.overview);
            formData.append('things_to_carry', newDestination.things_to_carry);
            formData.append('max_group_size', newDestination.max_group_size);
            formData.append('age_limit', newDestination.age_limit);
            formData.append('status', newDestination.status);

            if (isEditing) {
                formData.append('id', currentTripId);
            }

            // Append image file
            // CRITICAL FIX: Backend expects 'uploadimage', not 'image'
            if (newDestination.image) {
                formData.append('uploadimage', newDestination.image);
            }

            // Send to API
            let response;
            if (isEditing) {
                response = await api.put('/Trip/updateTrip', formData);
            } else {
                response = await api.post('/Trip/insertTripDirect', formData);
            }

            if (response.data.success) {
                const tripId = isEditing ? currentTripId : response.data.data.id;

                // Save Itineraries - use transaction-safe bulk insert
                if (newDestination.itineraries.length > 0) {
                    try {
                        setUpdateMessage('Saving Itineraries...');
                        // Backend now handles transaction-safe upsert
                        await api.post('/Itineraries/itineraries', {
                            trip_id: tripId,
                            trip_type: 'normal',
                            itineraries: newDestination.itineraries.map(item => ({
                                ...item,
                                activities: Array.isArray(item.activities) ? item.activities.join(', ') : item.activities
                            }))
                        });
                    } catch (itinError) {
                        console.error('Error saving itineraries:', itinError);
                        alert('Trip saved but itineraries failed. Please edit the trip to add itineraries.');
                    }
                }

                // Refresh trips list
                await fetchTrips();

                // Reset form
                setNewDestination({
                    title: '',
                    image: null,
                    tours: 0,
                    price: '',
                    duration: '',
                    difficulty: '',
                    highlights: '',
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
                setDestinationImagePreview(null);
                setShowAddDestinationForm(false);
                setIsEditing(false);
                setCurrentTripId(null);
            }
        } catch (error) {
            console.error(isEditing ? 'Error updating trip:' : 'Error adding trip:', error);
            alert(isEditing ? 'Failed to update trip.' : 'Failed to add trip. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    // Filter destinations
    const filteredDestinations = destinations.filter(destination => {
        const matchesSearch = filter.search ?
            destination.title.toLowerCase().includes(filter.search.toLowerCase()) : true;

        return matchesSearch;
    });

    // Group destinations into rows of 3
    const rows = [];
    for (let i = 0; i < filteredDestinations.length; i += 3) {
        rows.push(filteredDestinations.slice(i, i + 3));
    }

    return (
        <section id="explore" className="py-8 sm:py-12 px-4 sm:px-6 md:px-12 bg-white">
            {updating && <OverlayLoader message={updateMessage} />}
            <div className="max-w-8xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-10 border-b border-gray-100 pb-4 sm:pb-6">
                    <div className="flex items-center gap-3 mb-4 md:mb-0">
                        {/* <FaMapMarkerAlt className="w-8 h-8  " /> */}
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center md:text-left text-gray-800 relative inline-block">
                            <span className="relative z-10">Explore with Us</span>
                            <span className="absolute bottom-0 left-0 w-full h-3 bg-orange-200 opacity-50 -z-10 transform -rotate-1"></span>
                        </h2>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
                        {/* Search Bar in Header */}
                        <div className="relative w-full sm:w-48 md:w-64">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="search"
                                value={filter.search}
                                onChange={handleFilterChange}
                                placeholder="Search destinations..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500/30 focus:border-yellow-500"
                            />
                        </div>

                        {/* Add New Destination Button */}
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setNewDestination({
                                    title: '',
                                    image: null,
                                    tours: 0,
                                    price: '',
                                    duration: '',
                                    difficulty: '',
                                    highlights: '',
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
                                setDestinationImagePreview(null);
                                setShowAddDestinationForm(true);
                            }}
                            className="bg-yellow-500 text-black px-4 sm:px-6 py-2 sm:py-2.5 hover:bg-yellow-600 transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap font-semibold rounded-lg text-sm sm:text-base w-full sm:w-auto justify-center"
                        >
                            <FaPlus className="w-4 h-4" />
                            Add New Destination
                        </button>
                    </div>
                </div>



                {/* Destinations Grid - 3 boxes per row */}
                <div className="px-0 sm:px-4">
                    {loading ? (
                        <SkeletonGrid count={6} cols="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" />
                    ) : (
                        <>
                            {rows.map((row, rowIndex) => (
                                <div key={rowIndex} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                                    {row.map((destination) => (
                                        <div
                                            key={destination.id}
                                            className="bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
                                            onMouseEnter={() => setHoveredDestination(destination.id)}
                                            onMouseLeave={() => setHoveredDestination(null)}
                                        >
                                            {/* Background Image Container with Rectangle Aspect Ratio (3:2) */}
                                            <div className="relative overflow-hidden" style={{ paddingTop: '66.67%' }}>
                                                <img
                                                    src={destination.image}
                                                    alt={destination.title}
                                                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                                />

                                                {/* Edit/Delete Actions */}
                                                <div className="absolute top-4 right-4 flex gap-2 z-20">
                                                    <button
                                                        onClick={(e) => handleEdit(e, destination)}
                                                        className="bg-white/80 p-2 rounded-full hover:bg-white text-gray-800 hover:text-blue-600 transition-all shadow-lg"
                                                        title="Edit Trip"
                                                    >
                                                        <FaEdit className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => handleDelete(e, destination.id)}
                                                        className="bg-white/80 p-2 rounded-full hover:bg-white text-gray-800 hover:text-red-600 transition-all shadow-lg"
                                                        title="Delete Trip"
                                                    >
                                                        <FaTrash className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Black transparent overlay */}
                                                <div className="absolute inset-0 bg-black/30"></div>

                                                {/* Title at bottom when not hovered, moves to top of slider when hovered */}
                                                <div className={`absolute bottom-0 left-0 w-full px-6 py-4 transition-all duration-500 ${hoveredDestination === destination.id
                                                    ? 'translate-y-[-140px] opacity-100'
                                                    : 'opacity-100'
                                                    }`}>
                                                    <div className={`transition-all duration-500 ${hoveredDestination === destination.id
                                                        ? 'bg-transparent'
                                                        : ''
                                                        }`}>
                                                        <h3 className="text-xl font-bold text-white">{destination.title}</h3>
                                                    </div>
                                                </div>

                                                {/* Hover Overlay - Slides up from bottom with enhanced content */}
                                                <div className={`absolute inset-0 transition-all duration-500 transform ${hoveredDestination === destination.id
                                                    ? 'translate-y-0 opacity-100'
                                                    : 'translate-y-full opacity-0'
                                                    }`}>
                                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                                        {/* Tours and Price Section - Same as UpcomingTrips */}
                                                        <div className="flex items-start mb-2 gap-2">
                                                            {/* Tours Box */}
                                                            <div className="flex flex-col items-center">
                                                                <div className="text-[10px] font-bold text-white uppercase tracking-wider opacity-80 mb-1">
                                                                    TOURS
                                                                </div>
                                                                <div className="px-3 py-2">
                                                                    <div className="text-xl text-white font-bold text-center">
                                                                        {destination.tours}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Price Section */}
                                                            <div className="flex flex-col items-center">
                                                                <div className="text-center">
                                                                    <div className="text-[10px] font-bold text-white uppercase tracking-wider opacity-80">
                                                                        STARTING FROM
                                                                    </div>
                                                                </div>
                                                                <div className="px-3 py-2">
                                                                    <div className="text-center">
                                                                        <div className="text-xl font-bold text-white">
                                                                            {destination.price}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Bottom Section with Buttons */}
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => navigate(`/travel/${destination.id}?type=normal`)}
                                                                className="bg-transparent border border-white/40 text-white font-montserrat py-3 px-4 hover:bg-white/30 hover:border-white/40 transition-all duration-300 text-sm tracking-[0.2em]">
                                                                EXPLORE MORE
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Fill empty spaces in last row */}
                                    {row.length < 3 && Array.from({ length: 3 - row.length }).map((_, index) => (
                                        <div key={`empty-${index}`} className="hidden md:block"></div>
                                    ))}
                                </div>
                            ))}

                            {/* Show message if no destinations match filter */}
                            {filteredDestinations.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 text-lg">No destinations found matching your criteria.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Add Destination Modal with Yellow Theme */}
            {showAddDestinationForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
                    <div className="relative w-full max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-hidden animate-fadeIn">
                        <div className="h-full max-h-[90vh] overflow-y-auto">
                            {/* Yellow Transparent Container */}
                            <div className="bg-white/95 backdrop-blur-lg border border-yellow-200 shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden">
                                {/* Modal Header - Yellow Gradient */}
                                <div className="relative h-16 sm:h-20 md:h-24 bg-gradient-to-r from-yellow-400 to-yellow-500 border-b border-yellow-300">
                                    <div className="relative flex justify-between items-center h-full px-4 sm:px-6 md:px-8">
                                        <div>
                                            <h2 className="text-base sm:text-xl md:text-2xl font-bold text-black">{isEditing ? 'Edit Destination' : 'Add New Destination'}</h2>
                                            <p className="text-black/70 text-sm mt-1">{isEditing ? 'Update your travel package details' : 'Create your amazing travel destination'}</p>
                                        </div>
                                        <button
                                            onClick={() => setShowAddDestinationForm(false)}
                                            className="text-black/50 hover:text-black transition-colors bg-white/30 rounded-full p-2 hover:bg-white/50"
                                        >
                                            <FaTimes className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Form - Clean Light Theme */}
                                <form onSubmit={handleAddDestination} className="p-4 sm:p-6 md:p-8 lg:p-10">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                                        {/* Title */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Destination Title</label>
                                            <input
                                                type="text"
                                                name="title"
                                                value={newDestination.title}
                                                onChange={handleDestinationInputChange}
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                placeholder="Enter destination name"
                                                required
                                            />
                                        </div>

                                        {/* Duration */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Duration</label>
                                            <input
                                                type="text"
                                                name="duration"
                                                value={newDestination.duration}
                                                onChange={handleDestinationInputChange}
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                placeholder="e.g. 3-5 days"
                                                required
                                            />
                                        </div>

                                        {/* Price */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Price</label>
                                            <input
                                                type="text"
                                                name="price"
                                                value={newDestination.price}
                                                onChange={handleDestinationInputChange}
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                placeholder="e.g. ₹3,999"
                                                required
                                            />
                                        </div>

                                        {/* Tours */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Number of Tours</label>
                                            <input
                                                type="number"
                                                name="tours"
                                                value={newDestination.tours}
                                                onChange={handleDestinationInputChange}
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                placeholder="Enter number of tours"
                                                required
                                            />
                                        </div>

                                        {/* Difficulty */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Difficulty</label>
                                            <select
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all appearance-none"
                                                name="difficulty"
                                                value={newDestination.difficulty}
                                                onChange={handleDestinationInputChange}
                                                required
                                            >
                                                <option value="">Select Difficulty</option>
                                                <option value="Easy">Easy</option>
                                                <option value="Moderate">Moderate</option>
                                                <option value="Difficult">Difficult</option>
                                            </select>
                                        </div>

                                        {/* From Location */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">From Location</label>
                                            <input
                                                type="text"
                                                name="from_location"
                                                value={newDestination.from_location}
                                                onChange={handleDestinationInputChange}
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                placeholder="e.g. Kathmandu"
                                            />
                                        </div>

                                        {/* To Location */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">To Location</label>
                                            <input
                                                type="text"
                                                name="to_location"
                                                value={newDestination.to_location}
                                                onChange={handleDestinationInputChange}
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                placeholder="e.g. Pokhara"
                                            />
                                        </div>

                                        <div className="mb-4 md:col-span-2">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-bold text-gray-800">Itinerary Plan</h3>
                                                <button
                                                    type="button"
                                                    onClick={addItineraryDay}
                                                    className="bg-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-200 transition-all flex items-center gap-2"
                                                >
                                                    <FaPlus className="w-3 h-3" />
                                                    Add more another day plan
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {newDestination.itineraries.map((itin, index) => (
                                                    <div key={index} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 relative group">
                                                        {newDestination.itineraries.length > 1 && (
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
                                                                <h4 className="text-yellow-600 font-bold text-sm mb-3">Day {itin.day_number}</h4>
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

                                        {/* Max Group Size */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Max Group Size</label>
                                            <input
                                                type="number"
                                                name="max_group_size"
                                                value={newDestination.max_group_size}
                                                onChange={handleDestinationInputChange}
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                placeholder="e.g. 10"
                                            />
                                        </div>

                                        {/* Age Limit */}
                                        <div className="mb-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Age Limit</label>
                                            <input
                                                type="text"
                                                name="age_limit"
                                                value={newDestination.age_limit}
                                                onChange={handleDestinationInputChange}
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                placeholder="e.g. 18-60"
                                            />
                                        </div>

                                        {/* Image Upload */}
                                        <div className="mb-4 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Destination Image</label>
                                            <div className="flex flex-col items-center">
                                                <div className="w-full">
                                                    <label htmlFor="dest-image-upload" className="flex flex-col items-center justify-center w-full h-40 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:bg-yellow-50 hover:border-yellow-300 transition-all group">
                                                        <svg className="w-10 h-10 mb-2 text-gray-400 group-hover:text-yellow-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 9.9L15 13l-3-3a5 5 0 00-4.09-2.14zM12 12a3 3 0 100-6 3 3 0 000 6z" />
                                                        </svg>
                                                        <p className="text-gray-500 text-sm font-medium">Click to upload destination image</p>
                                                        <p className="text-gray-400 text-xs">PNG, JPG, GIF up to 10MB</p>
                                                    </label>
                                                    <input
                                                        id="dest-image-upload"
                                                        name="image"
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleDestinationImageUpload}
                                                        className="hidden"
                                                    />
                                                </div>
                                                {destinationImagePreview && (
                                                    <div className="mt-6 w-full">
                                                        <div className="relative w-full shadow-lg rounded-xl overflow-hidden" style={{ paddingTop: '66.67%' }}>
                                                            <img
                                                                src={destinationImagePreview}
                                                                alt="Preview"
                                                                className="absolute top-0 left-0 w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-gray-400 mt-2 text-center italic">Image Preview (3:2 Aspect Ratio)</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Overview */}
                                        <div className="mb-2 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Overview</label>
                                            <textarea
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                name="overview"
                                                value={newDestination.overview}
                                                onChange={handleDestinationInputChange}
                                                placeholder="e.g. A 7-day trek through the Himalayas"
                                                rows="3"
                                            />
                                        </div>

                                        {/* Things to Carry */}
                                        <div className="mb-2 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Things to Carry</label>
                                            <textarea
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                name="things_to_carry"
                                                value={newDestination.things_to_carry}
                                                onChange={handleDestinationInputChange}
                                                placeholder="e.g. Jacket, Boots, Snacks"
                                                rows="3"
                                            />
                                        </div>

                                        {/* Highlights */}
                                        <div className="mb-4 md:col-span-2">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Highlights (comma separated)</label>
                                            <textarea
                                                className="w-full py-3 px-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10 transition-all placeholder-gray-400"
                                                name="highlights"
                                                value={newDestination.highlights}
                                                onChange={handleDestinationInputChange}
                                                placeholder="e.g. River rafting, Rock climbing, Mountain biking"
                                                rows="3"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Form Actions */}
                                    <div className="flex justify-end mt-10 gap-4 pt-8 border-t border-gray-100">
                                        <button
                                            type="button"
                                            className="px-8 py-3 text-gray-600 font-bold hover:text-black hover:bg-gray-100 rounded-xl transition-all"
                                            onClick={() => setShowAddDestinationForm(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-10 rounded-xl transition-all shadow-xl hover:shadow-yellow-500/20 active:scale-95"
                                        >
                                            {isEditing ? 'Update Destination' : 'Add Destination'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add custom CSS for animations */}
            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                
                /* Custom scrollbar for modal */
                ::-webkit-scrollbar {
                    width: 8px;
                }
                
                ::-webkit-scrollbar-track {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 4px;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: rgba(75, 85, 99, 0.6);
                    border-radius: 4px;
                }
                
                ::-webkit-scrollbar-thumb:hover {
                    background: rgba(75, 85, 99, 0.8);
                }
            `}</style>
        </section>
    );
};
export default ExploreWithUs;
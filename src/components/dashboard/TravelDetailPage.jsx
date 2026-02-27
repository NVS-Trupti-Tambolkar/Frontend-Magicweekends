import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import api from '../../services/Axios';
import { FaStar, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaUsers, FaCheck, FaArrowLeft, FaShareAlt, FaHeart, FaPhone, FaEnvelope, FaFacebook, FaInstagram, FaTwitter, FaArrowRight, FaArrowLeft as FaLeftArrow, FaExpand, FaTimes, FaUtensils, FaBed, FaEdit, FaChevronUp, FaChevronDown, FaPlus, FaTrash } from 'react-icons/fa';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import { PageLoader, OverlayLoader } from '../common/LoadingSpinner';
import BookingForm from '../booking/BookingForm';

const TravelDetailPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLiked, setIsLiked] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [travelerCount, setTravelerCount] = useState(2);
  const [allTrips, setAllTrips] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryBlobs, setGalleryBlobs] = useState({});
  const [editingItinerary, setEditingItinerary] = useState(null);
  const [showItineraryModal, setShowItineraryModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('Saving...');

  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tripType = searchParams.get('type') || 'normal';

  const [loading, setLoading] = useState(true);
  const [travelPackage, setTravelPackage] = useState(null);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        setLoading(true);
        // Fetch trip details based on type
        const tripEndpoint = tripType === 'weekend'
          ? `/WeekendTrip/getWeekendTripById?id=${id}`
          : `/Trip/getTripById?id=${id}`;

        const response = await api.get(tripEndpoint);

        if (response.data.success) {
          const tripData = response.data.data;

          let imageUrl = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

          // Use Cloudinary URL directly
          if (tripData.uploadimage) {
            imageUrl = tripData.uploadimage;
          }

          // Fetch itineraries from API
          let itineraryData = [];
          try {
            const itinResp = await api.get(`/Itinerary/getItinerariesByTrip?trip_id=${id}&type=${tripType}`);
            if (itinResp.data.success && itinResp.data.data.length > 0) {
              itineraryData = itinResp.data.data.map(item => ({
                day: item.day_number,
                date: `Day ${item.day_number}`,
                title: item.day_title || `Day ${item.day_number}`,
                activities: item.activities ? item.activities.split(',').map(a => a.trim()) : [],
                meals: item.meals || '',
                accommodation: item.accommodation || '',
                description: item.description || ''
              }));
            }
          } catch (itinErr) {
            console.error('Error fetching itineraries:', itinErr);
          }

          // Fallback if no itineraries found
          if (itineraryData.length === 0) {
            itineraryData = [
              {
                day: 1,
                date: 'Day 1',
                title: 'Arrival and Briefing',
                activities: ['Arrival at base camp', 'Welcome briefing', 'Dinner'],
                meals: 'Dinner',
                accommodation: 'Hotel/Camp'
              }
            ];
          }

          // Construct the package object merging API data with static fallbacks
          setTravelPackage({
            id: tripData.id,
            title: tripData.title,
            subtitle: tripData.duration ? `${tripData.duration} Adventure` : 'Adventure',
            category: tripType === 'weekend' ? 'Weekend Getaway' : 'Popular Tour',
            price: typeof tripData.price === 'string' ? parseInt(tripData.price.replace(/[^0-9]/g, '')) : tripData.price || 0,
            originalPrice: (typeof tripData.price === 'string' ? parseInt(tripData.price.replace(/[^0-9]/g, '')) : tripData.price || 0) * 1.2,
            discount: 20,
            rating: 4.7,
            reviews: 127,
            duration: tripData.duration,
            difficulty: tripData.difficulty,
            groupSize: `${tripData.max_group_size || '15'} People`,
            departure: tripData.from_location,
            images: [imageUrl],
            overview: tripData.overview,
            highlights: tripData.highlights ? tripData.highlights.split(',').map(h => h.trim()) : [],
            itinerary: itineraryData,
            inclusions: [
              'Professional guide',
              'Accommodation',
              'Meals',
              'First Aid'
            ],
            exclusions: [
              'Personal expenses',
              'Travel insurance'
            ],
            thingsToCarry: tripData.things_to_carry ? tripData.things_to_carry.split(',').map(t => t.trim()) : ['Safe shoes', 'Water bottle'],
            reviewsList: [],
            faqs: [
              {
                question: 'Is previous experience required?',
                answer: 'Depends on the difficulty level. Please check the difficulty rating.'
              }
            ]
          });
        }
      } catch (error) {
        console.error('Error fetching trip details:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchGallery = async () => {
      try {
        const response = await api.get(`/Gallery/getGalleriesByTripId?trip_id=${id}`);
        if (response.data.success) {
          const images = response.data.data;
          setGalleryImages(images);

          // Use Cloudinary URLs directly
          images.forEach((img) => {
            if (img.image_url) {
              setGalleryBlobs(prev => ({ ...prev, [img.image_url]: img.image_url }));
            }
          });
        }
      } catch (err) {
        console.error('Error fetching gallery:', err);
      }
    };

    // Fetch all trips for the sidebar slider
    const fetchAllTrips = async () => {
      try {
        const [normalTripsDist, weekendTripsDist] = await Promise.all([
          api.get('/Trip/getTrips'),
          api.get('/WeekendTrip/getWeekendallTrips')
        ]);

        let combinedTrips = [];

        if (normalTripsDist.data.success) {
          combinedTrips = [...combinedTrips, ...normalTripsDist.data.data.map(t => ({ ...t, type: 'normal' }))];
        }
        if (weekendTripsDist.data.success) {
          combinedTrips = [...combinedTrips, ...weekendTripsDist.data.data.map(t => ({ ...t, type: 'weekend' }))];
        }

        // Filter out current trip
        const filteredTrips = combinedTrips.filter(t => t.id.toString() !== id);
        setAllTrips(filteredTrips);

      } catch (error) {
        console.error("Error fetching all trips for slider:", error);
      }
    };

    if (id) {
      fetchTripDetails();
      fetchGallery();
      fetchAllTrips();
    }

    return () => {
      // Cleanup gallery blobs
      Object.values(galleryBlobs).forEach(url => URL.revokeObjectURL(url));
      // Cleanup main trip images
      if (travelPackage && travelPackage.images) {
        travelPackage.images.forEach(url => {
          if (url && url.startsWith('blob:')) {
            URL.revokeObjectURL(url);
          }
        });
      }
    };
  }, [id, tripType]); // Added tripType to dependencies

  if (loading) {
    return <PageLoader message="Loading trip details..." />;
  }

  if (!travelPackage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-gray-600">Trip not found</div>
      </div>
    );
  }

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: travelPackage.title,
        text: `Check out this amazing travel package: ${travelPackage.title}`,
        url: window.location.href
      });
    }
  };

  const handleBookNow = () => {
    setShowBookingForm(true);
  };

  const handleNextImage = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === (travelPackage.images.length + galleryImages.length) - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prevIndex) =>
      prevIndex === 0 ? (travelPackage.images.length + galleryImages.length) - 1 : prevIndex - 1
    );
  };

  const openLightbox = (index) => {
    setLightboxImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightboxImage = () => {
    setLightboxImageIndex((prevIndex) =>
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevLightboxImage = () => {
    setLightboxImageIndex((prevIndex) =>
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
  };

  const handleEditItinerary = (day) => {
    setEditingItinerary(day);
    setShowItineraryModal(true);
  };

  const handleAddItinerary = () => {
    const nextDay = travelPackage.itinerary.length + 1;
    setEditingItinerary({
      id: null,
      day: nextDay,
      title: '',
      description: '',
      activities: [],
      meals: '',
      accommodation: ''
    });
    setShowItineraryModal(true);
  };

  const handleItineraryUpdate = async (updatedItinerary) => {
    try {
      setUpdating(true);
      setUpdateMessage(updatedItinerary.itinerary_id ? 'Updating Itinerary...' : 'Adding Itinerary...');

      let response;
      if (updatedItinerary.itinerary_id) {
        // Update existing
        response = await api.put('/Itineraries/updateItinerary', updatedItinerary);
      } else {
        // Add new
        response = await api.post('/Itineraries/insertItineraries', {
          trip_id: id,
          trip_type: tripType,
          itineraries: [{
            day_number: updatedItinerary.day_number,
            day_title: updatedItinerary.day_title,
            description: updatedItinerary.description,
            meals: updatedItinerary.meals,
            accommodation: updatedItinerary.accommodation,
            activities: Array.isArray(updatedItinerary.activities) ? updatedItinerary.activities.join(', ') : updatedItinerary.activities
          }]
        });
      }

      if (response.data.success) {
        // Re-fetch trip details to update the UI without full reload
        const tripEndpoint = tripType === 'weekend'
          ? `/WeekendTrip/getWeekendTripById?id=${id}`
          : `/Trip/getTripById?id=${id}`;

        const tripResp = await api.get(tripEndpoint);
        if (tripResp.data.success) {
          const tripData = tripResp.data.data;

          // Re-fetch itineraries
          const itinResp = await api.get(`/Itinerary/getItinerariesByTrip?trip_id=${id}&type=${tripType}`);
          if (itinResp.data.success) {
            const updatedItinData = itinResp.data.data.map(item => ({
              id: item.itinerary_id,
              day: item.day_number,
              date: `Day ${item.day_number}`,
              title: item.day_title || `Day ${item.day_number}`,
              activities: item.activities ? item.activities.split(',').map(a => a.trim()) : [],
              meals: item.meals || '',
              accommodation: item.accommodation || '',
              description: item.description || ''
            }));

            setTravelPackage(prev => ({
              ...prev,
              itinerary: updatedItinData
            }));
          }
        }

        setShowItineraryModal(false);
        setEditingItinerary(null);
      }
    } catch (error) {
      console.error('Error saving itinerary:', error);
      alert('Failed to save itinerary.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteItinerary = async (itineraryId) => {
    if (window.confirm('Are you sure you want to delete this itinerary day?')) {
      try {
        setUpdating(true);
        setUpdateMessage('Deleting Itinerary...');
        const response = await api.delete(`/Itineraries/deleteItinerary?itinerary_id=${itineraryId}`);
        if (response.data.success) {
          // Update local state instead of reload
          setTravelPackage(prev => ({
            ...prev,
            itinerary: prev.itinerary.filter(item => item.id !== itineraryId)
          }));
        }
      } catch (error) {
        console.error('Error deleting itinerary:', error);
        alert('Failed to delete itinerary.');
      } finally {
        setUpdating(false);
      }
    }
  };

  // Render star rating component
  const StarRating = ({ rating }) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < Math.floor(rating) ? 'text-yellow-500' : 'text-gray-300'} />
        ))}
      </div>
    );
  };

  // Render review item component
  const ReviewItem = ({ review }) => {
    return (
      <div className="border-b pb-6">
        <div className="flex items-start mb-3">
          <img
            src={review.avatar}
            alt={review.name}
            className="w-12 h-12 rounded-full mr-4 object-cover"
          />
          <div className="flex-grow">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-medium text-gray-900">{review.name}</h4>
              <span className="text-sm text-gray-600">{review.date}</span>
            </div>
            <div className="flex mb-2">
              <StarRating rating={review.rating} />
            </div>
            <p className="text-gray-700">{review.comment}</p>
          </div>
        </div>
      </div>
    );
  };

  // Render FAQ item component
  const FAQItem = ({ faq }) => {
    return (
      <div className="border-b pb-4">
        <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
        <p className="text-gray-700">{faq.answer}</p>
      </div>
    );
  };

  // Render itinerary day component
  const ItineraryDay = ({ day }) => {
    return (
      <div className="border-l-2 border-yellow-500 pl-4 pb-6 relative last:pb-0">
        <div className="absolute w-3 h-3 bg-yellow-500 rounded-full -left-[7px] top-3"></div>
        <div className="flex justify-between items-start mb-1">
          <div className="flex flex-col">
            <span className="text-yellow-600 font-bold text-xs tracking-widest uppercase">Day {day.day}</span>
            <h4 className="text-base font-bold text-gray-900">{day.title}</h4>
          </div>
          <div className="flex gap-2">
            <button
              className="text-gray-400 hover:text-yellow-600 transition-colors p-1"
              title="Edit Itinerary"
              onClick={() => handleEditItinerary(day)}
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              className="text-gray-400 hover:text-red-600 transition-colors p-1"
              title="Delete Itinerary"
              onClick={() => handleDeleteItinerary(day.id)}
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-xs mb-2">{Array.isArray(day.activities) ? day.activities.join(' • ') : day.activities}</p>
        <div className="flex gap-4 text-[10px] text-gray-500">
          {day.meals && <span className="flex items-center"><FaUtensils className="mr-1 text-yellow-500" /> {day.meals}</span>}
          {day.accommodation && <span className="flex items-center"><FaBed className="mr-1 text-yellow-500" /> {day.accommodation}</span>}
        </div>
      </div>
    );
  };

  const incrementTravelers = () => setTravelerCount(prev => prev + 1);
  const decrementTravelers = () => setTravelerCount(prev => prev > 1 ? prev - 1 : 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header scrolled={true} />
      {updating && <OverlayLoader message={updateMessage} />}

      {/* Hero Section with Image Gallery */}
      <section className="relative h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={travelPackage.images[activeImageIndex]}
            alt={travelPackage.title}
            className="w-full h-full object-cover transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-end">
          <div className="w-full px-4 md:px-8 lg:px-12 pb-12">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center mb-2 sm:mb-3 gap-2">
                <span className="bg-yellow-500 text-gray-900 text-[10px] sm:text-xs font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
                  {travelPackage.category}
                </span>
                <div className="flex items-center text-white">
                  <FaStar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 mr-1 sm:mr-2" />
                  <span className="text-sm sm:text-lg font-semibold mr-1">{travelPackage.rating}</span>
                  <span className="text-gray-300 text-xs sm:text-base">({travelPackage.reviews} reviews)</span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-4 leading-tight">
                {travelPackage.title}
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 mb-4 sm:mb-6 lg:mb-8">{travelPackage.subtitle}</p>
              <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 lg:gap-6 text-white">
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg">
                  <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3 text-yellow-400" />
                  <div>
                    <div className="text-[10px] sm:text-xs md:text-sm opacity-80">Duration</div>
                    <div className="text-xs sm:text-sm md:text-base font-semibold">{travelPackage.duration}</div>
                  </div>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg">
                  <FaMapMarkerAlt className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3 text-yellow-400" />
                  <div>
                    <div className="text-[10px] sm:text-xs md:text-sm opacity-80">Departure From</div>
                    <div className="text-xs sm:text-sm md:text-base font-semibold">{travelPackage.departure}</div>
                  </div>
                </div>
                <div className="flex items-center bg-white/20 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg">
                  <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 mr-2 sm:mr-3 text-yellow-400" />
                  <div>
                    <div className="text-[10px] sm:text-xs md:text-sm opacity-80">Group Size</div>
                    <div className="text-xs sm:text-sm md:text-base font-semibold">{travelPackage.groupSize}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Image Navigation */}

      </section>

      {/* Main Content */}
      <div className="w-full px-2 sm:px-4 py-4 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-20 gap-4 sm:gap-6">
          {/* Left Column - Main Content (Tabs) - 55% on desktop, full on mobile */}
          <div className="md:col-span-1 lg:col-span-11">
            {/* Tabs Navigation */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl mb-4 sm:mb-6 overflow-hidden border border-gray-100">
              <div className="flex overflow-x-auto border-b bg-gradient-to-r from-gray-50 to-white scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${activeTab === 'overview' ? 'text-yellow-600 border-b-2 border-yellow-500 bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${activeTab === 'itinerary' ? 'text-yellow-600 border-b-2 border-yellow-500 bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('itinerary')}
                >
                  Itinerary
                </button>
                <button
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${activeTab === 'gallery' ? 'text-yellow-600 border-b-2 border-yellow-500 bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('gallery')}
                >
                  Gallery
                </button>
                <button
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${activeTab === 'inclusions' ? 'text-yellow-600 border-b-2 border-yellow-500 bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('inclusions')}
                >
                  Inclusions & Exclusions
                </button>
                <button
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${activeTab === 'reviews' ? 'text-yellow-600 border-b-2 border-yellow-500 bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('reviews')}
                >
                  Reviews
                </button>
                <button
                  className={`px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium transition-all whitespace-nowrap ${activeTab === 'faqs' ? 'text-yellow-600 border-b-2 border-yellow-500 bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                  onClick={() => setActiveTab('faqs')}
                >
                  FAQs
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-3 sm:p-4 md:p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Overview</h3>
                    <p className="text-gray-700 mb-6 text-sm leading-relaxed">{travelPackage.overview}</p>

                    <h3 className="text-lg font-bold text-gray-900 mb-4">Highlights</h3>
                    <ul className="space-y-4 mb-8">
                      {travelPackage.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start bg-gradient-to-r from-green-50 to-white p-3 rounded-xl">
                          <FaCheck className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 text-sm">{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-lg font-bold text-gray-900 mb-4">Things to Carry</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {travelPackage.thingsToCarry.map((item, index) => (
                        <li key={index} className="flex items-center bg-gradient-to-r from-blue-50 to-white p-3 rounded-xl">
                          <FaCheck className="w-4 h-4 text-blue-500 mr-2" />
                          <span className="text-gray-700 text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Itinerary Tab */}
                {activeTab === 'itinerary' && (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-900">Itinerary</h3>
                      <button
                        onClick={handleAddItinerary}
                        className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all"
                      >
                        <FaPlus className="w-3 h-3" />
                        Add Day
                      </button>
                    </div>
                    <div className="">
                      {travelPackage.itinerary.map((day, index) => (
                        <ItineraryDay key={index} day={day} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Gallery Tab */}
                {activeTab === 'gallery' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Photo Gallery</h3>
                    {galleryImages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {galleryImages.map((img, index) => (
                          <div key={img.id} className="relative group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                            {galleryBlobs[img.image_url] ? (
                              <img
                                src={galleryBlobs[img.image_url]}
                                alt={img.image_title || `Gallery ${index + 1}`}
                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            ) : (
                              <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                                <div className="w-8 h-8 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <button
                                onClick={() => {
                                  setLightboxImageIndex(index);
                                  setLightboxOpen(true);
                                }}
                                className="bg-white/90 backdrop-blur-sm text-gray-900 p-2 rounded-full hover:bg-white transition-all"
                              >
                                <FaExpand className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">No gallery photos added yet for this trip.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Inclusions & Exclusions Tab */}
                {activeTab === 'inclusions' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="bg-green-100 text-green-800 p-1.5 rounded-lg mr-2">✓</span>
                        Inclusions
                      </h3>
                      <ul className="space-y-2">
                        {travelPackage.inclusions.map((item, index) => (
                          <li key={index} className="flex items-center bg-green-50 p-3 rounded-xl">
                            <FaCheck className="w-4 h-4 text-green-500 mr-2" />
                            <span className="text-gray-700 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span className="bg-red-100 text-red-800 p-1.5 rounded-lg mr-2">✗</span>
                        Exclusions
                      </h3>
                      <ul className="space-y-2">
                        {travelPackage.exclusions.map((item, index) => (
                          <li key={index} className="flex items-center bg-red-50 p-3 rounded-xl">
                            <span className="w-4 h-4 text-red-500 mr-2 flex items-center justify-center">
                              <span className="text-base">×</span>
                            </span>
                            <span className="text-gray-700 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Reviews Tab */}
                {activeTab === 'reviews' && (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 p-6 bg-gradient-to-r from-yellow-50 to-white rounded-2xl">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 md:mb-0">Customer Reviews</h3>
                      <div className="flex items-center">
                        <StarRating rating={travelPackage.rating} />
                        <span className="font-bold text-xl ml-2">{travelPackage.rating}</span>
                        <span className="text-gray-600 text-sm ml-2">({travelPackage.reviews} reviews)</span>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {travelPackage.reviewsList.map((review) => (
                        <ReviewItem key={review.id} review={review} />
                      ))}
                    </div>

                    <button className="mt-8 w-full py-4 bg-gradient-to-r from-gray-100 to-white text-gray-800 hover:from-gray-200 hover:to-gray-100 font-bold rounded-xl transition-all duration-300 border border-gray-200">
                      Load more reviews
                    </button>
                  </div>
                )}

                {/* FAQs Tab */}
                {activeTab === 'faqs' && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                      {travelPackage.faqs.map((faq, index) => (
                        <div key={index} className="bg-gradient-to-r from-purple-50 to-white p-6 rounded-2xl">
                          <FAQItem faq={faq} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Middle Column - Booking Info - 30% */}
          <div className="md:col-span-1 lg:col-span-6">
            {/* Booking Card - Moved to top */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-5 mb-4 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div className="mb-4 md:mb-0">
                  <div className="flex items-baseline mb-1">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">₹{travelPackage.price.toLocaleString()}</span>
                  </div>
                  <p className="text-gray-600">Per person</p>
                </div>
                <button
                  onClick={handleBookNow}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900 font-bold py-3 sm:py-4 px-6 sm:px-10 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  Book Now
                </button>
              </div>
              {/* <div className="flex flex-wrap gap-6 text-sm text-gray-600 border-t border-gray-100 pt-6">
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                    <FaCalendarAlt className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Duration</div>
                    <div>{travelPackage.duration}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                    <FaClock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Difficulty</div>
                    <div>{travelPackage.difficulty}</div>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                    <FaUsers className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Group Size</div>
                    <div>{travelPackage.groupSize}</div>
                  </div>
                </div>
              </div> */}
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-5 sticky top-28 border border-gray-100">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">Book This Package</h3>

              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">Travel Date</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all text-sm"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-3">Number of Travelers</label>
                <div className="flex items-center bg-gray-50 rounded-xl p-1">
                  <button
                    onClick={decrementTravelers}
                    className="bg-white hover:bg-gray-100 text-gray-700 w-12 h-12 rounded-lg flex items-center justify-center shadow-sm transition-all"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={travelerCount}
                    readOnly
                    className="flex-grow text-center text-xl font-bold border-none bg-transparent focus:outline-none"
                  />
                  <button
                    onClick={incrementTravelers}
                    className="bg-white hover:bg-gray-100 text-gray-700 w-12 h-12 rounded-lg flex items-center justify-center shadow-sm transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mb-6 bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl">
                <h4 className="font-bold text-sm text-gray-900 mb-3">Price Breakdown</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Package Price</span>
                    <span className="font-medium">₹{travelPackage.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Number of Travelers</span>
                    <span className="font-medium">{travelerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Subtotal</span>
                    <span className="font-medium">₹{(travelPackage.price * travelerCount).toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-base text-gray-900">Total</span>
                      <span className="font-bold text-xl text-gray-900">₹{(travelPackage.price * travelerCount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-gray-900 font-bold py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl mb-6"
              >
                Book Now
              </button>

              <p className="text-xs text-gray-600 text-center">
                By clicking "Book Now", you agree to our Terms & Conditions and Privacy Policy.
              </p>
            </div>
          </div>

          {/* Right Column - Slider */}
          <div className="md:col-span-2 lg:col-span-3">
            <SidebarSlider allTrips={allTrips} />
          </div>
        </div>
      </div>

      {/* Lightbox for Gallery */}
      {showItineraryModal && editingItinerary && (
        <ItineraryEditModal
          itinerary={editingItinerary}
          onClose={() => {
            setShowItineraryModal(false);
            setEditingItinerary(null);
          }}
          onUpdate={handleItineraryUpdate}
        />
      )}

      {lightboxOpen && galleryImages.length > 0 && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <button
            onClick={closeLightbox}
            className="absolute top-8 right-8 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition-all z-[60]"
          >
            <FaTimes className="w-8 h-8" />
          </button>

          <button
            onClick={prevLightboxImage}
            className="absolute left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all z-[60]"
          >
            <FaLeftArrow className="w-8 h-8" />
          </button>

          <button
            onClick={nextLightboxImage}
            className="absolute right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all z-[60]"
          >
            <FaArrowRight className="w-8 h-8" />
          </button>

          <div className="relative group max-w-[90vw] max-h-[85vh]">
            <img
              src={galleryBlobs[galleryImages[lightboxImageIndex]?.image_url]}
              alt={galleryImages[lightboxImageIndex]?.image_title || `Gallery View`}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-[0_0_80px_rgba(0,0,0,0.6)]"
            />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full text-white/80 text-sm font-medium border border-white/10">
              {lightboxImageIndex + 1} / {galleryImages.length}
            </div>
          </div>
        </div>
      )}

      {/* Booking Form Modal */}
      <BookingForm
        isOpen={showBookingForm}
        onClose={() => setShowBookingForm(false)}
        tripData={travelPackage}
        tripType={tripType}
      />

      <Footer />
    </div>
  );
};

const SidebarSlider = ({ allTrips }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);

  const scrollUp = () => {
    if (scrollRef.current) {
      // On mobile scroll left, on desktop scroll up
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        scrollRef.current.scrollBy({ top: -150, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      }
    }
  };

  const scrollDown = () => {
    if (scrollRef.current) {
      const isDesktop = window.innerWidth >= 1024;
      if (isDesktop) {
        scrollRef.current.scrollBy({ top: 150, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 border border-gray-100 h-auto lg:h-[calc(100vh-100px)] lg:sticky lg:top-24 overflow-hidden relative">
      <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-3 lg:hidden">More Trips</h3>

      {/* Up/Left Arrow */}
      <button
        onClick={scrollUp}
        className="hidden lg:flex absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-white/90 hover:bg-yellow-100 text-gray-600 hover:text-yellow-600 rounded-full p-1.5 shadow-md border border-gray-200 transition-all items-center justify-center"
        title="Scroll Up"
      >
        <FaChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      {/* Mobile: Left Arrow */}
      <button
        onClick={scrollUp}
        className="lg:hidden absolute left-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-yellow-100 text-gray-600 hover:text-yellow-600 rounded-full p-1 sm:p-1.5 shadow-md border border-gray-200 transition-all"
        title="Scroll Left"
      >
        <FaArrowLeft className="w-3 h-3" />
      </button>

      {/* Scrollable Content - horizontal on mobile, vertical on desktop */}
      <div
        ref={scrollRef}
        className="flex lg:flex-col gap-3 sm:gap-4 overflow-x-auto lg:overflow-x-hidden lg:overflow-y-auto lg:animate-vertical-scroll lg:h-full pt-0 lg:pt-8 pb-0 lg:pb-8 px-6 lg:px-0 lg:hover-pause-scroll scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allTrips && [...allTrips, ...allTrips].map((trip, index) => (
          <div key={`${trip.id}-${index}`} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[180px] lg:w-full">
            <SliderItem trip={trip} navigate={navigate} />
          </div>
        ))}
      </div>

      {/* Desktop: Down Arrow */}
      <button
        onClick={scrollDown}
        className="hidden lg:flex absolute bottom-2 left-1/2 -translate-x-1/2 z-10 bg-white/90 hover:bg-yellow-100 text-gray-600 hover:text-yellow-600 rounded-full p-1.5 shadow-md border border-gray-200 transition-all items-center justify-center"
        title="Scroll Down"
      >
        <FaChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
      </button>

      {/* Mobile: Right Arrow */}
      <button
        onClick={scrollDown}
        className="lg:hidden absolute right-1 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-yellow-100 text-gray-600 hover:text-yellow-600 rounded-full p-1 sm:p-1.5 shadow-md border border-gray-200 transition-all"
        title="Scroll Right"
      >
        <FaArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
};

const SliderItem = ({ trip, navigate }) => {
  // Use Cloudinary URL directly
  const imageUrl = trip.uploadimage || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop';

  return (
    <div
      className="cursor-pointer group"
      onClick={() => {
        navigate(`/travel/${trip.id}?type=${trip.type}`);
        window.scrollTo(0, 0);
      }}
    >
      <div className="relative h-24 rounded-lg overflow-hidden mb-2">
        <img
          src={imageUrl}
          alt={trip.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop'; }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors"></div>
      </div>
      <h4 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-yellow-600 transition-colors">{trip.title}</h4>
      <p className="text-yellow-600 font-bold text-xs">₹{trip.price}</p>
    </div>
  );
};

const ItineraryEditModal = ({ itinerary, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    id: itinerary.id || '', // Provided ID might be missing if it's from fallback, but here we expect real data
    day_number: itinerary.day,
    day_title: itinerary.title,
    description: itinerary.description,
    meals: itinerary.meals,
    accommodation: itinerary.accommodation,
    activities: itinerary.activities.join(', ')
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({
      ...formData,
      // Ensure activities is formatted correctly if backend expects string or array. 
      // Based on WeekendTrips it seems form sends singular inputs but logic implies struct.
      // Let's assume backend takes these fields directly as maintained in formData.
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[100] p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-[95vw] sm:max-w-lg overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-3 sm:p-4 border-b border-yellow-300 flex justify-between items-center">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">{formData.id ? 'Edit' : 'Add'} Itinerary Day {formData.day_number}</h3>
          <button onClick={onClose} className="text-black/50 hover:text-black bg-white/30 rounded-full p-1 transition-colors">
            <FaTimes />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Day Title</label>
            <input
              type="text"
              name="day_title"
              value={formData.day_title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all text-sm"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Activities</label>
            <input
              type="text"
              name="activities"
              value={formData.activities}
              onChange={handleChange}
              placeholder="e.g. Hiking, Sightseeing (comma separated)"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Meals</label>
              <input
                type="text"
                name="meals"
                value={formData.meals}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Accommodation</label>
              <input
                type="text"
                name="accommodation"
                value={formData.accommodation}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 transition-all text-sm"
              />
            </div>
          </div>
          <div className="pt-3 sm:pt-4 flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 shadow-md transition-all transform hover:scale-105"
            >
              {formData.id ? 'Update Itinerary' : 'Add Itinerary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TravelDetailPage;

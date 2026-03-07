import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../services/Axios';
import { PageLoader } from '../common/LoadingSpinner';

const UpcomingTrips = ({ onLoad }) => {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState(null);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const scrollContainerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [cardWidth, setCardWidth] = useState(0);

    // Filter Logic for Upcoming Trips
    const filterUpcomingTrips = (normalTrips, weekendTrips) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const fourDaysFromNow = new Date(today);
        fourDaysFromNow.setDate(today.getDate() + 4);

        // 1. Filter Normal Trips: Show if trip_date or any departure_date is >= 4 days from now
        const upcomingNormal = normalTrips.filter(trip => {
            // Check departure_dates first
            const hasFutureDate = (trip.departure_dates || []).some(dateStr => {
                const d = new Date(dateStr);
                return d >= fourDaysFromNow;
            });

            if (hasFutureDate) return true;

            // Fallback to legacy trip_date
            if (!trip.trip_date) return false;
            const tripDate = new Date(trip.trip_date);
            return tripDate >= fourDaysFromNow;
        }).map(trip => ({
            ...trip,
            type: 'normal',
            image: trip.uploadimage || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
        }));

        // 2. Filter Weekend Trips: Show if:
        //    a) ANY specific departure_date is in the future
        //    b) available_day is within 3 days BEFORE the day OR on the day
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const windowDays = [];
        for (let i = 0; i <= 3; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            windowDays.push(daysOfWeek[d.getDay()]);
        }

        const upcomingWeekend = weekendTrips.filter(trip => {
            // Priority A: Check specific departure_dates first
            const hasFutureDate = (trip.departure_dates || []).some(dateStr => {
                const d = new Date(dateStr);
                return d >= today; // Show if any date is today or future
            });

            if (hasFutureDate) return true;

            // Priority B: Check Available Days logic (e.g. Sat show from Wed)
            if (!trip.available_days) return false;
            const availableArray = trip.available_days.split(',').map(d => d.trim());
            return availableArray.some(day => windowDays.includes(day));
        }).map(trip => ({
            ...trip,
            type: 'weekend',
            image: trip.uploadimage || 'https://images.unsplash.com/photo-1542332213-9b5a5a3faa35?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
        }));

        return [...upcomingNormal, ...upcomingWeekend];
    };

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [normalRes, weekendRes] = await Promise.all([
                api.get('/Trip/getTrips'),
                api.get('/WeekendTrip/getWeekendallTrips')
            ]);

            if (normalRes.data.success && weekendRes.data.success) {
                const combined = filterUpcomingTrips(normalRes.data.data, weekendRes.data.data);
                setTrips(combined);
            }
        } catch (error) {
            console.error("Error fetching upcoming trips:", error);
        } finally {
            // Add a small delay for smoother transition
            setTimeout(() => {
                setLoading(false);
                if (onLoad) onLoad();
            }, 500);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    // Detect if device is mobile and calculate card width
    useEffect(() => {
        const checkDevice = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);

            // Calculate card width based on viewport
            if (width < 640) { // Mobile
                setCardWidth(width * 0.75);
            } else if (width < 768) { // Small tablet
                setCardWidth(width * 0.55);
            } else if (width < 1024) { // Medium tablet
                setCardWidth(width * 0.40);
            } else if (width < 1280) { // Large tablet
                setCardWidth(width * 0.33);
            } else { // Desktop
                setCardWidth(width * 0.28);
            }
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

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

    const handleTouchStart = (e) => {
        if (isMobile) setHoveredCard(e.currentTarget.id);
    };

    const handleTouchEnd = () => {
        if (isMobile) setTimeout(() => setHoveredCard(null), 1000);
    };

    const handleCardClick = (trip) => {
        navigate(`/travel/${trip.id}?type=${trip.type}`);
    };

    if (loading && !onLoad) return <PageLoader />;

    if (trips.length === 0) return null;

    return (
        <section className="py-8 sm:py-12 px-4 sm:px-6 md:px-12 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-8xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center md:text-left mb-4 md:mb-0 text-gray-800 relative">
                        <span className="relative z-10 uppercase">Upcoming Adventures</span>
                        <span className="absolute bottom-0 left-0 w-full h-3 bg-yellow-200 opacity-50 -z-10 transform -rotate-1"></span>
                    </h2>
                </div>

                <div className="relative px-4 sm:px-6 md:px-8">
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 sm:left-2 top-1/2 transform -translate-y-1/2 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 rounded-full p-1.5 sm:p-2 shadow-md sm:shadow-lg"
                        aria-label="Scroll left"
                    >
                        <FaChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
                    </button>

                    <button
                        onClick={scrollRight}
                        className="absolute right-0 sm:right-2 top-1/2 transform -translate-y-1/2 z-10 text-gray-600 hover:text-gray-800 transition-all duration-300 bg-white/80 rounded-full p-1.5 sm:p-2 shadow-md sm:shadow-lg"
                        aria-label="Scroll right"
                    >
                        <FaChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {trips.map((trip) => (
                            <div
                                key={`${trip.type}-${trip.id}`}
                                id={`${trip.type}-${trip.id}`}
                                className="flex-shrink-0 w-[75vw] sm:w-[calc(55%-0.5rem)] md:w-[calc(40%-0.5rem)] lg:w-[calc(33%-0.5rem)] xl:w-[calc(28%-0.5rem)] max-w-[380px] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 rounded-xl"
                                onMouseEnter={() => !isMobile && setHoveredCard(`${trip.type}-${trip.id}`)}
                                onMouseLeave={() => !isMobile && setHoveredCard(null)}
                                onClick={() => handleCardClick(trip)}
                            >
                                <div className="relative overflow-hidden" style={{ paddingTop: '66.67%' }}>
                                    <img
                                        src={trip.image}
                                        alt={trip.title}
                                        className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                                    <div className={`absolute bottom-0 left-0 w-full px-6 py-4 transition-all duration-500 ${hoveredCard === `${trip.type}-${trip.id}`
                                        ? 'translate-y-[-120px] opacity-100'
                                        : 'opacity-100'
                                        }`}>
                                        <div className="inline-block px-2 py-0.5 bg-yellow-500 text-gray-900 text-[10px] font-bold rounded mb-1 uppercase tracking-wider">
                                            {trip.duration || 'Adventure'}
                                        </div>
                                        <h3 className="text-lg font-bold text-white line-clamp-2">{trip.title}</h3>
                                    </div>

                                    <div className={`absolute inset-0 transition-all duration-500 transform bg-black/40 backdrop-blur-[2px] ${hoveredCard === `${trip.type}-${trip.id}`
                                        ? 'translate-y-0 opacity-100'
                                        : 'translate-y-full opacity-0'
                                        }`}>
                                        <div className="absolute inset-0 flex flex-col justify-center items-center p-6 text-center">
                                            <div className="mb-4">
                                                <div className="text-[10px] font-bold text-yellow-400 uppercase tracking-[0.2em] mb-1">
                                                    Starting From
                                                </div>
                                                <div className="text-3xl font-black text-white">
                                                    {trip.price}
                                                </div>
                                            </div>

                                            <button
                                                className="bg-yellow-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-all duration-300 text-sm shadow-lg flex items-center gap-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCardClick(trip);
                                                }}
                                            >
                                                BOOK NOW <FaChevronRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </section>
    );
};

export default UpcomingTrips;
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import UpcomingTrips from './UpcomingTrips';
import ExploreWithUs from './ExploreWithUs';
import Footer from '../footer/Footer';
import Gallery from './Gallery';
import WeekendTrips from './WeekendTrips';
import { PageLoader } from '../common/LoadingSpinner';
import NotificationSnackbar from '../common/NotificationSnackbar';
import api from '../../services/Axios';
import { FaChevronRight, FaMapMarkerAlt, FaClock, FaDownload } from 'react-icons/fa';

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedSections, setLoadedSections] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', type: 'success' });
  const location = useLocation();
  
  // Hero Slider State
  const [trips, setTrips] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback Video State
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const videos = [
    "https://res.cloudinary.com/ddlbqi64f/video/upload/video1_yhmyj6.mp4",
    "https://player.vimeo.com/external/371433846.sd.mp4?s=231f13b69280e227a922119ed2d2f1f0a8d6b055&profile_id=164&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/434045526.sd.mp4?s=c27dbcc69a2ad44e55558ad35bb5a30574cd45d5&profile_id=164&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/517090025.sd.mp4?s=d00966f7f2b604e7b16524941916be9f54668222&profile_id=164&oauth2_token_id=57447761"
  ];

  // Typing effect for fallback header
  const [currentWord, setCurrentWord] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const words = ["Peace", "Nature", "Thrill", "Adventure", "Freedom", "Joy"];

  // Total sections to wait for (non-hero): Upcoming, Weekend, Explore, Gallery
  const totalSections = 4;

  const handleSectionLoad = (sectionId) => {
    setLoadedSections(prev => {
      const newSet = new Set(prev).add(sectionId);
      if (newSet.size >= totalSections) {
        setLoading(false);
      }
      return newSet;
    });
  };

  // Fetch all trips for Hero Slider
  useEffect(() => {
    const fetchAllTrips = async () => {
      try {
        const [normalRes, weekendRes] = await Promise.all([
          api.get('/Trip/getTrips'),
          api.get('/WeekendTrip/getWeekendallTrips')
        ]);
        
        const combined = [
          ...(normalRes.data.data || []).map(t => ({ ...t, type: 'normal' })),
          ...(weekendRes.data.data || []).map(t => ({ ...t, type: 'weekend' }))
        ];
        
        setTrips(combined.length > 0 ? combined : []);
      } catch (err) {
        console.error("Error fetching trips for hero:", err);
      }
    };
    fetchAllTrips();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (trips.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % trips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [trips]);

  // Typing effect logic
  useEffect(() => {
    if (trips.length > 0) return;
    const currentWordFull = words[currentWordIndex];
    const handleTyping = () => {
      if (!isDeleting) {
        if (currentCharIndex < currentWordFull.length) {
          setCurrentWord(prev => prev + currentWordFull.charAt(currentCharIndex));
          setCurrentCharIndex(prev => prev + 1);
        } else {
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        if (currentCharIndex > 0) {
          setCurrentWord(prev => prev.slice(0, -1));
          setCurrentCharIndex(prev => prev - 1);
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };
    const timer = setTimeout(handleTyping, isDeleting ? 50 : 100);
    return () => clearTimeout(timer);
  }, [currentCharIndex, isDeleting, currentWordIndex, trips.length]);

  // Safety timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, [location.hash]);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  const handleBrochureDownload = (e, trip) => {
    e.stopPropagation();
    if (!trip.brochure_url) {
      setSnackbar({ open: true, message: 'Brochure not available for this expedition', type: 'warning' });
      return;
    }
    const endpoint = trip.type === 'weekend' ? 'WeekendTrip' : 'Trip';
    const downloadUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/${endpoint}/download-brochure/${trip.id}`;
    window.open(downloadUrl, '_self');
  };

  const currentTrip = trips[currentIndex];

  return (
    <div className="relative min-h-screen font-['Inter']">
      {loading && <PageLoader />}

      <div className={`${loading ? 'pointer-events-none' : ''} transition-opacity duration-700`}>
        <Header scrolled={scrolled} />

        {/* Hero Section */}
        <section className="relative h-screen overflow-hidden bg-black">
          {trips.length > 0 ? (
            // Slider View
            <>
              {/* Background Images */}
              {trips.map((trip, idx) => (
                <div 
                  key={trip.id + trip.type}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                  <img 
                    src={trip.uploadimage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2042&q=80'} 
                    alt={trip.title}
                    className="w-full h-full object-cover scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>
              ))}

              {/* Trip Content Overlay */}
              <div className="relative z-10 h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-end pb-24 md:pb-32">
                <div className="max-w-3xl transform transition-all duration-700 translate-y-0 opacity-100">
                  <div className="flex flex-wrap items-center gap-4 mb-6 animate-fadeInUp">
                    <span className="px-3 py-1 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded-md shadow-lg font-['Outfit']">
                      Upcoming Expedition
                    </span>
                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold font-['Outfit']">
                      <FaClock className="text-yellow-500" />
                      {currentTrip?.duration || 'Multi-day'}
                    </div>
                    {currentTrip?.from_location && (
                      <div className="flex items-center gap-2 text-white/80 text-xs font-bold font-['Outfit']">
                        <FaMapMarkerAlt className="text-yellow-500" />
                        {currentTrip.from_location} to {currentTrip.to_location}
                      </div>
                    )}
                  </div>

                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none uppercase italic tracking-tighter mb-6 font-['Outfit'] animate-fadeInUp delay-100">
                    {currentTrip?.title}
                  </h1>

                  <div className="flex flex-col md:flex-row md:items-center gap-8 mb-10 animate-fadeInUp delay-200">
                    <div>
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-1">Starting From</p>
                      <p className="text-4xl font-black text-yellow-500 italic font-['Outfit']">{currentTrip?.price}</p>
                    </div>
                    
                    {currentTrip?.highlights && (
                      <div className="hidden md:block border-l border-white/20 pl-8 overflow-hidden">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-2">Expedition Highlights</p>
                        <p className="text-sm text-gray-300 font-medium line-clamp-2 italic leading-relaxed max-w-md">
                          {currentTrip.highlights.replace(/<\/?[^>]+(>|$)/g, "")}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 animate-fadeInUp delay-300">
                    <button 
                      onClick={() => navigate(`/travel/${currentTrip.id}?type=${currentTrip.type}`)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-yellow-500/20 active:scale-95 transition-all flex items-center gap-4 font-['Outfit']"
                    >
                      SECURE YOUR SPOT <FaChevronRight className="text-[10px]" />
                    </button>
                    
                    {/* Brochure Download Button with Tooltip */}
                    <div className="group relative">
                      <button 
                        onClick={(e) => handleBrochureDownload(e, currentTrip)}
                        disabled={!currentTrip?.brochure_url}
                        className={`backdrop-blur-md border px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all font-['Outfit'] flex items-center gap-3 ${
                          currentTrip?.brochure_url 
                            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                            : 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
                        }`}
                      >
                        <FaDownload className="text-[10px]" /> 
                        {currentTrip?.brochure_url ? 'DOWNLOAD BROCHURE' : 'BROCHURE UNAVAILABLE'}
                      </button>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1 bg-black/80 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {currentTrip?.brochure_url ? 'Download information about this trip' : 'Check back later for trip details'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="absolute bottom-12 right-6 md:right-12 flex items-center gap-3">
                  {trips.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-1.5 transition-all duration-500 rounded-full ${idx === currentIndex ? 'w-12 bg-yellow-500' : 'w-3 bg-white/20 hover:bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            // Fallback Video View (If no trips)
            <div className="absolute inset-0 z-0">
              <video
                key={videos[currentVideoIndex]}
                className="w-full h-full object-cover transition-opacity duration-1000"
                autoPlay
                muted
                onEnded={handleVideoEnd}
                playsInline
              >
                <source src={videos[currentVideoIndex]} type="video/mp4" />
                Your browser does not support video tag.
              </video>
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              
              <div className="relative z-10 flex items-end justify-start h-full text-white px-6 md:px-12 pb-20">
                <div className="flex flex-col items-start justify-end mb-10">
                  <h1 className="text-5xl md:text-7xl font-black text-left mb-4 uppercase italic font-['Outfit']">Experience</h1>
                  <span className="text-4xl md:text-6xl font-black text-yellow-500 italic font-['Outfit'] uppercase">
                    {currentWord}<span className="animate-pulse text-white">|</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>

        <UpcomingTrips onLoad={() => handleSectionLoad('upcoming')} />
        <WeekendTrips onLoad={() => handleSectionLoad('weekend')} />
        <ExploreWithUs onLoad={() => handleSectionLoad('explore')} />
        <Gallery onLoad={() => handleSectionLoad('gallery')} />
        <Footer />
      </div>

      <NotificationSnackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
      `}</style>
    </div>
  );
};

export default Home;
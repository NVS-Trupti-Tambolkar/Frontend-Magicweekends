import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../header/Header';
import UpcomingTrips from './UpcomingTrips';
import ExploreWithUs from './ExploreWithUs';
import Footer from '../footer/Footer';
import Gallery from './Gallery';
import WeekendTrips from './WeekendTrips';
import { PageLoader } from '../common/LoadingSpinner';

const Home = () => {
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadedSections, setLoadedSections] = useState(new Set());
  const location = useLocation();
  const [currentWord, setCurrentWord] = useState('');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Total sections to wait for: Upcoming, Weekend, Explore, Gallery
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

  // Safety timeout in case some API fails to call onLoad
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 8000); // 8 seconds maximum wait
    return () => clearTimeout(timer);
  }, []);

  // Words to type after "Experience"
  const words = ["Peace", "Nature", "Thrill", "Adventure", "Freedom", "Joy"];

  // Typing effect for words
  useEffect(() => {
    const currentWordFull = words[currentWordIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (currentCharIndex < currentWordFull.length) {
          setCurrentWord(prev => prev + currentWordFull.charAt(currentCharIndex));
          setCurrentCharIndex(prev => prev + 1);
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (currentCharIndex > 0) {
          setCurrentWord(prev => prev.slice(0, -1));
          setCurrentCharIndex(prev => prev - 1);
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    };

    const typingSpeed = isDeleting ? 50 : 100;
    const timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentCharIndex, isDeleting, currentWordIndex, words]);

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle hash-based scrolling when navigating from another page
  useEffect(() => {
    if (location.hash) {
      const sectionId = location.hash.replace('#', '');
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  }, [location.hash]);



  // Video slider state
  const videos = [
    "https://res.cloudinary.com/ddlbqi64f/video/upload/video1_yhmyj6.mp4",
    "https://player.vimeo.com/external/371433846.sd.mp4?s=231f13b69280e227a922119ed2d2f1f0a8d6b055&profile_id=164&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/434045526.sd.mp4?s=c27dbcc69a2ad44e55558ad35bb5a30574cd45d5&profile_id=164&oauth2_token_id=57447761",
    "https://player.vimeo.com/external/517090025.sd.mp4?s=d00966f7f2b604e7b16524941916be9f54668222&profile_id=164&oauth2_token_id=57447761"
  ];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % videos.length);
  };

  return (
    <div className="relative min-h-screen">
      {/* 
        Unified Loading Spinner Overlay 
        Stays fixed on top until all sections report they are loaded
      */}
      {loading && <PageLoader />}

      {/* Main Content - Rendered immediately to trigger data fetching and provide blur background */}
      <div className={`${loading ? 'pointer-events-none' : ''} transition-opacity duration-700`}>
        {/* Header with conditional styling based on scroll */}
        <Header scrolled={scrolled} />

        {/* Hero Section with Video Background */}
        <section className="relative h-screen overflow-hidden">
          {/* Video Background */}
          <div className="absolute inset-0 z-0">
            <video
              key={videos[currentVideoIndex]}
              className="w-full h-full object-cover transition-opacity duration-1000"
              autoPlay
              muted
              onEnded={handleVideoEnd}
              playsInline
            >
              <source
                src={videos[currentVideoIndex]}
                type="video/mp4"
              />
              Your browser does not support video tag.
            </video>

            {/* Overlay to make text more readable */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          </div>

          {/* Hero Content - Updated to bottom-left positioning */}
          <div className="relative z-10 flex items-end justify-start h-full text-white px-6 md:px-12">
            <div className="flex flex-col items-start justify-end mb-20">
              <h1 className="text-5xl md:text-6xl font-bold text-left mb-7">Experience</h1>
              <span className="text-5xl md:text-4xl font-bold text-white">
                {currentWord}
                <span className="animate-pulse">|</span>
              </span>
            </div>
          </div>
        </section>

        <UpcomingTrips onLoad={() => handleSectionLoad('upcoming')} />
        <WeekendTrips onLoad={() => handleSectionLoad('weekend')} />
        <ExploreWithUs onLoad={() => handleSectionLoad('explore')} />
        <Gallery onLoad={() => handleSectionLoad('gallery')} />
        <Footer />
      </div>
    </div>
  );
};

export default Home;
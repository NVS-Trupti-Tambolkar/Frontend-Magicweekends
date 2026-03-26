import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/header/magicweekends.jpg';
import { useAuth } from '../../context/AuthContext';

const Header = ({ scrolled }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    weekends: false,
    profile: false
  });
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // For typing effect in search
  const [searchText, setSearchText] = useState('');
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const places = [
    "Manali", "Goa", "Kerala", "Rishikesh", "Jaipur",
    "Ladakh", "Mumbai", "Delhi", "Bengaluru", "Udaipur"
  ];

  // Typing effect for search placeholder
  useEffect(() => {
    const currentPlace = places[currentPlaceIndex];

    const handleTyping = () => {
      if (!isDeleting) {
        // Typing
        if (currentCharIndex < currentPlace.length) {
          setSearchText(prev => prev + currentPlace.charAt(currentCharIndex));
          setCurrentCharIndex(prev => prev + 1);
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (currentCharIndex > 0) {
          setSearchText(prev => prev.slice(0, -1));
          setCurrentCharIndex(prev => prev - 1);
        } else {
          // Finished deleting, move to next place
          setIsDeleting(false);
          setCurrentPlaceIndex((prev) => (prev + 1) % places.length);
        }
      }
    };

    const typingSpeed = isDeleting ? 50 : 100;
    const timer = setTimeout(handleTyping, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentCharIndex, isDeleting, currentPlaceIndex, places]);

  const toggleDropdown = (menu) => {
    setIsDropdownOpen(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleDropdownMouseEnter = (menu) => {
    // Clear any existing timeout
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
      setDropdownTimeout(null);
    }

    setIsDropdownOpen(prev => ({
      ...prev,
      [menu]: true
    }));
  };

  const handleDropdownMouseLeave = (menu) => {
    // Set a timeout before closing dropdown
    const timeout = setTimeout(() => {
      setIsDropdownOpen(prev => ({
        ...prev,
        [menu]: false
      }));
      setDropdownTimeout(null);
    }, 150); // Small delay to allow moving to dropdown items

    setDropdownTimeout(timeout);
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    if (location.pathname === '/') {
      // Already on home page, just scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      } else if (sectionId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Navigate to home page with hash
      if (sectionId === 'home') {
        navigate('/');
      } else {
        navigate(`/#${sectionId}`);
      }
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="py-3 px-4 sm:px-6 md:px-8 lg:px-16 fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-black/20 backdrop-blur-md"
      style={{
        transition: 'max-height 0.3s ease, height 0.3s ease, padding 0.3s ease, margin 0.3s ease'
      }}>
      <div className={`max-w-full mx-auto flex ${user ? 'flex-nowrap' : 'flex-wrap'} justify-between items-center`}>
        {/* Left section with logo and phone */}
        <div className="flex items-center flex-1">
          <div className="flex items-center mr-4 lg:mr-8 flex-shrink-0">
            <img src={logo} alt="Magic Weekends" className="h-10 sm:h-12 w-10 sm:w-12 mr-2 sm:mr-3 rounded-full shadow-md cursor-pointer border-2 border-white/20" onClick={() => navigate('/login')} />
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-white cursor-pointer tracking-wider whitespace-nowrap" onClick={() => navigate('/login')}>MAGIC WEEKENDS</h1>
          </div>

          {!user && (
            <>
              {/* Phone Number */}
              <div className="hidden lg:flex items-center text-white mr-4 lg:mr-8 whitespace-nowrap">
                <svg className="h-4 w-4 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span className="text-sm font-bold tracking-tighter">91 9011234179</span>
              </div>

              {/* Search bar */}
              <div className="hidden xl:block relative w-48 lg:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-10 py-1.5 bg-white border border-gray-300 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-xs sm:text-sm shadow-sm"
                  placeholder={searchText || "Search destination..."}
                />
                <button className="absolute inset-y-0 right-0 px-3 flex items-center bg-yellow-500 text-gray-900 rounded-r-full hover:bg-yellow-600 transition-colors">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right section with navigation - Hidden on mobile, visible on desktop */}
        <nav className="hidden lg:flex items-center gap-x-4 xl:gap-x-8">
          <div className="flex items-center gap-x-4 xl:gap-x-6">
            <a href="#" onClick={(e) => handleNavClick(e, 'home')} className="transition-all duration-300 font-medium relative group cursor-pointer text-white">
              <span className="text-xs lg:text-sm xl:text-base">Home</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#explore" onClick={(e) => handleNavClick(e, 'explore')} className="transition-all duration-300 font-medium relative group cursor-pointer text-white">
              <span className="text-xs lg:text-sm xl:text-base">Explore</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#gallery" onClick={(e) => handleNavClick(e, 'gallery')} className="transition-all duration-300 font-medium relative group cursor-pointer text-white">
              <span className="text-xs lg:text-sm xl:text-base">Gallery</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#weekend-trips" onClick={(e) => handleNavClick(e, 'weekend-trips')} className="transition-all duration-300 font-medium relative group cursor-pointer text-white">
              <span className="text-xs lg:text-sm xl:text-base whitespace-nowrap">Weekends Trips</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
            </a>
            {user && (
              <a onClick={() => navigate('/my-bookings')} className="transition-all duration-300 font-medium relative group cursor-pointer text-white">
                <span className="text-xs lg:text-sm xl:text-base whitespace-nowrap">My Bookings</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            )}
          </div>

          {/* User Info & Profile Dropdown */}
          {user ? (
            <div className="flex items-center ml-2 xl:ml-4 pl-2 xl:pl-4 border-l border-white/20">
              <div className="relative">
                <div 
                  className={`flex items-center gap-2 cursor-pointer py-1.5 px-3 rounded-full transition-all duration-300 border border-transparent shadow-sm ${isDropdownOpen.profile ? 'bg-white/15 border-white/20' : 'hover:bg-white/10 hover:border-white/10'}`}
                  onClick={() => toggleDropdown('profile')}
                  onMouseEnter={() => handleDropdownMouseEnter('profile')}
                  onMouseLeave={() => handleDropdownMouseLeave('profile')}
                >
                  <div className="w-7 h-7 xl:w-8 xl:h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xs xl:text-sm shadow-md border border-white/30">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs xl:text-sm text-white font-bold tracking-tight">
                    {user.username}
                  </span>
                  <svg className={`h-3.5 w-3.5 xl:h-4 xl:w-4 text-white/70 transition-transform duration-300 ${isDropdownOpen.profile ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>

                {/* Profile Dropdown Menu */}
                {isDropdownOpen.profile && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-black/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in zoom-in duration-200"
                    onMouseEnter={() => handleDropdownMouseEnter('profile')}
                    onMouseLeave={() => handleDropdownMouseLeave('profile')}
                  >
                    <div className="p-4 border-b border-white/10 bg-white/5">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-full bg-yellow-500 flex items-center justify-center text-black font-bold border border-white/20">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <p className="text-sm text-white font-bold truncate">{user.username}</p>
                          <p className="text-[10px] text-yellow-500/80 font-bold uppercase tracking-wider">{user.role}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2 space-y-1">
                      {user.role === 'admin' && (
                        <button 
                          onClick={() => { setIsDropdownOpen(prev => ({...prev, profile: false})); navigate('/register'); }}
                          className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-xs text-white hover:bg-white/10 rounded-xl transition-all group"
                        >
                          <div className="p-1.5 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/40 transition-colors">
                            <svg className="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                            </svg>
                          </div>
                          MANAGE USERS
                        </button>
                      )}
                      
                      <button 
                        onClick={() => { setIsDropdownOpen(prev => ({...prev, profile: false})); navigate('/my-bookings'); }}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-xs text-white hover:bg-white/10 rounded-xl transition-all group"
                      >
                        <div className="p-1.5 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/40 transition-colors">
                          <svg className="h-4 w-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                          </svg>
                        </div>
                        MY BOOKINGS
                      </button>

                      <div className="h-px bg-white/10 my-1 mx-2"></div>

                      <button 
                        onClick={logout}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-all group"
                      >
                        <div className="p-1.5 bg-red-500/20 rounded-lg group-hover:bg-red-500/40 transition-colors">
                          <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                          </svg>
                        </div>
                        SIGN OUT
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-6 py-2 rounded-lg shadow-lg shadow-yellow-500/30 active:scale-95 transition-all duration-300 text-xs font-bold tracking-wider ml-4"
            >
              LOGIN
            </button>
          )}
        </nav>

        {/* Mobile menu button - Visible only on mobile */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`focus:outline-none p-2 rounded-md transition-all duration-300 ${scrolled ? 'text-white bg-black/30 backdrop-blur-sm' : 'text-white bg-white/20 backdrop-blur-sm'
              }`}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu - Visible only on mobile */}
      {isMenuOpen && (
        <div
          className="md:hidden mt-4 rounded-lg overflow-hidden z-50 text-white"
          style={{
            backdropFilter: 'blur(20px)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
          }}
        >
          <div className="p-4">
            {!user && (
              <div className="flex flex-col gap-4 mb-6">
                {/* Search bar for mobile */}
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    className={`block w-full pl-10 pr-10 py-3 border rounded-lg ${isSearchFocused
                      ? 'bg-white/90 text-gray-900 placeholder-gray-600 border-yellow-500 ring-2 ring-yellow-500'
                      : 'bg-white/90 text-gray-900 placeholder-gray-500 border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm transition-all duration-300`}
                    placeholder={searchText || "Search destination..."}
                  />
                  <button className="absolute inset-y-0 right-0 px-3 py-2 bg-yellow-500 text-gray-900 rounded-r-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors duration-300">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                  </button>
                </div>

                {/* Mobile Login Button */}
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/login'); }}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-3 rounded-lg font-bold text-sm shadow-lg shadow-yellow-500/20 active:scale-95 transition-all"
                >
                  LOGIN TO MY ACCOUNT
                </button>

                <div className="flex items-center p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                  <svg className="h-5 w-5 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span className="text-yellow-300 text-sm font-medium">91 9011234179</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <a href="#" onClick={(e) => handleNavClick(e, 'home')} className="block text-white hover:text-yellow-400 transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-white/5 relative group overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <svg className="h-5 w-5 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Home
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#explore" onClick={(e) => handleNavClick(e, 'explore')} className="block text-white hover:text-yellow-400 transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-white/5 relative group overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <svg className="h-5 w-5 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                  </svg>
                  Explore
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a href="#gallery" onClick={(e) => handleNavClick(e, 'gallery')} className="block text-white hover:text-yellow-400 transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-white/5 relative group overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <svg className="h-5 w-5 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Gallery
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
              </a>

              <a href="#weekend-trips" onClick={(e) => handleNavClick(e, 'weekend-trips')} className="block text-white hover:text-yellow-400 transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-white/5 relative group overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <svg className="h-5 w-5 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Weekends Trips
                </span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
              </a>



              {user && (
                <a onClick={() => navigate('/my-bookings')} className="block text-white hover:text-yellow-400 transition-all duration-300 font-medium py-3 px-4 rounded-lg hover:bg-white/5 relative group overflow-hidden cursor-pointer">
                  <span className="relative z-10 flex items-center">
                    <svg className="h-5 w-5 mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M6 16h.01"></path>
                    </svg>
                    My Bookings
                  </span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300"></span>
                </a>
              )}

              {user && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xl shadow-lg border border-white/20">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-bold">{user.username}</span>
                        <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider">{user.role}</span>
                        {user.role === 'admin' && (
                          <button 
                            onClick={() => { setIsMenuOpen(false); navigate('/register'); }}
                            className="text-[10px] text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-all mt-1 w-fit font-bold"
                          >
                            Add New User
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={logout}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 px-4 py-2 rounded-xl transition-all duration-300 text-[10px] font-bold tracking-widest uppercase"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex justify-center space-x-4">
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-yellow-400 transition-colors duration-300">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturedTours from './components/FeaturedTours';
import ToursCatalog from './components/ToursCatalog';
import Destinations from './components/Destinations';
import ProcessSection from './components/ProcessSection';
import OrganizersSection from './components/OrganizersSection';
import CtaBanner from './components/CtaBanner';
import BookingPage from './components/BookingPage';
import TourDetailsPage from './components/TourDetailsPage';
import OrganizerProfilePage from './components/OrganizerProfilePage';
import AuthPage from './components/AuthPage';
import ProfilePage from './components/ProfilePage';
import NotFoundPage from './components/NotFoundPage';
import ContactPage from './components/ContactPage';
import AboutPage from './components/AboutPage';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import Footer from './components/Footer';
import { 
  getTours, 
  getDestinations, 
  getMe, 
  getFavorites, 
  toggleFavoriteApi,
  isTokenValid
} from './services/api';
import { normalizeTour } from './services/tourAdapter';
import './App.css';

export default function App() {
  // Real Tours from Backend API
  const [tours, setTours] = useState([]);
  const [isLoadingTours, setIsLoadingTours] = useState(true);
  const [toursError, setToursError] = useState(null);

  // Real Destinations from Backend API
  const [destinations, setDestinations] = useState([]);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState(true);

  // Filter & Search Parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('all');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeOrgType, setActiveOrgType] = useState('all'); // 'all', 'guide', 'operator'
  
  // View mode: 'home', 'tours', 'tour-detail', 'organizer', 'booking', 'auth', or 'profile'
  const [currentView, setCurrentView] = useState('home');
  const [previousView, setPreviousView] = useState('home');
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [profileInitialTab, setProfileInitialTab] = useState('profile');
  const [selectedTour, setSelectedTour] = useState(null);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState(null);
  const [bookingTour, setBookingTour] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({ departure: null, count: 1 });
  const [activeSection, setActiveSection] = useState('hero');

  // Modals state
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Real authenticated user state (starts null, fetched from /api/me if token exists)
  const [currentUser, setCurrentUser] = useState(null);
  const [favoriteTourIds, setFavoriteTourIds] = useState(new Set());
  
  // Theme state: 'light' or 'dark'
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Notification toast
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  // 1. Check existing authentication session: GET /api/me
  const checkAuth = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token || !isTokenValid(token)) {
      if (token && typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setCurrentUser(null);
      return;
    }

    try {
      const res = await getMe();
      const user = res.user || res.data || res;
      if (user && (user.id || user.name || user.phone)) {
        setCurrentUser(user);
        // Also fetch favorites if logged in
        try {
          const favRes = await getFavorites();
          const favItems = Array.isArray(favRes) ? favRes : (favRes.items || favRes.favorites || []);
          const idSet = new Set(favItems.map(f => f.tourId || f.id || f.tour_id));
          setFavoriteTourIds(idSet);
        } catch {
          // silently handle optional favorites loading
        }
      }
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      setCurrentUser(null);
      // Only warn if it's not a standard 401 (expired/unauthorized token)
      if (err.status !== 401 && err.code !== 'HTTP_401') {
        console.warn("Foydalanuvchi seansini tekshirishda xatolik:", err.message);
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 2. Load destinations: GET /api/destinations
  const fetchDestinations = useCallback(async () => {
    setIsLoadingDestinations(true);
    try {
      const res = await getDestinations();
      const items = Array.isArray(res) ? res : (res.items || res.destinations || []);
      setDestinations(items);
    } catch (err) {
      console.warn("Yo'nalishlarni yuklab bo'lmadi:", err.message);
      setDestinations([]);
    } finally {
      setIsLoadingDestinations(false);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // 3. Load tours with backend query parameters: GET /api/tours
  const fetchToursFromBackend = useCallback(async () => {
    setIsLoadingTours(true);
    setToursError(null);

    const queryParams = {};
    if (searchQuery.trim()) queryParams.q = searchQuery.trim();
    if (selectedDestination !== 'all') queryParams.dest = selectedDestination;
    if (activeCategory !== 'all') queryParams.cat = activeCategory;
    if (activeOrgType !== 'all') queryParams.orgType = activeOrgType;

    try {
      const res = await getTours(queryParams);
      const rawList = Array.isArray(res) 
        ? res 
        : (res?.items || res?.tours || res?.data || []);
      
      const normalized = rawList.map(item => {
        const t = normalizeTour(item);
        if (t && favoriteTourIds.has(t.id)) {
          t.isLiked = true;
        }
        return t;
      }).filter(Boolean);

      setTours(normalized);
    } catch (err) {
      console.warn("Backenddan turlar yuklashda xatolik:", err.message);
      setTours([]);
      setToursError(err.message || "Turlarni yuklab bo'lmadi");
    } finally {
      setIsLoadingTours(false);
    }
  }, [searchQuery, selectedDestination, activeCategory, activeOrgType, favoriteTourIds]);

  useEffect(() => {
    fetchToursFromBackend();
  }, [fetchToursFromBackend]);

  // Liked tours count
  const likedCount = useMemo(() => {
    return tours.filter(t => t.isLiked).length + (favoriteTourIds.size > 0 ? favoriteTourIds.size : 0);
  }, [tours, favoriteTourIds]);

  // Toggle favorite / wishlist
  const handleToggleLike = async (tourId) => {
    const targetTour = tours.find(t => t.id === tourId);
    if (!targetTour) return;

    const nextLiked = !targetTour.isLiked;
    
    // Update local state
    setTours(prev => prev.map(t => {
      if (t.id === tourId) {
        return { ...t, isLiked: nextLiked };
      }
      return t;
    }));

    setFavoriteTourIds(prev => {
      const updated = new Set(prev);
      if (nextLiked) {
        updated.add(tourId);
      } else {
        updated.delete(tourId);
      }
      return updated;
    });

    showToast(nextLiked ? `"${targetTour.title}" sevimlilarga qo'shildi ❤️` : `"${targetTour.title}" sevimlilardan o'chirildi`);

    try {
      await toggleFavoriteApi(tourId, nextLiked);
    } catch (err) {
      console.warn("Sevimlilar API xatosi:", err.message);
    }
  };

  // Open Tour Details Page (100% Matching 5 Screenshots)
  const handleOpenTourDetail = (tour) => {
    setSelectedTour(tour);
    setPreviousView(currentView === 'tour-detail' ? previousView : currentView);
    setCurrentView('tour-detail');
    setActiveSection('turlar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open Organizer Profile Page (100% Matching Figma Screenshot)
  const handleOpenOrganizerProfile = (orgId) => {
    setSelectedOrganizerId(orgId);
    setPreviousView(currentView);
    setCurrentView('organizer');
    setActiveSection('turlar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Open booking page from Tour Details widget
  const handleOpenBookingFromDetail = ({ tour, selectedDeparture, personCount }) => {
    setBookingTour(tour);
    setBookingDetails({ departure: selectedDeparture, count: personCount });
    setPreviousView('tour-detail');
    setCurrentView('booking');
    setActiveSection('turlar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch to Tours Catalog view matching user screenshot
  const handleOpenCatalog = () => {
    setCurrentView('tours');
    setActiveSection('turlar');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return to home catalog
  const handleBackToHome = () => {
    setCurrentView('home');
    setActiveSection('hero');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Search submit: opens catalog with search results
  const handleSearchSubmit = () => {
    handleOpenCatalog();
  };

  // Handle selecting a destination card from "Mashhur yo'nalishlar"
  const handleSelectDestinationCard = (destName) => {
    setSelectedDestination(destName);
    setActiveCategory('all');
    setActiveOrgType('all');
    setSearchQuery('');
    handleOpenCatalog();
    showToast(`"${destName}" shahri bo'yicha turlar saralandi`);
  };

  // Reset filters and open full catalog
  const handleViewAll = () => {
    setSelectedDestination('all');
    setActiveCategory('all');
    setActiveOrgType('all');
    setSearchQuery('');
    handleOpenCatalog();
  };

  // Filter by organizer type
  const handleFilterOrganizer = (type) => {
    const mappedType = type.toLowerCase().includes('oper') ? 'operator' : 'guide';
    setActiveOrgType(mappedType);
    setSelectedDestination('all');
    setActiveCategory('all');
    setSearchQuery('');
    handleOpenCatalog();
    showToast(`"${type}" turlari saralandi`);
  };

  // Smooth navigation
  const handleNavigate = (sectionId) => {
    if (sectionId === 'biz-haqimizda' || sectionId === 'about') {
      setPreviousView(currentView === 'about' ? 'home' : currentView);
      setCurrentView('about');
      setActiveSection('biz-haqimizda');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (sectionId === 'boglanish') {
      setPreviousView(currentView === 'contact' ? 'home' : currentView);
      setCurrentView('contact');
      setActiveSection('boglanish');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (sectionId === 'turlar') {
      handleOpenCatalog();
      return;
    }

    if (sectionId === 'hero') {
      handleBackToHome();
      return;
    }

    // If navigating to an anchor section (e.g. 'biz-haqimizda', 'yonalishlar')
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      const elem = document.getElementById(sectionId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setActiveSection(sectionId);
  };

  const handleOpenAuthModal = (mode) => {
    setPreviousView(currentView === 'auth' || currentView === 'profile' ? 'home' : currentView);
    if (mode === 'profile' || mode === 'favorites' || mode === 'bookings' || mode === 'companions') {
      if (currentUser) {
        setProfileInitialTab(mode === 'profile' ? 'profile' : mode);
        setCurrentView('profile');
      } else {
        setAuthMode('login');
        setCurrentView('auth');
      }
    } else if (mode === 'register') {
      setAuthMode('register');
      setCurrentView('auth');
    } else {
      setAuthMode('login');
      setCurrentView('auth');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toast && (
        <div className="toast-notification">
          <span>{toast}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar 
        onOpenAuth={handleOpenAuthModal} 
        onNavigate={handleNavigate}
        activeSection={
          currentView === 'about'
            ? 'biz-haqimizda'
            : (currentView === 'contact' 
                ? 'boglanish' 
                : (currentView === 'booking' || currentView === 'tours' || currentView === 'tour-detail' || currentView === 'organizer' 
                    ? 'turlar' 
                    : (currentView === 'auth' || currentView === 'profile' || currentView === '404' ? '' : activeSection)))
        }
        likedCount={likedCount}
        currentUser={currentUser}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Content View Switch */}
      <main>
        {currentView === 'auth' ? (
          /* Dedicated Auth Page (100% Matching Screenshots 1 & 2) */
          <AuthPage 
            initialMode={authMode}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              setCurrentView(previousView === 'auth' ? 'home' : (previousView || 'home'));
              showToast(`Xush kelibsiz, ${user.name || user.phone || 'Foydalanuvchi'}!`);
              checkAuth();
            }}
            onNavigateHome={handleBackToHome}
          />
        ) : currentView === 'profile' ? (
          /* Dedicated Profile Page (100% Matching Screenshots 3, 4, 5) */
          <ProfilePage 
            currentUser={currentUser}
            initialTab={profileInitialTab}
            onLogout={() => {
              setCurrentUser(null);
              setCurrentView('home');
              showToast("Hisobdan chiqildi.");
            }}
            onUserUpdated={(updated) => {
              setCurrentUser(prev => ({ ...prev, ...updated }));
              showToast("Ma'lumotlar saqlandi!");
            }}
            onSelectTour={(tour) => {
              handleOpenTourDetail(tour);
            }}
          />
        ) : currentView === 'organizer' ? (
          /* Dedicated Organizer Profile Page (100% Matching Figma Screenshot) */
          <OrganizerProfilePage 
            organizerId={selectedOrganizerId}
            onBack={() => {
              setCurrentView(previousView || 'tours');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectTour={(tour) => {
              handleOpenTourDetail(tour);
            }}
            onToggleLike={handleToggleLike}
          />
        ) : currentView === 'tour-detail' ? (
          /* Dedicated Tour Details Page (100% Matching 5 Screenshots) */
          <TourDetailsPage 
            initialTour={selectedTour}
            tourId={selectedTour?.slug || selectedTour?.id}
            onBack={() => {
              setCurrentView(previousView === 'tour-detail' ? 'tours' : (previousView || 'home'));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBookTour={handleOpenBookingFromDetail}
            onSelectSimilarTour={(simTour) => {
              handleOpenTourDetail(simTour);
            }}
            onSelectOrganizer={handleOpenOrganizerProfile}
            onToggleLike={handleToggleLike}
          />
        ) : currentView === 'booking' ? (
          /* Dedicated Booking Page */
          <BookingPage 
            tour={bookingTour}
            initialDeparture={bookingDetails.departure}
            initialPersonCount={bookingDetails.count}
            currentUser={currentUser}
            onBack={() => {
              setCurrentView(previousView || 'home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenAuth={handleOpenAuthModal}
            onCompleteBooking={(data) => {
              showToast(`"${data.tour.title}" bo'yicha buyurtma qabul qilindi!`);
            }}
          />
        ) : currentView === 'tours' ? (
          /* Dedicated Tours Catalog Page (100% Matching Screenshot: O'zingizga mos turni toping) */
          <ToursCatalog 
            tours={tours}
            destinations={destinations}
            onSelectTour={(tour) => {
              handleOpenTourDetail(tour);
            }}
            onToggleLike={handleToggleLike}
            initialDestination={selectedDestination}
            initialCategory={activeCategory}
            initialOrgType={activeOrgType}
            initialSearchQuery={searchQuery}
            isLoading={isLoadingTours}
          />
        ) : currentView === 'about' ? (
          /* Dedicated About Us Page (100% Matching Mobile Screenshots 2, 3, 4, 5) */
          <AboutPage 
            onContact={() => handleNavigate('boglanish')}
            onExploreTours={handleViewAll}
          />
        ) : currentView === 'contact' ? (
          /* Dedicated Contact Page (100% Matching Desktop & Mobile Screenshots) */
          <ContactPage />
        ) : currentView === '404' ? (
          /* 404 Not Found Page (100% Matching Screenshot 4) */
          <NotFoundPage 
            onNavigateHome={handleBackToHome}
            onExploreTours={handleViewAll}
          />
        ) : (
          /* Main Homepage View */
          <>
            {/* Hero Section */}
            <Hero 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDestination={selectedDestination}
              setSelectedDestination={setSelectedDestination}
              destinations={destinations}
              onSearchSubmit={handleSearchSubmit}
              onExploreTours={handleViewAll}
              onExploreDestinations={() => handleNavigate('yonalishlar')}
            />

            {/* Tanlangan turlar (Featured Tours Swiper) */}
            <FeaturedTours 
              tours={tours}
              onToggleLike={handleToggleLike}
              onSelectTour={(tour) => {
                handleOpenTourDetail(tour);
              }}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              onViewAll={handleViewAll}
              isLoading={isLoadingTours}
              errorMessage={toursError}
              onRefresh={fetchToursFromBackend}
            />

            {/* Mashhur yo'nalishlar (Popular Destinations) */}
            <Destinations 
              destinations={destinations}
              isLoading={isLoadingDestinations}
              onSelectDestination={handleSelectDestinationCard}
            />

            {/* Har bir sayohat uchun bitta, tushunarli jarayon */}
            <ProcessSection />

            {/* Gidlar va turoperatorlar */}
            <OrganizersSection 
              onFilterOrganizer={handleFilterOrganizer}
              onSelectOrganizer={handleOpenOrganizerProfile}
            />

            {/* Keyingi sayohatingiz shu yerdan boshlanadi (CTA Banner) */}
            <CtaBanner 
              onViewAllTours={handleViewAll}
            />
          </>
        )}
      </main>

      {/* Footer (Matching Screenshot) */}
      <Footer 
        onNavigate={handleNavigate} 
        onSelectDestination={handleSelectDestinationCard}
        onFilterOrganizer={handleFilterOrganizer}
      />

      {/* Auth Modal (Kirish / Ro'yxatdan o'tish / OTP / Parol tiklash) */}
      {authModal.isOpen && (
        <AuthModal 
          initialMode={authModal.mode}
          onClose={() => setAuthModal({ isOpen: false, mode: 'login' })}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setAuthModal({ isOpen: false, mode: 'login' });
            showToast(`Xush kelibsiz, ${user.name || user.phone || 'Foydalanuvchi'}!`);
            checkAuth();
          }}
        />
      )}

      {/* Shaxsiy Kabinet Modal (/profil/*) */}
      {profileModalOpen && (
        <ProfileModal 
          onClose={() => setProfileModalOpen(false)}
          currentUser={currentUser}
          onUserUpdated={(updated) => {
            setCurrentUser(prev => ({ ...prev, ...updated }));
          }}
          onLogout={() => {
            setCurrentUser(null);
            setProfileModalOpen(false);
            showToast("Hisobdan chiqildi.");
          }}
        />
      )}
    </div>
  );
}

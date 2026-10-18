import React, { useState, useEffect } from 'react';
import { X, User, Sun, Moon } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ 
  onOpenAuth, 
  onNavigate, 
  activeSection = 'hero',
  likedCount = 0,
  currentUser = null,
  theme = 'light',
  onToggleTheme
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(sectionId);
    }
  };

  const getInitials = (user) => {
    if (!user) return '';
    if (user.initials) return user.initials;
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-container">
        {/* Logo */}
        <a 
          href="#" 
          className="brand-logo" 
          onClick={(e) => { 
            e.preventDefault(); 
            handleNavClick('hero'); 
          }}
        >
          <span className="logo-text-dark">Visitca</span>
          <span className="logo-text-blue">Trip</span>
        </a>

        {/* Desktop Nav */}
        <nav className="desktop-nav" aria-label="Asosiy menyu">
          <button 
            type="button" 
            className={`nav-link ${activeSection === 'hero' ? 'active' : ''}`} 
            onClick={() => handleNavClick('hero')}
          >
            Bosh sahifa
          </button>
          <button 
            type="button" 
            className={`nav-link ${activeSection === 'turlar' ? 'active' : ''}`} 
            onClick={() => handleNavClick('turlar')}
          >
            Turlar
          </button>
          <button 
            type="button" 
            className={`nav-link ${activeSection === 'biz-haqimizda' ? 'active' : ''}`} 
            onClick={() => handleNavClick('biz-haqimizda')}
          >
            Biz haqimizda
          </button>
          <button 
            type="button" 
            className={`nav-link ${activeSection === 'boglanish' ? 'active' : ''}`} 
            onClick={() => handleNavClick('boglanish')}
          >
            Bog'lanish
          </button>
        </nav>

        {/* Desktop Header Actions */}
        <div className="header-actions">
          {/* Light / Dark Mode Toggle Button */}
          {onToggleTheme && (
            <button 
              type="button" 
              className="theme-toggle-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? "Yorug' rejimga o'tish" : "Tungi rejimga o'tish"}
              aria-label="Mavzuni almashtirish"
            >
              {theme === 'dark' ? (
                <Sun size={19} className="theme-toggle-icon icon-sun" />
              ) : (
                <Moon size={19} className="theme-toggle-icon icon-moon" />
              )}
            </button>
          )}

          {currentUser ? (
            <div className="user-profile-header-group">
              <button 
                type="button" 
                className="header-wishlist-badge"
                onClick={() => onOpenAuth ? onOpenAuth('favorites') : handleNavClick('turlar')}
                title="Saqlangan turlar"
              >
                <span className="heart-red-emoji">❤️</span>
                <span className="wishlist-count-num">{likedCount}</span>
              </button>

              <div className="user-avatar-pill" onClick={() => onOpenAuth('profile')}>
                <span className="avatar-initials-circle">{getInitials(currentUser)}</span>
                <span className="avatar-username">{currentUser.name || currentUser.phone || 'Profil'}</span>
              </div>
            </div>
          ) : (
            <>
              <button 
                type="button" 
                className="btn-text-link" 
                onClick={() => onOpenAuth('login')}
              >
                Kirish
              </button>
              <button 
                type="button" 
                className="btn btn-primary btn-header-register" 
                onClick={() => onOpenAuth('register')}
              >
                Ro'yxatdan o'tish
              </button>
            </>
          )}
        </div>

        {/* Mobile Hamburger & Theme Toggle Button */}
        <div className="mobile-header-right">
          {onToggleTheme && (
            <button 
              type="button" 
              className="theme-toggle-btn mobile-quick-theme-btn"
              onClick={onToggleTheme}
              aria-label="Mavzuni almashtirish"
            >
              {theme === 'dark' ? (
                <Sun size={18} className="theme-toggle-icon icon-sun" />
              ) : (
                <Moon size={18} className="theme-toggle-icon icon-moon" />
              )}
            </button>
          )}
          <button 
            type="button" 
            className="mobile-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Menyuni yopish" : "Menyuni ochish"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={24} />
            ) : (
              <svg width="22" height="14" viewBox="0 0 22 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="1" y1="2" x2="21" y2="2"></line>
                <line x1="1" y1="12" x2="21" y2="12"></line>
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'is-open' : ''}`}>
        <div className="mobile-nav-backdrop" onClick={() => setMobileMenuOpen(false)}></div>
        <div className="mobile-nav-content">
          <div className="mobile-nav-header">
            <div className="brand-logo">
              <span className="logo-text-dark">Visitca</span>
              <span className="logo-text-blue">Trip</span>
            </div>
            <button 
              type="button" 
              className="mobile-close-btn" 
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={22} />
            </button>
          </div>

          <div className="mobile-links-list">
            <button 
              type="button" 
              className={`mobile-nav-item ${activeSection === 'hero' ? 'active' : ''}`}
              onClick={() => handleNavClick('hero')}
            >
              Bosh sahifa
            </button>
            <button 
              type="button" 
              className={`mobile-nav-item ${activeSection === 'turlar' ? 'active' : ''}`}
              onClick={() => handleNavClick('turlar')}
            >
              Turlar
            </button>
            <button 
              type="button" 
              className="mobile-nav-item" 
              onClick={() => handleNavClick('yonalishlar')}
            >
              Mashhur yo'nalishlar
            </button>
            <button 
              type="button" 
              className="mobile-nav-item" 
              onClick={() => handleNavClick('biz-haqimizda')}
            >
              Biz haqimizda
            </button>
            <button 
              type="button" 
              className="mobile-nav-item" 
              onClick={() => handleNavClick('boglanish')}
            >
              Bog'lanish
            </button>
          </div>

          <div className="mobile-drawer-bottom">
            {/* Theme switcher inside mobile drawer */}
            {onToggleTheme && (
              <div className="mobile-theme-switch-row">
                <span className="mobile-theme-mode-text">
                  {theme === 'dark' ? "Tungi rejim faol" : "Yorug' rejim faol"}
                </span>
                <button 
                  type="button"
                  className="mobile-theme-switch-pill"
                  onClick={onToggleTheme}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={15} /> Yorug' rejim
                    </>
                  ) : (
                    <>
                      <Moon size={15} /> Tungi rejim
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="mobile-auth-actions">
              {currentUser ? (
                <div className="mobile-user-row">
                  <div className="user-avatar-pill mobile-avatar-full" onClick={() => { setMobileMenuOpen(false); onOpenAuth('profile'); }}>
                    <span className="avatar-initials-circle">{getInitials(currentUser)}</span>
                    <span className="avatar-username">{currentUser.name || currentUser.phone || 'Profil'}</span>
                  </div>
                  <div className="mobile-wishlist-row">
                    <span>Saqlangan turlar:</span>
                    <span className="heart-badge-mobile">❤️ {likedCount} ta</span>
                  </div>
                </div>
              ) : (
                <>
                  <button 
                    type="button" 
                    className="btn btn-outline mobile-btn-login"
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }}
                  >
                    <User size={16} /> Kirish
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary mobile-btn-register"
                    onClick={() => { setMobileMenuOpen(false); onOpenAuth('register'); }}
                  >
                    Ro'yxatdan o'tish
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

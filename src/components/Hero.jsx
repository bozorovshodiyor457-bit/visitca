import React, { useState } from 'react';
import { Search, ChevronDown, MapPin } from 'lucide-react';
import './Hero.css';

export default function Hero({ 
  searchQuery, 
  setSearchQuery, 
  selectedDestination, 
  setSelectedDestination, 
  destinations = [],
  onSearchSubmit,
  onExploreTours,
  onExploreDestinations
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const destinationOptions = [
    { label: "Barcha yo'nalishlar", value: "all" },
    ...destinations.map(d => ({ label: d.name, value: d.name }))
  ];

  const handleSelectDestination = (option) => {
    setSelectedDestination(option.value);
    setDropdownOpen(false);
  };

  const currentDestLabel = destinationOptions.find(d => d.value === selectedDestination)?.label || "Barcha yo'nalishlar";

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSearchSubmit();
  };

  return (
    <section className="hero-section" id="hero">
      <div className="container">
        {/* Main Hero Card Container */}
        <div className="hero-card">
          <div className="hero-content">
            {/* Pill Badge */}
            <div className="hero-badge" tabIndex={0}>
              <span className="badge-gradient-dot"></span>
              <span className="badge-text">Gid va turoperator turlari bitta platformada</span>
            </div>

            {/* Hero Main Heading */}
            <h1 className="hero-title">
              O'zbekistonni <br className="hero-br-desktop" />
              yangicha <br className="hero-br-mobile" />
              kashf eting.
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle">
              Unutilmas sayohatlar, ishonchli tashkilotchilar va sizga mos yo'nalishlar — barchasi bir joyda.
            </p>

            {/* CTA Buttons */}
            <div className="hero-cta-group">
              <button 
                type="button" 
                className="btn btn-primary btn-hero" 
                onClick={onExploreTours}
              >
                Turlarni ko'rish
              </button>
              <button 
                type="button" 
                className="btn btn-secondary btn-hero" 
                onClick={onExploreDestinations}
              >
                Yo'nalishlarni kashf etish
              </button>
            </div>
          </div>

          {/* Floating Search Bar */}
          <div className="hero-search-wrapper">
            <form className="hero-search-card" onSubmit={handleFormSubmit}>
              {/* Field 1: Qidiruv input */}
              <div className="search-field search-field-text">
                <label htmlFor="search-input" className="search-label">Qidiruv</label>
                <div className="search-input-box">
                  <input
                    id="search-input"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Shahar, tur yoki tashkilotchi"
                    className="search-input"
                    autoComplete="off"
                  />
                </div>
              </div>

              {/* Divider */}
              <div className="search-divider" aria-hidden="true"></div>

              {/* Field 2: Yo'nalish dropdown */}
              <div className="search-field search-field-dest">
                <label className="search-label">Yo'nalish</label>
                <div 
                  className={`search-dropdown-trigger ${dropdownOpen ? 'is-active' : ''}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setDropdownOpen(!dropdownOpen); }}
                >
                  <span className="selected-dest-text">{currentDestLabel}</span>
                  <ChevronDown size={18} className={`chevron-icon ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div className="search-dropdown-menu">
                    {destinationOptions.map((opt) => (
                      <div
                        key={opt.value}
                        className={`search-dropdown-item ${selectedDestination === opt.value ? 'selected' : ''}`}
                        onClick={() => handleSelectDestination(opt)}
                      >
                        <MapPin size={14} className="dropdown-pin-icon" />
                        <span>{opt.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Search Submit Button */}
              <div className="search-btn-wrapper">
                <button type="submit" className="btn btn-primary btn-search-submit">
                  <Search size={16} className="search-icon-svg" />
                  <span>Qidirish</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

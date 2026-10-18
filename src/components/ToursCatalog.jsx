import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, 
  Heart, 
  X, 
  RotateCcw, 
  ChevronDown, 
  Check, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Clock 
} from 'lucide-react';
import './ToursCatalog.css';

const SORT_OPTIONS = [
  { value: 'recommended', label: 'Tavsiya etilgan', icon: Sparkles },
  { value: 'price_asc', label: 'Narx: arzonroq', icon: TrendingDown },
  { value: 'price_desc', label: 'Narx: qimmatroq', icon: TrendingUp },
  { value: 'date_asc', label: "Sana bo'yicha", icon: Calendar },
  { value: 'duration', label: 'Davomiyligi', icon: Clock },
];

export default function ToursCatalog({ 
  tours = [], 
  destinations = [], 
  onSelectTour, 
  onToggleLike,
  initialDestination = 'all',
  initialCategory = 'all',
  initialOrgType = 'all',
  initialSearchQuery = '',
  isLoading = false
}) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedDestination, setSelectedDestination] = useState(initialDestination);
  const [selectedDate, setSelectedDate] = useState('all');
  const [selectedOrgType, setSelectedOrgType] = useState(initialOrgType); // 'all', 'guide', 'operator'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory); // 'all', 'Tarixiy', etc.
  const [selectedPriceRange, setSelectedPriceRange] = useState('all'); // 'all', 'under_1m', '1m_3m', 'above_3m'
  const [selectedDuration, setSelectedDuration] = useState('all'); // 'all', '1_day', '2_3_days', '4_plus_days'
  const [sortBy, setSortBy] = useState('recommended'); // 'recommended', 'price_asc', 'price_desc', 'date_asc', 'duration'
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  // Close sort dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSortDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const activeSortOption = useMemo(() => {
    return SORT_OPTIONS.find(opt => opt.value === sortBy) || SORT_OPTIONS[0];
  }, [sortBy]);

  const ActiveSortIcon = activeSortOption.icon;

  // Pagination / Load More state (6 initial cards, remaining 4 matches Screenshot 1 'Yana ko\'rsatish (4)')
  const [visibleCount, setVisibleCount] = useState(6);
  const [mobileFilterModalOpen, setMobileFilterModalOpen] = useState(false);

  // Active filter count for mobile badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedDestination !== 'all') count++;
    if (selectedDate !== 'all') count++;
    if (selectedOrgType !== 'all') count++;
    if (selectedPriceRange !== 'all') count++;
    if (selectedDuration !== 'all') count++;
    return count;
  }, [selectedDestination, selectedDate, selectedOrgType, selectedPriceRange, selectedDuration]);

  // Categories list matching screenshot
  const categoryOptions = [
    { label: "Tarixiy", value: "Tarixiy" },
    { label: "Tog' va tabiat", value: "Tog' va tabiat" },
    { label: "Madaniy", value: "Madaniy" },
    { label: "Gastronomik", value: "Gastronomik" },
    { label: "Sahro", value: "Sahro" }
  ];

  // Price range options matching screenshot
  const priceRangeOptions = [
    { label: "1 mln so'mgacha", value: "under_1m" },
    { label: "1-3 mln so'm", value: "1m_3m" },
    { label: "3 mln so'mdan yuqori", value: "above_3m" }
  ];

  // Duration options matching screenshot
  const durationOptions = [
    { label: "1 kun", value: "1_day" },
    { label: "2-3 kun", value: "2_3_days" },
    { label: "4 kun va undan ko'p", value: "4_plus_days" }
  ];

  // Organizer type toggle
  const handleOrgTypeClick = (val) => {
    setSelectedOrgType(val);
    setVisibleCount(6);
  };

  // Category pill toggle
  const handleCategoryClick = (catVal) => {
    setSelectedCategory(prev => prev === catVal ? 'all' : catVal);
    setVisibleCount(6);
  };

  // Price pill toggle
  const handlePriceClick = (priceVal) => {
    setSelectedPriceRange(prev => prev === priceVal ? 'all' : priceVal);
    setVisibleCount(6);
  };

  // Duration pill toggle
  const handleDurationClick = (durVal) => {
    setSelectedDuration(prev => prev === durVal ? 'all' : durVal);
    setVisibleCount(6);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedDestination('all');
    setSelectedDate('all');
    setSelectedOrgType('all');
    setSelectedCategory('all');
    setSelectedPriceRange('all');
    setSelectedDuration('all');
    setSortBy('recommended');
    setVisibleCount(6);
  };

  // Filtering & Sorting logic
  const filteredAndSortedTours = useMemo(() => {
    let list = [...tours];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(t => 
        (t.title && t.title.toLowerCase().includes(q)) ||
        (t.location && t.location.toLowerCase().includes(q)) ||
        (t.organizerName && t.organizerName.toLowerCase().includes(q)) ||
        (t.organizerType && t.organizerType.toLowerCase().includes(q)) ||
        (t.tag && t.tag.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // 2. Destination
    if (selectedDestination !== 'all') {
      const destLower = selectedDestination.toLowerCase();
      list = list.filter(t => 
        (t.location && t.location.toLowerCase().includes(destLower)) ||
        (t.title && t.title.toLowerCase().includes(destLower))
      );
    }

    // 3. Organizer Type (Gid vs Turoperator)
    if (selectedOrgType !== 'all') {
      if (selectedOrgType === 'guide') {
        list = list.filter(t => t.organizerType?.toLowerCase().includes('gid') || t.organizerType?.toLowerCase().includes('guide'));
      } else if (selectedOrgType === 'operator') {
        list = list.filter(t => t.organizerType?.toLowerCase().includes('operator') || t.organizerType?.toLowerCase().includes('turoperator'));
      }
    }

    // 4. Category
    if (selectedCategory !== 'all') {
      const catLower = selectedCategory.toLowerCase();
      list = list.filter(t => 
        (t.tag && t.tag.toLowerCase().includes(catLower)) ||
        (t.category && t.category.toLowerCase().includes(catLower))
      );
    }

    // 5. Price Range
    if (selectedPriceRange !== 'all') {
      list = list.filter(t => {
        const p = t.price || 0;
        if (selectedPriceRange === 'under_1m') return p <= 1000000;
        if (selectedPriceRange === '1m_3m') return p > 1000000 && p <= 3000000;
        if (selectedPriceRange === 'above_3m') return p > 3000000;
        return true;
      });
    }

    // 6. Duration
    if (selectedDuration !== 'all') {
      list = list.filter(t => {
        const rawDays = t.days || (t.duration?.includes('1 kun') ? 1 : t.duration?.includes('2') || t.duration?.includes('3') ? 2 : 4) || 1;
        if (selectedDuration === '1_day') return rawDays === 1;
        if (selectedDuration === '2_3_days') return rawDays >= 2 && rawDays <= 3;
        if (selectedDuration === '4_plus_days') return rawDays >= 4;
        return true;
      });
    }

    // 7. Sorting
    if (sortBy === 'price_asc') {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'duration') {
      list.sort((a, b) => (a.days || 1) - (b.days || 1));
    }

    return list;
  }, [tours, searchQuery, selectedDestination, selectedOrgType, selectedCategory, selectedPriceRange, selectedDuration, sortBy]);

  // Sliced for pagination (matching screenshot)
  const displayedTours = useMemo(() => {
    return filteredAndSortedTours.slice(0, visibleCount);
  }, [filteredAndSortedTours, visibleCount]);

  const remainingCount = filteredAndSortedTours.length - visibleCount;

  return (
    <div className="tours-catalog-wrapper">
      <div className="tours-catalog-container">
        {/* Header Section (Matching Screenshot) */}
        <div className="catalog-header">
          <h1 className="catalog-main-title">
            O'zingizga mos <br className="catalog-br-mobile" />
            turni toping
          </h1>
          <p className="catalog-subtitle">
            Gidlar va turoperatorlarning barcha turlari — yo'nalish, sana va byudjet bo'yicha saralang.
          </p>

          {/* Search Bar Input (Matching Screenshot) */}
          <div className="catalog-search-bar">
            <Search size={18} className="catalog-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(10); }}
              placeholder="Tur nomi, shahar yoki tashkilotchi"
              className="catalog-search-input"
            />
            {searchQuery && (
              <button 
                type="button" 
                className="catalog-search-clear" 
                onClick={() => setSearchQuery('')}
                aria-label="Tozalash"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mobile Filter Chips Row (100% Matching Screenshots 4 & 5) */}
          <div className="catalog-mobile-filter-bar">
            <button 
              type="button" 
              className={`catalog-mobile-filter-btn ${activeFilterCount > 0 ? 'has-active' : ''}`}
              onClick={() => setMobileFilterModalOpen(true)}
            >
              <span>Filtrlar</span>
              {activeFilterCount > 0 && <span className="filter-badge-dot">{activeFilterCount}</span>}
            </button>

            {categoryOptions.map((cat) => (
              <button
                key={cat.value}
                type="button"
                className={`catalog-quick-chip ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="catalog-mobile-filter-divider"></div>
        </div>

        {/* 2-Column Content Layout (Matching Screenshot) */}
        <div className="catalog-layout-grid">
          {/* LEFT SIDEBAR FILTERS */}
          <aside className="catalog-sidebar">
            {/* Filter 1: Yo'nalish */}
            <div className="filter-group">
              <label className="filter-group-title" htmlFor="cat-dest-select">Yo'nalish</label>
              <select
                id="cat-dest-select"
                value={selectedDestination}
                onChange={(e) => { setSelectedDestination(e.target.value); setVisibleCount(6); }}
                className="filter-select"
              >
                <option value="all">Barcha yo'nalishlar</option>
                {destinations.map((d) => (
                  <option key={d.key || d.name || d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 2: Sana */}
            <div className="filter-group">
              <label className="filter-group-title" htmlFor="cat-date-select">Sana</label>
              <select
                id="cat-date-select"
                value={selectedDate}
                onChange={(e) => { setSelectedDate(e.target.value); setVisibleCount(6); }}
                className="filter-select"
              >
                <option value="all">Istalgan sana</option>
                <option value="today">Bugun / Ertaga</option>
                <option value="this_week">Shu hafta</option>
                <option value="this_month">Shu oy</option>
              </select>
            </div>

            {/* Filter 3: Tashkilotchi turi */}
            <div className="filter-group">
              <span className="filter-group-title">Tashkilotchi turi</span>
              <div className="filter-pills-row">
                <button
                  type="button"
                  className={`filter-pill-btn ${selectedOrgType === 'all' ? 'active' : ''}`}
                  onClick={() => handleOrgTypeClick('all')}
                >
                  Barchasi
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${selectedOrgType === 'guide' ? 'active' : ''}`}
                  onClick={() => handleOrgTypeClick('guide')}
                >
                  Gid
                </button>
                <button
                  type="button"
                  className={`filter-pill-btn ${selectedOrgType === 'operator' ? 'active' : ''}`}
                  onClick={() => handleOrgTypeClick('operator')}
                >
                  Turoperator
                </button>
              </div>
            </div>

            {/* Filter 4: Tur kategoriyasi */}
            <div className="filter-group">
              <span className="filter-group-title">Tur kategoriyasi</span>
              <div className="filter-pills-row">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`filter-pill-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(cat.value)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 5: Narx oralig'i */}
            <div className="filter-group">
              <span className="filter-group-title">Narx oralig'i</span>
              <div className="filter-pills-row">
                {priceRangeOptions.map((price) => (
                  <button
                    key={price.value}
                    type="button"
                    className={`filter-pill-btn ${selectedPriceRange === price.value ? 'active' : ''}`}
                    onClick={() => handlePriceClick(price.value)}
                  >
                    {price.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter 6: Davomiyligi */}
            <div className="filter-group">
              <span className="filter-group-title">Davomiyligi</span>
              <div className="filter-pills-row">
                {durationOptions.map((dur) => (
                  <button
                    key={dur.value}
                    type="button"
                    className={`filter-pill-btn ${selectedDuration === dur.value ? 'active' : ''}`}
                    onClick={() => handleDurationClick(dur.value)}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT CATALOG TOURS CONTENT */}
          <main className="catalog-content-col">
            {/* Top Bar: Results Count + Sort (Matching Screenshot) */}
            <div className="catalog-top-bar">
              <div className="catalog-results-count">
                {filteredAndSortedTours.length} ta tur topildi
              </div>

              <div className="catalog-sort-group" ref={sortDropdownRef}>
                <span className="catalog-sort-label">Saralash:</span>
                <div className="catalog-sort-dropdown-wrap">
                  <button
                    type="button"
                    className={`catalog-sort-trigger ${sortDropdownOpen ? 'is-open' : ''}`}
                    onClick={() => setSortDropdownOpen(prev => !prev)}
                    aria-haspopup="listbox"
                    aria-expanded={sortDropdownOpen}
                  >
                    <span className="catalog-sort-trigger-content">
                      <ActiveSortIcon size={15} className="catalog-sort-trigger-icon" />
                      <span className="catalog-sort-trigger-text">{activeSortOption.label}</span>
                    </span>
                    <ChevronDown size={15} className={`catalog-sort-chevron ${sortDropdownOpen ? 'is-open' : ''}`} />
                  </button>

                  {sortDropdownOpen && (
                    <div className="catalog-sort-menu" role="listbox">
                      {SORT_OPTIONS.map((opt) => {
                        const isSelected = sortBy === opt.value;
                        const OptionIcon = opt.icon;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`catalog-sort-option ${isSelected ? 'is-selected' : ''}`}
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortDropdownOpen(false);
                            }}
                          >
                            <span className="catalog-sort-option-left">
                              <OptionIcon size={15} className="catalog-sort-option-icon" />
                              <span className="catalog-sort-option-label">{opt.label}</span>
                            </span>
                            {isSelected && (
                              <Check size={14} className="catalog-sort-option-check" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cards Grid: 3 columns matching screenshot */}
            {isLoading ? (
              <div className="catalog-tours-grid">
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <div key={n} className="catalog-tour-card" style={{ height: '340px', background: 'var(--color-bg-card)' }} />
                ))}
              </div>
            ) : displayedTours.length > 0 ? (
              <>
                <div className="catalog-tours-grid">
                  {displayedTours.map((tour) => {
                    const isOperator = tour.organizerType?.toLowerCase().includes('operator') || tour.organizerType?.toLowerCase().includes('turoperator');

                    return (
                      <div
                        key={tour.id}
                        className="catalog-tour-card"
                        onClick={() => onSelectTour(tour)}
                      >
                        {/* Image wrap with Category Badge & Heart (Matching Screenshot) */}
                        <div className="catalog-card-image-wrap">
                          {tour.image ? (
                            <img
                              src={tour.image}
                              alt={tour.title}
                              className="catalog-card-img"
                              loading="lazy"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div className="catalog-card-placeholder">
                              <span>🏕️</span>
                            </div>
                          )}

                          {/* Category Badge on Top Left */}
                          {tour.tag && (
                            <span className="catalog-category-badge">
                              {tour.tag}
                            </span>
                          )}

                          {/* Heart Button on Top Right (Empty or Red filled matching screenshot) */}
                          <button
                            type="button"
                            className={`catalog-heart-btn ${tour.isLiked ? 'is-liked' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleLike(tour.id);
                            }}
                            aria-label={tour.isLiked ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
                          >
                            <Heart
                              size={16}
                              fill={tour.isLiked ? "#ef4444" : "none"}
                              stroke={tour.isLiked ? "#ef4444" : "currentColor"}
                            />
                          </button>
                        </div>

                        {/* Card Body (Matching Screenshot) */}
                        <div className="catalog-card-body">
                          {/* Location and Duration: Samarqand · 1 kun */}
                          <div className="catalog-card-meta">
                            {tour.location && <span>{tour.location}</span>}
                            {tour.location && tour.duration && <span> · </span>}
                            {tour.duration && <span>{tour.duration}</span>}
                          </div>

                          {/* Title */}
                          <h3 className="catalog-card-title">
                            {tour.title}
                          </h3>

                          {/* Footer: Price & Organizer Tag */}
                          <div className="catalog-card-footer">
                            <span className="catalog-card-price">
                              {tour.formattedPrice || (tour.price !== null ? `${tour.price} UZS` : "Narx so'ralmoqda")}
                            </span>

                            <span className={`catalog-organizer-badge ${isOperator ? 'is-operator' : 'is-guide'}`}>
                              {tour.organizerType || (isOperator ? "Turoperator" : "Gid")}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Load More Button (Matching Screenshot: Yana ko'rsatish (4)) */}
                {remainingCount > 0 && (
                  <div className="catalog-load-more-row">
                    <button
                      type="button"
                      className="catalog-load-more-btn"
                      onClick={() => setVisibleCount(prev => prev + 6)}
                    >
                      Yana ko'rsatish ({remainingCount})
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Honest Empty State when filters yield no matches */
              <div className="catalog-empty-state">
                <div className="catalog-empty-icon">🔍</div>
                <h3 className="catalog-empty-title">Mos turlar topilmadi</h3>
                <p className="catalog-empty-desc">
                  Tanlangan parametrlar bo'yicha turlar mavjud emas. Filtrlarni tozalab ko'ring.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleResetFilters}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <RotateCcw size={16} />
                  <span>Filtrlarni tozalash</span>
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer / Bottom Sheet Modal */}
      {mobileFilterModalOpen && (
        <div className="mobile-filter-modal-backdrop" onClick={() => setMobileFilterModalOpen(false)}>
          <div className="mobile-filter-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-filter-modal-header">
              <h3 className="mobile-filter-modal-title">Filtrlar</h3>
              <button 
                type="button" 
                className="mobile-filter-modal-close"
                onClick={() => setMobileFilterModalOpen(false)}
                aria-label="Yopish"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-filter-modal-body">
              {/* Filter 1: Yo'nalish */}
              <div className="filter-group">
                <label className="filter-group-title" htmlFor="mob-cat-dest-select">Yo'nalish</label>
                <select
                  id="mob-cat-dest-select"
                  value={selectedDestination}
                  onChange={(e) => { setSelectedDestination(e.target.value); setVisibleCount(10); }}
                  className="filter-select"
                >
                  <option value="all">Barcha yo'nalishlar</option>
                  {destinations.map((d) => (
                    <option key={d.key || d.name || d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter 2: Sana */}
              <div className="filter-group">
                <label className="filter-group-title" htmlFor="mob-cat-date-select">Sana</label>
                <select
                  id="mob-cat-date-select"
                  value={selectedDate}
                  onChange={(e) => { setSelectedDate(e.target.value); setVisibleCount(10); }}
                  className="filter-select"
                >
                  <option value="all">Istalgan sana</option>
                  <option value="today">Bugun / Ertaga</option>
                  <option value="this_week">Shu hafta</option>
                  <option value="this_month">Shu oy</option>
                </select>
              </div>

              {/* Filter 3: Tashkilotchi turi */}
              <div className="filter-group">
                <span className="filter-group-title">Tashkilotchi turi</span>
                <div className="filter-pills-row">
                  <button
                    type="button"
                    className={`filter-pill-btn ${selectedOrgType === 'all' ? 'active' : ''}`}
                    onClick={() => handleOrgTypeClick('all')}
                  >
                    Barchasi
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${selectedOrgType === 'guide' ? 'active' : ''}`}
                    onClick={() => handleOrgTypeClick('guide')}
                  >
                    Gid
                  </button>
                  <button
                    type="button"
                    className={`filter-pill-btn ${selectedOrgType === 'operator' ? 'active' : ''}`}
                    onClick={() => handleOrgTypeClick('operator')}
                  >
                    Turoperator
                  </button>
                </div>
              </div>

              {/* Filter 4: Narx oralig'i */}
              <div className="filter-group">
                <span className="filter-group-title">Narx oralig'i</span>
                <div className="filter-pills-row">
                  {priceRangeOptions.map((price) => (
                    <button
                      key={price.value}
                      type="button"
                      className={`filter-pill-btn ${selectedPriceRange === price.value ? 'active' : ''}`}
                      onClick={() => handlePriceClick(price.value)}
                    >
                      {price.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 5: Davomiyligi */}
              <div className="filter-group">
                <span className="filter-group-title">Davomiyligi</span>
                <div className="filter-pills-row">
                  {durationOptions.map((dur) => (
                    <button
                      key={dur.value}
                      type="button"
                      className={`filter-pill-btn ${selectedDuration === dur.value ? 'active' : ''}`}
                      onClick={() => handleDurationClick(dur.value)}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mobile-filter-modal-footer">
              <button
                type="button"
                className="btn btn-outline mobile-filter-reset-btn"
                onClick={handleResetFilters}
              >
                Tozalash
              </button>
              <button
                type="button"
                className="btn btn-primary mobile-filter-apply-btn"
                onClick={() => setMobileFilterModalOpen(false)}
              >
                Natijalar ({filteredAndSortedTours.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

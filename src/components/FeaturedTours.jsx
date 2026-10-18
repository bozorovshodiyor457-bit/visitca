import React, { useRef, useState } from 'react';
import { Heart, Star } from 'lucide-react';
import './FeaturedTours.css';

export default function FeaturedTours({ 
  tours = [], 
  onToggleLike, 
  onSelectTour, 
  activeCategory, 
  setActiveCategory,
  onViewAll,
  isLoading,
  errorMessage,
  onRefresh
}) {
  const swiperRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [draggedDistance, setDraggedDistance] = useState(0);

  // Build dynamic categories list from current tours + all
  const categories = [
    { label: "Barchasi", value: "all" },
    { label: "Tarixiy", value: "Tarixiy" },
    { label: "Sahro", value: "Sahro" },
    { label: "Tog' va tabiat", value: "Tog' va tabiat" },
    { label: "Madaniy", value: "Madaniy" },
    { label: "Gastro", value: "Gastro" }
  ];

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (!swiperRef.current) return;
    setIsDragging(true);
    setDraggedDistance(0);
    setStartX(e.pageX - swiperRef.current.offsetLeft);
    setScrollLeft(swiperRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !swiperRef.current) return;
    const x = e.pageX - swiperRef.current.offsetLeft;
    const distance = x - startX;
    setDraggedDistance(Math.abs(distance));
    swiperRef.current.scrollLeft = scrollLeft - distance;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handlers to prevent click on swipe
  const handleTouchStart = () => {
    setDraggedDistance(0);
  };

  const handleTouchMove = () => {
    setDraggedDistance(prev => prev + 1);
  };

  const handleCardClick = (tour) => {
    if (draggedDistance > 8) {
      return; // Dragged/swiped, don't trigger click
    }
    onSelectTour(tour);
  };

  return (
    <section className="tours-section" id="turlar">
      <div className="container tours-container">
        {/* Section Header */}
        <div className="section-header-row">
          <div className="section-title-wrap">
            <h2 className="section-title">Tanlangan turlar</h2>
            <p className="section-subtitle">Yaqin sanalarda jo'naydigan sayohatlar.</p>
          </div>
          
          <button 
            type="button" 
            className="see-all-link"
            onClick={onViewAll}
          >
            <span>Barcha turlar</span>
            <span className="arrow-sym">→</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="tour-categories-pills">
          {categories.map((cat) => (
            <button
              key={cat.value}
              type="button"
              className={`cat-pill ${activeCategory === cat.value ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skeletons when loading */}
        {isLoading ? (
          <div className="tours-swiper-wrapper">
            <div className="tours-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="tour-skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-body">
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line long"></div>
                    <div className="skeleton-line medium" style={{ marginTop: '20px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tours.length > 0 ? (
          /* Swiper Wrapper */
          <div className="tours-swiper-wrapper">
            <div 
              className={`tours-grid ${isDragging ? 'is-dragging' : ''}`}
              ref={swiperRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
            >
              {tours.map((tour) => {
                const isTurop = tour.organizerType?.toLowerCase().includes('turoperator');

                return (
                  <div 
                    key={tour.id} 
                    className="tour-card"
                    onClick={() => handleCardClick(tour)}
                  >
                    {/* Image Banner */}
                    <div className="tour-image-wrap">
                      {tour.image ? (
                        <img 
                          src={tour.image} 
                          alt={tour.title} 
                          className="tour-image" 
                          loading="lazy" 
                          draggable="false"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="tour-image-fallback" style={{ width: '100%', height: '100%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '32px' }}>🏕️</span>
                        </div>
                      )}
                      
                      {/* Top Category Tag */}
                      {tour.tag && (
                        <span className="tour-badge-category">
                          {tour.tag}
                        </span>
                      )}

                      {/* Heart Action Button */}
                      <button
                        type="button"
                        className={`tour-heart-btn ${tour.isLiked ? 'liked' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike(tour.id);
                        }}
                        aria-label={tour.isLiked ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
                      >
                        <Heart 
                          size={18} 
                          className={`heart-icon ${tour.isLiked ? 'heart-filled' : ''}`} 
                        />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="tour-card-body">
                      {/* Meta: Location, Duration & Real Rating */}
                      <div className="tour-meta-info">
                        {tour.location && <span>{tour.location}</span>}
                        {tour.location && tour.duration && <span className="meta-dot">·</span>}
                        {tour.duration && <span>{tour.duration}</span>}
                        {tour.rating !== null && tour.rating > 0 && (
                          <>
                            <span className="meta-dot">·</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontWeight: 600 }}>
                              <Star size={13} fill="#f59e0b" /> {tour.rating.toFixed(1)}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="tour-title">
                        {tour.title}
                      </h3>

                      {/* Footer: Price & Organizer Tag */}
                      <div className="tour-card-footer">
                        <div className="tour-price">
                          {tour.formattedPrice || (tour.price !== null ? `${tour.price} UZS` : "Narx so'ralmoqda")}
                        </div>
                        
                        <span className={`badge-organizer ${isTurop ? 'badge-turop' : 'badge-gid'}`}>
                          {tour.organizerType}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : errorMessage ? (
          <div className="empty-backend-state">
            <div className="empty-icon-wrap">⚠️</div>
            <h3>Turlarni yuklashda xatolik yuz berdi</h3>
            <p>{errorMessage}</p>
            {onRefresh && (
              <button 
                type="button" 
                className="btn btn-primary btn-reload-tours"
                onClick={onRefresh}
              >
                <span>🔄 Qayta urinib ko'rish</span>
              </button>
            )}
          </div>
        ) : (
          <div className="empty-backend-state">
            <div className="empty-icon-wrap">🏖️</div>
            <h3>Hozircha turlar mavjud emas</h3>
            <p>
              Ushbu parametrlar bo'yicha turlar topilmadi. Qidiruv yoki filtrlarni o'zgartirib ko'ring.
            </p>
            {onRefresh && (
              <button 
                type="button" 
                className="btn btn-primary btn-reload-tours"
                onClick={onRefresh}
              >
                <span>🔄 Qayta tekshirish</span>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

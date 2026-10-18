import React, { useState, useEffect, useMemo } from 'react';
import { Check, Minus, Heart, AlertCircle } from 'lucide-react';
import { getTourBySlug, getSimilarTours, getTours, getOrganizer } from '../services/api';
import { normalizeTour, formatDateUz } from '../services/tourAdapter';
import './TourDetailsPage.css';

export default function TourDetailsPage({
  initialTour,
  tourId,
  onBack,
  onBookTour,
  onSelectSimilarTour,
  onSelectOrganizer,
  onToggleLike
}) {
  // Real tour state loaded from backend API or fallback
  const [tour, setTour] = useState(() => (initialTour ? normalizeTour(initialTour) : null));
  const [isLoading, setIsLoading] = useState(!initialTour);
  const [loadError, setLoadError] = useState(null);

  // Similar tours state loaded from backend API or fallback
  const [similarTours, setSimilarTours] = useState([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  // Booking widget interactive controls
  const [selectedDepartureId, setSelectedDepartureId] = useState(null);
  const [personCount, setPersonCount] = useState(1);

  // 1. Fetch full details from backend: GET /api/tours/:slug
  // Prefer slug because Railway backend endpoint exclusively accepts slug
  const targetId = initialTour?.slug || tourId || initialTour?.id;

  // Real organizer profile state from GET /api/organizers/:slug
  const organizerSlug = tour?.organizer?.slug || tour?.organizerSlug || (typeof tour?.organizer === 'string' ? tour.organizer : null) || tour?.organizerId || null;
  const [organizerDetails, setOrganizerDetails] = useState(null);

  useEffect(() => {
    let isMounted = true;
    if (!organizerSlug) {
      setOrganizerDetails(null);
      return;
    }

    getOrganizer(organizerSlug)
      .then(res => {
        const orgData = res?.organizer || res?.data || res;
        if (isMounted && orgData) {
          setOrganizerDetails(orgData);
        }
      })
      .catch(err => {
        console.warn("Tashkilotchi ma'lumotlarini yuklab bo'lmadi:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, [organizerSlug]);

  useEffect(() => {
    let isMounted = true;
    if (!targetId) return;

    const fetchTourDetails = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await getTourBySlug(targetId);
        const raw = res?.tour || res?.data || res;
        if (isMounted && raw) {
          const normalized = normalizeTour(raw);
          setTour(normalized);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Tur tafsilotlarini yuklab bo'lmadi:", err.message);
      }

      // Fallback if backend offline
      if (isMounted) {
        if (initialTour) {
          setTour(normalizeTour(initialTour));
        } else {
          setLoadError("Tur ma'lumotlarini yuklab bo'lmadi");
        }
        setIsLoading(false);
      }
    };

    fetchTourDetails();

    return () => {
      isMounted = false;
    };
  }, [targetId, initialTour]);

  // 2. Fetch similar tours from backend: GET /api/tours/:id/similar
  useEffect(() => {
    let isMounted = true;
    if (!targetId) return;

    const fetchSimilar = async () => {
      setIsLoadingSimilar(true);
      try {
        const res = await getSimilarTours(targetId);
        const items = Array.isArray(res) ? res : (res?.items || res?.tours || res?.data || []);
        if (isMounted && items.length > 0) {
          const normalizedItems = items.map(item => normalizeTour(item)).filter(Boolean);
          setSimilarTours(normalizedItems);
          setIsLoadingSimilar(false);
          return;
        }
      } catch (err) {
        console.warn("O'xshash turlar yuklanmadi:", err.message);
      }

      // Try fetching other real tours from backend GET /api/tours
      try {
        const resAll = await getTours();
        const allItems = Array.isArray(resAll) ? resAll : (resAll?.items || resAll?.tours || resAll?.data || []);
        const otherBackendTours = allItems
          .filter(t => String(t.id) !== String(targetId) && t.slug !== targetId)
          .map(t => normalizeTour(t))
          .filter(Boolean);

        if (isMounted && otherBackendTours.length > 0) {
          setSimilarTours(otherBackendTours);
          setIsLoadingSimilar(false);
          return;
        }
      } catch (err) {
        console.warn("Backenddan boshqa turlarni yuklab bo'lmadi:", err.message);
      }

      // Backendda o'xshash turlar mavjud bo'lmasa, defolt/mock turlar qo'yilmaydi!
      if (isMounted) {
        setSimilarTours([]);
        setIsLoadingSimilar(false);
      }
    };

    fetchSimilar();

    return () => {
      isMounted = false;
    };
  }, [targetId]);

  // Sync selected departure once tour data is available
  useEffect(() => {
    if (tour?.departures && tour.departures.length > 0) {
      setSelectedDepartureId(prev => prev || tour.departures[0].id);
    }
  }, [tour]);

  // Current selected departure object
  const selectedDeparture = useMemo(() => {
    if (!tour?.departures || tour.departures.length === 0) return null;
    return tour.departures.find(d => d.id === selectedDepartureId) || tour.departures[0];
  }, [tour, selectedDepartureId]);

  // Limits for traveler counter
  const maxTravelers = useMemo(() => {
    if (selectedDeparture?.seatsLeft !== null && selectedDeparture?.seatsLeft !== undefined) {
      return Math.max(1, selectedDeparture.seatsLeft);
    }
    return tour?.groupMax || 15;
  }, [selectedDeparture, tour]);

  const minTravelers = tour?.groupMin || 1;

  const handleDecrement = () => {
    setPersonCount(prev => Math.max(minTravelers, prev - 1));
  };

  const handleIncrement = () => {
    setPersonCount(prev => Math.min(maxTravelers, prev + 1));
  };

  // Booking action
  const handleBookNow = () => {
    if (!tour) return;
    if (onBookTour) {
      onBookTour({
        tour,
        selectedDeparture,
        personCount
      });
    }
  };

  const orgName = organizerDetails?.name || organizerDetails?.company_name || tour?.organizerName || tour?.organizer?.name || '';
  const rawType = organizerDetails?.type || tour?.organizer?.type || tour?.organizerType;
  const orgType = (rawType === 'operator' || rawType === 'turoperator') ? 'Turoperator' : (rawType === 'guide' ? 'Gid' : (tour?.organizerType || 'Tashkilotchi'));
  const orgSlug = organizerDetails?.slug || tour?.organizer?.slug || tour?.organizerSlug || tour?.organizerId || null;
  const orgLogo = organizerDetails?.logoUrl || organizerDetails?.avatar || tour?.organizer?.avatar || null;
  const orgToursCount = organizerDetails?.tourCount ?? (Array.isArray(organizerDetails?.tours) ? organizerDetails.tours.length : (tour?.organizer?.toursCount || null));

  // Organizer initials for avatar fallback
  const organizerInitials = useMemo(() => {
    if (!orgName) return 'TR';
    const words = orgName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return orgName.slice(0, 2).toUpperCase();
  }, [orgName]);

  // Cancellation policy formatting
  const cancellationText = useMemo(() => {
    if (!tour) return '';
    if (typeof tour.cancellationPolicy === 'string') {
      if (tour.cancellationPolicy.toLowerCase() === 'standard') {
        return "7 kun oldin — to'liq qaytariladi; 3–7 kun oldin — 50%.";
      }
      if (tour.cancellationPolicy.toLowerCase() === 'strict') {
        return "14 kun oldin — 100% qaytariladi; 7–14 kun oldin — 50%; 7 kundan kam qolganda — qaytarilmaydi.";
      }
      if (tour.cancellationPolicy.toLowerCase() === 'flexible') {
        return "24 soat oldin bepul bekor qilish mumkin.";
      }
      return tour.cancellationPolicy;
    }
    return "Backendda bekor qilish shartlari ko'rsatilmagan.";
  }, [tour]);

  // Meeting point address helper
  const meetingPointAddress = useMemo(() => {
    const mp = tour?.meetingPoint || tour?.raw?.meeting_point;
    if (!mp) return null;
    if (typeof mp === 'object') return mp.address || mp.name || null;
    if (typeof mp === 'string') {
      try {
        const parsed = JSON.parse(mp);
        if (parsed.address) return parsed.address;
      } catch {
        // ignore
      }
      return mp;
    }
    return null;
  }, [tour]);

  // Hotel details helper
  const hotelInfo = useMemo(() => {
    const h = tour?.raw?.hotel_details || tour?.hotel_details;
    if (!h) return null;
    if (typeof h === 'object') {
      const parts = [h.hotel_name, h.stars ? `${h.stars} yulduzli` : '', h.room_type].filter(Boolean);
      return parts.join(' · ');
    }
    if (typeof h === 'string') {
      try {
        const parsed = JSON.parse(h);
        const parts = [parsed.hotel_name, parsed.stars ? `${parsed.stars} yulduzli` : '', parsed.room_type].filter(Boolean);
        if (parts.length) return parts.join(' · ');
      } catch {
        // ignore
      }
      return h;
    }
    return null;
  }, [tour]);

  // Transport details helper
  const transportInfo = useMemo(() => {
    const t = tour?.raw?.transport_details || tour?.transport_details;
    if (!t) return null;
    if (typeof t === 'object') return [t.transport_type, t.description].filter(Boolean).join(' · ');
    if (typeof t === 'string') {
      try {
        const parsed = JSON.parse(t);
        return [parsed.transport_type, parsed.description].filter(Boolean).join(' · ');
      } catch {
        // ignore
      }
      return t;
    }
    return null;
  }, [tour]);

  // Meal details helper
  const mealInfo = useMemo(() => {
    const m = tour?.raw?.meal_details || tour?.meal_details;
    if (!m) return null;
    if (typeof m === 'object') return [m.included_meals, m.description].filter(Boolean).join(' · ');
    if (typeof m === 'string') {
      try {
        const parsed = JSON.parse(m);
        return [parsed.included_meals, parsed.description].filter(Boolean).join(' · ');
      } catch {
        // ignore
      }
      return m;
    }
    return null;
  }, [tour]);

  // Loading state
  if (isLoading && !tour) {
    return (
      <div className="tour-detail-wrapper">
        <div className="tour-detail-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div className="catalog-loading-spinner" style={{ margin: '0 auto 20px' }}></div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Tur ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError && !tour) {
    return (
      <div className="tour-detail-wrapper">
        <div className="tour-detail-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Turni yuklab bo'lmadi
          </h2>
          <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '15px' }}>
            {loadError}
          </p>
          <button type="button" className="btn btn-primary" onClick={onBack}>
            ← Barcha turlarga qaytish
          </button>
        </div>
      </div>
    );
  }

  // Safe variables from real backend data
  const title = tour?.title || "Backendda sarlavha yo'q";
  const location = tour?.location || '';
  const duration = tour?.duration || '';
  const organizerName = orgName;
  const organizerType = orgType;
  const categoryTag = tour?.tag || '';
  const price = tour?.price || 0;
  const formattedPrice = tour?.formattedPrice || (price ? `${price.toLocaleString('uz-UZ')} so'm` : "Narx belgilanmagan");
  const totalPrice = (price * personCount).toLocaleString('uz-UZ') + " so'm";

  // Earliest date from backend
  const earliestDeparture = tour?.departures?.[0];
  const earliestDateFormatted = earliestDeparture?.date ? formatDateUz(earliestDeparture.date) : "Backendda sana yo'q";

  // Gallery images from real backend
  const images = tour?.images || [];
  const mainImage = images[0] || tour?.image || '';
  const thumb1 = images[1] || '';
  const thumb2 = images[2] || '';

  return (
    <div className="tour-detail-wrapper">
      <div className="tour-detail-container">
        
        {/* Back Link (Screenshot 1) */}
        <div className="tour-detail-back-row">
          <button 
            type="button" 
            className="tour-detail-back-btn"
            onClick={onBack}
          >
            ← Barcha turlar
          </button>
        </div>

        {/* Header Badges & Title (Screenshot 1) */}
        <div className="tour-detail-header">
          <div className="tour-detail-badges-row">
            <span className="detail-badge-type">{organizerType}</span>
            {categoryTag && <span className="detail-badge-cat">{categoryTag}</span>}
          </div>

          <h1 className="tour-detail-title">{title}</h1>

          <div className="tour-detail-meta-line">
            {location && <span>{location}</span>}
            {location && duration && <span className="dot">·</span>}
            {duration && <span>{duration}</span>}
            {organizerName && <span className="dot">·</span>}
            {organizerName && <span>{organizerName}</span>}
          </div>
        </div>

        {/* Gallery Section (Screenshot 1: 2/3 main, 1/3 stacked thumbs) */}
        <div className="tour-detail-gallery">
          {/* Main Large Image */}
          <div className="gallery-main-img-box">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={title} 
                className="gallery-main-img" 
              />
            ) : (
              <div className="gallery-placeholder">
                <span style={{ fontSize: '36px' }}>🖼️</span>
                <span>Backendda rasm mavjud emas</span>
              </div>
            )}
          </div>

          {/* Right Column Stacked Thumbs */}
          <div className="gallery-thumbs-col">
            <div className="gallery-thumb-box">
              {thumb1 ? (
                <img 
                  src={thumb1} 
                  alt={`${title} - 2`} 
                  className="gallery-thumb-img" 
                />
              ) : (
                <div className="gallery-placeholder">
                  <span>Backendda qo'shimcha rasm yo'q</span>
                </div>
              )}
            </div>

            <div className="gallery-thumb-box">
              {thumb2 ? (
                <img 
                  src={thumb2} 
                  alt={`${title} - 3`} 
                  className="gallery-thumb-img" 
                />
              ) : (
                <div className="gallery-placeholder">
                  <span>Backendda qo'shimcha rasm yo'q</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main 2-Column Layout (Screenshots 2, 3, 4) */}
        <div className="tour-detail-body-grid">
          
          {/* Left Column Content */}
          <div className="tour-detail-left-col">
            
            {/* Quick Meta 4-Box (Screenshot 2: Davomiyligi, Eng yaqin sana, Guruh, Narx) */}
            <div className="tour-quick-meta-card">
              <div className="quick-meta-item">
                <span className="quick-meta-label">Davomiyligi</span>
                <span className="quick-meta-val">
                  {duration || <span className="empty-field-note">Ko'rsatilmagan</span>}
                </span>
              </div>

              <div className="quick-meta-item">
                <span className="quick-meta-label">Eng yaqin sana</span>
                <span className="quick-meta-val">
                  {earliestDateFormatted}
                </span>
              </div>

              <div className="quick-meta-item">
                <span className="quick-meta-label">Guruh</span>
                <span className="quick-meta-val">
                  {tour?.groupMax ? `ko'pi bilan ${tour.groupMax} kishi` : <span className="empty-field-note">Ko'rsatilmagan</span>}
                </span>
              </div>

              <div className="quick-meta-item">
                <span className="quick-meta-label">Narx</span>
                <span className="quick-meta-val">
                  {formattedPrice}
                </span>
              </div>
            </div>

            {/* Tur haqida (Only if provided) */}
            {tour?.description && (
              <div className="detail-section">
                <h2 className="detail-section-title">Tur haqida</h2>
                <p className="detail-desc-text">{tour.description}</p>
              </div>
            )}

            {/* Dastur (Only if provided) */}
            {tour?.itinerary && tour.itinerary.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">Dastur</h2>
                <div className="itinerary-timeline">
                  {tour.itinerary.map((step, idx) => (
                    <div key={idx} className="itinerary-step-item">
                      <div className="itinerary-marker-col">
                        <div className="itinerary-circle-dot"></div>
                        {idx < tour.itinerary.length - 1 && <div className="itinerary-line"></div>}
                      </div>
                      <div className="itinerary-content">
                        <span className="itinerary-day-tag">
                          {step.day ? `${step.day}-kun` : `${idx + 1}-kun`}
                          {step.time && ` · ${step.time}`}
                        </span>
                        <h4 className="itinerary-title">{step.title}</h4>
                        {(step.text || step.description) && (
                          <p className="itinerary-text">{step.text || step.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Narxga kiritilgan va kiritilmagan (Screenshot 3) */}
            <div className="inclusions-exclusions-grid">
              {/* Inclusions */}
              <div className="inclusion-card">
                <h3 className="inclusion-card-title">Narxga kiritilgan</h3>
                {tour?.included && tour.included.length > 0 ? (
                  <ul className="inclusion-items-list">
                    {tour.included.map((item, idx) => (
                      <li key={idx} className="inclusion-item">
                        <span className="inc-icon-check-circle">
                          <Check size={12} strokeWidth={3} />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-field-note">Backendda kiritilgan xizmatlar ko'rsatilmagan.</p>
                )}
              </div>

              {/* Exclusions */}
              <div className="inclusion-card">
                <h3 className="inclusion-card-title">Narxga kiritilmagan</h3>
                {tour?.excluded && tour.excluded.length > 0 ? (
                  <ul className="inclusion-items-list">
                    {tour.excluded.map((item, idx) => (
                      <li key={idx} className="inclusion-item">
                        <span className="inc-icon-minus-circle">
                          <Minus size={12} strokeWidth={3} />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="empty-field-note">Backendda kiritilmagan xizmatlar ko'rsatilmagan.</p>
                )}
              </div>
            </div>

            {/* Uchrashuv joyi, Guruh va Bekor qilish shartlari (Screenshot 3) */}
            <div className="detail-table-list">
              {meetingPointAddress && (
                <div className="detail-table-row">
                  <div className="detail-table-label">Uchrashuv joyi</div>
                  <div className="detail-table-value">
                    {meetingPointAddress}
                  </div>
                </div>
              )}

              {hotelInfo && (
                <div className="detail-table-row">
                  <div className="detail-table-label">Mehmonxona</div>
                  <div className="detail-table-value">
                    {hotelInfo}
                  </div>
                </div>
              )}

              {transportInfo && (
                <div className="detail-table-row">
                  <div className="detail-table-label">Transport</div>
                  <div className="detail-table-value">
                    {transportInfo}
                  </div>
                </div>
              )}

              {mealInfo && (
                <div className="detail-table-row">
                  <div className="detail-table-label">Taomnoma</div>
                  <div className="detail-table-value">
                    {mealInfo}
                  </div>
                </div>
              )}

              <div className="detail-table-row">
                <div className="detail-table-label">Guruh</div>
                <div className="detail-table-value">
                  {tour?.groupMax ? `Ko'pi bilan ${tour.groupMax} kishi.` : ""} {selectedDeparture?.seatsLeft !== null && selectedDeparture?.seatsLeft !== undefined ? `Qolgan joylar: ${selectedDeparture.seatsLeft}.` : ""}
                </div>
              </div>

              <div className="detail-table-row">
                <div className="detail-table-label">Bekor qilish shartlari</div>
                <div className="detail-table-value">
                  {cancellationText}
                </div>
              </div>
            </div>

            {/* Tashkilotchi (Screenshot 4) - Faqat backend ma'lumotlari bo'lganda ko'rsatiladi */}
            {(orgName || orgSlug) && (
              <div className="detail-section">
                <h2 className="detail-section-title">Tashkilotchi</h2>
                <div className="detail-organizer-box">
                  <div className="organizer-left-group">
                    <div className="organizer-avatar-circle">
                      {orgLogo ? (
                        <img src={orgLogo} alt={orgName} />
                      ) : (
                        organizerInitials
                      )}
                    </div>
                    <div className="organizer-info-names">
                      <span className="organizer-name-text">
                        {orgName}
                      </span>
                      <span className="organizer-sub-desc">
                        {orgType}{orgToursCount !== null && orgToursCount !== undefined ? ` · ${orgToursCount} ta tur` : ''}
                      </span>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    className="organizer-profile-link"
                    onClick={() => {
                      if (orgSlug && onSelectOrganizer) {
                        onSelectOrganizer(orgSlug);
                      }
                    }}
                  >
                    Profil →
                  </button>
                </div>
              </div>
            )}

            {/* O'xshash turlar — Faqat backenddan kelganda ko'rsatiladi */}
            {similarTours.length > 0 && (
              <div className="similar-tours-section">
                <h2 className="detail-section-title">O'xshash turlar</h2>
                <div className="similar-tours-grid">
                  {similarTours.slice(0, 3).map((simTour) => (
                    <div 
                      key={simTour.id} 
                      className="catalog-card"
                      onClick={() => onSelectSimilarTour && onSelectSimilarTour(simTour)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="catalog-card-image-wrap">
                        {simTour.image ? (
                          <img 
                            src={simTour.image} 
                            alt={simTour.title} 
                            className="catalog-card-img" 
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="catalog-card-placeholder">
                            <span>🏕️</span>
                          </div>
                        )}
                        {simTour.tag && (
                          <span className="catalog-category-badge">{simTour.tag}</span>
                        )}
                        <button
                          type="button"
                          className={`catalog-heart-btn ${simTour.isLiked ? 'is-liked' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onToggleLike) onToggleLike(simTour.id);
                          }}
                        >
                          <Heart 
                            size={16} 
                            fill={simTour.isLiked ? "#ef4444" : "none"} 
                            stroke={simTour.isLiked ? "#ef4444" : "currentColor"} 
                          />
                        </button>
                      </div>

                      <div className="catalog-card-body">
                        <div className="catalog-card-meta">
                          {simTour.location && <span>{simTour.location}</span>}
                          {simTour.location && simTour.duration && <span> · </span>}
                          {simTour.duration && <span>{simTour.duration}</span>}
                        </div>
                        <h3 className="catalog-card-title">{simTour.title}</h3>
                        <div className="catalog-card-footer">
                          <span className="catalog-card-price">
                            {simTour.formattedPrice || (simTour.price ? `${simTour.price} UZS` : "Narx so'ralmoqda")}
                          </span>
                          <span className="catalog-card-badge">
                            {simTour.organizerType}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column Sticky Booking Widget (Screenshots 2, 3, 4) */}
          <div className="tour-booking-widget">
            
            {/* Price Row */}
            <div className="widget-price-row">
              <span className="widget-price-num">{formattedPrice}</span>
              <span className="widget-price-unit">/ kishi</span>
            </div>

            {/* Jo'nash sanasi Select */}
            <div className="widget-field-group">
              <label className="widget-field-label" htmlFor="departure-select">
                Jo'nash sanasi
              </label>
              {tour?.departures && tour.departures.length > 0 ? (
                <select
                  id="departure-select"
                  className="widget-date-select"
                  value={selectedDepartureId || ''}
                  onChange={(e) => setSelectedDepartureId(Number(e.target.value) || e.target.value)}
                >
                  {tour.departures.map((dep) => (
                    <option key={dep.id} value={dep.id}>
                      {formatDateUz(dep.date) || dep.date}
                    </option>
                  ))}
                </select>
              ) : (
                <select id="departure-select" className="widget-date-select" disabled>
                  <option>Backendda jo'nash sanalari hali yo'q</option>
                </select>
              )}
            </div>

            {/* Sayohatdilar soni Counter */}
            <div className="widget-field-group">
              <label className="widget-field-label">
                Sayohatdilar soni
              </label>
              <div className="widget-counter-control">
                <button
                  type="button"
                  className="widget-counter-btn"
                  onClick={handleDecrement}
                  disabled={personCount <= minTravelers}
                  aria-label="Kamaytirish"
                >
                  −
                </button>
                <span className="widget-counter-num">{personCount}</span>
                <button
                  type="button"
                  className="widget-counter-btn"
                  onClick={handleIncrement}
                  disabled={personCount >= maxTravelers}
                  aria-label="Oshirish"
                >
                  +
                </button>
              </div>

              {/* Spots Left Note */}
              {selectedDeparture?.seatsLeft !== null && selectedDeparture?.seatsLeft !== undefined ? (
                <div className="widget-spots-left-note">
                  Joy bor · {selectedDeparture.seatsLeft} ta joy
                </div>
              ) : (
                <div className="widget-spots-left-note" style={{ color: '#64748b' }}>
                  Joylar: Backendda ko'rsatilmagan
                </div>
              )}
            </div>

            {/* Total Price */}
            <div className="widget-total-row">
              <span className="widget-total-label">Jami summa</span>
              <span className="widget-total-price">
                {price > 0 ? totalPrice : formattedPrice}
              </span>
            </div>

            {/* CTA Button */}
            <button
              type="button"
              className="btn-widget-book"
              onClick={handleBookNow}
            >
              Turni bron qilish
            </button>

            {/* Microcopy footnote */}
            <p className="widget-footnote">
              Keyingi bosqichda ma'lumotlarni tekshirasiz. Hozir to'lov olinmaydi.
            </p>

          </div>

        </div>

      </div>

      {/* Fixed Sticky Mobile Bottom Bar (Screenshots 2, 3, 4) */}
      <div className="tour-mobile-bottom-bar">
        <div className="mobile-bottom-price-box">
          <span className="mobile-bottom-price">{formattedPrice}</span>
          {earliestDateFormatted && earliestDateFormatted !== "Backendda sana yo'q" && (
            <span className="mobile-bottom-date">Jo'nash: {earliestDateFormatted}</span>
          )}
        </div>
        <button
          type="button"
          className="btn-mobile-book"
          onClick={handleBookNow}
        >
          Bron qilish
        </button>
      </div>
    </div>
  );
}

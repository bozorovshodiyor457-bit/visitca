import React, { useState, useEffect, useMemo } from 'react';
import { Heart, AlertCircle } from 'lucide-react';
import { getOrganizer } from '../services/api';
import { normalizeTour } from '../services/tourAdapter';
import './OrganizerProfilePage.css';

export default function OrganizerProfilePage({
  organizerId,
  initialOrganizer,
  onBack,
  onSelectTour,
  onToggleLike
}) {
  const [organizer, setOrganizer] = useState(() => initialOrganizer || null);
  const [isLoading, setIsLoading] = useState(!initialOrganizer);
  const [loadError, setLoadError] = useState(null);

  // Fetch organizer profile and published tours: GET /api/organizers/:id
  useEffect(() => {
    let isMounted = true;
    if (!organizerId) return;

    const fetchOrganizerDetails = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const res = await getOrganizer(organizerId);
        const orgData = res?.organizer || res?.data || res;
        if (isMounted && orgData) {
          setOrganizer(orgData);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Tashkilotchi ma'lumotlarini yuklab bo'lmadi:", err.message);
      }

      if (isMounted) {
        if (!initialOrganizer) {
          setLoadError("Tashkilotchi ma'lumotlarini yuklab bo'lmadi");
        }
        setIsLoading(false);
      }
    };

    fetchOrganizerDetails();

    return () => {
      isMounted = false;
    };
  }, [organizerId]);

  // Normalized tours
  const tours = useMemo(() => {
    const rawTours = organizer?.tours || [];
    return rawTours.map(t => normalizeTour(t)).filter(Boolean);
  }, [organizer]);

  // Organizer details
  const name = organizer?.company_name || organizer?.name || organizer?.user?.full_name || "Tashkilotchi";
  const type = (organizer?.type === 'operator' || organizer?.format === 'multi_day') ? 'Turoperator' : 'Gid';
  const bio = organizer?.bio || null;
  const avatar = organizer?.logoUrl || organizer?.avatar || organizer?.user?.avatar_url || null;
  const languages = Array.isArray(organizer?.languages) ? organizer.languages : [];

  // Initials for avatar
  const initials = useMemo(() => {
    if (!name) return 'TR';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  if (isLoading && !organizer) {
    return (
      <div className="organizer-page-wrapper">
        <div className="organizer-page-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div className="catalog-loading-spinner" style={{ margin: '0 auto 20px' }}></div>
          <p style={{ color: '#64748b', fontSize: '16px' }}>Tashkilotchi ma'lumotlari yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (loadError && !organizer) {
    return (
      <div className="organizer-page-wrapper">
        <div className="organizer-page-container" style={{ padding: '80px 24px', textAlign: 'center' }}>
          <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            Tashkilotchi topilmadi
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

  return (
    <div className="organizer-page-wrapper">
      <div className="organizer-page-container">
        
        {/* Back Link (Matching Screenshot: ← Barcha turlar) */}
        <div className="organizer-back-row">
          <button 
            type="button" 
            className="organizer-back-btn"
            onClick={onBack}
          >
            ← Barcha turlar
          </button>
        </div>

        {/* Organizer Header (Matching Screenshot) */}
        <div className="organizer-profile-header">
          {/* Avatar circle */}
          <div className="organizer-avatar-big">
            {avatar ? (
              <img src={avatar} alt={name} />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* Badge & Title */}
          <div className="organizer-header-info">
            <span className="organizer-badge-pill">{type}</span>
            <h1 className="organizer-profile-name">{name}</h1>
          </div>
        </div>

        {/* Organizer Bio */}
        {bio ? (
          <p className="organizer-bio-text">{bio}</p>
        ) : (
          <p className="organizer-bio-text" style={{ color: '#94a3b8', fontStyle: 'italic' }}>
            Backendda tashkilotchi haqida ma'lumot hali kiritilmagan.
          </p>
        )}

        {/* Organizer Languages (Real Backend Data) */}
        {languages.length > 0 && (
          <div className="organizer-languages-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>Muloqot tillari:</span>
            {languages.map((lang, idx) => (
              <span 
                key={idx} 
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '4px 12px',
                  borderRadius: '999px',
                  background: 'var(--surface-color, #f1f5f9)',
                  color: 'var(--text-main, #0f172a)',
                  border: '1px solid var(--border-color, #e2e8f0)'
                }}
              >
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* Published Tours Section */}
        <div className="organizer-tours-section">
          <h2 className="organizer-tours-section-title">
            E'lon qilingan turlar · {tours.length}
          </h2>

          {tours.length > 0 ? (
            <div className="organizer-tours-grid">
              {tours.map((tour) => (
                <div 
                  key={tour.id} 
                  className="catalog-card"
                  onClick={() => onSelectTour && onSelectTour(tour)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="catalog-card-image-wrap">
                    {tour.image ? (
                      <img 
                        src={tour.image} 
                        alt={tour.title} 
                        className="catalog-card-img" 
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="catalog-card-placeholder">
                        <span>🏕️</span>
                      </div>
                    )}

                    {tour.tag && (
                      <span className="catalog-category-badge">{tour.tag}</span>
                    )}

                    <button
                      type="button"
                      className={`catalog-heart-btn ${tour.isLiked ? 'is-liked' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleLike) onToggleLike(tour.id);
                      }}
                      aria-label="Sevimlilar"
                    >
                      <Heart 
                        size={16} 
                        fill={tour.isLiked ? "#ef4444" : "none"} 
                        stroke={tour.isLiked ? "#ef4444" : "currentColor"} 
                      />
                    </button>
                  </div>

                  <div className="catalog-card-body">
                    <div className="catalog-card-meta">
                      {tour.location && <span>{tour.location}</span>}
                      {tour.location && tour.duration && <span> · </span>}
                      {tour.duration && <span>{tour.duration}</span>}
                    </div>

                    <h3 className="catalog-card-title">{tour.title}</h3>

                    <div className="catalog-card-footer">
                      <span className="catalog-card-price">
                        {tour.formattedPrice || (tour.price ? `${tour.price.toLocaleString('uz-UZ')} UZS` : "Narx so'ralmoqda")}
                      </span>
                      <span className="catalog-card-badge">
                        {tour.organizerType || type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-field-note" style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
              Backendda ushbu tashkilotchi tomonidan e'lon qilingan turlar hali mavjud emas.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

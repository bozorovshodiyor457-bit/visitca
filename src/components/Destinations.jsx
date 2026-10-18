import React from 'react';
import './Destinations.css';

export default function Destinations({ destinations = [], onSelectDestination, isLoading = false }) {
  return (
    <section className="destinations-section" id="yonalishlar">
      <div className="container">
        {/* Section Header */}
        <div className="destinations-header">
          <h2 className="section-title">Mashhur yo'nalishlar</h2>
          <p className="section-subtitle">
            Qadimiy shaharlardan tog' va sahrogacha — yo'nalishni tanlang va mavjud turlarni ko'ring.
          </p>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="destinations-grid">
            {[1, 2, 3].map((n) => (
              <div key={n} className="destination-card skeleton-dest-card" style={{ height: '220px', background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: '16px' }}></div>
            ))}
          </div>
        ) : destinations.length > 0 ? (
          /* Destinations Grid */
          <div className="destinations-grid">
            {destinations.map((dest) => {
              const tourCountNum = dest.tourCount ?? dest.tour_count ?? 0;
              const toursCountLabel = `${tourCountNum} ta tur`;

              return (
                <div 
                  key={dest.id || dest.key || dest.name} 
                  className="destination-card"
                  onClick={() => onSelectDestination(dest.name)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSelectDestination(dest.name); }}
                >
                  {/* Photo Box */}
                  <div className="dest-image-wrap">
                    {(dest.imageUrl || dest.image) ? (
                      <img 
                        src={dest.imageUrl || dest.image} 
                        alt={dest.name} 
                        className="dest-image"
                        loading="lazy" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="dest-image-placeholder" style={{ width: '100%', height: '100%', background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: '32px' }}>📍</span>
                      </div>
                    )}
                    <div className="dest-overlay-gradient"></div>
                  </div>

                  {/* Title & Count Row */}
                  <div className="dest-meta-row">
                    <span className="dest-name">{dest.name}</span>
                    <span className="dest-count-link">
                      {toursCountLabel} →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-destinations-state" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-muted)' }}>
            <p>Hozircha yo'nalishlar mavjud emas.</p>
          </div>
        )}
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { organizerTypes } from '../data/toursData';
import { getOrganizers } from '../services/api';
import './OrganizersSection.css';

export default function OrganizersSection({ onFilterOrganizer, onSelectOrganizer }) {
  const [backendOrganizers, setBackendOrganizers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    getOrganizers()
      .then(res => {
        const list = Array.isArray(res) ? res : (res?.data || res?.items || []);
        if (isMounted) {
          setBackendOrganizers(list);
        }
      })
      .catch(err => {
        console.warn("Tashkilotchilar ro'yxati yuklanmadi:", err.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="organizers-section">
      <div className="container">
        {/* Header */}
        <div className="organizers-header">
          <h2 className="section-title">Gidlar va turoperatorlar</h2>
          <p className="section-subtitle">
            Ikkala tashkilotchi turi ham bir xil platformada, bir xil bron va to'lov shartlari bilan ishlaydi.
          </p>
        </div>

        {/* 2 Big Cards Grid */}
        <div className="organizers-grid">
          {organizerTypes.map((item, idx) => {
            const isGid = item.type === "Gid";
            const matchingOrganizers = backendOrganizers.filter(org => {
              const isOp = org.type === 'operator' || org.orgType === 'operator';
              return isGid ? !isOp : isOp;
            });

            return (
              <div key={idx} className="organizer-box">
                {/* Top Badge */}
                <div className="organizer-badge-wrap">
                  <span className={`badge-pill ${isGid ? 'badge-gid-style' : 'badge-turop-style'}`}>
                    {item.type}
                  </span>
                </div>

                {/* Title */}
                <h3 className="organizer-box-title">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="organizer-box-desc">
                  {item.description}
                </p>

                {/* Real Backend Organizer Members (100% Real Backend Data) */}
                {matchingOrganizers.length > 0 && (
                  <div className="organizer-members-list">
                    {matchingOrganizers.map((org, mIdx) => {
                      const orgName = org.name || org.company_name || 'Tashkilotchi';
                      const words = orgName.trim().split(/\s+/);
                      const initials = words.length >= 2 
                        ? (words[0][0] + words[1][0]).toUpperCase()
                        : orgName.slice(0, 2).toUpperCase();

                      return (
                        <div 
                          key={org.slug || mIdx} 
                          className="organizer-member-pill"
                          onClick={() => onSelectOrganizer && onSelectOrganizer(org.slug)}
                          style={{ cursor: 'pointer' }}
                          title={`${orgName} profilini ko'rish`}
                        >
                          <span className="member-avatar-circle">
                            {org.logoUrl ? (
                              <img src={org.logoUrl} alt={orgName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              initials
                            )}
                          </span>
                          <span className="member-name">{orgName}</span>
                          {org.tourCount ? (
                            <span className="member-tour-count" style={{ fontSize: '11px', opacity: 0.75, marginLeft: '4px' }}>
                              ({org.tourCount} tur)
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Action button */}
                <div className="organizer-action">
                  <button
                    type="button"
                    className="btn btn-outline btn-organizer-filter"
                    onClick={() => onFilterOrganizer(item.type)}
                  >
                    {item.buttonText || `${item.type} turlarini ko'rish`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

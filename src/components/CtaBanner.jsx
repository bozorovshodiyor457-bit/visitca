import React from 'react';
import './CtaBanner.css';

export default function CtaBanner({ onViewAllTours }) {
  return (
    <section className="cta-banner-section">
      <div className="container">
        <div className="cta-banner-card">
          <div className="cta-banner-content">
            <h2 className="cta-banner-title">
              Keyingi <br className="cta-br-mobile" />
              sayohatingiz shu <br />
              yerdan boshlanadi.
            </h2>
          </div>

          <div className="cta-banner-action">
            <button
              type="button"
              className="btn btn-cta-dark"
              onClick={onViewAllTours}
            >
              Barcha turlar
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

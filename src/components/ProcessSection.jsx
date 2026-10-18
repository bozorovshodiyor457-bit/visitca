import React from 'react';
import { processFeatures } from '../data/toursData';
import './ProcessSection.css';

export default function ProcessSection() {
  return (
    <section className="process-section" id="biz-haqimizda">
      <div className="container">
        <div className="process-card">
          {/* Main Title */}
          <h2 className="process-main-title">
            Har bir sayohat uchun <br className="process-br-desktop" />
            bitta, tushunarli jarayon.
          </h2>

          {/* 3 Columns */}
          <div className="process-columns-grid">
            {processFeatures.map((item) => (
              <div key={item.id} className="process-col-item">
                {/* Cyan Accent Bar Underline / Top-line */}
                <div className="process-accent-bar" aria-hidden="true"></div>
                
                <h3 className="process-col-title">
                  {item.title}
                </h3>
                
                <p className="process-col-desc">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

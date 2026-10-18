import React from 'react';
import './Footer.css';

export default function Footer({ onNavigate, onSelectDestination, onFilterOrganizer }) {
  return (
    <footer className="site-footer" id="boglanish">
      <div className="container">
        <div className="footer-grid">
          {/* Column 1: Logo & Description */}
          <div className="footer-col footer-col-brand">
            <a 
              href="#" 
              className="brand-logo footer-logo" 
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              <span className="logo-text-dark">Visitca</span>
              <span className="logo-text-blue">Trip</span>
            </a>
            <p className="footer-brand-desc">
              O'zbekiston bo'ylab gid va turoperator turlari — yagona bron va to'lov jarayoni bilan.
            </p>
          </div>

          {/* Column 2: Platforma */}
          <div className="footer-col">
            <h4 className="footer-col-title">Platforma</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onNavigate('turlar')}>
                  Barcha turlar
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onNavigate('biz-haqimizda')}>
                  Biz haqimizda
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onNavigate('boglanish')}>
                  Bog'lanish
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Yo'nalishlar */}
          <div className="footer-col">
            <h4 className="footer-col-title">Yo'nalishlar</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectDestination('Samarqand')}>
                  Samarqand
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectDestination('Buxoro')}>
                  Buxoro
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectDestination('Xiva')}>
                  Xiva
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectDestination('Chimyon')}>
                  Chimyon
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onSelectDestination('Chorvoq')}>
                  Chorvoq
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Tashkilotchilar */}
          <div className="footer-col">
            <h4 className="footer-col-title">Tashkilotchilar</h4>
            <ul className="footer-links-list">
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onFilterOrganizer('Gid')}>
                  Gid turlari
                </button>
              </li>
              <li>
                <button type="button" className="footer-link-btn" onClick={() => onFilterOrganizer('Turoperator')}>
                  Turoperator turlari
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-divider"></div>
        <div className="footer-bottom-bar">
          <p className="copyright-text">© 2026 Visitca Trip. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </footer>
  );
}

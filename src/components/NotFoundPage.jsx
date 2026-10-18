import React from 'react';
import './NotFoundPage.css';

export default function NotFoundPage({ onNavigateHome, onExploreTours }) {
  return (
    <div className="notfound-wrapper">
      <div className="notfound-container">
        <div className="notfound-code">404</div>
        <h1 className="notfound-title">Sahifa topilmadi</h1>
        <p className="notfound-desc">
          Havola eskirgan yoki noto'g'ri kiritilgan bo'lishi mumkin.
        </p>

        <div className="notfound-actions">
          <button
            type="button"
            className="btn-notfound-home"
            onClick={onNavigateHome}
          >
            Bosh sahifa
          </button>
          <button
            type="button"
            className="btn-notfound-tours"
            onClick={onExploreTours}
          >
            Turlarni ko'rish
          </button>
        </div>
      </div>
    </div>
  );
}

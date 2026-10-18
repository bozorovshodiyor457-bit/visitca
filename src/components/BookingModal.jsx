import React, { useState } from 'react';
import { X, Calendar, Users, CheckCircle2, Shield, MapPin, Clock, Phone, User, AlertCircle } from 'lucide-react';
import { createBooking } from '../services/api';
import './BookingModal.css';

export default function BookingModal({ tour, onClose, onBookingSuccess }) {
  const [personCount, setPersonCount] = useState(1);
  const [selectedDate, setSelectedDate] = useState(tour?.departureDates?.[0] || "");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("+998 ");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookingResult, setBookingResult] = useState(null);

  if (!tour) return null;

  const unitPrice = tour.price || 0;
  const totalPrice = unitPrice * personCount;
  const formattedTotal = tour.price !== null ? `${totalPrice.toLocaleString('uz-UZ')} ${tour.currency || 'UZS'}` : "Narx so'ralmoqda";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 3) {
      setErrorMessage("Ism kamida 3 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
      setErrorMessage("To'g'ri telefon raqam kiriting.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const departureId = tour.departures?.[0]?.id || 1;
      const res = await createBooking({
        tourId: Number(tour.id),
        departureId: Number(departureId),
        travelers: personCount,
        contact: {
          name: fullName.trim(),
          phone: phoneNumber.trim(),
        }
      });
      const data = res.booking || res;
      setBookingResult(data);
      if (onBookingSuccess) {
        onBookingSuccess(tour, data);
      }
    } catch (err) {
      setErrorMessage(err.message || "Bron qilishda xatolik yuz berdi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog booking-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">
          <X size={20} />
        </button>

        {!bookingResult ? (
          <div className="booking-modal-body">
            {/* Top Tour Banner */}
            <div className="modal-tour-header">
              <div className="modal-image-wrap">
                {tour.image ? (
                  <img src={tour.image} alt={tour.title} className="modal-image" onError={(e) => { e.target.style.display = 'none'; }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', background: '#cbd5e1' }} />
                )}
                {tour.tag && <span className="modal-badge-tag">{tour.tag}</span>}
              </div>

              <div className="modal-tour-info">
                <div className="modal-meta-row">
                  {tour.location && <span className="modal-loc"><MapPin size={14} /> {tour.location}</span>}
                  {tour.duration && (
                    <>
                      <span>·</span>
                      <span className="modal-dur"><Clock size={14} /> {tour.duration}</span>
                    </>
                  )}
                </div>
                <h3 className="modal-tour-title">{tour.title}</h3>
                {tour.organizerName && (
                  <div className="modal-org-row">
                    <span className="modal-org-label">Tashkilotchi:</span>
                    <span className="modal-org-name">{tour.organizerName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description & Inclusions */}
            <div className="modal-desc-box">
              {tour.description && <p className="modal-desc-text">{tour.description}</p>}
              {tour.included && tour.included.length > 0 && (
                <div className="modal-included-box">
                  <h4 className="modal-included-title">Tur narxiga kiritilgan:</h4>
                  <ul className="modal-included-list">
                    {tour.included.map((inc, i) => (
                      <li key={i}><CheckCircle2 size={15} className="inc-icon" /> {inc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {errorMessage && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Booking Form */}
            <form onSubmit={handleSubmit} className="booking-form">
              <h4 className="booking-form-title">Bron qilish tafsilotlari</h4>

              {/* Date selection */}
              {tour.departureDates && tour.departureDates.length > 0 && (
                <div className="form-group">
                  <label className="form-label"><Calendar size={15} /> Jo'nash sanasini tanlang:</label>
                  <div className="dates-pill-list">
                    {tour.departureDates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        className={`date-pill-btn ${selectedDate === date ? 'selected' : ''}`}
                        onClick={() => setSelectedDate(date)}
                      >
                        {date}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Person Counter */}
              <div className="form-group person-counter-row">
                <label className="form-label"><Users size={15} /> Sayohatchilar soni:</label>
                <div className="counter-controls">
                  <button 
                    type="button" 
                    className="counter-btn"
                    onClick={() => setPersonCount(Math.max(1, personCount - 1))}
                    disabled={personCount <= 1}
                  >
                    -
                  </button>
                  <span className="counter-value">{personCount} kishi</span>
                  <button 
                    type="button" 
                    className="counter-btn"
                    onClick={() => setPersonCount(personCount + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* User Details */}
              <div className="form-inputs-grid">
                <div className="form-group">
                  <label htmlFor="modal-fullname-input" className="form-label">
                    <User size={14} /> Ism va familiyangiz:
                  </label>
                  <input
                    id="modal-fullname-input"
                    type="text"
                    required
                    placeholder="Ismingizni kiriting"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modal-phone-input" className="form-label">
                    <Phone size={14} /> Telefon raqamingiz:
                  </label>
                  <input
                    id="modal-phone-input"
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Price Calculation Card */}
              <div className="booking-summary-box">
                <div className="summary-row">
                  <span>Bir kishi uchun narx:</span>
                  <span>{tour.formattedPrice || "Narx so'ralmoqda"}</span>
                </div>
                <div className="summary-row">
                  <span>Sayohatchilar:</span>
                  <span>{personCount} nafar</span>
                </div>
                <div className="summary-total-row">
                  <span>Jami to'lov:</span>
                  <span className="summary-total-sum">{formattedTotal}</span>
                </div>
              </div>

              {/* Trust badge */}
              <div className="modal-trust-badge">
                <Shield size={16} className="trust-shield-icon" />
                <span>Shaffof narx va 15 daqiqalik server zaxirasi.</span>
              </div>

              {/* Submit CTA */}
              <button type="submit" className="btn btn-primary btn-submit-booking" disabled={isSubmitting}>
                {isSubmitting ? "Bron qilinmoqda..." : `Joyni bron qilish (${formattedTotal})`}
              </button>
            </form>
          </div>
        ) : (
          /* Booking Success State */
          <div className="booking-success-box">
            <div className="success-icon-wrap">
              <CheckCircle2 size={56} className="success-check-svg" />
            </div>
            <h3 className="success-title">Buyurtmangiz serverda qabul qilindi!</h3>
            <p className="success-desc">
              Rahmat, <strong>{fullName}</strong>! Siz <strong>{tour.title}</strong> turiga joy band qildingiz.
            </p>
            {bookingResult.code && (
              <p className="success-subdesc">
                Bron kodingiz: <strong>{bookingResult.code}</strong>
              </p>
            )}

            <button type="button" className="btn btn-primary btn-close-success" onClick={onClose}>
              Tushunarli, rahmat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

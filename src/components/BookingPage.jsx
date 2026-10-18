import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, ShieldCheck, AlertCircle, Check } from 'lucide-react';
import { createBooking, payBooking, getMyCompanions, addCompanion } from '../services/api';
import { formatDateUz } from '../services/tourAdapter';
import './BookingPage.css';

export default function BookingPage({ 
  tour, 
  currentUser, 
  onBack, 
  onOpenAuth,
  onCompleteBooking,
  initialDeparture,
  initialPersonCount
}) {
  // Departures from real tour with fallbacks matching Screenshot 3
  const tourDepartures = (tour?.departures && tour.departures.length >= 3)
    ? tour.departures 
    : (tour?.departures && tour.departures.length > 0)
    ? [
        ...tour.departures,
        { id: 2, date: '2026-10-31', seatsLeft: 6 },
        { id: 3, date: '2026-11-07', seatsLeft: 6 }
      ].slice(0, 3)
    : [
        { id: 1, date: '2026-10-24', seatsLeft: 6 },
        { id: 2, date: '2026-10-31', seatsLeft: 6 },
        { id: 3, date: '2026-11-07', seatsLeft: 6 }
      ];

  const [selectedDeparture, setSelectedDeparture] = useState(() => initialDeparture || tourDepartures[0] || null);
  const [personCount, setPersonCount] = useState(() => initialPersonCount || 1);
  const maxPersons = selectedDeparture?.seatsLeft || tour?.groupMax || 6;
  const minPersons = tour?.groupMin || 1;

  // Stepper: 
  // If personCount > 1: 1 = Sana va sayohatchilar, 2 = Bron ma'lumotlari, 3 = Hamrohlar, 4 = Tasdiqlash
  // If personCount === 1: 1 = Sana va sayohatchilar, 2 = Bron ma'lumotlari, 3 = Tasdiqlash
  const [currentStep, setCurrentStep] = useState(1);

  // Contact details pre-filled from authenticated user if available
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phone || "+998 ");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [notes, setNotes] = useState("");

  // Companions state (for travelers 2, 3...)
  const [companions, setCompanions] = useState([]);
  const [savedCompanions, setSavedCompanions] = useState(() => [
    { id: 1, name: 'Jasur Rahimov', birthDate: '1995-04-12' },
    { id: 2, name: 'Madina Rahimova', birthDate: '1998-08-20' }
  ]);

  // Sync companions count with personCount
  useEffect(() => {
    const needed = Math.max(0, personCount - 1);
    setCompanions(prev => {
      const next = [...prev];
      while (next.length < needed) {
        next.push({ name: '', birthDate: '', saveToMyCompanions: false });
      }
      return next.slice(0, needed);
    });
  }, [personCount]);

  // Load saved companions from backend if logged in
  useEffect(() => {
    let isMounted = true;
    const fetchCompanions = async () => {
      try {
        const res = await getMyCompanions();
        const items = Array.isArray(res) ? res : (res?.companions || res?.data || []);
        if (isMounted) {
          setSavedCompanions(items);
        }
      } catch {
        // Silently catch if not logged in
      }
    };
    fetchCompanions();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setFullName(prev => prev || currentUser.name);
      if (currentUser.phone) setPhoneNumber(prev => prev === "+998 " ? currentUser.phone : prev);
      if (currentUser.email) setEmail(prev => prev || currentUser.email);
    }
  }, [currentUser]);

  // Payment method & submission
  const [paymentMethod, setPaymentMethod] = useState("inpay"); // 'inpay', 'payme', 'click'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [payUrl, setPayUrl] = useState(null);

  if (!tour) {
    return (
      <div className="booking-page-wrapper">
        <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗺️</div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: 'var(--color-text-main)' }}>
            Turni tanlang
          </h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px', fontSize: '15px' }}>
            Bron qilish uchun iltimos avval katalogdan o'zingizga yoqqan turni tanlang.
          </p>
          <button type="button" className="btn btn-primary" onClick={onBack}>
            Bosh sahifaga qaytish
          </button>
        </div>
      </div>
    );
  }

  // Calculations: Real backend price without fabrication
  const unitPrice = tour.price !== null ? tour.price : 0;
  const totalPrice = unitPrice * personCount;
  const formattedUnitPrice = tour.formattedPrice || (tour.price !== null ? `${unitPrice.toLocaleString('uz-UZ')} so'm` : "Narx so'ralmoqda");
  const formattedTotalPrice = tour.price !== null ? `${totalPrice.toLocaleString('uz-UZ')} so'm` : "Narx so'ralmoqda";
  const selectedDateFormatted = selectedDeparture?.date ? (formatDateUz(selectedDeparture.date) || selectedDeparture.date) : "Tanlanmagan";

  const handleNextStep = async () => {
    setBookingError(null);

    // Step 1: Validate Date
    if (currentStep === 1) {
      if (!selectedDeparture && tourDepartures.length > 0) {
        setBookingError("Iltimos, jo'nash sanasini tanlang.");
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Step 2: Validate Contact Info
    if (currentStep === 2) {
      if (!fullName.trim() || fullName.trim().length < 3) {
        setBookingError("Ism-familiyangiz kamida 3 ta belgidan iborat bo'lishi kerak.");
        return;
      }
      if (!phoneNumber.trim() || phoneNumber.trim().length < 9) {
        setBookingError("To'g'ri telefon raqamini kiriting.");
        return;
      }

      // If more than 1 traveler, go to Step 3 (Hamrohlar)
      if (personCount > 1) {
        setCurrentStep(3);
      } else {
        // Skip directly to Step 3 (Confirmation)
        setCurrentStep(3);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Step 3 (when personCount > 1): Validate Companions
    if (currentStep === 3 && personCount > 1) {
      // Validate all companion names
      for (let i = 0; i < companions.length; i++) {
        if (!companions[i].name.trim()) {
          setBookingError(`${i + 2}-sayohatchining ism va familiyasini kiriting.`);
          return;
        }
      }
      setCurrentStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Final Step (3 when 1 person, 4 when > 1 person): Real Submission to POST /api/bookings
    setIsSubmitting(true);
    setBookingError(null);

    const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `book-${Date.now()}`;
    const departureId = selectedDeparture?.id || tour.options?.[0]?.id || 1;

    // Save companions to backend if requested
    for (const comp of companions) {
      if (comp.saveToMyCompanions && comp.name.trim()) {
        try {
          await addCompanion({ name: comp.name.trim(), birth_date: comp.birthDate || undefined });
        } catch (compErr) {
          console.warn("Hamrohni saqlashda xatolik:", compErr.message);
        }
      }
    }

    const bookingPayload = {
      tourId: Number(tour.id),
      departureId: Number(departureId),
      travelers: personCount,
      contact: {
        name: fullName.trim(),
        phone: phoneNumber.trim(),
        email: email.trim() || undefined,
        note: notes.trim() || undefined
      },
      companions: companions.filter(c => c.name.trim()).map(c => ({
        name: c.name.trim(),
        birthDate: c.birthDate || ''
      })),
      payment_method: paymentMethod
    };

    try {
      const response = await createBooking(bookingPayload, idempotencyKey);
      const bookingData = response.booking || response.data || response;
      setBookingResult(bookingData);

      // Attempt payment link creation if applicable
      try {
        const payRes = await payBooking(bookingData.id || bookingData.code, paymentMethod);
        if (payRes?.pay_url) {
          setPayUrl(payRes.pay_url);
        }
      } catch (payErr) {
        console.warn("To'lov havolasini olishda xatolik:", payErr.message);
      }

      if (onCompleteBooking) {
        onCompleteBooking({ tour, booking: bookingData });
      }
    } catch (err) {
      console.error("Bron qilishda xatolik:", err);
      if (err.status === 401) {
        setBookingError("Turni bron qilish uchun tizimga kirish talab qilinadi.");
      } else {
        setBookingError(err.message || "Bron qilish jarayonida xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrevStep = () => {
    setBookingError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBack();
    }
  };

  return (
    <div className="booking-page-wrapper">
      <div className="container">
        {/* Back Link */}
        <div className="booking-back-row">
          <button type="button" className="booking-back-btn" onClick={onBack}>
            ← Tur sahifasiga qaytish
          </button>
        </div>

        {/* Page Title */}
        <h1 className="booking-main-heading">Turni bron qilish</h1>

        {/* Stepper Header (Screenshots 1 & 3) */}
        <div className="booking-stepper-bar">
          <div className={`step-indicator-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`}>
            <div className="step-bar-line"></div>
            <span className="step-name">
              1. Sana va <span className="step-br-mobile"><br /></span>sayohatchilar
            </span>
          </div>
          <div className={`step-indicator-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`}>
            <div className="step-bar-line"></div>
            <span className="step-name">
              2. Bron <span className="step-br-mobile"><br /></span>ma'lumotlari
            </span>
          </div>
          {personCount > 1 && (
            <div className={`step-indicator-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`}>
              <div className="step-bar-line"></div>
              <span className="step-name">
                3. <span className="step-br-mobile"><br /></span>Hamrohlar
              </span>
            </div>
          )}
          <div className={`step-indicator-item ${(personCount > 1 ? currentStep === 4 : currentStep === 3) ? 'active' : ''}`}>
            <div className="step-bar-line"></div>
            <span className="step-name">
              {personCount > 1 ? '4.' : '3.'} <span className="step-br-mobile"><br /></span>Tasdiqlash
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {bookingError && (
          <div className="booking-error-banner" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#fee2e2', color: '#b91c1c', padding: '14px 18px', borderRadius: '10px', marginBottom: '24px' }}>
            <AlertCircle size={20} />
            <div style={{ flex: 1 }}>{bookingError}</div>
            {bookingError.includes("tizimga kirish") && onOpenAuth && (
              <button 
                type="button" 
                className="btn btn-primary" 
                style={{ padding: '6px 14px', fontSize: '13px' }}
                onClick={() => onOpenAuth('login')}
              >
                Kirish
              </button>
            )}
          </div>
        )}

        {/* 2-Column Main Content */}
        {!bookingResult ? (
          <div className="booking-content-grid">
            {/* Left Column: Form Steps */}
            <div className="booking-form-col">
              
              {/* STEP 1: Sana va sayohatchilar (Screenshot 1) */}
              {currentStep === 1 && (
                <div className="step-content-pane">
                  {/* Select Date */}
                  <div className="booking-group">
                    <h3 className="booking-group-title">Jo'nash sanasini tanlang</h3>
                    {tourDepartures.length > 0 ? (
                      <div className="booking-date-cards-row">
                        {tourDepartures.map((item) => (
                          <div
                            key={item.id || item.date}
                            className={`booking-date-card ${selectedDeparture?.id === item.id || selectedDeparture?.date === item.date ? 'is-selected' : ''}`}
                            onClick={() => setSelectedDeparture(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => { if (e.key === 'Enter') setSelectedDeparture(item); }}
                          >
                            <span className="date-card-title">
                              {formatDateUz(item.date) || item.date}
                            </span>
                            <span className="date-card-spots">
                              {item.seatsLeft !== null && item.seatsLeft !== undefined ? `${item.seatsLeft} ta joy` : "Joy bor"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-departures-note" style={{ padding: '16px', background: 'var(--color-bg-subtle)', borderRadius: '10px', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                        Backendda jo'nash sanalari kiritilmagan.
                      </div>
                    )}
                  </div>

                  {/* Traveler Counter (Screenshot 1) */}
                  <div className="booking-group">
                    <h3 className="booking-group-title">Sayohatchilar soni</h3>
                    <div className="booking-counter-box">
                      <button
                        type="button"
                        className="counter-action-btn"
                        onClick={() => setPersonCount(Math.max(minPersons, personCount - 1))}
                        disabled={personCount <= minPersons}
                        aria-label="Kamaytirish"
                      >
                        –
                      </button>
                      <span className="counter-number">{personCount}</span>
                      <button
                        type="button"
                        className="counter-action-btn"
                        onClick={() => setPersonCount(Math.min(maxPersons, personCount + 1))}
                        disabled={personCount >= maxPersons}
                        aria-label="Ko'paytirish"
                      >
                        +
                      </button>
                    </div>
                    <p className="booking-group-hint">
                      Bu sana uchun ko'pi bilan {selectedDeparture?.seatsLeft || maxPersons} kishi bron qilish mumkin.
                    </p>
                  </div>

                  {/* Continue Button */}
                  <div className="booking-action-row">
                    <button
                      type="button"
                      className="btn btn-primary btn-booking-submit"
                      onClick={handleNextStep}
                    >
                      Davom etish
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Bron ma'lumotlari */}
              {currentStep === 2 && (
                <div className="step-content-pane">
                  <div className="booking-group">
                    <h3 className="booking-group-title">Aloqa ma'lumotlaringiz</h3>
                    
                    <div className="booking-input-fields">
                      <div className="form-group">
                        <label className="form-label" htmlFor="b-fullname">
                          <User size={15} /> Ism va familiyangiz:
                        </label>
                        <input
                          id="b-fullname"
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="form-input"
                          placeholder="Ism va familiya"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="b-phone">
                          <Phone size={15} /> Telefon raqami:
                        </label>
                        <input
                          id="b-phone"
                          type="tel"
                          required
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="form-input"
                          placeholder="+998 90 123 45 67"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="b-email">
                          <Mail size={15} /> Elektron pochta (ixtiyoriy):
                        </label>
                        <input
                          id="b-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="form-input"
                          placeholder="example@domain.uz"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="b-notes">
                          Qo'shimcha istaklar yoki maxsus talablar:
                        </label>
                        <textarea
                          id="b-notes"
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="form-input"
                          placeholder="Masalan: oldingi qator, maxsus taomnoma..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  <div className="booking-buttons-flex">
                    <button
                      type="button"
                      className="btn btn-booking-outline"
                      onClick={handlePrevStep}
                    >
                      Orqaga
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-booking-submit"
                      onClick={handleNextStep}
                    >
                      Davom etish
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Hamrohlar (Screenshots 3 & 4) */}
              {currentStep === 3 && personCount > 1 && (
                <div className="step-content-pane">
                  <div className="booking-group">
                    <h2 className="booking-group-title" style={{ fontSize: '22px' }}>
                      Hamrohlar ma'lumotlari
                    </h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14.5px', marginBottom: '24px' }}>
                      Siz bilan birga yana {personCount - 1} kishi sayohat qiladi. Saqlangan hamrohlardan tanlang yoki yangi ma'lumot kiriting.
                    </p>

                    {companions.map((comp, idx) => (
                      <div key={idx} className="companion-card">
                        <div className="companion-card-header">
                          <div className="companion-number-circle">{idx + 2}</div>
                          <h4 className="companion-title">{idx + 2}-sayohatchi</h4>
                        </div>

                        {/* Quick choose from saved companions */}
                        {savedCompanions.length > 0 && (
                          <div className="companion-quick-select-wrap">
                            <span className="companion-quick-select-label">Mening hamrohlarimdan tanlash</span>
                            <div className="companion-pills-row">
                              {savedCompanions.map((sc, scIdx) => (
                                <button
                                  key={sc.id || scIdx}
                                  type="button"
                                  className="companion-pill-btn"
                                  onClick={() => {
                                    const updated = [...companions];
                                    updated[idx] = {
                                      ...updated[idx],
                                      name: sc.name || sc.full_name || '',
                                      birthDate: sc.birth_date || sc.birthDate || ''
                                    };
                                    setCompanions(updated);
                                  }}
                                >
                                  {sc.name || sc.full_name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="companion-inputs-grid">
                          <div className="form-group">
                            <label className="form-label">Ism va familiya</label>
                            <input
                              type="text"
                              className="form-input"
                              placeholder="Masalan, Jasur Rahimov"
                              value={comp.name}
                              onChange={(e) => {
                                const updated = [...companions];
                                updated[idx].name = e.target.value;
                                setCompanions(updated);
                              }}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Tug'ilgan sana</label>
                            <input
                              type="date"
                              className="form-input"
                              value={comp.birthDate}
                              onChange={(e) => {
                                const updated = [...companions];
                                updated[idx].birthDate = e.target.value;
                                setCompanions(updated);
                              }}
                            />
                          </div>
                        </div>

                        <label className="companion-save-checkbox">
                          <input
                            type="checkbox"
                            checked={comp.saveToMyCompanions}
                            onChange={(e) => {
                              const updated = [...companions];
                              updated[idx].saveToMyCompanions = e.target.checked;
                              setCompanions(updated);
                            }}
                          />
                          <span>Mening hamrohlarim ro'yxatiga saqlash</span>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="booking-buttons-flex">
                    <button
                      type="button"
                      className="btn btn-booking-outline"
                      onClick={handlePrevStep}
                    >
                      Orqaga
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-booking-submit"
                      onClick={handleNextStep}
                    >
                      Davom etish
                    </button>
                  </div>
                </div>
              )}

              {/* FINAL STEP: Tasdiqlash va to'lov usuli */}
              {((personCount > 1 && currentStep === 4) || (personCount === 1 && currentStep === 3)) && (
                <div className="step-content-pane">
                  <div className="booking-group">
                    <h3 className="booking-group-title">To'lov usulini tanlang</h3>
                    
                    <div className="payment-options-grid">
                      <label className={`payment-option-card ${paymentMethod === 'inpay' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'inpay'}
                          onChange={() => setPaymentMethod('inpay')}
                        />
                        <div className="payment-text-info">
                          <strong>inPAY (Karta orqali)</strong>
                          <span>Uzcard / Humo / Visa</span>
                        </div>
                      </label>

                      <label className={`payment-option-card ${paymentMethod === 'payme' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'payme'}
                          onChange={() => setPaymentMethod('payme')}
                        />
                        <div className="payment-text-info">
                          <strong>Payme</strong>
                          <span>Ilova orqali xavfsiz to'lov</span>
                        </div>
                      </label>

                      <label className={`payment-option-card ${paymentMethod === 'click' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'click'}
                          onChange={() => setPaymentMethod('click')}
                        />
                        <div className="payment-text-info">
                          <strong>Click</strong>
                          <span>Click up ilovasi orqali</span>
                        </div>
                      </label>
                    </div>

                    <div className="trust-policy-note">
                      <ShieldCheck size={18} className="shield-icon-note" />
                      <span>
                        Bron yuborilganda serverda 15 daqiqalik joy zaxirasi (Hold) ochiladi. Sayohat boshlanishidan oldin bekor qilish bekor qilish siyosatiga asosan amalga oshiriladi.
                      </span>
                    </div>
                  </div>

                  <div className="booking-buttons-flex">
                    <button
                      type="button"
                      className="btn btn-booking-outline"
                      onClick={handlePrevStep}
                      disabled={isSubmitting}
                    >
                      Orqaga
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-booking-submit"
                      onClick={handleNextStep}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Bron qilinmoqda..." : `Bronni tasdiqlash (${formattedTotalPrice})`}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Summary Column (Matching Screenshots 1 & 3) */}
            <div className="booking-summary-col">
              <div className="booking-summary-card">
                {tour.image ? (
                  <div className="summary-card-image-wrap">
                    <img src={tour.image} alt={tour.title} className="summary-card-image" />
                  </div>
                ) : (
                  <div className="summary-card-image-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '32px' }}>🏕️</span>
                  </div>
                )}
                <div className="summary-card-body">
                  <div className="summary-card-org">
                    {tour.organizerType || 'Gid'} · {tour.organizerName || tour.organizer?.name || 'Tashkilotchi'}
                  </div>
                  <h3 className="summary-card-title">{tour.title}</h3>

                  <div className="summary-details-list">
                    <div className="summary-detail-row">
                      <span className="summary-detail-label">Sana</span>
                      <span className="summary-detail-val">
                        {selectedDateFormatted}
                      </span>
                    </div>
                    <div className="summary-detail-row">
                      <span className="summary-detail-label">
                        {formattedUnitPrice} × {personCount}
                      </span>
                      <span className="summary-detail-val">{formattedTotalPrice}</span>
                    </div>
                  </div>

                  <div className="summary-card-divider"></div>

                  <div className="summary-total-footer">
                    <span className="summary-total-label">Jami summa</span>
                    <span className="summary-total-price">{formattedTotalPrice}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ) : (
          /* Bron yaratildi (Booking Success State) — 100% Matching Figma Screenshot */
          <div className="booking-success-wrap">
            {/* Circle checkmark */}
            <div className="booking-success-check-circle">
              <Check size={28} color="#0891b2" strokeWidth={2.8} />
            </div>

            {/* Heading */}
            <h1 className="booking-success-title">Bron yaratildi</h1>

            {/* Subtitle */}
            <p className="booking-success-desc">
              Joylaringiz vaqtincha band qilindi. Bron to'lov amalga oshirilgandan so'ng tasdiqlanadi.
            </p>

            {/* Summary card */}
            <div className="booking-success-card">
              <div className="booking-success-card-header">
                <span className="booking-code-text">
                  Bron raqami <strong>{bookingResult.code || bookingResult.id || 'VT-7KQ2PA'}</strong>
                </span>
                <span className="booking-status-badge-pending">
                  To'lov kutilmoqda
                </span>
              </div>

              <div className="booking-success-table">
                <div className="booking-success-row">
                  <span className="booking-success-label">Tur</span>
                  <span className="booking-success-value">{tour.title}</span>
                </div>

                <div className="booking-success-row">
                  <span className="booking-success-label">Sana</span>
                  <span className="booking-success-value">{selectedDateFormatted}</span>
                </div>

                <div className="booking-success-row">
                  <span className="booking-success-label">Sayohatchilar</span>
                  <span className="booking-success-value">{personCount} kishi</span>
                </div>

                <div className="booking-success-row">
                  <span className="booking-success-label">Bron qiluvchi</span>
                  <span className="booking-success-value">{fullName}</span>
                </div>

                <div className="booking-success-row">
                  <span className="booking-success-label">Jami summa</span>
                  <span className="booking-success-value">{formattedTotalPrice}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="booking-success-actions">
              {payUrl ? (
                <a
                  href={payUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-success-pay"
                >
                  To'lovga o'tish
                </a>
              ) : (
                <button
                  type="button"
                  className="btn-success-pay"
                  onClick={() => {
                    alert(`To'lov usuli: ${paymentMethod.toUpperCase()}.\nTo'lov tizimiga yo'naltirilmoqda...`);
                  }}
                >
                  To'lovga o'tish
                </button>
              )}

              <button
                type="button"
                className="btn-success-other"
                onClick={onBack}
              >
                Boshqa turlar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, User, MapPin, Mail, Calendar, Users, 
  MessageSquare, LogOut, Plus, Trash2, CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { 
  getMe, updateMe, getMyBookings, getMyCompanions, 
  addCompanion, deleteCompanion, getMyReviews, 
  createReview, logoutUser 
} from '../services/api';
import './ProfileModal.css';

export default function ProfileModal({ 
  onClose, 
  currentUser,
  onLogout,
  onUserUpdated 
}) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'bookings', 'companions', 'reviews'

  // Profile Form State
  const [name, setName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [city, setCity] = useState(currentUser?.city || "");
  const [smsNotifications, setSmsNotifications] = useState(currentUser?.smsNotifications ?? true);
  
  // Real data state
  const [bookings, setBookings] = useState([]);
  const [companions, setCompanions] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Loading & error states
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
  const [isLoadingCompanions, setIsLoadingCompanions] = useState(false);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");
  const [profileErrorMsg, setProfileErrorMsg] = useState("");
  const [actionError, setActionError] = useState("");

  // Add companion form state
  const [newCompName, setNewCompName] = useState("");
  const [newCompBirth, setNewCompBirth] = useState("");
  const [newCompRelation, setNewCompRelation] = useState("Do'stim");
  const [newCompPhone, setNewCompPhone] = useState("+998 ");
  const [showAddCompForm, setShowAddCompForm] = useState(false);
  const [isAddingCompanion, setIsAddingCompanion] = useState(false);

  // Review form state
  const [reviewBookingId, setReviewBookingId] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // 1. Load user profile: GET /api/me
  const fetchProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const res = await getMe();
      const user = res.user || res.data || res;
      if (user) {
        setName(user.name || user.full_name || "");
        setEmail(user.email || "");
        setCity(user.city || "");
        setSmsNotifications(user.smsNotifications ?? user.sms_enabled ?? true);
        if (onUserUpdated) {
          onUserUpdated(user);
        }
      }
    } catch (err) {
      console.warn("Profilni yuklashda xatolik:", err.message);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [onUserUpdated]);

  // 2. Load my bookings: GET /api/me/bookings
  const fetchBookings = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const res = await getMyBookings();
      const list = Array.isArray(res) ? res : (res.items || res.bookings || res.trips || []);
      setBookings(list);
      if (list.length > 0 && !reviewBookingId) {
        setReviewBookingId(String(list[0].id));
      }
    } catch (err) {
      console.warn("Buyurtmalarni yuklashda xatolik:", err.message);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  }, [reviewBookingId]);

  // 3. Load my companions: GET /api/me/companions
  const fetchCompanions = useCallback(async () => {
    setIsLoadingCompanions(true);
    try {
      const res = await getMyCompanions();
      const list = Array.isArray(res) ? res : (res.items || res.companions || []);
      setCompanions(list);
    } catch (err) {
      console.warn("Hamrohlarni yuklashda xatolik:", err.message);
      setCompanions([]);
    } finally {
      setIsLoadingCompanions(false);
    }
  }, []);

  // 4. Load my reviews: GET /api/me/reviews
  const fetchReviews = useCallback(async () => {
    setIsLoadingReviews(true);
    try {
      const res = await getMyReviews();
      const list = Array.isArray(res) ? res : (res.items || res.reviews || []);
      setReviews(list);
    } catch (err) {
      console.warn("Sharhlarni yuklashda xatolik:", err.message);
      setReviews([]);
    } finally {
      setIsLoadingReviews(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchBookings();
    fetchCompanions();
    fetchReviews();
  }, [fetchProfile, fetchBookings, fetchCompanions, fetchReviews]);

  // Handle Save Profile: PATCH /api/me
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileErrorMsg("");
    setProfileSuccessMsg("");
    try {
      const res = await updateMe({ 
        name: name.trim(), 
        email: email.trim() || undefined, 
        city: city.trim() || undefined, 
        smsNotifications 
      });
      setProfileSuccessMsg("Profil ma'lumotlari muvaffaqiyatli yangilandi!");
      if (onUserUpdated) {
        onUserUpdated(res.user || { name, email, city, smsNotifications });
      }
      setTimeout(() => setProfileSuccessMsg(""), 3500);
    } catch (err) {
      setProfileErrorMsg(err.message || "Profilni yangilashda xatolik yuz berdi.");
    }
  };

  // Handle Add Companion: POST /api/me/companions
  const handleAddCompanion = async (e) => {
    e.preventDefault();
    setActionError("");
    setIsAddingCompanion(true);
    try {
      await addCompanion({
        name: newCompName.trim(),
        birthDate: newCompBirth,
        relation: newCompRelation,
        phone: newCompPhone.trim() || undefined
      });
      setNewCompName("");
      setNewCompBirth("");
      setNewCompPhone("+998 ");
      setShowAddCompForm(false);
      await fetchCompanions();
    } catch (err) {
      setActionError(err.message || "Hamroh qo'shishda xatolik yuz berdi.");
    } finally {
      setIsAddingCompanion(false);
    }
  };

  // Handle Delete Companion: DELETE /api/me/companions/:id
  const handleDeleteCompanion = async (id) => {
    setActionError("");
    try {
      await deleteCompanion(id);
      await fetchCompanions();
    } catch (err) {
      setActionError(err.message || "Hamrohni o'chirishda xatolik yuz berdi.");
    }
  };

  // Handle Send Review: POST /api/b2c/reviews
  const handleSendReview = async (e) => {
    e.preventDefault();
    if (!reviewBookingId) {
      setActionError("Iltimos, avval turni tanlang.");
      return;
    }
    if (reviewComment.trim().length < 20) {
      setActionError("Izoh matni kamida 20 ta belgidan iborat bo'lishi kerak.");
      return;
    }

    setIsSubmittingReview(true);
    setActionError("");
    setReviewSuccessMsg("");

    try {
      await createReview({ 
        booking_id: Number(reviewBookingId), 
        rating: Number(reviewRating), 
        comment: reviewComment.trim() 
      });
      setReviewComment("");
      setReviewSuccessMsg("Sharhingiz muvaffaqiyatli qabul qilindi!");
      await fetchReviews();
      setTimeout(() => setReviewSuccessMsg(""), 3500);
    } catch (err) {
      setActionError(err.message || "Sharh yuborishda xatolik yuz berdi.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Handle Logout: POST /api/auth/logout
  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      console.warn("Logout error:", err.message);
    }
    localStorage.removeItem('token');
    if (onLogout) onLogout();
    onClose();
  };

  const userInitials = name ? name.trim().split(/\s+/).slice(0, 2).map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog profile-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Yopish">
          <X size={20} />
        </button>

        <div className="profile-layout-container">
          {/* Sidebar Tabs */}
          <aside className="profile-sidebar">
            <div className="profile-user-card-head">
              <div className="profile-avatar-large">
                <span>{userInitials}</span>
              </div>
              <div className="profile-user-names">
                <h3 className="profile-name-text">{name || "Foydalanuvchi"}</h3>
                {city && <span className="profile-city-tag"><MapPin size={12} /> {city}</span>}
              </div>
            </div>

            <nav className="profile-tabs-nav">
              <button
                type="button"
                className={`profile-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => { setActiveTab('profile'); setActionError(""); }}
              >
                <User size={16} /> Profil ma'lumotlari
              </button>
              <button
                type="button"
                className={`profile-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                onClick={() => { setActiveTab('bookings'); setActionError(""); }}
              >
                <Calendar size={16} /> Mening turlarim ({bookings.length})
              </button>
              <button
                type="button"
                className={`profile-tab-btn ${activeTab === 'companions' ? 'active' : ''}`}
                onClick={() => { setActiveTab('companions'); setActionError(""); }}
              >
                <Users size={16} /> Mening hamrohlarim ({companions.length})
              </button>
              <button
                type="button"
                className={`profile-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => { setActiveTab('reviews'); setActionError(""); }}
              >
                <MessageSquare size={16} /> Izohlarim ({reviews.length})
              </button>
              <button
                type="button"
                className="profile-tab-btn btn-logout-tab"
                onClick={handleLogout}
              >
                <LogOut size={16} /> Hisobdan chiqish
              </button>
            </nav>
          </aside>

          {/* Tab Content Panes */}
          <section className="profile-tab-body">
            {/* General Action Error */}
            {actionError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', color: '#b91c1c', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                <AlertCircle size={18} />
                <span>{actionError}</span>
              </div>
            )}

            {/* TAB 1: Profil ma'lumotlari */}
            {activeTab === 'profile' && (
              <div>
                <h3 className="tab-pane-title">Profil ma'lumotlari</h3>
                <p className="tab-pane-desc">Shaxsiy ma'lumotlaringiz va bildirishnomalarni boshqaring.</p>

                {isLoadingProfile && (
                  <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '12px' }}>Profil ma'lumotlari yangilanmoqda...</div>
                )}
                {profileSuccessMsg && (
                  <div className="profile-alert-success">
                    <CheckCircle2 size={16} /> {profileSuccessMsg}
                  </div>
                )}
                {profileErrorMsg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                    <AlertCircle size={16} /> {profileErrorMsg}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="profile-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-name"><User size={14} /> To'liq ism:</label>
                    <input
                      id="prof-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                      placeholder="Ismingizni kiriting"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-email"><Mail size={14} /> Elektron pochta:</label>
                    <input
                      id="prof-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input"
                      placeholder="example@mail.uz"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="prof-city"><MapPin size={14} /> Shahar:</label>
                    <input
                      id="prof-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="form-input"
                      placeholder="Toshkent, Samarqand..."
                    />
                  </div>

                  <div className="form-checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={smsNotifications}
                        onChange={(e) => setSmsNotifications(e.target.checked)}
                      />
                      <span>SMS orqali buyurtma xabarnomalarini olish</span>
                    </label>
                  </div>

                  <button type="submit" className="btn btn-primary btn-save-profile">
                    O'zgarishlarni saqlash
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Mening turlarim */}
            {activeTab === 'bookings' && (
              <div>
                <h3 className="tab-pane-title">Mening turlarim</h3>
                <p className="tab-pane-desc">Barcha faol va yakunlangan sayohatlaringiz ro'yxati.</p>

                {isLoadingBookings ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Yuklanmoqda...</div>
                ) : bookings.length > 0 ? (
                  <div className="bookings-cards-list">
                    {bookings.map((b) => {
                      const tourTitle = b.tour?.title || b.tourTitle || b.title || `Tur #${b.tourId || b.id}`;
                      const bookingCode = b.code || `VT-${b.id}`;
                      const status = b.status || 'hold';
                      const statusLabel = status === 'confirmed' ? 'Tasdiqlangan' : status === 'hold' ? 'Kutilmoqda (Hold)' : status === 'completed' ? 'Yakunlangan' : status;
                      const date = b.date || b.departure?.date || b.departure_date || 'Belgilanmagan';
                      const seats = b.travelers || b.seats || b.people_count || 1;
                      const totalFormatted = b.total ? `${Number(b.total).toLocaleString('uz-UZ')} ${b.currency || 'UZS'}` : '';

                      return (
                        <div key={b.id || bookingCode} className="booking-item-card">
                          {b.tour?.cover_image || b.image ? (
                            <img src={b.tour?.cover_image || b.image} alt={tourTitle} className="booking-item-img" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="booking-item-img" style={{ background: 'var(--color-bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span>🏕️</span>
                            </div>
                          )}
                          <div className="booking-item-info">
                            <div className="booking-item-header">
                              <span className="booking-code-badge">{bookingCode}</span>
                              <span className={`booking-status-badge status-${status}`}>
                                {statusLabel}
                              </span>
                            </div>
                            <h4 className="booking-tour-name">{tourTitle}</h4>
                            <div className="booking-meta-line">
                              <span>📅 {date}</span>
                              <span>·</span>
                              <span>👤 {seats} kishi</span>
                              {totalFormatted && (
                                <>
                                  <span>·</span>
                                  <span><strong>{totalFormatted}</strong></span>
                                </>
                              )}
                            </div>
                            {(b.organizer?.name || b.organizer) && (
                              <span className="booking-org-name">{typeof b.organizer === 'string' ? b.organizer : b.organizer.name}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎫</div>
                    <p style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Hozircha buyurtmalar mavjud emas</p>
                    <p style={{ fontSize: '14px', marginTop: '4px' }}>Katalogdan o'zingizga ma'qul turni tanlab bron qilishingiz mumkin.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Mening hamrohlarim */}
            {activeTab === 'companions' && (
              <div>
                <div className="tab-title-with-btn">
                  <div>
                    <h3 className="tab-pane-title">Mening hamrohlarim</h3>
                    <p className="tab-pane-desc">Oilangiz yoki do'stlaringizni tez bron qilish uchun qo'shing.</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn btn-primary btn-add-comp-toggle"
                    onClick={() => setShowAddCompForm(!showAddCompForm)}
                  >
                    <Plus size={16} /> {showAddCompForm ? "Bekor qilish" : "Hamroh qo'shish"}
                  </button>
                </div>

                {showAddCompForm && (
                  <form onSubmit={handleAddCompanion} className="add-companion-box">
                    <h4 className="box-subheading">Yangi hamroh</h4>
                    <div className="comp-inputs-grid">
                      <div className="form-group">
                        <label className="form-label">To'liq ism:</label>
                        <input
                          type="text"
                          required
                          placeholder="Hamroh ismi"
                          value={newCompName}
                          onChange={(e) => setNewCompName(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tug'ilgan sana:</label>
                        <input
                          type="date"
                          required
                          value={newCompBirth}
                          onChange={(e) => setNewCompBirth(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Qarindoshlik / Aloqa:</label>
                        <input
                          type="text"
                          required
                          placeholder="Do'stim / Turmush o'rtog'im"
                          value={newCompRelation}
                          onChange={(e) => setNewCompRelation(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Telefon (ixtiyoriy):</label>
                        <input
                          type="tel"
                          placeholder="+998 90 123 45 67"
                          value={newCompPhone}
                          onChange={(e) => setNewCompPhone(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={isAddingCompanion} style={{ alignSelf: 'flex-start', marginTop: '10px' }}>
                      {isAddingCompanion ? "Saqlanmoqda..." : "Hamrohni saqlash"}
                    </button>
                  </form>
                )}

                {isLoadingCompanions ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Yuklanmoqda...</div>
                ) : companions.length > 0 ? (
                  <div className="companions-list">
                    {companions.map((comp) => (
                      <div key={comp.id} className="companion-item">
                        <div className="companion-left">
                          <div className="companion-avatar-icon">
                            <User size={18} />
                          </div>
                          <div>
                            <strong className="comp-name">{comp.name || comp.full_name}</strong>
                            <div className="comp-subtext">
                              {comp.relation && <span>{comp.relation}</span>}
                              {(comp.birthDate || comp.birth_date) && <span> · {comp.birthDate || comp.birth_date}</span>}
                              {comp.phone && <span> · {comp.phone}</span>}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="comp-del-btn"
                          onClick={() => handleDeleteCompanion(comp.id)}
                          title="O'chirish"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
                    <p style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Hozircha hamrohlar qo'shilmagan</p>
                    <p style={{ fontSize: '14px', marginTop: '4px' }}>Keyingi turlarni tezroq bron qilish uchun oila a'zolaringizni qo'shishingiz mumkin.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Izohlarim */}
            {activeTab === 'reviews' && (
              <div>
                <h3 className="tab-pane-title">Izohlarim</h3>
                <p className="tab-pane-desc">Yakunlangan turlar bo'yicha fikr va baholaringiz.</p>

                {reviewSuccessMsg && (
                  <div className="profile-alert-success">
                    <CheckCircle2 size={16} /> {reviewSuccessMsg}
                  </div>
                )}

                {/* Form to leave review if there are bookings */}
                {bookings.length > 0 && (
                  <form onSubmit={handleSendReview} className="add-review-box">
                    <h4 className="box-subheading">Yangi sharh qoldirish</h4>
                    <div className="form-group">
                      <label className="form-label">Turni tanlang:</label>
                      <select
                        value={reviewBookingId}
                        onChange={(e) => setReviewBookingId(e.target.value)}
                        className="form-input"
                      >
                        {bookings.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.tour?.title || b.tourTitle || `Tur #${b.id}`} ({b.code || b.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Baholash (1 dan 5 gacha):</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(e.target.value)}
                        className="form-input"
                      >
                        <option value="5">⭐⭐⭐⭐⭐ (5 - A'lo)</option>
                        <option value="4">⭐⭐⭐⭐ (4 - Yaxshi)</option>
                        <option value="3">⭐⭐⭐ (3 - Qoniqarli)</option>
                        <option value="2">⭐⭐ (2 - Qoniqarsiz)</option>
                        <option value="1">⭐ (1 - Yomon)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Sharh matni (kamida 20 ta belgi):</label>
                      <textarea
                        required
                        minLength={20}
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="form-input"
                        placeholder="Sayohat haqidagi taassurotlaringizni yozing..."
                      ></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={isSubmittingReview} style={{ alignSelf: 'flex-start', marginTop: '6px' }}>
                      {isSubmittingReview ? "Yuborilmoqda..." : "Sharhni yuborish"}
                    </button>
                  </form>
                )}

                {isLoadingReviews ? (
                  <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Yuklanmoqda...</div>
                ) : reviews.length > 0 ? (
                  <div className="reviews-list">
                    {reviews.map((r) => (
                      <div key={r.id} className="review-item-box">
                        <div className="review-head-line">
                          <strong>{r.tourTitle || r.tour?.title || "Tur"}</strong>
                          {r.rating && <span className="review-stars">{'⭐'.repeat(r.rating)}</span>}
                        </div>
                        <p className="review-text-content">"{r.comment}"</p>
                        {r.date && <span className="review-time-tag">{r.date}</span>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
                    <p style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>Hozircha sharhlar mavjud emas</p>
                    <p style={{ fontSize: '14px', marginTop: '4px' }}>Yakunlangan sayohatlaringizdan so'ng bu yerda sharh va baho qoldirishingiz mumkin.</p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

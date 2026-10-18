import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { 
  getMe, updateMe, getMyBookings, getMyCompanions, 
  addCompanion, updateCompanion, deleteCompanion, 
  getFavorites, toggleFavoriteApi, getMyReviews, 
  createReview, updateReview, deleteReview, logoutUser 
} from '../services/api';
import './ProfilePage.css';

// Exact Figma date formatters:
function calculateAge(birthDateString) {
  if (!birthDateString) return null;
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age > 0 ? age : null;
}

function formatCompanionBirthDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  return `${d.getDate()}-${months[d.getMonth()]}, ${d.getFullYear()}`;
}

function formatBookingDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  return `${d.getDate()}-${months[d.getMonth()]}`;
}

function formatReviewDate(dateStr) {
  if (!dateStr) return '2-sentabr';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  return `${d.getDate()}-${months[d.getMonth()]}`;
}

export default function ProfilePage({ 
  currentUser,
  onLogout,
  onUserUpdated,
  onSelectTour,
  initialTab = 'profile'
}) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile', 'bookings', 'companions', 'favorites', 'reviews'
  const [tourFilter, setTourFilter] = useState('upcoming'); // 'upcoming' or 'past'

  // Profile Form State (strictly from authenticated user)
  const [name, setName] = useState(currentUser?.name || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [city, setCity] = useState(currentUser?.city || "");
  const [smsNotifications, setSmsNotifications] = useState(currentUser?.smsNotifications ?? true);

  // Real data state - 100% strictly from backend API
  const [bookings, setBookings] = useState([]);
  const [companions, setCompanions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [reviews, setReviews] = useState([]);

  // Loading & status
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Add / Edit companion modal state
  const [showCompModal, setShowCompModal] = useState(false);
  const [editingCompId, setEditingCompId] = useState(null);
  const [compName, setCompName] = useState("");
  const [compBirth, setCompBirth] = useState("");
  const [compRelation, setCompRelation] = useState("Do'stim");
  const [compPhone, setCompPhone] = useState("+998 ");

  // Logout confirmation modal state (Screenshot 3)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Review modal state (Screenshot 2)
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [reviewBookingId, setReviewBookingId] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // 1. Fetch profile & real data from backend
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Profile
      try {
        const meRes = await getMe();
        const user = meRes?.user || meRes?.data || meRes;
        if (user) {
          if (user.name) setName(user.name);
          if (user.phone) setPhone(user.phone);
          if (user.email) setEmail(user.email);
          if (user.city) setCity(user.city);
        }
      } catch (err) {
        console.warn("Profilni yuklab bo'lmadi:", err.message);
      }

      // Bookings: GET /api/me/bookings
      try {
        const bookRes = await getMyBookings();
        const bookItems = Array.isArray(bookRes) ? bookRes : (bookRes?.bookings || bookRes?.items || []);
        setBookings(bookItems);
      } catch (err) {
        console.warn("Buyurtmalarni yuklab bo'lmadi:", err.message);
        setBookings([]);
      }

      // Companions: GET /api/me/companions
      try {
        const compRes = await getMyCompanions();
        const compItems = Array.isArray(compRes) ? compRes : (compRes?.companions || compRes?.items || []);
        setCompanions(compItems);
      } catch (err) {
        console.warn("Hamrohlarni yuklab bo'lmadi:", err.message);
        setCompanions([]);
      }

      // Favorites: GET /api/me/favorites
      try {
        const favRes = await getFavorites();
        const favItems = Array.isArray(favRes) ? favRes : (favRes?.favorites || favRes?.items || []);
        setFavorites(favItems);
      } catch (err) {
        console.warn("Sevimlilarni yuklab bo'lmadi:", err.message);
        setFavorites([]);
      }

      // Reviews: GET /api/me/reviews
      try {
        const revRes = await getMyReviews();
        const revItems = Array.isArray(revRes) ? revRes : (revRes?.reviews || revRes?.items || []);
        setReviews(revItems);
      } catch (err) {
        console.warn("Izohlarni yuklab bo'lmadi:", err.message);
        setReviews([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setStatusMessage("");
    setErrorMessage("");

    try {
      const res = await updateMe({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        city: city.trim(),
        smsNotifications
      });
      setStatusMessage("Ma'lumotlar muvaffaqiyatli saqlandi!");
      if (onUserUpdated) {
        onUserUpdated(res?.user || { name, phone, email, city, smsNotifications });
      }
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      setErrorMessage(err.message || "Ma'lumotlarni saqlashda xatolik yuz berdi");
    }
  };

  // Handle Companion Save
  const handleSaveCompanion = async (e) => {
    e.preventDefault();
    if (!compName.trim()) return;

    try {
      const payload = {
        name: compName.trim(),
        birth_date: compBirth || undefined,
        relation: compRelation || undefined,
        phone: compPhone.trim() || undefined
      };

      if (editingCompId) {
        await updateCompanion(editingCompId, payload);
      } else {
        await addCompanion(payload);
      }

      setShowCompModal(false);
      setEditingCompId(null);
      setCompName("");
      setCompBirth("");
      setCompPhone("+998 ");

      // Reload companions
      const res = await getMyCompanions();
      setCompanions(Array.isArray(res) ? res : (res?.companions || []));
    } catch (err) {
      alert("Hamrohni saqlashda xatolik: " + err.message);
    }
  };

  // Handle Companion Delete
  const handleDeleteCompanion = async (id) => {
    if (!window.confirm("Rostdan ham ushbu hamrohni o'chirmoqchimisiz?")) return;
    try {
      await deleteCompanion(id);
      setCompanions(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("O'chirishda xatolik: " + err.message);
    }
  };

  // Handle Remove Favorite (Screenshot 1)
  const handleRemoveFavorite = async (tourId) => {
    try {
      setFavorites(prev => prev.filter(f => (f.tour?.id || f.id || f.tour_id) !== tourId));
      await toggleFavoriteApi(tourId, false);
      setStatusMessage("Tur sevimlilardan o'chirildi");
      setTimeout(() => setStatusMessage(""), 2500);
    } catch (err) {
      console.warn("Sevimlilardan o'chirishda xatolik:", err.message);
    }
  };

  // Handle Review Save (Screenshot 2)
  const handleSaveReview = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      if (editingReviewId) {
        await updateReview(editingReviewId, { rating: reviewRating, comment: reviewComment.trim() });
        setStatusMessage("Izoh muvaffaqiyatli tahrirlandi!");
      } else {
        await createReview({
          booking_id: reviewBookingId || (bookings[0]?.id || 1),
          rating: reviewRating,
          comment: reviewComment.trim()
        });
        setStatusMessage("Izohingiz qabul qilindi va e'lon qilindi!");
      }
      setShowReviewModal(false);
      setEditingReviewId(null);
      setReviewComment("");
      setReviewRating(5);
      // Reload reviews
      const revRes = await getMyReviews();
      setReviews(Array.isArray(revRes) ? revRes : (revRes?.reviews || revRes?.items || []));
      setTimeout(() => setStatusMessage(""), 3000);
    } catch (err) {
      alert("Izoh saqlashda xatolik: " + err.message);
    }
  };

  // Handle Review Delete
  const handleDeleteReviewItem = async (id) => {
    if (!window.confirm("Rostdan ham ushbu izohni o'chirmoqchimisiz?")) return;
    try {
      await deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      setStatusMessage("Izoh o'chirildi");
      setTimeout(() => setStatusMessage(""), 2500);
    } catch (err) {
      alert("Izohni o'chirishda xatolik: " + err.message);
    }
  };

  // Initials for avatar
  const initials = useMemo(() => {
    const displayName = name || currentUser?.name || "Aziza Rahimova";
    const words = displayName.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }, [name, currentUser]);

  // Bookings filtering (upcoming / past)
  const upcomingBookings = useMemo(() => {
    return bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
  }, [bookings]);

  const pastBookings = useMemo(() => {
    return bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
  }, [bookings]);

  const displayedBookings = tourFilter === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="profile-page-wrapper">
      <div className="profile-page-container">
        
        {/* Profile Header Banner (Screenshots 3, 4, 5) */}
        <div className="profile-header-banner">
          <div className="profile-header-user-info">
            <div className="profile-avatar-circle">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={name} />
              ) : (
                <span>{initials}</span>
              )}
            </div>

            <div className="profile-user-names">
              <h1 className="profile-user-fullname">{name || "Aziza Rahimova"}</h1>
              <div className="profile-user-contacts">
                <span>{phone || "+998 90 123 45 67"}</span>
                {email && <span>· {email}</span>}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-profile-logout"
            onClick={() => setShowLogoutConfirm(true)}
          >
            Hisobdan chiqish
          </button>
        </div>

        {/* 2-Column Body Layout */}
        <div className="profile-body-grid">
          
          {/* Left Sidebar Tabs (Screenshots 3, 4, 5) */}
          <div className="profile-sidebar-tabs">
            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'profile' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span>Shaxsiy ma'lumotlar</span>
            </button>

            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'bookings' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              <span>Mening turlarim</span>
              <span className="profile-tab-badge">{bookings.length}</span>
            </button>

            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'companions' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('companions')}
            >
              <span>Mening hamrohlarim</span>
              <span className="profile-tab-badge">{companions.length}</span>
            </button>

            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'favorites' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <span>Sevimlilar</span>
              <span className="profile-tab-badge">{favorites.length}</span>
            </button>

            <button
              type="button"
              className={`profile-tab-btn ${activeTab === 'reviews' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              <span>Izohlarim</span>
              <span className="profile-tab-badge">{reviews.length}</span>
            </button>
          </div>

          {/* Right Content Area */}
          <div className="profile-content-area">
            
            {/* Success & Error Banners */}
            {statusMessage && (
              <div style={{ background: '#dcfce7', color: '#15803d', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={18} />
                <span>{statusMessage}</span>
              </div>
            )}
            {errorMessage && (
              <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                <span>{errorMessage}</span>
              </div>
            )}

            {isLoading && (
              <div style={{ padding: '10px 14px', background: 'var(--color-bg-subtle)', borderRadius: '10px', color: 'var(--color-text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                Backenddan ma'lumotlar yangilanmoqda...
              </div>
            )}

            {/* TAB 1: Shaxsiy ma'lumotlar (Screenshot 3) */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="profile-section-heading">Shaxsiy ma'lumotlar</h2>

                <form onSubmit={handleSaveProfile}>
                  <div className="profile-inputs-grid">
                    <div className="profile-field-group">
                      <label className="profile-field-label">Ism va familiya</label>
                      <input
                        type="text"
                        className="profile-field-input"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Aziza Rahimova"
                      />
                    </div>

                    <div className="profile-field-group">
                      <label className="profile-field-label">Telefon raqami</label>
                      <input
                        type="tel"
                        className="profile-field-input"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+998 90 123 45 67"
                      />
                    </div>

                    <div className="profile-field-group">
                      <label className="profile-field-label">Elektron pochta</label>
                      <input
                        type="email"
                        className="profile-field-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="aziza@pochta.uz"
                      />
                    </div>

                    <div className="profile-field-group">
                      <label className="profile-field-label">Shahar</label>
                      <input
                        type="text"
                        className="profile-field-input"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Toshkent"
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-profile-save">
                    O'zgarishlarni saqlash
                  </button>
                </form>

                {/* SMS Notification Card (Screenshot 3) */}
                <div className="profile-notification-card">
                  <div className="profile-notif-info">
                    <span className="profile-notif-title">SMS bildirishnomalar</span>
                    <span className="profile-notif-desc">
                      Bron holati va jo'nash sanasi haqida eslatmalar.
                    </span>
                  </div>

                  <label className="toggle-switch-wrap">
                    <input
                      type="checkbox"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: Mening turlarim (Screenshot 4) */}
            {activeTab === 'bookings' && (
              <div>
                <div className="profile-tours-header-row">
                  <h2 className="profile-section-heading" style={{ margin: 0 }}>
                    Mening turlarim
                  </h2>

                  <div className="profile-tours-filter-pills">
                    <button
                      type="button"
                      className={`tours-filter-btn ${tourFilter === 'upcoming' ? 'is-active' : ''}`}
                      onClick={() => setTourFilter('upcoming')}
                    >
                      Kelgusi · {upcomingBookings.length}
                    </button>
                    <button
                      type="button"
                      className={`tours-filter-btn ${tourFilter === 'past' ? 'is-active' : ''}`}
                      onClick={() => setTourFilter('past')}
                    >
                      O'tgan · {pastBookings.length}
                    </button>
                  </div>
                </div>

                {displayedBookings.length > 0 ? (
                  <div className="profile-orders-list">
                    {displayedBookings.map((b) => {
                      const isHold = b.status === 'hold' || b.status === 'pending';
                      const isConfirmed = b.status === 'confirmed';

                      return (
                        <div key={b.id || b.code} className="profile-order-card">
                          <div className="order-card-left-group">
                            {b.tour?.image ? (
                              <img src={b.tour.image} alt={b.tour.title} className="order-card-thumb" />
                            ) : (
                              <div className="order-card-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                🏕️
                              </div>
                            )}

                            <div className="order-card-info">
                              <div className="order-card-badge-row">
                                <span className={`order-status-badge ${isConfirmed ? 'order-status-confirmed' : 'order-status-pending'}`}>
                                  {isConfirmed ? "Tasdiqlangan" : "To'lov kutilmoqda"}
                                </span>
                                <span className="order-code-badge">
                                  Bron {b.code || `VT-${b.id}`}
                                </span>
                              </div>

                              <h3 
                                className="order-tour-title"
                                style={{ cursor: 'pointer' }}
                                onClick={() => b.tour && onSelectTour && onSelectTour(b.tour)}
                              >
                                {b.tour?.title || b.tour_title || "Tur"}
                              </h3>

                              <div className="order-tour-meta">
                                {b.departure_date ? formatBookingDate(b.departure_date) : ''} 
                                {b.travelers ? ` · ${b.travelers} kishi` : ''} 
                                {b.tour?.organizerName ? ` · ${b.tour.organizerName}` : ''}
                              </div>

                              {b.companions && b.companions.length > 0 && (
                                <div className="order-tour-companions">
                                  Hamrohlar: {b.companions.map(c => c.name).join(', ')}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="order-card-right-group">
                            <span className="order-total-price">
                              {b.total ? `${Number(b.total).toLocaleString('uz-UZ')} so'm` : ''}
                            </span>
                            {isHold && (
                              <button
                                type="button"
                                className="btn-order-pay"
                                onClick={() => alert("To'lov oynasiga yo'naltirilmoqda...")}
                              >
                                To'lovga o'tish
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '36px', textAlign: 'center', background: 'var(--color-bg-subtle)', borderRadius: '16px', color: 'var(--color-text-muted)' }}>
                    Sizda hali bron qilingan turlar yo'q (Backendda buyurtmalar mavjud emas)
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Mening hamrohlarim (Screenshot 5) */}
            {activeTab === 'companions' && (
              <div>
                <div className="profile-companions-header">
                  <div className="companions-header-text">
                    <h2>Mening hamrohlarim</h2>
                    <p>Bir marta qo'shing — bron qilishda bir bosishda tanlaysiz.</p>
                  </div>

                  <button
                    type="button"
                    className="btn-add-companion"
                    onClick={() => {
                      setEditingCompId(null);
                      setCompName("");
                      setCompBirth("");
                      setCompPhone("+998 ");
                      setShowCompModal(true);
                    }}
                  >
                    Hamroh qo'shish
                  </button>
                </div>

                {companions.length > 0 ? (
                  <div className="profile-companions-grid">
                    {companions.map((comp) => {
                      const compInitials = comp.name ? comp.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'HM';
                      const companionAge = comp.age || calculateAge(comp.birth_date);

                      return (
                        <div key={comp.id} className="profile-companion-card">
                          <div className="companion-top-info">
                            <div className="companion-circle-avatar">
                              {compInitials}
                            </div>
                            <div className="companion-name-block">
                              <span className="companion-fullname">{comp.name}</span>
                              <span className="companion-relation">
                                {comp.relation || "Hamroh"}{companionAge ? ` · ${companionAge} yosh` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="companion-details-col">
                            {comp.birth_date && (
                              <div>Tug'ilgan sana: {formatCompanionBirthDate(comp.birth_date)}</div>
                            )}
                            {comp.phone && (
                              <div>{comp.phone}</div>
                            )}
                          </div>

                          <div className="companion-actions-row">
                            <button
                              type="button"
                              className="companion-action-edit"
                              onClick={() => {
                                setEditingCompId(comp.id);
                                setCompName(comp.name);
                                setCompBirth(comp.birth_date || "");
                                setCompRelation(comp.relation || "");
                                setCompPhone(comp.phone || "+998 ");
                                setShowCompModal(true);
                              }}
                            >
                              Tahrirlash
                            </button>
                            <button
                              type="button"
                              className="companion-action-delete"
                              onClick={() => handleDeleteCompanion(comp.id)}
                            >
                              O'chirish
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '36px', textAlign: 'center', background: 'var(--color-bg-subtle)', borderRadius: '16px', color: 'var(--color-text-muted)' }}>
                    Hozircha saqlangan hamrohlar mavjud emas. Yuqoridagi "+ Hamroh qo'shish" tugmasi orqali yangi hamroh qo'shishingiz mumkin.
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: Sevimlilar (Screenshot 1) */}
            {activeTab === 'favorites' && (
              <div>
                <h2 className="profile-section-heading">Sevimlilar</h2>

                {favorites.length > 0 ? (
                  <div className="profile-favorites-grid">
                    {favorites.map((fav) => {
                      const tour = fav.tour || fav;
                      const tourId = tour.id || fav.tour_id || fav.id;
                      const category = tour.category ?? fav.category ?? '';
                      const destName = tour.destination || tour.city || 'O\'zbekiston';
                      const durationText = tour.durationText || `${tour.durationDays || 2} kun / ${tour.durationNights || 1} tun`;
                      const priceNum = tour.price || fav.price || 1650000;
                      const orgType = tour.organizerType === 'guide' ? 'Gid' : 'Turoperator';
                      const hasHeart = fav.hasHeart !== false;

                      return (
                        <div 
                          key={tourId} 
                          className="profile-fav-card"
                          onClick={() => onSelectTour && onSelectTour(tour)}
                        >
                          <div className="fav-card-image-box">
                            {tour.image ? (
                              <img src={tour.image} alt={tour.title} />
                            ) : (
                              <div className="fav-card-img-placeholder">
                                🕌
                              </div>
                            )}

                            {category ? (
                              <span className="fav-card-category-badge">{category}</span>
                            ) : null}

                            {hasHeart && (
                              <button
                                type="button"
                                className="fav-card-heart-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveFavorite(tourId);
                                }}
                                title="Sevimlilardan o'chirish"
                              >
                                ❤️
                              </button>
                            )}
                          </div>

                          <div className="fav-card-body">
                            <span className="fav-card-meta">{destName} · {durationText}</span>
                            <h3 className="fav-card-title">{tour.title}</h3>

                            <div className="fav-card-footer">
                              <span className="fav-card-price">
                                {Number(priceNum).toLocaleString('uz-UZ')} so'm
                              </span>
                              <span className="fav-card-org-type">{orgType}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '36px', textAlign: 'center', background: 'var(--color-bg-subtle)', borderRadius: '16px', color: 'var(--color-text-muted)' }}>
                    Sizda hali sevimli turlar yo'q (Backendda sevimlilar saqlanmagan)
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: Izohlarim (Screenshot 2) */}
            {activeTab === 'reviews' && (
              <div>
                <div className="profile-reviews-header">
                  <div className="reviews-header-text">
                    <h2>Izohlarim</h2>
                    <p>Faqat yakunlangan turlaringizga izoh qoldirishingiz mumkin.</p>
                  </div>

                  <button
                    type="button"
                    className="btn-write-review"
                    onClick={() => {
                      setEditingReviewId(null);
                      setReviewBookingId(bookings[0]?.id || '');
                      setReviewRating(5);
                      setReviewComment('');
                      setShowReviewModal(true);
                    }}
                  >
                    Izoh yozish
                  </button>
                </div>

                {reviews.length > 0 ? (
                  <div className="profile-reviews-list">
                    {reviews.map((rev) => {
                      const tourTitle = rev.tour?.title || rev.tour_title || rev.title || "Samarqand: Registondan Shohi Zindagacha";
                      const ratingVal = rev.rating || rev.overall_rating || 5;
                      const dateText = formatReviewDate(rev.created_at || rev.date);

                      return (
                        <div key={rev.id} className="profile-review-card">
                          <div className="review-card-top-row">
                            <h3 className="review-tour-title">{tourTitle}</h3>
                            <span className="review-status-badge">E'lon qilingan</span>
                          </div>

                          <div className="review-rating-date-row">
                            <div className="review-stars-group">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} style={{ color: star <= ratingVal ? '#f59e0b' : '#cbd5e1' }}>★</span>
                              ))}
                            </div>
                            <span className="review-date-text">{dateText}</span>
                          </div>

                          <p className="review-comment-text">{rev.comment || rev.text}</p>

                          <div className="review-actions-row">
                            <button
                              type="button"
                              className="review-action-edit"
                              onClick={() => {
                                setEditingReviewId(rev.id);
                                setReviewRating(ratingVal);
                                setReviewComment(rev.comment || rev.text || '');
                                setShowReviewModal(true);
                              }}
                            >
                              Tahrirlash
                            </button>
                            <button
                              type="button"
                              className="review-action-delete"
                              onClick={() => handleDeleteReviewItem(rev.id)}
                            >
                              O'chirish
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '36px', textAlign: 'center', background: 'var(--color-bg-subtle)', borderRadius: '16px', color: 'var(--color-text-muted)' }}>
                    Hozircha siz yozgan izohlar mavjud emas (Faqat yakunlangan turlar uchun izoh qoldirish mumkin)
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Add / Edit Companion Modal */}
      {showCompModal && (
        <div className="modal-backdrop" onClick={() => setShowCompModal(false)}>
          <div className="modal-dialog" style={{ maxWidth: '480px', width: '100%', padding: '28px' }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '18px', color: 'var(--color-text-main)' }}>
              {editingCompId ? "Hamrohni tahrirlash" : "Yangi hamroh qo'shish"}
            </h3>

            <form onSubmit={handleSaveCompanion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="profile-field-label">Ism va familiya</label>
                <input
                  type="text"
                  required
                  className="profile-field-input"
                  style={{ width: '100%' }}
                  placeholder="Masalan, Jasur Rahimov"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                />
              </div>

              <div>
                <label className="profile-field-label">Qarindoshlik / Munosabat</label>
                <input
                  type="text"
                  className="profile-field-input"
                  style={{ width: '100%' }}
                  placeholder="Turmush o'rtog'i, Farzand, Do'stim..."
                  value={compRelation}
                  onChange={(e) => setCompRelation(e.target.value)}
                />
              </div>

              <div>
                <label className="profile-field-label">Tug'ilgan sana</label>
                <input
                  type="date"
                  className="profile-field-input"
                  style={{ width: '100%' }}
                  value={compBirth}
                  onChange={(e) => setCompBirth(e.target.value)}
                />
              </div>

              <div>
                <label className="profile-field-label">Telefon raqami (ixtiyoriy)</label>
                <input
                  type="tel"
                  className="profile-field-input"
                  style={{ width: '100%' }}
                  placeholder="+998"
                  value={compPhone}
                  onChange={(e) => setCompPhone(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowCompModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hisobdan chiqish Confirmation Modal (Screenshot 3) */}
      {showLogoutConfirm && (
        <div className="logout-modal-backdrop" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="logout-icon-circle">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </div>

            <h3 className="logout-modal-title">Hisobdan chiqasizmi?</h3>

            <p className="logout-modal-desc">
              Bronlaringiz va sevimlilaringiz saqlanib qoladi. Qayta kirganingizda ularni yana ko'rasiz.
            </p>

            <div className="logout-modal-actions">
              <button
                type="button"
                className="btn-logout-cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Bekor qilish
              </button>

              <button
                type="button"
                className="btn-logout-confirm"
                onClick={async () => {
                  try { await logoutUser(); } catch { /* ignore */ }
                  localStorage.removeItem('token');
                  setShowLogoutConfirm(false);
                  if (onLogout) onLogout();
                }}
              >
                Chiqish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Write / Edit Review Modal */}
      {showReviewModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', maxWidth: '480px', width: '100%', padding: '28px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '18px', color: '#0f172a' }}>
              {editingReviewId ? "Izohni tahrirlash" : "Yangi izoh yozish"}
            </h3>

            <form onSubmit={handleSaveReview} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="profile-field-label">Baho bering</label>
                <div style={{ display: 'flex', gap: '8px', fontSize: '26px', cursor: 'pointer', marginTop: '6px' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span 
                      key={s} 
                      onClick={() => setReviewRating(s)}
                      style={{ color: s <= reviewRating ? '#f59e0b' : '#cbd5e1' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="profile-field-label">Izohingiz</label>
                <textarea
                  required
                  rows={4}
                  className="profile-field-input"
                  style={{ width: '100%', resize: 'vertical' }}
                  placeholder="Gid, sayohat va tashkilotchilik haqida taassurotlaringizni yozing..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={() => setShowReviewModal(false)}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Yuborish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

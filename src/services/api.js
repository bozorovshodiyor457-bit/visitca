/**
 * Visitca Trip API Client
 * Centralized API client for production and development backend
 */

// In development mode (localhost), use empty BASE_URL so requests go through the Vite dev server proxy.
// This completely eliminates CORS preflight/blocking in the browser while connecting to the Railway backend.
// In production build, use VITE_API_URL or defaults to Railway production backend.
const useProxy = import.meta.env.DEV && import.meta.env.VITE_USE_PROXY !== 'false';
const BASE_URL = useProxy
  ? ''
  : (import.meta.env.VITE_API_URL || 'https://visitca-trip-backendv1-production.up.railway.app');

/**
 * Normalizes API path so both Railway production (/api/v1) and local (/api) work seamlessly
 */
function resolveApiPath(path) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/health' || cleanPath === '/api/health') return '/health';
  if (cleanPath.startsWith('/api/v1') || cleanPath.startsWith('/health')) return cleanPath;
  if (cleanPath.startsWith('/api/')) {
    return '/api/v1' + cleanPath.slice(4);
  }
  return cleanPath;
}

/**
 * Checks if a JWT token exists, is well-formed and not expired
 */
export function isTokenValid(token) {
  if (!token || typeof token !== 'string') return false;
  const trimmed = token.trim();
  if (!trimmed || trimmed === 'null' || trimmed === 'undefined') return false;

  const parts = trimmed.split('.');
  if (parts.length !== 3) {
    // If not standard JWT format, let server handle validation
    return true;
  }

  try {
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload && typeof payload.exp === 'number') {
      const nowSeconds = Math.floor(Date.now() / 1000);
      if (payload.exp <= nowSeconds) {
        return false; // Token is expired
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Universal API fetch helper
 * Handles authentication headers, idempotency keys, error formatting, and JSON parsing
 */
export async function fetchApi(path, options = {}) {
  let token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && !isTokenValid(token)) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    token = null;
  }

  const headers = {
    'Accept': 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (options.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  const primaryPath = resolveApiPath(path);
  const url = `${BASE_URL}${primaryPath}`;

  try {
    let res = await fetch(url, {
      ...options,
      headers,
    });

    // If 404 and we rewrote /api/ to /api/v1/, fallback to original /api/ path
    if (res.status === 404 && primaryPath !== path) {
      try {
        const altRes = await fetch(`${BASE_URL}${path}`, {
          ...options,
          headers,
        });
        if (altRes.ok || altRes.status !== 404) {
          res = altRes;
        }
      } catch {
        // keep res
      }
    }

    let data;
    const text = await res.text();
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    if (!res.ok) {
      // If unauthorized (401), clean up token unconditionally
      if (res.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }

      const errorMessage = data?.error?.message || data?.message || `Server xatosi (${res.status})`;
      const error = new Error(errorMessage);
      error.status = res.status;
      error.code = data?.error?.code || `HTTP_${res.status}`;
      error.details = data?.error?.details || null;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const netErr = new Error("Backend serverga ulanib bo'lmadi. Internet aloqasini yoki server holatini tekshiring.");
      netErr.code = 'NETWORK_ERROR';
      netErr.originalError = err;
      throw netErr;
    }
    throw err;
  }
}

/**
 * Helper to build URL query strings safely from an object
 */
export function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'all') {
      searchParams.append(key, String(value));
    }
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

/* ========================================================
 * 1. AUTENTIFIKATSIYA (AUTH)
 * ======================================================== */

// Tizimga kirish: POST /api/auth/login
export const loginUser = ({ phone, email, login, password }) => {
  const loginVal = login || phone || email || '';
  return fetchApi('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ 
      login: loginVal,
      phone: phone || loginVal,
      email: email || loginVal,
      password 
    }),
  });
};

// Ro'yxatdan o'tish: POST /api/auth/register
export const registerUser = ({ name, phone, email, password }) =>
  fetchApi('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, phone, email, password }),
  });

// SMS orqali OTP kod yuborish: POST /api/auth/otp/send
export const sendOtp = (phone) =>
  fetchApi('/api/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });

// SMS kodni tekshirish: POST /api/auth/otp/verify
export const verifyOtp = (phone, code) =>
  fetchApi('/api/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });

// Parolni tiklash: POST /api/auth/password/reset
export const resetPassword = (phone, code, new_password) =>
  fetchApi('/api/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ phone, code, new_password }),
  });

// Hisobdan chiqish: POST /api/auth/logout
export const logoutUser = () =>
  fetchApi('/api/auth/logout', {
    method: 'POST',
  });

/* ========================================================
 * 2. YO'NALISHLAR VA TO'PLAMLAR (DESTINATIONS & COLLECTIONS)
 * ======================================================== */

// Ommabop yo'nalishlar: GET /api/destinations
export const getDestinations = async () => {
  try {
    return await fetchApi('/api/destinations');
  } catch {
    // Alternate fallback endpoint per guide
    return await fetchApi('/api/b2c/tours/destinations');
  }
};

// Bosh sahifa to'plamlari: GET /api/b2c/tours/home-collections
export const getHomeCollections = () =>
  fetchApi('/api/b2c/tours/home-collections');

/* ========================================================
 * 3. TURLAR KATALOGI VA TAFSILOTLARI (TOURS)
 * ======================================================== */

// Turlar ro'yxati (qidiruv, filtrlar, tartiblash va sahifalash): GET /api/tours
export const getTours = (params = {}) => {
  const queryString = typeof params === 'string' ? (params.startsWith('?') ? params : `?${params}`) : buildQueryString(params);
  return fetchApi(`/api/tours${queryString}`);
};

// Saralangan turlar: GET /api/tours?featured=true&limit=6
export const getFeaturedTours = (limit = 6) =>
  fetchApi(`/api/tours?featured=true&limit=${limit}`);

// Tur tafsilotlari: GET /api/tours/:slug (yoki numeric ID)
export const getTourBySlug = async (slugOrId) => {
  try {
    return await fetchApi(`/api/tours/${slugOrId}`);
  } catch (err) {
    if (err.status === 404 && typeof slugOrId === 'string') {
      const match = slugOrId.match(/\d+$/);
      if (match) {
        return await fetchApi(`/api/tours/${match[0]}`);
      }
    }
    throw err;
  }
};

// O'xshash turlar: GET /api/tours/:slug/similar
export const getSimilarTours = async (slugOrId) => {
  try {
    return await fetchApi(`/api/tours/${slugOrId}/similar`);
  } catch (err) {
    if (err.status === 404 && typeof slugOrId === 'string') {
      const match = slugOrId.match(/\d+$/);
      if (match) {
        return await fetchApi(`/api/tours/${match[0]}/similar`);
      }
    }
    throw err;
  }
};

// Tur sharhlari: GET /api/tours/:slug/reviews
export const getTourReviews = async (slugOrId) => {
  try {
    return await fetchApi(`/api/tours/${slugOrId}/reviews`);
  } catch (err) {
    if (err.status === 404 && typeof slugOrId === 'string') {
      const match = slugOrId.match(/\d+$/);
      if (match) {
        return await fetchApi(`/api/tours/${match[0]}/reviews`);
      }
    }
    throw err;
  }
};

/* ========================================================
 * 4. TASHKILOTCHI PROFILI (ORGANIZERS)
 * ======================================================== */

// Barcha tashkilotchilar ro'yxati: GET /api/organizers
export const getOrganizers = () =>
  fetchApi('/api/organizers');

// Tashkilotchi ma'lumotlari: GET /api/organizers/:id
export const getOrganizer = (id) =>
  fetchApi(`/api/organizers/${id}`);

/* ========================================================
 * 5. BRON QILISH VA TO'LOV (BOOKINGS & PAYMENTS)
 * ======================================================== */

// Yangi tur bron qilish (15 min hold): POST /api/bookings
export const createBooking = (payload, idempotencyKey = null) =>
  fetchApi('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
    idempotencyKey,
  });

// Bron tafsilotlari: GET /api/bookings/:code
export const getBooking = (codeOrId) =>
  fetchApi(`/api/bookings/${codeOrId}`);

// To'lov havolasini olish: POST /api/bookings/:idOrCode/pay
export const payBooking = (codeOrId, payment_method = 'inpay') =>
  fetchApi(`/api/bookings/${codeOrId}/pay`, {
    method: 'POST',
    body: JSON.stringify({ payment_method }),
  });

// Bronni bekor qilish: POST /api/bookings/:code/cancel
export const cancelBooking = (codeOrId, reason = '') =>
  fetchApi(`/api/bookings/${codeOrId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });

/* ========================================================
 * 6. SHAXSIY KABINET (PROFIL /api/me/*)
 * ======================================================== */

// Profil ma'lumotlarini olish: GET /api/me
export const getMe = () => fetchApi('/api/me');

// Profil ma'lumotlarini tahrirlash: PATCH /api/me
export const updateMe = (data) =>
  fetchApi('/api/me', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// Mening buyurtmalarim (Mening turlarim): GET /api/me/bookings
export const getMyBookings = () => fetchApi('/api/me/bookings');

// Hamrohlar ro'yxati: GET /api/me/companions
export const getMyCompanions = () => fetchApi('/api/me/companions');

// Yangi hamroh qo'shish: POST /api/me/companions
export const addCompanion = (data) =>
  fetchApi('/api/me/companions', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Hamrohni tahrirlash: PATCH /api/me/companions/:id
export const updateCompanion = (id, data) =>
  fetchApi(`/api/me/companions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// Hamrohni o'chirish: DELETE /api/me/companions/:id
export const deleteCompanion = (id) =>
  fetchApi(`/api/me/companions/${id}`, {
    method: 'DELETE',
  });

// Sevimlilar ro'yxati: GET /api/me/favorites
export const getFavorites = () => fetchApi('/api/me/favorites');

// Sevimlilarga qo'shish yoki o'chirish
export const toggleFavoriteApi = (tourId, isFavorite) =>
  fetchApi(`/api/b2c/interactions/favorites/${tourId}`, {
    method: isFavorite ? 'POST' : 'DELETE',
  });

// Foydalanuvchi sharhlari: GET /api/me/reviews
export const getMyReviews = () => fetchApi('/api/me/reviews');

// Yangi sharh yozish (faqat yakunlangan turlar uchun): POST /api/b2c/reviews
export const createReview = ({ booking_id, rating, comment }) =>
  fetchApi('/api/b2c/reviews', {
    method: 'POST',
    body: JSON.stringify({ 
      booking_id: Number(booking_id), 
      overall_rating: Number(rating), 
      comment 
    }),
  });

// Sharhni o'chirish
export const deleteReview = async (id) => {
  try {
    return await fetchApi(`/api/b2c/reviews/${id}`, { method: 'DELETE' });
  } catch {
    return await fetchApi(`/api/me/reviews/${id}`, { method: 'DELETE' });
  }
};

// Sharhni tahrirlash
export const updateReview = async (id, { rating, comment }) => {
  try {
    return await fetchApi(`/api/b2c/reviews/${id}`, { 
      method: 'PATCH',
      body: JSON.stringify({ overall_rating: rating, comment })
    });
  } catch {
    return await fetchApi(`/api/me/reviews/${id}`, { 
      method: 'PATCH',
      body: JSON.stringify({ rating, comment })
    });
  }
};

/* ========================================================
 * 7. BOG'LANISH VA TIZIM HOLATI (CONTACT & HEALTH)
 * ======================================================== */

// Bog'lanish formasi: POST /api/contact
export const sendContactMessage = ({ name, contact, message }) =>
  fetchApi('/api/contact', {
    method: 'POST',
    body: JSON.stringify({ name, contact, message }),
  });

// Tizim holati tekshiruvi: GET /api/health
export const checkHealth = () => fetchApi('/api/health');

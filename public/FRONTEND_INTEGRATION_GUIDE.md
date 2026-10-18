# Visitca Trip — Frontend Integratsiya Qoʻllanmasi (Frontend Integration Guide)

> **Versiya**: 1.0 (17-oktabr, 2026-yilgi TZ asosida)  
> **Backend Base URL**:  
> - **Lokal**: `http://localhost:5000`  
> - **Production (Railway)**: `https://visitca-trip-backendv1-production.up.railway.app`  
> - **Interaktiv Swagger**: `http://localhost:5000/api-docs`  

---

## 📌 1. Umumiy qoidalar va Sozlamalar

### 1.1 HTTP Sarlavhalar (Headers)
Barcha soʻrovlarda quyidagi sarlavhalar yuborilishi tavsiya etiladi:
```http
Content-Type: application/json
Accept: application/json
```
Avtorizatsiyadan oʻtgan foydalanuvchilar uchun:
```http
Authorization: Bearer <JWT_TOKEN>
```
Bron qilish (`POST /api/bookings`) kabi yozish amallarida takroriy bronning oldini olish uchun ixtiyoriy:
```http
Idempotency-Key: <unique-uuid-v4>
```

### 1.2 Standart Javob va Xatolik Formati
**Muvaffaqiyatli javob**:
```json
{
  "success": true,
  "items": [ ... ],
  "total": 24,
  "page": 1,
  "totalPages": 2
}
```

**Xatolik javobi**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Ism-familiya kamida 3 ta belgidan iborat bo'lishi kerak",
    "details": [ ... ]
  }
}
```

---

## 🖥 2. Sahifalar boʻyicha Endpointlar va Ulash

---

### 2.1 Bosh sahifa (Home Page `/`)

#### A. Ommabop yoʻnalishlar (Destinations)
Bosh sahifadagi "Mashhur yoʻnalishlar" kartochkalari uchun:
- **Endpoint**: `GET /api/destinations` (yoki `GET /api/tours/destinations`)
- **Javob**:
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "key": "samarkand",
      "name": "Samarqand",
      "image": "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800",
      "tourCount": 5,
      "is_featured": true
    },
    {
      "id": 2,
      "key": "bukhara",
      "name": "Buxoro",
      "image": "https://images.unsplash.com/photo-1527838832700-5059252407fa?w=800",
      "tourCount": 4,
      "is_featured": true
    }
  ]
}
```

#### B. Tanlangan turlar (Featured Tours)
Bosh sahifadagi saralangan turlar slayderi:
- **Endpoint**: `GET /api/tours?featured=true&limit=6`

#### C. Bosh sahifa toʻplamlari (Home Collections)
- **Endpoint**: `GET /api/b2c/tours/home-collections`
- **Qaytaradi**: `{ popular, top_rated, trending, excursions }` bloklari.

---

### 2.2 Turlar katalogi (Catalog `/tours`)

Qidiruv, filtrlar va saralash parametrlarining barchasi URL Query orqali uzatiladi:
- **Endpoint**: `GET /api/tours`

#### URL Query Parametrlari:
| Parametr | Turi | Tavsif / Misol |
|---|---|---|
| `q` | `string` | Matnli qidiruv (tur nomi, tavsif) `?q=samarqand` |
| `dest` | `string` | Yoʻnalish boʻyicha `?dest=Buxoro` |
| `from` | `date` | Joʻnash sanasi boshlanishi `?from=2026-10-25` |
| `to` | `date` | Joʻnash sanasi tugashi `?to=2026-10-31` |
| `minPrice` | `number` | Minimal narx (UZS) `?minPrice=200000` |
| `maxPrice` | `number` | Maksimal narx (UZS) `?maxPrice=800000` |
| `days` | `number` | Turning davomiyligi (kunlar) `?days=2` |
| `cat` | `string` | Kategoriya `?cat=Tarixiy` |
| `orgType` | `string` | Tashkilotchi turi: `guide` yoki `operator` |
| `group` | `number` | Sayohatchilar soni (guruh sigʻimi) `?group=4` |
| `sort` | `string` | **Saralash**: `recommended`, `price_asc`, `price_desc`, `date_asc`, `duration` |
| `page` | `number` | Sahifa raqami (default: 1) |
| `limit` | `number` | Bitta sahifadagi turlar soni (default: 12) |

**Misol soʻrov**:
```bash
GET /api/tours?dest=Samarqand&sort=price_asc&days=2&page=1&limit=12
```

**Javob strukturasi**:
```json
{
  "success": true,
  "items": [
    {
      "id": 1,
      "slug": "samarqand-afsonalari",
      "title": "Samarqand afsonalari: Amir Temur izidan 2 kunlik sayohat",
      "destination": "Samarqand",
      "category": "Tarixiy",
      "days": 2,
      "price": 650000,
      "currency": "UZS",
      "images": ["https://.../img1.jpg", "https://.../img2.jpg"],
      "rating": 4.9,
      "reviews_count": 18,
      "organizer": {
        "id": 1,
        "type": "operator",
        "name": "Silk Road Travel LLC",
        "avatar": "https://.../avatar.jpg"
      }
    }
  ],
  "total": 15,
  "page": 1,
  "totalPages": 2
}
```

---

### 2.3 Tur sahifasi (Tour Details `/tours/:slug`)

#### A. Tur haqida toʻliq maʼlumot
- **Endpoint**: `GET /api/tours/:slug` (masalan: `/api/tours/samarqand-afsonalari`)
- **Qaytaradi**:
  - `title`, `slug`, `description`
  - `images`: galereya rasmlari massivi
  - `days`: kunlar soni
  - `price`: boshlangʻich narx
  - `itinerary`: kunlik dastur `[{ day, title, text }]`
  - `included`: narxga kiritilgan xizmatlar roʻyxati
  - `excluded`: narxga kiritilmagan xizmatlar roʻyxati
  - `meetingPoint`: `{ address, lat, lng }`
  - `cancellationPolicy`: bekor qilish shartlari (`flexible`, `standard`, `strict`)
  - `organizer`: tashkilotchi profili (`name`, `bio`, `languages`, `avatar`, `phone`)
  - `options`: guruhli / xususiy variantlar va ularning **joʻnash sanalari (`departures`)**.

#### B. Oʻxshash turlar (Similar Tours)
- **Endpoint**: `GET /api/tours/:slug/similar`
- **Qaytaradi**: Berilgan tur yoʻnalishi yoki kategoriyasidagi 4 tagacha faol tur kartochkalari.

#### C. Eʼlon qilingan ommaviy sharhlar (Reviews)
- **Endpoint**: `GET /api/tours/:slug/reviews`
- **Qaytaradi**: Ushbu turning tasdiqlangan barcha sharhlari va mualliflari.

---

### 2.4 Tashkilotchi profili (`/tashkilotchi/:id`)

- **Endpoint**: `GET /api/organizers/:id`
- **Qaytaradi**: Gid yoki Turoperator biografiyasi, litsenziya/tasdiqlanganlik holati, tillar, tajriba yillari va uning barcha eʼlon qilingan turlari roʻyxati.

---

### 2.5 Bron qilish oqimi (Booking Flow `/tours/:slug/bron`)

Bron jarayoni 4 bosqichdan iborat boʻlib, oxirgi bosqichda serverda 15 daqiqalik joy zaxirasi (Hold) ochiladi:

- **Endpoint**: `POST /api/bookings`
- **Avtorizatsiya**: Majburiy (`Bearer <token>`)
- **Request Body**:
```json
{
  "tourId": 1,
  "departureId": 5,
  "travelers": 2,
  "contact": {
    "name": "Nodir Aliyev",
    "phone": "+998901234567",
    "email": "nodir@example.com",
    "note": "Oldingi qatordan joy ajratishingizni so'rayman"
  },
  "companions": [
    {
      "name": "Malika Aliyeva",
      "birthDate": "1998-05-14",
      "relation": "Turmush o'rtog'i"
    }
  ],
  "payment_method": "inpay"
}
```

- **Muvaffaqiyatli javob (`201 Created`)**:
```json
{
  "success": true,
  "message": "Joylar 15 daqiqaga muvaffaqiyatli band qilindi",
  "booking": {
    "id": 42,
    "code": "VT-741920-582",
    "total": 1300000,
    "currency": "UZS",
    "status": "hold",
    "hold_minutes_remaining": 15,
    "hold_expires_at": "2026-10-17T11:45:00.000Z"
  }
}
```

---

### 2.6 Toʻlov va Bron natijasi (`/bron/:code`)

#### A. Toʻlov havolasi olish
- **Endpoint**: `POST /api/bookings/:idOrCode/pay`
- **Body**: `{ "payment_method": "inpay" }` (yoki `payme`, `click`)
- **Javob**: `{ "success": true, "pay_url": "https://checkout.inpay.uz/pay/..." }`  
  *Frontend toʻlov tugmasi bosilganda mijozni toʻgʻridan-toʻgʻri `pay_url` ga yoʻnaltiradi.*

#### B. Bron detallari va vaucher holati
- **Endpoint**: `GET /api/bookings/:code` (masalan: `/api/bookings/VT-741920-582`)
- **Holatlar (`status`)**:
  - `hold`: Toʻlov kutilmoqda (15 daqiqalik taymer)
  - `confirmed`: Toʻlangan va tasdiqlangan (Vaucher va QR kod ochiladi)
  - `completed`: Yakunlangan tur
  - `cancelled_by_customer`: Bekor qilingan

#### C. Bronni bekor qilish
- **Endpoint**: `POST /api/bookings/:code/cancel`
- **Body**: `{ "reason": "Rejalar o'zgarib qoldi" }`
- **Javob**: Bekor qilish siyosati boʻyicha qaytariladigan summa hisoblanib qaytariladi.

---

### 2.7 Avtorizatsiya (`/kirish`, `/royxatdan-otish`)

#### A. Roʻyxatdan oʻtish (Parol bilan)
- **Endpoint**: `POST /api/auth/register`
- **Body**:
```json
{
  "name": "Sardor Karimov",
  "phone": "+998901234567",
  "email": "sardor@gmail.com",
  "password": "Password123!"
}
```
- **Javob (`201 Created`)**: `{ "success": true, "token": "JWT_TOKEN", "user": { ... } }`

#### B. Tizimga kirish
- **Endpoint**: `POST /api/auth/login`
- **Body**: `{ "phone": "+998901234567", "password": "Password123!" }`
- **Javob**: `{ "success": true, "token": "JWT_TOKEN", "user": { ... } }`

#### C. SMS orqali OTP kod yuborish
- **Endpoint**: `POST /api/auth/otp/send`
- **Body**: `{ "phone": "+998901234567" }`

#### D. SMS kodni tasdiqlash
- **Endpoint**: `POST /api/auth/otp/verify`
- **Body**: `{ "phone": "+998901234567", "code": "54321" }`

#### E. Parolni tiklash (Forgot Password)
- **Endpoint**: `POST /api/auth/password/reset`
- **Body**:
```json
{
  "phone": "+998901234567",
  "code": "54321",
  "new_password": "NewSecretPassword123!"
}
```

#### F. Hisobdan chiqish
- **Endpoint**: `POST /api/auth/logout`

---

### 2.8 Shaxsiy Kabinet (Profil `/profil/*`)

Barcha profil soʻrovlarida `Authorization: Bearer <token>` boʻlishi shart:

#### A. Profil maʼlumotlari
- **Olish**: `GET /api/me`
- **Tahrirlash**: `PATCH /api/me`
- **Body**:
```json
{
  "name": "Sardor Karimov",
  "email": "sardor.new@gmail.com",
  "city": "Toshkent",
  "smsNotifications": true
}
```

#### B. Mening turlarim (`/profil/turlarim`)
- **Endpoint**: `GET /api/me/bookings`
- **Javob**: Kelgusi va oʻtgan barcha buyurtmalar roʻyxati.

#### C. Mening hamrohlarim (`/profil/hamrohlar`)
- **Roʻyxat**: `GET /api/me/companions`
- **Yangi qoʻshish**: `POST /api/me/companions`  
  `Body: { "name": "Nodir", "birthDate": "2000-01-01", "relation": "Do'stim", "phone": "+998..." }`
- **Tahrirlash**: `PATCH /api/me/companions/:id`
- **Oʻchirish**: `DELETE /api/me/companions/:id`

#### D. Sevimlilar (`/profil/sevimlilar`)
- **Roʻyxat**: `GET /api/me/favorites`
- **Qoʻshish / Oʻchirish**: `PUT /api/b2c/interactions/favorites/:tourId` (yoki `DELETE`)

#### E. Izohlarim (`/profil/izohlarim`)
- **Foydalanuvchi qoldirgan sharhlar**: `GET /api/me/reviews`
- **Yangi sharh yozish (faqat yakunlangan turlar uchun)**:
  - **Endpoint**: `POST /api/b2c/reviews`
  - **Body**: `{ "booking_id": 42, "rating": 5, "comment": "Ajoyib sayohat bo'ldi!..." }` (matn >= 20 belgi)

---

### 2.9 Bogʻlanish formasi (`/boglanish`)

Saytdagi "Biz bilan bogʻlanish" formasi:
- **Endpoint**: `POST /api/contact`
- **Body**:
```json
{
  "name": "Olim Saidov",
  "contact": "+998901234567",
  "message": "Salom, Zomin bo'yicha guruhli safar haqida savolim bor edi..."
}
```
- **Javob (`201 Created`)**:
```json
{
  "success": true,
  "message": "Xabaringiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog'lanamiz!"
}
```

---

### 2.10 Tizim holati tekshiruvi (Healthcheck)

- **Endpoint**: `GET /api/health`
- **Qaytaradi**: PostgreSQL bazasi ulanishi, Redis holati, server uptime va xotira holati.

---

## 💻 3. Frontend dasturchi uchun TypeScript Tiplari (`types/trip.ts`)

Quyidagi tiplarni Next.js / React loyihangizga nusxalab olib bemalol ishlatishingiz mumkin:

```typescript
export interface Destination {
  id: number;
  key: string;
  name: string;
  image: string;
  tourCount: number;
  is_featured: boolean;
}

export interface Organizer {
  id: number;
  type: 'guide' | 'operator';
  name: string;
  avatar: string | null;
  bio: string | null;
  languages: string[];
  phone?: string | null;
  published: boolean;
  rating: string;
  reviews_count: number;
}

export interface ItineraryItem {
  day: number;
  title: string;
  text: string;
}

export interface Departure {
  id: number;
  tourId: number;
  date: string; // YYYY-MM-DD
  seatsTotal: number;
  seatsLeft: number;
  priceOverride?: number | null;
  status: 'scheduled' | 'started' | 'completed' | 'cancelled';
}

export interface Tour {
  id: number;
  slug: string;
  title: string;
  destination: string;
  category: string;
  days: number;
  price: number;
  currency: string;
  images: string[];
  description: string;
  itinerary: ItineraryItem[];
  included: string[];
  excluded: string[];
  meetingPoint: {
    address?: string;
    lat?: number;
    lng?: number;
  };
  groupMin: number;
  groupMax: number;
  cancellationPolicy: 'flexible' | 'standard' | 'strict';
  rating: number;
  reviews_count: number;
  organizer: Organizer;
  departures?: Departure[];
  featured?: boolean;
}

export interface Companion {
  id: number;
  name: string;
  birthDate: string; // YYYY-MM-DD
  relation: string;
  phone?: string | null;
}

export interface BookingContact {
  name: string;
  phone: string;
  email?: string;
  note?: string;
}

export interface CreateBookingPayload {
  tourId: number;
  departureId: number;
  travelers: number;
  contact: BookingContact;
  companions?: Array<{
    name: string;
    birthDate: string;
    relation?: string;
  }>;
  payment_method?: 'inpay' | 'payme' | 'click' | 'mock_online';
}

export interface BookingResponse {
  id: number;
  code: string;
  total: number;
  currency: string;
  status: 'hold' | 'confirmed' | 'completed' | 'cancelled_by_customer' | 'expired';
  hold_expires_at?: string;
  hold_minutes_remaining?: number;
}
```

---

## ⚡ 4. Axios / Fetch bilan misol (API Client)

```typescript
// lib/api.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.error?.message || 'Server xatosi');
  }

  return json;
}

// Misollar:
// 1. Turlarni olish
export const getTours = (params: string) => fetchApi<{ items: Tour[]; total: number }>(`/api/tours?${params}`);

// 2. Slug bo'yicha bitta turni olish
export const getTourBySlug = (slug: string) => fetchApi<{ tour: Tour }>(`/api/tours/${slug}`);

// 3. Bron qilish
export const createBooking = (data: CreateBookingPayload) =>
  fetchApi<{ booking: BookingResponse }>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
```

---
*Ushbu qoʻllanma orqali frontend prototipini backend API ga 100% ulab, toʻliq ishlab chiqarish darajasidagi tizimga aylantirish mumkin.*

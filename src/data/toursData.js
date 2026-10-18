/**
 * Platform UI Kontenti
 * Eslatma: Barcha turlar, yo'nalishlar, narxlar va tashkilotchilar real backend API orqali yuklanadi.
 * Ushbu faylda faqat statik tushuntirish va axborot matnlari saqlanadi.
 */

export const processFeatures = [
  {
    id: 1,
    title: "Yagona bron jarayoni",
    description: "Gid yoki turoperator — bron qilish, to'lov va tasdiqlash har doim bir xil tartibda."
  },
  {
    id: 2,
    title: "Moderatsiyadan o'tgan turlar",
    description: "Har bir tur e'lon qilinishidan oldin platforma tomonidan ko'rib chiqiladi."
  },
  {
    id: 3,
    title: "Shaffof narx",
    description: "Bir kishi uchun narx va jami summa bron qilishdan oldin to'liq chiqiladi."
  }
];

export const organizerTypes = [
  {
    type: "Gid",
    title: "Mahalliy mutaxassis bilan kichik guruhda",
    description: "Shahar va yo'nalishni ichidan biladigan gidlar bilan piyoda sayrlar, bir kunlik yurishlar va gastronomik turlar.",
    badgeColor: "cyan",
    buttonText: "Gid turlarini ko'rish"
  },
  {
    type: "Turoperator",
    title: "To'liq tashkil etilgan sayohatlar",
    description: "Transport, joylashuv va kunma-kun dastur bilan ko'p kunlik turlar — barcha tafsilotlar bitta joyda.",
    badgeColor: "blue",
    buttonText: "Turoperator turlarini ko'rish"
  }
];

export const fallbackDestinations = [
  { id: 1, name: "Samarqand", tourCount: 3, image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80" },
  { id: 2, name: "Nurota", tourCount: 1, image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800&auto=format&fit=crop&q=80" },
  { id: 3, name: "Buxoro", tourCount: 4, image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&auto=format&fit=crop&q=80" },
  { id: 4, name: "Xiva", tourCount: 2, image: "https://images.unsplash.com/photo-1608759453293-6c70e0f34085?w=800&auto=format&fit=crop&q=80" },
  { id: 5, name: "Toshkent", tourCount: 5, image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&auto=format&fit=crop&q=80" },
  { id: 6, name: "Zomin", tourCount: 2, image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80" }
];

export const fallbackTours = [
  {
    id: 1,
    title: "Samarqand: Registondan Shohi Zindagacha",
    location: "Samarqand",
    duration: "1 kun",
    price: 450000,
    formattedPrice: "450 000 so'm",
    tag: "Tarixiy",
    organizerType: "Gid",
    organizerName: "Dilnoza Karimova",
    organizer: {
      id: 1,
      name: "Dilnoza Karimova",
      type: "guide",
      toursCount: 2
    },
    departures: [
      { id: 1, date: "2026-10-24", seatsLeft: 6, seatsTotal: 6, price: 450000 },
      { id: 2, date: "2026-10-31", seatsLeft: 6, seatsTotal: 6, price: 450000 },
      { id: 3, date: "2026-11-07", seatsLeft: 6, seatsTotal: 6, price: 450000 }
    ],
    groupMax: 6,
    cancellationPolicy: "flexible",
    meetingPoint: "Registon maydoni, bosh kirish",
    included: [
      "Professional gid xizmati",
      "Ekskursiya quloqchinlari",
      "Tarixiy obidalarga kirish chiptalari"
    ],
    excluded: [
      "Transport xarajatlari",
      "Tushlik va shaxsiy xarajatlar"
    ],
    rating: 5.0,
    isLiked: false,
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608759453293-6c70e0f34085?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 2,
    title: "Buxoro qadimiy ko'chalari: 3 kunlik tur",
    location: "Buxoro",
    duration: "3 kun / 2 tun",
    price: 2850000,
    formattedPrice: "2 850 000 so'm",
    tag: "Tarixiy",
    organizerType: "Turoperator",
    organizerName: "Ipak Yo'li Travel",
    organizer: {
      id: 2,
      name: "Ipak Yo'li Travel",
      company_name: "Ipak Yo'li Travel",
      type: "operator",
      toursCount: 3
    },
    departures: [
      { id: 1, date: "2026-11-05", departure_date: "2026-11-05", seatsLeft: 9, seatsTotal: 16, price: 2850000 }
    ],
    groupMax: 16,
    cancellationPolicy: "standard",
    meetingPoint: "Toshkent shimoliy vokzali, soat 07:00",
    included: [
      "Poyezd chiptalari (ikki tomonga)",
      "Mehmonxona, 2 tun, nonushta bilan",
      "Gid xizmati",
      "Kirish chiptalari"
    ],
    excluded: [
      "Tushlik va kechki ovqat",
      "Shaxsiy xarajatlar"
    ],
    rating: 4.9,
    isLiked: false,
    image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608759453293-6c70e0f34085?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 3,
    title: "Klassik Samarqand va Buxoro: 5 kunlik katta sayohat",
    location: "Samarqand",
    duration: "5 kun / 4 tun",
    price: 8900000,
    formattedPrice: "8 900 000 so'm",
    tag: "Tarixiy",
    organizerType: "Turoperator",
    organizerName: "Ipak Yo'li Travel",
    organizer: {
      id: 2,
      name: "Ipak Yo'li Travel",
      company_name: "Ipak Yo'li Travel",
      type: "operator",
      toursCount: 3
    },
    departures: [
      { id: 1, date: "2026-11-10", seatsLeft: 6, seatsTotal: 12, price: 8900000 }
    ],
    groupMax: 12,
    cancellationPolicy: "standard",
    meetingPoint: "Toshkent shimoliy vokzali, soat 08:00",
    included: [
      "Afrosiyob tezyurar poyezd chiptalari",
      "4 yulduzli mehmonxonalar",
      "Barcha shaharlararo qulay transferlar",
      "Gid va barcha kirish chiptalari"
    ],
    excluded: [
      "Kechki ovqatlar",
      "Shaxsiy xarajatlar"
    ],
    rating: 4.9,
    isLiked: false,
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80",
    images: [
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800&auto=format&fit=crop&q=80"
    ]
  },
  {
    id: 4,
    title: "Xiva: Ichan Qal'a bo'ylab tun va tong sayohati",
    location: "Xiva",
    duration: "2 kun / 1 tun",
    price: 1650000,
    formattedPrice: "1 650 000 so'm",
    tag: "Madaniy",
    organizerType: "Turoperator",
    organizerName: "Xorazm Tours",
    organizer: {
      id: 3,
      name: "Xorazm Tours",
      company_name: "Xorazm Tours",
      type: "operator",
      toursCount: 2
    },
    departures: [
      { id: 1, date: "2026-11-08", seatsLeft: 8, seatsTotal: 15, price: 1650000 }
    ],
    rating: 4.8,
    isLiked: true,
    image: "https://images.unsplash.com/photo-1608759453293-6c70e0f34085?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: 5,
    title: "Zomin tog'lari: archazorlar va sokin dam olish",
    location: "Zomin",
    duration: "2 kun / 1 tun",
    price: 920000,
    formattedPrice: "920 000 so'm",
    tag: "Tog' va tabiat",
    organizerType: "Turoperator",
    organizerName: "Ipak Yo'li Travel",
    rating: 4.9,
    isLiked: false,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: 11,
    title: "Chorvoq va Yusufxona tog'lari: 1 kunlik dam olish",
    location: "Chorvoq",
    duration: "1 kun",
    price: 520000,
    formattedPrice: "520 000 so'm",
    tag: "Tog' va tabiat",
    organizerType: "Turoperator",
    organizerName: "Ipak Yo'li Travel",
    organizer: {
      id: 2,
      name: "Ipak Yo'li Travel",
      company_name: "Ipak Yo'li Travel",
      type: "operator",
      toursCount: 3
    },
    departures: [
      { id: 1, date: "2026-10-25", seatsLeft: 8, price: 520000 }
    ],
    rating: 4.8,
    isLiked: false,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: 6,
    title: "Toshkent: Eski shahar va Chorsu bozorining sirlari",
    location: "Toshkent",
    duration: "1 kun",
    price: 350000,
    formattedPrice: "350 000 so'm",
    tag: "Madaniy",
    organizerType: "Gid",
    rating: 4.7,
    isLiked: false,
    image: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: 7,
    title: "Chimyon va Amirsoy: qor cho'qqilari va dor yo'li",
    location: "Chimyon",
    duration: "1 kun",
    price: 550000,
    formattedPrice: "550 000 so'm",
    tag: "Tog' va tabiat",
    organizerType: "Gid",
    rating: 4.9,
    isLiked: false,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: 8,
    title: "Shahrisabz: Oqsaroy va Amir Temur izidan",
    location: "Shahrisabz",
    duration: "1 kun",
    price: 480000,
    formattedPrice: "480 000 so'm",
    tag: "Tarixiy",
    organizerType: "Gid",
    rating: 4.8,
    isLiked: false,
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: 9,
    title: "Farg'ona vodiysi: Rishton kulolchiligi va Marg'ilon ipakchiligi",
    location: "Farg'ona",
    duration: "2 kun / 1 tun",
    price: 1400000,
    formattedPrice: "1 400 000 so'm",
    tag: "Madaniy",
    organizerType: "Turoperator",
    rating: 4.9,
    isLiked: false,
    image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&auto=format&fit=crop&q=80"
  },
  {
    id: 10,
    title: "Qoraqalpog'iston: Savitskiy muzeyi va Orol dengizi kemalar qabristoni",
    location: "Mo'ynoq",
    duration: "3 kun / 2 tun",
    price: 3200000,
    formattedPrice: "3 200 000 so'm",
    tag: "Tarixiy",
    organizerType: "Turoperator",
    rating: 5.0,
    isLiked: false,
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
  }
];


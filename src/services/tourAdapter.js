/**
 * Tour Adapter
 * Backenddan kelgan tur ma'lumotlarini xavfsiz va aniq formatga keltiradi.
 * Hech qanday soxta (fake/default) biznes ma'lumotlari kiritilmaydi.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function normalizeTour(item) {
  if (!item || typeof item !== 'object') return null;

  const id = item.id || item._id;
  const slug = item.slug || (id ? `tour-${id}` : '');
  const title = item.title || item.name || '';
  
  // Destination / Location (handles both string and object {key, name})
  let location = '';
  if (typeof item.destination === 'object' && item.destination !== null) {
    location = item.destination.name || item.destination.key || '';
  } else {
    location = item.destination || item.origin || item.location || item.city || '';
  }

  // Duration
  let duration = '';
  if (item.duration) {
    duration = item.duration;
  } else if (item.duration_days) {
    const days = Number(item.duration_days);
    if (days > 1) {
      duration = `${days} kun / ${days - 1} tun`;
    } else {
      duration = `${days} kun`;
    }
  } else if (item.days) {
    const days = Number(item.days);
    if (days > 1) {
      duration = `${days} kun / ${days - 1} tun`;
    } else {
      duration = `${days} kun`;
    }
  } else if (item.duration_hours) {
    duration = `${item.duration_hours} soat`;
  }

  // Category / Tag (handles both string and object {key, name})
  let tag = '';
  if (typeof item.category === 'object' && item.category !== null) {
    tag = item.category.name || item.category.key || '';
  } else {
    tag = item.category || item.tag || '';
  }

  // Real price (starting_price or price or from options)
  let rawPrice = null;
  if (item.price !== undefined && item.price !== null) {
    rawPrice = Number(item.price);
  } else if (item.starting_price !== undefined && item.starting_price !== null) {
    rawPrice = Number(item.starting_price);
  } else if (Array.isArray(item.options) && item.options.length > 0) {
    const firstOpt = item.options[0];
    if (firstOpt.price_per_adult !== undefined && firstOpt.price_per_adult !== null) {
      rawPrice = Number(firstOpt.price_per_adult);
    } else if (firstOpt.base_price_uzs !== undefined && firstOpt.base_price_uzs !== null) {
      rawPrice = Number(firstOpt.base_price_uzs);
    }
  }

  const currency = item.currency || 'UZS';
  let formattedPrice = '';
  if (rawPrice !== null && !isNaN(rawPrice)) {
    formattedPrice = `${rawPrice.toLocaleString('uz-UZ')} ${currency}`;
  }

  // Organizer info
  let organizerType = 'Gid';
  if (item.organizer?.type === 'operator' || item.organizer_type === 'operator' || item.format === 'multi_day') {
    organizerType = 'Turoperator';
  } else if (item.organizer?.type === 'guide' || item.organizer_type === 'guide') {
    organizerType = 'Gid';
  }

  const organizerName = 
    item.organizer?.company_name || 
    item.organizer?.name || 
    item.organizer?.user?.full_name || 
    item.organizerName || 
    '';

  const organizerId = 
    item.organizer?.slug || 
    item.organizer?.id || 
    item.organizer_id || 
    null;

  const organizerSlug = item.organizer?.slug || (typeof item.organizer === 'string' ? item.organizer : '') || '';

  // Parse image URLs safely from arrays, space-separated or comma-separated strings
  const parseImageUrls = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.flat();
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // ignore
        }
      }
      return trimmed.split(/\s+|,/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Images handling
  const rawImages = [];
  if (item.cover) rawImages.push(item.cover);
  if (item.cover_image && !rawImages.includes(item.cover_image)) rawImages.push(item.cover_image);
  
  for (const img of parseImageUrls(item.images)) {
    if (img && !rawImages.includes(img)) rawImages.push(img);
  }

  for (const img of parseImageUrls(item.gallery)) {
    if (img && !rawImages.includes(img)) rawImages.push(img);
  }

  if (rawImages.length === 0 && item.image) {
    rawImages.push(item.image);
  }

  const resolvedImages = rawImages.map(img => {
    if (!img) return '';
    if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
      return img;
    }
    if (img.startsWith('/uploads')) {
      return `${BASE_URL}${img}`;
    }
    return img;
  }).filter(Boolean);

  const image = resolvedImages[0] || '';

  // Departures & dates: strictly from backend schedules or departures
  let departures = [];
  if (Array.isArray(item.departures) && item.departures.length > 0) {
    departures = item.departures.map((d, idx) => ({
      id: d.id || idx + 1,
      date: typeof d === 'string' ? d : (d.departure_date || d.date),
      time: d.time || d.start_time || d.departure_time || '',
      seatsTotal: d.seatsTotal || d.total_seats || null,
      seatsLeft: d.seatsLeft !== undefined ? d.seatsLeft : (d.available_seats !== undefined ? d.available_seats : (d.seatsTotal || d.total_seats || null)),
      priceOverride: d.priceOverride || null,
      status: d.status || 'scheduled'
    }));
  } else if (Array.isArray(item.options) && item.options.length > 0) {
    for (const opt of item.options) {
      if (Array.isArray(opt.schedules) && opt.schedules.length > 0) {
        for (const s of opt.schedules) {
          departures.push({
            id: s.id,
            date: s.departure_date || s.date,
            time: s.start_time || s.departure_time || s.time || '',
            seatsTotal: s.seatsTotal || s.total_seats || null,
            seatsLeft: s.seatsLeft !== undefined ? s.seatsLeft : (s.available_seats !== undefined ? s.available_seats : (s.seatsTotal || s.total_seats || null)),
            priceOverride: s.priceOverride || opt.price_per_adult || null,
            status: s.status || 'scheduled'
          });
        }
      }
    }
  } else if (item.departure_date) {
    departures = [{
      id: 1,
      date: item.departure_date,
      time: item.departure_time || '',
      seatsTotal: item.total_seats || null,
      seatsLeft: item.total_seats !== undefined ? item.total_seats : null,
      status: item.status || 'scheduled'
    }];
  }

  const departureDates = departures.map(d => d.date).filter(Boolean);

  // Group limits
  const groupMin = item.groupMin || item.min_group_size || 1;
  const groupMax = item.groupMax || item.max_group_size || item.total_seats || null;

  // Ratings: Only real backend rating, no fake 5.0 fallback
  const rating = (item.rating !== undefined && item.rating !== null && !isNaN(Number(item.rating)))
    ? Number(item.rating)
    : null;

  const reviewsCount = Number(item.reviews_count || item.reviewsCount || 0);

  // Helper to parse lists (included, excluded, highlights)
  const parseList = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return [];
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean);
        } catch {
          // ignore
        }
      }
      if (trimmed.includes('\n')) {
        return trimmed.split('\n').map(s => s.replace(/^[-*•]\s*/, '').trim()).filter(Boolean);
      }
      if (trimmed.includes(';') || trimmed.includes(',')) {
        return trimmed.split(/[;,]/).map(s => s.trim()).filter(Boolean);
      }
      return [trimmed];
    }
    return [];
  };

  // Itinerary / Program
  let itinerary = [];
  if (Array.isArray(item.itinerary) && item.itinerary.length > 0) {
    itinerary = item.itinerary;
  } else if (Array.isArray(item.program) && item.program.length > 0) {
    itinerary = item.program.map((p, idx) => ({
      day: p.day || idx + 1,
      title: p.title || `${idx + 1}-kun dasturi`,
      text: p.description || p.text || (typeof p === 'string' ? p : ''),
      time: p.time || ''
    }));
  } else if (typeof item.program === 'string' && item.program.trim()) {
    const rawProg = item.program.trim();
    if (rawProg.startsWith('[') && rawProg.endsWith(']')) {
      try {
        const parsed = JSON.parse(rawProg);
        if (Array.isArray(parsed)) {
          itinerary = parsed.map((p, idx) => ({
            day: p.day || idx + 1,
            title: p.title || `${idx + 1}-kun`,
            text: p.description || p.text || (typeof p === 'string' ? p : ''),
            time: p.time || ''
          }));
        }
      } catch {
        // ignore
      }
    }
    if (itinerary.length === 0) {
      const lines = rawProg.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        itinerary = lines.map((line, idx) => ({
          day: idx + 1,
          title: `${idx + 1}-kun`,
          text: line,
          time: ''
        }));
      }
    }
  }

  // Inclusions & Exclusions
  const included = parseList(item.included || item.included_items);
  const excluded = parseList(item.excluded || item.excluded_items);

  return {
    id,
    slug,
    title,
    location,
    duration,
    tag,
    price: rawPrice,
    currency,
    formattedPrice,
    organizerType,
    organizerName,
    organizerId,
    organizerSlug,
    organizer: item.organizer || null,
    image,
    images: resolvedImages,
    rating,
    reviewsCount,
    isLiked: Boolean(item.isLiked || item.is_liked),
    description: item.description || '',
    itinerary,
    included,
    excluded,
    groupMin,
    groupMax,
    meetingPoint: item.meetingPoint || item.meeting_point || null,
    cancellationPolicy: item.cancellationPolicy || item.cancellation_policy || 'standard',
    departureDates,
    departures,
    options: Array.isArray(item.options) ? item.options : [],
    raw: item
  };
}

/**
 * Uzbekcha sana formati: Masalan '2026-11-05' -> '5-noyabr'
 */
export function formatDateUz(dateStr) {
  if (!dateStr) return '';
  try {
    const str = String(dateStr).trim();
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthIdx = parseInt(parts[1], 10) - 1;
      const months = [
        'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
        'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
      ];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day}-${months[monthIdx]}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const months = [
        'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
        'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'
      ];
      return `${d.getDate()}-${months[d.getMonth()]}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}


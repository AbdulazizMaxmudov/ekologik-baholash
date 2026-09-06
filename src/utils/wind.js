// O'zbekiston hududi bo'yicha real vaqtdagi shamol maydonini olish.
// Manba: Open-Meteo (API key talab qilmaydi) — bir so'rovda ko'p nuqtali
// (lat/lon grid) joriy shamol tezligi/yo'nalishini so'raymiz va uni
// leaflet-velocity kutgan U/V grid (GRIB2-uslubidagi) formatga aylantiramiz.

// O'zbekiston atrofidagi butun ko'rinadigan xarita maydonini (qo'shni davlatlar
// bilan birga, standart zoom darajasida) qamrab olish uchun O'zbekiston
// chegarasidan ancha kengroq hudud olamiz — aks holda shamol effekti faqat
// mamlakat chegarasiga mos to'rtburchak ichida to'xtab qolib, uning chetlari
// aniq ko'rinib qolar edi.
const UZ_WIND_BOUNDS = { north: 50, south: 33, west: 48, east: 80 };
const GRID_STEP = 3; // daraja — Open-Meteo har nuqtani alohida so'rov sifatida hisoblagani uchun zich emas
const CACHE_TTL_MS = 10 * 60 * 1000; // Open-Meteo joriy ma'lumotni ~15 daqiqada yangilaydi

let cachedData = null;
let cachedAt = 0;
let inFlightRequest = null;

// StrictMode'ning effektlarni 2 marta ishga tushirishi va viloyat/tuman
// drill-down'da xarita qayta mount bo'lishi natijasida bir necha komponent
// bir vaqtda so'rov yubormasligi uchun natija va so'rovni keshlab qo'yamiz —
// aks holda Open-Meteo tez orada 429 (Too Many Requests) qaytaradi.
export function fetchUzbekistanWindGrid() {
  const now = Date.now();
  if (cachedData && now - cachedAt < CACHE_TTL_MS) {
    return Promise.resolve(cachedData);
  }
  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = fetchGridFromOpenMeteo()
    .then((data) => {
      cachedData = data;
      cachedAt = Date.now();
      return data;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
}

async function fetchGridFromOpenMeteo() {
  const { north, south, west, east } = UZ_WIND_BOUNDS;

  const lats = [];
  for (let lat = north; lat >= south; lat -= GRID_STEP) lats.push(lat);

  const lons = [];
  for (let lon = west; lon <= east; lon += GRID_STEP) lons.push(lon);

  // leaflet-velocity ma'lumotni la1(shimol)dan la2(janub)ga, har bir qatorda
  // lo1(g'arb)dan lo2(sharq)ga qarab kutadi — shu tartibda so'rov tuzamiz.
  const latParams = [];
  const lonParams = [];
  for (const lat of lats) {
    for (const lon of lons) {
      latParams.push(lat);
      lonParams.push(lon);
    }
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latParams.join(',')}&longitude=${lonParams.join(',')}&current=wind_speed_10m,wind_direction_10m&wind_speed_unit=ms`;

  const res = await fetch(url);
  if (res.status === 429) {
    throw new Error("Shamol xizmati hozircha band (429 - juda ko'p so'rov). Birozdan so'ng avtomatik qayta urinib ko'riladi.");
  }
  if (!res.ok) {
    throw new Error("Shamol ma'lumotlarini olishda xatolik yuz berdi");
  }
  const points = await res.json();

  const uData = new Array(points.length);
  const vData = new Array(points.length);

  points.forEach((point, i) => {
    const speed = point?.current?.wind_speed_10m ?? 0;
    const dirDeg = point?.current?.wind_direction_10m ?? 0;
    const dirRad = (dirDeg * Math.PI) / 180;
    // Meteorologik konventsiya: yo'nalish shamol QAYERDAN esayotganini bildiradi
    uData[i] = -speed * Math.sin(dirRad);
    vData[i] = -speed * Math.cos(dirRad);
  });

  const header = {
    parameterUnit: 'm.s-1',
    parameterCategory: 2,
    la1: north,
    lo1: west,
    la2: lats[lats.length - 1],
    lo2: lons[lons.length - 1],
    dx: GRID_STEP,
    dy: GRID_STEP,
    nx: lons.length,
    ny: lats.length,
    refTime: points[0]?.current?.time ?? new Date().toISOString(),
    forecastTime: 0,
  };

  return [
    { header: { ...header, parameterNumber: 2, parameterNumberName: 'UGRD' }, data: uData },
    { header: { ...header, parameterNumber: 3, parameterNumberName: 'VGRD' }, data: vData },
  ];
}

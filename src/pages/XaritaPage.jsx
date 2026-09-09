import { useState, useRef, useEffect, useMemo, Fragment } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polygon, Polyline, Circle, CircleMarker, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, InputNumber, message, Drawer, Switch } from 'antd';
import { Layers, Crosshair, Pencil, X, Wind } from 'lucide-react';
import WindVelocityLayer from '../components/WindVelocityLayer';
import WindHeatmapLayer from '../components/WindHeatmapLayer';
import { fetchUzbekistanWindGrid } from '../utils/wind';
import AddKorxonaModal from '../components/AddKorxonaModal';
import { korxonalarSeed } from '../data/korxonalar';
import { tashkentKorxonalari } from '../data/tashkentKorxonalari';
import { TASHLANMA_KATEGORIYALARI } from '../data/tashlanmaTurlari';

// Konteyner o'lchami o'zgarganda (ekran/oyna kengligi, sidebar) Leaflet
// tayl'arini qayta o'lchashga majburlaydi — aks holda xarita bo'sh/buzilgan
// ko'rinishi mumkin, ayniqsa ilova ichiga joylashtirilgan flex layout'da.
const MapAutoResize = () => {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    // MapContainer har safar drill-down navigatsiyasida (mapKey orqali) qayta
    // mount bo'ladi — flex layout hali joylashuvni tugatmagan bo'lishi mumkin,
    // shuning uchun mountdan keyin bir marta majburan qayta o'lchaymiz.
    const raf = requestAnimationFrame(() => map.invalidateSize());

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
};

// Radius markazini belgilash yoki poligon nuqtalarini chizish uchun
// xaritadagi bosishlarni tinglaydi — faqat shu vositalardan biri
// yoqilganda ishlaydi (`tool` null bo'lsa hech narsa qilmaydi)
const SpatialToolClickHandler = ({ tool, onPick }) => {
  useMapEvents({
    click: (e) => {
      if (!tool) return;
      onPick([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
};

// "Xarita qatlamlari" drawer'idagi bitta qatlam qatori (rangli belgi + nom +
// yoqish/o'chirish tugmasi). Shamol, o'rmon fondi va qo'shimcha qatlamlar
// uchun umumiy ko'rinish.
const LayerToggleRow = ({ color, label, description, checked, loading, onChange }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '0.75rem',
      padding: '0.6rem 0.75rem',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      background: checked ? '#f8fafc' : 'white',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{label}</div>
        {description && (
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{description}</div>
        )}
      </div>
    </div>
    <Switch checked={checked} loading={loading} onChange={onChange} />
  </div>
);

// Import GeoJSON data
import regions from '../utils/uzbekistanGeoJson/data/regions.js';
import qoraqalpogiston from '../utils/uzbekistanGeoJson/data/qoraqalpogiston.js';
import andijon from '../utils/uzbekistanGeoJson/data/andijon.js';
import buxoro from '../utils/uzbekistanGeoJson/data/buxoro.js';
import fargona from '../utils/uzbekistanGeoJson/data/fargona.js';
import jizzax from '../utils/uzbekistanGeoJson/data/jizzax.js';
import namangan from '../utils/uzbekistanGeoJson/data/namangan.js';
import navoiy from '../utils/uzbekistanGeoJson/data/navoiy.js';
import qashqadaryo from '../utils/uzbekistanGeoJson/data/qashqadaryo.js';
import samarqand from '../utils/uzbekistanGeoJson/data/samarqand.js';
import sirdaryo from '../utils/uzbekistanGeoJson/data/sirdaryo.js';
import surxondaryo from '../utils/uzbekistanGeoJson/data/surxondaryo.js';
import toshkent from '../utils/uzbekistanGeoJson/data/toshkent.js';
import xorazm from '../utils/uzbekistanGeoJson/data/xorazm.js';

// `toshkent.js` — Toshkent VILOYATI uchun tumanlar GeoJSON fayli — Toshkent
// SHAHRINING 11 ta shahar tumani (Bektemir, Sergeli va h.k.) poligonlarini
// ham o'z ichiga oladi, chunki manba fayl ikkalasini ham bitta hujjatda
// bergan. Toshkent shahri respublikada alohida ma'muriy birlik (viloyat
// emas), shuning uchun uni xaritada alohida "viloyat" sifatida ko'rsatish
// va uning tumanlarini Toshkent viloyati tumanlari bilan aralashtirmaslik
// uchun shu yerda ikkiga ajratamiz.
const TOSHKENT_SHAHAR_TUMAN_NOMLARI = new Set([
  "Bektemir", "Sergeli", "Chilanzar", "Uchtepa", "Yakkasaray", "Almazar",
  "Shaykhantokhur", "Yunusabad", "Yashnobod", "Mirabad", "Mirzo Ulugbek",
]);

const toshkentShahriPath = {
  type: "FeatureCollection",
  features: toshkent.features.filter((f) => TOSHKENT_SHAHAR_TUMAN_NOMLARI.has(f.properties.name)),
};

const toshkentViloyatiPath = {
  type: "FeatureCollection",
  // "Toshkent sh." — butun shahar chegarasining o'zi (bitta yaxlit
  // GeometryCollection) — bu tuman emas, shuning uchun viloyat tumanlari
  // ro'yxatidan ham chiqarib tashlanadi.
  features: toshkent.features.filter(
    (f) => f.properties.name !== "Toshkent sh." && !TOSHKENT_SHAHAR_TUMAN_NOMLARI.has(f.properties.name)
  ),
};

// Ba'zi hududlarning to'liq nomi "<Nom> viloyati" qolipiga to'g'ri
// kelmaydi (Toshkent shahri viloyat emas, Qoraqalpog'iston esa respublika) —
// shu kalitlar uchun aniq nom, qolganlari uchun formatName(key)+" viloyati"
// ishlatiladi (regionDisplayName() da, pastda).
const REGION_DISPLAY_NAMES = {
  toshkentshahri: "Toshkent shahri",
};

// Data structure from data.js
const data = {
  regions: {
    path: regions,
    name: "regions",
  },
  qoraqalpogiston: {
    name: "qoraqalpogiston",
    path: qoraqalpogiston,
    subData: [
      { name: "amudarya", value: 10 },
      { name: "chimbay", value: 30 },
      { name: "kanlikul", value: 12 },
      { name: "shumanay", value: 0 },
      { name: "khojeyli", value: 100 },
      { name: "kegeyli", value: 30 },
      { name: "muynak", value: 0 },
      { name: "nukus", value: 0 },
      { name: "karauzyak", value: 64 },
      { name: "kungrad", value: 100 },
      { name: "takhtakupir", value: 0 },
      { name: "turtkul", value: 45 },
      { name: "beruniy", value: 0 },
      { name: "urgench", value: 500 },
      { name: "ellikkala", value: 0 },
    ],
  },
  andijon: {
    name: "andijon",
    path: andijon,
    subData: [
      { name: "andijan", value: 0 },
      { name: "ulugnar", value: 0 },
      { name: "khadjaabad", value: 0 },
      { name: "markhamat", value: 0 },
      { name: "asaka", value: 0 },
      { name: "shakhrixan", value: 0 },
      { name: "boz", value: 0 },
      { name: "djalalkuduk", value: 0 },
      { name: "bulakbashi", value: 0 },
      { name: "kurgantepa", value: 0 },
      { name: "balikchi", value: 0 },
      { name: "khanabad", value: 0 },
      { name: "altinkul", value: 0 },
      { name: "izboskan", value: 0 },
      { name: "paxtaabad", value: 0 },
    ],
  },
  buxoro: {
    name: "buxoro",
    path: buxoro,
    subData: [
      { name: "gijduvan", value: 0 },
      { name: "jondor", value: 0 },
      { name: "alat", value: 0 },
      { name: "kagan", value: 0 },
      { name: "shafirkan", value: 0 },
      { name: "rаmitan", value: 0 },
      { name: "peshku", value: 0 },
      { name: "vabkent", value: 0 },
      { name: "bukhara", value: 0 },
      { name: "karakul", value: 0 },
      { name: "karaulbazar", value: 0 },
    ],
  },
  fargona: {
    name: "fargona",
    path: fargona,
    subData: [
      { name: "kokand", value: 0 },
      { name: "furkat", value: 0 },
      { name: "uzbekistan", value: 0 },
      { name: "besharik", value: 0 },
      { name: "sokh", value: 0 },
      { name: "fergana", value: 0 },
      { name: "kushtepa", value: 0 },
      { name: "buvayda", value: 0 },
      { name: "dangara", value: 0 },
      { name: "yazyavan", value: 0 },
      { name: "kuva", value: 0 },
      { name: "tashlak", value: 0 },
      { name: "margilan", value: 0 },
      { name: "uchkuprik", value: 0 },
      { name: "kuvasay", value: 0 },
      { name: "altiarik", value: 0 },
      { name: "rishtan", value: 0 },
      { name: "bagdad", value: 0 },
    ],
  },
  jizzax: {
    name: "jizzax",
    path: jizzax,
    subData: [
      { name: "farish", value: 0 },
      { name: "mirzachul", value: 0 },
      { name: "arnasay", value: 0 },
      { name: "yangiabad", value: 0 },
      { name: "dzhizak", value: 0 },
      { name: "bakhmal", value: 0 },
      { name: "gallyaaral", value: 0 },
      { name: "dustlik", value: 0 },
      { name: "zafarabad", value: 0 },
      { name: "zaаmin", value: 0 },
      { name: "zarbdar", value: 0 },
      { name: "paxtakor", value: 0 },
      { name: "sharof", value: 0 },
    ],
  },
  namangan: {
    name: "namangan",
    path: namangan,
    subData: [
      { name: "yangikurgan", value: 0 },
      { name: "kasansay", value: 0 },
      { name: "namangan", value: 0 },
      { name: "uychi", value: 0 },
      { name: "chartak", value: 0 },
      { name: "narin", value: 0 },
      { name: "uchkurgan", value: 0 },
      { name: "mingbulak", value: 0 },
      { name: "chust", value: 0 },
      { name: "pap", value: 0 },
      { name: "turakurgan", value: 0 },
    ],
  },
  navoiy: {
    name: "navoiy",
    path: navoiy,
    subData: [
      { name: "karmana", value: 0 },
      { name: "uchkuduk", value: 0 },
      { name: "kanimekh", value: 0 },
      { name: "tamdi", value: 0 },
      { name: "navbakhor", value: 0 },
      { name: "nurata", value: 0 },
      { name: "navoi", value: 0 },
      { name: "kiziltepa", value: 0 },
      { name: "khatirchi", value: 0 },
      { name: "zarafshan", value: 0 },
    ],
  },
  qashqadaryo: {
    name: "qashqadaryo",
    path: qashqadaryo,
    subData: [
      { name: "yakkabag", value: 0 },
      { name: "kitab", value: 0 },
      { name: "kamashi", value: 0 },
      { name: "karshi", value: 0 },
      { name: "kasbi", value: 0 },
      { name: "mirishkar", value: 0 },
      { name: "nishan", value: 0 },
      { name: "guzar", value: 0 },
      { name: "dehkanabad", value: 0 },
      { name: "kasan", value: 0 },
      { name: "mubarek", value: 0 },
      { name: "chirakchi", value: 0 },
      { name: "shakhrisabz", value: 0 },
    ],
  },
  samarqand: {
    name: "samarqand",
    path: samarqand,
    subData: [
      { name: "bulungur", value: 0 },
      { name: "pakhtachi", value: 0 },
      { name: "pastdargom", value: 0 },
      { name: "ishtikhan", value: 0 },
      { name: "narpay", value: 0 },
      { name: "kattakurgan", value: 0 },
      { name: "koshrabad", value: 0 },
      { name: "samarkand", value: 0 },
      { name: "urgut", value: 0 },
      { name: "taylak", value: 0 },
      { name: "dzhambay", value: 0 },
      { name: "payarik", value: 0 },
      { name: "akdarya", value: 0 },
      { name: "nurabad", value: 0 },
    ],
  },
  sirdaryo: {
    name: "sirdaryo",
    path: sirdaryo,
    subData: [
      { name: "gulistan", value: 0 },
      { name: "saykhunabad", value: 0 },
      { name: "akaltin", value: 0 },
      { name: "sirdarya", value: 0 },
      { name: "bayaut", value: 0 },
      { name: "shirin", value: 0 },
      { name: "yangiyer", value: 0 },
      { name: "sardoba", value: 0 },
      { name: "khavas", value: 0 },
      { name: "mirzaabad", value: 0 },
    ],
  },
  surxondaryo: {
    name: "surxondaryo",
    path: surxondaryo,
    subData: [
      { name: "baysun", value: 0 },
      { name: "muzrabad", value: 0 },
      { name: "sherabad", value: 0 },
      { name: "angor", value: 0 },
      { name: "termez", value: 0 },
      { name: "sariasiya", value: 0 },
      { name: "dzharkurgan", value: 0 },
      { name: "kizirik", value: 0 },
      { name: "shurchi", value: 0 },
      { name: "kumkurgan", value: 0 },
      { name: "uzun", value: 0 },
      { name: "altinsay", value: 0 },
      { name: "denau", value: 0 },
    ],
  },
  toshkent: {
    name: "toshkent",
    path: toshkentViloyatiPath,
    subData: [
      { name: "bekabad", value: 0 },
      { name: "urtachirchik", value: 0 },
      { name: "kuyichirchik", value: 0 },
      { name: "chinaz", value: 0 },
      { name: "akhangaran", value: 0 },
      { name: "buka", value: 0 },
      { name: "akkurgan", value: 0 },
      { name: "pskent", value: 0 },
      { name: "almalik", value: 0 },
      { name: "yangiyul", value: 0 },
      { name: "tashkent", value: 0 },
      { name: "kibray", value: 0 },
      { name: "bostanlik", value: 0 },
      { name: "chirchik", value: 0 },
      { name: "nurafshon", value: 0 },
      { name: "yukarichirchik", value: 0 },
      { name: "parkent", value: 0 },
      { name: "angren", value: 0 },
      { name: "zangiata", value: 0 },
    ],
  },
  // Toshkent shahri — respublika ahamiyatiga ega alohida ma'muriy birlik
  // (Toshkent viloyatining tarkibiy qismi emas). Tumanlari yuqoridagi
  // `toshkent` (viloyat) dan alohida.
  toshkentshahri: {
    name: "toshkentshahri",
    path: toshkentShahriPath,
    subData: [
      { name: "bektemir", value: 0 },
      { name: "sergeli", value: 0 },
      { name: "chilanzar", value: 0 },
      { name: "uchtepa", value: 0 },
      { name: "yakkasaray", value: 0 },
      { name: "almazar", value: 0 },
      { name: "shaykhantokhur", value: 0 },
      { name: "yunusabad", value: 0 },
      { name: "yashnobod", value: 0 },
      { name: "mirabad", value: 0 },
      { name: "mirzo ulugbek", value: 0 },
    ],
  },
  xorazm: {
    name: "xorazm",
    path: xorazm,
    subData: [
      { name: "bagat", value: 0 },
      { name: "gurlen", value: 0 },
      { name: "koshkupir", value: 0 },
      { name: "shavat", value: 0 },
      { name: "khiva", value: 0 },
      { name: "khazarasp", value: 0 },
      { name: "khanka", value: 0 },
      { name: "yangiarik", value: 0 },
      { name: "yangibazar", value: 0 },
      { name: "urgench", value: 0 },
    ],
  },
};

// O'rmon fondi yerlari ma'lumoti mavjud bo'lgan viloyatlar
// (public/data/ormon/<key>.json — scripts/convert-kmz-to-geojson.mjs orqali tayyorlangan)
const ORMON_REGION_KEYS = [
  "buxoro", "fargona", "jizzax", "namangan", "navoiy", "qashqadaryo",
  "qoraqalpogiston", "samarqand", "sirdaryo", "surxondaryo", "toshkent", "xorazm",
];

// Respublika miqyosidagi qo'shimcha xarita qatlamlari — har biri bitta
// public/data/<key>.json fayl (scripts/convert-extra-layers.mjs orqali
// kmz-source/*.kmz dan tayyorlangan). O'rmon fondidan farqli o'laroq
// viloyatlarga bo'linmagan, shuning uchun bitta so'rov bilan yuklanadi.
const EXTRA_LAYERS = [
  {
    key: "suv_omborlari",
    label: "Suv omborlari",
    description: "Respublika suv omborlari",
    color: "#0369a1",
    fillColor: "#38bdf8",
  },
  {
    key: "ichimlik_suvi_konlari",
    label: "Ichimlik suvi konlari",
    description: "Yer osti ichimlik suvi konlari",
    color: "#0e7490",
    fillColor: "#22d3ee",
  },
  {
    key: "smqz",
    label: "Suv havzalari SMQZ",
    description: "Sanitariya-muhofaza qilinadigan zonalar",
    color: "#7c3aed",
    fillColor: "#a78bfa",
  },
  {
    key: "urmon_ov_xujaliklari",
    label: "O'rmon-ov xo'jaliklari",
    description: "Davlat o'rmon-ov xo'jaliklari hududlari",
    color: "#b45309",
    fillColor: "#fbbf24",
  },
];

// EXTRA_LAYERS geojson xususiyatlaridagi kalitlarni popup uchun o'qiladigan
// o'zbekcha yorliqlarga o'giradi (scripts/convert-extra-layers.mjs dagi
// keepKeys bilan mos keladi).
const EXTRA_FIELD_LABELS = {
  idora: "Idora",
  sana: "Qaror sanasi",
  umumiyMaydon: "Umumiy maydon (ga)",
  qishloqMaydon: "Qishloq xo'jaligi maydoni (ga)",
  sugorilMaydon: "Sug'oriladigan maydon (ga)",
  urmonMaydon: "O'rmon maydoni (ga)",
  boshqaMaydon: "Boshqa maydon (ga)",
  kadastr: "Kadastr raqami",
  qonuniyMaydon: "Qonuniy maydon (ga)",
  gisMaydon: "GIS maydoni (ga)",
  viloyat: "Viloyat",
  tuman: "Tuman",
  royxatSana: "Ro'yxatga olingan sana",
  huquqHolati: "Huquqiy holati",
};

// Helper functions
const getFirstWordLowercase = (str) => {
  // "Toshkent sh." (shahar) va "Toshkent viloyati" ikkalasi ham birinchi
  // so'zi "Toshkent" bo'lgani uchun umumiy qoida ularni bir xil kalitga
  // (regionKey) tenglashtirib qo'yardi — shaharni alohida ajratamiz.
  if (str === "Toshkent sh.") return "toshkentshahri";
  let filter = str.replace(/[-',`ʻ]/g, "");
  let name = filter.split(" ")[0].toLowerCase();
  return name;
};

// ---------------------------------------------------------------------------
// Hudud (radius/poligon) tahlili uchun geometriya yordamchilari
// ---------------------------------------------------------------------------

// Ikki [lat,lng] nuqta orasidagi masofa (km), Yer sharsimonligini hisobga olgan holda
function haversineKm([lat1, lng1], [lat2, lng2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Poligon markazidan eng uzoq burchak nuqtasigacha bo'lgan masofa (metrda) —
// korxona hududi (olti burchak) ustiga uni to'liq qamrab oladigan, burchaklari
// bo'lmagan (shuning uchun "chetiga bosilsa ham ishlamayapti" degan holat
// yuzaga kelmaydigan) doiraviy bosish maydoni chizish uchun ishlatiladi.
function polygonMaxRadiusMeters(center, positions) {
  let max = 0;
  for (const pt of positions) {
    const d = haversineKm(center, pt) * 1000;
    if (d > max) max = d;
  }
  return max;
}

// Nuqta [lat,lng] bosh burchaklari [lat,lng] massivi bo'lgan poligon ichidami
// (ray-casting, even-odd qoida)
function pointInPolygonLatLng([lat, lng], points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [yi, xi] = points[i];
    const [yj, xj] = points[j];
    const intersect = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Berilgan boshlang'ich nuqtadan ma'lum masofa (km) va yo'nalish (kompas
// gradusi, shimoldan soat yo'nalishi bo'yicha) bo'yicha yakuniy nuqtani topadi
function destinationPoint([lat, lng], bearingDeg, distanceKm) {
  const R = 6371;
  const d = distanceKm / R;
  const brng = (bearingDeg * Math.PI) / 180;
  const phi1 = (lat * Math.PI) / 180;
  const lambda1 = (lng * Math.PI) / 180;
  const phi2 = Math.asin(Math.sin(phi1) * Math.cos(d) + Math.cos(phi1) * Math.sin(d) * Math.cos(brng));
  const lambda2 =
    lambda1 +
    Math.atan2(Math.sin(brng) * Math.sin(d) * Math.cos(phi1), Math.cos(d) - Math.sin(phi1) * Math.sin(phi2));
  return [(phi2 * 180) / Math.PI, (lambda2 * 180) / Math.PI];
}

// windData ([U-grid, V-grid], fetchUzbekistanWindGrid() formatida) ichidan
// berilgan nuqtaga eng yaqin katakning shamol tezligi va "qayerga esishi"
// yo'nalishini (kompas gradusi) hisoblaydi.
function getWindVectorAt([lat, lng], windData) {
  if (!windData || windData.length < 2) return null;
  const [uGrid, vGrid] = windData;
  const { la1, lo1, dx, dy, nx, ny } = uGrid.header;
  let row = Math.round((la1 - lat) / dy);
  let col = Math.round((lng - lo1) / dx);
  row = Math.min(Math.max(row, 0), ny - 1);
  col = Math.min(Math.max(col, 0), nx - 1);
  const idx = row * nx + col;
  const u = uGrid.data[idx];
  const v = vGrid.data[idx];
  if (u == null || v == null) return null;
  const speed = Math.hypot(u, v);
  const bearingDeg = ((Math.atan2(u, v) * 180) / Math.PI + 360) % 360;
  return { speed, bearingDeg };
}

// Tahlil qilingan hudud ustidan chiqadigan taxminiy shamol yo'nalishi
// "konusi" — ILMIY MODEL EMAS, faqat umumiy atmosfera tashlanmasi miqdoriga
// qarab uzunligi o'lchamlangan, joriy shamol yo'nalishi bo'ylab cho'zilgan
// vizual ko'rsatkich (sektor poligon).
function buildWindConePolygon(center, bearingDeg, lengthKm, spreadDeg = 28, steps = 12) {
  const points = [center];
  for (let i = 0; i <= steps; i++) {
    const angle = bearingDeg - spreadDeg / 2 + (spreadDeg * i) / steps;
    points.push(destinationPoint(center, angle, lengthKm));
  }
  points.push(center);
  return points;
}

// Foydalanuvchi qidiruv maydoniga koordinata kiritganini aniqlaydi
// (masalan "41.31, 69.28" yoki "41.31 69.28") — [lat,lng] yoki null qaytaradi
function parseCoordinateInput(str) {
  const match = str.trim().match(/^(-?\d{1,3}(?:[.,]\d+)?)\s*[,\s]\s*(-?\d{1,3}(?:[.,]\d+)?)$/);
  if (!match) return null;
  const lat = parseFloat(match[1].replace(",", "."));
  const lng = parseFloat(match[2].replace(",", "."));
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return [lat, lng];
}

export default function XaritaPage() {
  const [currentPath, setCurrentPath] = useState(data.regions);
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [bottomPanelTab, setBottomPanelTab] = useState('chiqindilar'); // 'chiqindilar' | 'korxonalar'
  const mapRef = useRef(null);

  // Chrome/Chromium'da murakkab layout o'zgarganda (bu yerda: viloyat/tuman
  // navigatsiyasi) ba'zan sahifaning bir qismi qayta chizilmay, to'rtburchak
  // "bo'sh joylar" holida qolib ketadi. Global resize hodisasini sun'iy
  // chaqirish brauzerni butun sahifani qayta chizishga majburlaydi.
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
    return () => clearTimeout(timer);
  }, [mapKey]);

  // 3-daraja uchun: tuman ko'rinishi
  const [currentLevel, setCurrentLevel] = useState("regions"); // "regions" | "region" | "district"
  const [parentRegion, setParentRegion] = useState(null); // viloyat nomi (tumanga o'tganda eslab qolish uchun)
  const [selectedDistrict, setSelectedDistrict] = useState(null); // tanlangan tuman feature
  const [selectedDistrictName, setSelectedDistrictName] = useState(null); // tanlangan tuman nomi (breadcrumb uchun)

  // Korxonalar (namunaviy + Toshkent shahar korxonalar jamlamasi + qo'lda
  // qo'shilganlar) va "Yangi korxona qo'shish" modali
  const [korxonalar, setKorxonalar] = useState(() => [...korxonalarSeed, ...tashkentKorxonalari]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Qidiruv orqali topilgan korxonani xaritada vaqtincha ajratib ko'rsatish
  // (flyTo effekti tugagach popup avtomatik ochiladi)
  const [highlightedKorxonaId, setHighlightedKorxonaId] = useState(null);
  const korxonaMarkerRefs = useRef({});

  // Popup ichidagi belgi orqali tanlangan korxona — shu korxonaning
  // taxminiy shamol tarqalish konusi xaritada ko'rsatiladi
  const [dispersionKorxonaId, setDispersionKorxonaId] = useState(null);

  // "Xarita qatlamlari" paneli (shamol, o'rmon fondi va qo'shimcha
  // qatlamlarni yoqish/o'chirish) — tepada joy band qilmasligi uchun ong
  // tarafdan ochiladigan drawer ichida
  const [isLayersDrawerOpen, setIsLayersDrawerOpen] = useState(false);

  // Radius / erkin chizilgan hudud bo'yicha korxonalarni ajratib tahlil
  // qilish. `spatialTool` — hozir yoqilgan tanlash vositasi (markaz
  // belgilash yoki poligon chizish), `spatialFilter` — YAKUNLANGAN tanlov
  // (shundan keyin visibleKorxonalar ham shunga mos filtrlanadi).
  const [spatialTool, setSpatialTool] = useState(null); // null | 'radius' | 'polygon'
  const [spatialFilter, setSpatialFilter] = useState(null); // null | {type:'radius',center,radiusKm} | {type:'polygon',points}
  const [pendingCenter, setPendingCenter] = useState(null); // radius vositasida bosilgan/kiritilgan markaz
  const [pendingRadiusKm, setPendingRadiusKm] = useState(20);
  const [drawingPoints, setDrawingPoints] = useState([]); // poligon chizishda hozirgacha bosilgan nuqtalar

  // Har qanday hudud-tahlil vositasini o'chirib, oddiy viloyat/tuman
  // ko'rinishiga qaytaradi (yangi tahlil boshlanganda ham chaqiriladi)
  const clearSpatialTool = () => {
    setSpatialTool(null);
    setPendingCenter(null);
    setDrawingPoints([]);
  };

  const clearSpatialFilter = () => {
    setSpatialFilter(null);
    clearSpatialTool();
  };

  const startRadiusTool = () => {
    setCurrentPath(data.regions);
    setCurrentLevel("regions");
    setParentRegion(null);
    setSelectedDistrict(null);
    setSelectedDistrictName(null);
    setSpatialFilter(null);
    setMapKey((prev) => prev + 1);
    setSpatialTool("radius");
    setPendingCenter(null);
  };

  const startPolygonTool = () => {
    setCurrentPath(data.regions);
    setCurrentLevel("regions");
    setParentRegion(null);
    setSelectedDistrict(null);
    setSelectedDistrictName(null);
    setSpatialFilter(null);
    setMapKey((prev) => prev + 1);
    setSpatialTool("polygon");
    setDrawingPoints([]);
  };

  const confirmRadiusAnalysis = () => {
    if (!pendingCenter) return;
    setSpatialFilter({ type: "radius", center: pendingCenter, radiusKm: pendingRadiusKm });
    setSpatialTool(null);
  };

  const confirmPolygonAnalysis = () => {
    if (drawingPoints.length < 3) return;
    setSpatialFilter({ type: "polygon", points: drawingPoints });
    setSpatialTool(null);
  };

  // Xaritada bosilganda: radius vositasida markazni belgilaydi, poligon
  // vositasida esa navbatdagi burchak nuqtasini qo'shadi
  const handleSpatialMapPick = (latlng) => {
    if (spatialTool === "radius") {
      setPendingCenter(latlng);
    } else if (spatialTool === "polygon") {
      setDrawingPoints((prev) => [...prev, latlng]);
    }
  };

  const handleAddKorxona = (newKorxona) => {
    setKorxonalar((prev) => [...prev, newKorxona]);
  };

  // INN yoki nomi bo'yicha korxonani qidirib, xaritada shu joyga fokus qilish
  // Qidiruvda kiritilgan xom koordinataga qo'yiladigan vaqtinchalik nishon
  const [coordinateMarker, setCoordinateMarker] = useState(null); // [lat,lng] | null

  const handleSearchKorxona = (query) => {
    const q = query.trim();
    if (!q) return;

    // Foydalanuvchi korxona nomi/INN o'rniga to'g'ridan-to'g'ri koordinata
    // kiritgan bo'lishi mumkin ("41.31, 69.28") — shu holatda shunchaki
    // o'sha nuqtaga fokus qilamiz, korxona qidirmaymiz.
    const coord = parseCoordinateInput(q);
    if (coord) {
      clearSpatialFilter();
      setHighlightedKorxonaId(null);
      setCoordinateMarker(coord);
      setCurrentPath(data.regions);
      setCurrentLevel("regions");
      setParentRegion(null);
      setSelectedDistrict(null);
      setSelectedDistrictName(null);
      setMapKey((prev) => prev + 1);

      setTimeout(() => {
        const map = mapRef.current;
        if (!map) return;
        map.flyTo(coord, 14, { animate: true, duration: 1.6 });
      }, 150);

      message.success(`Koordinataga fokus qilindi: ${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}`);
      return;
    }

    const qLower = q.toLowerCase();
    const found = korxonalar.find(
      (k) => k.inn.toLowerCase().includes(qLower) || k.nomi.toLowerCase().includes(qLower)
    );

    if (!found) {
      message.warning("Korxona topilmadi");
      return;
    }

    const bounds = L.polygon(found.hudud).getBounds();
    const center = bounds.getCenter();

    // Qidirilgan korxona joriy ko'rinishda (masalan boshqa viloyat/tuman
    // tanlangan bo'lsa) ko'rinmay qolishi mumkin — respublika darajasiga
    // qaytarib, so'ng aynan shu hudud chegarasiga fokuslanamiz.
    clearSpatialFilter();
    setCoordinateMarker(null);
    setCurrentPath(data.regions);
    setCurrentLevel("regions");
    setParentRegion(null);
    setSelectedDistrict(null);
    setSelectedDistrictName(null);
    setMapKey((prev) => prev + 1);
    setHighlightedKorxonaId(found.id);

    // MapContainer yuqoridagi setMapKey tufayli qayta mount bo'ladi — bir oz
    // kutib turib (mount tugashini kutamiz), keyin silliq "uchib borish"
    // effekti bilan yaqinlashamiz va joyiga yetgach popup'ni o'zi ochamiz.
    setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;
      map.flyTo(center, 16, { animate: true, duration: 1.6 });
      map.once('moveend', () => {
        korxonaMarkerRefs.current[found.id]?.openPopup();
      });
    }, 150);

    message.success(`Topildi: ${found.nomi}`);
  };

  // Real vaqtdagi shamol oqimi qatlami (Windy uslubida)
  const [windEnabled, setWindEnabled] = useState(false);
  const [windData, setWindData] = useState(null);

  // Shamol yoqilganda ma'lumotni bir marta yuklab, keyin har 15 daqiqada yangilaymiz.
  // Ma'lumot fetchUzbekistanWindGrid() ichida keshlanadi, shuning uchun bu yerdan
  // qayta-qayta chaqirilishi (masalan viloyat/tuman almashtirilganda MapContainer
  // qayta mount bo'lgani uchun emas, chunki bu effekt map'ga bog'liq emas) muammo
  // tug'dirmaydi.
  useEffect(() => {
    if (!windEnabled) {
      setWindData(null);
      return;
    }

    let cancelled = false;

    const load = () => {
      fetchUzbekistanWindGrid()
        .then((data) => {
          if (!cancelled) setWindData(data);
        })
        .catch((err) => {
          if (!cancelled) message.error(err.message);
        });
    };

    load();
    const intervalId = setInterval(load, 15 * 60 * 1000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [windEnabled]);

  // O'rmon fondi yerlari qatlami — har bir viloyat uchun alohida, katta
  // hajmdagi GeoJSON fayl (public/data/ormon/<viloyat>.json). Respublika
  // ko'rinishida yoqilsa, barcha viloyatlar bo'yicha bir vaqtda yuklanadi;
  // viloyat/tuman darajasida esa faqat o'sha viloyatniki.
  const [ormonEnabled, setOrmonEnabled] = useState(false);
  const [ormonCache, setOrmonCache] = useState({});
  const [ormonLoading, setOrmonLoading] = useState(false);
  const activeOrmonRegions = useMemo(() => {
    if (!ormonEnabled) return [];
    if (currentLevel === "regions") return ORMON_REGION_KEYS;
    return parentRegion ? [parentRegion] : [];
  }, [ormonEnabled, currentLevel, parentRegion]);

  useEffect(() => {
    const toFetch = activeOrmonRegions.filter((region) => !ormonCache[region]);
    if (toFetch.length === 0) return;

    let cancelled = false;
    setOrmonLoading(true);

    Promise.all(
      toFetch.map((region) =>
        fetch(`/data/ormon/${region}.json`)
          .then((res) => (res.ok ? res.json() : Promise.reject(new Error("topilmadi"))))
          .then((geojson) => ({ region, geojson }))
          .catch(() => ({ region, geojson: "missing" }))
      )
    ).then((results) => {
      if (cancelled) return;
      setOrmonCache((prev) => {
        const next = { ...prev };
        for (const { region, geojson } of results) next[region] = geojson;
        return next;
      });
    }).finally(() => {
      if (!cancelled) setOrmonLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [activeOrmonRegions, ormonCache]);

  const ormonStyle = () => ({
    weight: 1,
    color: "#15803d",
    fillColor: "#22c55e",
    fillOpacity: 0.45,
  });

  const onEachOrmonFeature = (feature, layer) => {
    const p = feature.properties || {};
    layer.bindPopup(`
      <div style="font-size:12px;min-width:220px">
        <div style="background:#15803d;color:white;padding:6px 10px;border-radius:6px;margin-bottom:8px;font-weight:700">
          O'rmon fondi uchastkasi
        </div>
        <div style="display:grid;gap:4px">
          ${p.subyekt ? `<div><b>Subyekt:</b> ${p.subyekt}</div>` : ""}
          ${p.tuman ? `<div><b>Tuman:</b> ${p.tuman}</div>` : ""}
          ${p.yerFondiTuri ? `<div><b>Yer turi:</b> ${p.yerFondiTuri}</div>` : ""}
          ${p.royxatHolati ? `<div><b>Holati:</b> ${p.royxatHolati}</div>` : ""}
          ${p.cadastralNumber ? `<div style="color:#64748b"><b>Kadastr:</b> ${p.cadastralNumber}</div>` : ""}
        </div>
      </div>
    `);
    layer.on({
      mouseover: (e) => e.target.setStyle({ fillOpacity: 0.7 }),
      mouseout: (e) => e.target.setStyle({ fillOpacity: 0.45 }),
    });
  };

  // Qo'shimcha respublika miqyosidagi qatlamlar (suv omborlari, ichimlik
  // suvi konlari, SMQZ, o'rmon-ov xo'jaliklari) — har biri o'z holicha
  // yoqilib/o'chiriladi va faqat yoqilganda bir marta yuklab, keshlanadi.
  const [extraLayersEnabled, setExtraLayersEnabled] = useState({});
  const [extraLayersCache, setExtraLayersCache] = useState({});
  const [extraLayersLoading, setExtraLayersLoading] = useState({});

  const toggleExtraLayer = (key) => {
    setExtraLayersEnabled((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const toFetch = EXTRA_LAYERS.filter(
      (l) => extraLayersEnabled[l.key] && !extraLayersCache[l.key]
    );
    if (toFetch.length === 0) return;

    let cancelled = false;
    setExtraLayersLoading((prev) => {
      const next = { ...prev };
      for (const l of toFetch) next[l.key] = true;
      return next;
    });

    Promise.all(
      toFetch.map((l) =>
        fetch(`/data/${l.key}.json`)
          .then((res) => (res.ok ? res.json() : Promise.reject(new Error("topilmadi"))))
          .then((geojson) => ({ key: l.key, geojson }))
          .catch(() => ({ key: l.key, geojson: "missing" }))
      )
    ).then((results) => {
      if (cancelled) return;
      setExtraLayersCache((prev) => {
        const next = { ...prev };
        for (const { key, geojson } of results) next[key] = geojson;
        return next;
      });
    }).finally(() => {
      if (!cancelled) {
        setExtraLayersLoading((prev) => {
          const next = { ...prev };
          for (const l of toFetch) next[l.key] = false;
          return next;
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [extraLayersEnabled, extraLayersCache]);

  const extraLayerStyle = (layerConfig) => () => ({
    weight: 2,
    color: layerConfig.color,
    fillColor: layerConfig.fillColor,
    fillOpacity: 0.35,
  });

  const extraLayerPointToLayer = (layerConfig) => (feature, latlng) =>
    L.circleMarker(latlng, {
      radius: 7,
      weight: 2,
      color: layerConfig.color,
      fillColor: layerConfig.fillColor,
      fillOpacity: 0.9,
    });

  const onEachExtraFeature = (layerConfig) => (feature, layer) => {
    const p = feature.properties || {};
    const rows = Object.entries(p)
      .filter(([key]) => key !== "nomi")
      .map(([key, value]) => `<div><b>${EXTRA_FIELD_LABELS[key] || key}:</b> ${value}</div>`)
      .join("");
    layer.bindPopup(`
      <div style="font-size:12px;min-width:220px">
        <div style="background:${layerConfig.color};color:white;padding:6px 10px;border-radius:6px;margin-bottom:8px;font-weight:700">
          ${p.nomi || layerConfig.label}
        </div>
        <div style="display:grid;gap:4px">${rows}</div>
      </div>
    `);
    if (layer.setStyle) {
      layer.on({
        mouseover: (e) => e.target.setStyle({ fillOpacity: 0.65 }),
        mouseout: (e) => e.target.setStyle({ fillOpacity: 0.35 }),
      });
    }
  };

  // "Qatlamlar" tugmasida nechta qatlam yoqilganini ko'rsatish uchun
  const activeLayerCount =
    (windEnabled ? 1 : 0) +
    (ormonEnabled ? 1 : 0) +
    Object.values(extraLayersEnabled).filter(Boolean).length;

  // Viloyatlar ro'yxati (Select uchun)
  const regionsList = Object.keys(data).filter(key => key !== "regions");

  // Tumanlar ro'yxati (tanlangan viloyat bo'yicha)
  const getDistrictsList = () => {
    if (parentRegion && data[parentRegion]?.subData) {
      return data[parentRegion].subData.map(d => d.name);
    }
    return [];
  };

  // Viloyat nomini chiroyli qilish
  const formatName = (name) => {
    if (!name) return "";
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Hudud (viloyat/shahar/respublika) uchun to'liq ko'rinadigan nom
  const regionDisplayName = (key) => REGION_DISPLAY_NAMES[key] || `${formatName(key)} viloyati`;

  // Select orqali viloyat tanlash
  const handleRegionSelect = (regionName) => {
    if (!regionName) {
      // Bo'sh tanlov - respublikaga qaytish
      backToRegions();
      return;
    }
    if (data[regionName]) {
      clearSpatialFilter();
      setCurrentPath(data[regionName]);
      setCurrentLevel("region");
      setParentRegion(regionName);
      setSelectedDistrict(null);
      setSelectedDistrictName(null);
      setMapKey((prev) => prev + 1);

      // Viloyatga zoom qilish - regions GeoJSON dan topamiz
      const regionFeature = regions.features.find(f =>
        getFirstWordLowercase(f.properties.name) === regionName
      );
      if (regionFeature && mapRef.current) {
        const bounds = L.geoJSON(regionFeature).getBounds();
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.fitBounds(bounds, { padding: [20, 20] });
          }
        }, 100);
      }
    }
  };

  // Select orqali tuman tanlash
  const handleDistrictSelect = (districtName) => {
    if (!districtName) {
      // Bo'sh tanlov - viloyatga qaytish
      backToRegion();
      return;
    }
    if (parentRegion && data[parentRegion]) {
      // GeoJSON dan shu nomli feature ni topamiz
      const regionGeoJSON = data[parentRegion].path;
      const feature = regionGeoJSON.features.find(f =>
        getFirstWordLowercase(f.properties.name) === districtName
      );
      if (feature) {
        clearSpatialFilter();
        const singleDistrictGeoJSON = {
          type: "FeatureCollection",
          features: [feature]
        };
        setSelectedDistrict(singleDistrictGeoJSON);
        setSelectedDistrictName(districtName);
        setCurrentLevel("district");
        setMapKey((prev) => prev + 1);

        // Tumanga zoom qilish
        if (mapRef.current) {
          const bounds = L.geoJSON(feature).getBounds();
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
          }, 100);
        }
      }
    }
  };

  const getTheValue = (name) => {
    if (currentLevel === "regions") {
      // Viloyatdagi korxonalar soni
      return korxonalar.filter(item => item.viloyat === name).length;
    } else if (currentLevel === "region" || currentLevel === "district") {
      // Tumandagi korxonalar soni
      const regionName = currentLevel === "region" ? currentPath.name : parentRegion;
      return korxonalar.filter(item =>
        item.viloyat === regionName && item.tuman === name
      ).length;
    }
    return 0;
  };

  const style = () => {
    return {
      weight: 2,
      opacity: 1,
      color: "#334155",
      fillOpacity: 0,
    };
  };

  const onEachFeature = (feature, layer) => {
    let name = getFirstWordLowercase(feature.properties.name);
    const value = getTheValue(name);

    // Bind tooltip
    if (value !== undefined) {
      layer.bindTooltip(String(value), {
        permanent: true,
        direction: "center",
        className: "custom-tooltip",
      });
    }

    // Event handlers
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          weight: 3,
          color: "#059669",
          fillColor: "#059669",
          fillOpacity: 0.12,
        });
        // Tuman darajasida bringToFront() shart emas (bitta chegara bor,
        // ajratib ko'rsatiladigan qo'shni feature yo'q) — va bu chegara
        // qatlamini korxona belgilari ustiga chiqarib qo'yib, ularning
        // hover/bosishini butunlay to'sib qo'yardi (sichqoncha shu katta
        // chegara ichida bir marta harakatlansa kifoya edi).
        if (currentLevel !== "district") {
          layer.bringToFront();
        }
        setHoveredRegion({
          name: feature.properties.name,
          value: value,
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(style());
        setHoveredRegion(null);
      },
      click: (e) => {
        // Radius/poligon tanlash vositasi yoqilgan bo'lsa, bosish shu
        // vositaga tegishli (markaz belgilash/nuqta qo'shish) — viloyat/
        // tuman ichiga kirish emas.
        if (spatialTool) return;
        if (currentLevel === "regions") {
          // 1-daraja: Viloyatni bosish -> tumanlar ko'rinadi
          const regionName = getFirstWordLowercase(feature.properties.name);
          if (data[regionName]) {
            clearSpatialFilter();
            setCurrentPath(data[regionName]);
            setCurrentLevel("region");
            setParentRegion(regionName);
            setMapKey((prev) => prev + 1);
            // MapContainer `key` o'zgargani uchun qayta mount bo'ladi —
            // mapRef.current shu zahoti hali ESKI (endi yo'q qilinayotgan)
            // xarita instansiyasiga ishora qiladi, shuning uchun fitBounds'ni
            // darhol chaqirish hech narsaga ta'sir qilmasdi (viloyatga zoom
            // qilinmagan bo'lib qolardi). Yangi xarita mount bo'lishini biroz
            // kutib turamiz.
            const bounds = e.target.getBounds();
            setTimeout(() => {
              if (mapRef.current) {
                mapRef.current.fitBounds(bounds);
              }
            }, 100);
          }
        } else if (currentLevel === "region") {
          // 2-daraja: Tumanni bosish -> faqat o'sha tuman ko'rinadi
          const districtName = getFirstWordLowercase(feature.properties.name);
          // Faqat shu bitta feature bilan yangi GeoJSON yaratamiz
          const singleDistrictGeoJSON = {
            type: "FeatureCollection",
            features: [feature]
          };
          clearSpatialFilter();
          setSelectedDistrict(singleDistrictGeoJSON);
          setSelectedDistrictName(districtName);
          setCurrentLevel("district");
          setMapKey((prev) => prev + 1);
          const bounds = e.target.getBounds();
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.fitBounds(bounds, { padding: [50, 50] });
            }
          }, 100);
        } else if (currentLevel === "district") {
          // 3-daraja: Tumanni yana bosish -> viloyatga qaytish
          backToRegion();
        }
      },
    });
  };

  const backToRegions = () => {
    clearSpatialFilter();
    setCurrentPath(data.regions);
    setCurrentLevel("regions");
    setParentRegion(null);
    setSelectedDistrict(null);
    setSelectedDistrictName(null);
    setMapKey((prev) => prev + 1);
    if (mapRef.current) {
      mapRef.current.setView([41.3812, 64.5736], 6);
    }
  };

  const backToRegion = () => {
    // Tumandan viloyatga qaytish
    if (parentRegion && data[parentRegion]) {
      setCurrentPath(data[parentRegion]);
      setCurrentLevel("region");
      setSelectedDistrict(null);
      setSelectedDistrictName(null);
      setMapKey((prev) => prev + 1);
      // Viloyat chegaralariga zoom qilish
      if (mapRef.current) {
        mapRef.current.setView([41.3812, 64.5736], 7);
      }
    }
  };

  // Joriy ko'rinishga (respublika/viloyat/tuman) mos korxonalar ro'yxati
  const visibleKorxonalar = useMemo(() => {
    // Radius/poligon tahlili yakunlangan bo'lsa — u administrativ
    // viloyat/tuman filtridan ustun turadi (foydalanuvchi aynan shu
    // hudud ichidagi korxonalarni ko'rmoqchi)
    if (spatialFilter?.type === "radius") {
      return korxonalar.filter((item) => {
        const center = L.polygon(item.hudud).getBounds().getCenter();
        return haversineKm([center.lat, center.lng], spatialFilter.center) <= spatialFilter.radiusKm;
      });
    }
    if (spatialFilter?.type === "polygon") {
      return korxonalar.filter((item) => {
        const center = L.polygon(item.hudud).getBounds().getCenter();
        return pointInPolygonLatLng([center.lat, center.lng], spatialFilter.points);
      });
    }
    if (currentLevel === "region" && parentRegion) {
      return korxonalar.filter(item => item.viloyat === parentRegion);
    }
    if (currentLevel === "district" && parentRegion && selectedDistrictName) {
      return korxonalar.filter(item =>
        item.viloyat === parentRegion && item.tuman === selectedDistrictName
      );
    }
    return korxonalar;
  }, [korxonalar, currentLevel, parentRegion, selectedDistrictName, spatialFilter]);

  // Statistika va tashlanma yig'indilarini hisoblash
  const statistics = useMemo(() => {
    let atmosferaKorxonalar = 0;
    let suvKorxonalar = 0;
    let chiqindiKorxonalar = 0;
    const categoryTotals = {};
    // Kategoriya ichida har bir alohida modda/manba bo'yicha yig'indi
    // ("Ingredientlar" tabida ko'rsatiladi) — categoryTotals kabi lekin
    // moddaga bo'lib chiqilgan holda.
    const ingredientTotals = {};

    visibleKorxonalar.forEach((korxona) => {
      let hasChiqindi = false;

      TASHLANMA_KATEGORIYALARI.forEach((cat) => {
        const entries = korxona.tashlanmalar?.[cat.key] || [];
        if (entries.length === 0) return;

        if (cat.key === 'atmosfera') atmosferaKorxonalar += 1;
        else if (cat.key === 'suv_foydalanish') suvKorxonalar += 1;
        else hasChiqindi = true;

        entries.forEach((entry) => {
          const unit = cat.units[0];
          const amount = Number(entry[unit.field]) || 0;
          if (!categoryTotals[cat.key]) {
            categoryTotals[cat.key] = { label: cat.label, unitLabel: unit.label, value: 0 };
          }
          categoryTotals[cat.key].value += amount;

          const moddaName = entry[cat.optionsField] || "Noma'lum";
          if (!ingredientTotals[cat.key]) {
            ingredientTotals[cat.key] = { label: cat.label, unitLabel: unit.label, items: {} };
          }
          ingredientTotals[cat.key].items[moddaName] =
            (ingredientTotals[cat.key].items[moddaName] || 0) + amount;
        });
      });

      if (hasChiqindi) chiqindiKorxonalar += 1;
    });

    return {
      counts: {
        total: visibleKorxonalar.length,
        atmosfera: atmosferaKorxonalar,
        suv: suvKorxonalar,
        chiqindi: chiqindiKorxonalar,
      },
      categoryTotals,
      ingredientTotals,
    };
  }, [visibleKorxonalar]);

  // Bitta tanlangan korxona (popup'dagi belgilash orqali) ustidan taxminiy
  // shamol yo'nalishi konusi — faqat shamol qatlami yoqilgan va korxona
  // belgilangan bo'lsa hisoblanadi. ILMIY DISPERSIYA MODELI EMAS: joriy
  // shamol yo'nalishi bo'ylab, o'sha korxonaning atmosfera tashlanmasi
  // miqdoriga qarab uzunligi taxminan o'lchamlangan vizual ko'rsatkich, xolos.
  const dispersionConeInfo = useMemo(() => {
    if (!dispersionKorxonaId || !windEnabled || !windData) return null;
    const korxona = korxonalar.find((k) => k.id === dispersionKorxonaId);
    if (!korxona) return null;
    const center = L.polygon(korxona.hudud).getBounds().getCenter();
    const centerLatLng = [center.lat, center.lng];
    const wind = getWindVectorAt(centerLatLng, windData);
    if (!wind || wind.speed < 0.3) return null;
    const totalAtmosfera = (korxona.tashlanmalar?.atmosfera || []).reduce(
      (sum, entry) => sum + (Number(entry.tonna_yiliga) || 0),
      0
    );
    if (totalAtmosfera <= 0) return null;
    const lengthKm = Math.min(25, Math.max(3, Math.sqrt(totalAtmosfera) * 1.2));
    return {
      korxonaId: korxona.id,
      points: buildWindConePolygon(centerLatLng, wind.bearingDeg, lengthKm),
      bearingDeg: wind.bearingDeg,
      speedMs: wind.speed,
      lengthKm,
    };
  }, [dispersionKorxonaId, korxonalar, windEnabled, windData]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: '#f1f5f9',
      boxSizing: 'border-box',
      position: 'relative'
    }}>
      {/* ASOSIY QISM - 3 ta ustun */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        flex: 1,
        overflow: 'hidden',
        padding: '0.75rem'
      }}>
        {/* CHAP - NATIJALAR */}
        <div style={{
          flex: 3,
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Natijalar sarlavhasi - Breadcrumb singari */}
          <div style={{
            padding: '0.75rem 1rem',
            background: '#059669',
            color: 'white',
            fontWeight: '600',
            fontSize: '1rem'
          }}>
            {spatialFilter ? (
              spatialFilter.type === 'radius'
                ? `Radius tahlili — ${spatialFilter.radiusKm} km`
                : "Chizilgan hudud tahlili"
            ) : currentLevel === "regions" ? (
              "O'zbekiston Respublikasi"
            ) : currentLevel === "region" ? (
              regionDisplayName(parentRegion)
            ) : (
              `${formatName(selectedDistrictName)} tumani`
            )}
          </div>

          {/* Statistika */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#334155' }}>
              Korxonalar statistikasi
            </h4>
            {dispersionConeInfo && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.4rem',
                padding: '0.5rem 0.6rem',
                marginBottom: '0.75rem',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                fontSize: '0.7rem',
                color: '#1e40af',
                lineHeight: 1.4
              }}>
                <Wind size={14} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span>
                  Ko'k zona — <b>{korxonalar.find((k) => k.id === dispersionConeInfo.korxonaId)?.nomi}</b> korxonasining
                  joriy shamol yo'nalishi bo'ylab taxminiy tarqalishi (~{dispersionConeInfo.speedMs.toFixed(1)} m/s,{' '}
                  {dispersionConeInfo.lengthKm.toFixed(1)} km gacha). Bu ilmiy dispersiya modeli emas, faqat vizual yo'nalish.
                </span>
              </div>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div style={{
                padding: '0.75rem',
                background: '#eff6ff',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2563eb' }}>
                  {statistics.counts.total}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Jami korxonalar</div>
              </div>
              <div style={{
                padding: '0.75rem',
                background: '#f0fdf4',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>
                  {statistics.counts.atmosfera}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Atmosferaga tashlanma tashlayotgan korxonalar</div>
              </div>
              <div style={{
                padding: '0.75rem',
                background: '#eff6ff',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0284c7' }}>
                  {statistics.counts.suv}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Suv resurslaridan foydalanadigan korxonalar</div>
              </div>
              <div style={{
                padding: '0.75rem',
                background: '#fef2f2',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                  {statistics.counts.chiqindi}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Chiqindi hosil qiladigan korxonalar (oqova, xavfli, maishiy)</div>
              </div>
            </div>
          </div>

          {/* Chiqindilar / Korxonalar ro'yxati - tab */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '0.25rem', padding: '0.75rem 1rem 0' }}>
              {[
                { key: 'chiqindilar', label: "Tashlanmalar" },
                { key: 'ingredientlar', label: "Ingredientlar" },
                { key: 'korxonalar', label: "Korxonalar ro'yxati" },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setBottomPanelTab(tab.key)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px 6px 0 0',
                    border: 'none',
                    borderBottom: bottomPanelTab === tab.key ? '2px solid #059669' : '2px solid transparent',
                    background: 'transparent',
                    color: bottomPanelTab === tab.key ? '#059669' : '#64748b',
                    fontWeight: bottomPanelTab === tab.key ? '600' : '500',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '0.75rem 1rem 1rem' }}>
              {bottomPanelTab === 'chiqindilar' ? (
                Object.keys(statistics.categoryTotals).length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#94a3b8',
                    fontSize: '0.85rem'
                  }}>
                    Tashlanma ma'lumotlari mavjud emas
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(statistics.categoryTotals).map(([key, { label, unitLabel, value }]) => (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem 0.75rem',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          gap: '0.5rem'
                        }}
                      >
                        <span style={{ color: '#475569' }}>{label}</span>
                        <span style={{
                          flexShrink: 0,
                          fontWeight: '600',
                          color: '#1e293b',
                          background: '#e2e8f0',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {value.toLocaleString()} {unitLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : bottomPanelTab === 'ingredientlar' ? (
                Object.keys(statistics.ingredientTotals).length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#94a3b8',
                    fontSize: '0.85rem'
                  }}>
                    Ingredient ma'lumotlari mavjud emas
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {Object.entries(statistics.ingredientTotals).map(([catKey, { label, unitLabel, items }]) => {
                      const sortedItems = Object.entries(items).sort((a, b) => b[1] - a[1]);
                      return (
                        <div key={catKey}>
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            color: '#059669',
                            marginBottom: '0.4rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em'
                          }}>
                            {label}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            {sortedItems.map(([modda, amount]) => (
                              <div
                                key={modda}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  padding: '0.45rem 0.65rem',
                                  background: '#f8fafc',
                                  borderRadius: '6px',
                                  fontSize: '0.78rem',
                                  gap: '0.5rem'
                                }}
                              >
                                <span style={{
                                  color: '#475569',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {modda}
                                </span>
                                <span style={{
                                  flexShrink: 0,
                                  fontWeight: '600',
                                  color: '#1e293b',
                                  background: '#e2e8f0',
                                  padding: '2px 8px',
                                  borderRadius: '4px'
                                }}>
                                  {amount.toLocaleString(undefined, { maximumFractionDigits: 3 })} {unitLabel}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                visibleKorxonalar.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#94a3b8',
                    fontSize: '0.85rem'
                  }}>
                    Tanlangan hududda korxonalar mavjud emas
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {visibleKorxonalar.map(item => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span style={{
                          flexShrink: 0,
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#ef4444'
                        }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, color: '#1e293b', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.nomi}
                          </p>
                          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.72rem' }}>
                            INN: {item.inn} · {formatName(item.viloyat)}, {formatName(item.tuman)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* O'RTA - XARITA */}
        <div style={{
          flex: 9,
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Breadcrumb */}
          <div style={{
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span
                onClick={backToRegions}
                style={{
                  cursor: 'pointer',
                  color: currentLevel === "regions" ? '#059669' : '#10b981',
                  fontWeight: currentLevel === "regions" ? 'bold' : 'normal',
                  fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                O'zbekiston Respublikasi
              </span>

              {parentRegion && (
                <>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>/</span>
                  <span
                    onClick={currentLevel === "district" ? backToRegion : undefined}
                    style={{
                      cursor: currentLevel === "district" ? 'pointer' : 'default',
                      color: currentLevel === "region" ? '#059669' : '#10b981',
                      fontWeight: currentLevel === "region" ? 'bold' : 'normal',
                      fontSize: '0.9rem',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => currentLevel === "district" && (e.target.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                  >
                    {regionDisplayName(parentRegion)}
                  </span>
                </>
              )}

              {selectedDistrictName && (
                <>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>/</span>
                  <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    {formatName(selectedDistrictName)} tumani
                  </span>
                </>
              )}

              {spatialFilter && (
                <>
                  <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>/</span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    background: '#ecfdf5',
                    color: '#047857',
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    padding: '2px 8px',
                    borderRadius: '999px'
                  }}>
                    {spatialFilter.type === 'radius'
                      ? `Radius tahlili — ${spatialFilter.radiusKm} km`
                      : "Chizilgan hudud tahlili"}
                    <X
                      size={13}
                      style={{ cursor: 'pointer' }}
                      onClick={clearSpatialFilter}
                    />
                  </span>
                </>
              )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* INN/nomi yoki koordinata ("41.31, 69.28") bo'yicha qidirish */}
                <Input.Search
                  placeholder="INN, korxona nomi yoki koordinata"
                  allowClear
                  onSearch={handleSearchKorxona}
                  style={{ width: '230px' }}
                />

                {/* Radius bo'yicha tahlil — markazni belgilab, radius km
                    kiritilsa shu doira ichidagi korxonalar ajratiladi */}
                <Button
                  icon={<Crosshair size={16} />}
                  onClick={() => (spatialTool === 'radius' ? clearSpatialTool() : startRadiusTool())}
                  style={spatialTool === 'radius' || spatialFilter?.type === 'radius' ? {
                    background: '#ecfdf5',
                    borderColor: '#059669',
                    color: '#047857',
                    borderRadius: '6px',
                    fontWeight: '500'
                  } : {
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}
                >
                  Radius tahlili
                </Button>

                {/* Erkin hudud chizish — nuqta-nuqta bosib poligon chizib,
                    shu poligon ichidagi korxonalarni ajratadi */}
                <Button
                  icon={<Pencil size={16} />}
                  onClick={() => (spatialTool === 'polygon' ? clearSpatialTool() : startPolygonTool())}
                  style={spatialTool === 'polygon' || spatialFilter?.type === 'polygon' ? {
                    background: '#ecfdf5',
                    borderColor: '#059669',
                    color: '#047857',
                    borderRadius: '6px',
                    fontWeight: '500'
                  } : {
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}
                >
                  Hudud chizish
                </Button>

                {/* Xarita qatlamlari paneli — shamol, o'rmon fondi va qo'shimcha
                    qatlamlar shu yerdan yoqiladi, tepada alohida-alohida
                    tugmalar to'planib ketmasligi uchun */}
                <Button
                  icon={<Layers size={16} />}
                  onClick={() => setIsLayersDrawerOpen(true)}
                  style={activeLayerCount > 0 ? {
                    background: '#ecfdf5',
                    borderColor: '#059669',
                    color: '#047857',
                    borderRadius: '6px',
                    fontWeight: '500'
                  } : {
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}
                >
                  Qatlamlar{activeLayerCount > 0 ? ` (${activeLayerCount})` : ''}
                </Button>

                {/* Yangi korxona qo'shish tugmasi */}
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsAddModalOpen(true)}
                  style={{
                    background: '#059669',
                    borderColor: '#059669',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}
                >
                  Yangi korxona qo'shish
                </Button>
              </div>
            </div>
          </div>

          {/* Xarita */}
          <div style={{ flex: 1, position: 'relative' }}>
            {/* Info box */}
            {hoveredRegion && (
              <div
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  zIndex: 1000,
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.15)',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <b style={{ color: '#1e293b', fontSize: '0.85rem' }}>{hoveredRegion.name}</b><br />
                <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{hoveredRegion.value} ta</span>
              </div>
            )}

            {/* Radius/poligon tanlash vositasi paneli */}
            {spatialTool && (
              <div
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  left: '0.75rem',
                  zIndex: 1000,
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.97)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.18)',
                  borderRadius: '10px',
                  border: '1px solid #d1fae5',
                  width: '280px'
                }}
              >
                {spatialTool === 'radius' ? (
                  <>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', marginBottom: '0.5rem' }}>
                      Radius bo'yicha tahlil
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.6rem' }}>
                      Xaritada markazni bosing yoki koordinatani qo'lda kiriting
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.5rem' }}>
                      <InputNumber
                        placeholder="Kenglik"
                        value={pendingCenter?.[0] ?? null}
                        onChange={(v) => setPendingCenter((prev) => [v ?? 0, prev?.[1] ?? 0])}
                        step={0.0001}
                        style={{ flex: 1 }}
                        size="small"
                      />
                      <InputNumber
                        placeholder="Uzunlik"
                        value={pendingCenter?.[1] ?? null}
                        onChange={(v) => setPendingCenter((prev) => [prev?.[0] ?? 0, v ?? 0])}
                        step={0.0001}
                        style={{ flex: 1 }}
                        size="small"
                      />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.7rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#475569' }}>Radius:</span>
                      <InputNumber
                        value={pendingRadiusKm}
                        onChange={(v) => setPendingRadiusKm(v ?? 1)}
                        min={1}
                        max={200}
                        style={{ flex: 1 }}
                        size="small"
                      />
                      <span style={{ fontSize: '0.75rem', color: '#475569' }}>km</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Button size="small" onClick={clearSpatialTool} style={{ flex: 1 }}>
                        Bekor qilish
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        disabled={!pendingCenter}
                        onClick={confirmRadiusAnalysis}
                        style={{ flex: 1, background: '#059669', borderColor: '#059669' }}
                      >
                        Tahlil qilish
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', marginBottom: '0.5rem' }}>
                      Hudud chizish
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '0.6rem' }}>
                      Xaritada nuqtalarni ketma-ket bosib poligon chizing (kamida 3 nuqta), so'ng "Tugatish"ni bosing
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '0.7rem' }}>
                      Bosilgan nuqtalar: <b>{drawingPoints.length}</b>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Button size="small" onClick={clearSpatialTool} style={{ flex: 1 }}>
                        Bekor qilish
                      </Button>
                      <Button
                        size="small"
                        disabled={drawingPoints.length === 0}
                        onClick={() => setDrawingPoints((prev) => prev.slice(0, -1))}
                        style={{ flex: 1 }}
                      >
                        Ortga
                      </Button>
                      <Button
                        size="small"
                        type="primary"
                        disabled={drawingPoints.length < 3}
                        onClick={confirmPolygonAnalysis}
                        style={{ flex: 1, background: '#059669', borderColor: '#059669' }}
                      >
                        Tugatish
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            <MapContainer
              key={mapKey}
              center={[41.3812, 64.5736]}
              zoom={6}
              style={{ width: '100%', height: '100%' }}
              ref={mapRef}
            >
              <MapAutoResize />
              <SpatialToolClickHandler tool={spatialTool} onPick={handleSpatialMapPick} />
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
              <WindHeatmapLayer enabled={windEnabled} data={windData} />
              <WindVelocityLayer enabled={windEnabled} data={windData} />
              <GeoJSON
                data={currentLevel === "district" ? selectedDistrict : currentPath.path}
                style={style}
                onEachFeature={onEachFeature}
              />

              {activeOrmonRegions.map((region) => {
                const geojson = ormonCache[region];
                if (!geojson || geojson === "missing") return null;
                return (
                  <GeoJSON
                    key={region}
                    data={geojson}
                    style={ormonStyle}
                    onEachFeature={onEachOrmonFeature}
                  />
                );
              })}

              {/* Qo'shimcha qatlamlar — suv omborlari, ichimlik suvi konlari,
                  SMQZ, o'rmon-ov xo'jaliklari */}
              {EXTRA_LAYERS.map((layerConfig) => {
                if (!extraLayersEnabled[layerConfig.key]) return null;
                const geojson = extraLayersCache[layerConfig.key];
                if (!geojson || geojson === "missing") return null;
                return (
                  <GeoJSON
                    key={layerConfig.key}
                    data={geojson}
                    style={extraLayerStyle(layerConfig)}
                    pointToLayer={extraLayerPointToLayer(layerConfig)}
                    onEachFeature={onEachExtraFeature(layerConfig)}
                  />
                );
              })}

              {/* Qidiruvda kiritilgan xom koordinataga vaqtinchalik nishon */}
              {coordinateMarker && (
                <CircleMarker
                  center={coordinateMarker}
                  radius={9}
                  pathOptions={{ color: '#7c3aed', weight: 3, fillColor: '#a78bfa', fillOpacity: 0.9 }}
                >
                  <Popup>
                    <div style={{ fontSize: '12px' }}>
                      <b>Belgilangan koordinata</b><br />
                      {coordinateMarker[0].toFixed(6)}, {coordinateMarker[1].toFixed(6)}
                    </div>
                  </Popup>
                </CircleMarker>
              )}

              {/* Radius vositasi: markaz hali tanlanmagan/o'zgartirilayotganda oldindan ko'rish */}
              {spatialTool === 'radius' && pendingCenter && (
                <>
                  <Circle
                    center={pendingCenter}
                    radius={pendingRadiusKm * 1000}
                    pathOptions={{ color: '#059669', weight: 2, dashArray: '6 6', fillColor: '#059669', fillOpacity: 0.08 }}
                  />
                  <CircleMarker
                    center={pendingCenter}
                    radius={6}
                    pathOptions={{ color: '#059669', weight: 2, fillColor: '#ffffff', fillOpacity: 1 }}
                  />
                </>
              )}

              {/* Poligon vositasi: hozirgacha bosilgan nuqtalar oldindan ko'rinishi */}
              {spatialTool === 'polygon' && drawingPoints.length > 0 && (
                <>
                  <Polyline
                    positions={drawingPoints}
                    pathOptions={{ color: '#059669', weight: 2, dashArray: '6 6' }}
                  />
                  {drawingPoints.map((pt, idx) => (
                    <CircleMarker
                      key={idx}
                      center={pt}
                      radius={5}
                      pathOptions={{ color: '#059669', weight: 2, fillColor: '#ffffff', fillOpacity: 1 }}
                    />
                  ))}
                </>
              )}

              {/* Yakunlangan radius/poligon tahlili chegarasi */}
              {spatialFilter?.type === 'radius' && (
                <Circle
                  center={spatialFilter.center}
                  radius={spatialFilter.radiusKm * 1000}
                  pathOptions={{ color: '#059669', weight: 2, fillColor: '#059669', fillOpacity: 0.06 }}
                />
              )}
              {spatialFilter?.type === 'polygon' && (
                <Polygon
                  positions={spatialFilter.points}
                  pathOptions={{ color: '#059669', weight: 2, fillColor: '#059669', fillOpacity: 0.06 }}
                />
              )}

              {/* Belgilangan korxonaning taxminiy shamol yo'nalishi konusi —
                  ILMIY MODEL EMAS, faqat vizual yo'nalish ko'rsatkichi
                  (statistika panelida va korxona popup'ida izohi bor) */}
              {dispersionConeInfo && (
                <Polygon
                  positions={dispersionConeInfo.points}
                  pathOptions={{
                    color: '#0284c7',
                    weight: 1,
                    fillColor: '#38bdf8',
                    fillOpacity: 0.22,
                    dashArray: '4 4',
                  }}
                />
              )}

              {/* Korxonalar — hudud chegarasi (poligon) + markaziy nuqta.
                  Respublika/viloyat darajasida juda ko'p (yuzlab) korxona bir
                  vaqtda ko'rinadi va ular kichik/ustma-ust bo'lib qolishi
                  mumkin — shu darajalarda faqat KO'RSATILADI, bosish bilan
                  tanlanmaydi (aniq tegib bo'lmasligi mumkin). Tuman
                  darajasida esa yetarlicha kattalashtirilgan bo'lgani uchun:
                  ustiga olib borilganda nomi (tooltip) chiqadi, bosilsa
                  to'liq pasport (popup) ochiladi. */}
              {visibleKorxonalar.map((item) => {
                const center = L.polygon(item.hudud).getBounds().getCenter();
                const centerLatLng = [center.lat, center.lng];
                const isHighlighted = item.id === highlightedKorxonaId;
                const isDistrictLevel = currentLevel === "district";
                const openThisPopup = () => korxonaMarkerRefs.current[item.id]?.openPopup();
                return (
                  <Fragment key={item.id}>
                    {isDistrictLevel && (
                      // Ko'zga ko'rinmas, olti burchakni to'liq qamrab
                      // oladigan doiraviy bosish/hover maydoni — poligonning
                      // o'z to'rtburchak chegarasi burchaklarini qoplamaydi
                      // (hexagon geometriyasi), shuning uchun "hudud ichida
                      // lekin tanlanmadi" holati bo'lmasligi uchun undan
                      // sal kattaroq (1.4x) qilib olinadi. Poligondan KEYIN
                      // (uning USTIDA) chizilib, hover/click'ni birinchi
                      // shu ushlaydi.
                      <Circle
                        center={centerLatLng}
                        radius={polygonMaxRadiusMeters(centerLatLng, item.hudud) * 1.4}
                        pathOptions={{ stroke: false, fillOpacity: 0 }}
                        eventHandlers={{ click: openThisPopup }}
                      >
                        <Tooltip direction="top" sticky>{item.nomi}</Tooltip>
                      </Circle>
                    )}
                    <Polygon
                      positions={item.hudud}
                      interactive={false}
                      pathOptions={{ color: '#ef4444', weight: 2, dashArray: '6 6', fillColor: '#ef4444', fillOpacity: 0.15 }}
                    />
                    <CircleMarker
                      ref={(ref) => {
                        if (ref) korxonaMarkerRefs.current[item.id] = ref;
                        else delete korxonaMarkerRefs.current[item.id];
                      }}
                      center={center}
                      radius={isHighlighted ? 14 : currentLevel === "district" ? 8 : currentLevel === "region" ? 6 : 4}
                      interactive={isDistrictLevel}
                      pathOptions={
                        isHighlighted
                          ? { color: '#f59e0b', weight: 3, fillColor: '#fbbf24', fillOpacity: 1, className: 'korxona-marker-highlight' }
                          : { color: '#ef4444', weight: 2, fillColor: '#ffffff', fillOpacity: 1 }
                      }
                      eventHandlers={{
                        popupclose: () => {
                          setHighlightedKorxonaId((prev) => (prev === item.id ? null : prev));
                        },
                      }}
                    >
                      {isDistrictLevel && <Tooltip direction="top" sticky>{item.nomi}</Tooltip>}
                      <Popup maxWidth={340} minWidth={280}>
                        <div style={{ fontSize: '12px' }}>
                          <div style={{
                            background: '#059669',
                            color: 'white',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            marginBottom: '8px'
                          }}>
                            <div style={{ fontSize: '9px', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Korxona pasporti
                            </div>
                            <div style={{ fontSize: '13px', fontWeight: 700, lineHeight: 1.3 }}>
                              {item.nomi}
                            </div>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '2px 10px',
                            fontSize: '11px',
                            color: '#475569',
                            marginBottom: '8px'
                          }}>
                            <div><strong>INN:</strong> {item.inn}</div>
                            <div><strong>Hudud:</strong> {formatName(item.viloyat)}, {formatName(item.tuman)}</div>
                          </div>

                          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '6px 0' }} />

                          {TASHLANMA_KATEGORIYALARI.map((cat) => {
                            const entries = item.tashlanmalar?.[cat.key] || [];
                            if (entries.length === 0) return null;
                            return (
                              <div key={cat.key} style={{ marginBottom: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: '#059669', marginBottom: '3px' }}>
                                  {cat.label}
                                </div>
                                {entries.map((entry, idx) => (
                                  <div
                                    key={idx}
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      gap: '8px',
                                      fontSize: '11px',
                                      color: '#334155',
                                      padding: '2px 0',
                                      borderBottom: idx < entries.length - 1 ? '1px dashed #f1f5f9' : 'none'
                                    }}
                                  >
                                    <span>{entry[cat.optionsField]}</span>
                                    <span style={{ fontWeight: 600, whiteSpace: 'nowrap', color: '#1e293b' }}>
                                      {cat.units.map(u => `${entry[u.field] ?? 0} ${u.label}`).join(' / ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            );
                          })}

                          {/* Taxminiy shamol tarqalishi — belgilansa, shu
                              korxonaning atmosfera tashlanmasiga qarab
                              o'lchamlangan yo'nalish konusi xaritada chiziladi */}
                          <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed #e2e8f0' }}>
                            <label style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '11px',
                              color: '#334155',
                              cursor: 'pointer'
                            }}>
                              <input
                                type="checkbox"
                                checked={dispersionKorxonaId === item.id}
                                onChange={(e) => setDispersionKorxonaId(e.target.checked ? item.id : null)}
                              />
                              <Wind size={13} style={{ flexShrink: 0 }} />
                              Taxminiy shamol tarqalishini ko'rsatish
                            </label>
                            {dispersionKorxonaId === item.id && (
                              !windEnabled ? (
                                <div style={{ marginTop: '4px', fontSize: '10.5px', color: '#dc2626' }}>
                                  Buning uchun avval "Qatlamlar" &gt; "Shamol oqimi"ni yoqing
                                </div>
                              ) : !dispersionConeInfo ? (
                                <div style={{ marginTop: '4px', fontSize: '10.5px', color: '#94a3b8' }}>
                                  Hisoblanmoqda yoki shamol/tashlanma ma'lumoti yetarli emas...
                                </div>
                              ) : (
                                <div style={{ marginTop: '4px', fontSize: '10.5px', color: '#0284c7' }}>
                                  ~{dispersionConeInfo.lengthKm.toFixed(1)} km gacha ({dispersionConeInfo.speedMs.toFixed(1)} m/s shamol bilan)
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  </Fragment>
                );
              })}
            </MapContainer>
          </div>
        </div>

      </div>

      {/* PASTKI GORIZONTAL FILTERLAR PANELI */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1rem',
        flexWrap: 'wrap',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        margin: '0 0.75rem 0.75rem',
        padding: '0.75rem 1rem'
      }}>
        <div style={{ minWidth: '200px', flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>
            Viloyat
          </label>
          <select
            value={parentRegion || ""}
            onChange={(e) => handleRegionSelect(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: 'white',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="">Barcha viloyatlar</option>
            {regionsList.map(region => (
              <option key={region} value={region}>
                {regionDisplayName(region)}
              </option>
            ))}
          </select>
        </div>

        <div style={{ minWidth: '200px', flex: '1 1 200px' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.4rem' }}>
            Tuman/Shahar
          </label>
          <select
            value={selectedDistrictName || ""}
            onChange={(e) => handleDistrictSelect(e.target.value)}
            disabled={!parentRegion}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: parentRegion ? 'white' : '#f1f5f9',
              fontSize: '0.9rem',
              cursor: parentRegion ? 'pointer' : 'not-allowed',
              outline: 'none',
              color: parentRegion ? '#1e293b' : '#94a3b8'
            }}
          >
            <option value="">{parentRegion ? "Barcha tumanlar" : "Avval viloyat tanlang"}</option>
            {getDistrictsList().map(district => (
              <option key={district} value={district}>
                {formatName(district)} tumani
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={backToRegions}
          style={{
            padding: '0.6rem 1.25rem',
            background: '#f1f5f9',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
          onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
        >
          Filterlarni tozalash
        </button>
      </div>

      {/* Yangi korxona qo'shish modali */}
      <AddKorxonaModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddKorxona}
        regionsGeoJson={regions}
        regionsData={data}
        regionsList={regionsList}
      />

      {/* Xarita qatlamlari paneli */}
      <Drawer
        title="Xarita qatlamlari"
        placement="right"
        open={isLayersDrawerOpen}
        onClose={() => setIsLayersDrawerOpen(false)}
        size={340}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <LayerToggleRow
            color="#0284c7"
            label="Shamol oqimi"
            description="Real vaqtdagi shamol tezligi va yo'nalishi"
            checked={windEnabled}
            onChange={() => setWindEnabled((prev) => !prev)}
          />
          <LayerToggleRow
            color="#15803d"
            label="O'rmon fondi yerlari"
            description="Kadastr uchastkalari bo'yicha o'rmon fondi"
            checked={ormonEnabled}
            loading={ormonEnabled && ormonLoading}
            onChange={() => setOrmonEnabled((prev) => !prev)}
          />
          {EXTRA_LAYERS.map((layerConfig) => (
            <LayerToggleRow
              key={layerConfig.key}
              color={layerConfig.color}
              label={layerConfig.label}
              description={layerConfig.description}
              checked={!!extraLayersEnabled[layerConfig.key]}
              loading={!!extraLayersEnabled[layerConfig.key] && !!extraLayersLoading[layerConfig.key]}
              onChange={() => toggleExtraLayer(layerConfig.key)}
            />
          ))}
        </div>
      </Drawer>

      {/* Custom tooltip va marker styles */}
      <style>{`
        .custom-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          font-weight: bold;
          font-size: 12px;
          color: #333;
        }
        .custom-tooltip::before {
          display: none !important;
        }
        .custom-marker-icon {
          background: transparent !important;
          border: none !important;
        }
        .custom-marker-icon .anticon {
          display: block;
        }
        /* Leaflet rendering muammolarini oldini olish */
        .leaflet-container {
          background: #f8fafc !important;
        }
        .leaflet-tile-pane {
          opacity: 1 !important;
        }
        .leaflet-fade-anim .leaflet-tile {
          will-change: opacity;
        }
        .leaflet-zoom-anim .leaflet-zoom-animated {
          will-change: transform;
        }
        .leaflet-tile {
          visibility: visible !important;
        }
        .info.legend {
          z-index: 1000;
        }
        /* Qidiruv orqali topilgan korxona belgisi — e'tiborni tortish uchun
           yumshoq "nafas olish" effekti */
        .korxona-marker-highlight {
          animation: korxona-pulse 1.1s ease-in-out infinite;
          filter: drop-shadow(0 0 6px rgba(245, 158, 11, 0.9));
        }
        @keyframes korxona-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

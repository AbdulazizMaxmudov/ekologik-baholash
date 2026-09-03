import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { EnvironmentOutlined, PlusOutlined, AimOutlined } from '@ant-design/icons';
import { renderToString } from 'react-dom/server';
import { Modal, Form, Input, Select, InputNumber, Collapse, Button, message } from 'antd';

// Map click handler komponenti
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
};

// Map zoom controller komponenti
const MapZoomController = ({ bounds, center }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [20, 20] });
    } else if (center) {
      map.setView(center, 8);
    }
  }, [bounds, center, map]);

  return null;
};

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

// Import fake data (konvert qilingan)
import fakeData from '../data/xaritaFakeData.json';

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

// Fake data dan viloyat va tumanlar bo'yicha hisoblash
const calculateRegionCounts = () => {
  const counts = {};
  fakeData.forEach(item => {
    const region = item.viloyati;
    counts[region] = (counts[region] || 0) + 1;
  });
  return counts;
};

const calculateDistrictCounts = (regionName) => {
  const counts = {};
  fakeData.filter(item => item.viloyati === regionName).forEach(item => {
    const district = item.tumani;
    counts[district] = (counts[district] || 0) + 1;
  });
  return counts;
};

const regionCounts = calculateRegionCounts();

// GeoJSON feature markazini hisoblash
const getFeatureCenter = (feature) => {
  const bounds = L.geoJSON(feature).getBounds();
  const center = bounds.getCenter();
  return [center.lat, center.lng];
};

// Ariza xolati rangini olish
const getStatusColor = (status) => {
  switch (status) {
    case 'ijobiy': return '#22c55e'; // yashil
    case 'salbiy': return '#ef4444'; // qizil
    case 'yaroqsiz': return '#eab308'; // sariq
    default: return '#6b7280'; // kulrang
  }
};

// Custom marker icon yaratish
const createMarkerIcon = (status, size = 24) => {
  const color = getStatusColor(status);
  const iconHtml = renderToString(
    <EnvironmentOutlined style={{ fontSize: `${size}px`, color: color }} />
  );

  return L.divIcon({
    html: `<div style="display: flex; align-items: center; justify-content: center;">${iconHtml}</div>`,
    className: 'custom-marker-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  });
};

// Data structure from data.js
const data = {
  regions: {
    path: regions,
    name: "regions",
    regionsData: [
      { name: "qoraqalpogiston", value: regionCounts['qoraqalpogiston'] || 0 },
      { name: "xorazm", value: regionCounts['xorazm'] || 0 },
      { name: "navoiy", value: regionCounts['navoiy'] || 0 },
      { name: "buxoro", value: regionCounts['buxoro'] || 0 },
      { name: "qashqadaryo", value: regionCounts['qashqadaryo'] || 0 },
      { name: "surxondaryo", value: regionCounts['surxondaryo'] || 0 },
      { name: "samarqand", value: regionCounts['samarqand'] || 0 },
      { name: "jizzax", value: regionCounts['jizzax'] || 0 },
      { name: "sirdaryo", value: regionCounts['sirdaryo'] || 0 },
      { name: "toshkent", value: regionCounts['toshkent'] || 0 },
      { name: "namangan", value: regionCounts['namangan'] || 0 },
      { name: "fargona", value: regionCounts['fargona'] || 0 },
      { name: "andijon", value: regionCounts['andijon'] || 0 },
    ],
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
    path: toshkent,
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
      { name: "bektemir", value: 0 },
      { name: "sergeli", value: 0 },
      { name: "yangiyul", value: 0 },
      { name: "chilanzar", value: 0 },
      { name: "uchtepa", value: 0 },
      { name: "tashkent", value: 0 },
      { name: "yakkasaray", value: 0 },
      { name: "almazar", value: 0 },
      { name: "shaykhantokhur", value: 0 },
      { name: "yunusabad", value: 0 },
      { name: "kibray", value: 0 },
      { name: "yashnobod", value: 0 },
      { name: "mirabad", value: 0 },
      { name: "mirzo ulugbek", value: 0 },
      { name: "bostanlik", value: 0 },
      { name: "chirchik", value: 0 },
      { name: "nurafshon", value: 0 },
      { name: "yukarichirchik", value: 0 },
      { name: "parkent", value: 0 },
      { name: "angren", value: 0 },
      { name: "zangiata", value: 0 },
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

// Helper functions
const getFirstWordLowercase = (str) => {
  let filter = str.replace(/[-',`ʻ]/g, "");
  let name = filter.split(" ")[0].toLowerCase();
  return name;
};

const getColor = (d) => {
  return d > 1000 ? "#800026"
    : d > 500 ? "#BD0026"
    : d > 200 ? "#E31A1C"
    : d > 100 ? "#FC4E2A"
    : d > 50 ? "#FD8D3C"
    : d > 20 ? "#FEB24C"
    : d > 10 ? "#FED976"
    : "#bdbbba";
};

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

  // Filter state lari
  const [filterToifa, setFilterToifa] = useState("");
  const [filterBand, setFilterBand] = useState("");
  const [filterMaterial, setFilterMaterial] = useState("");
  const [filterArizaXolati, setFilterArizaXolati] = useState("");
  const [filterSanoat, setFilterSanoat] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [selectedViloyat, setSelectedViloyat] = useState("");
  const [selectedTuman, setSelectedTuman] = useState("");
  const [pickedCoords, setPickedCoords] = useState(null);
  const [modalMapBounds, setModalMapBounds] = useState(null);
  const [modalMapGeoJSON, setModalMapGeoJSON] = useState(null);

  // Lokal qo'shilgan arizalar (xaritada ko'rsatish uchun)
  const [localArizalar, setLocalArizalar] = useState([]);

  // Sanoat turlari ro'yxati
  const sanoatTurlari = [
    "Sement ishlab chiqarish korxonalari.",
    "Mashinasozlik sanoati (aviasozlik, vagonsozlik, avtomobil, traktor, motor ishlab chiqarish va boshqalar).",
    "Teri-ko'nchilik korxonalari.",
    "Qora va rangli metallurgiya zavodlari.",
    "Qurilish sanoati korxonalari, asbest va sement ishlab chiqarish bundan mustasno.",
    "Neft va gaz quduqlarini qazish va jihozlash.",
    "Yoqilg'i resurslarini (neft, gaz, ko'mir va boshqalar) qidirish, razvedka qilish va qazib olish.",
    "Kimyo komplekslari va zavodlari.",
    "Yoqilg'i resurslarini (neft, gaz, ko'mir va boshqalar) qidirish, razvedka qilish, qazib olish va quduqlarni jihozlash ishlari.",
    "Aeroportlar",
    "Suv omborlari va to'g'onlar.",
    "Sement ishlab chiqarish.",
    "Ruda va kimyoviy xom ashyoni qazib olish konlari, qazib olishda hosil bo'ladigan konlarni rekultivatsiya qilish ishlari."
  ];

  // Material turlari ro'yxati
  const materialTurlari = ["ATTAL", "ATTA", "ATB", "ICHH", "OCHM", "TCHM", "CHCHM", "EOTA"];

  // Toifalar ro'yxati
  const toifalar = ["I", "II", "III", "IV"];

  // Ariza xolatlari
  const arizaXolatlari = [
    { value: "ijobiy", label: "Ijobiy hulosa berilgan" },
    { value: "salbiy", label: "Salbiy hulosa berilgan" },
    { value: "yaroqsiz", label: "Qayta ishlashga yaroqsiz" }
  ];

  // Chiqindilar maydonlari
  const chiqindilarFields = [
    { name: "azot_ikki_oksidi_azot_dioksidi", label: "Azot dioksidi (NO₂)" },
    { name: "azot_oksidi", label: "Azot oksidi (NO)" },
    { name: "akrilonitril", label: "Akrilonitril" },
    { name: "akrolein", label: "Akrolein" },
    { name: "benzoy_alьdegid_benzalьdegid", label: "Benzaldegid" },
    { name: "moyli_alьdegid", label: "Moyli aldegid" },
    { name: "alyuminiy_oksidi", label: "Alyuminiy oksidi" },
    { name: "ammiak", label: "Ammiak (NH₃)" },
    { name: "ammoniy_nitrat_ammiakli_selitra", label: "Ammoniy nitrat" },
    { name: "ammoniy_sulьfat", label: "Ammoniy sulfat" },
    { name: "ammoniy_xlorid", label: "Ammoniy xlorid" },
    { name: "ammofos", label: "Ammofos" },
    { name: "malein_angidrid_buglar_aerozolь", label: "Malein angidrid" },
    { name: "oltingugurt_angidrid_oltingugurt_gazi_oltingugurt_ikki_oksidi", label: "Oltingugurt dioksidi (SO₂)" },
    { name: "sirka_angidridi", label: "Sirka angidridi" },
    { name: "fosfor_angidrid", label: "Fosfor angidrid" },
    { name: "ftalen_angidrid_buglar_aerozolь", label: "Ftalen angidrid" },
    { name: "anilin", label: "Anilin" },
    { name: "atsetalьdegid", label: "Atsetaldegid" },
    { name: "atseton", label: "Atseton" },
    { name: "atsetilen", label: "Atsetilen" },
    { name: "atsetofenon", label: "Atsetofenon" },
    { name: "bariyli_karbonat_kislota_bariyga_qayta_hisoblaganda", label: "Bariy karbonati" },
    { name: "oqsil_maъdanli_qoshimchasi_bmd", label: "Oqsil-ma'danli qo'shimcha" },
    { name: "oqsil_vitaminli_kontsentrat_changining_oqsili", label: "Oqsil-vitaminli kontsentrat" }
  ];

  // Modal ochish/yopish
  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
    setSelectedViloyat("");
    setSelectedTuman("");
    setPickedCoords(null);
    setModalMapBounds(null);
    setModalMapGeoJSON(null);
  };

  // Forma yuborilganda
  const handleSubmit = (values) => {
    // Yangi buyurtma raqami generatsiya qilish (fakeData + localArizalar)
    const allData = [...fakeData, ...localArizalar];
    const maxBuyurtmaRaqami = Math.max(...allData.map(item => item.buyurtma_raqami), 0);
    const newBuyurtmaRaqami = maxBuyurtmaRaqami + 1;

    // Chiqindilar uchun default qiymatlar
    const chiqindilarDefaults = {};
    chiqindilarFields.forEach(field => {
      chiqindilarDefaults[field.name] = values[field.name] || 0;
    });

    const newAriza = {
      buyurtma_raqami: newBuyurtmaRaqami,
      buyurtmachi_nomi: values.buyurtmachi_nomi,
      stir_jshshir: values.stir_jshshir,
      toifasi: values.toifasi,
      bandi: values.bandi,
      viloyati: values.viloyati,
      tumani: values.tumani,
      material_turi: values.material_turi,
      ekspertiza_kordinata_x: values.ekspertiza_kordinata_x || 64.5736,
      ekspertiza_kordinata_y: values.ekspertiza_kordinata_y || 41.3812,
      ekspert_tashkilot: values.ekspert_tashkilot || "",
      korib_chiqish_muddati: values.korib_chiqish_muddati || 0,
      ekspert_fish: values.ekspert_fish || "",
      xulosa_raqami: values.xulosa_raqami || "",
      xulosa_sanasi: values.xulosa_sanasi || 0,
      xulosa_amal_qilish_muddati: values.xulosa_amal_qilish_muddati || 0,
      ariza_xolati: values.ariza_xolati,
      sanoat_nomi: values.sanoat_nomi,
      ...chiqindilarDefaults
    };

    // Yangi arizani local state ga qo'shish
    setLocalArizalar(prev => [...prev, newAriza]);

    console.log("Yangi ariza qo'shildi:", newAriza);
    message.success(`Ariza muvaffaqiyatli qo'shildi! (Buyurtma №: ${newBuyurtmaRaqami})`);

    handleCancel();
  };

  // Viloyat o'zgarganda tumanlarni yangilash va xaritani zoom qilish
  const handleViloyatChange = (value) => {
    setSelectedViloyat(value);
    setSelectedTuman("");
    form.setFieldValue('tumani', undefined);
    setPickedCoords(null);

    // Viloyat GeoJSON ni topish va zoom qilish
    if (value && regions) {
      const regionFeature = regions.features.find(f =>
        getFirstWordLowercase(f.properties.name) === value
      );
      if (regionFeature) {
        const bounds = L.geoJSON(regionFeature).getBounds();
        setModalMapBounds(bounds);
        setModalMapGeoJSON({
          type: "FeatureCollection",
          features: [regionFeature]
        });
      }
    } else {
      setModalMapBounds(null);
      setModalMapGeoJSON(null);
    }
  };

  // Tuman o'zgarganda xaritani zoom qilish
  const handleTumanChange = (value) => {
    setSelectedTuman(value);
    setPickedCoords(null);

    // Tuman GeoJSON ni topish va zoom qilish
    if (value && selectedViloyat && data[selectedViloyat]) {
      const regionGeoJSON = data[selectedViloyat].path;
      const districtFeature = regionGeoJSON.features.find(f =>
        getFirstWordLowercase(f.properties.name) === value
      );
      if (districtFeature) {
        const bounds = L.geoJSON(districtFeature).getBounds();
        setModalMapBounds(bounds);
        setModalMapGeoJSON({
          type: "FeatureCollection",
          features: [districtFeature]
        });
      }
    } else if (selectedViloyat) {
      // Tumanni tozalaganda viloyatga qaytish
      handleViloyatChange(selectedViloyat);
    }
  };

  // Xaritadan koordinata tanlash
  const handleMapClick = (latlng) => {
    setPickedCoords(latlng);
    form.setFieldsValue({
      ekspertiza_kordinata_x: parseFloat(latlng.lng.toFixed(6)),
      ekspertiza_kordinata_y: parseFloat(latlng.lat.toFixed(6))
    });
    message.success(`Koordinatalar tanlandi: ${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`);
  };

  // Tanlangan viloyatning tumanlari
  const getModalDistrictsList = () => {
    if (selectedViloyat && data[selectedViloyat]?.subData) {
      return data[selectedViloyat].subData.map(d => d.name);
    }
    return [];
  };

  // Tanlangan koordinata uchun marker icon
  const pickedMarkerIcon = L.divIcon({
    html: `<div style="display: flex; align-items: center; justify-content: center;">
      ${renderToString(<EnvironmentOutlined style={{ fontSize: '28px', color: '#ef4444' }} />)}
    </div>`,
    className: 'custom-marker-icon',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });

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

  // Select orqali viloyat tanlash
  const handleRegionSelect = (regionName) => {
    if (!regionName) {
      // Bo'sh tanlov - respublikaga qaytish
      backToRegions();
      return;
    }
    if (data[regionName]) {
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
    let filteredData = [...fakeData, ...localArizalar];

    if (filterToifa) filteredData = filteredData.filter(item => item.toifasi === filterToifa);
    if (filterBand !== "") filteredData = filteredData.filter(item => item.bandi === parseInt(filterBand));
    if (filterMaterial) filteredData = filteredData.filter(item => item.material_turi === filterMaterial);
    if (filterArizaXolati) filteredData = filteredData.filter(item => item.ariza_xolati === filterArizaXolati);
    if (filterSanoat) filteredData = filteredData.filter(item => item.sanoat_nomi === filterSanoat);

    if (currentLevel === "regions") {
      // Viloyatdagi korxonalar soni
      return filteredData.filter(item => item.viloyati === name).length;
    } else if (currentLevel === "region" || currentLevel === "district") {
      // Tumandagi korxonalar soni
      const regionName = currentLevel === "region" ? currentPath.name : parentRegion;
      return filteredData.filter(item =>
        item.viloyati === regionName && item.tumani === name
      ).length;
    }
    return 0;
  };

  const style = (feature) => {
    let name = getFirstWordLowercase(feature.properties.name);
    const value = getTheValue(name);

    return {
      weight: 2,
      opacity: 1,
      color: "#75706f",
      dashArray: "3",
      fillOpacity: 0.7,
      fillColor: getColor(value),
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
          weight: 5,
          color: "#666",
          dashArray: "",
          fillOpacity: 0.7,
        });
        layer.bringToFront();
        setHoveredRegion({
          name: feature.properties.name,
          value: value,
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle(style(feature));
        setHoveredRegion(null);
      },
      click: (e) => {
        if (currentLevel === "regions") {
          // 1-daraja: Viloyatni bosish -> tumanlar ko'rinadi
          const regionName = getFirstWordLowercase(feature.properties.name);
          console.log('Clicked region:', feature.properties.name, '-> regionName:', regionName);
          if (data[regionName]) {
            setCurrentPath(data[regionName]);
            setCurrentLevel("region");
            setParentRegion(regionName);
            setMapKey((prev) => prev + 1);
            const bounds = e.target.getBounds();
            if (mapRef.current) {
              mapRef.current.fitBounds(bounds);
            }
          }
        } else if (currentLevel === "region") {
          // 2-daraja: Tumanni bosish -> faqat o'sha tuman ko'rinadi
          const districtName = getFirstWordLowercase(feature.properties.name);
          console.log('Clicked district:', feature.properties.name);
          // Faqat shu bitta feature bilan yangi GeoJSON yaratamiz
          const singleDistrictGeoJSON = {
            type: "FeatureCollection",
            features: [feature]
          };
          setSelectedDistrict(singleDistrictGeoJSON);
          setSelectedDistrictName(districtName);
          setCurrentLevel("district");
          setMapKey((prev) => prev + 1);
          const bounds = e.target.getBounds();
          if (mapRef.current) {
            mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          }
        } else if (currentLevel === "district") {
          // 3-daraja: Tumanni yana bosish -> viloyatga qaytish
          backToRegion();
        }
      },
    });
  };

  const backToRegions = () => {
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

  // Legend qo'shish useEffect
  useEffect(() => {
    if (!mapRef.current) return;

    const grades = [0, 10, 20, 50, 100, 200, 500, 1000];
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = function () {
      const div = L.DomUtil.create("div", "info legend");
      const labels = [];

      for (let i = 0; i < grades.length; i++) {
        const from = grades[i];
        const to = grades[i + 1];

        labels.push(
          `<i style="background:${getColor(from + 1)}; width: 18px; height: 18px; float: left; margin-right: 8px; opacity: 0.7;"></i> ${from}${to ? `&ndash;${to}` : "+"}`
        );
      }

      div.innerHTML = labels.join("<br>");
      div.style.cssText = `
        padding: 6px 8px;
        font: 14px/16px Arial, Helvetica, sans-serif;
        background: white;
        background: rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        line-height: 18px;
        color: #555;
      `;
      return div;
    };

    legend.addTo(mapRef.current);

    return () => {
      legend.remove();
    };
  }, [mapKey]);


  // Markerlar uchun ma'lumotlarni tayyorlash (fakeData + localArizalar)
  const markersData = useMemo(() => {
    // fakeData va localArizalar ni birlashtirish
    const allData = [...fakeData, ...localArizalar];
    let filteredData = allData;

    // Joriy ko'rinishga qarab filter qilish (viloyat/tuman)
    if (currentLevel === "region" && parentRegion) {
      filteredData = filteredData.filter(item => item.viloyati === parentRegion);
    } else if (currentLevel === "district" && parentRegion && selectedDistrictName) {
      filteredData = filteredData.filter(item =>
        item.viloyati === parentRegion && item.tumani === selectedDistrictName
      );
    }

    // Toifa bo'yicha filter
    if (filterToifa) {
      filteredData = filteredData.filter(item => item.toifasi === filterToifa);
    }

    // Band bo'yicha filter
    if (filterBand !== "") {
      filteredData = filteredData.filter(item => item.bandi === parseInt(filterBand));
    }

    // Material turi bo'yicha filter
    if (filterMaterial) {
      filteredData = filteredData.filter(item => item.material_turi === filterMaterial);
    }

    // Ariza xolati bo'yicha filter
    if (filterArizaXolati) {
      filteredData = filteredData.filter(item => item.ariza_xolati === filterArizaXolati);
    }

    // Sanoat turi bo'yicha filter
    if (filterSanoat) {
      filteredData = filteredData.filter(item => item.sanoat_nomi === filterSanoat);
    }

    // Har bir item uchun real koordinatalardan foydalanish
    return filteredData.map((item, index) => {
      // Real koordinatalar mavjud bo'lsa ishlatamiz
      // ekspertiza_kordinata_x = longitude, ekspertiza_kordinata_y = latitude
      let coords = [41.3812, 64.5736]; // default

      if (item.ekspertiza_kordinata_y && item.ekspertiza_kordinata_x) {
        coords = [item.ekspertiza_kordinata_y, item.ekspertiza_kordinata_x];
      }

      return {
        ...item,
        id: `${item.buyurtma_raqami}-${index}`,
        coords,
        isLocal: localArizalar.some(la => la.buyurtma_raqami === item.buyurtma_raqami) // yangi qo'shilganlarni belgilash
      };
    });
  }, [currentLevel, parentRegion, selectedDistrictName, filterToifa, filterBand, filterMaterial, filterArizaXolati, filterSanoat, localArizalar]);

  // Statistika va chiqindilar yig'indisini hisoblash
  const statistics = useMemo(() => {
    const data = markersData;

    // Ariza holati bo'yicha hisoblash
    const counts = {
      total: data.length,
      ijobiy: data.filter(d => d.ariza_xolati === 'ijobiy').length,
      salbiy: data.filter(d => d.ariza_xolati === 'salbiy').length,
      yaroqsiz: data.filter(d => d.ariza_xolati === 'yaroqsiz').length
    };

    // Chiqindilar (emissions) maydonlari
    const emissionFields = [
      'azot_ikki_oksidi_azot_dioksidi',
      'azot_oksidi',
      'akrilonitril',
      'akrolein',
      'benzoy_alьdegid_benzalьdegid',
      'moyli_alьdegid',
      'alyuminiy_oksidi',
      'ammiak',
      'ammoniy_nitrat_ammiakli_selitra',
      'ammoniy_sulьfat',
      'ammoniy_xlorid',
      'ammofos',
      'malein_angidrid_buglar_aerozolь',
      'oltingugurt_angidrid_oltingugurt_gazi_oltingugurt_ikki_oksidi',
      'sirka_angidridi',
      'fosfor_angidrid',
      'ftalen_angidrid_buglar_aerozolь',
      'anilin',
      'atsetalьdegid',
      'atseton',
      'atsetilen',
      'atsetofenon',
      'bariyli_karbonat_kislota_bariyga_qayta_hisoblaganda',
      'oqsil_maъdanli_qoshimchasi_bmd',
      'oqsil_vitaminli_kontsentrat_changining_oqsili'
    ];

    // Chiqindilar nomlarini chiroyli qilish
    const emissionLabels = {
      'azot_ikki_oksidi_azot_dioksidi': 'Azot dioksidi (NO₂)',
      'azot_oksidi': 'Azot oksidi (NO)',
      'akrilonitril': 'Akrilonitril',
      'akrolein': 'Akrolein',
      'benzoy_alьdegid_benzalьdegid': 'Benzaldegid',
      'moyli_alьdegid': 'Moyli aldegid',
      'alyuminiy_oksidi': 'Alyuminiy oksidi',
      'ammiak': 'Ammiak (NH₃)',
      'ammoniy_nitrat_ammiakli_selitra': 'Ammoniy nitrat',
      'ammoniy_sulьfat': 'Ammoniy sulfat',
      'ammoniy_xlorid': 'Ammoniy xlorid',
      'ammofos': 'Ammofos',
      'malein_angidrid_buglar_aerozolь': 'Malein angidrid',
      'oltingugurt_angidrid_oltingugurt_gazi_oltingugurt_ikki_oksidi': 'Oltingugurt dioksidi (SO₂)',
      'sirka_angidridi': 'Sirka angidridi',
      'fosfor_angidrid': 'Fosfor angidrid',
      'ftalen_angidrid_buglar_aerozolь': 'Ftalen angidrid',
      'anilin': 'Anilin',
      'atsetalьdegid': 'Atsetaldegid',
      'atseton': 'Atseton',
      'atsetilen': 'Atsetilen',
      'atsetofenon': 'Atsetofenon',
      'bariyli_karbonat_kislota_bariyga_qayta_hisoblaganda': 'Bariy karbonati',
      'oqsil_maъdanli_qoshimchasi_bmd': 'Oqsil-ma\'danli qo\'shimcha',
      'oqsil_vitaminli_kontsentrat_changining_oqsili': 'Oqsil-vitaminli kontsentrat'
    };

    // Har bir chiqindi turi bo'yicha yig'indini hisoblash
    const emissions = {};
    emissionFields.forEach(field => {
      const sum = data.reduce((acc, item) => acc + (Number(item[field]) || 0), 0);
      if (sum > 0) {
        emissions[field] = {
          label: emissionLabels[field] || field,
          value: sum
        };
      }
    });

    return { counts, emissions };
  }, [markersData]);

  // Filter block komponenti
  const FilterBlock = ({ title, children }) => (
    <div style={{
      background: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      marginBottom: '1rem',
      overflow: 'hidden'
    }}>
      <div style={{
        background: '#f8fafc',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid #e2e8f0',
        fontWeight: '600',
        fontSize: '0.9rem',
        color: '#334155'
      }}>
        {title}
      </div>
      <div style={{ padding: '1rem' }}>
        {children}
      </div>
    </div>
  );

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
        {/* CHAP - NATIJALAR (3x) */}
        <div style={{
          flex: 3.3,
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
            {currentLevel === "regions" ? (
              "O'zbekiston Respublikasi"
            ) : currentLevel === "region" ? (
              `${formatName(parentRegion)} viloyati`
            ) : (
              `${formatName(selectedDistrictName)} tumani`
            )}
          </div>

          {/* Statistika */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 0.75rem', fontSize: '0.9rem', color: '#334155' }}>
              Korxonalar statistikasi
            </h4>
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
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Umumiy korxonalar ro'yxati</div>
              </div>
              <div style={{
                padding: '0.75rem',
                background: '#f0fdf4',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#22c55e' }}>
                  {statistics.counts.ijobiy}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ijobiy hulosa olgan korxonalar</div>
              </div>
              <div style={{
                padding: '0.75rem',
                background: '#fef2f2',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>
                  {statistics.counts.salbiy}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Salbiy hulosa olgan korxonalar</div>
              </div>
              <div style={{
                padding: '0.75rem',
                background: '#fefce8',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#eab308' }}>
                  {statistics.counts.yaroqsiz}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Qayta ishlashga yaroqsiz korxonalar</div>
              </div>
            </div>
          </div>

          {/* Chiqindilar / Korxonalar ro'yxati - tab */}
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '0.25rem', padding: '0.75rem 1rem 0' }}>
              {[
                { key: 'chiqindilar', label: "Chiqindilar (tonna)" },
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
                Object.keys(statistics.emissions).length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: '#94a3b8',
                    fontSize: '0.85rem'
                  }}>
                    Chiqindi ma'lumotlari mavjud emas
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {Object.entries(statistics.emissions).map(([key, { label, value }]) => (
                      <div
                        key={key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.5rem 0.75rem',
                          background: '#f8fafc',
                          borderRadius: '6px',
                          fontSize: '0.8rem'
                        }}
                      >
                        <span style={{ color: '#475569' }}>{label}</span>
                        <span style={{
                          fontWeight: '600',
                          color: '#1e293b',
                          background: '#e2e8f0',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                markersData.length === 0 ? (
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
                    {markersData.map(item => (
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
                          background: getStatusColor(item.ariza_xolati)
                        }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, color: '#1e293b', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.buyurtmachi_nomi}
                          </p>
                          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.72rem' }}>
                            {formatName(item.viloyati)}, {formatName(item.tumani)}
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

        {/* O'RTA - XARITA (6x) */}
        <div style={{
          flex: 6,
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
                    {formatName(parentRegion)} viloyati
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
              </div>

              {/* Yangi ariza qo'shish tugmasi */}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={showModal}
                style={{
                  background: '#059669',
                  borderColor: '#059669',
                  borderRadius: '6px',
                  fontWeight: '500'
                }}
              >
                Yangi ariza
              </Button>
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

            <MapContainer
              key={mapKey}
              center={[41.3812, 64.5736]}
              zoom={6}
              style={{ width: '100%', height: '100%' }}
              ref={mapRef}
            >
              <MapAutoResize />
              <TileLayer
                url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />
              <GeoJSON
                key={`${filterToifa}-${filterBand}-${filterMaterial}-${filterArizaXolati}-${filterSanoat}`}
                data={currentLevel === "district" ? selectedDistrict : currentPath.path}
                style={style}
                onEachFeature={onEachFeature}
              />

              {/* Korxona markerlari */}
              {markersData.map((item) => (
                <Marker
                  key={item.id}
                  position={item.coords}
                  icon={createMarkerIcon(
                    item.ariza_xolati,
                    currentLevel === "district" ? 32 : currentLevel === "region" ? 28 : 24
                  )}
                >
                  <Popup>
                    <div style={{ minWidth: '250px', maxWidth: '300px' }}>
                      <h4 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: '14px' }}>
                        {item.buyurtmachi_nomi}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.6' }}>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Buyurtma №:</strong> {item.buyurtma_raqami}
                        </p>
                        <p style={{ margin: '4px 0' }}>
                          <strong>STIR/JSHSHIR:</strong> {item.stir_jshshir}
                        </p>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Joylashuv:</strong> {formatName(item.viloyati)}, {formatName(item.tumani)}
                        </p>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Toifa:</strong> {item.toifasi} | <strong>Band:</strong> {item.bandi}
                        </p>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Material:</strong> {item.material_turi}
                        </p>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Sanoat:</strong> {item.sanoat_nomi}
                        </p>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Ekspert:</strong> {item.ekspert_fish}
                        </p>
                        <p style={{ margin: '4px 0' }}>
                          <strong>Xulosa №:</strong> {item.xulosa_raqami}
                        </p>
                      </div>
                      <p style={{
                        margin: '10px 0 0',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        display: 'inline-block',
                        fontSize: '11px',
                        fontWeight: '600',
                        color: 'white',
                        background: getStatusColor(item.ariza_xolati)
                      }}>
                        {item.ariza_xolati === 'ijobiy' ? 'Ijobiy hulosa berilgan' :
                         item.ariza_xolati === 'salbiy' ? 'Salbiy hulosa berilgan' :
                         'Qayta ishlashga yaroqsiz'}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* O'NG - FILTERLAR (2x) */}
        <div style={{
          flex: 2.2,
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontWeight: '600',
            fontSize: '0.9rem',
            color: '#334155'
          }}>
            Filterlar
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: '0.75rem' }}>
        {/* Joylashuv bo'yicha filterlar */}
        <FilterBlock title="Joylashuv bo'yicha">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Viloyat Select */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>
                Viloyat
              </label>
              <select
                value={parentRegion || ""}
                onChange={(e) => handleRegionSelect(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
              >
                <option value="">Barcha viloyatlar</option>
                {regionsList.map(region => (
                  <option key={region} value={region}>
                    {formatName(region)} viloyati
                  </option>
                ))}
              </select>
            </div>

            {/* Tuman Select */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>
                Tuman/Shahar
              </label>
              <select
                value={selectedDistrictName || ""}
                onChange={(e) => handleDistrictSelect(e.target.value)}
                disabled={!parentRegion}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: parentRegion ? 'white' : '#f1f5f9',
                  fontSize: '0.9rem',
                  cursor: parentRegion ? 'pointer' : 'not-allowed',
                  outline: 'none',
                  transition: 'border-color 0.2s',
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
          </div>
        </FilterBlock>

        {/* Asosiy Filterlar */}
        <FilterBlock title="Asosiy Filterlar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Toifasi bo'yicha */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>
                Toifasi bo'yicha
              </label>
              <select
                value={filterToifa}
                onChange={(e) => setFilterToifa(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="">Barchasi</option>
                <option value="I">I - toifa</option>
                <option value="II">II - toifa</option>
                <option value="III">III - toifa</option>
                <option value="IV">IV - toifa</option>
              </select>
            </div>

            {/* Bandi bo'yicha */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>
                Bandi bo'yicha
              </label>
              <select
                value={filterBand}
                onChange={(e) => setFilterBand(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="">Barchasi</option>
                {[...Array(60)].map((_, i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            {/* Material Turi bo'yicha */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>
                Material Turi bo'yicha
              </label>
              <select
                value={filterMaterial}
                onChange={(e) => setFilterMaterial(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="">Barchasi</option>
                <option value="ATTAL">ATTAL</option>
                <option value="ATTA">ATTA</option>
                <option value="ATB">ATB</option>
                <option value="ICHH">ICHH</option>
                <option value="OCHM">OCHM</option>
                <option value="TCHM">TCHM</option>
                <option value="CHCHM">CHCHM</option>
                <option value="EOTA">EOTA</option>
              </select>
            </div>
          </div>
        </FilterBlock>

        {/* Qo'shimcha filterlar */}
        <FilterBlock title="Qo'shimcha filterlar">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Ariza xolati bo'yicha */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>
                Ariza xolati bo'yicha
              </label>
              <select
                value={filterArizaXolati}
                onChange={(e) => setFilterArizaXolati(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="">Barchasi</option>
                <option value="ijobiy">Ijobiy hulosa berilgan</option>
                <option value="yaroqsiz">Qayta ishlashga yaroqsiz</option>
                <option value="salbiy">Salbiy hulosa berilgan</option>
              </select>
            </div>

            {/* Sanoat turi bo'yicha */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>
                Sanoat turi bo'yicha
              </label>
              <select
                value={filterSanoat}
                onChange={(e) => setFilterSanoat(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: 'white',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="">Barchasi</option>
                {sanoatTurlari.map((sanoat, index) => (
                  <option key={index} value={sanoat}>
                    {sanoat.length > 50 ? sanoat.substring(0, 50) + '...' : sanoat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FilterBlock>

        {/* Tozalash tugmasi */}
        <button
          onClick={() => {
            setFilterToifa("");
            setFilterBand("");
            setFilterMaterial("");
            setFilterArizaXolati("");
            setFilterSanoat("");
          }}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#f1f5f9',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: '500',
            cursor: 'pointer',
            marginBottom: '0.5rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.background = '#e2e8f0'}
          onMouseLeave={(e) => e.target.style.background = '#f1f5f9'}
        >
          Filterlarni tozalash
        </button>
          </div>
        </div>
      </div>

      {/* Yangi ariza qo'shish modali */}
      <Modal
        title={
          <div style={{
            fontSize: '1.1rem',
            fontWeight: '600',
            color: '#059669',
            borderBottom: '2px solid #059669',
            paddingBottom: '0.5rem'
          }}>
            Yangi ariza qo'shish
          </div>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        width={800}
        style={{ top: 20 }}
        styles={{ body: { maxHeight: '75vh', overflowY: 'auto', padding: '1rem' } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            bandi: 0,
            ekspertiza_kordinata_x: 64.5736,
            ekspertiza_kordinata_y: 41.3812
          }}
        >
          {/* 1-bo'lim: Asosiy ma'lumotlar */}
          <div style={{
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 1rem', color: '#334155', fontSize: '0.95rem' }}>
              Asosiy ma'lumotlar
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Form.Item
                name="buyurtmachi_nomi"
                label="Buyurtmachi nomi"
                rules={[{ required: true, message: "Buyurtmachi nomini kiriting!" }]}
              >
                <Input placeholder="Korxona yoki shaxs nomi" />
              </Form.Item>

              <Form.Item
                name="stir_jshshir"
                label="STIR / JSHSHIR"
                rules={[{ required: true, message: "STIR/JSHSHIR kiriting!" }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Masalan: 305137061"
                  controls={false}
                />
              </Form.Item>

              <Form.Item
                name="viloyati"
                label="Viloyat"
                rules={[{ required: true, message: "Viloyatni tanlang!" }]}
              >
                <Select
                  placeholder="Viloyatni tanlang"
                  onChange={handleViloyatChange}
                  showSearch
                  optionFilterProp="children"
                >
                  {regionsList.map(region => (
                    <Select.Option key={region} value={region}>
                      {formatName(region)} viloyati
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="tumani"
                label="Tuman/Shahar"
                rules={[{ required: true, message: "Tumanni tanlang!" }]}
              >
                <Select
                  placeholder={selectedViloyat ? "Tumanni tanlang" : "Avval viloyat tanlang"}
                  disabled={!selectedViloyat}
                  showSearch
                  optionFilterProp="children"
                  onChange={handleTumanChange}
                  value={selectedTuman || undefined}
                >
                  {getModalDistrictsList().map(district => (
                    <Select.Option key={district} value={district}>
                      {formatName(district)}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            {/* Xaritadan koordinata tanlash */}
            <div style={{ marginTop: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                color: '#64748b',
                marginBottom: '0.5rem'
              }}>
                <AimOutlined style={{ marginRight: '0.5rem' }} />
                Koordinatalarni xaritadan tanlang (viloyat/tuman tanlagandan keyin)
              </label>
              <div style={{
                height: '250px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid #e2e8f0',
                position: 'relative'
              }}>
                {!selectedViloyat ? (
                  <div style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f1f5f9',
                    color: '#94a3b8'
                  }}>
                    Avval viloyat tanlang
                  </div>
                ) : (
                  <MapContainer
                    center={[41.3812, 64.5736]}
                    zoom={6}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <MapAutoResize />
                    <TileLayer
                      url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                      maxZoom={19}
                    />
                    <MapClickHandler onMapClick={handleMapClick} />
                    <MapZoomController bounds={modalMapBounds} />

                    {/* Tanlangan viloyat/tuman chegarasi */}
                    {modalMapGeoJSON && (
                      <GeoJSON
                        key={JSON.stringify(modalMapGeoJSON)}
                        data={modalMapGeoJSON}
                        style={{
                          weight: 2,
                          opacity: 1,
                          color: '#2563eb',
                          fillOpacity: 0.1,
                          fillColor: '#2563eb'
                        }}
                      />
                    )}

                    {/* Tanlangan koordinata markeri */}
                    {pickedCoords && (
                      <Marker
                        position={[pickedCoords.lat, pickedCoords.lng]}
                        icon={pickedMarkerIcon}
                      />
                    )}
                  </MapContainer>
                )}

                {/* Koordinatalar ko'rsatkichi */}
                {pickedCoords && (
                  <div style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    background: 'rgba(255,255,255,0.95)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: '#2563eb',
                    fontWeight: '500',
                    zIndex: 1000,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}>
                    Lat: {pickedCoords.lat.toFixed(6)}, Lng: {pickedCoords.lng.toFixed(6)}
                  </div>
                )}
              </div>
            </div>

            {/* Yashirin koordinata inputlari (form uchun) */}
            <div style={{ display: 'none' }}>
              <Form.Item name="ekspertiza_kordinata_x">
                <InputNumber />
              </Form.Item>
              <Form.Item name="ekspertiza_kordinata_y">
                <InputNumber />
              </Form.Item>
            </div>
          </div>

          {/* 2-bo'lim: Toifa va klassifikatsiya */}
          <div style={{
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 1rem', color: '#334155', fontSize: '0.95rem' }}>
              Toifa va klassifikatsiya
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Form.Item
                name="toifasi"
                label="Toifasi"
                rules={[{ required: true, message: "Toifani tanlang!" }]}
              >
                <Select placeholder="Toifani tanlang">
                  {toifalar.map(toifa => (
                    <Select.Option key={toifa} value={toifa}>
                      {toifa} - toifa
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="bandi"
                label="Bandi"
                rules={[{ required: true, message: "Bandni tanlang!" }]}
              >
                <Select placeholder="Bandni tanlang" showSearch>
                  {[...Array(60)].map((_, i) => (
                    <Select.Option key={i} value={i}>
                      {i}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="material_turi"
                label="Material turi"
                rules={[{ required: true, message: "Material turini tanlang!" }]}
              >
                <Select placeholder="Material turini tanlang">
                  {materialTurlari.map(material => (
                    <Select.Option key={material} value={material}>
                      {material}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="ariza_xolati"
                label="Ariza holati"
                rules={[{ required: true, message: "Ariza holatini tanlang!" }]}
              >
                <Select placeholder="Ariza holatini tanlang">
                  {arizaXolatlari.map(xolat => (
                    <Select.Option key={xolat.value} value={xolat.value}>
                      {xolat.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="sanoat_nomi"
                label="Sanoat turi"
                rules={[{ required: true, message: "Sanoat turini tanlang!" }]}
                style={{ gridColumn: '1 / -1' }}
              >
                <Select placeholder="Sanoat turini tanlang" showSearch optionFilterProp="children">
                  {sanoatTurlari.map((sanoat, index) => (
                    <Select.Option key={index} value={sanoat}>
                      {sanoat}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
          </div>

          {/* 3-bo'lim: Ekspertiza ma'lumotlari */}
          <div style={{
            background: '#f8fafc',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: '1px solid #e2e8f0'
          }}>
            <h4 style={{ margin: '0 0 1rem', color: '#334155', fontSize: '0.95rem' }}>
              Ekspertiza ma'lumotlari
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Form.Item
                name="ekspert_tashkilot"
                label="Ekspert tashkilot"
              >
                <Input placeholder="Masalan: ANDIJON VILOYATI FILIALI" />
              </Form.Item>

              <Form.Item
                name="ekspert_fish"
                label="Ekspert F.I.SH"
              >
                <Input placeholder="Masalan: T.SULTONOV" />
              </Form.Item>

              <Form.Item
                name="xulosa_raqami"
                label="Xulosa raqami"
              >
                <Input placeholder="Masalan: 01-02/03-27" />
              </Form.Item>

              <Form.Item
                name="korib_chiqish_muddati"
                label="Ko'rib chiqish muddati (kun)"
              >
                <InputNumber style={{ width: '100%' }} placeholder="0" min={0} />
              </Form.Item>

              <Form.Item
                name="xulosa_sanasi"
                label="Xulosa sanasi (kun)"
              >
                <InputNumber style={{ width: '100%' }} placeholder="0" min={0} />
              </Form.Item>

              <Form.Item
                name="xulosa_amal_qilish_muddati"
                label="Xulosa amal qilish muddati (kun)"
              >
                <InputNumber style={{ width: '100%' }} placeholder="0" min={0} />
              </Form.Item>
            </div>
          </div>

          {/* 4-bo'lim: Chiqindilar (Collapse) */}
          <Collapse
            style={{ marginBottom: '1rem' }}
            items={[
              {
                key: '1',
                label: (
                  <span style={{ fontWeight: '500', color: '#334155' }}>
                    Chiqindilar ma'lumotlari (ixtiyoriy)
                  </span>
                ),
                children: (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                    {chiqindilarFields.map(field => (
                      <Form.Item
                        key={field.name}
                        name={field.name}
                        label={<span style={{ fontSize: '0.8rem' }}>{field.label}</span>}
                        style={{ marginBottom: '0.5rem' }}
                      >
                        <InputNumber
                          style={{ width: '100%' }}
                          placeholder="0"
                          min={0}
                          size="small"
                        />
                      </Form.Item>
                    ))}
                  </div>
                )
              }
            ]}
          />

          {/* Submit tugmalari */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e2e8f0'
          }}>
            <Button onClick={handleCancel}>
              Bekor qilish
            </Button>
            <Button type="primary" htmlType="submit" style={{ background: '#059669' }}>
              Saqlash
            </Button>
          </div>
        </Form>
      </Modal>

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
      `}</style>
    </div>
  );
}

import { useState, useRef, useEffect, useMemo, Fragment } from 'react';
import { MapContainer, TileLayer, GeoJSON, Polygon, CircleMarker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Input, message } from 'antd';
import WindVelocityLayer from '../components/WindVelocityLayer';
import WindHeatmapLayer from '../components/WindHeatmapLayer';
import { fetchUzbekistanWindGrid } from '../utils/wind';
import AddKorxonaModal from '../components/AddKorxonaModal';
import { korxonalarSeed } from '../data/korxonalar';
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

  // Korxonalar (namunaviy + qo'lda qo'shilganlar) va "Yangi korxona qo'shish" modali
  const [korxonalar, setKorxonalar] = useState(korxonalarSeed);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddKorxona = (newKorxona) => {
    setKorxonalar((prev) => [...prev, newKorxona]);
  };

  // INN yoki nomi bo'yicha korxonani qidirib, xaritada shu joyga fokus qilish
  const handleSearchKorxona = (query) => {
    const q = query.trim().toLowerCase();
    if (!q) return;

    const found = korxonalar.find(
      (k) => k.inn.toLowerCase().includes(q) || k.nomi.toLowerCase().includes(q)
    );

    if (!found) {
      message.warning("Korxona topilmadi");
      return;
    }

    const bounds = L.polygon(found.hudud).getBounds();

    // Qidirilgan korxona joriy ko'rinishda (masalan boshqa viloyat/tuman
    // tanlangan bo'lsa) ko'rinmay qolishi mumkin — respublika darajasiga
    // qaytarib, so'ng aynan shu hudud chegarasiga fokuslanamiz.
    setCurrentPath(data.regions);
    setCurrentLevel("regions");
    setParentRegion(null);
    setSelectedDistrict(null);
    setSelectedDistrictName(null);
    setMapKey((prev) => prev + 1);

    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
      }
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
        layer.bringToFront();
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

  // Joriy ko'rinishga (respublika/viloyat/tuman) mos korxonalar ro'yxati
  const visibleKorxonalar = useMemo(() => {
    if (currentLevel === "region" && parentRegion) {
      return korxonalar.filter(item => item.viloyat === parentRegion);
    }
    if (currentLevel === "district" && parentRegion && selectedDistrictName) {
      return korxonalar.filter(item =>
        item.viloyat === parentRegion && item.tuman === selectedDistrictName
      );
    }
    return korxonalar;
  }, [korxonalar, currentLevel, parentRegion, selectedDistrictName]);

  // Statistika va tashlanma yig'indilarini hisoblash
  const statistics = useMemo(() => {
    let atmosferaKorxonalar = 0;
    let suvKorxonalar = 0;
    let chiqindiKorxonalar = 0;
    const categoryTotals = {};

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
    };
  }, [visibleKorxonalar]);

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

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {/* INN yoki nomi bo'yicha korxona qidirish */}
                <Input.Search
                  placeholder="INN yoki korxona nomi bo'yicha qidirish"
                  allowClear
                  onSearch={handleSearchKorxona}
                  style={{ width: '260px' }}
                />

                {/* Shamol oqimi qatlamini yoqish/o'chirish */}
                <Button
                  type={windEnabled ? 'primary' : 'default'}
                  onClick={() => setWindEnabled((prev) => !prev)}
                  style={windEnabled ? {
                    background: '#0284c7',
                    borderColor: '#0284c7',
                    borderRadius: '6px',
                    fontWeight: '500'
                  } : {
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}
                >
                  Shamol oqimi {windEnabled ? 'yoqilgan' : "o'chirilgan"}
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
              <WindHeatmapLayer enabled={windEnabled} data={windData} />
              <WindVelocityLayer enabled={windEnabled} data={windData} />
              <GeoJSON
                data={currentLevel === "district" ? selectedDistrict : currentPath.path}
                style={style}
                onEachFeature={onEachFeature}
              />

              {/* Korxonalar — hudud chegarasi (poligon) + markaziy nuqta */}
              {visibleKorxonalar.map((item) => {
                const center = L.polygon(item.hudud).getBounds().getCenter();
                return (
                  <Fragment key={item.id}>
                    <Polygon
                      positions={item.hudud}
                      pathOptions={{ color: '#ef4444', weight: 2, dashArray: '6 6', fillColor: '#ef4444', fillOpacity: 0.15 }}
                    />
                    <CircleMarker
                      center={center}
                      radius={currentLevel === "district" ? 8 : currentLevel === "region" ? 6 : 4}
                      pathOptions={{ color: '#ef4444', weight: 2, fillColor: '#ffffff', fillOpacity: 1 }}
                    >
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
                {formatName(region)} viloyati
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

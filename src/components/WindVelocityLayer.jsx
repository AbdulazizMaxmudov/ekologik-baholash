import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import '../utils/leafletGlobalSetup';
import 'leaflet-velocity/dist/leaflet-velocity.css';
import 'leaflet-velocity';

// Windy.com uslubidagi oq rangdagi harakatlanuvchi shamol chiziqchalari
// (particle flow). Rangli fon uchun WindHeatmapLayer'ga qarang — ikkalasi
// birga Windy'dagi ko'rinishni hosil qiladi.
// leaflet-velocity ichidagi L.CanvasLayer o'zi `needRedraw()` orqali
// `requestAnimationFrame(this.drawLayer)` rejalashtiradi va `onAdd`da
// `_onLayerDidMove`ni chaqiruvchi hodisa handler'larni ulaydi — lekin
// `onRemove` bu ikkalasini ham bekor qilmaydi (kutubxonaning o'zidagi
// nuqson). Ilova navigatsiya paytida MapContainer'ni `key` orqali tez-tez
// qayta mount qilgani uchun, shamol yoqilgan holda bu kechikkan
// chaqiruvlar allaqachon yo'q qilingan xarita instansiyasiga murojaat
// qilib, konsolda "Cannot read properties of null" xatosini keltirib
// chiqaradi. Layer'ni olib tashlashdan oldin aynan shu ikki metodni
// bo'sh funksiyaga almashtirib, keyingi kechikkan chaqiruvlarni
// zararsizlantiramiz — foydalanuvchiga ta'sir qilmasa-da, konsolni
// ifloslantirmasligi uchun.
function safeRemoveLayer(map, layer) {
  try {
    const canvasLayer = layer?._canvasLayer;
    if (canvasLayer) {
      // `needRedraw()` chaqirilganda rAF callback allaqachon
      // `this.drawLayer`ni ushbu paytdagi qiymati bilan bog'lab qo'yadi —
      // metodni keyinroq bo'sh funksiyaga almashtirish bu holatda
      // yordam bermaydi, shuning uchun rejalashtirilgan freym'ning o'zini
      // bekor qilamiz.
      if (canvasLayer._frame) {
        cancelAnimationFrame(canvasLayer._frame);
        canvasLayer._frame = null;
      }
      canvasLayer.drawLayer = () => {};
      canvasLayer._onLayerDidMove = () => {};
    }
    if (map && map._loaded && layer) map.removeLayer(layer);
  } catch {
    // Xarita allaqachon yo'q qilingan — e'tiborsiz qoldiramiz
  }
}

export default function WindVelocityLayer({ enabled, data }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!enabled || !data) {
      safeRemoveLayer(map, layerRef.current);
      layerRef.current = null;
      return;
    }

    if (layerRef.current) {
      layerRef.current.setData(data);
    } else {
      layerRef.current = window.L.velocityLayer({
        data,
        displayValues: true,
        displayOptions: {
          velocityType: 'Shamol',
          position: 'bottomleft',
          emptyString: "Shamol ma'lumoti yo'q",
          angleConvention: 'bearingCW',
          speedUnit: 'm/s',
        },
        maxVelocity: 15,
        velocityScale: 0.012,
        lineWidth: 1.4,
        particleMultiplier: 1 / 250,
        // Barcha zarrachalar oq rangda — Windy'dagi flow-line ko'rinishi
        // tezlikka qarab rang emas, harakat orqali ifodalanadi.
        colorScale: ['rgba(255,255,255,0.9)'],
      });
      layerRef.current.addTo(map);
    }
  }, [enabled, data, map]);

  useEffect(() => {
    return () => {
      safeRemoveLayer(map, layerRef.current);
      layerRef.current = null;
    };
  }, [map]);

  return null;
}

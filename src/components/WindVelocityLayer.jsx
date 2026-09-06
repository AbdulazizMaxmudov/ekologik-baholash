import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import '../utils/leafletGlobalSetup';
import 'leaflet-velocity/dist/leaflet-velocity.css';
import 'leaflet-velocity';

// Windy.com uslubidagi oq rangdagi harakatlanuvchi shamol chiziqchalari
// (particle flow). Rangli fon uchun WindHeatmapLayer'ga qarang — ikkalasi
// birga Windy'dagi ko'rinishni hosil qiladi.
export default function WindVelocityLayer({ enabled, data }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (!enabled || !data) {
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
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
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  return null;
}

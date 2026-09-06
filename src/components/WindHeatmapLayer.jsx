import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { speedToColorRGB } from '../utils/windColorScale';

const CANVAS_WIDTH = 320;
const CANVAS_HEIGHT = 200;
const EDGE_FADE = 0.1; // grid chetlarining ~10% qismida shaffoflikka o'tish (qattiq chiziq ko'rinmasligi uchun)

// U/V grid'dan (bilinear interpolatsiya bilan) tekis rangli shamol tezligi
// rasterini (heatmap) chizadi — Windy.com'dagi rangli fon qatlamiga o'xshash.
function buildHeatmap(windData) {
  const [uRecord, vRecord] = windData;
  const { la1, lo1, la2, lo2, dx, dy, nx, ny } = uRecord.header;
  const uArr = uRecord.data;
  const vArr = vRecord.data;

  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');
  const imageData = ctx.createImageData(CANVAS_WIDTH, CANVAS_HEIGHT);

  const sample = (i, j) => {
    const ci = Math.min(Math.max(i, 0), nx - 1);
    const cj = Math.min(Math.max(j, 0), ny - 1);
    const idx = cj * nx + ci;
    return [uArr[idx] || 0, vArr[idx] || 0];
  };

  for (let py = 0; py < CANVAS_HEIGHT; py++) {
    const ny01 = py / (CANVAS_HEIGHT - 1); // 0 (shimol) .. 1 (janub)
    const lat = la1 - ny01 * (la1 - la2);
    const fj = (la1 - lat) / dy;
    const j0 = Math.floor(fj);
    const tj = fj - j0;

    for (let px = 0; px < CANVAS_WIDTH; px++) {
      const nx01 = px / (CANVAS_WIDTH - 1); // 0 (g'arb) .. 1 (sharq)
      const lon = lo1 + nx01 * (lo2 - lo1);
      const fi = (lon - lo1) / dx;
      const i0 = Math.floor(fi);
      const ti = fi - i0;

      const [u00, v00] = sample(i0, j0);
      const [u10, v10] = sample(i0 + 1, j0);
      const [u01, v01] = sample(i0, j0 + 1);
      const [u11, v11] = sample(i0 + 1, j0 + 1);

      const u = u00 * (1 - ti) * (1 - tj) + u10 * ti * (1 - tj) + u01 * (1 - ti) * tj + u11 * ti * tj;
      const v = v00 * (1 - ti) * (1 - tj) + v10 * ti * (1 - tj) + v01 * (1 - ti) * tj + v11 * ti * tj;
      const speed = Math.sqrt(u * u + v * v);

      const [r, g, b] = speedToColorRGB(speed);

      // Grid chetlariga yaqinlashganda shaffoflikni kamaytirib, qattiq
      // to'rtburchak chizig'i ko'rinib qolmasligiga erishamiz.
      const edgeDist = Math.min(nx01, 1 - nx01, ny01, 1 - ny01);
      const edgeFactor = Math.max(0, Math.min(1, edgeDist / EDGE_FADE));

      const offset = (py * CANVAS_WIDTH + px) * 4;
      imageData.data[offset] = r;
      imageData.data[offset + 1] = g;
      imageData.data[offset + 2] = b;
      imageData.data[offset + 3] = Math.round(255 * edgeFactor);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return {
    dataUrl: canvas.toDataURL(),
    bounds: L.latLngBounds([la2, lo1], [la1, lo2]),
  };
}

export default function WindHeatmapLayer({ enabled, data }) {
  const map = useMap();
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!enabled || !data) {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
      return;
    }

    const { dataUrl, bounds } = buildHeatmap(data);
    if (overlayRef.current) {
      overlayRef.current.setUrl(dataUrl);
      overlayRef.current.setBounds(bounds);
    } else {
      overlayRef.current = L.imageOverlay(dataUrl, bounds, {
        opacity: 0.55,
        interactive: false,
      }).addTo(map);
    }
  }, [enabled, data, map]);

  useEffect(() => {
    return () => {
      if (overlayRef.current) {
        map.removeLayer(overlayRef.current);
        overlayRef.current = null;
      }
    };
  }, [map]);

  return null;
}

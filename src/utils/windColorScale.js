// Windy.com uslubidagi shamol tezligi (m/s) -> rang shkalasi.
// Bosqichlar past tezlikda binafsha/ko'k, o'rtachada yashil/sariq,
// yuqori tezlikda to'q sariq/qizil tomon siljiydi.
const STOPS = [
  { speed: 0, color: [98, 86, 174] },
  { speed: 2, color: [71, 120, 190] },
  { speed: 4, color: [59, 155, 175] },
  { speed: 6, color: [76, 175, 140] },
  { speed: 8, color: [130, 195, 110] },
  { speed: 10, color: [190, 210, 90] },
  { speed: 13, color: [230, 200, 80] },
  { speed: 16, color: [235, 150, 60] },
  { speed: 20, color: [220, 90, 60] },
];

// Berilgan shamol tezligi (m/s) uchun interpolatsiya qilingan [r, g, b] qaytaradi.
export function speedToColorRGB(speed) {
  const s = Math.max(0, speed);

  if (s <= STOPS[0].speed) return STOPS[0].color;

  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (s >= a.speed && s <= b.speed) {
      const t = (s - a.speed) / (b.speed - a.speed);
      return a.color.map((v, idx) => v + (b.color[idx] - v) * t);
    }
  }

  return STOPS[STOPS.length - 1].color;
}

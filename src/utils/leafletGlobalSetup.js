import L from 'leaflet';

// leaflet-velocity UMD build sifatida global `L` ni kutadi (import emas) —
// shuning uchun uni import qilishdan oldin `window.L` ni o'rnatib qo'yamiz.
// Bu fayl har doim 'leaflet-velocity' dan OLDIN import qilinishi kerak,
// aks holda leaflet-velocity yuklanishda "L is not defined" xatosi beradi.
if (typeof window !== 'undefined' && !window.L) {
  window.L = L;
}

export default L;

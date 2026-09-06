// Korxonalarning 5 turdagi tashlanmalari uchun tanlov ro'yxatlari.
//
// MUHIM: bu ro'yxatlar rasmiy davlat reestridan olingan TO'LIQ ro'yxat emas —
// faqat foydalanuvchi taqdim etgan namunalardan matni to'liq (kesilmagan)
// bo'lganlari kiritilgan (ko'plari "..." bilan kesilgan holda berilgan edi,
// ularni o'zimizdan to'ldirib bo'lmaydi, chunki bu rasmiy kod/nomlar).
// Har bir toifada "Boshqa (qo'lda kiritish)" varianti bor — to'liq ro'yxat
// taqdim etilganda shu fayl osongina to'ldiriladi/almashtiriladi.

export const BOSHQA_QIYMAT = "__boshqa__";

// 1. Atmosferaga chiqariladigan ifloslantiruvchi moddalar
export const ATMOSFERA_MODDALARI = [
  "Alfa-naftoxinon (A-I 017)",
  "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
  "Benz(a)piren (A-I 002)",
  "Dietilsimob (simobga hisoblaganda) (A-I 008)",
  "Etilenimin (A-I 039)",
  "Etilensulfid (A-I 040)",
  "Azot dioksidi (A-II 001)",
  "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
];

// 2. Suvdan foydalanish manbalari
export const SUV_MANBA_TURLARI = [
  "Yer osti qudug'i",
  "Kanal, daryo",
  "Markazlashgan tuman ichimlik tarmog'i",
  "Boshqa variant",
];

// 3. Oqova suvlar tarkibidagi moddalar
export const OQOVA_SUV_MODDALARI = [
  "1,5-Dioksiantraxinon (W-III/092)",
  "1,5-Dixlorantraxinon (W-III/102)",
  "1,8-Dioksiantraxinon (W-III/091)",
  "1-Fenil-3-pirazolidon (Fenidon) (W-III/346)",
  "1-Fenil-4,5-dixlorpiridazon-6 (W-III/342)",
];

// 4. Xavfli chiqindilar
export const XAVFLI_CHIQINDI_TURLARI = [
  "Asbotsementning bo'lakli chiqindilari (WM-IV)",
  "G'isht changi (WM-IV)",
];

// 5. Qattiq maishiy chiqindilar
// Diqqat: taqdim etilgan barcha namunalar matn oxiri kesilgan holda berilgan
// edi — hozircha faqat "Boshqa" varianti mavjud, to'liq ro'yxat kelganda
// bu yerga qo'shiladi.
export const QATTIQ_MAISHIY_CHIQINDI_TURLARI = [];

export const TASHLANMA_KATEGORIYALARI = [
  {
    key: 'atmosfera',
    label: "Atmosferaga chiqariladigan ifloslantiruvchi moddalar miqdori",
    optionsField: 'modda',
    options: ATMOSFERA_MODDALARI,
    optionLabel: 'Modda nomi',
    units: [
      { field: 'tonna_yiliga', label: 'tonna/yiliga' },
      { field: 'tonna_soatiga', label: 'tonna/soatiga' },
    ],
  },
  {
    key: 'suv_foydalanish',
    label: 'Suvdan foydalanish',
    optionsField: 'manba',
    options: SUV_MANBA_TURLARI,
    optionLabel: 'Manba turi',
    units: [
      { field: 'm3_kuniga', label: 'm³/kun' },
      { field: 'm3_yiliga', label: 'm³/yil' },
    ],
  },
  {
    key: 'oqova_suv',
    label: "Oqova suvlarning sarfi",
    optionsField: 'modda',
    options: OQOVA_SUV_MODDALARI,
    optionLabel: 'Modda nomi',
    units: [
      { field: 'm3_kuniga', label: 'm³/kun' },
      { field: 'm3_yiliga', label: 'm³/yil' },
    ],
  },
  {
    key: 'xavfli_chiqindi',
    label: "Xavfli chiqindilar miqdori",
    optionsField: 'modda',
    options: XAVFLI_CHIQINDI_TURLARI,
    optionLabel: 'Chiqindi turi',
    units: [
      { field: 'tonna_yiliga', label: 'tonna/yiliga' },
    ],
  },
  {
    key: 'qattiq_maishiy_chiqindi',
    label: "Qattiq maishiy chiqindi miqdori",
    optionsField: 'modda',
    options: QATTIQ_MAISHIY_CHIQINDI_TURLARI,
    optionLabel: 'Chiqindi turi',
    units: [
      { field: 'tonna_yiliga', label: 'tonna/yiliga' },
    ],
  },
];

// Korxonalar (enterprises) uchun namunaviy (seed) ma'lumotlar.
//
// Bu haqiqiy ishlab chiqarish/monitoring bazasi emas — real backend
// ulanmagunicha taqdimotda "real ma'lumot" ko'rinishini berish uchun qo'lda
// (skript yordamida, haqiqiy tuman GeoJSON markazlariga moslab) tuzilgan
// namuna. Har bir yozuv hududini (poligon), INN/nomini va 5 turdagi
// tashlanmasini o'z ichiga oladi. `xaritaFakeData.json` bilan bog'liq emas —
// u fayl o'zgarishsiz saqlanib qolgan, faqat endi xaritada ishlatilmaydi.

export const korxonalarSeed = [
  {
    "id": "kx-0001",
    "inn": "200001013",
    "nomi": "QORAQALPOGISTON SEMENT ZAVODI MCHJ №1",
    "viloyat": "qoraqalpogiston",
    "tuman": "nukus",
    "hudud": [
      [
        42.554741,
        59.459903
      ],
      [
        42.555941,
        59.470103
      ],
      [
        42.550541,
        59.474303
      ],
      [
        42.544541,
        59.471903
      ],
      [
        42.543341,
        59.463503
      ],
      [
        42.548741,
        59.459303
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 22.6,
          "tonna_soatiga": 0.0016
        },
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 29.95,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 31.3,
          "tonna_soatiga": 0.0028
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 91,
          "m3_yiliga": 33215
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 1.7
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0002",
    "inn": "200002026",
    "nomi": "QORAQALPOGISTON METALLURGIYA KOMBINATI OAJ №2",
    "viloyat": "qoraqalpogiston",
    "tuman": "kungrad",
    "hudud": [
      [
        43.487297,
        57.52451
      ],
      [
        43.488697,
        57.53641
      ],
      [
        43.482397,
        57.54131
      ],
      [
        43.475397,
        57.53851
      ],
      [
        43.473997,
        57.52871
      ],
      [
        43.480297,
        57.52381
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 33.95,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 35.3,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 38.43,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 102,
          "m3_yiliga": 37230
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 15,
          "m3_yiliga": 5475
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 2.4
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0003",
    "inn": "200003039",
    "nomi": "QORAQALPOGISTON KIMYO ZAVODI MCHJ №3",
    "viloyat": "qoraqalpogiston",
    "tuman": "khojeyli",
    "hudud": [
      [
        42.510716,
        59.287109
      ],
      [
        42.511716,
        59.295609
      ],
      [
        42.507216,
        59.299109
      ],
      [
        42.502216,
        59.297109
      ],
      [
        42.501216,
        59.290109
      ],
      [
        42.505716,
        59.286609
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 39.3,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 42.43,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 113,
          "m3_yiliga": 41245
        }
      ],
      "oqova_suv": [
        {
          "modda": "1-Fenil-3-pirazolidon (Fenidon) (W-III/346)",
          "m3_kuniga": 20,
          "m3_yiliga": 7300
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 3.1
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0004",
    "inn": "200004052",
    "nomi": "QORAQALPOGISTON NEFT VA GAZ QAYTA ISHLASH KORXONASI MCHJ №4",
    "viloyat": "qoraqalpogiston",
    "tuman": "turtkul",
    "hudud": [
      [
        41.503876,
        61.647346
      ],
      [
        41.505076,
        61.657546
      ],
      [
        41.499676,
        61.661746
      ],
      [
        41.493676,
        61.659346
      ],
      [
        41.492476,
        61.650946
      ],
      [
        41.497876,
        61.646746
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 46.43,
          "tonna_soatiga": 0.0034
        },
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 48.81,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 124,
          "m3_yiliga": 45260
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 3.8
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0005",
    "inn": "200005065",
    "nomi": "QORAQALPOGISTON MASHINASOZLIK ZAVODI OAJ №5",
    "viloyat": "qoraqalpogiston",
    "tuman": "beruniy",
    "hudud": [
      [
        42.03685,
        60.845903
      ],
      [
        42.03785,
        60.854403
      ],
      [
        42.03335,
        60.857903
      ],
      [
        42.02835,
        60.855903
      ],
      [
        42.02735,
        60.848903
      ],
      [
        42.03185,
        60.845403
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 52.81,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 135,
          "m3_yiliga": 49275
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dioksiantraxinon (W-III/092)",
          "m3_kuniga": 30,
          "m3_yiliga": 10950
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0006",
    "inn": "200006078",
    "nomi": "ANDIJON TO'QIMACHILIK KOMBINATI MCHJ №6",
    "viloyat": "andijon",
    "tuman": "andijan",
    "hudud": [
      [
        40.850351,
        72.390265
      ],
      [
        40.851151,
        72.397065
      ],
      [
        40.847551,
        72.399865
      ],
      [
        40.843551,
        72.398265
      ],
      [
        40.842751,
        72.392665
      ],
      [
        40.846351,
        72.389865
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 61.76,
          "tonna_soatiga": 0.0046
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 146,
          "m3_yiliga": 53290
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dixlorantraxinon (W-III/102)",
          "m3_kuniga": 35,
          "m3_yiliga": 12775
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0007",
    "inn": "200007091",
    "nomi": "ANDIJON TERI-KO'NCHILIK FABRIKASI MCHJ №7",
    "viloyat": "andijon",
    "tuman": "asaka",
    "hudud": [
      [
        40.687271,
        72.206494
      ],
      [
        40.687871,
        72.211594
      ],
      [
        40.685171,
        72.213694
      ],
      [
        40.682171,
        72.212494
      ],
      [
        40.681571,
        72.208294
      ],
      [
        40.684271,
        72.206194
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 64.77,
          "tonna_soatiga": 0.0052
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 157,
          "m3_yiliga": 57305
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 40,
          "m3_yiliga": 14600
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0008",
    "inn": "200008104",
    "nomi": "ANDIJON QURILISH MATERIALLARI ZAVODI MCHJ №8",
    "viloyat": "andijon",
    "tuman": "shakhrixan",
    "hudud": [
      [
        40.684643,
        72.056731
      ],
      [
        40.685443,
        72.063531
      ],
      [
        40.681843,
        72.066331
      ],
      [
        40.677843,
        72.064731
      ],
      [
        40.677043,
        72.059131
      ],
      [
        40.680643,
        72.056331
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 66.31,
          "tonna_soatiga": 0.0058
        },
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 74.26,
          "tonna_soatiga": 0.0064
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 168,
          "m3_yiliga": 61320
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 6.6
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0009",
    "inn": "200009117",
    "nomi": "ANDIJON KON BOYITISH KOMBINATI OAJ №9",
    "viloyat": "andijon",
    "tuman": "khanabad",
    "hudud": [
      [
        40.831414,
        73.013345
      ],
      [
        40.832614,
        73.023545
      ],
      [
        40.827214,
        73.027745
      ],
      [
        40.821214,
        73.025345
      ],
      [
        40.820014,
        73.016945
      ],
      [
        40.825414,
        73.012745
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 18.26,
          "tonna_soatiga": 0.0064
        },
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 17.64,
          "tonna_soatiga": 0.001
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 179,
          "m3_yiliga": 65335
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 7.3
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0010",
    "inn": "200010130",
    "nomi": "ANDIJON ISSIQLIK ELEKTR STANSIYASI №10",
    "viloyat": "andijon",
    "tuman": "paxtaabad",
    "hudud": [
      [
        40.953301,
        72.419865
      ],
      [
        40.954501,
        72.430065
      ],
      [
        40.949101,
        72.434265
      ],
      [
        40.943101,
        72.431865
      ],
      [
        40.941901,
        72.423465
      ],
      [
        40.947301,
        72.419265
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 21.64,
          "tonna_soatiga": 0.001
        },
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 26.49,
          "tonna_soatiga": 0.0016
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 190,
          "m3_yiliga": 69350
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0011",
    "inn": "200011143",
    "nomi": "BUXORO SEMENT ZAVODI MCHJ №11",
    "viloyat": "buxoro",
    "tuman": "bukhara",
    "hudud": [
      [
        39.57186,
        64.4962
      ],
      [
        39.57306,
        64.5064
      ],
      [
        39.56766,
        64.5106
      ],
      [
        39.56166,
        64.5082
      ],
      [
        39.56046,
        64.4998
      ],
      [
        39.56586,
        64.4956
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 30.49,
          "tonna_soatiga": 0.0016
        },
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 36.14,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 38.36,
          "tonna_soatiga": 0.0028
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 201,
          "m3_yiliga": 73365
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 8.7
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0012",
    "inn": "200012156",
    "nomi": "BUXORO METALLURGIYA KOMBINATI OAJ №12",
    "viloyat": "buxoro",
    "tuman": "kagan",
    "hudud": [
      [
        39.692001,
        64.569477
      ],
      [
        39.693401,
        64.581377
      ],
      [
        39.687101,
        64.586277
      ],
      [
        39.680101,
        64.583477
      ],
      [
        39.678701,
        64.573677
      ],
      [
        39.685001,
        64.568777
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 40.14,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 42.36,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 40.99,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 212,
          "m3_yiliga": 77380
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 25,
          "m3_yiliga": 9125
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 1
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0013",
    "inn": "200013169",
    "nomi": "BUXORO KIMYO ZAVODI MCHJ №13",
    "viloyat": "buxoro",
    "tuman": "gijduvan",
    "hudud": [
      [
        40.442131,
        64.880718
      ],
      [
        40.443131,
        64.889218
      ],
      [
        40.438631,
        64.892718
      ],
      [
        40.433631,
        64.890718
      ],
      [
        40.432631,
        64.883718
      ],
      [
        40.437131,
        64.880218
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 46.36,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 44.99,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 223,
          "m3_yiliga": 81395
        }
      ],
      "oqova_suv": [
        {
          "modda": "1-Fenil-3-pirazolidon (Fenidon) (W-III/346)",
          "m3_kuniga": 30,
          "m3_yiliga": 10950
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 1.7
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0014",
    "inn": "200014182",
    "nomi": "BUXORO NEFT VA GAZ QAYTA ISHLASH KORXONASI MCHJ №14",
    "viloyat": "buxoro",
    "tuman": "karakul",
    "hudud": [
      [
        39.816531,
        63.199544
      ],
      [
        39.817731,
        63.209744
      ],
      [
        39.812331,
        63.213944
      ],
      [
        39.806331,
        63.211544
      ],
      [
        39.805131,
        63.203144
      ],
      [
        39.810531,
        63.198944
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 48.99,
          "tonna_soatiga": 0.0034
        },
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 51.27,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 234,
          "m3_yiliga": 85410
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 2.4
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0015",
    "inn": "200015195",
    "nomi": "BUXORO MASHINASOZLIK ZAVODI OAJ №15",
    "viloyat": "buxoro",
    "tuman": "vabkent",
    "hudud": [
      [
        39.892792,
        64.503232
      ],
      [
        39.893792,
        64.511732
      ],
      [
        39.889292,
        64.515232
      ],
      [
        39.884292,
        64.513232
      ],
      [
        39.883292,
        64.506232
      ],
      [
        39.887792,
        64.502732
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 55.27,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 245,
          "m3_yiliga": 89425
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dioksiantraxinon (W-III/092)",
          "m3_kuniga": 40,
          "m3_yiliga": 14600
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0016",
    "inn": "200016208",
    "nomi": "FARGONA TO'QIMACHILIK KOMBINATI MCHJ №16",
    "viloyat": "fargona",
    "tuman": "fergana",
    "hudud": [
      [
        40.230601,
        71.738574
      ],
      [
        40.231401,
        71.745374
      ],
      [
        40.227801,
        71.748174
      ],
      [
        40.223801,
        71.746574
      ],
      [
        40.223001,
        71.740974
      ],
      [
        40.226601,
        71.738174
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 67.79,
          "tonna_soatiga": 0.0046
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 256,
          "m3_yiliga": 93440
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dixlorantraxinon (W-III/102)",
          "m3_kuniga": 5,
          "m3_yiliga": 1825
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0017",
    "inn": "200017221",
    "nomi": "FARGONA TERI-KO'NCHILIK FABRIKASI MCHJ №17",
    "viloyat": "fargona",
    "tuman": "kokand",
    "hudud": [
      [
        40.535818,
        70.882961
      ],
      [
        40.536418,
        70.888061
      ],
      [
        40.533718,
        70.890161
      ],
      [
        40.530718,
        70.888961
      ],
      [
        40.530118,
        70.884761
      ],
      [
        40.532818,
        70.882661
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 74.7,
          "tonna_soatiga": 0.0052
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 267,
          "m3_yiliga": 97455
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 10,
          "m3_yiliga": 3650
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0018",
    "inn": "200018234",
    "nomi": "FARGONA QURILISH MATERIALLARI ZAVODI MCHJ №18",
    "viloyat": "fargona",
    "tuman": "margilan",
    "hudud": [
      [
        40.525368,
        71.704996
      ],
      [
        40.526168,
        71.711796
      ],
      [
        40.522568,
        71.714596
      ],
      [
        40.518568,
        71.712996
      ],
      [
        40.517768,
        71.707396
      ],
      [
        40.521368,
        71.704596
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 25.01,
          "tonna_soatiga": 0.0058
        },
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 26.45,
          "tonna_soatiga": 0.0064
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 278,
          "m3_yiliga": 101470
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 5.2
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0019",
    "inn": "200019247",
    "nomi": "FARGONA KON BOYITISH KOMBINATI OAJ №19",
    "viloyat": "fargona",
    "tuman": "kuvasay",
    "hudud": [
      [
        40.359979,
        71.964718
      ],
      [
        40.361179,
        71.974918
      ],
      [
        40.355779,
        71.979118
      ],
      [
        40.349779,
        71.976718
      ],
      [
        40.348579,
        71.968318
      ],
      [
        40.353979,
        71.964118
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 30.45,
          "tonna_soatiga": 0.0064
        },
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 29.14,
          "tonna_soatiga": 0.001
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 289,
          "m3_yiliga": 105485
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 5.9
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0020",
    "inn": "200020260",
    "nomi": "FARGONA ISSIQLIK ELEKTR STANSIYASI №20",
    "viloyat": "fargona",
    "tuman": "rishtan",
    "hudud": [
      [
        40.372927,
        71.251159
      ],
      [
        40.374127,
        71.261359
      ],
      [
        40.368727,
        71.265559
      ],
      [
        40.362727,
        71.263159
      ],
      [
        40.361527,
        71.254759
      ],
      [
        40.366927,
        71.250559
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 33.14,
          "tonna_soatiga": 0.001
        },
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 37.45,
          "tonna_soatiga": 0.0016
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 300,
          "m3_yiliga": 109500
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0021",
    "inn": "200021273",
    "nomi": "JIZZAX SEMENT ZAVODI MCHJ №21",
    "viloyat": "jizzax",
    "tuman": "dzhizak",
    "hudud": [
      [
        40.07369,
        67.855064
      ],
      [
        40.07489,
        67.865264
      ],
      [
        40.06949,
        67.869464
      ],
      [
        40.06349,
        67.867064
      ],
      [
        40.06229,
        67.858664
      ],
      [
        40.06769,
        67.854464
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 41.45,
          "tonna_soatiga": 0.0016
        },
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 41.5,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 48.14,
          "tonna_soatiga": 0.0028
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 311,
          "m3_yiliga": 113515
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 7.3
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0022",
    "inn": "200022286",
    "nomi": "JIZZAX METALLURGIYA KOMBINATI OAJ №22",
    "viloyat": "jizzax",
    "tuman": "gallyaaral",
    "hudud": [
      [
        39.963773,
        67.418083
      ],
      [
        39.965173,
        67.429983
      ],
      [
        39.958873,
        67.434883
      ],
      [
        39.951873,
        67.432083
      ],
      [
        39.950473,
        67.422283
      ],
      [
        39.956773,
        67.417383
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 45.5,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 52.14,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 59.43,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 322,
          "m3_yiliga": 117530
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 35,
          "m3_yiliga": 12775
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 8
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0023",
    "inn": "200023299",
    "nomi": "JIZZAX KIMYO ZAVODI MCHJ №23",
    "viloyat": "jizzax",
    "tuman": "paxtakor",
    "hudud": [
      [
        40.323286,
        68.02971
      ],
      [
        40.324286,
        68.03821
      ],
      [
        40.319786,
        68.04171
      ],
      [
        40.314786,
        68.03971
      ],
      [
        40.313786,
        68.03271
      ],
      [
        40.318286,
        68.02921
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 56.14,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 63.43,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 333,
          "m3_yiliga": 121545
        }
      ],
      "oqova_suv": [
        {
          "modda": "1-Fenil-3-pirazolidon (Fenidon) (W-III/346)",
          "m3_kuniga": 40,
          "m3_yiliga": 14600
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 8.7
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0024",
    "inn": "200024312",
    "nomi": "JIZZAX NEFT VA GAZ QAYTA ISHLASH KORXONASI MCHJ №24",
    "viloyat": "jizzax",
    "tuman": "zafarabad",
    "hudud": [
      [
        40.378347,
        67.721476
      ],
      [
        40.379547,
        67.731676
      ],
      [
        40.374147,
        67.735876
      ],
      [
        40.368147,
        67.733476
      ],
      [
        40.366947,
        67.725076
      ],
      [
        40.372347,
        67.720876
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 67.43,
          "tonna_soatiga": 0.0034
        },
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 61.14,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 344,
          "m3_yiliga": 125560
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 1
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0025",
    "inn": "200025325",
    "nomi": "JIZZAX MASHINASOZLIK ZAVODI OAJ №25",
    "viloyat": "jizzax",
    "tuman": "dustlik",
    "hudud": [
      [
        40.431281,
        68.054607
      ],
      [
        40.432281,
        68.063107
      ],
      [
        40.427781,
        68.066607
      ],
      [
        40.422781,
        68.064607
      ],
      [
        40.421781,
        68.057607
      ],
      [
        40.426281,
        68.054107
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 65.14,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 355,
          "m3_yiliga": 129575
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dioksiantraxinon (W-III/092)",
          "m3_kuniga": 10,
          "m3_yiliga": 3650
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0026",
    "inn": "200026338",
    "nomi": "NAMANGAN TO'QIMACHILIK KOMBINATI MCHJ №26",
    "viloyat": "namangan",
    "tuman": "namangan",
    "hudud": [
      [
        41.034394,
        71.649648
      ],
      [
        41.035194,
        71.656448
      ],
      [
        41.031594,
        71.659248
      ],
      [
        41.027594,
        71.657648
      ],
      [
        41.026794,
        71.652048
      ],
      [
        41.030394,
        71.649248
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 19.19,
          "tonna_soatiga": 0.0046
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 366,
          "m3_yiliga": 133590
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dixlorantraxinon (W-III/102)",
          "m3_kuniga": 15,
          "m3_yiliga": 5475
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0027",
    "inn": "200027351",
    "nomi": "NAMANGAN TERI-KO'NCHILIK FABRIKASI MCHJ №27",
    "viloyat": "namangan",
    "tuman": "chust",
    "hudud": [
      [
        40.995582,
        71.105696
      ],
      [
        40.996182,
        71.110796
      ],
      [
        40.993482,
        71.112896
      ],
      [
        40.990482,
        71.111696
      ],
      [
        40.989882,
        71.107496
      ],
      [
        40.992582,
        71.105396
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 19.93,
          "tonna_soatiga": 0.0052
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 377,
          "m3_yiliga": 137605
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 20,
          "m3_yiliga": 7300
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0028",
    "inn": "200028364",
    "nomi": "NAMANGAN QURILISH MATERIALLARI ZAVODI MCHJ №28",
    "viloyat": "namangan",
    "tuman": "pap",
    "hudud": [
      [
        41.117532,
        70.850412
      ],
      [
        41.118332,
        70.857212
      ],
      [
        41.114732,
        70.860012
      ],
      [
        41.110732,
        70.858412
      ],
      [
        41.109932,
        70.852812
      ],
      [
        41.113532,
        70.850012
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 33.97,
          "tonna_soatiga": 0.0058
        },
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 36.72,
          "tonna_soatiga": 0.0064
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 388,
          "m3_yiliga": 141620
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 3.8
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0029",
    "inn": "200029377",
    "nomi": "NAMANGAN KON BOYITISH KOMBINATI OAJ №29",
    "viloyat": "namangan",
    "tuman": "chartak",
    "hudud": [
      [
        41.288872,
        71.780019
      ],
      [
        41.290072,
        71.790219
      ],
      [
        41.284672,
        71.794419
      ],
      [
        41.278672,
        71.792019
      ],
      [
        41.277472,
        71.783619
      ],
      [
        41.282872,
        71.779419
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 40.72,
          "tonna_soatiga": 0.0064
        },
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 44.93,
          "tonna_soatiga": 0.001
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 399,
          "m3_yiliga": 145635
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 4.5
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0030",
    "inn": "200030390",
    "nomi": "NAMANGAN ISSIQLIK ELEKTR STANSIYASI №30",
    "viloyat": "namangan",
    "tuman": "turakurgan",
    "hudud": [
      [
        41.04808,
        71.403623
      ],
      [
        41.04928,
        71.413823
      ],
      [
        41.04388,
        71.418023
      ],
      [
        41.03788,
        71.415623
      ],
      [
        41.03668,
        71.407223
      ],
      [
        41.04208,
        71.403023
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 48.93,
          "tonna_soatiga": 0.001
        },
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 44.51,
          "tonna_soatiga": 0.0016
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 410,
          "m3_yiliga": 149650
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0031",
    "inn": "200031403",
    "nomi": "NAVOIY SEMENT ZAVODI MCHJ №31",
    "viloyat": "navoiy",
    "tuman": "navoi",
    "hudud": [
      [
        40.013997,
        65.357213
      ],
      [
        40.015197,
        65.367413
      ],
      [
        40.009797,
        65.371613
      ],
      [
        40.003797,
        65.369213
      ],
      [
        40.002597,
        65.360813
      ],
      [
        40.007997,
        65.356613
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 48.51,
          "tonna_soatiga": 0.0016
        },
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 59.36,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 62.53,
          "tonna_soatiga": 0.0028
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 421,
          "m3_yiliga": 153665
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 5.9
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0032",
    "inn": "200032416",
    "nomi": "NAVOIY METALLURGIYA KOMBINATI OAJ №32",
    "viloyat": "navoiy",
    "tuman": "zarafshan",
    "hudud": [
      [
        41.555094,
        64.200898
      ],
      [
        41.556494,
        64.212798
      ],
      [
        41.550194,
        64.217698
      ],
      [
        41.543194,
        64.214898
      ],
      [
        41.541794,
        64.205098
      ],
      [
        41.548094,
        64.200198
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 63.36,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 66.53,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 61.66,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 432,
          "m3_yiliga": 157680
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 5,
          "m3_yiliga": 1825
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 6.6
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0033",
    "inn": "200033429",
    "nomi": "NAVOIY KIMYO ZAVODI MCHJ №33",
    "viloyat": "navoiy",
    "tuman": "kiziltepa",
    "hudud": [
      [
        39.850879,
        64.913085
      ],
      [
        39.851879,
        64.921585
      ],
      [
        39.847379,
        64.925085
      ],
      [
        39.842379,
        64.923085
      ],
      [
        39.841379,
        64.916085
      ],
      [
        39.845879,
        64.912585
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 70.53,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 65.66,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 443,
          "m3_yiliga": 161695
        }
      ],
      "oqova_suv": [
        {
          "modda": "1-Fenil-3-pirazolidon (Fenidon) (W-III/346)",
          "m3_kuniga": 10,
          "m3_yiliga": 3650
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 7.3
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0034",
    "inn": "200034442",
    "nomi": "NAVOIY NEFT VA GAZ QAYTA ISHLASH KORXONASI MCHJ №34",
    "viloyat": "navoiy",
    "tuman": "uchkuduk",
    "hudud": [
      [
        42.248661,
        63.159182
      ],
      [
        42.249861,
        63.169382
      ],
      [
        42.244461,
        63.173582
      ],
      [
        42.238461,
        63.171182
      ],
      [
        42.237261,
        63.162782
      ],
      [
        42.242661,
        63.158582
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 69.66,
          "tonna_soatiga": 0.0034
        },
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 16.12,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 454,
          "m3_yiliga": 165710
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 8
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0035",
    "inn": "200035455",
    "nomi": "NAVOIY MASHINASOZLIK ZAVODI OAJ №35",
    "viloyat": "navoiy",
    "tuman": "karmana",
    "hudud": [
      [
        40.015769,
        65.218725
      ],
      [
        40.016769,
        65.227225
      ],
      [
        40.012269,
        65.230725
      ],
      [
        40.007269,
        65.228725
      ],
      [
        40.006269,
        65.221725
      ],
      [
        40.010769,
        65.218225
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 20.12,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 465,
          "m3_yiliga": 169725
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dioksiantraxinon (W-III/092)",
          "m3_kuniga": 20,
          "m3_yiliga": 7300
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0036",
    "inn": "200036468",
    "nomi": "QASHQADARYO TO'QIMACHILIK KOMBINATI MCHJ №36",
    "viloyat": "qashqadaryo",
    "tuman": "karshi",
    "hudud": [
      [
        38.724127,
        65.806904
      ],
      [
        38.724927,
        65.813704
      ],
      [
        38.721327,
        65.816504
      ],
      [
        38.717327,
        65.814904
      ],
      [
        38.716527,
        65.809304
      ],
      [
        38.720127,
        65.806504
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 26.29,
          "tonna_soatiga": 0.0046
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 476,
          "m3_yiliga": 173740
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dixlorantraxinon (W-III/102)",
          "m3_kuniga": 25,
          "m3_yiliga": 9125
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0037",
    "inn": "200037481",
    "nomi": "QASHQADARYO TERI-KO'NCHILIK FABRIKASI MCHJ №37",
    "viloyat": "qashqadaryo",
    "tuman": "shakhrisabz",
    "hudud": [
      [
        39.09318,
        66.86142
      ],
      [
        39.09378,
        66.86652
      ],
      [
        39.09108,
        66.86862
      ],
      [
        39.08808,
        66.86742
      ],
      [
        39.08748,
        66.86322
      ],
      [
        39.09018,
        66.86112
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 35.56,
          "tonna_soatiga": 0.0052
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 87,
          "m3_yiliga": 31755
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 30,
          "m3_yiliga": 10950
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0038",
    "inn": "200038494",
    "nomi": "QASHQADARYO QURILISH MATERIALLARI ZAVODI MCHJ №38",
    "viloyat": "qashqadaryo",
    "tuman": "mubarek",
    "hudud": [
      [
        39.216217,
        65.281538
      ],
      [
        39.217017,
        65.288338
      ],
      [
        39.213417,
        65.291138
      ],
      [
        39.209417,
        65.289538
      ],
      [
        39.208617,
        65.283938
      ],
      [
        39.212217,
        65.281138
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 41.19,
          "tonna_soatiga": 0.0058
        },
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 46.37,
          "tonna_soatiga": 0.0064
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 98,
          "m3_yiliga": 35770
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 2.4
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0039",
    "inn": "200039507",
    "nomi": "QASHQADARYO KON BOYITISH KOMBINATI OAJ №39",
    "viloyat": "qashqadaryo",
    "tuman": "guzar",
    "hudud": [
      [
        38.549307,
        66.175323
      ],
      [
        38.550507,
        66.185523
      ],
      [
        38.545107,
        66.189723
      ],
      [
        38.539107,
        66.187323
      ],
      [
        38.537907,
        66.178923
      ],
      [
        38.543307,
        66.174723
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 50.37,
          "tonna_soatiga": 0.0064
        },
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 55.96,
          "tonna_soatiga": 0.001
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 109,
          "m3_yiliga": 39785
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 3.1
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0040",
    "inn": "200040520",
    "nomi": "QASHQADARYO ISSIQLIK ELEKTR STANSIYASI №40",
    "viloyat": "qashqadaryo",
    "tuman": "kitab",
    "hudud": [
      [
        39.267715,
        67.125824
      ],
      [
        39.268915,
        67.136024
      ],
      [
        39.263515,
        67.140224
      ],
      [
        39.257515,
        67.137824
      ],
      [
        39.256315,
        67.129424
      ],
      [
        39.261715,
        67.125224
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 59.96,
          "tonna_soatiga": 0.001
        },
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 59.74,
          "tonna_soatiga": 0.0016
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 120,
          "m3_yiliga": 43800
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0041",
    "inn": "200041533",
    "nomi": "SAMARQAND SEMENT ZAVODI MCHJ №41",
    "viloyat": "samarqand",
    "tuman": "samarkand",
    "hudud": [
      [
        39.647668,
        66.969594
      ],
      [
        39.648868,
        66.979794
      ],
      [
        39.643468,
        66.983994
      ],
      [
        39.637468,
        66.981594
      ],
      [
        39.636268,
        66.973194
      ],
      [
        39.641668,
        66.968994
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 63.74,
          "tonna_soatiga": 0.0016
        },
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 63.16,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 63.47,
          "tonna_soatiga": 0.0028
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 131,
          "m3_yiliga": 47815
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 4.5
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0042",
    "inn": "200042546",
    "nomi": "SAMARQAND METALLURGIYA KOMBINATI OAJ №42",
    "viloyat": "samarqand",
    "tuman": "kattakurgan",
    "hudud": [
      [
        39.911436,
        66.128429
      ],
      [
        39.912836,
        66.140329
      ],
      [
        39.906536,
        66.145229
      ],
      [
        39.899536,
        66.142429
      ],
      [
        39.898136,
        66.132629
      ],
      [
        39.904436,
        66.127729
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 67.16,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 67.47,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 15.91,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 142,
          "m3_yiliga": 51830
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 15,
          "m3_yiliga": 5475
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 5.2
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0043",
    "inn": "200043559",
    "nomi": "SAMARQAND KIMYO ZAVODI MCHJ №43",
    "viloyat": "samarqand",
    "tuman": "urgut",
    "hudud": [
      [
        39.337034,
        67.191112
      ],
      [
        39.338034,
        67.199612
      ],
      [
        39.333534,
        67.203112
      ],
      [
        39.328534,
        67.201112
      ],
      [
        39.327534,
        67.194112
      ],
      [
        39.332034,
        67.190612
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 11.47,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 19.91,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 153,
          "m3_yiliga": 55845
        }
      ],
      "oqova_suv": [
        {
          "modda": "1-Fenil-3-pirazolidon (Fenidon) (W-III/346)",
          "m3_kuniga": 20,
          "m3_yiliga": 7300
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 5.9
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0044",
    "inn": "200044572",
    "nomi": "SAMARQAND NEFT VA GAZ QAYTA ISHLASH KORXONASI MCHJ №44",
    "viloyat": "samarqand",
    "tuman": "bulungur",
    "hudud": [
      [
        39.705045,
        67.314926
      ],
      [
        39.706245,
        67.325126
      ],
      [
        39.700845,
        67.329326
      ],
      [
        39.694845,
        67.326926
      ],
      [
        39.693645,
        67.318526
      ],
      [
        39.699045,
        67.314326
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 23.91,
          "tonna_soatiga": 0.0034
        },
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 21.05,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 164,
          "m3_yiliga": 59860
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 6.6
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0045",
    "inn": "200045585",
    "nomi": "SAMARQAND MASHINASOZLIK ZAVODI OAJ №45",
    "viloyat": "samarqand",
    "tuman": "pastdargom",
    "hudud": [
      [
        39.634813,
        66.63556
      ],
      [
        39.635813,
        66.64406
      ],
      [
        39.631313,
        66.64756
      ],
      [
        39.626313,
        66.64556
      ],
      [
        39.625313,
        66.63856
      ],
      [
        39.629813,
        66.63506
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 25.05,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 175,
          "m3_yiliga": 63875
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dioksiantraxinon (W-III/092)",
          "m3_kuniga": 30,
          "m3_yiliga": 10950
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0046",
    "inn": "200046598",
    "nomi": "SIRDARYO TO'QIMACHILIK KOMBINATI MCHJ №46",
    "viloyat": "sirdaryo",
    "tuman": "gulistan",
    "hudud": [
      [
        40.49084,
        68.713055
      ],
      [
        40.49164,
        68.719855
      ],
      [
        40.48804,
        68.722655
      ],
      [
        40.48404,
        68.721055
      ],
      [
        40.48324,
        68.715455
      ],
      [
        40.48684,
        68.712655
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 38.42,
          "tonna_soatiga": 0.0046
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 186,
          "m3_yiliga": 67890
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dixlorantraxinon (W-III/102)",
          "m3_kuniga": 35,
          "m3_yiliga": 12775
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0047",
    "inn": "200047611",
    "nomi": "SIRDARYO TERI-KO'NCHILIK FABRIKASI MCHJ №47",
    "viloyat": "sirdaryo",
    "tuman": "yangiyer",
    "hudud": [
      [
        40.216477,
        68.801908
      ],
      [
        40.217077,
        68.807008
      ],
      [
        40.214377,
        68.809108
      ],
      [
        40.211377,
        68.807908
      ],
      [
        40.210777,
        68.803708
      ],
      [
        40.213477,
        68.801608
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 40.21,
          "tonna_soatiga": 0.0052
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 197,
          "m3_yiliga": 71905
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 40,
          "m3_yiliga": 14600
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0048",
    "inn": "200048624",
    "nomi": "SIRDARYO QURILISH MATERIALLARI ZAVODI MCHJ №48",
    "viloyat": "sirdaryo",
    "tuman": "shirin",
    "hudud": [
      [
        40.228681,
        69.069608
      ],
      [
        40.229481,
        69.076408
      ],
      [
        40.225881,
        69.079208
      ],
      [
        40.221881,
        69.077608
      ],
      [
        40.221081,
        69.072008
      ],
      [
        40.224681,
        69.069208
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 51.83,
          "tonna_soatiga": 0.0058
        },
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 54.53,
          "tonna_soatiga": 0.0064
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 208,
          "m3_yiliga": 75920
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 1
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0049",
    "inn": "200049637",
    "nomi": "SIRDARYO KON BOYITISH KOMBINATI OAJ №49",
    "viloyat": "sirdaryo",
    "tuman": "akaltin",
    "hudud": [
      [
        40.555544,
        68.263454
      ],
      [
        40.556744,
        68.273654
      ],
      [
        40.551344,
        68.277854
      ],
      [
        40.545344,
        68.275454
      ],
      [
        40.544144,
        68.267054
      ],
      [
        40.549544,
        68.262854
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 58.53,
          "tonna_soatiga": 0.0064
        },
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 58.34,
          "tonna_soatiga": 0.001
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 219,
          "m3_yiliga": 79935
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 1.7
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0050",
    "inn": "200050650",
    "nomi": "SIRDARYO ISSIQLIK ELEKTR STANSIYASI №50",
    "viloyat": "sirdaryo",
    "tuman": "saykhunabad",
    "hudud": [
      [
        40.625497,
        68.835733
      ],
      [
        40.626697,
        68.845933
      ],
      [
        40.621297,
        68.850133
      ],
      [
        40.615297,
        68.847733
      ],
      [
        40.614097,
        68.839333
      ],
      [
        40.619497,
        68.835133
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 62.34,
          "tonna_soatiga": 0.001
        },
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 72.68,
          "tonna_soatiga": 0.0016
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 230,
          "m3_yiliga": 83950
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0051",
    "inn": "200051663",
    "nomi": "SURXONDARYO SEMENT ZAVODI MCHJ №51",
    "viloyat": "surxondaryo",
    "tuman": "termez",
    "hudud": [
      [
        37.332694,
        67.474985
      ],
      [
        37.333894,
        67.485185
      ],
      [
        37.328494,
        67.489385
      ],
      [
        37.322494,
        67.486985
      ],
      [
        37.321294,
        67.478585
      ],
      [
        37.326694,
        67.474385
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 76.68,
          "tonna_soatiga": 0.0016
        },
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 14.55,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 16.99,
          "tonna_soatiga": 0.0028
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 241,
          "m3_yiliga": 87965
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 3.1
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0052",
    "inn": "200052676",
    "nomi": "SURXONDARYO METALLURGIYA KOMBINATI OAJ №52",
    "viloyat": "surxondaryo",
    "tuman": "denau",
    "hudud": [
      [
        38.295765,
        67.808841
      ],
      [
        38.297165,
        67.820741
      ],
      [
        38.290865,
        67.825641
      ],
      [
        38.283865,
        67.822841
      ],
      [
        38.282465,
        67.813041
      ],
      [
        38.288765,
        67.808141
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 18.55,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 20.99,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 22.4,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 252,
          "m3_yiliga": 91980
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 25,
          "m3_yiliga": 9125
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 3.8
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0053",
    "inn": "200053689",
    "nomi": "SURXONDARYO KIMYO ZAVODI MCHJ №53",
    "viloyat": "surxondaryo",
    "tuman": "sherabad",
    "hudud": [
      [
        37.680696,
        66.890764
      ],
      [
        37.681696,
        66.899264
      ],
      [
        37.677196,
        66.902764
      ],
      [
        37.672196,
        66.900764
      ],
      [
        37.671196,
        66.893764
      ],
      [
        37.675696,
        66.890264
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 24.99,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 26.4,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 263,
          "m3_yiliga": 95995
        }
      ],
      "oqova_suv": [
        {
          "modda": "1-Fenil-3-pirazolidon (Fenidon) (W-III/346)",
          "m3_kuniga": 30,
          "m3_yiliga": 10950
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 4.5
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0054",
    "inn": "200054702",
    "nomi": "SURXONDARYO NEFT VA GAZ QAYTA ISHLASH KORXONASI MCHJ №54",
    "viloyat": "surxondaryo",
    "tuman": "shurchi",
    "hudud": [
      [
        37.935727,
        67.84754
      ],
      [
        37.936927,
        67.85774
      ],
      [
        37.931527,
        67.86194
      ],
      [
        37.925527,
        67.85954
      ],
      [
        37.924327,
        67.85114
      ],
      [
        37.929727,
        67.84694
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 30.4,
          "tonna_soatiga": 0.0034
        },
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 32.58,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 274,
          "m3_yiliga": 100010
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 5.2
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0055",
    "inn": "200055715",
    "nomi": "SURXONDARYO MASHINASOZLIK ZAVODI OAJ №55",
    "viloyat": "surxondaryo",
    "tuman": "angor",
    "hudud": [
      [
        37.422051,
        67.252444
      ],
      [
        37.423051,
        67.260944
      ],
      [
        37.418551,
        67.264444
      ],
      [
        37.413551,
        67.262444
      ],
      [
        37.412551,
        67.255444
      ],
      [
        37.417051,
        67.251944
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 36.58,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 285,
          "m3_yiliga": 104025
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dioksiantraxinon (W-III/092)",
          "m3_kuniga": 40,
          "m3_yiliga": 14600
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0056",
    "inn": "200056728",
    "nomi": "TOSHKENT TO'QIMACHILIK KOMBINATI MCHJ №56",
    "viloyat": "toshkent",
    "tuman": "chirchik",
    "hudud": [
      [
        41.453791,
        69.577203
      ],
      [
        41.454591,
        69.584003
      ],
      [
        41.450991,
        69.586803
      ],
      [
        41.446991,
        69.585203
      ],
      [
        41.446191,
        69.579603
      ],
      [
        41.449791,
        69.576803
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 47.57,
          "tonna_soatiga": 0.0046
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 296,
          "m3_yiliga": 108040
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dixlorantraxinon (W-III/102)",
          "m3_kuniga": 5,
          "m3_yiliga": 1825
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0057",
    "inn": "200057741",
    "nomi": "TOSHKENT TERI-KO'NCHILIK FABRIKASI MCHJ №57",
    "viloyat": "toshkent",
    "tuman": "angren",
    "hudud": [
      [
        41.009047,
        70.09426
      ],
      [
        41.009647,
        70.09936
      ],
      [
        41.006947,
        70.10146
      ],
      [
        41.003947,
        70.10026
      ],
      [
        41.003347,
        70.09606
      ],
      [
        41.006047,
        70.09396
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 54.14,
          "tonna_soatiga": 0.0052
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 307,
          "m3_yiliga": 112055
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 10,
          "m3_yiliga": 3650
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0058",
    "inn": "200058754",
    "nomi": "TOSHKENT QURILISH MATERIALLARI ZAVODI MCHJ №58",
    "viloyat": "toshkent",
    "tuman": "almalik",
    "hudud": [
      [
        40.868645,
        69.588136
      ],
      [
        40.869445,
        69.594936
      ],
      [
        40.865845,
        69.597736
      ],
      [
        40.861845,
        69.596136
      ],
      [
        40.861045,
        69.590536
      ],
      [
        40.864645,
        69.587736
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 65.67,
          "tonna_soatiga": 0.0058
        },
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 68.64,
          "tonna_soatiga": 0.0064
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 318,
          "m3_yiliga": 116070
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 8
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0059",
    "inn": "200059767",
    "nomi": "TOSHKENT KON BOYITISH KOMBINATI OAJ №59",
    "viloyat": "toshkent",
    "tuman": "bekabad",
    "hudud": [
      [
        40.493263,
        69.228947
      ],
      [
        40.494463,
        69.239147
      ],
      [
        40.489063,
        69.243347
      ],
      [
        40.483063,
        69.240947
      ],
      [
        40.481863,
        69.232547
      ],
      [
        40.487263,
        69.228347
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Dietilsimob (simobga hisoblaganda) (A-I 008)",
          "tonna_yiliga": 72.64,
          "tonna_soatiga": 0.0064
        },
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 69.7,
          "tonna_soatiga": 0.001
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 329,
          "m3_yiliga": 120085
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 8.7
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0060",
    "inn": "200060780",
    "nomi": "TOSHKENT ISSIQLIK ELEKTR STANSIYASI №60",
    "viloyat": "toshkent",
    "tuman": "akhangaran",
    "hudud": [
      [
        40.968004,
        69.9322
      ],
      [
        40.969204,
        69.9424
      ],
      [
        40.963804,
        69.9466
      ],
      [
        40.957804,
        69.9442
      ],
      [
        40.956604,
        69.9358
      ],
      [
        40.962004,
        69.9316
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilenimin (A-I 039)",
          "tonna_yiliga": 13.7,
          "tonna_soatiga": 0.001
        },
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 13.38,
          "tonna_soatiga": 0.0016
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 340,
          "m3_yiliga": 124100
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0061",
    "inn": "200061793",
    "nomi": "TOSHKENT SEMENT ZAVODI MCHJ №61",
    "viloyat": "toshkent",
    "tuman": "yangiyul",
    "hudud": [
      [
        41.058569,
        69.03785
      ],
      [
        41.059769,
        69.04805
      ],
      [
        41.054369,
        69.05225
      ],
      [
        41.048369,
        69.04985
      ],
      [
        41.047169,
        69.04145
      ],
      [
        41.052569,
        69.03725
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Etilensulfid (A-I 040)",
          "tonna_yiliga": 17.38,
          "tonna_soatiga": 0.0016
        },
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 24.43,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 26.59,
          "tonna_soatiga": 0.0028
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 351,
          "m3_yiliga": 128115
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 1.7
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0062",
    "inn": "200062806",
    "nomi": "XORAZM METALLURGIYA KOMBINATI OAJ №62",
    "viloyat": "xorazm",
    "tuman": "urgench",
    "hudud": [
      [
        41.514948,
        60.592976
      ],
      [
        41.516348,
        60.604876
      ],
      [
        41.510048,
        60.609776
      ],
      [
        41.503048,
        60.606976
      ],
      [
        41.501648,
        60.597176
      ],
      [
        41.507948,
        60.592276
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Azot dioksidi (A-II 001)",
          "tonna_yiliga": 28.43,
          "tonna_soatiga": 0.0022
        },
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 30.59,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 38.57,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 362,
          "m3_yiliga": 132130
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,8-Dioksiantraxinon (W-III/091)",
          "m3_kuniga": 35,
          "m3_yiliga": 12775
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 2.4
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0063",
    "inn": "200063819",
    "nomi": "XORAZM KIMYO ZAVODI MCHJ №63",
    "viloyat": "xorazm",
    "tuman": "khiva",
    "hudud": [
      [
        41.349221,
        60.300389
      ],
      [
        41.350221,
        60.308889
      ],
      [
        41.345721,
        60.312389
      ],
      [
        41.340721,
        60.310389
      ],
      [
        41.339721,
        60.303389
      ],
      [
        41.344221,
        60.299889
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Geksaxlorsikloheksan (Geksaxloran) (A-I 004)",
          "tonna_yiliga": 34.59,
          "tonna_soatiga": 0.0028
        },
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 42.57,
          "tonna_soatiga": 0.0034
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Boshqa variant",
          "m3_kuniga": 373,
          "m3_yiliga": 136145
        }
      ],
      "oqova_suv": [
        {
          "modda": "1-Fenil-3-pirazolidon (Fenidon) (W-III/346)",
          "m3_kuniga": 40,
          "m3_yiliga": 14600
        }
      ],
      "xavfli_chiqindi": [
        {
          "modda": "G'isht changi (WM-IV)",
          "tonna_yiliga": 3.1
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0064",
    "inn": "200064832",
    "nomi": "XORAZM NEFT VA GAZ QAYTA ISHLASH KORXONASI MCHJ №64",
    "viloyat": "xorazm",
    "tuman": "shavat",
    "hudud": [
      [
        41.727992,
        60.225431
      ],
      [
        41.729192,
        60.235631
      ],
      [
        41.723792,
        60.239831
      ],
      [
        41.717792,
        60.237431
      ],
      [
        41.716592,
        60.229031
      ],
      [
        41.721992,
        60.224831
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Alfa-naftoxinon (A-I 017)",
          "tonna_yiliga": 46.57,
          "tonna_soatiga": 0.0034
        },
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 47.09,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Yer osti qudug'i",
          "m3_kuniga": 384,
          "m3_yiliga": 140160
        }
      ],
      "oqova_suv": [],
      "xavfli_chiqindi": [
        {
          "modda": "Asbotsementning bo'lakli chiqindilari (WM-IV)",
          "tonna_yiliga": 3.8
        }
      ],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0065",
    "inn": "200065845",
    "nomi": "XORAZM MASHINASOZLIK ZAVODI OAJ №65",
    "viloyat": "xorazm",
    "tuman": "khazarasp",
    "hudud": [
      [
        40.9785,
        61.678337
      ],
      [
        40.9795,
        61.686837
      ],
      [
        40.975,
        61.690337
      ],
      [
        40.97,
        61.688337
      ],
      [
        40.969,
        61.681337
      ],
      [
        40.9735,
        61.677837
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Bariy karbonati (Ba ga hisoblaganda) (A-I 001)",
          "tonna_yiliga": 51.09,
          "tonna_soatiga": 0.004
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Kanal, daryo",
          "m3_kuniga": 395,
          "m3_yiliga": 144175
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dioksiantraxinon (W-III/092)",
          "m3_kuniga": 10,
          "m3_yiliga": 3650
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  },
  {
    "id": "kx-0066",
    "inn": "200066858",
    "nomi": "XORAZM TO'QIMACHILIK KOMBINATI MCHJ №66",
    "viloyat": "xorazm",
    "tuman": "gurlen",
    "hudud": [
      [
        41.800595,
        60.25347
      ],
      [
        41.801395,
        60.26027
      ],
      [
        41.797795,
        60.26307
      ],
      [
        41.793795,
        60.26147
      ],
      [
        41.792995,
        60.25587
      ],
      [
        41.796595,
        60.25307
      ]
    ],
    "tashlanmalar": {
      "atmosfera": [
        {
          "modda": "Benz(a)piren (A-I 002)",
          "tonna_yiliga": 53.31,
          "tonna_soatiga": 0.0046
        }
      ],
      "suv_foydalanish": [
        {
          "manba": "Markazlashgan tuman ichimlik tarmog'i",
          "m3_kuniga": 406,
          "m3_yiliga": 148190
        }
      ],
      "oqova_suv": [
        {
          "modda": "1,5-Dixlorantraxinon (W-III/102)",
          "m3_kuniga": 15,
          "m3_yiliga": 5475
        }
      ],
      "xavfli_chiqindi": [],
      "qattiq_maishiy_chiqindi": []
    }
  }
];

let localIdCounter = korxonalarSeed.length + 1;

export function generateKorxonaId() {
  localIdCounter += 1;
  return `kx-local-${localIdCounter}`;
}

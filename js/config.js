/* =========================================================
   TETAPAN KEDAI — ubah di sini sahaja.
   Semua harga dalam Ringgit Malaysia (RM).
   ========================================================= */
const CONFIG = {
  namaKedai: "Roy Printing",
  slogan: "Sticker custom berkualiti, siap cepat.",

  // Nombor WhatsApp format antarabangsa, tanpa "+" atau "-" (contoh: 60123456789)
  noWhatsApp: "60123456789",

  // Caj minimum satu tempahan
  hargaMinimum: 20,

  // Jenis sticker. "kadar" = harga per cm² untuk setiap keping.
  jenisSticker: [
    { id: "mirrorkote", nama: "Mirrorkote (Kertas)", kadar: 0.010, info: "Jimat, sesuai label produk kering & doorgift. Tidak kalis air." },
    { id: "vinyl",      nama: "Vinyl Putih",         kadar: 0.018, info: "Kalis air & tahan lama. Paling popular untuk label botol & bekas." },
    { id: "transparent",nama: "Vinyl Lutsinar",      kadar: 0.022, info: "Latar telus, nampak premium atas botol kaca & bekas jernih." },
    { id: "kraft",      nama: "Kertas Kraft",        kadar: 0.014, info: "Tekstur coklat rustic — sesuai produk homemade & organik." },
    { id: "hologram",   nama: "Hologram",            kadar: 0.032, info: "Kilauan pelangi yang menarik perhatian. Untuk branding mewah." },
  ],

  // Bentuk potongan. "faktor" didarab dengan harga asas.
  bentuk: [
    { id: "bulat",   nama: "Bulat",              faktor: 1.0 },
    { id: "segi",    nama: "Segi Empat",         faktor: 1.0 },
    { id: "bucu",    nama: "Segi Empat Bucu Bulat", faktor: 1.05 },
    { id: "diecut",  nama: "Die-Cut (ikut bentuk design)", faktor: 1.25 },
  ],

  // Laminasi. "kadar" = tambahan harga per cm².
  laminasi: [
    { id: "tiada",  nama: "Tiada",            kadar: 0 },
    { id: "glossy", nama: "Glossy (berkilat)", kadar: 0.004 },
    { id: "matte",  nama: "Matte (doff)",     kadar: 0.005 },
  ],

  // Saiz pilihan (cm). Pelanggan juga boleh masukkan saiz sendiri.
  saizPreset: [
    { w: 3, h: 3 }, { w: 4, h: 4 }, { w: 5, h: 5 },
    { w: 7, h: 5 }, { w: 7, h: 7 }, { w: 10, h: 10 },
  ],

  // Diskaun ikut kuantiti (min = kuantiti minimum untuk dapat diskaun)
  diskaunKuantiti: [
    { min: 1000, diskaun: 0.30 },
    { min: 500,  diskaun: 0.20 },
    { min: 300,  diskaun: 0.15 },
    { min: 100,  diskaun: 0.10 },
  ],

  kuantitiPreset: [50, 100, 300, 500, 1000],

  // Caj design (jika pelanggan minta kami buat/ubah design)
  cajDesign: 15,
};

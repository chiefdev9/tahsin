// ==========================================
// STATE & KONSTANTA GLOBAL
// ==========================================

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlkxd8dmQkdKm720azA9vog-nI06aVC8AX-c0gKMZx7Q2XBIbO31C4em-DKsSj7GdqtluPVfRYp4Gk/pub?gid=1481426139&single=true&output=csv";

export const GURU_KHUSUS_PAGI = ["Retno", "Yani", "Tris"];

export let muridList = [];

// ==========================================
// HELPER PENYIMPANAN LOKAL (LOCAL STORAGE)
// ==========================================
export function saveLastState(kunci, nilai) {
  try {
    localStorage.setItem(`tahsin_${kunci}`, JSON.stringify(nilai));
  } catch (e) {
    console.error("Gagal menyimpan state lokal:", e);
  }
}

export function loadLastState(kunci, nilaiDefault) {
  try {
    const saved = localStorage.getItem(`tahsin_${kunci}`);
    return saved ? JSON.parse(saved) : nilaiDefault;
  } catch (e) {
    console.error("Gagal membaca state lokal:", e);
    return nilaiDefault;
  }
}

// ==========================================
// FILTER STATE (DENGAN MEMULIHKAN POSISI TERAKHIR)
// ==========================================
export let filterState = {
  guru: loadLastState("guru", "Vera"),
  kategori: loadLastState("kategori", "Halaman"),
  sesi: loadLastState("sesi", "Pagi"),
};

// ==========================================
// MUTATOR STATE
// ==========================================

export function setMuridList(newList) {
  muridList = newList;
}

export function cleanNamaGuru(nama) {
  if (!nama) return "";
  return nama
    .replace(/\b(ustaz|ustazah|ustadz|ustadzah|ust|ustz)\b/gi, "")
    .trim();
}

export function updateFilterState(key, value) {
  if (key in filterState) {
    filterState[key] = value;
    // Simpan pilihan ke memori lokal secara otomatis
    saveLastState(key, value);
  }

  // Aturan Khusus: Guru khusus pagi otomatis mengunci sesi ke 'Pagi'
  if (GURU_KHUSUS_PAGI.includes(filterState.guru)) {
    filterState.sesi = "Pagi";
    saveLastState("sesi", "Pagi");
  }
}

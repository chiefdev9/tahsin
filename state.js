// ==========================================
// STATE & KONSTANTA GLOBAL
// ==========================================

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlkxd8dmQkdKm720azA9vog-nI06aVC8AX-c0gKMZx7Q2XBIbO31C4em-DKsSj7GdqtluPVfRYp4Gk/pub?gid=1481426139&single=true&output=csv";

export const GURU_KHUSUS_PAGI = ["Retno", "Yani", "Tris"];

export let muridList = [];

// Ambil data filter terakhir dari localStorage (jika ada)
const savedState = JSON.parse(localStorage.getItem("filterState")) || {};

export let filterState = {
  guru: savedState.guru || "Vera",
  kategori: savedState.kategori || "Halaman",
  sesi: savedState.sesi || "Pagi",
};

// ==========================================
// HELPER & MUTATOR STATE
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

// FUNGSI UPDATE FILTER STATE (DIGABUNG JADI SATU)
export function updateFilterState(key, value) {
  if (key in filterState) {
    filterState[key] = value;
  }

  // Aturan Khusus: Guru khusus pagi otomatis mengunci sesi ke 'Pagi'
  if (GURU_KHUSUS_PAGI.includes(filterState.guru)) {
    filterState.sesi = "Pagi";
  }

  // Simpan kondisi filter paling baru ke localStorage
  localStorage.setItem("filterState", JSON.stringify(filterState));
}

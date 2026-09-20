// ==========================================
// STATE & KONSTANTA GLOBAL
// ==========================================

export const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlkxd8dmQkdKm720azA9vog-nI06aVC8AX-c0gKMZx7Q2XBIbO31C4em-DKsSj7GdqtluPVfRYp4Gk/pub?gid=1481426139&single=true&output=csv";

export const GURU_KHUSUS_PAGI = ["Retno", "Yani", "Tris"];

export let muridList = [];

export let filterState = {
  guru: "Vera",
  kategori: "Halaman",
  sesi: "Pagi",
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

export function updateFilterState(key, value) {
  if (key in filterState) {
    filterState[key] = value;
  }

  // Aturan Khusus: Guru khusus pagi otomatis mengunci sesi ke 'Pagi'
  if (GURU_KHUSUS_PAGI.includes(filterState.guru)) {
    filterState.sesi = "Pagi";
  }
}

/**
 * Memperbarui muridList hanya untuk kolom 'halaman' dari Firebase
 */
export function mergeFirebaseData(firebaseUpdates) {
  if (!firebaseUpdates || !Array.isArray(muridList) || muridList.length === 0)
    return;

  muridList.forEach((murid) => {
    // Pastikan nama murid ada sebelum diolah
    if (!murid || !murid.nama) return;

    // Ubah nama murid ke format key yang aman di Firebase
    const safeNamaKey = murid.nama.replace(/[.#$\[\]]/g, "_");
    const patch = firebaseUpdates[safeNamaKey];

    // Cek apakah ada patch dan nilai halaman khusus di Firebase
    if (patch && typeof patch === "object" && patch.halaman !== undefined) {
      // Hanya perbarui properti 'halaman'
      murid.halaman = String(patch.halaman).trim();
    }
  });
}

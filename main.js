// ==========================================
// MAIN ENTRY POINT & INISIALISASI (HYBRID VERSION)
// ==========================================

import { loadDataFromCSV } from "./parser.js";
import {
  updateUI,
  toggleDropdown,
  closeAllDropdowns,
  selectOption,
  toggleName,
} from "./ui.js";

// Expose fungsi ke objek global window
// Diperlukan agar event inline pada HTML (seperti onclick="toggleName(this)") tetap berfungsi
window.toggleName = toggleName;
window.toggleDropdown = toggleDropdown;
window.closeAllDropdowns = closeAllDropdowns;
window.selectOption = selectOption;

// URL Firebase Realtime Database kamu
const FIREBASE_DB_URL =
  "https://tahsinsmala-default-rtdb.asia-southeast1.firebasedatabase.app";

// Fungsi untuk memperbarui Halaman murid di window.dataSiswa menggunakan data instan dari Firebase
async function syncHalamanFromFirebase() {
  try {
    const response = await fetch(`${FIREBASE_DB_URL}/murids.json`);
    if (!response.ok) return;

    const firebaseData = await response.json();
    if (!firebaseData || !window.dataSiswa) return;

    // Gabungkan (merge) data Halaman terbaru dari Firebase ke dataSiswa hasil parser CSV
    window.dataSiswa.forEach((siswa) => {
      if (siswa.nama) {
        const key = siswa.nama.toLowerCase().replace(/[.#$\[\]]/g, "_");
        if (firebaseData[key] && firebaseData[key].halaman) {
          siswa.halaman = firebaseData[key].halaman; // Timpa dengan halaman paling up-to-date
        }
      }
    });

    console.log(
      "⚡ Data Halaman berhasil disinkronkan secara instan dari Firebase!",
    );
  } catch (err) {
    console.warn(
      "⚠️ Gagal sinkronisasi Firebase, menggunakan data default CSV:",
      err,
    );
  }
}

// Inisialisasi Aplikasi setelah DOM siap
document.addEventListener("DOMContentLoaded", () => {
  // 1. Muat dulu data Guru, Jilid, Kelas, dan Murid dari CSV via parser.js
  loadDataFromCSV(async () => {
    // 2. Timpa data Halaman murid dengan data real-time terbaru dari Firebase
    await syncHalamanFromFirebase();

    // 3. Render UI setelah semua data siap
    updateUI();
  });
});

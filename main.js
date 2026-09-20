// ==========================================
// MAIN ENTRY POINT & INISIALISASI (HYBRID FIREBASE REALTIME)
// ==========================================

import { loadDataFromCSV, listenFirebaseUpdates } from "./parser.js";
import {
  updateUI,
  toggleDropdown,
  closeAllDropdowns,
  selectOption,
  toggleName,
} from "./ui.js";

// Expose fungsi ke objek global window
// Diperlukan agar event inline pada HTML (seperti onclick="toggleDropdown(...)") tetap berfungsi
window.toggleName = toggleName;
window.toggleDropdown = toggleDropdown;
window.closeAllDropdowns = closeAllDropdowns;
window.selectOption = selectOption;

// Inisialisasi Aplikasi setelah DOM siap
document.addEventListener("DOMContentLoaded", () => {
  // 1. Muat data utama dari CSV (Google Sheets) & data Halaman awal dari Firebase
  loadDataFromCSV(
    () => {
      // 2. Render UI pertama kali setelah data awal siap
      updateUI();

      // 3. Aktifkan Listener Realtime Firebase (SSE)
      // Setiap kali ada perubahan di Firebase dari perangkat lain, updateUI() dipanggil otomatis
      listenFirebaseUpdates(() => {
        updateUI();
      });
    },
    (err) => {
      console.error("Gagal menginisialisasi data aplikasi:", err);
    },
  );
});

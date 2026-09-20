// ==========================================
// MAIN ENTRY POINT & INISIALISASI
// ==========================================

import { loadDataFromCSV } from "./parser.js";
import { mergeFirebaseData } from "./state.js";
import { listenToFirebaseUpdates } from "./firebase-config.js";
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

let isCSVLoaded = false;
let lastFirebaseData = null;

// Inisialisasi Aplikasi setelah DOM siap
document.addEventListener("DOMContentLoaded", () => {
  // 1. Ambil data dasar dari CSV
  loadDataFromCSV(() => {
    isCSVLoaded = true;

    // Gabungkan data Firebase jika data sudah diterima lebih dulu
    if (lastFirebaseData) {
      mergeFirebaseData(lastFirebaseData);
    }

    updateUI();
  });

  // 2. Dengarkan perubahan Realtime dari Firebase
  listenToFirebaseUpdates((firebaseData) => {
    lastFirebaseData = firebaseData;

    if (isCSVLoaded) {
      mergeFirebaseData(firebaseData);

      // Jangan re-render jika user sedang fokus mengetik di kotak halaman
      const activeEl = document.activeElement;
      const isEditing =
        activeEl && activeEl.classList.contains("editable-halaman");

      if (!isEditing) {
        updateUI();
      }
    }
  });
});

// ==========================================
// MAIN ENTRY POINT & INISIALISASI
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

// Inisialisasi Aplikasi setelah DOM siap
document.addEventListener("DOMContentLoaded", () => {
  loadDataFromCSV(() => {
    // Callback ketika data CSV berhasil dimuat dan diparse
    updateUI();
  });
});

// ==========================================
// MAIN ENTRY POINT & INISIALISASI
// ==========================================

import { loadDataFromCSV, initRealtimeSync } from "./parser.js";
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

    // Sembunyikan full-screen loading overlay setelah data selesai dirender
    const loadingOverlay = document.getElementById("app-loading-overlay");
    if (loadingOverlay) {
      loadingOverlay.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => {
        loadingOverlay.style.display = "none";
      }, 300);
    }

    // Nyalakan pendengar perubahan real-time dari Supabase
    initRealtimeSync();
  });
});

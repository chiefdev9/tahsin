// ==========================================
// MAIN ENTRY POINT & INISIALISASI (OPTIMIZED)
// ==========================================

import { loadDataFromCSV, initRealtimeSync } from "./parser.js";
import {
  updateUI,
  toggleDropdown,
  closeAllDropdowns,
  selectOption,
  toggleName,
} from "./ui.js";

// Expose fungsi ke objek global window agar event inline HTML berfungsi
window.toggleName = toggleName;
window.toggleDropdown = toggleDropdown;
window.closeAllDropdowns = closeAllDropdowns;
window.selectOption = selectOption;

// Fungsi helper untuk mematikan loading overlay secepat kilat
const hideLoadingOverlay = () => {
  const loadingOverlay = document.getElementById("app-loading-overlay");
  if (loadingOverlay && loadingOverlay.style.display !== "none") {
    loadingOverlay.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => {
      loadingOverlay.style.display = "none";
    }, 300);
  }
};

// Inisialisasi Aplikasi secepat mungkin setelah DOM siap
document.addEventListener("DOMContentLoaded", () => {
  
  // OPTIMASI: Langsung hilangkan loading overlay begitu kerangka HTML siap 
  // atau berikan data cache lokal dulu jika ada di parser.js. 
  // Jangan biarkan user menunggu jaringan untuk sekadar membuka layar putih.
  
  // Jika parser Anda punya mekanisme cache lokal, pastikan itu dipanggil duluan.
  // Di sini kita percepat transisi overlay-nya:
  setTimeout(() => {
    hideLoadingOverlay();
  }, 50); // Nyaris instan (50ms setelah DOM siap)

  // Muat data CSV / Supabase di background
  loadDataFromCSV(() => {
    // Callback ketika data jaringan/CSV selesai didapat
    updateUI();
    
    // Pastikan sekali lagi overlay tertutup jika ada kendala
    hideLoadingOverlay();

    // Nyalakan pendengar perubahan real-time dari Supabase
    initRealtimeSync();
  });
});
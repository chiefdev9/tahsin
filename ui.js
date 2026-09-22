// ==========================================
// KONTROL UI, RENDER TABEL, & DROPDOWN
// ==========================================

import {
  muridList,
  filterState,
  GURU_KHUSUS_PAGI,
  updateFilterState,
} from "./state.js";
import { supabase } from "./supabaseClient.js"; // Mengimpor koneksi Supabase untuk fitur simpan otomatis saat edit

// ==========================================
// 1. LOGIKA TOGGLE NAMA (HANYA UNTUK NAMA TERPOTONG)
// ==========================================
export function toggleName(element) {
  const isExpanded =
    element.classList.contains("whitespace-nowrap") &&
    !element.classList.contains("truncate");

  const parentRow = element.closest(".grid");
  if (!parentRow) return;

  const extraCols = parentRow.querySelectorAll(".extra-col");

  if (!isExpanded) {
    // Sembunyikan kolom ekstra (JK & Kategori)
    extraCols.forEach((col) => col.classList.add("hidden"));

    // Ubah layout nama agar panjang & bisa di-scroll
    element.classList.remove("truncate");
    element.classList.add("col-span-3", "whitespace-nowrap", "overflow-x-auto");
  } else {
    // Kembalikan ke tampilan terpotong semula
    element.classList.remove(
      "col-span-3",
      "whitespace-nowrap",
      "overflow-x-auto",
    );
    element.classList.add("truncate");

    // Tampilkan kembali kolom ekstra
    extraCols.forEach((col) => col.classList.remove("hidden"));
  }
}

// ==========================================
// 2. RENDER TABEL
// ==========================================
export function renderTable() {
  const container = document.getElementById("table-body");
  if (!container) return;

  let filteredData = muridList.filter((item) => {
    return (
      item.guru?.toLowerCase() === filterState.guru.toLowerCase() &&
      item.sesi?.toLowerCase() === filterState.sesi.toLowerCase()
    );
  });

  if (filteredData.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-gray-400 font-medium text-xs">
        Tidak ada data murid untuk <br><strong>${filterState.guru}</strong> (Sesi ${filterState.sesi})
      </div>
    `;
    return;
  }

  const keyKategori = filterState.kategori.toLowerCase();

  // Jalankan pengurutan jika kategori adalah Jilid, Kelas, ATAU Halaman
  if (["jilid", "kelas", "halaman"].includes(keyKategori)) {
    filteredData = [...filteredData].sort((a, b) => {
      const valA = (a[keyKategori] || "").toString().trim();
      const valB = (b[keyKategori] || "").toString().trim();

      // Jika kategorinya 'halaman', terapkan logika khusus evaluasi di paling atas
      if (keyKategori === "halaman") {
        const isEvalA = /^ev/i.test(valA) || /^evaluasi/i.test(valA);
        const isEvalB = /^ev/i.test(valB) || /^evaluasi/i.test(valB);

        if (isEvalA && !isEvalB) return -1; // A (eval) naik ke atas
        if (!isEvalA && isEvalB) return 1; // B (eval) naik ke atas
      }

      // Pengurutan standar dari kecil ke besar (numeric)
      return valA.localeCompare(valB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }

  // Cek apakah kategori saat ini adalah 'halaman'
  const isHalamanMode = keyKategori === "halaman";

  container.innerHTML = filteredData
    .map((item, index) => {
      const isiHalaman = item[keyKategori] || "-";

      // Style khusus jika kolom bisa di-edit (hanya saat mode Halaman)
      const editableClass = isHalamanMode
        ? "editable-halaman cursor-pointer hover:bg-indigo-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded transition-all"
        : "cursor-default";

      return `
        <div class="grid grid-cols-[7%_51%_10%_32%] py-3 px-2 items-center hover:bg-gray-50 transition-all border-b border-gray-100">
            <!-- Kolom 1: No (Rata Tengah) -->
            <div class="text-center font-medium text-gray-400 text-xs">
              ${index + 1}
            </div>
            
            <!-- Kolom 2: Nama Murid (Isi Rata Kiri) -->
            <div 
              onclick="toggleName(this)" 
              title="Klik untuk lihat nama lengkap"
              class="name-col text-left px-1 font-semibold text-gray-800 text-[13px] leading-snug truncate cursor-pointer select-none">
              ${item.nama}
            </div>

            <!-- Kolom 3: JK (Rata Tengah) -->
            <div class="extra-col text-center font-bold text-gray-600 text-[11px] uppercase">
              ${item.jk}
            </div>

            <!-- Kolom 4: Nilai Kategori (Hanya Halaman yang contenteditable=true) -->
            <div 
              contenteditable="${isHalamanMode}"
              data-nama="${item.nama}"
              class="extra-col text-center px-1 font-semibold text-gray-700 text-[11px] uppercase whitespace-normal break-words ${editableClass}">
              ${isiHalaman}
            </div>
        </div>
      `;
    })
    .join("");

  // Jalankan listener edit jika sedang dalam mode Halaman
  if (isHalamanMode) {
    attachEditableEvents();
  }
}

// ==========================================
// 3. UPDATE HEADER & DROPDOWN UI
// ==========================================
export function updateHeaderKategori() {
  const headerDaftar = document.getElementById("header-daftar-murid");
  if (headerDaftar) {
    headerDaftar.className = "text-center";
  }

  const headerElem = document.getElementById("header-kategori");
  if (headerElem) {
    headerElem.innerText = filterState.kategori;
    headerElem.className = "text-center px-1";
  }
}

export function updateSesiDisableState() {
  const isPagiOnly = GURU_KHUSUS_PAGI.includes(filterState.guru);
  const dropdownWaktu = document.getElementById("dropdown-waktu");
  if (!dropdownWaktu) return;

  const buttons = dropdownWaktu.querySelectorAll(".option-btn");
  buttons.forEach((btn) => {
    const textSpan = btn.querySelector("span");
    if (textSpan && textSpan.innerText.trim() === "Siang") {
      if (isPagiOnly) {
        btn.disabled = true;
        btn.classList.add(
          "opacity-40",
          "cursor-not-allowed",
          "pointer-events-none",
        );
      } else {
        btn.disabled = false;
        btn.classList.remove(
          "opacity-40",
          "cursor-not-allowed",
          "pointer-events-none",
        );
      }
    }
  });
}

// FUNGSI MENAMBAHKAN GELAR SAAT USER MEMILIH NAMA GURU
const GURU_PEREMPUAN = [
  "Vera",
  "Nining",
  "Dian",
  "Nurlaela",
  "Nur",
  "Yani",
  "Retno",
  "Tris",
];

export function updateDropdownTextAndCheckmarks(dropdownId, value) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  // 1. TAMBAH GELAR & PENYESUAIAN NAMA KHUSUS UNTUK TOMBOL UTAMA
  const selectedText = dropdown.querySelector(".selected-text");
  if (selectedText) {
    if (dropdownId === "dropdown-guru") {
      let namaTampil = value === "Nurlaela" ? "Nur" : value;
      let gelar = GURU_PEREMPUAN.includes(value) ? "Ustzh " : "Ust ";
      selectedText.innerText = `${gelar}${namaTampil}`;
    } else {
      selectedText.innerText = value;
    }
  }

  // 2. COCOKKAN TEKS UNTUK CENTANG DI MODAL
  const options = dropdown.querySelectorAll(".option-btn");
  options.forEach((btn) => {
    const textSpan = btn.querySelector("span");
    const checkIcon = btn.querySelector(".check-icon");

    if (textSpan) {
      const isMatch = textSpan.innerText.includes(value);

      if (isMatch) {
        if (checkIcon) checkIcon.classList.remove("hidden");
        btn.classList.add("bg-indigo-50/80", "text-indigo-600");
      } else {
        if (checkIcon) checkIcon.classList.add("hidden");
        btn.classList.remove("bg-indigo-50/80", "text-indigo-600");
      }
    }
  });
}

export function updateUI() {
  updateSesiDisableState();
  updateHeaderKategori();
  updateDropdownTextAndCheckmarks("dropdown-guru", filterState.guru);
  updateDropdownTextAndCheckmarks("dropdown-kategori", filterState.kategori);
  updateDropdownTextAndCheckmarks("dropdown-waktu", filterState.sesi);
  updateRuangDisplay(filterState.guru, filterState.sesi);
  renderTable();
}

// ==========================================
// 4. KONTROL INTERAKSI DROPDOWN
// ==========================================
export function toggleDropdown(dropdownId) {
  const targetDropdown = document.getElementById(dropdownId);
  if (!targetDropdown) return;

  const targetMenu = targetDropdown.querySelector(".dropdown-menu");
  const backdrop = document.getElementById("dropdown-backdrop");
  if (!targetMenu) return;

  const isHidden = targetMenu.classList.contains("hidden");
  closeAllDropdowns();

  if (isHidden) {
    targetMenu.classList.remove("hidden");
    if (backdrop) backdrop.classList.remove("hidden");
  }
}

export function closeAllDropdowns() {
  document.querySelectorAll(".dropdown-menu").forEach((menu) => {
    menu.classList.add("hidden");
  });

  const backdrop = document.getElementById("dropdown-backdrop");
  if (backdrop) backdrop.classList.add("hidden");
}

export function selectOption(dropdownId, value) {
  if (dropdownId === "dropdown-guru") updateFilterState("guru", value);
  if (dropdownId === "dropdown-kategori") updateFilterState("kategori", value);
  if (dropdownId === "dropdown-waktu") updateFilterState("sesi", value);

  updateUI();
  closeAllDropdowns();
}

// ==========================================
// 5. FITUR INLINE EDIT & SYNC KE SUPABASE (KHUSUS KATEGORI HALAMAN)
// ==========================================
function attachEditableEvents() {
  const editableCells = document.querySelectorAll(".editable-halaman");

  editableCells.forEach((cell) => {
    // 1. Saat diklik / fokus: Simpan nilai asli, lalu kosongkan teks
    cell.addEventListener("focus", (e) => {
      if (filterState.kategori.toLowerCase() !== "halaman") return;

      const currentValue = e.target.innerText.trim();
      e.target.dataset.original = currentValue;
      e.target.innerText = "";
    });

    // 2. Saat klik di luar / lepas fokus (blur): Perbarui state memori dan simpan ke Supabase
    cell.addEventListener("blur", async (e) => {
      if (filterState.kategori.toLowerCase() !== "halaman") return;

      const newValue = e.target.innerText.trim();
      const originalValue = e.target.dataset.original || "-";
      const namaMurid = e.target.getAttribute("data-nama");

      // Jika user tidak mengetik apapun, kembalikan ke nilai awal
      if (newValue === "") {
        e.target.innerText = originalValue;
        return;
      }

      // Perbarui data halaman di memori lokal (state)
      const muridTarget = muridList.find((m) => m.nama === namaMurid);
      if (muridTarget) {
        muridTarget["halaman"] = newValue;
      }

      // Kirim pembaruan data secara otomatis ke tabel Supabase (Multi-perangkat sync)
      try {
        const { error } = await supabase
          .from("progres_murid")
          .update({ hlm_saat_ini: newValue })
          .eq("nama_siswa", namaMurid);

        if (error) {
          console.error("Gagal menyinkronkan perubahan ke Supabase:", error);
        }
      } catch (err) {
        console.error("Kesalahan jaringan saat menyimpan ke Supabase:", err);
      }
    });

    // 3. Saat tekan Enter: Selesaikan editan (pemicu event 'blur')
    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
      }
    });
  });
}

// ==========================================
// 6. INFORMASI RUANGAN OTOMATIS
// ==========================================
const PEMETAAN_RUANG = {
  Pagi: {
    Yani: "Mecca",
    Fahmi: "Medina",
    Nurlaela: "Alexandria",
    Retno: "Cairo",
    Dian: "Aula",
    Nining: "Granada",
    Yoga: "Aula",
    Vera: "Mushola",
    Syukron: "Cordoba",
    Tris: "Mushola",
  },
  Siang: {
    Fahmi: "Fez",
    Nurlaela: "Istanbul",
    Dian: "Marrakech",
    Nining: "Damascus",
    Yoga: "Urfa",
    Vera: "Komputer",
    Syukron: "Aleppo",
  },
};

export function updateRuangDisplay(ustaz, sesi) {
  const spanRuang = document.querySelector(".bg-indigo-50\\/80 span");
  if (!spanRuang) return;

  const sesiKey = sesi
    ? sesi.charAt(0).toUpperCase() + sesi.slice(1).toLowerCase()
    : "Pagi";

  const ruangPerSesi = PEMETAAN_RUANG[sesiKey] || PEMETAAN_RUANG["Pagi"];
  const namaRuang = ruangPerSesi[ustaz] || "-";

  spanRuang.innerText = `RUANG : ${namaRuang.toUpperCase()}`;
}

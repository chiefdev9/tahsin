// ==========================================
// DATA TIDAK PUNYA WARNA TAPI FUNGSI NAMA PANJANG DI KLIK TERLIHAT RAPI
// INI END POINT
// ==========================================

// ==========================================
// 1. URL CSV & STATE FILTER
// ==========================================
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlkxd8dmQkdKm720azA9vog-nI06aVC8AX-c0gKMZx7Q2XBIbO31C4em-DKsSj7GdqtluPVfRYp4Gk/pub?gid=1481426139&single=true&output=csv";

const GURU_KHUSUS_PAGI = ["Retno", "Yani", "Tris"];

let muridList = [];

let filterState = {
  guru: "Vera",
  kategori: "Halaman",
  sesi: "Pagi",
};

// ==========================================
// 2. PARSER CSV ROBUST & FETCH DATA
// ==========================================

function cleanNamaGuru(nama) {
  if (!nama) return "";
  return nama
    .replace(/\b(ustaz|ustazah|ustadz|ustadzah|ust|ustz)\b/gi, "")
    .trim();
}

function parseCSV(csvText) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentToken = "";

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i++;
      }
      row.push(currentToken.trim());
      if (row.length > 1 || row[0] !== "") {
        lines.push(row);
      }
      row = [];
      currentToken = "";
    } else {
      currentToken += char;
    }
  }

  if (currentToken || row.length > 0) {
    row.push(currentToken.trim());
    lines.push(row);
  }

  if (lines.length < 2) return [];

  const headers = lines[0].map((h) => h.toLowerCase());

  let idxNama = headers.findIndex((h) => h.includes("nama"));
  if (idxNama === -1) idxNama = 1;

  let idxGuru = headers.findIndex((h) => h.includes("guru saat ini"));
  if (idxGuru === -1) idxGuru = 10;

  let idxKelas = headers.findIndex((h) => h.includes("kelas"));
  let idxSaatIni = headers.findIndex((h) => h.includes("saat ini"));
  let idxHalaman = headers.findIndex((h) => h.includes("halaman"));
  let idxSesi = headers.findIndex((h) => h.includes("sesi"));
  let idxJK = headers.findIndex((h) => h.includes("jk"));

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const rowData = lines[i];
    if (!rowData || rowData.length === 0) continue;

    let obj = {};

    obj["nama"] = rowData[idxNama] || "";
    obj["jk"] = rowData[idxJK] || "-";
    obj["kelas"] = idxKelas !== -1 ? rowData[idxKelas] : "-";
    obj["jilid"] = idxSaatIni !== -1 ? rowData[idxSaatIni] : "-";
    obj["halaman"] = idxHalaman !== -1 ? rowData[idxHalaman] : "-";

    const rawGuru = idxGuru !== -1 ? rowData[idxGuru] : "";
    obj["guru"] = cleanNamaGuru(rawGuru);

    const rawSesi = idxSesi !== -1 ? rowData[idxSesi] : "";
    obj["sesi"] = rawSesi
      ? rawSesi.charAt(0).toUpperCase() + rawSesi.slice(1).toLowerCase()
      : "";

    data.push(obj);
  }

  return data;
}

async function loadDataFromCSV() {
  const container = document.getElementById("table-body");
  if (container) {
    container.innerHTML = `
      <div class="p-8 text-center text-gray-400 font-medium text-xs">
        Memuat data murid...
      </div>
    `;
  }

  try {
    const response = await fetch(CSV_URL);
    if (!response.ok)
      throw new Error("Gagal mengambil data dari Google Sheets");

    const csvText = await response.text();
    muridList = parseCSV(csvText);

    updateUI();
  } catch (error) {
    console.error("Error loading CSV:", error);
    if (container) {
      container.innerHTML = `
        <div class="p-8 text-center text-red-500 font-medium text-xs">
          Gagal memuat data murid. Silakan periksa koneksi internet atau link CSV.
        </div>
      `;
    }
  }
}

// ==========================================
// 3. LOGIKA TOGGLE NAMA (WARNA TEKS SERAGAM SAAT EXPANDED)
// ==========================================
function toggleName(element) {
  const isTruncated = element.scrollWidth > element.clientWidth;
  const isExpanded =
    element.classList.contains("whitespace-nowrap") &&
    !element.classList.contains("truncate");

  // Jika nama tidak terpotong dan belum di-expand, jangan jalankan fungsi
  if (!isTruncated && !isExpanded) return;

  const parentRow = element.closest(".grid");
  if (!parentRow) return;

  const extraCols = parentRow.querySelectorAll(".extra-col");

  if (!isExpanded) {
    // Sembunyikan kolom ekstra (JK & Kategori)
    extraCols.forEach((col) => col.classList.add("hidden"));

    // Ubah layout nama agar panjang & bisa di-scroll, warna teks tetap seragam
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
// 4. RENDER TABEL
// ==========================================
function renderTable() {
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

  if (keyKategori === "jilid" || keyKategori === "kelas") {
    filteredData = [...filteredData].sort((a, b) => {
      const valA = (a[keyKategori] || "").toString().trim();
      const valB = (b[keyKategori] || "").toString().trim();

      return valA.localeCompare(valB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }

  // Alignment nilai kategori: Halaman = Center, Kelas/Jilid = Left
  const isHalaman = keyKategori === "halaman";
  const alignKategoriClass = isHalaman ? "text-center px-1" : "text-left px-2";

  container.innerHTML = filteredData
    .map((item, index) => {
      const nilaiKategori = item[keyKategori] || "-";

      return `
        <div class="grid grid-cols-[7%_51%_10%_32%] py-3 px-2 text-center items-center hover:bg-gray-50 transition-all">
            <!-- No -->
            <div class="font-medium text-gray-400 text-xs">${index + 1}</div>
            
            <!-- Nama Murid: Hover mengubah warna teks, tetapi saat diklik teks tetap warna seragam -->
            <div 
              onclick="toggleName(this)" 
              title="Klik untuk lihat nama lengkap"
              class="name-col text-left px-1 font-semibold text-gray-800 text-[13px] leading-snug truncate cursor-pointer select-none transition-colors duration-150 hover:text-indigo-600">
              ${item.nama}
            </div>

            <!-- Kolom JK -->
            <div class="extra-col font-bold text-gray-600 text-[11px] uppercase">
              ${item.jk}
            </div>

            <!-- Kolom Nilai Kategori -->
            <div class="extra-col ${alignKategoriClass} font-semibold text-gray-700 text-[11px] uppercase whitespace-normal break-words">
              ${nilaiKategori}
            </div>
        </div>
      `;
    })
    .join("");
}

// ==========================================
// 5. UPDATE HEADER & UI
// ==========================================
function updateHeaderKategori() {
  const headerDaftar = document.getElementById("header-daftar-murid");
  if (headerDaftar) {
    headerDaftar.className = "text-center font-semibold";
  }

  const headerElem = document.getElementById("header-kategori");
  if (headerElem) {
    headerElem.innerText = filterState.kategori;
    headerElem.className = "text-center font-semibold";
  }
}

function updateUI() {
  updateSesiDisableState();
  updateHeaderKategori();
  updateDropdownTextAndCheckmarks("dropdown-guru", filterState.guru);
  updateDropdownTextAndCheckmarks("dropdown-kategori", filterState.kategori);
  updateDropdownTextAndCheckmarks("dropdown-waktu", filterState.sesi);
  renderTable();
}

// ==========================================
// 6. KONTROL DROPDOWN & OVERLAY
// ==========================================
function toggleDropdown(dropdownId) {
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

function closeAllDropdowns() {
  document.querySelectorAll(".dropdown-menu").forEach((menu) => {
    menu.classList.add("hidden");
  });

  const backdrop = document.getElementById("dropdown-backdrop");
  if (backdrop) backdrop.classList.add("hidden");
}

function selectOption(dropdownId, value) {
  if (dropdownId === "dropdown-guru") filterState.guru = value;
  if (dropdownId === "dropdown-kategori") filterState.kategori = value;
  if (dropdownId === "dropdown-waktu") filterState.sesi = value;

  if (GURU_KHUSUS_PAGI.includes(filterState.guru)) {
    filterState.sesi = "Pagi";
  }

  updateUI();
  closeAllDropdowns();
}

function updateSesiDisableState() {
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

function updateDropdownTextAndCheckmarks(dropdownId, value) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  const selectedText = dropdown.querySelector(".selected-text");
  if (selectedText) selectedText.innerText = value;

  const options = dropdown.querySelectorAll(".option-btn");
  options.forEach((btn) => {
    const textSpan = btn.querySelector("span");
    const checkIcon = btn.querySelector(".check-icon");

    if (textSpan && textSpan.innerText.trim() === value) {
      if (checkIcon) checkIcon.classList.remove("hidden");
      btn.classList.add("bg-indigo-50/80", "text-indigo-600");
    } else {
      if (checkIcon) checkIcon.classList.add("hidden");
      btn.classList.remove("bg-indigo-50/80", "text-indigo-600");
    }
  });
}

// ==========================================
// 7. INISIALISASI UTAMA
// ==========================================
document.addEventListener("DOMContentLoaded", loadDataFromCSV);

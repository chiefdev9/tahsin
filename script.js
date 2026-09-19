// ==========================================
// 1. URL CSV & STATE FILTER
// ==========================================
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlkxd8dmQkdKm720azA9vog-nI06aVC8AX-c0gKMZx7Q2XBIbO31C4em-DKsSj7GdqtluPVfRYp4Gk/pub?gid=1481426139&single=true&output=csv";

const GURU_KHUSUS_PAGI = ["Retno", "Yani", "Tris"];

let muridList = []; // Data dari CSV Google Sheets

let filterState = {
  guru: "Vera",
  kategori: "Halaman",
  sesi: "Pagi",
};

// ==========================================
// 2. PARSER CSV & FETCH DATA
// ==========================================

// Fungsi pembersih kata Ustaz / Ustazah
function cleanNamaGuru(nama) {
  if (!nama) return "";
  return nama
    .replace(/\b(ustaz|ustazah|ustadz|ustadzah|ust|ustz)\b/gi, "")
    .trim();
}

// Parsing CSV: Membaca baris pertama sebagai Key Objek
function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];

  // Baris pertama CSV langsung dijadikan array KEY / Header
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

  const data = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    // Memisah kolom dengan tetap aman jika ada teks di dalam tanda kutip
    const row =
      lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
    const cleanedRow = row.map((val) => val.trim().replace(/^"|"$/g, ""));

    let obj = {};

    // Map setiap kolom langsung ke KEY (Header baris pertama)
    headers.forEach((header, index) => {
      let val = cleanedRow[index] || "";
      obj[header] = val;
    });

    // --- PENYESUAIAN KHUSUS --- //
    // 1. Map Nama Siswa
    obj["nama"] = obj["nama siswa"] || obj["nama"] || "";

    // 2. Map Nomor Urut
    obj["no"] = parseInt(obj["no"], 10) || i;

    // 3. Jilid diambil langsung dari KEY "saat ini"
    obj["jilid"] = obj["saat ini"] || "-";

    // 4. Guru diambil dari KEY "guru saat ini" dan di-trim Ustaz/Ustazah-nya
    const rawGuru = obj["guru saat ini"] || obj["guru"] || "";
    obj["guru"] = cleanNamaGuru(rawGuru);

    // 5. Sesi dibuat kapitalisasi standar (Pagi / Siang)
    if (obj["sesi"]) {
      obj["sesi"] =
        obj["sesi"].charAt(0).toUpperCase() +
        obj["sesi"].slice(1).toLowerCase();
    }

    data.push(obj);
  }
  return data;
}

// Fungsi Fetch Data dari Google Sheets
async function loadDataFromCSV() {
  const container = document.getElementById("table-body");
  if (container) {
    container.innerHTML = `
      <div class="p-8 text-center text-gray-400 font-medium">
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

    // Update UI setelah data siap
    updateUI();
  } catch (error) {
    console.error("Error loading CSV:", error);
    if (container) {
      container.innerHTML = `
        <div class="p-8 text-center text-red-500 font-medium">
          Gagal memuat data murid. Silakan periksa koneksi internet atau link CSV.
        </div>
      `;
    }
  }
}

// ==========================================
// 3. LOGIKA TOGGLE NAMA
// ==========================================
function toggleName(element) {
  const row = element.parentElement;
  const extraCols = row.querySelectorAll(".extra-col");
  const isTruncated = element.classList.contains("truncate");

  if (isTruncated) {
    extraCols.forEach((col) => col.classList.add("hidden"));
    row.classList.remove("grid-cols-[7%_58%_13%_22%]");
    row.classList.add("grid-cols-[7%_93%]");
    element.classList.remove("truncate");
    element.classList.add("whitespace-normal", "break-words");
  } else {
    extraCols.forEach((col) => col.classList.remove("hidden"));
    row.classList.remove("grid-cols-[7%_93%]");
    row.classList.add("grid-cols-[7%_58%_13%_22%]");
    element.classList.add("truncate");
    element.classList.remove("whitespace-normal", "break-words");
  }
}

// ==========================================
// 4. RENDER TABEL (DINAMIS SESUAI KATEGORI)
// ==========================================
function renderTable() {
  const container = document.getElementById("table-body");
  if (!container) return;

  // Filter murid berdasarkan guru (dari "Guru Saat Ini") dan sesi aktif
  const filteredData = muridList.filter((item) => {
    return (
      item.guru?.toLowerCase() === filterState.guru.toLowerCase() &&
      item.sesi?.toLowerCase() === filterState.sesi.toLowerCase()
    );
  });

  if (filteredData.length === 0) {
    container.innerHTML = `
      <div class="p-8 text-center text-gray-400 font-medium">
        Tidak ada data murid untuk <br><strong>${filterState.guru}</strong> (Sesi ${filterState.sesi})
      </div>
    `;
    return;
  }

  // Tentukan property yang diambil berdasarkan filter kategori ("halaman", "jilid", atau "kelas")
  const keyKategori = filterState.kategori.toLowerCase();

  container.innerHTML = filteredData
    .map((item, index) => {
      const isFemale = item.jk?.toUpperCase() === "P";
      const badgeStyle = isFemale
        ? "bg-pink-100 text-pink-700"
        : "bg-blue-100 text-blue-700";

      const nilaiKategori = item[keyKategori] || "-";

      return `
        <div class="grid grid-cols-[7%_58%_13%_22%] py-3 px-2 text-center items-center hover:bg-gray-50 transition-all">
            <div class="font-medium text-gray-500">${index + 1}</div>
            
            <div 
              onclick="toggleName(this)" 
              class="name-col text-left px-2 font-medium text-gray-900 truncate cursor-pointer select-none transition-all duration-150"
              title="Klik untuk lihat nama lengkap"
            >
              ${item.nama}
            </div>

            <!-- Kolom JK -->
            <div class="extra-col">
                <span class="${badgeStyle} font-bold text-[10px] px-1.5 py-0.5 rounded inline-block">${item.jk}</span>
            </div>

            <!-- Kolom Kategori (Halaman / Jilid (dari 'Saat Ini') / Kelas) -->
            <div class="extra-col bg-indigo-50 text-indigo-700 py-1 px-1 rounded-md font-semibold text-xs truncate">
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
  const headerElem = document.getElementById("header-kategori");
  if (headerElem) {
    headerElem.innerText = filterState.kategori;
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

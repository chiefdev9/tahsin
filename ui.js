// ==========================================
// KONTROL UI, RENDER TABEL, & DROPDOWN (FIREBASE REALTIME)
// ==========================================

import {
  muridList,
  filterState,
  GURU_KHUSUS_PAGI,
  FIREBASE_DB_URL,
  formatFirebaseKey,
  updateFilterState,
} from "./state.js";

// Variable penanda agar tidak merender ulang saat pengguna sedang mengetik
let isEditing = false;

export function toggleName(element) {
  const isTruncated = element.scrollWidth > element.clientWidth;
  const isExpanded =
    element.classList.contains("whitespace-nowrap") &&
    !element.classList.contains("truncate");

  if (!isTruncated && !isExpanded) return;

  const parentRow = element.closest(".grid");
  if (!parentRow) return;

  const extraCols = parentRow.querySelectorAll(".extra-col");

  if (!isExpanded) {
    extraCols.forEach((col) => col.classList.add("hidden"));
    element.classList.remove("truncate");
    element.classList.add("col-span-3", "whitespace-nowrap", "overflow-x-auto");
  } else {
    element.classList.remove(
      "col-span-3",
      "whitespace-nowrap",
      "overflow-x-auto",
    );
    element.classList.add("truncate");
    extraCols.forEach((col) => col.classList.remove("hidden"));
  }
}

export function renderTable() {
  // Cegah render ulang tabel jika pengguna sedang melakukan ketik/edit di sel mana pun
  if (isEditing) return;

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

  if (["jilid", "kelas", "halaman"].includes(keyKategori)) {
    filteredData = [...filteredData].sort((a, b) => {
      const valA = (a[keyKategori] || "").toString().trim();
      const valB = (b[keyKategori] || "").toString().trim();

      if (keyKategori === "halaman") {
        const isEvalA = /^ev/i.test(valA) || /^evaluasi/i.test(valA);
        const isEvalB = /^ev/i.test(valB) || /^evaluasi/i.test(valB);

        if (isEvalA && !isEvalB) return -1;
        if (!isEvalA && isEvalB) return 1;
      }

      return valA.localeCompare(valB, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
  }

  const isHalamanMode = keyKategori === "halaman";

  container.innerHTML = filteredData
    .map((item, index) => {
      const isiHalaman = item[keyKategori] || "-";

      const editableClass = isHalamanMode
        ? "editable-halaman cursor-pointer hover:bg-indigo-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded transition-all"
        : "cursor-default";

      return `
        <div class="grid grid-cols-[7%_51%_10%_32%] py-3 px-2 items-center hover:bg-gray-50 transition-all border-b border-gray-100">
            <div class="text-center font-medium text-gray-400 text-xs">
              ${index + 1}
            </div>
            
            <div 
              onclick="toggleName(this)" 
              title="Klik untuk lihat nama lengkap"
              class="name-col text-left px-1 font-semibold text-gray-800 text-[13px] leading-snug truncate cursor-pointer select-none">
              ${item.nama}
            </div>

            <div class="extra-col text-center font-bold text-gray-600 text-[11px] uppercase">
              ${item.jk}
            </div>

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

  if (isHalamanMode) {
    attachEditableEvents();
  }
}

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
  renderTable();
}

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

// 5. FITUR INLINE EDIT (SINKRONISASI INSTAN KE FIREBASE)
async function kirimHalamanKeFirebase(namaMurid, halamanBaru) {
  if (!namaMurid) return;

  const muridKey = formatFirebaseKey(namaMurid);
  const targetUrl = `${FIREBASE_DB_URL}/murids/${muridKey}/halaman.json`;

  try {
    const response = await fetch(targetUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(halamanBaru),
    });

    if (response.ok) {
      console.log(
        `⚡ Halaman [${halamanBaru}] untuk ${namaMurid} tersimpan instan di Firebase!`,
      );
    } else {
      console.error("❌ Gagal menyimpan ke Firebase:", response.statusText);
    }
  } catch (err) {
    console.error("❌ Gagal terhubung ke Firebase:", err);
  }
}

function attachEditableEvents() {
  const editableCells = document.querySelectorAll(".editable-halaman");

  editableCells.forEach((cell) => {
    cell.addEventListener("focus", (e) => {
      if (filterState.kategori.toLowerCase() !== "halaman") return;

      isEditing = true; // Kunci render ulang saat pengguna sedang mengedit
      const currentValue = e.target.innerText.trim();
      e.target.dataset.original = currentValue;
      e.target.innerText = "";
    });

    cell.addEventListener("blur", (e) => {
      if (filterState.kategori.toLowerCase() !== "halaman") return;

      isEditing = false; // Buka kunci render
      const newValue = e.target.innerText.trim();
      const originalValue = e.target.dataset.original || "-";
      const namaMurid = e.target.getAttribute("data-nama");

      if (newValue === "" || newValue === originalValue) {
        e.target.innerText = originalValue;
        return;
      }

      // Update memori lokal
      const muridTarget = muridList.find((m) => m.nama === namaMurid);
      if (muridTarget) {
        muridTarget["halaman"] = newValue;
      }

      // Kirim ke Firebase
      kirimHalamanKeFirebase(namaMurid, newValue);
    });

    cell.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
      }
    });
  });
}

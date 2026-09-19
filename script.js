const muridList = [
  {
    no: 1,
    nama: "Farhah Nafs Al Muthmainnah Hafizhah Zulkifli",
    jk: "P",
    halaman: "Evaluasi",
    guru: "Yani",
    jilid: "JILID 2A",
    sesi: "Pagi",
    kelas: "P1 MECCA",
  },
  {
    no: 2,
    nama: "Arkana Xavier Iniesta Al Ayyubi",
    jk: "L",
    halaman: "Ev",
    guru: "Fahmi",
    jilid: "JUZ 27",
    sesi: "Siang",
    kelas: "P4 ISTANBUL",
  },
  {
    no: 3,
    nama: "Muhammad Ryu Shaquile Dzakiandra",
    jk: "L",
    halaman: "88",
    guru: "Tris",
    jilid: "AL-QUR'AN",
    sesi: "Pagi",
    kelas: "P2 ALEXANDRIA",
  },
  {
    no: 4,
    nama: "Raden Aisyah Pramadia",
    jk: "P",
    halaman: "05",
    guru: "Nining",
    jilid: "JILID 1A",
    sesi: "Siang",
    kelas: "P5 DAMASCUS",
  },
  {
    no: 5,
    nama: "Raffasya Nazril Oktavian Musyaffa",
    jk: "L",
    halaman: "18",
    guru: "Retno",
    jilid: "JILID 3B",
    sesi: "Pagi",
    kelas: "P3 CORDOBA",
  },
  {
    no: 6,
    nama: "Athallah Musyaffa Rasya Adhitya",
    jk: "L",
    halaman: "27",
    guru: "Yoga",
    jilid: "TAJWID",
    sesi: "Siang",
    kelas: "P6 MARRAKECH",
  },
  {
    no: 7,
    nama: "Arfasyarique Anargya Radeya",
    jk: "L",
    halaman: "34",
    guru: "Vera",
    jilid: "GHARIB",
    sesi: "Pagi",
    kelas: "P1 MEDINA",
  },
  {
    no: 8,
    nama: "Chinquita Ilmirany Shayma Rusmalan",
    jk: "P",
    halaman: "42",
    guru: "Nurlaela",
    jilid: "JILID 4A",
    sesi: "Siang",
    kelas: "P2 CAIRO",
  },
  {
    no: 9,
    nama: "Mohammad Hanif Ali Ghaisan",
    jk: "L",
    halaman: "50",
    guru: "Syukron",
    jilid: "TAHFIZ",
    sesi: "Siang",
    kelas: "P4 URFA",
  },
  {
    no: 10,
    nama: "Muhammad Naladipha Sakha Sitorus",
    jk: "L",
    halaman: "63",
    guru: "Yani",
    jilid: "JILID 2B",
    sesi: "Pagi",
    kelas: "P3 GRANADA",
  },
  {
    no: 11,
    nama: "Arganta Rayhan Khulafa Digdayan",
    jk: "L",
    halaman: "71",
    guru: "Dian",
    jilid: "FINISHING",
    sesi: "Siang",
    kelas: "P5 ALEPPO",
  },
  {
    no: 12,
    nama: "Mageia Nayaka Kusumadjati",
    jk: "P",
    halaman: "79",
    guru: "Tris",
    jilid: "JILID 1B",
    sesi: "Pagi",
    kelas: "P1 MECCA",
  },
  {
    no: 13,
    nama: "Fuschia Amira Nurhidayah Putriyudo",
    jk: "P",
    halaman: "85",
    guru: "Fahmi",
    jilid: "JILID 4B",
    sesi: "Siang",
    kelas: "P6 FEZ",
  },
  {
    no: 14,
    nama: "Achmad Malka Condro Sisworo",
    jk: "L",
    halaman: "92",
    guru: "Retno",
    jilid: "JUZ 27",
    sesi: "Pagi",
    kelas: "P2 ALEXANDRIA",
  },
  {
    no: 15,
    nama: "Adskhan Muhammad Alrafaeyza",
    jk: "L",
    halaman: "104",
    guru: "Nurlaela",
    jilid: "AL-QUR'AN",
    sesi: "Siang",
    kelas: "P3 CORDOBA",
  },
  {
    no: 16,
    nama: "Arkaan Alkhawarizmi Dananjaya",
    jk: "L",
    halaman: "112",
    guru: "Yoga",
    jilid: "JILID 3A",
    sesi: "Siang",
    kelas: "P4 ISTANBUL",
  },
  {
    no: 17,
    nama: "Demitria Shashinajja Nainggolan",
    jk: "P",
    halaman: "120",
    guru: "Yani",
    jilid: "GHARIB",
    sesi: "Pagi",
    kelas: "P1 MEDINA",
  },
  {
    no: 18,
    nama: "Ganendra Adhyastha Ksatriapraja",
    jk: "L",
    halaman: "135",
    guru: "Syukron",
    jilid: "TAJWID",
    sesi: "Siang",
    kelas: "P5 DAMASCUS",
  },
  {
    no: 19,
    nama: "Ghaaniyah Rizqah Prabusunu",
    jk: "P",
    halaman: "142",
    guru: "Tris",
    jilid: "JILID 2A",
    sesi: "Pagi",
    kelas: "P3 GRANADA",
  },
  {
    no: 20,
    nama: "Kenaya Labiqa Maliha Ramadani",
    jk: "P",
    halaman: "150",
    guru: "Vera",
    jilid: "JILID 1A",
    sesi: "Siang",
    kelas: "P6 MARRAKECH",
  },
  {
    no: 21,
    nama: "Muhammad Adrian Alfan Rafisqi",
    jk: "L",
    halaman: "158",
    guru: "Retno",
    jilid: "FINISHING",
    sesi: "Pagi",
    kelas: "P2 CAIRO",
  },
  {
    no: 22,
    nama: "Muhammad Arsya Raihan",
    jk: "L",
    halaman: "164",
    guru: "Dian",
    jilid: "JILID 4B",
    sesi: "Siang",
    kelas: "P4 URFA",
  },
  {
    no: 23,
    nama: "Muhammad Danish Athallah Dipa",
    jk: "L",
    halaman: "171",
    guru: "Nining",
    jilid: "TAHFIZ",
    sesi: "Pagi",
    kelas: "P1 MECCA",
  },
  {
    no: 24,
    nama: "Ramadhan Sakti Patra Kurniawan",
    jk: "L",
    halaman: "180",
    guru: "Fahmi",
    jilid: "AL-QUR'AN",
    sesi: "Siang",
    kelas: "P5 ALEPPO",
  },
  {
    no: 25,
    nama: "Syaima Salsabila Aristya Maulana",
    jk: "P",
    halaman: "192",
    guru: "Tris",
    jilid: "JILID 3B",
    sesi: "Pagi",
    kelas: "P2 ALEXANDRIA",
  },
];

/*
FUNGSI INI MEMBUAT NAMA DAPAT TERBACA PENUH
DAN DAPAT DIKEMBALIKAN MENJADI LEBIH SINGKAT
*/

function renderTable() {
  const container = document.getElementById("table-body");

  if (!container) return;

  container.innerHTML = muridList
    .map((item) => {
      const isFemale = item.jk === "P";
      const badgeStyle = isFemale
        ? "bg-pink-100 text-pink-700"
        : "bg-blue-100 text-blue-700";

      return `
            <div class="grid grid-cols-[7%_58%_13%_22%] py-3 px-2 text-center items-center hover:bg-gray-50 transition-all">
                <div class="font-medium text-gray-500">${item.no}</div>
                
                <!-- Nama Murid -->
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

                <!-- Kolom Halaman -->
                <div class="extra-col bg-indigo-50 text-indigo-700 py-1 px-2 rounded-md font-semibold text-xs">
                  ${item.halaman}
                </div>
            </div>
        `;
    })
    .join("");
}

// Fungsi toggle untuk menyembunyikan kolom ekstra saat nama meluas
function toggleName(element) {
  const row = element.parentElement; // Mengambil elemen baris induk (.grid)
  const extraCols = row.querySelectorAll(".extra-col"); // Mengambil elemen JK & Halaman
  const isTruncated = element.classList.contains("truncate");

  if (isTruncated) {
    // 1. Sembunyikan elemen JK dan Halaman
    extraCols.forEach((col) => col.classList.add("hidden"));

    // 2. Ubah kolom nama agar mengambil sisa ruang grid
    element.classList.remove("truncate");
    element.classList.add("col-span-3", "whitespace-normal", "break-words");
  } else {
    // 1. Tampilkan kembali elemen JK dan Halaman
    extraCols.forEach((col) => col.classList.remove("hidden"));

    // 2. Kembalikan kolom nama ke mode potong (58%)
    element.classList.add("truncate");
    element.classList.remove("col-span-3", "whitespace-normal", "break-words");
  }
}

document.addEventListener("DOMContentLoaded", renderTable);

/*
FUNGSI MENU BAR DIBAWAH
DISESUAIKAN DENGAN GURU SMALA
*/
// 1. Buka / Tutup Dropdown
function toggleDropdown(dropdownId) {
  const targetDropdown = document.getElementById(dropdownId);
  if (!targetDropdown) return;

  const targetMenu = targetDropdown.querySelector(".dropdown-menu");
  const backdrop = document.getElementById("dropdown-backdrop");

  if (!targetMenu) return;

  const isHidden = targetMenu.classList.contains("hidden");

  // Tutup menu lain yang sedang terbuka
  closeAllDropdowns();

  // Tampilkan jika sebelumnya tersembunyi
  if (isHidden) {
    targetMenu.classList.remove("hidden");
    if (backdrop) backdrop.classList.remove("hidden");
  }
}

// 2. Tutup Semua Menu & Overlay Backdrop
function closeAllDropdowns() {
  document.querySelectorAll(".dropdown-menu").forEach((menu) => {
    menu.classList.add("hidden");
  });

  const backdrop = document.getElementById("dropdown-backdrop");
  if (backdrop) {
    backdrop.classList.add("hidden");
  }
}

// 3. Update Pilihan & Indikator Ceklis
function selectOption(dropdownId, value) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  // Perbarui Teks Tombol Utama
  const selectedText = dropdown.querySelector(".selected-text");
  if (selectedText) {
    selectedText.innerText = value;
  }

  // Perbarui Tanda Ceklis
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

  closeAllDropdowns();
}

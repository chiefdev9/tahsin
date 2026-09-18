const muridList = [
  {
    no: 1,
    nama: "Farhah Nafs Al Muthmainnah Hafizhah Zulkifli",
    jk: "P",
    halaman: "12",
  },
  { no: 2, nama: "Arkana Xavier Iniesta Al Ayyubi", jk: "L", halaman: "45" },
  { no: 3, nama: "Muhammad Ryu Shaquile Dzakiandra", jk: "L", halaman: "88" },
  { no: 4, nama: "Raden Aisyah Pramadia", jk: "P", halaman: "05" },
  { no: 5, nama: "Raffasya Nazril Oktavian Musyaffa", jk: "L", halaman: "18" },
  { no: 6, nama: "Athallah Musyaffa Rasya Adhitya", jk: "L", halaman: "27" },
  { no: 7, nama: "Arfasyarique Anargya Radeya", jk: "L", halaman: "34" },
  { no: 8, nama: "Chinquita Ilmirany Shayma Rusmalan", jk: "P", halaman: "42" },
  { no: 9, nama: "Mohammad Hanif Ali Ghaisan", jk: "L", halaman: "50" },
  { no: 10, nama: "Muhammad Naladipha Sakha Sitorus", jk: "L", halaman: "63" },
  { no: 11, nama: "Arganta Rayhan Khulafa Digdayan", jk: "L", halaman: "71" },
  { no: 12, nama: "Mageia Nayaka Kusumadjati", jk: "P", halaman: "79" },
  {
    no: 13,
    nama: "Fuschia Amira Nurhidayah Putriyudo",
    jk: "P",
    halaman: "85",
  },
  { no: 14, nama: "Achmad Malka Condro Sisworo", jk: "L", halaman: "92" },
  { no: 15, nama: "Adskhan Muhammad Alrafaeyza", jk: "L", halaman: "104" },
  { no: 16, nama: "Arkaan Alkhawarizmi Dananjaya", jk: "L", halaman: "112" },
  { no: 17, nama: "Demitria Shashinajja Nainggolan", jk: "P", halaman: "120" },
  { no: 18, nama: "Ganendra Adhyastha Ksatriapraja", jk: "L", halaman: "135" },
  { no: 19, nama: "Ghaaniyah Rizqah Prabusunu", jk: "P", halaman: "142" },
  { no: 20, nama: "Kenaya Labiqa Maliha Ramadani", jk: "P", halaman: "150" },
  { no: 21, nama: "Muhammad Adrian Alfan Rafisqi", jk: "L", halaman: "158" },
  { no: 22, nama: "Muhammad Arsya Raihan", jk: "L", halaman: "164" },
  { no: 23, nama: "Muhammad Danish Athallah Dipa", jk: "L", halaman: "171" },
  { no: 24, nama: "Ramadhan Sakti Patra Kurniawan", jk: "L", halaman: "180" },
  { no: 25, nama: "Syaima Salsabila Aristya Maulana", jk: "P", halaman: "192" },
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

// Buka / Tutup Menu Dropdown & Overlay Backdrop
function toggleDropdown(dropdownId) {
  const targetDropdown = document.getElementById(dropdownId);
  const targetMenu = targetDropdown.querySelector('.dropdown-menu');
  const backdrop = document.getElementById('dropdown-backdrop');
  
  const isHidden = targetMenu.classList.contains('hidden');

  // Tutup semua menu & backdrop terlebih dahulu
  closeAllDropdowns();

  // Jika sebelumnya tertutup, buka menu yang diklik & tampilkan backdrop
  if (isHidden) {
    targetMenu.classList.remove('hidden');
    backdrop.classList.remove('hidden');
  }
}

// Fungsi untuk Menutup Semua Dropdown dan Backdrop
function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu').forEach(menu => {
    menu.classList.add('hidden');
  });
  
  const backdrop = document.getElementById('dropdown-backdrop');
  if (backdrop) {
    backdrop.classList.add('hidden');
  }
}

// Pilih Opsi, Perbarui Teks Tombol, & Atur Ikon Ceklis
function selectOption(dropdownId, value) {
  const dropdown = document.getElementById(dropdownId);
  
  // 1. Ubah teks pada tombol utama yang terlihat di bottom bar
  const selectedTextElement = dropdown.querySelector('.selected-text');
  if (selectedTextElement) {
    selectedTextElement.innerText = value;
  }

  // 2. Perbarui tampilan aktif (ikon ceklis & warna background) pada pilihan
  const options = dropdown.querySelectorAll('.option-btn');
  options.forEach(btn => {
    const textSpan = btn.querySelector('span').innerText.trim();
    const checkIcon = btn.querySelector('.check-icon');

    if (textSpan === value) {
      if (checkIcon) checkIcon.classList.remove('hidden');
      btn.classList.add('bg-indigo-50/80', 'text-indigo-600');
    } else {
      if (checkIcon) checkIcon.classList.add('hidden');
      btn.classList.remove('bg-indigo-50/80', 'text-indigo-600');
    }
  });

  // 3. Tutup kembali bottom sheet setelah opsi dipilih
  closeAllDropdowns();
}
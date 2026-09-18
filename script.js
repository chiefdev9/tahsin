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
            <div class="grid grid-cols-[7%_58%_13%_22%] py-3 px-2 text-center items-center hover:bg-gray-50 transition-all relative">
                <div class="font-medium text-gray-500">${item.no}</div>
                
                <!-- Pembungkus elemen nama dengan event onclick -->
                <div 
                  onclick="toggleName(this)" 
                  class="text-left px-2 font-medium text-gray-900 truncate cursor-pointer select-none transition-all duration-200"
                  title="Klik untuk melihat nama lengkap"
                >
                  ${item.nama}
                </div>

                <div>
                    <span class="${badgeStyle} font-bold text-[10px] px-1.5 py-0.5 rounded inline-block">${item.jk}</span>
                </div>
                <div class="bg-indigo-50 text-indigo-700 py-1 px-2 rounded-md font-semibold text-xs">${item.halaman}</div>
            </div>
        `;
    })
    .join("");
}

// Fungsi untuk melebarkan nama dan menutupi kolom JK & Halaman saat diklik
function toggleName(element) {
  // Mengecek apakah nama sedang dalam kondisi terpotong (truncate)
  const isTruncated = element.classList.contains("truncate");

  if (isTruncated) {
    // Hilangkan pemotongan (...) dan lebarkan menutupi 3 kolom ke kanan
    element.classList.remove("truncate");
    element.classList.add(
      "col-span-3",
      "bg-white",
      "z-10",
      "shadow-sm",
      "rounded",
      "py-1",
    );
  } else {
    // Kembalikan ke tampilan semula (terpotong 58%)
    element.classList.add("truncate");
    element.classList.remove(
      "col-span-3",
      "bg-white",
      "z-10",
      "shadow-sm",
      "rounded",
      "py-1",
    );
  }
}

document.addEventListener("DOMContentLoaded", renderTable);

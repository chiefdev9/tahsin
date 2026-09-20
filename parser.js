// ==========================================
// PARSER CSV ROBUST & FETCH DATA
// ==========================================

import { CSV_URL, cleanNamaGuru, setMuridList } from "./state.js";

export function parseCSV(csvText) {
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
  let idxHalaman = headers.findIndex(
    (h) => h.includes("halaman") || h.includes("hlm"),
  );
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

export async function loadDataFromCSV(onSuccess, onError) {
  const container = document.getElementById("table-body");
  if (container) {
    container.innerHTML = `
      <div class="p-8 text-center text-gray-400 font-medium text-xs">
        Memuat data murid...
      </div>
    `;
  }

  // 1. Ambil data editan lokal dari localStorage (jika ada)
  const localCacheRaw = localStorage.getItem("muridDataCache");
  let localCacheMap = {};
  if (localCacheRaw) {
    try {
      const localCacheArr = JSON.parse(localCacheRaw);
      localCacheArr.forEach((m) => {
        if (m.nama && m.halaman) {
          localCacheMap[m.nama.trim().toLowerCase()] = m.halaman;
        }
      });
    } catch (e) {
      console.error("Gagal membaca cache lokal:", e);
    }
  }

  try {
    const response = await fetch(CSV_URL);
    if (!response.ok)
      throw new Error("Gagal mengambil data dari Google Sheets");

    const csvText = await response.text();
    const parsedData = parseCSV(csvText);

    // 2. Gabungkan (Merge): Terapkan editan lokal terbaru jika CSV masih memuat data lama
    const mergedData = parsedData.map((item) => {
      const namaKey = (item.nama || "").trim().toLowerCase();
      if (
        localCacheMap.hasOwnProperty(namaKey) &&
        localCacheMap[namaKey] !== ""
      ) {
        // Gunakan halaman editan lokal dari HP guru
        item.halaman = localCacheMap[namaKey];
      }
      return item;
    });

    // 3. Simpan state dan perbarui cache
    setMuridList(mergedData);
    localStorage.setItem("muridDataCache", JSON.stringify(mergedData));

    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error loading CSV:", error);

    // Fallback: Jika offline/gagal fetch CSV, tetap tampilkan data dari localStorage
    if (localCacheRaw) {
      setMuridList(JSON.parse(localCacheRaw));
      if (onSuccess) onSuccess();
    } else {
      if (container) {
        container.innerHTML = `
          <div class="p-8 text-center text-red-500 font-medium text-xs">
            Gagal memuat data murid. Silakan periksa koneksi internet atau link CSV.
          </div>
        `;
      }
      if (onError) onError(error);
    }
  }
}
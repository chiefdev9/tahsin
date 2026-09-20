// ==========================================
// PARSER CSV ROBUST & FETCH DATA (HYBRID FIREBASE)
// ==========================================

import { CSV_URL, cleanNamaGuru, setMuridList } from "./state.js";

// URL Firebase Realtime Database kamu
const FIREBASE_DB_URL =
  "https://tahsinsmala-default-rtdb.asia-southeast1.firebasedatabase.app";

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

  try {
    // 1. Ambil data struktur utama (Nama, Guru, Kelas, Jilid) dari CSV Google Sheets
    const response = await fetch(CSV_URL);
    if (!response.ok)
      throw new Error("Gagal mengambil data dari Google Sheets");

    const csvText = await response.text();
    const parsedData = parseCSV(csvText);

    // 2. Ambil data Halaman paling real-time dari Firebase
    let firebaseMap = {};
    try {
      const fbResponse = await fetch(`${FIREBASE_DB_URL}/murids.json`);
      if (fbResponse.ok) {
        firebaseMap = (await fbResponse.json()) || {};
      }
    } catch (fbErr) {
      console.warn(
        "⚠️ Gagal mengambil dari Firebase, fallback ke data CSV:",
        fbErr,
      );
    }

    // 3. Gabungkan (Merge): Timpa 'halaman' CSV dengan data real-time Firebase
    const mergedData = parsedData.map((item) => {
      if (item.nama) {
        const key = item.nama.toLowerCase().replace(/[.#$\[\]]/g, "_");
        if (firebaseMap[key] && firebaseMap[key].halaman !== undefined) {
          item.halaman = firebaseMap[key].halaman; // Timpa dengan data Firebase terbaru
        }
      }
      return item;
    });

    // 4. Simpan ke State Utama
    setMuridList(mergedData);

    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error loading data:", error);

    if (container) {
      container.innerHTML = `
        <div class="p-8 text-center text-red-500 font-medium text-xs">
          Gagal memuat data murid. Silakan periksa koneksi internet.
        </div>
      `;
    }
    if (onError) onError(error);
  }
}

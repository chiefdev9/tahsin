// ==========================================
// PARSER CSV ROBUST & FETCH DATA (HYBRID FIREBASE REALTIME)
// ==========================================

import {
  CSV_URL,
  FIREBASE_DB_URL,
  cleanNamaGuru,
  formatFirebaseKey,
  setMuridList,
  muridList,
} from "./state.js";

let eventSource = null;

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

// ⚡ FUNGSI REAL-TIME LISTENER (FIREBASE SSE)
export function listenFirebaseUpdates(onUpdateCallback) {
  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSource(`${FIREBASE_DB_URL}/murids.json`);

  eventSource.addEventListener("put", (event) => {
    try {
      if (!event.data) return;
      const parsedEvent = JSON.parse(event.data);
      if (!parsedEvent || parsedEvent.data === undefined) return;

      const path = parsedEvent.path;
      const value = parsedEvent.data;

      let isChanged = false;

      if (path === "/") {
        if (value) {
          Object.keys(value).forEach((key) => {
            const item = value[key];
            const murid = muridList.find(
              (m) => formatFirebaseKey(m.nama) === key,
            );
            if (
              murid &&
              item.halaman !== undefined &&
              murid.halaman !== item.halaman
            ) {
              murid.halaman = item.halaman;
              isChanged = true;
            }
          });
        }
      } else {
        const pathSegments = path.replace(/^\//, "").split("/");
        const key = pathSegments[0];
        const murid = muridList.find((m) => formatFirebaseKey(m.nama) === key);

        if (murid) {
          if (pathSegments.length === 1) {
            if (
              typeof value === "object" &&
              value !== null &&
              value.halaman !== undefined
            ) {
              if (murid.halaman !== value.halaman) {
                murid.halaman = value.halaman;
                isChanged = true;
              }
            }
          } else if (pathSegments[1] === "halaman") {
            if (murid.halaman !== value) {
              murid.halaman = value;
              isChanged = true;
            }
          }
        }
      }

      // Hanya re-render UI jika benar-benar ada perubahan data
      if (isChanged && onUpdateCallback) {
        onUpdateCallback();
      }
    } catch (err) {
      console.error("❌ Gagal memproses pembaruan Firebase:", err);
    }
  });

  eventSource.onerror = (err) => {
    console.warn(
      "⚠️ Koneksi real-time Firebase terputus/mencoba menghubungkan ulang...",
      err,
    );
  };
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
    const response = await fetch(CSV_URL);
    if (!response.ok)
      throw new Error("Gagal mengambil data dari Google Sheets");

    const csvText = await response.text();
    const parsedData = parseCSV(csvText);

    let firebaseMap = {};
    try {
      const fbResponse = await fetch(`${FIREBASE_DB_URL}/murids.json`);
      if (fbResponse.ok) {
        firebaseMap = (await fbResponse.json()) || {};
      }
    } catch (fbErr) {
      console.warn("⚠️ Gagal mengambil data awal dari Firebase:", fbErr);
    }

    const mergedData = parsedData.map((item) => {
      if (item.nama) {
        const key = formatFirebaseKey(item.nama);
        if (firebaseMap[key] && firebaseMap[key].halaman !== undefined) {
          item.halaman = firebaseMap[key].halaman;
        }
      }
      return item;
    });

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

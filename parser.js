// ==========================================
// PARSER CSV ROBUST & SUPABASE REALTIME SYNC
// ==========================================

import { CSV_URL, cleanNamaGuru, setMuridList, muridList } from "./state.js";
import { supabase } from "./supabaseClient.js";
import { renderTable } from "./ui.js";

// ==========================================
// FUNGSI 1: PARSER CSV UTAMA
// ==========================================
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

// ==========================================
// FUNGSI 2: AUTO-SYNC SUPABASE & LOAD DATA
// ==========================================
export async function loadDataFromCSV(onSuccess, onError) {
  const container = document.getElementById("table-body");
  const CACHE_KEY = "cache_murid_tahsin";

  let hasCachedData = false;

  try {
    // 1. STALE: Cek apakah ada cache lokal
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      try {
        const parsedCache = JSON.parse(cachedData);
        if (Array.isArray(parsedCache) && parsedCache.length > 0) {
          hasCachedData = true;
          // Render data lama secara instan (0 detik untuk kunjungan berikutnya)
          setMuridList(parsedCache);
          if (onSuccess) onSuccess();
        }
      } catch (e) {
        console.error("Gagal memparsing cache lokal:", e);
      }
    }

    // 2. Jika TIDAK ADA CACHE (User Baru / Cache Kosong), tampilkan Skeleton Loading
    if (!hasCachedData && container) {
      let skeletonHTML = "";
      for (let i = 0; i < 5; i++) {
        skeletonHTML += `
          <tr class="animate-pulse border-b border-gray-100">
            <td class="p-4"><div class="h-3 bg-gray-200 rounded w-6"></div></td>
            <td class="p-4"><div class="h-3 bg-gray-200 rounded w-32"></div></td>
            <td class="p-4"><div class="h-3 bg-gray-200 rounded w-8"></div></td>
            <td class="p-4"><div class="h-3 bg-gray-200 rounded w-16"></div></td>
          </tr>
        `;
      }
      container.innerHTML = skeletonHTML;
    }

    // 3. REVALIDATE: Tarik data terbaru dari CSV Google Sheets dan sinkronisasi Supabase di latar belakang
    const response = await fetch(CSV_URL);
    if (!response.ok)
      throw new Error("Gagal mengambil data dari Google Sheets");

    const csvText = await response.text();
    const parsedData = parseCSV(csvText);

    const namaCsvList = parsedData
      .map((m) => m.nama)
      .filter((nama) => nama !== "");

    // Ambil data progres dari database Supabase
    const { data: supabaseData, error: fetchError } = await supabase
      .from("progres_murid")
      .select("nama_siswa, hlm_saat_ini");

    if (fetchError) throw fetchError;

    const supabaseMap = {};
    const supabaseNamaList = [];
    if (supabaseData) {
      supabaseData.forEach((row) => {
        supabaseMap[row["nama_siswa"]] = row["hlm_saat_ini"];
        supabaseNamaList.push(row["nama_siswa"]);
      });
    }

    // Sinkronisasi data baru / hapus ke Supabase
    const muridBaru = namaCsvList
      .filter((nama) => !supabaseNamaList.includes(nama))
      .map((nama) => ({ nama_siswa: nama, hlm_saat_ini: "-" }));

    const muridHapus = supabaseNamaList.filter(
      (nama) => !namaCsvList.includes(nama),
    );

    const promises = [];
    if (muridBaru.length > 0) {
      promises.push(supabase.from("progres_murid").insert(muridBaru));
    }
    if (muridHapus.length > 0) {
      promises.push(
        supabase.from("progres_murid").delete().in("nama_siswa", muridHapus),
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    const { data: refreshedData } = await supabase
      .from("progres_murid")
      .select("nama_siswa, hlm_saat_ini");

    if (refreshedData) {
      refreshedData.forEach((row) => {
        supabaseMap[row["nama_siswa"]] = row["hlm_saat_ini"];
      });
    }

    // Gabungkan data akhir
    const finalData = parsedData.map((murid) => ({
      ...murid,
      halaman: supabaseMap[murid.nama] ?? "-",
    }));

    // Simpan ke localStorage untuk kunjungan berikutnya
    localStorage.setItem(CACHE_KEY, JSON.stringify(finalData));

    // Perbarui UI dengan data real-time terbaru
    setMuridList(finalData);
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error loading and syncing data:", error);

    // Jika belum ada cache sama sekali dan terjadi error
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (!cachedData && container) {
      container.innerHTML = `
        <div class="p-8 text-center text-red-500 font-medium text-xs">
          Gagal memuat data murid. Silakan periksa koneksi internet atau link CSV.
        </div>
      `;
    }
    if (onError) onError(error);
  }
}

// ==========================================
// FUNGSI 3: REAL-TIME LISTENER SUPABASE (DENGAN AUTO-RECONNECT)
// ==========================================
export function initRealtimeSync() {
  const channel = supabase.channel("public:progres_murid");

  channel
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "progres_murid" },
      (payload) => {
        const updatedRow = payload.new;
        const namaDiubah = updatedRow.nama_siswa;
        const halamanBaru = updatedRow.hlm_saat_ini;

        const targetMurid = muridList.find((m) => m.nama === namaDiubah);
        if (targetMurid) {
          targetMurid.halaman = halamanBaru;

          if (typeof renderTable === "function") {
            renderTable();
          }
        }
      }
    )
    .subscribe((status) => {
      // Jika koneksi terputus di HP (misal layar mati/pindah jaringan), coba hubungkan kembali
      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        console.warn("Koneksi Realtime terputus, mencoba menghubungkan ulang...");
        setTimeout(() => {
          channel.subscribe();
        }, 3000);
      }
    });
}
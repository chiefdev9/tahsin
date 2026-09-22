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

  try {
    // 1. Ambil data dari CSV / Google Sheets (biasanya ini cepat)
    const response = await fetch(CSV_URL);
    if (!response.ok)
      throw new Error("Gagal mengambil data dari Google Sheets");

    const csvText = await response.text();
    const parsedData = parseCSV(csvText);

    // Tampilkan data ke UI SEGERA agar pengguna tidak menunggu lama menatap spinner
    setMuridList(parsedData);
    if (onSuccess) onSuccess();

    // 2. Jalankan sinkronisasi Supabase di latar belakang (Background Sync)
    // Menggunakan setTimeout/Promise agar tidak memblokir render utama
    setTimeout(async () => {
      try {
        const namaCsvList = parsedData
          .map((m) => m.nama)
          .filter((n) => n !== "");

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

        // Cek data baru & data hapus
        const muridBaru = namaCsvList
          .filter((nama) => !supabaseNamaList.includes(nama))
          .map((nama) => ({ nama_siswa: nama, hlm_saat_ini: "-" }));

        const muridHapus = supabaseNamaList.filter(
          (nama) => !namaCsvList.includes(nama),
        );

        // Eksekusi database di background
        const promises = [];
        if (muridBaru.length > 0) {
          promises.push(supabase.from("progres_murid").insert(muridBaru));
        }
        if (muridHapus.length > 0) {
          promises.push(
            supabase
              .from("progres_murid")
              .delete()
              .in("nama_siswa", muridHapus),
          );
        }

        if (promises.length > 0) {
          await Promise.all(promises);

          // Refresh ulang data halaman dari Supabase setelah sinkronisasi selesai
          const { data: refreshedData } = await supabase
            .from("progres_murid")
            .select("nama_siswa, hlm_saat_ini");

          if (refreshedData) {
            refreshedData.forEach((row) => {
              supabaseMap[row["nama_siswa"]] = row["hlm_saat_ini"];
            });

            const finalData = parsedData.map((murid) => ({
              ...murid,
              halaman: supabaseMap[murid.nama] ?? "-",
            }));

            setMuridList(finalData);
            if (onSuccess) onSuccess();
          }
        }
      } catch (bgError) {
        console.error("Sinkronisasi latar belakang gagal:", bgError);
      }
    }, 50);
  } catch (error) {
    console.error("Error loading CSV:", error);
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
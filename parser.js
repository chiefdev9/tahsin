// ==========================================
// PARSER CSV ROBUST & FETCH DATA + SUPABASE SYNC
// ==========================================

import { CSV_URL, cleanNamaGuru, setMuridList } from "./state.js";
import { supabase } from "./supabaseClient.js"; // Mengimpor koneksi Supabase yang telah dibuat

// ==========================================
// FUNGSI 1: PARSER CSV UTAMA
// ==========================================
export function parseCSV(csvText) {
  const lines = [];
  let row = [];
  let inQuotes = false;
  let currentToken = "";

  // Iterasi karakter demi karakter untuk menangani tanda kutip ganda dan baris baru dalam CSV secara aman
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

  // Mendeteksi posisi kolom berdasarkan header CSV
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

  // Memetakan baris data mentah CSV menjadi objek JavaScript yang terstruktur
  for (let i = 1; i < lines.length; i++) {
    const rowData = lines[i];
    if (!rowData || rowData.length === 0) continue;

    let obj = {};

    obj["nama"] = rowData[idxNama] || "";
    obj["jk"] = rowData[idxJK] || "-";
    obj["kelas"] = idxKelas !== -1 ? rowData[idxKelas] : "-";
    obj["jilid"] = idxSaatIni !== -1 ? rowData[idxSaatIni] : "-";
    obj["halaman"] = idxHalaman !== -1 ? rowData[idxHalaman] : "-"; // Nilai default sementara sebelum disinkronkan dengan Supabase

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
  if (container) {
    container.innerHTML = `
      <div class="p-8 text-center text-gray-400 font-medium text-xs">
        Memuat dan menyinkronkan data murid...
      </div>
    `;
  }

  try {
    // 1. Ambil data mentah dari Google Sheets / CSV
    const response = await fetch(CSV_URL);
    if (!response.ok)
      throw new Error("Gagal mengambil data dari Google Sheets");

    const csvText = await response.text();
    const parsedData = parseCSV(csvText);

    // Ambil daftar nama unik dari CSV sebagai acuan master data utama
    const namaCsvList = parsedData
      .map((m) => m.nama)
      .filter((nama) => nama !== "");

    // 2. Ambil data progres yang sudah ada di database Supabase
    const { data: supabaseData, error: fetchError } = await supabase
      .from("progres_murid")
      .select("Nama Siswa, Hlm Saat Ini");

    if (fetchError) throw fetchError;

    // Buat kamus (Map) untuk pencarian data halaman dari Supabase dengan cepat
    const supabaseMap = {};
    if (supabaseData) {
      supabaseData.forEach((row) => {
        supabaseMap[row["Nama Siswa"]] = row["Hlm Saat Ini"];
      });
    }

    const supabaseNamaList = supabaseData
      ? supabaseData.map((row) => row["Nama Siswa"])
      : [];

    // 3. Penjaga Gerbang Awal: Deteksi dan masukkan Murid Baru ke Supabase
    const muridBaru = namaCsvList
      .filter((nama) => !supabaseNamaList.includes(nama))
      .map((nama) => ({ "Nama Siswa": nama, "Hlm Saat Ini": "-" }));

    if (muridBaru.length > 0) {
      const { error: insertError } = await supabase
        .from("progres_murid")
        .insert(muridBaru);

      if (insertError)
        console.error("Gagal menambahkan murid baru ke Supabase:", insertError);
    }

    // 4. Penjaga Gerbang Pembersihan: Hapus baris murid yang sudah tidak aktif/dihapus dari CSV
    const muridHapus = supabaseNamaList.filter(
      (nama) => !namaCsvList.includes(nama),
    );

    if (muridHapus.length > 0) {
      const { error: deleteError } = await supabase
        .from("progres_murid")
        .delete()
        .in("Nama Siswa", muridHapus);

      if (deleteError)
        console.error(
          "Gagal membersihkan data murid lama di Supabase:",
          deleteError,
        );
    }

    // 5. Gabungkan data halaman dari Supabase ke dalam objek murid yang akan ditampilkan di aplikasi
    const finalData = parsedData.map((murid) => {
      return {
        ...murid,
        // Jika data halaman di Supabase tersedia, gunakan itu. Jika tidak, fallback ke "-"
        halaman:
          supabaseMap[murid.nama] !== undefined &&
          supabaseMap[murid.nama] !== null
            ? supabaseMap[murid.nama]
            : "-",
      };
    });

    // Simpan data gabungan ke state aplikasi
    setMuridList(finalData);

    if (onSuccess) onSuccess();
  } catch (error) {
    console.error("Error loading and syncing data:", error);
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

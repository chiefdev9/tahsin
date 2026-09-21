// ==========================================
// FUNGSI REALTIME LISTENER SUPABASE
// ==========================================
export function initRealtimeSync() {
  supabase
    .channel("public:progres_murid")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "progres_murid" },
      (payload) => {
        const updatedRow = payload.new;
        const namaDiubah = updatedRow.nama_siswa;
        const halamanBaru = updatedRow.hlm_saat_ini;

        // 1. Cari murid di state lokal dan perbarui nilainya secara instan
        const targetMurid = muridList.find((m) => m.nama === namaDiubah);
        if (targetMurid) {
          targetMurid.halaman = halamanBaru;

          // 2. Jika guru yang sedang aktif melihat daftar yang mencakup murid ini, render ulang tabel seketika
          renderTable();
        }
      },
    )
    .subscribe();
}

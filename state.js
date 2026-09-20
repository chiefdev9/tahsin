// ⚡ FUNGSI REAL-TIME LISTENER (FIREBASE SSE)
export function listenFirebaseUpdates(onUpdateCallback) {
  if (eventSource) {
    eventSource.close();
  }

  eventSource = new EventSource(`${FIREBASE_DB_URL}/murids.json`);

  eventSource.addEventListener("put", (event) => {
    try {
      const parsedEvent = JSON.parse(event.data);
      if (!parsedEvent || parsedEvent.data === undefined) return;

      const path = parsedEvent.path; // Misal: "/" atau "/ahmad_n_" atau "/ahmad_n_/halaman"
      const value = parsedEvent.data;

      if (path === "/") {
        // Sinkronisasi penuh saat koneksi pertama
        if (value) {
          Object.keys(value).forEach((key) => {
            const item = value[key];
            const murid = muridList.find(
              (m) => formatFirebaseKey(m.nama) === key,
            );
            if (murid && item.halaman !== undefined) {
              murid.halaman = item.halaman;
            }
          });
        }
      } else {
        // Tangani update parsial dari HP (misal path: "/ahmad_n_" atau "/ahmad_n_/halaman")
        const pathSegments = path.replace(/^\//, "").split("/");
        const key = pathSegments[0];

        const murid = muridList.find((m) => formatFirebaseKey(m.nama) === key);

        if (murid) {
          if (pathSegments.length === 1) {
            // Path: /key (mengirim objek { nama, halaman })
            if (
              typeof value === "object" &&
              value !== null &&
              value.halaman !== undefined
            ) {
              murid.halaman = value.halaman;
            }
          } else if (pathSegments[1] === "halaman") {
            // Path: /key/halaman (langsung bernilai string/angka)
            murid.halaman = value;
          }
        }
      }

      // ⚡ RE-RENDER TABEL SECARA INSTAN DI LAPTOP
      if (onUpdateCallback) {
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

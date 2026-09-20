// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFI6U5vmv_kyAABegpWD8fDUAcBE2ku3M",
  authDomain: "tahsinsmala.firebaseapp.com",
  databaseURL:
    "https://tahsinsmala-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "tahsinsmala",
  storageBucket: "tahsinsmala.firebasestorage.app",
  messagingSenderId: "177359484208",
  appId: "1:177359484208:web:d0c7f1d5e908b06ef584f5",
  measurementId: "G-2EP1NHESK9",
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

/**
 * Fungsi untuk menyimpan perubahan halaman ke Firebase
 */
export function saveHalamanToFirebase(namaMurid, keyKategori, newValue) {
  // Buat nama agar aman dijadikan kunci di Firebase (tanpa titik/karakter aneh)
  const safeNamaKey = namaMurid.replace(/[.#$\[\]]/g, "_");

  const pageRef = ref(db, `murid_updates/${safeNamaKey}/${keyKategori}`);
  return set(pageRef, newValue);
}

/**
 * Fungsi untuk mendengarkan perubahan data realtime dari Firebase
 */
export function listenToFirebaseUpdates(onDataUpdate) {
  const updatesRef = ref(db, "murid_updates");
  onValue(updatesRef, (snapshot) => {
    const data = snapshot.val() || {};
    onDataUpdate(data);
  });
}

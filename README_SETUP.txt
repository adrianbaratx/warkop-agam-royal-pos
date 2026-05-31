WARKOP AGAM ROYAL POS - FINAL
==============================

FITUR
-----
1. Dashboard kasir.
2. QR self-order untuk 30 meja.
3. Konsumen scan QR lalu pilih menu.
4. Pesanan masuk ke kasir.
5. Kasir bisa ubah status:
   - Pesanan Baru
   - Diproses
   - Siap Diantar
   - Selesai
6. Metode pembayaran:
   - Cash
   - QRIS
   - Transfer
   - E-Wallet
7. Print struk.
8. Mode demo lokal.
9. Siap disambungkan ke Firebase untuk realtime HP konsumen -> laptop kasir.

CARA MENJALANKAN
----------------
1. Extract ZIP.
2. Buka terminal di folder hasil extract:
   warkop-royal-pos-final

3. Jalankan:
   npm install

4. Jalankan:
   npm start

5. Buka:
   http://localhost:3000

HALAMAN
-------
Dashboard kasir:
http://localhost:3000

Halaman konsumen meja 1:
http://localhost:3000/order?table=1

Halaman konsumen meja 2:
http://localhost:3000/order?table=2

CARA UJI QR DARI HP
-------------------
Kalau masih localhost, HP tidak bisa membuka localhost laptop.

Di dashboard kasir, ganti Base URL:
http://localhost:3000

menjadi IP laptop, contoh:
http://192.168.1.10:3000

Maka QR akan berisi:
http://192.168.1.10:3000/order?table=1

Pastikan HP dan laptop berada di WiFi yang sama.

MODE FIREBASE REALTIME
----------------------
Agar pesanan dari HP konsumen masuk realtime ke dashboard kasir:

1. Buka Firebase Console.
2. Buat project baru.
3. Tambahkan Web App.
4. Copy firebaseConfig.
5. Paste ke:
   src/firebase.js

6. Buat Firestore Database.
7. Untuk testing, pakai isi:
   firestore.rules.txt

8. Restart server:
   Ctrl + C
   npm start

CATATAN
-------
Selama firebase.js masih berisi "ISI_...", aplikasi tetap jalan,
tetapi hanya mode demo lokal di browser yang sama.

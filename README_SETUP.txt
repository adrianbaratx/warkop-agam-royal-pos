SISTEM KASIR WARKOP AGAM ROYAL
================================

Fitur:
1. Dashboard kasir.
2. QR untuk 30 meja.
3. Konsumen scan QR lalu masuk halaman order.
4. Konsumen pilih menu dan kirim pesanan.
5. Pesanan masuk ke kasir.
6. Kasir ubah status pesanan, bayar, dan print struk.
7. Mendukung mode demo lokal dan mode Firebase realtime.

CARA PASANG DI PROYEK YANG SUDAH ADA
====================================

1. Buka folder:
   D:\warkop_agam_royal\warkop-royal-pos

2. Install package tambahan:
   npm install firebase react-qr-code

3. Kalau Tailwind belum aktif, jalankan:
   npm install -D tailwindcss@3 postcss autoprefixer
   npx tailwindcss init

4. Copy file:
   - src/App.js
   - src/CustomerOrder.jsx
   - src/KasirDashboard.jsx
   - src/MenuData.js
   - src/firebase.js
   - src/index.css
   - src/index.js
   - tailwind.config.js

   ke proyek kamu. Kalau diminta replace, pilih replace.

5. Jalankan:
   npm start

HALAMAN
=======

Dashboard kasir:
http://localhost:3000

Halaman konsumen meja 1:
http://localhost:3000/order?table=1

Halaman konsumen meja 2:
http://localhost:3000/order?table=2

PENTING UNTUK SCAN QR DARI HP
=============================

Kalau HP konsumen scan QR dan masih pakai localhost, biasanya tidak bisa.
Gunakan IP laptop di WiFi yang sama.

Contoh:
http://192.168.1.10:3000/order?table=1

Di dashboard kasir ada kolom base URL.
Ganti:
http://localhost:3000

menjadi:
http://IP-LAPTOP-KAMU:3000

Contoh:
http://192.168.1.10:3000

FIREBASE REALTIME
=================

Agar pesanan dari HP konsumen benar-benar masuk realtime ke laptop kasir,
isi konfigurasi Firebase di file:

src/firebase.js

Selama konfigurasi Firebase belum diisi, aplikasi jalan dalam mode demo lokal.
Mode demo lokal hanya cocok untuk uji coba di browser/laptop yang sama.

Langkah Firebase singkat:
1. Buka Firebase Console.
2. Buat project baru.
3. Tambahkan Web App.
4. Copy firebaseConfig.
5. Paste ke src/firebase.js.
6. Buat Firestore Database.
7. Untuk testing, gunakan rules dari file firestore.rules.txt.
8. Jalankan npm start lagi.

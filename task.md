# Task Plan — Rencana Kerja 8 Minggu
## Pengembangan Sistem Manajemen Salon (Skripsi)

**Versi Dokumen:** 1.0
**Referensi:** PRD Sistem Manajemen Salon v1.0, ERD Sistem Manajemen Salon v1.0
**Metodologi:** Iterative/Incremental (mendekati Agile ringan — sesuai untuk pengembang tunggal dengan bantuan AI agent di Antigravity)

---

## 1. Prinsip Penyusunan Jadwal

Sebelum masuk ke rincian mingguan, ada tiga prinsip yang mendasari urutan pengerjaan — ini penting dicantumkan di laporan skripsi sebagai justifikasi metodologis, bukan sekadar daftar tugas:

1. **Skema data mendahului fitur.** ERD (7 tabel inti) harus stabil sebelum modul apa pun dibangun, karena perubahan skema di tengah jalan (mis. menambah kolom pada `bookings`) berisiko memaksa refactor pada banyak komponen sekaligus.
2. **Keamanan (RLS) dibangun bersamaan dengan tabel, bukan ditambahkan belakangan.** Menunda RLS ke akhir proyek adalah kesalahan umum yang menyebabkan modul harus diuji ulang dari nol. RLS didefinisikan di Minggu 1, langsung menyatu dengan `CREATE TABLE`.
3. **Must Have selesai sebelum Should Have disentuh.** Sesuai kerangka MoSCoW pada PRD, modul waitlist dan preferensi pelanggan (Should Have) baru dikerjakan setelah booking dan transaksi (Must Have) benar-benar stabil dan teruji — bukan dikerjakan paralel.

**Catatan kritis soal realisme jadwal:** Delapan minggu untuk pengembang tunggal (dibantu AI agent) tergolong ketat jika seluruh fitur Should Have dan Could Have dipaksakan masuk. Rencana di bawah ini mengalokasikan **Minggu 8 sebagai buffer**, bukan minggu fitur baru — ini disengaja, karena rencana kerja yang tidak menyisakan waktu untuk bug fixing/testing adalah tanda perencanaan yang terlalu optimis.

---

## 2. Ringkasan Peta Mingguan

| Minggu | Fokus Utama | Kategori MoSCoW | Output Utama |
|---|---|---|---|
| 1 | Setup proyek, skema database, RLS | Fondasi | Database + RLS aktif, CI/CD jalan |
| 2 | Autentikasi & manajemen profil | Must Have | Registrasi, login, role-based routing |
| 3 | Manajemen layanan & staf (Admin) | Must Have | CRUD services, staff, availability |
| 4 | Modul booking (Customer) | Must Have | Booking flow + anti double-booking |
| 5 | Transaksi (Staff) & notifikasi email | Must Have | Pencatatan pembayaran, email otomatis |
| 6 | Profil pelanggan, waitlist, reschedule | Should Have | CRM dasar, waitlist |
| 7 | Dashboard laporan & testing menyeluruh | Must Have + QA | Reporting, bug fixing |
| 8 | UAT, dokumentasi, deployment final, buffer | Buffer/QA | Sistem siap sidang + dokumen skripsi |

---

## 3. Rincian Mingguan

### Minggu 1 — Fondasi: Setup & Skema Database
**Tujuan:** Lingkungan pengembangan siap, skema database (ERD) terimplementasi penuh dengan RLS aktif sejak awal.

| # | Tugas | Referensi | Estimasi |
|---|---|---|---|
| 1.1 | Inisialisasi proyek Next.js (App Router) + struktur folder | — | 0.5 hari |
| 1.2 | Setup proyek Supabase (database, Auth provider email/password) | FR-1.1–1.4 | 0.5 hari |
| 1.3 | Implementasi `CREATE TABLE` untuk 7 tabel inti (`profiles`, `services`, `staff_availability`, `bookings`, `transactions`, `waitlist`, `customer_preferences`) | ERD Bagian 3 | 1.5 hari |
| 1.4 | Implementasi unique index anti double-booking pada `bookings` | ERD Bagian 3.4 | 0.5 hari |
| 1.5 | Implementasi RLS policy untuk seluruh tabel inti + fungsi helper `is_admin()`, `is_staff()` | ERD Bagian 5 | 1.5 hari |
| 1.6 | Setup repository GitHub + koneksi CI/CD ke Netlify (environment variable disetel di dashboard Netlify, **bukan** di kode) | Insiden kebocoran API key sebelumnya | 0.5 hari |
| 1.7 | Setup Antigravity workspace, hubungkan ke repo | — | 0.5 hari |

**Kriteria selesai (Definition of Done):** Seluruh tabel dapat diakses via Supabase client dari Next.js; percobaan mengakses data lintas customer melalui akun berbeda **gagal** (RLS terbukti berfungsi, diuji manual).

**Risiko:** Kesalahan penulisan RLS policy sering baru terdeteksi saat fitur dibangun. Mitigasi: uji setiap policy dengan minimal 2 skenario (akses sah & akses tidak sah) sebelum lanjut ke Minggu 2.

---

### Minggu 2 — Modul Autentikasi & Profil
**Tujuan:** Tiga role dapat login sesuai haknya masing-masing; registrasi customer berjalan sesuai keputusan "sederhana namun aman".

| # | Tugas | Referensi |
|---|---|---|
| 2.1 | Halaman registrasi customer (email, password, nama, telepon opsional) | FR-1.1 |
| 2.2 | Trigger database: baris baru di `auth.users` otomatis membuat baris `profiles` dengan `role = 'customer'` (role **tidak** dikirim dari client) | FR-1.1, ERD 3.1 |
| 2.3 | Halaman login (email/password) + opsi magic link | FR-1.3 |
| 2.4 | Middleware Next.js untuk proteksi rute berdasarkan `role` (redirect sesuai dashboard masing-masing) | FR-1.4 |
| 2.5 | Panel Admin: form pembuatan akun Staff (bukan self-register) | FR-1.2 |
| 2.6 | Halaman profil dasar (edit nama, telepon) | — |

**Kriteria selesai:** Customer, Staff, dan Admin masing-masing hanya bisa mengakses dashboard sesuai role-nya; percobaan akses langsung via URL ke dashboard role lain menghasilkan redirect/403.

---

### Minggu 3 — Manajemen Layanan & Staf (Admin)
**Tujuan:** Admin memiliki kontrol penuh atas katalog layanan dan data staf sebagai prasyarat modul booking di Minggu 4.

| # | Tugas | Referensi |
|---|---|---|
| 3.1 | CRUD layanan (nama, kategori, durasi, harga) | FR-2.1 |
| 3.2 | Soft delete layanan (`is_active`) | FR-2.2 |
| 3.3 | CRUD akun staff (aktif/nonaktif) | FR-3.1 |
| 3.4 | Form pengaturan jam kerja staf (`staff_availability`) | FR-3.2 |
| 3.5 | Halaman daftar layanan publik (dapat dilihat customer sebelum booking) | — |

**Kriteria selesai:** Data layanan dan ketersediaan staf yang dibuat Admin di minggu ini menjadi input langsung bagi validasi slot booking di Minggu 4 — modul ini **harus** selesai lebih dulu karena booking bergantung padanya.

---

### Minggu 4 — Modul Booking (Customer)
**Tujuan:** Fitur inti sistem — booking dengan pencegahan konflik jadwal, sesuai temuan bahwa ini adalah fitur "must-have" paling signifikan di sistem salon manapun.

| # | Tugas | Referensi |
|---|---|---|
| 4.1 | UI pemilihan layanan → staf (opsional) → tanggal → slot waktu tersedia | FR-4.1 |
| 4.2 | Logika perhitungan slot tersedia (gabungan `staff_availability` dan `bookings` yang sudah terisi) | FR-4.1 |
| 4.3 | Validasi server-side terhadap unique index anti double-booking; tangani error dengan pesan yang jelas ke user | FR-4.2, ERD 3.4 |
| 4.4 | Fitur pembatalan booking oleh customer | FR-4.3 |
| 4.5 | State machine status booking (`pending` → `confirmed` → `completed`/`cancelled`) + panel Staff/Admin untuk mengubah status | FR-4.4 |

**Kriteria selesai:** Uji skenario *race condition* — dua permintaan booking bersamaan pada slot & staf yang sama, hanya satu yang berhasil.

**Risiko tertinggi di seluruh proyek:** Bagian ini paling rawan bug logis (perhitungan slot, timezone, overlap waktu). Alokasikan buffer 1 hari ekstra di akhir minggu ini secara internal jika diperlukan, jangan geser ke Minggu 5.

---

### Minggu 5 — Transaksi (Staff Sebagai Kasir) & Notifikasi Email
**Tujuan:** Menutup siklus booking dengan pencatatan pembayaran dan komunikasi otomatis ke customer.

| # | Tugas | Referensi |
|---|---|---|
| 5.1 | Form pencatatan transaksi oleh Staff (dropdown metode: Tunai/Transfer/QRIS manual) | FR-5.1 |
| 5.2 | Relasi 1:1 transaksi–booking, update status booking menjadi `completed` setelah transaksi tercatat | FR-5.2, ERD 3.5 |
| 5.3 | Tampilan invoice sederhana (opsional cetak/PDF) | FR-5.3 |
| 5.4 | Setup Supabase Edge Function/trigger untuk mengirim email via Resend saat booking `confirmed` | FR-6.1 |
| 5.5 | Email pengingat H-1 (dapat menggunakan scheduled function atau cron job sederhana) | FR-6.1 |

**Kriteria selesai:** Seluruh modul Must Have (FR-1 hingga FR-7 versi dasar) telah berfungsi end-to-end. Ini adalah **milestone tengah proyek** — jika di titik ini modul inti belum stabil, modul Should Have di Minggu 6 sebaiknya dikorbankan demi kualitas, bukan sebaliknya.

---

### Minggu 6 — Fitur Should Have: Profil Pelanggan & Waitlist
**Tujuan:** Menambah nilai retensi pelanggan sesuai temuan riset industri, dengan syarat modul inti sudah stabil (lihat catatan Minggu 5).

| # | Tugas | Referensi |
|---|---|---|
| 6.1 | Halaman riwayat kunjungan customer (query `bookings` berstatus `completed`) | FR-8.1 |
| 6.2 | CRUD `customer_preferences` (catatan alergi, staf favorit) | FR-8.2 |
| 6.3 | Tampilan catatan preferensi untuk Staff saat menangani booking | FR-8.2 |
| 6.4 | Fitur waitlist saat slot penuh | FR-9.1 |
| 6.5 | Fitur reschedule booking (reuse logika validasi Minggu 4) | FR-9.2 |

**Keputusan go/no-go:** Jika sampai akhir Minggu 5 modul inti masih memiliki bug terbuka, geser tugas 6.4–6.5 (waitlist/reschedule) ke buffer Minggu 8 dan gunakan Minggu 6 untuk stabilisasi. Tugas 6.1–6.3 (profil & preferensi) tetap diprioritaskan karena effort rendah dan risiko rendah.

---

### Minggu 7 — Dashboard Pelaporan & Pengujian Menyeluruh
**Tujuan:** Melengkapi visibilitas manajerial bagi Admin, sekaligus memulai fase QA sistematis sebelum masuk minggu terakhir.

| # | Tugas | Referensi |
|---|---|---|
| 7.1 | Dashboard ringkasan (pendapatan harian/bulanan, jumlah booking, layanan terpopuler) | FR-7.1 |
| 7.2 | Filter laporan berdasarkan rentang tanggal & staf | FR-7.2 |
| 7.3 | Black Box Testing seluruh modul (uji fungsional per FR, bukan uji kode internal) — cocok dijadikan bagian metodologi pengujian di laporan skripsi | Seluruh FR |
| 7.4 | Uji RLS lanjutan: percobaan akses lintas role dan lintas user secara sistematis, didokumentasikan sebagai tabel hasil pengujian | ERD Bagian 5 |
| 7.5 | Perbaikan bug hasil temuan testing | — |

**Kriteria selesai:** Tabel hasil Black Box Testing (skenario, input, hasil diharapkan, hasil aktual, status pass/fail) — dokumen ini langsung dapat digunakan sebagai lampiran Bab Pengujian di skripsi.

---

### Minggu 8 — Buffer, UAT, Dokumentasi, dan Deployment Final
**Tujuan:** Minggu ini **sengaja tidak dialokasikan untuk fitur baru.** Fokus pada stabilitas sistem dan kelengkapan dokumen skripsi.

| # | Tugas | Referensi |
|---|---|---|
| 8.1 | User Acceptance Testing (UAT) — idealnya melibatkan 1–2 pengguna nyata (mis. staf salon sungguhan) untuk validasi alur | — |
| 8.2 | Perbaikan bug hasil UAT | — |
| 8.3 | Deployment final ke Netlify, verifikasi environment variable produksi | — |
| 8.4 | Penyelesaian dokumentasi teknis (README, panduan deployment) | — |
| 8.5 | Slot cadangan untuk tugas yang tergeser dari minggu sebelumnya (mis. waitlist jika tertunda) | — |
| 8.6 | *(Opsional, hanya jika seluruh hal di atas selesai lebih cepat)* Mulai modul inventaris produk (Could Have) sebagai bab "Pengembangan Lanjutan" | FR-10.1 |

**Kriteria selesai:** Sistem dalam kondisi siap didemonstrasikan saat sidang skripsi, seluruh dokumen (PRD, ERD, laporan pengujian) telah selaras dengan implementasi aktual.

---

## 4. Register Risiko

| Risiko | Kemungkinan | Dampak | Mitigasi |
|---|---|---|---|
| Bug logis pada perhitungan slot booking (Minggu 4) | Tinggi | Tinggi | Alokasi buffer internal, uji race condition secara eksplisit |
| RLS policy salah konfigurasi menyebabkan kebocoran data lintas user | Sedang | Tinggi | Uji policy di Minggu 1 sebelum fitur dibangun, uji ulang sistematis di Minggu 7 |
| Scope creep (memaksakan fitur Could Have masuk sebelum Must Have selesai) | Sedang | Tinggi | Aturan go/no-go eksplisit di akhir Minggu 5 |
| Environment variable/API key ter-commit ke repository publik | Rendah (sudah pernah terjadi sekali) | Tinggi | `.gitignore` diverifikasi di Minggu 1, secret hanya disetel di dashboard Netlify |
| Waktu pengujian terpotong karena pengembangan fitur molor | Tinggi (umum terjadi di proyek solo) | Sedang | Minggu 8 dikunci sebagai buffer non-fitur, bukan opsi |

---

## 5. Pemetaan terhadap Bab Skripsi (Referensi)

| Minggu | Dapat Dipetakan ke Bab Skripsi |
|---|---|
| 1–3 | Bab III — Analisis dan Perancangan Sistem (skema database, RLS, arsitektur) |
| 4–6 | Bab IV — Implementasi Sistem |
| 7 | Bab V — Pengujian Sistem (Black Box Testing) |
| 8 | Bab VI — Penutup (kesimpulan, saran/pengembangan lanjutan) |

---

## 6. Kesimpulan

Rencana kerja ini menempatkan seluruh fitur **Must Have** selesai pada akhir Minggu 5, memberi ruang dua minggu (6–7) untuk fitur **Should Have** dan pengujian sebelum masuk buffer akhir di Minggu 8. Struktur ini secara sengaja tidak mengisi penuh kalender dengan fitur baru — pengalaman umum pada proyek skripsi solo menunjukkan bahwa jadwal tanpa buffer eksplisit hampir selalu menyebabkan fase pengujian dikorbankan, yang berdampak langsung pada kualitas Bab Pengujian di laporan akhir.

**Rekomendasi:** Evaluasi progres secara eksplisit di akhir Minggu 5 (milestone tengah) dan Minggu 7 (sebelum buffer), untuk memutuskan lebih awal apakah modul Should Have/Could Have perlu dipangkas — bukan menunggu hingga Minggu 8 untuk menyadari keterlambatan.
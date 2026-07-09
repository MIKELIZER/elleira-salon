# Product Requirements Document (PRD)
## Sistem Manajemen Salon Berbasis Web

**Versi Dokumen:** 1.0
**Tanggal:** Juli 2026
**Tech Stack:** Next.js (App Router), Supabase (PostgreSQL + Auth + Storage), Netlify (Hosting), Antigravity (Agentic IDE)

---

## 1. Pendahuluan

### 1.1 Latar Belakang
Proses bisnis salon konvensional umumnya masih bergantung pada pencatatan manual (buku, WhatsApp, atau spreadsheet) untuk mengelola reservasi, data pelanggan, dan transaksi. Pendekatan ini rentan terhadap duplikasi jadwal, kehilangan data, dan lemahnya visibilitas manajerial terhadap kinerja operasional. Sistem manajemen salon berbasis web dirancang untuk mengotomasi proses inti tersebut melalui satu platform terintegrasi yang dapat diakses oleh tiga aktor utama: **Admin**, **Staff**, dan **Customer**.

### 1.2 Tujuan
1. Mengotomasi proses reservasi layanan salon agar dapat dilakukan secara mandiri oleh pelanggan (self-service booking).
2. Menyediakan basis data terpusat untuk manajemen layanan, staf, dan riwayat transaksi.
3. Memberikan visibilitas laporan operasional dan finansial kepada Admin secara real-time.
4. Menyederhanakan proses onboarding pengguna baru tanpa mengorbankan integritas data secara signifikan.

### 1.3 Ruang Lingkup
Sistem mencakup modul otentikasi, manajemen layanan, penjadwalan (booking), manajemen staf, pencatatan transaksi manual (kasir dirangkap oleh staff), notifikasi berbasis email, dan pelaporan dasar. Integrasi payment gateway dan WhatsApp API **secara eksplisit tidak termasuk** dalam ruang lingkup versi ini (out of scope), sesuai keputusan desain yang telah ditetapkan sebelumnya.

---

## 2. Aktor dan Peran (Role-Based Access)

| Role | Deskripsi Umum | Hak Akses Utama |
|---|---|---|
| **Admin** | Pemilik/pengelola salon | Mengelola layanan, staf, harga, melihat seluruh laporan, mengelola semua booking |
| **Staff** | Karyawan salon (merangkap kasir) | Melihat jadwal pribadi, mencatat transaksi/pembayaran manual, memperbarui status layanan |
| **Customer** | Pelanggan | Mendaftar akun, melakukan booking, melihat riwayat, menerima notifikasi email |

**Catatan analitis:** Struktur tiga peran ini secara teoretis konsisten dengan prinsip *Role-Based Access Control* (RBAC), di mana hak akses ditentukan berdasarkan fungsi jabatan, bukan identitas individu. Ini memudahkan penerapan *Row Level Security* (RLS) di Supabase karena kebijakan akses dapat didefinisikan berbasis kolom `role` pada tabel `users`, bukan berbasis `user_id` satu per satu.

---

## 3. Kebutuhan Fungsional

### 3.0 Kerangka Prioritas Fitur (MoSCoW)

Studi terhadap praktik industri (Mangomint, MioSalon, Homebase, Zenoti-class systems) menunjukkan bahwa "fitur standar sistem salon" mencakup rentang yang sangat luas — mulai dari booking dasar hingga AI-powered scheduling dan multi-lokasi. Tidak semua relevan untuk proyek skripsi dengan timeline 8 minggu. Berikut pemetaan prioritas berbasis metode **MoSCoW** agar cakupan tetap realistis:

| Prioritas | Fitur | Alasan |
|---|---|---|
| **Must Have** | Booking online dengan pencegahan konflik jadwal, manajemen layanan & staf, profil pelanggan dasar, notifikasi email otomatis, pencatatan transaksi manual, dashboard laporan dasar | Ini adalah inti dari "otomatisasi" yang diminta — tanpa ini sistem tidak lebih baik dari pencatatan manual |
| **Should Have** | Riwayat kunjungan pelanggan (visit history), catatan preferensi (mis. alergi produk, stylist favorit), fitur reschedule/waitlist | Standar industri untuk retensi pelanggan; effort implementasi rendah karena hanya perluasan skema data yang sudah ada |
| **Could Have** | Manajemen inventaris produk, rating/review layanan, laporan performa staf individual | Bernilai tambah tapi menambah kompleksitas skema signifikan; cocok sebagai *stretch goal* jika waktu tersisa |
| **Won't Have (versi ini)** | Payment gateway, integrasi WhatsApp, loyalty program/gift card, multi-lokasi, AI-powered scheduling | Sudah diputuskan out-of-scope sebelumnya; konsisten dengan keputusan tersebut dan realistis untuk skripsi |

**Catatan kritis:** Dari sumber-sumber industri yang saya tinjau, item yang paling sering disebut sebagai "must-have" justru bukan fitur eksotis, melainkan **pencegahan konflik jadwal (double-booking prevention)** dan **profil pelanggan dengan riwayat kunjungan**. Fokus di dua hal ini akan memberi nilai akademik lebih tinggi daripada menambah modul yang lebar tapi dangkal.

### 3.1 Modul Autentikasi & Registrasi
- **FR-1.1**: Customer dapat mendaftar secara mandiri (self-registration) menggunakan email dan password saja, tanpa verifikasi OTP/email wajib — dikonfirmasi sebagai keputusan final proyek.
- **FR-1.2**: Staff dan Admin dibuat oleh Admin melalui panel internal (tidak self-register), untuk mencegah eskalasi peran oleh pihak tidak berwenang.
- **FR-1.3**: Login menggunakan Supabase Auth (email/password), dengan opsi *magic link* sebagai alternatif tanpa password.
- **FR-1.4**: Session management ditangani otomatis oleh Supabase Auth (JWT-based).

### 3.2 Modul Manajemen Layanan (Admin)
- **FR-2.1**: Admin dapat menambah, mengubah, menghapus (CRUD) data layanan (nama, durasi, harga, kategori).
- **FR-2.2**: Admin dapat menonaktifkan layanan tanpa menghapus data historis (soft delete) demi menjaga integritas riwayat transaksi.

### 3.3 Modul Manajemen Staf (Admin)
- **FR-3.1**: Admin dapat menambah/menonaktifkan akun staff.
- **FR-3.2**: Admin dapat mengatur jam kerja/ketersediaan (availability) staf sebagai dasar sistem penjadwalan otomatis.

### 3.4 Modul Booking/Reservasi (Customer)
- **FR-4.1**: Customer dapat memilih layanan, staf (opsional), tanggal, dan slot waktu yang tersedia.
- **FR-4.2**: Sistem mengecek ketersediaan slot secara otomatis untuk mencegah *double booking* (validasi di sisi server melalui constraint database, bukan hanya UI).
- **FR-4.3**: Customer dapat membatalkan/menjadwalkan ulang booking dalam batas waktu tertentu.
- **FR-4.4**: Status booking: `pending` → `confirmed` → `completed` / `cancelled`.

### 3.5 Modul Transaksi (Staff sebagai Kasir)
- **FR-5.1**: Staff mencatat pembayaran manual melalui dropdown metode (Tunai, Transfer, QRIS manual) — tanpa integrasi payment gateway.
- **FR-5.2**: Setiap transaksi terhubung ke booking terkait untuk keperluan audit trail.
- **FR-5.3**: Struk/invoice sederhana dapat ditampilkan atau dicetak (opsional, format PDF).

### 3.6 Modul Notifikasi
- **FR-6.1**: Sistem mengirim email konfirmasi booking dan pengingat H-1 melalui SMTP/Resend.
- **FR-6.2**: Tidak ada integrasi WhatsApp API (dikecualikan secara permanen sesuai keputusan proyek).

### 3.7 Modul Pelaporan (Admin)
- **FR-7.1**: Dashboard ringkasan: total pendapatan harian/bulanan, jumlah booking, layanan terpopuler.
- **FR-7.2**: Laporan dapat difilter berdasarkan rentang tanggal dan staf.

### 3.8 Modul Profil & Preferensi Pelanggan (Should Have)
- **FR-8.1**: Customer memiliki halaman profil berisi riwayat kunjungan (visit history) — daftar layanan yang pernah diambil beserta tanggal dan staf yang menangani.
- **FR-8.2**: Customer dapat mencantumkan catatan preferensi sederhana (mis. alergi produk tertentu, stylist favorit) yang dapat dilihat Staff saat sesi berlangsung.
- **Justifikasi:** CRM dasar (riwayat + preferensi) secara konsisten disebut literatur industri sebagai fitur dengan dampak retensi pelanggan tertinggi, dan implementasinya relatif ringan karena hanya memperluas tabel `bookings` dan `profiles` yang sudah ada — tidak memerlukan modul baru.

### 3.9 Modul Waitlist & Reschedule (Should Have)
- **FR-9.1**: Jika slot yang diinginkan customer penuh, sistem menawarkan opsi masuk daftar tunggu (waitlist) untuk slot tersebut.
- **FR-9.2**: Reschedule booking existing tetap melalui validasi ketersediaan yang sama seperti booking baru (FR-4.2), untuk mencegah konflik jadwal baru saat reschedule.

### 3.10 Modul Inventaris Produk (Could Have — Opsional/Stretch Goal)
- **FR-10.1 (opsional)**: Pencatatan stok produk yang digunakan dalam layanan (mis. cat rambut, produk perawatan), dengan pengurangan stok otomatis saat transaksi dicatat.
- **Catatan kritis:** Modul ini umum ditemukan di sistem salon komersial, tetapi menambahkan entitas baru (`products`, `product_usage`) beserta relasinya ke `services` dan `transactions` — kompleksitas skema meningkat signifikan. **Rekomendasi:** masukkan sebagai bab "pengembangan lanjutan" dalam laporan skripsi jika waktu 8 minggu tidak mencukupi untuk implementasi penuh, agar tidak mengorbankan kualitas modul inti (Must Have).

---

## 4. Kebutuhan Non-Fungsional

| Kategori | Kebutuhan | Justifikasi |
|---|---|---|
| **Usability** | Alur registrasi maksimal 2 langkah (email + password) | Menurunkan *friction* onboarding, relevan untuk skripsi berorientasi UX sederhana |
| **Performance** | Waktu muat halaman < 2 detik pada koneksi standar | Next.js App Router mendukung SSR/ISR untuk optimasi ini |
| **Security (Baseline)** | RLS aktif di seluruh tabel sensitif; rate limiting login bawaan Supabase | Keamanan minimum tetap wajib meskipun UX disederhanakan (lihat Bagian 5) |
| **Reliability** | Backup database otomatis (bawaan Supabase, daily) | Mitigasi risiko kehilangan data transaksi |
| **Portability** | Deployment via Netlify dengan CI/CD dari GitHub | Mendukung *continuous deployment* selama pengembangan 8 minggu |

---

## 5. Analisis Kritis: Registrasi Sederhana vs. Keamanan Minimum

Permintaan untuk membuat proses registrasi customer "sederhana" dengan "keamanan minimum" perlu dievaluasi secara cermat, karena kedua tujuan ini berpotensi bertentangan jika tidak dibatasi dengan jelas.

**Apa yang wajar disederhanakan (low risk):**
- Tidak mewajibkan verifikasi OTP/email saat registrasi awal — dapat diterima karena customer hanya mengakses data booking miliknya sendiri, bukan data finansial sensitif pihak lain.
- Tidak ada proses approval manual untuk akun customer baru.
- Field registrasi minimal: nama, email, password, nomor telepon (opsional).

**Apa yang **tidak seharusnya** dikorbankan meskipun disebut "minimum" [High confidence — ini prinsip keamanan dasar, bukan preferensi desain]:**
1. **Row Level Security (RLS) tetap wajib aktif.** Tanpa RLS, seorang customer secara teknis dapat mengakses/mengubah data booking customer lain hanya dengan memodifikasi request di sisi client. Ini bukan soal UX, melainkan kebocoran data horizontal (IDOR — Insecure Direct Object Reference), risiko yang sering luput dari mahasiswa saat menyederhanakan sistem.
2. **Hashing password tetap ditangani Supabase Auth** (bcrypt), bukan disimpan plaintext — ini otomatis by default, jadi tidak menambah kompleksitas UX sama sekali.
3. **Role tidak boleh dipilih sendiri oleh user saat registrasi.** Jika form registrasi menyertakan dropdown "role", risiko privilege escalation (customer mendaftar sebagai admin) menjadi nyata. Role harus di-hardcode `customer` di backend/trigger database, tidak dikirim dari client.
4. **Rate limiting untuk mencegah brute-force** — ini bawaan Supabase Auth, tidak memerlukan effort tambahan.

**Rekomendasi:** Frasa "keamanan minimum" sebaiknya dipahami sebagai *"tanpa lapisan verifikasi tambahan yang menghambat UX"* (OTP, KYC, approval manual), bukan *"tanpa kontrol akses dasar"*. Empat poin di atas tidak menambah friction bagi pengguna karena seluruhnya terjadi di sisi server/database, sehingga tidak ada trade-off nyata antara kesederhanaan dan keamanan pada titik-titik tersebut — risiko yang dihindari jauh lebih besar daripada biaya implementasinya.

---

## 6. Arsitektur Teknologi

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Next.js App    │      │  Supabase Backend │      │     Netlify      │
│  (App Router)     │◄────►│ - PostgreSQL DB   │      │  - Static Hosting │
│  - Server Comp.   │      │ - Auth (JWT)      │      │  - CI/CD (GitHub)│
│  - Client Comp.   │      │ - RLS Policies    │      │  - Env Variables │
│  - API Routes     │      │ - Storage (opsi)  │      └─────────────────┘
└─────────────────┘      └──────────────────┘
         │
         ▼
   SMTP/Resend (Email Notification)
```

**Justifikasi pemilihan teknologi:**
- **Next.js App Router**: mendukung Server Components sehingga query Supabase sensitif (misalnya laporan finansial) dapat dieksekusi di server, tidak terekspos ke client bundle.
- **Supabase**: menyediakan Auth, database relasional, dan RLS dalam satu layanan — cocok untuk proyek skripsi dengan timeline terbatas (8 minggu) karena mengurangi kebutuhan membangun backend custom.
- **Netlify**: mendukung deployment otomatis dari GitHub dengan konfigurasi environment variable yang aman (secret tidak ter-commit ke repository) — poin ini relevan mengingat insiden kebocoran API key yang pernah terjadi pada proyek ini sebelumnya; pastikan `.env.local` masuk `.gitignore` dan secret key hanya disetel di dashboard Netlify.

---

## 7. Ringkasan Alur Data Utama (High-Level)

1. Customer registrasi → trigger database otomatis membuat baris di tabel `profiles` dengan `role = 'customer'`.
2. Customer memilih layanan & slot → sistem validasi ketersediaan via query terhadap tabel `bookings` (constraint unik pada kombinasi staff_id + timeslot).
3. Booking dikonfirmasi → email notifikasi terkirim via Resend.
4. Staff menyelesaikan layanan → mencatat transaksi (metode pembayaran manual) → status booking berubah `completed`.
5. Admin memantau seluruh alur melalui dashboard agregat.

---

## 8. Kesimpulan

Rancangan PRD ini mengakomodasi permintaan efisiensi pada sisi UX registrasi tanpa mengorbankan kontrol keamanan fundamental yang bersifat non-negotiable (RLS, hashing password, pembatasan role). Poin kritis pada Bagian 5 sebaiknya dijadikan bagian eksplisit dalam laporan skripsi sebagai bentuk justifikasi metodologis atas keputusan desain — hal ini akan memperkuat argumentasi akademik bahwa penyederhanaan sistem tetap didasarkan pada analisis risiko, bukan pengabaian aspek keamanan.

**Rekomendasi tindak lanjut:** Dokumen ini sebaiknya dilengkapi dengan ERD detail dan spesifikasi RLS policy per tabel sebelum masuk fase implementasi di Antigravity, agar developer (dalam hal ini AI agent) memiliki batasan skema yang jelas sejak awal.
# Petualang Cilik SD - Game Edukasi Pintar 🎒🌟

Game edukasi web interaktif berbasis HTML, CSS (Tailwind), dan JavaScript/TypeScript modern yang dirancang khusus untuk anak-anak Sekolah Dasar (SD) Kelas 1 hingga 6.

## 🚀 Alur Aplikasi

1. **Halaman Welcome (Selamat Datang)**:
   - Sambutan ramah pahlawan belajar (Kancil Cerdik, Garuda Muda, Kucing Juara).
   - Penjelasan seru dan tombol utama **"MASUK KE HALAMAN UTAMA"**.
2. **Halaman Home (Pusat Petualangan)**:
   - Pemilihan jenjang kelas: **Kelas 1 - 2 SD**, **Kelas 3 - 4 SD**, **Kelas 5 - 6 SD**.
   - Pemilihan maskot petualang favorit.
   - Pilihan 3 Mode Game Seru:
     - 🏃‍♂️🎈 **Petualangan Lari & Kuis Balon**: Game canvas 60fps dengan fisika melompat, mengambil bintang, dan menembus balon jawaban yang melayang di langit.
     - ⚡🔢 **Sambaran Kilat Angka**: Tantangan berhitung cepat dengan gauge waktu dan gelembung angka!
     - 🌿🇮🇩 **Eksplorasi Sains & Nusantara**: Kuis keajaiban alam, hewan, tata surya, dan budaya Nusantara Indonesia.
   - 🏆 **Buku Prestasi & Piala**: Menyimpan bintang dan pencapaian belajar.

---

## 🌐 Cara Hosting di Vercel (1-Click / Gratis)

Aplikasi ini sudah dilengkapi dengan file `vercel.json` dan bundler standar Vite sehingga 100% siap di-deploy ke Vercel tanpa konfigurasi rumit:

### Opsi A: Deploy via GitHub & Vercel Dashboard
1. Unggah (push) folder project ini ke repository GitHub Anda.
2. Buka [vercel.com](https://vercel.com) dan login dengan akun GitHub Anda.
3. Klik **"Add New Project"** lalu pilih repository game ini.
4. Vercel akan otomatis mendeteksi framework `Vite` (Build Command: `npm run build`, Output Directory: `dist`).
5. Klik **"Deploy"**! Dalam waktu ~30 detik, game Anda sudah online dan dapat dimainkan lewat HP, tablet, maupun komputer.

### Opsi B: Deploy via Vercel CLI
Jalankan perintah berikut di terminal:
```bash
npm install -g vercel
vercel
```

---

## 🛠️ Menjalankan Secara Lokal

```bash
# Install dependencies
npm install

# Jalankan server pengembangan
npm run dev

# Build file produksi
npm run build
```

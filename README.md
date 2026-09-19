# PETUALANGAN SI KATA — V2

V2 mempertahankan 100 level V1 dan menambahkan:
- engine MP3 lokal
- fallback ke SpeechSynthesis jika MP3 belum tersedia
- karakter animasi
- bubble percakapan
- animasi saat benar/salah
- efek suara benar, salah, bintang, level-up
- tombol dengarkan dan ulangi
- struktur audio siap untuk 100 level

## Struktur audio

assets/audio/
├── instruction/
│   ├── welcome.mp3
│   ├── pilih-jawaban.mp3
│   └── dengarkan.mp3
├── effects/
│   ├── benar.mp3
│   ├── salah.mp3
│   ├── bintang.mp3
│   ├── level-up.mp3
│   └── selesai.mp3
└── level/
    ├── level-001.mp3
    ├── ...
    └── level-100.mp3

## Penting
Placeholder `.txt` dibuat sebagai penanda nama file. Jangan rename placeholder menjadi `.mp3`.
Ganti placeholder tersebut dengan file MP3 rekaman suara asli.

## Format yang disarankan
MP3, suara bersih, mono/stereo, sekitar 44.1 kHz. Hindari file terlalu besar agar ringan di HP.

## Cara kerja
1. Anak menekan tombol Dengarkan.
2. JavaScript mencoba memutar MP3 level.
3. Jika MP3 belum ada/gagal dimuat, aplikasi memakai SpeechSynthesis sebagai fallback.
4. Audio diputar setelah interaksi pengguna, sehingga lebih aman terhadap aturan autoplay browser/mobile.

Browser modern mendukung HTMLAudioElement/Audio() untuk memutar file audio; pemutaran otomatis tanpa interaksi pengguna dapat diblokir browser. Lihat dokumentasi MDN untuk detail.

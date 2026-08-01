/* Script sekali jalan untuk membuat folder & PDF placeholder.
   Jalankan: node generate-placeholder.js
   (Script generator, bukan bagian dari website) */
const fs = require('fs');
const path = require('path');

const base = __dirname;

// Buat folder
['assets/pdf', 'images', 'icons'].forEach((dir) => {
    const full = path.join(base, dir);
    if (!fs.existsSync(full)) {
        fs.mkdirSync(full, { recursive: true });
        console.log('Created folder:', dir);
    }
});

// Buat file PDF placeholder yang valid
const pdfPath = path.join(base, 'assets', 'pdf', 'catalogue-sakura-koi.pdf');

// Minimal valid PDF
const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 180 >>
stream
BT
/F1 24 Tf
72 770 Td
(Sakura Koi Indonesia) Tj
/F1 14 Tf
0 -30 Td
(Katalog Ikan Koi Premium) Tj
/F1 10 Tf
0 -50 Td
(Importir dan budidaya koi Jepang berkualitas premium.) Tj
0 -20 Td
(Untuk informasi lebih lanjut: info@sakurakoi.co.id) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
trailer
<< /Root 1 0 R >>
%%EOF
`;

fs.writeFileSync(pdfPath, pdfContent, 'latin1');
console.log('Created placeholder PDF:', pdfPath);

// Buat file README images placeholder
const imgReadme = path.join(base, 'images', 'README.txt');
fs.writeFileSync(imgReadme, `Ganti file placeholder dengan gambar koi, kolam, dan farm asli Anda.
Format nama yang disarankan:
- koi-kohaku.jpg
- koi-sanke.jpg
- kolam-jepang.jpg
- farm-niigata.jpg
- event-koishow.jpg
Pastikan sebisa mungkin menggunakan format WebP/JPG yang optimal untuk web.
`, 'utf8');
console.log('Created images README');

// Buat file README icons placeholder
const iconReadme = path.join(base, 'icons', 'README.txt');
fs.writeFileSync(iconReadme, `Tempatkan favicon dan icon di sini.
- favicon.ico
- favicon-32x32.png
- apple-touch-icon.png
- logo-sakura-koi.svg
`, 'utf8');
console.log('Created icons README');

console.log('\nSelesai!');
/* Script sekali jalan untuk membuat halaman admin modul CRUD.
   Jalankan: node generate-admin-pages.js
   (Script generator, bukan bagian dari website) */
const fs = require('fs');
const path = require('path');

const base = path.join(__dirname, 'admin');

const pageTemplate = (pageKey, title) => `<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | Aurora Grand Admin</title>
    <link rel="icon" href="https://img.icons8.com/color/96/crown.png" type="image/png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="css/admin.css">
</head>
<body data-page="${pageKey}" data-module="${pageKey}">

    <div class="admin-wrapper">
        <div class="admin-main">
            <div class="admin-content">
                <div id="module-root"></div>
            </div>
        </div>
    </div>

    <script src="js/admin.js"></script>
    <script src="js/module.js"></script>
</body>
</html>
`;

const pages = {
    'about': 'About Company',
    'vision-mission': 'Vision & Mission',
    'facilities': 'Facilities',
    'rooms': 'Rooms',
    'gallery': 'Gallery',
    'articles': 'Articles',
    'testimonials': 'Testimonials',
    'faq': 'FAQ',
    'career': 'Career',
    'events': 'Events',
    'packages': 'Packages',
    'categories': 'Categories',
    'messages': 'Inquiry List',
    'newsletter': 'Newsletter',
    'users': 'Users',
    'roles': 'Roles & Permission',
    'profile': 'Company Profile'
};

Object.entries(pages).forEach(([key, title]) => {
    const file = path.join(base, `${key}.html`);
    fs.writeFileSync(file, pageTemplate(key, title), 'utf8');
    console.log('Created:', key + '.html');
});

console.log('\\nSelesai! ' + Object.keys(pages).length + ' halaman modul admin dibuat.');
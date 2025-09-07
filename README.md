# Bahasa Indah Nusantara

**Website:** [Bahasa Indah Nusantara](#)  
**Team:** Maung Tigers UBL  
**Deadline:** September 7th, 2025

---

## Deskripsi

Bahasa Indah Nusantara adalah website yang mengangkat kekayaan bahasa dan budaya Indonesia. Website ini memungkinkan pengguna untuk:  

- Menjelajahi **kamus bahasa** Nusantara.  
- Membaca dan menulis **cerita tradisional atau fiksi**.  
- Menambahkan dan mengelola **makna kata** secara interaktif.  
- Mengakses artikel budaya yang sudah ditandai dengan **tag**.  
- Moderator dan Admin dapat melakukan **review konten**, manajemen user, dan pengaturan izin.  

Website ini dikembangkan dengan semangat **“peluk erat tradisi, gerakkan teknologi”**.

---

## Teknologi yang Digunakan

- **Frontend:** React + TypeScript + Tailwind CSS v4.0  
- **State Management:** React Context, custom hooks  
- **Routing:** React Router v7  
- **Backend / Database:** Supabase (PostgreSQL)  
- **Deployment:** Vercel  
- **Interactive Features:** Phaser.js (opsional, untuk minigames)  

---

## Struktur Project



- **Admin Zone:** /admin-zone  
  - Manage Users  
  - Suspend Users  

- **Moderator Zone:** /moderator-zone  
  - Review konten (Cerita, Artikel, Makna Kata)  
  - Report user & konten  
  - Manage perizinan penulis  

---

## Fitur Utama

- **CRUD Artikel, Cerita, Makna Kata** dengan status draft, review, publish  
- **Tagging system** untuk artikel, cerita, dan makna kata  
- **Kontribusi Viewer** untuk melihat karya user sendiri  
- **Profile Management**: upload foto, ubah username, email, dan password  
- **Modal system**: semua modal menggunakan React Portal untuk posisi yang tepat  

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

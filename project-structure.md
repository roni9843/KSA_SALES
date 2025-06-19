moto_pos/
│
├── renderer/               # React frontend
│   │   ├── components/         # React components (Invoice, ProductForm, etc.)
|   │   ├── public/ 
|   │   ├── src/
|   │       ├── assets/
│   │   ├── pages/              # Route-based pages (Home, POS, Reports)
│   │   ├── i18n/               # For multilingual support
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── index.css
│   │   └── main.jsx
│
├── src/
│   ├── main/                   # Electron main process
│   │   └── main.js             # Electron app entry
│   │   └── preload.js          # Secure bridge between main & renderer
│   │   └── database/           # SQLite DB logic here
│   │       └── db.js
│
│
├── .env                       # Environment variables
├── .gitignore
├── package.json               # NPM dependencies
├── electron-builder.json      # Build config for making installer
└── README.md

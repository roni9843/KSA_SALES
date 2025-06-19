moto_pos/
│
├── public/                     # Static files like icons, images
│
├── src/
│   ├── main/                   # Electron main process
│   │   └── main.js             # Electron app entry
│   │   └── preload.js          # Secure bridge between main & renderer
│   │   └── database/           # SQLite DB logic here
│   │       └── db.js
│
│   ├── renderer/               # React frontend
│   │   ├── components/         # React components (Invoice, ProductForm, etc.)
│   │   ├── pages/              # Route-based pages (Home, POS, Reports)
│   │   ├── i18n/               # For multilingual support
│   │   ├── App.js
│   │   └── index.jsx
│
├── .env                       # Environment variables
├── .gitignore
├── package.json               # NPM dependencies
├── electron-builder.json      # Build config for making installer
└── README.md

moto_pos/
│
├── renderer/               # React frontend
│   │   ├── components/
│   │   |   ├── Navbar.jsx         ✅ নতুন Navigation Bar
|   |   │   ├── AddProduct.jsx
|   │   │   ├── AddCategory.jsx
|   │   |   ├── ProductList.jsx
|   │   │   └── CreateInvoice.jsx
|   │   ├── public/ 
|   │   ├── src/
|   │       ├── assets/
│   │   ├── pages/
|   |   │   ├── Home.jsx           ✅ Home page layout
|   |   │   ├── InvoicePrint.jsx
|   |   │   └── NotFound.jsx
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



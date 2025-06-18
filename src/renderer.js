// src/renderer.js
const db = require('../db/database');

const form = document.getElementById('product-form');
const productList = document.getElementById('product-list');

function renderProducts() {
    const products = db.getAllProducts();
    productList.innerHTML = '';
    products.forEach(product => {
        const li = document.createElement('li');
        li.textContent = `${product.name} - ৳${product.price} - Stock: ${product.stock}`;
        productList.appendChild(li);
    });
}

// ফর্ম সাবমিট করলে প্রোডাক্ট অ্যাড হবে
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const price = parseFloat(document.getElementById('price').value);
    const stock = parseInt(document.getElementById('stock').value);

    db.addProduct(name, price, stock);
    form.reset();
    renderProducts();
});

// শুরুতে প্রোডাক্ট দেখাও
renderProducts();

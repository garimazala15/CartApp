const Producturl = "https://cdn.shopify.com/s/files/1/0564/3685/0790/files/multiProduct.json";
let allProducts = [];
let cart = [];

async function renderProducts(category = null, searchTerm = '') {
    const section = document.querySelector(".Product");
    section.innerHTML = ''; 

    if (allProducts.length === 0) {
        const res = await fetch(Producturl);                  
        const { categories } = await res.json();              
        allProducts = categories;
    }

    const filteredProducts = allProducts
        .flatMap(cat => (category && cat.category_name !== category) ? [] : cat.category_products)
        .filter(product =>
            [product.title, product.vendor, product.price.toString()].some(field =>
                field.toLowerCase().includes(searchTerm.toLowerCase())
            )
        );

    filteredProducts.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product-item');
        productDiv.innerHTML = `
            <h2>${product.title}</h2>
            <img src="${product.image}" alt="${product.title}">
            <p>Price: $${product.price}</p>
            <p>Vendor: ${product.vendor}</p>
            <button onclick="addToCart('${product.id}')">Add to Cart</button>
        `;
        section.appendChild(productDiv);
    });
    updateCartCount();
    renderCart();
}

function filterItems(category) {
    renderProducts(category, document.getElementById('search-item').value);
}

function search() {
    renderProducts(null, document.getElementById('search-item').value);
}

function addToCart(productId) {
    const product = allProducts.flatMap(cat => cat.category_products).find(p => p.id === productId);
    if (product) {
        const existingproduct = cart.find(item => item.id === productId);
        if (existingproduct) {
            existingproduct.quantity++;
        } else {
            product.quantity = 1;
            cart.push(product);
        }
        updateCartCount();
        renderCart();
        saveCartToLocalStorage();
    } 
}

function updateCartCount() {
    document.getElementById('cart-count').textContent = cart.length;
}

function renderCart() {
    const cartSection = document.getElementById('cart-list');
    cartSection.innerHTML = '';
    const cartHeading = document.createElement('h2');
    cartHeading.textContent = 'Your Cart';
    cartSection.appendChild(cartHeading);
    const cartItemsDiv = document.createElement('div');
    cartItemsDiv.classList.add('cart-items');

    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div>
                <h3>${item.title}</h3>
                <p>Price: $${item.price}</p>
                <p>Vendor: ${item.vendor}</p>
                <p>Quantity: ${item.quantity}</p>
                <button class="remove-item-btn" onclick="removeFromCart('${item.id}')">Remove</button>
            </div>
        `;
        cartItemsDiv.appendChild(cartItemDiv);
    });

    cartSection.appendChild(cartItemsDiv);
    const closeButton = document.createElement('button');
    closeButton.classList.add('close-cart-btn-inside');
    closeButton.textContent = 'Close Cart';
    closeButton.onclick = toggleCart;
    cartSection.appendChild(closeButton);
}



function toggleCart() {
    const cartSection = document.getElementById('cart-list');
    cartSection.style.display = (cartSection.style.display === 'none' || cartSection.style.display === '') ? 'block' : 'none';
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}
function loadCartFromLocalStorage() {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
        cart = JSON.parse(storedCart);
        updateCartCount();
        renderCart();
    }
}
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index !== -1) {
        cart.splice(index, 1); // Remove item from cart array
        updateCartCount();
        renderCart();
        saveCartToLocalStorage();
    } else {
        console.log('Item not found in cart');
    }
}

loadCartFromLocalStorage();
renderProducts();

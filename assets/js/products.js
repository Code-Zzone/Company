// تهيئة Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBJkpqCGBRITqc66TQtkdQ_Rj0Jwd5uhZI",
    authDomain: "company-23271.firebaseapp.com",
    databaseURL: "https://company-23271-default-rtdb.firebaseio.com",
    projectId: "company-23271",
    storageBucket: "company-23271.firebasestorage.app",
    messagingSenderId: "48019146673",
    appId: "1:48019146673:web:b4f7bc91bb169c43b29f90"
};

// تفعيل Firebase
firebase.initializeApp(firebaseConfig);

// تعريف قاعدة البيانات
const db = firebase.database();

let cart = {};  // سلة التسوق
let productsFromDb = {};  // تخزين المنتجات من قاعدة البيانات

const productsDiv = document.getElementById('products'); // عنصر عرض المنتجات
const cartCountSpan = document.getElementById('cart-count');  // العنصر الذي يعرض عدد المنتجات في السلة

// عرض المنتجات من قاعدة البيانات
function loadProductsFromDatabase() {
    // إظهار اللودر
    document.getElementById('loader').style.display = 'block';

    db.ref('products').on('value', snapshot => {
        productsFromDb = snapshot.val();
        productsDiv.innerHTML = ''; // نفضي الأول قبل التحديث

        if (productsFromDb) {
            Object.keys(productsFromDb).forEach(key => {
                const product = productsFromDb[key];
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.setAttribute('data-name', product.name.toLowerCase());

                productDiv.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>السعر: ${product.price} جنيه</p>
                    <div>
                        <button onclick="changeQuantity(${key}, -1)">-</button>
                        <span id="quantity-${key}">1</span>
                        <button onclick="changeQuantity(${key}, 1)">+</button>
                    </div>
                    <button onclick="addToCart(${key})">اضف الى السلة</button>
                `;
                productsDiv.appendChild(productDiv);
            });
        }

        // إخفاء اللودر بعد تحميل البيانات
        document.getElementById('loader').style.display = 'none';

    }, error => {
        console.error("Error loading products from Firebase:", error);
        document.getElementById('loader').style.display = 'none';
    });
}


// تغيير الكمية
function changeQuantity(productId, change) {
    const quantitySpan = document.getElementById(`quantity-${productId}`);
    let quantity = parseInt(quantitySpan.innerText, 10);
    quantity = Math.max(1, quantity + change); // تحديد الحد الأدنى للكمية بـ 1
    quantitySpan.innerText = quantity; // تحديث العرض
    cart[productId] = cart[productId] || { quantity: 0 };
    cart[productId].quantity = quantity;
}
function showCartMessage(message) {
    const messageDiv = document.getElementById('cart-message');
    messageDiv.innerText = message;
    messageDiv.style.display = 'block';
    messageDiv.style.backgroundColor = '#28a745';
    messageDiv.style.color = '#fff';
    messageDiv.style.padding = '15px';
    messageDiv.style.margin = '10px auto';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.borderRadius = '10px';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.style.fontSize = '18px';
    messageDiv.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    messageDiv.style.transition = 'opacity 0.5s ease';

    // إخفاء الرسالة بعد 4 ثواني
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 4000);
}


// إضافة المنتج إلى السلة
function addToCart(productId) {
    const product = productsFromDb[productId];
    const quantity = cart[productId]?.quantity || 1;
    const total = quantity * product.price;

    cart[productId] = { name: product.name, price: product.price, quantity, total };
    localStorage.setItem(`product-${productId}`, JSON.stringify(cart[productId]));
    updateCartCount();

    // عرض رسالة ناجحة
    showCartMessage(`${product.name} تم إضافته إلى السلة بنجاح`);
}


// تحديث عدد المنتجات في السلة
function updateCartCount() {
    const count = Object.keys(cart).length;  // حساب عدد المنتجات في السلة
    cartCountSpan.innerText = count;  // تحديث عدد السلة في الـ HTML
}

// عرض السلة
function showCart() {
    let content = '';
    let totalAmount = 0;
    for (const id in cart) {
        const item = cart[id];
        content += `
          <p>
            ${item.name}: الكمية ${item.quantity} - الإجمالي ${item.total} جنيه
            <button onclick="removeFromCart(${id})">حذف</button>
            <button onclick="reduceQuantity(${id})">تقليل الكمية</button>
          </p>
        `;
        totalAmount += item.total;
    }
    const orderContentDiv = document.getElementById('order-content');
    const totalAmountSpan = document.getElementById('total-amount');
    orderContentDiv.innerHTML = content || '<p>السلة فارغة</p>';
    totalAmountSpan.innerText = `الإجمالي: ${totalAmount} جنيه`;
    const orderDetailsDiv = document.getElementById('order-details');
    orderDetailsDiv.style.display = 'block';
}

// تقليل الكمية
function reduceQuantity(productId) {
    const item = cart[productId];
    if (item.quantity > 1) {
        item.quantity -= 1;
        item.total = item.quantity * item.price;
        cart[productId] = item;
        localStorage.setItem(`product-${productId}`, JSON.stringify(item));
        showCart();
    }
}

// حذف منتج من السلة
function removeFromCart(productId) {
    delete cart[productId];
    localStorage.removeItem(`product-${productId}`);
    updateCartCount();
    showCart();
}

// إغلاق السلة
function closeCart() {
    const orderDetailsDiv = document.getElementById('order-details');
    orderDetailsDiv.style.display = 'none';
}


// الحصول على المعرف الفرعي التالي
function getNextCustomerId() {
    return db.ref('customers').once('value')
        .then(snapshot => {
            const customers = snapshot.val();
            let lastId = 0;
            if (customers) {
                Object.keys(customers).forEach(key => {
                    const id = parseInt(key, 10);
                    if (id > lastId) {
                        lastId = id;
                    }
                });
            }
            return String(lastId + 1).padStart(5, '0');
        });
}

// إتمام الطلب
function completeOrder() {
    // إظهار اللودر
    document.getElementById('loader').style.display = 'block';
    
    const userName = document.getElementById('user-name').value;
    const userAddress = document.getElementById('user-address').value;
    const userPhone = document.getElementById('user-phone').value;
    const userAltPhone = document.getElementById('user-alt-phone').value;
    const userEmail = document.getElementById('user-email').value;
  
    if (!userName || !userAddress || !userPhone || !userEmail) {
      showMessage('يرجى ملء جميع الحقول المطلوبة.', 'red');
      return;
    }
  
    const orderItems = Object.keys(cart).map(id => ({
      name: cart[id].name,
      price: cart[id].price,
      quantity: cart[id].quantity,
      total: cart[id].total
    }));
  
    const orderData = {
      name: userName,
      address: userAddress,
      phone: userPhone,
      altPhone: userAltPhone,
      email: userEmail,
      order: orderItems,
      totalAmount: orderItems.reduce((acc, item) => acc + item.total, 0),
      timestamp: new Date().toISOString()
    };
  
    // الحصول على المعرف الفرعي المخصص وإرسال البيانات إلى Firebase
    getNextCustomerId().then(newId => {
        db.ref('customers/' + newId).set(orderData, (error) => {
            document.getElementById('loader').style.display = 'none';
            
            if (error) {
                showMessage('حدث خطأ أثناء حفظ الطلب، يرجى المحاولة مرة أخرى.', 'red');
            } else {
                showMessage('تم إتمام الطلب بنجاح! شكراً لتسوقك معنا.', 'green');
                cart = {};
                localStorage.clear();
                updateCartCount();
                closeCart();
            }
        });
    });
}

// دالة لعرض الرسالة في الصفحة
function showMessage(message, color) {
    const messageElement = document.getElementById('message-is-done');
    messageElement.style.color = color;
    messageElement.innerText = message;
    messageElement.style.display = 'block';

    // إخفاء الرسالة بعد 5 ثوانٍ
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// محرك البحث
function searchProducts() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    const productDivs = document.querySelectorAll('.product');
    const loader = document.getElementById('loader');

    // تغيير نص اللودر مؤقتًا للبحث
    const loaderText = loader.querySelector('p');
    const originalText = loaderText.innerText;
    loaderText.innerText = 'جارٍ البحث عن المنتجات...';
    loader.style.display = 'block';

    setTimeout(() => {
        let found = false;

        // إزالة أي رسائل قديمة من البحث السابق
        const oldMessage = document.getElementById('no-results-message');
        if (oldMessage) {
            oldMessage.remove();
        }

        productDivs.forEach(div => {
            const name = div.getAttribute('data-name');
            if (name.includes(query)) {
                div.style.display = 'inline-block';
                found = true;
            } else {
                div.style.display = 'none';
            }
        });

        // إخفاء اللودر
        loader.style.display = 'none';
        loaderText.innerText = originalText;

        // لو مفيش نتائج، نعرض الرسالة
        if (!found) {
            const message = document.createElement('div');
            message.id = 'no-results-message';
            message.style.textAlign = 'center';
            message.style.marginTop = '20px';
            message.style.fontWeight = 'bold';
            message.style.fontSize = '18px';
            message.style.color = 'gray';
            message.innerText = 'لا توجد منتجات مطابقة للبحث.';
            productsDiv.appendChild(message);
        }
    }, 500);
}



// عند تحميل الصفحة، نعرض المنتجات من قاعدة البيانات
window.onload = function() {
    loadProductsFromDatabase();
};

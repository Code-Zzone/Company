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

// قائمة الأسماء المخصصة
const productNames = [
    "تفاح", "موز", "طماطم", "خيار", "برتقال", "عنب", "جزر", "بطيخ", "ليمون", "فراولة",
    "كمثرى", "أناناس", "مانجو", "كيوي", "رمان", "فلفل", "باذنجان", "بطاطس", "بصل", "ثوم",
    "كوسة", "قرع", "سبانخ", "ملوخية", "فجل", "شمندر", "بازلاء", "لوبيا", "كرنب", "قرنبيط",
    "فاصوليا", "زعتر", "نعناع", "بقدونس", "ريحان", "زعفران", "زنجبيل", "جوافة", "تمر", "كيوي",
    "شمام", "شوفان", "شعير", "عدس", "حمص", "فول", "ذرة", "قمح", "قصب", "زيتون", "رمان"
];

// قائمة المنتجات (50 منتج) مع أسماء مخصصة
const products = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    name: productNames[i] || `منتج ${i + 1}`, // استخدام اسم من القائمة أو اسم افتراضي
    price: Math.floor(Math.random() * 20) + 1 // أسعار عشوائية بين 1 و 20
}));

let cart = {};

// عرض المنتجات
const productsDiv = document.getElementById('products');
products.forEach(product => {
    const productDiv = document.createElement('div');
    productDiv.className = 'product';
    productDiv.setAttribute('data-name', product.name.toLowerCase());
    productDiv.innerHTML = `
      <img src="../images/image1.png" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>السعر: ${product.price} جنيه</p>
      <div>
        <button onclick="changeQuantity(${product.id}, -1)">-</button>
        <span id="quantity-${product.id}">1</span>
        <button onclick="changeQuantity(${product.id}, 1)">+</button>
      </div>
      <button onclick="addToCart(${product.id})">اضف الى السلة</button>
    `;
    productsDiv.appendChild(productDiv);
});

const cartCountSpan = document.getElementById('cart-count');
const orderDetailsDiv = document.getElementById('order-details');
const orderContentDiv = document.getElementById('order-content');
const totalAmountSpan = document.getElementById('total-amount');
const confirmationDiv = document.getElementById('confirmation');

// تعديل الكمية
const quantities = {};
products.forEach(product => quantities[product.id] = 1);

function changeQuantity(productId, change) {
    quantities[productId] = Math.max(1, quantities[productId] + change);
    document.getElementById(`quantity-${productId}`).innerText = quantities[productId];
}

// إضافة إلى السلة
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const quantity = quantities[productId];
    const total = quantity * product.price;
    cart[productId] = { name: product.name, price: product.price, quantity, total };
    localStorage.setItem(`product-${productId}`, JSON.stringify(cart[productId]));
    updateCartCount();
    confirmationDiv.innerText = `${product.name} تمت إضافته إلى السلة بنجاح.`;
}

// تحديث عدد المنتجات في السلة
function updateCartCount() {
    const count = Object.keys(cart).length;
    cartCountSpan.innerText = count;
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
    orderContentDiv.innerHTML = content || '<p>السلة فارغة</p>';
    totalAmountSpan.innerText = `الإجمالي: ${totalAmount} جنيه`;
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
    productDivs.forEach(div => {
        const name = div.getAttribute('data-name');
        if (name.includes(query)) {
            div.style.display = 'inline-block';
        } else {
            div.style.display = 'none';
        }
    });
}

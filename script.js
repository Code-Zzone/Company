document.addEventListener("DOMContentLoaded", function() {
    const navToggle = document.getElementById("navToggle");
    const mainNavbar = document.getElementById("mainNavbar");
    const dropdownMenu = document.getElementById("dropdownMenu");
    const dropdownList = document.getElementById("dropdownList");

    // زر فتح وإغلاق القائمة الرئيسية
    navToggle.addEventListener("click", function() {
        mainNavbar.classList.toggle("show");
    });

    // زر فتح وإغلاق القائمة المنسدلة (المنتجات)
    dropdownMenu.addEventListener("click", function(event) {
        event.preventDefault();
        dropdownList.classList.toggle("show");
    });

    // إغلاق القائمة المنسدلة لما المستخدم يضغط خارجها
    document.addEventListener("click", function(event) {
        if (!dropdownMenu.contains(event.target) && !dropdownList.contains(event.target)) {
            dropdownList.classList.remove("show");
        }
    });
});

// زر تغيير الوضع الليلي والنهاري
document.getElementById("toggleTheme").addEventListener("click", function() {
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-light");
    this.textContent = document.body.classList.contains("bg-dark") ? "🌞 الوضع النهاري" : "🌙 الوضع الليلي";
});
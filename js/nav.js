// ===============================================
// nav.js (V9.2 - เพิ่มเมนู Psychomatrix)
// ===============================================

function createAndInjectNavigation() {
    if (document.querySelector('nav[data-nav="main"]')) {
        console.log("⚠️ Navigation already exists, skipping creation.");
        return;
    }

    const navBar = document.createElement('nav');
    navBar.setAttribute('data-nav', 'main');
    navBar.className = 'bg-blue-600 p-4 shadow-md';

    navBar.innerHTML = `
        <div class="max-w-7xl mx-auto flex justify-between items-center">
            <a href="index.html" class="text-white text-xl font-bold hover:text-blue-200">
                Rainbow OrcaKids
            </a>
            
            <div class="hidden md:flex items-center space-x-4">
                <a href="index.html" class="text-white hover:text-blue-200 font-medium">
                    <i class="fas fa-home mr-1"></i>หน้าหลัก
                </a>
                <a href="psychomatrix_hub.html" class="text-white hover:text-blue-200 font-medium">
                    <i class="fas fa-star-of-life mr-1"></i>Psychomatrix
                </a>
                <a href="missions.html" class="text-white hover:text-blue-200 font-medium">
                    <i class="fas fa-list-alt mr-1"></i>ภารกิจ
                </a>
                <a href="gallery.html" class="text-white hover:text-blue-200 font-medium">
                    <i class="fas fa-images mr-1"></i>ผลงาน
                </a>
                <a href="profile.html" class="text-white hover:text-blue-200 font-medium">
                    <i class="fas fa-user mr-1"></i>โปรไฟล์
                </a>
                <a href="notifications.html" class="text-white hover:text-blue-200 font-medium">
                    <i class="fas fa-bell mr-1"></i>การแจ้งเตือน
                    <span class="notification-badge hidden">0</span>
                </a>

                <!-- ✅ Admin Dashboard (Desktop) -->
                <a href="admin_dashboard.html" id="admin-dashboard-desktop" class="text-yellow-300 hover:text-yellow-200 font-medium hidden">
                    <i class="fas fa-shield-alt mr-1"></i>Admin Dashboard
                </a>

                <div class="flex items-center space-x-2">
                    <span id="user-display" class="text-white hidden"></span>
                    <a id="login-link" href="login_supabase.html" class="bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-1 px-3 rounded-full">
                        <i class="fas fa-sign-in-alt mr-2"></i>เข้าสู่ระบบ
                    </a>
                </div>
            </div>
            
            <button id="mobile-menu-button" class="md:hidden text-white">
                <i class="fas fa-bars text-xl"></i>
            </button>
        </div>
        
        <div id="mobile-menu" class="hidden md:hidden">
            <div class="px-2 pt-2 pb-3 space-y-1">
                <a href="index.html" class="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    <i class="fas fa-home mr-2"></i>หน้าหลัก
                </a>
                <a href="psychomatrix_hub.html" class="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    <i class="fas fa-star-of-life mr-2"></i>Psychomatrix
                </a>
                <a href="missions.html" class="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    <i class="fas fa-list-alt mr-2"></i>ภารกิจ
                </a>
                <a href="gallery.html" class="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    <i class="fas fa-images mr-2"></i>ผลงาน
                </a>
                <a href="profile.html" class="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    <i class="fas fa-user mr-2"></i>โปรไฟล์
                </a>
                <a href="notifications.html" class="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    <i class="fas fa-bell mr-2"></i>การแจ้งเตือน
                    <span class="notification-badge hidden">0</span>
                </a>
                
                <!-- ✅ Admin Dashboard (Mobile) -->
                <a href="admin_dashboard.html" id="admin-dashboard-mobile" class="block text-yellow-300 hover:bg-blue-700 px-3 py-2 rounded-md hidden">
                    <i class="fas fa-shield-alt mr-2"></i>Admin Dashboard
                </a>
                
                <a href="login_supabase.html" class="block text-white hover:bg-blue-700 px-3 py-2 rounded-md">
                    <i class="fas fa-sign-in-alt mr-2"></i>เข้าสู่ระบบ
                </a>
            </div>
        </div>
    `;

    document.body.insertBefore(navBar, document.body.firstChild);
    console.log("✅ Navigation created with Psychomatrix menu item.");
}

document.addEventListener('DOMContentLoaded', () => {
    createAndInjectNavigation();
    
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});
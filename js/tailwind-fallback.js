// tailwind-fallback.js - แก้ไขปัญหา Tailwind CSS บน GitHub Pages
console.log('🎨 Tailwind Fallback loaded');

(function() {
    'use strict';
    
    // ฟังก์ชันตรวจสอบว่า Tailwind โหลดสำเร็จหรือไม่
    function checkTailwindLoaded() {
        // ตรวจสอบ class ทั่วไปของ Tailwind
        const testDiv = document.createElement('div');
        testDiv.className = 'tw-hidden';
        document.body.appendChild(testDiv);
        
        const isHidden = window.getComputedStyle(testDiv).display === 'none';
        document.body.removeChild(testDiv);
        
        console.log('🎨 Tailwind check:', isHidden ? '✅ Loaded' : '❌ Not loaded');
        return isHidden;
    }
    
    // ฟังก์ชันโหลด Tailwind แบบ fallback
    function loadTailwindFallback() {
        const tailwindCDN = 'https://cdn.tailwindcss.com';
        const tailwindLocal = './css/tailwind.min.css';
        
        // 1. ลองใช้ CDN ก่อน
        console.log('🎨 Loading Tailwind from CDN...');
        return new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = tailwindCDN;
            
            // ตั้งเวลา timeout ถ้าโหลดไม่สำเร็จ
            const timeoutId = setTimeout(() => {
                console.log('❌ CDN timeout, trying local...');
                loadLocalTailwind();
                resolve(false);
            }, 3000);
            
            link.onload = () => {
                clearTimeout(timeoutId);
                console.log('✅ Tailwind CDN loaded');
                
                // ตรวจสอบอีกครั้งว่าทำงานจริงหรือไม่
                setTimeout(() => {
                    if (checkTailwindLoaded()) {
                        resolve(true);
                    } else {
                        console.log('❌ Tailwind loaded but not working, trying local...');
                        loadLocalTailwind();
                        resolve(false);
                    }
                }, 100);
            };
            
            link.onerror = () => {
                clearTimeout(timeoutId);
                console.log('❌ CDN failed, trying local...');
                loadLocalTailwind();
                resolve(false);
            };
            
            document.head.appendChild(link);
        });
    }
    
    // ฟังก์ชันโหลด Tailwind จากไฟล์ local
    function loadLocalTailwind() {
        console.log('🎨 Loading local Tailwind...');
        
        // สร้าง inline styles แบบพื้นฐาน
        const inlineStyles = `
            /* Basic Tailwind-like styles */
            .tw-hidden { display: none !important; }
            .tw-block { display: block !important; }
            .tw-flex { display: flex !important; }
            .tw-items-center { align-items: center !important; }
            .tw-justify-center { justify-content: center !important; }
            .tw-text-center { text-align: center !important; }
            .tw-text-red-500 { color: #ef4444 !important; }
            .tw-text-blue-500 { color: #3b82f6 !important; }
            .tw-text-gray-600 { color: #4b5563 !important; }
            .tw-bg-white { background-color: white !important; }
            .tw-bg-gray-100 { background-color: #f3f4f6 !important; }
            .tw-bg-blue-500 { background-color: #3b82f6 !important; }
            .tw-bg-red-500 { background-color: #ef4444 !important; }
            .tw-py-8 { padding-top: 2rem !important; padding-bottom: 2rem !important; }
            .tw-px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
            .tw-p-6 { padding: 1.5rem !important; }
            .tw-mt-4 { margin-top: 1rem !important; }
            .tw-mb-4 { margin-bottom: 1rem !important; }
            .tw-rounded { border-radius: 0.25rem !important; }
            .tw-rounded-lg { border-radius: 0.5rem !important; }
            .tw-shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important; }
            .tw-font-bold { font-weight: 700 !important; }
            .tw-text-sm { font-size: 0.875rem !important; }
            .tw-text-lg { font-size: 1.125rem !important; }
            .tw-text-xl { font-size: 1.25rem !important; }
            .tw-text-3xl { font-size: 1.875rem !important; }
            .tw-max-w-4xl { max-width: 56rem !important; }
            .tw-mx-auto { margin-left: auto !important; margin-right: auto !important; }
            .tw-w-48 { width: 12rem !important; }
            .tw-inline-block { display: inline-block !important; }
            .tw-cursor-pointer { cursor: pointer !important; }
            .hover\\:tw-bg-blue-600:hover { background-color: #2563eb !important; }
            .hover\\:tw-underline:hover { text-decoration: underline !important; }
            
            /* Container classes */
            .container { width: 100%; margin: 0 auto; }
            @media (min-width: 640px) { .container { max-width: 640px; } }
            @media (min-width: 768px) { .container { max-width: 768px; } }
            @media (min-width: 1024px) { .container { max-width: 1024px; } }
            @media (min-width: 1280px) { .container { max-width: 1280px; } }
            
            /* Grid classes */
            .grid { display: grid; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
            @media (min-width: 768px) {
                .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
                .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
            }
            
            /* Flex utilities */
            .flex { display: flex; }
            .flex-wrap { flex-wrap: wrap; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .gap-2 { gap: 0.5rem; }
            .gap-3 { gap: 0.75rem; }
            .gap-4 { gap: 1rem; }
            
            /* Spacing */
            .p-2 { padding: 0.5rem; }
            .p-4 { padding: 1rem; }
            .p-6 { padding: 1.5rem; }
            .m-2 { margin: 0.5rem; }
            .m-4 { margin: 1rem; }
            .mt-2 { margin-top: 0.5rem; }
            .mt-4 { margin-top: 1rem; }
            .mt-8 { margin-top: 2rem; }
            .mb-2 { margin-bottom: 0.5rem; }
            .mb-4 { margin-bottom: 1rem; }
            .mb-6 { margin-bottom: 1.5rem; }
            
            /* Text colors */
            .text-white { color: white; }
            .text-gray-700 { color: #374151; }
            .text-gray-800 { color: #1f2937; }
            .text-blue-600 { color: #2563eb; }
            .text-red-600 { color: #dc2626; }
            .text-purple-700 { color: #7c3aed; }
            
            /* Background colors */
            .bg-white { background-color: white; }
            .bg-gray-50 { background-color: #f9fafb; }
            .bg-gray-100 { background-color: #f3f4f6; }
            .bg-blue-50 { background-color: #eff6ff; }
            .bg-red-50 { background-color: #fef2f2; }
            .bg-yellow-50 { background-color: #fffbeb; }
            .bg-purple-50 { background-color: #faf5ff; }
            
            /* Borders */
            .border { border: 1px solid #e5e7eb; }
            .border-t { border-top: 1px solid #e5e7eb; }
            .border-gray-200 { border-color: #e5e7eb; }
            .border-blue-300 { border-color: #93c5fd; }
            
            /* Border radius */
            .rounded { border-radius: 0.25rem; }
            .rounded-lg { border-radius: 0.5rem; }
            .rounded-xl { border-radius: 0.75rem; }
            .rounded-full { border-radius: 9999px; }
            
            /* Shadows */
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
            .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06); }
            .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
            .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); }
            
            /* Font sizes */
            .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
            .text-base { font-size: 1rem; line-height: 1.5rem; }
            .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
            .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
            .text-2xl { font-size: 1.5rem; line-height: 2rem; }
            .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
            .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
            
            /* Font weights */
            .font-medium { font-weight: 500; }
            .font-semibold { font-weight: 600; }
            .font-bold { font-weight: 700; }
            
            /* Width utilities */
            .w-full { width: 100%; }
            .w-20 { width: 5rem; }
            .w-48 { width: 12rem; }
            .w-64 { width: 16rem; }
            
            /* Height utilities */
            .h-20 { height: 5rem; }
            
            /* Display */
            .hidden { display: none; }
            .block { display: block; }
            .inline-block { display: inline-block; }
            .flex { display: flex; }
            
            /* Position */
            .relative { position: relative; }
            .absolute { position: absolute; }
            .fixed { position: fixed; }
            .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
            
            /* Z-index */
            .z-40 { z-index: 40; }
            .z-50 { z-index: 50; }
            
            /* Overflow */
            .overflow-y-auto { overflow-y: auto; }
            
            /* Max height */
            .max-h-90vh { max-height: 90vh; }
        `;
        
        // เพิ่ม inline styles
        const style = document.createElement('style');
        style.textContent = inlineStyles;
        document.head.appendChild(style);
        
        console.log('✅ Basic styles loaded');
    }
    
    // ฟังก์ชันดาวน์โหลด Tailwind จาก alternative CDN
    function loadAlternativeCDN() {
        const alternativeCDNs = [
            'https://unpkg.com/tailwindcss@^3/dist/tailwind.min.css',
            'https://cdn.jsdelivr.net/npm/tailwindcss@3.3.3/dist/tailwind.min.css'
        ];
        
        for (const cdn of alternativeCDNs) {
            console.log(`🎨 Trying alternative CDN: ${cdn}`);
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cdn;
            
            link.onload = () => {
                console.log(`✅ Alternative CDN loaded: ${cdn}`);
                // ตรวจสอบว่าทำงานจริงหรือไม่
                setTimeout(() => {
                    if (!checkTailwindLoaded()) {
                        console.log('❌ Alternative CDN not working, using fallback styles');
                        loadLocalTailwind();
                    }
                }, 100);
            };
            
            link.onerror = () => {
                console.log(`❌ Alternative CDN failed: ${cdn}`);
            };
            
            document.head.appendChild(link);
            break; // ลองแค่ตัวแรกก่อน
        }
    }
    
    // รอให้ DOM พร้อม
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🎨 Checking Tailwind CSS...');
        
        // ตรวจสอบทุกๆ 500ms ว่าทางได้โหลด Tailwind สำเร็จหรือไม่
        let checkCount = 0;
        const maxChecks = 10; // ตรวจสอบ 10 ครั้ง (5 วินาที)
        
        const checkInterval = setInterval(() => {
            if (checkTailwindLoaded()) {
                clearInterval(checkInterval);
                console.log('✅ Tailwind is working properly');
            } else {
                checkCount++;
                
                if (checkCount >= maxChecks) {
                    clearInterval(checkInterval);
                    console.log('❌ Tailwind not loaded after 5 seconds, using fallback');
                    
                    // ลองใช้ alternative CDN
                    loadAlternativeCDN();
                    
                    // ถ้า alternative ก็ไม่ทำงาน ใช้ fallback styles
                    setTimeout(() => {
                        if (!checkTailwindLoaded()) {
                            loadLocalTailwind();
                        }
                    }, 2000);
                }
            }
        }, 500);
    });
    
    // Expose functions
    window.tailwindFallback = {
        checkTailwindLoaded,
        loadLocalTailwind,
        loadAlternativeCDN
    };
    
    console.log('✅ Tailwind Fallback initialized');
})();

// Psychomatrix.js - Version 2.1
// Complete rewrite for GitHub Pages + Supabase Edge Functions
// Features: localStorage, Modal Management, API Integration, Debug Mode
// Created: 2025-12-24

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Psychomatrix.js v2.1 Initializing...');
    
    // ==================== GLOBAL VARIABLES ====================
    const mainForm = document.querySelector('form');
    const mainSearchNameInput = document.getElementById('search_name');
    const mainFullNameInput = document.querySelector('input[name="full_name"]');

    const searchModal = document.getElementById('searchModal');
    const loadMainButton = document.getElementById('load_search');
    const cancelSearchModalBtn = document.getElementById('cancel_search');
    const selectSearchBtn = document.getElementById('select_search');
    const deleteSearchBtn = document.getElementById('delete_search');
    const searchSelect = document.getElementById('search_select');

    const openSurroundingDataModalBtn = document.getElementById('openSurroundingDataModal');
    const surroundingDataModal = document.getElementById('surroundingDataModal');
    const cancelSurroundingDataBtn = document.getElementById('cancelSurroundingData');
    const surroundingDataForm = document.getElementById('surroundingDataForm');
    const modalSearchNameInput = document.getElementById('modal_search_name');

    const saveLocalStorageFileBtn = document.getElementById('save_localstorage_file');
    const loadLocalStorageFileInput = document.getElementById('load_localstorage_file_input');
    const loadLocalStorageFileBtn = document.getElementById('load_localstorage_file_btn');

    const USER_DATA_STORAGE_KEY = 'userData';

    // ==================== EDGE FUNCTION CONFIG ====================
    const SUPABASE_URL = 'oibubvhuiuurkxhnefsw.supabase.co';
    const PSYCHOMATRIX_FUNCTION = `https://${SUPABASE_URL}/functions/v1/psychomatrix-calculate`;

    // ==================== HELPER FUNCTIONS ====================

    function getStoredUserData() {
        try {
            const data = localStorage.getItem(USER_DATA_STORAGE_KEY);
            const parsed = data ? JSON.parse(data) : {};
            console.log('📦 Loaded stored data:', Object.keys(parsed).length, 'entries');
            return parsed;
        } catch (error) {
            console.error('❌ Error loading stored data:', error);
            alert('❌ เกิดข้อผิดพลาดในการโหลดข้อมูลที่บันทึกไว้');
            return {};
        }
    }

    function saveUserData(data) {
        try {
            localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(data));
            console.log('💾 Data saved successfully. Total entries:', Object.keys(data).length);
        } catch (error) {
            console.error('❌ Error saving data:', error);
            alert('❌ เกิดข้อผิดพลาดในการบันทึกข้อมูล อาจเกิน quota');
        }
    }

    function loadData(searchName) {
        if (!searchName) {
            alert('⚠️ โปรดระบุชื่อที่ต้องการโหลด');
            clearAllFormAndModalFields();
            return;
        }

        const storedData = getStoredUserData();
        const data = storedData[searchName];

        if (!data) {
            alert(`❌ ไม่พบข้อมูลสำหรับ: "${searchName}"`);
            clearAllFormAndModalFields();
            mainSearchNameInput.value = searchName;
            return;
        }

        console.log('📂 Loading data for:', searchName);

        // Populate main form fields
        if (data.main_data) {
            document.querySelector('select[name="birth_day"]').value = data.main_data.birth_day || '';
            document.querySelector('select[name="birth_month"]').value = data.main_data.birth_month || '';
            document.querySelector('select[name="birth_century"]').value = data.main_data.birth_century || '20';
            document.querySelector('select[name="birth_year"]').value = data.main_data.birth_year || '';
            document.querySelector('select[name="birth_hour"]').value = data.main_data.birth_hour || '00';
            document.querySelector('select[name="birth_minute"]').value = data.main_data.birth_minute || '00';
            document.querySelector('input[name="id_card"]').value = data.main_data.id_card || '';
            mainFullNameInput.value = data.main_data.full_name || '';
            
            // Handle option selection
            const optionSelect = document.querySelector('select[name="option"]');
            if (optionSelect) {
                const savedOption = data.main_data.option || 'BD';
                const optionExists = Array.from(optionSelect.options).some(opt => opt.value === savedOption);
                optionSelect.value = optionExists ? savedOption : 'BD';
            }
            mainSearchNameInput.value = searchName;
        } else {
            clearMainFormFieldsExceptSearchName();
            mainSearchNameInput.value = searchName;
        }

        // Populate surrounding data fields
        if (data.surrounding_data) {
            for (let i = 1; i <= 20; i++) {
                const fieldName = `surrounding_${String(i).padStart(2, '0')}`;
                const modalField = document.getElementById(`modal_${fieldName}`);
                if (modalField) {
                    modalField.value = data.surrounding_data[fieldName] || '';
                }
            }
            console.log('📎 Loaded surrounding data:', Object.keys(data.surrounding_data).filter(k => data.surrounding_data[k]).length, 'fields');
        } else {
            clearSurroundingModalFields();
        }
        
        modalSearchNameInput.value = searchName;
        alert('✅ โหลดข้อมูลเรียบร้อยแล้ว!');
    }

    function clearMainFormFieldsExceptSearchName() {
        document.querySelector('select[name="birth_day"]').value = '';
        document.querySelector('select[name="birth_month"]').value = '';
        document.querySelector('select[name="birth_century"]').value = '20';
        document.querySelector('select[name="birth_year"]').value = '';
        document.querySelector('select[name="birth_hour"]').value = '00';
        document.querySelector('select[name="birth_minute"]').value = '00';
        document.querySelector('input[name="id_card"]').value = '';
        mainFullNameInput.value = '';
        document.querySelector('select[name="option"]').value = 'BD';
    }

    function clearSurroundingModalFields() {
        for (let i = 1; i <= 20; i++) {
            const field = document.getElementById(`modal_surrounding_${String(i).padStart(2, '0')}`);
            if (field) field.value = '';
        }
    }

    function clearAllFormAndModalFields() {
        clearMainFormFieldsExceptSearchName();
        clearSurroundingModalFields();
        mainSearchNameInput.value = '';
        modalSearchNameInput.value = '';
    }

    function populateSearchSelect() {
        const storedData = getStoredUserData();
        searchSelect.innerHTML = '<option value="">-- เลือกชื่อที่บันทึกไว้ --</option>';

        const names = Object.keys(storedData).sort();
        for (const searchName of names) {
            const option = document.createElement('option');
            option.value = searchName;
            option.textContent = searchName;
            searchSelect.appendChild(option);
        }
        
        console.log('📋 Search select populated with', names.length, 'items');
    }

    function generateSurroundingFields() {
        const container = document.getElementById('surroundingFieldsContainer');
        if (!container) {
            console.error('❌ Error: surroundingFieldsContainer not found!');
            return;
        }
        
        container.innerHTML = ''; // Clear any existing fields
        
        for (let i = 1; i <= 20; i++) {
            const fieldNumber = String(i).padStart(2, '0');
            const div = document.createElement('div');
            div.className = 'mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200';
            div.innerHTML = `
                <label for="modal_surrounding_${fieldNumber}" class="block text-sm font-medium text-gray-700 mb-2">
                    <span class="text-purple-600 font-bold">#${fieldNumber}</span> ข้อมูลพลังตัวเลข:
                </label>
                <input type="text" id="modal_surrounding_${fieldNumber}" 
                       name="surrounding_${fieldNumber}"
                       placeholder="เช่น: เลขบ้าน, ทะเบียนรถ, เบอร์โทร..."
                       class="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 
                              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all">
            `;
            container.appendChild(div);
        }
        
        console.log('✅ Generated 20 surrounding fields successfully');
    }

    function showLoading(show = true) {
        const loadingEl = document.getElementById('loadingIndicator');
        if (!loadingEl) {
            // Create if doesn't exist
            const div = document.createElement('div');
            div.id = 'loadingIndicator';
            div.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 hidden flex items-center justify-center z-50';
            div.innerHTML = `
                <div class="bg-white p-6 rounded-xl shadow-2xl mx-4">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
                    <p class="mt-4 text-center font-medium text-gray-700">กำลังคำนวณ...</p>
                </div>
            `;
            document.body.appendChild(div);
        }
        
        const el = document.getElementById('loadingIndicator');
        el.style.display = show ? 'flex' : 'none';
        console.log(show ? '⏳ Loading shown' : '✅ Loading hidden');
    }

    async function callPsychomatrixAPI(formData) {
        try {
            showLoading(true);
            console.log('📤 Sending data to:', PSYCHOMATRIX_FUNCTION);
            console.log('📦 Payload:', formData);

            const response = await fetch(PSYCHOMATRIX_FUNCTION, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData),
                mode: 'cors',
                cache: 'no-cache'
            });

            console.log('📥 Response received:', response.status, response.statusText);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`HTTP ${response.status}: ${response.statusText}\n\n${errorText}`);
            }

            const result = await response.json();
            console.log('✅ API Success:', result);

            // Store result in sessionStorage
            sessionStorage.setItem('psychomatrixResult', JSON.stringify(result));
            
            // Redirect
            console.log('🔄 Redirecting to result.html...');
            window.location.href = 'result.html';
            
        } catch (error) {
            console.error('❌ API Call Failed:', error);
            showLoading(false);
            alert(`❌ เกิดข้อผิดพลาดในการคำนวณ:\n\n${error.message}\n\nข้อควรตรวจสอบ:\n1. Edge Function ทำงานอยู่\n2. CORS เปิดถูกต้อง\n3. ข้อมูลที่ส่งถูกต้อง`);
        } finally {
            // Ensure loading is hidden after delay
            setTimeout(() => showLoading(false), 1000);
        }
    }

    // ==================== EVENT LISTENERS ====================

    // Form submission handling
    if (mainForm) {
        mainForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('📝 Form submission prevented, handling manually...');
        });
        
        // Handle button clicks instead
        const submitButtons = mainForm.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
            button.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                
                const action = this.value;
                const formSubmitEvent = new Event('submit', { bubbles: false, cancelable: true });
                formSubmitEvent.submitter = this;
                mainForm.dispatchEvent(formSubmitEvent);
                
                // Trigger the main handler
                const handler = mainForm['onsubmit'] || mainForm.onSubmit;
                if (handler) {
                    await handler.call(mainForm, formSubmitEvent);
                }
            });
        });
    }

    // Load search modal
    if (loadMainButton && searchModal) {
        loadMainButton.addEventListener('click', function() {
            populateSearchSelect();
            searchModal.classList.remove('hidden');
            console.log('📂 Search modal opened');
        });
    }

    // Cancel search modal
    if (cancelSearchModalBtn && searchModal) {
        cancelSearchModalBtn.addEventListener('click', function() {
            searchModal.classList.add('hidden');
        });
    }

    // Select saved search
    if (selectSearchBtn && searchSelect && mainSearchNameInput) {
        selectSearchBtn.addEventListener('click', function() {
            const selected = searchSelect.value;
            if (selected) {
                mainSearchNameInput.value = selected;
                searchModal.classList.add('hidden');
                loadData(selected);
            } else {
                alert('⚠️ กรุณาเลือกชื่อที่บันทึกไว้');
            }
        });
    }

    // Delete saved search
    if (deleteSearchBtn && searchSelect) {
        deleteSearchBtn.addEventListener('click', function() {
            const searchNameToDelete = searchSelect.value;
            if (!searchNameToDelete) {
                alert('⚠️ โปรดเลือกชื่อที่จะลบ');
                return;
            }

            if (!confirm(`❌ คุณแน่ใจหรือไม่ที่จะลบข้อมูล "${searchNameToDelete}"?`)) {
                return;
            }

            const storedData = getStoredUserData();
            if (storedData[searchNameToDelete]) {
                delete storedData[searchNameToDelete];
                saveUserData(storedData);
                alert(`✅ ลบ "${searchNameToDelete}" เรียบร้อยแล้ว`);
                populateSearchSelect();
                if (mainSearchNameInput.value === searchNameToDelete) {
                    clearAllFormAndModalFields();
                }
                searchModal.classList.add('hidden');
            } else {
                alert('❌ ไม่พบข้อมูลที่จะลบ');
            }
        });
    }

    // Open surrounding data modal
    if (openSurroundingDataModalBtn && surroundingDataModal && modalSearchNameInput && mainSearchNameInput) {
        openSurroundingDataModalBtn.addEventListener('click', function() {
            const currentSearchName = mainSearchNameInput.value.trim();
            if (!currentSearchName) {
                alert('⚠️ กรุณาระบุชื่อที่ฟอร์มหลักก่อน');
                mainSearchNameInput.focus();
                return;
            }
            
            modalSearchNameInput.value = currentSearchName;
            const storedData = getStoredUserData();
            
            // Load existing data
            if (storedData[currentSearchName] && storedData[currentSearchName].surrounding_data) {
                for (let i = 1; i <= 20; i++) {
                    const fieldName = `surrounding_${String(i).padStart(2, '0')}`;
                    const modalField = document.getElementById(`modal_${fieldName}`);
                    if (modalField) {
                        modalField.value = storedData[currentSearchName].surrounding_data[fieldName] || '';
                    }
                }
            } else {
                clearSurroundingModalFields();
            }
            
            surroundingDataModal.classList.remove('hidden');
            console.log('🧲 Surrounding modal opened for:', currentSearchName);
        });
    }

    // Cancel surrounding modal
    if (cancelSurroundingDataBtn && surroundingDataModal) {
        cancelSurroundingDataBtn.addEventListener('click', function() {
            surroundingDataModal.classList.add('hidden');
        });
    }

    // Save surrounding data
    if (surroundingDataForm) {
        surroundingDataForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const searchName = modalSearchNameInput.value.trim();
            if (!searchName) {
                alert('❌ ไม่พบชื่อในระบบ');
                return;
            }

            let hasData = false;
            const surroundingData = {};
            for (let i = 1; i <= 20; i++) {
                const fieldName = `surrounding_${String(i).padStart(2, '0')}`;
                const fieldValue = document.getElementById(`modal_${fieldName}`).value.trim();
                surroundingData[fieldName] = fieldValue;
                if (fieldValue) hasData = true;
            }

            if (!hasData) {
                alert('⚠️ กรอกข้อมูลอย่างน้อย 1 ช่อง');
                return;
            }

            const storedData = getStoredUserData();
            if (!storedData[searchName]) {
                storedData[searchName] = {};
            }
            storedData[searchName].surrounding_data = surroundingData;

            saveUserData(storedData);
            alert('✅ บันทึกข้อมูลรอบตัวเรียบร้อยแล้ว');
            surroundingDataModal.classList.add('hidden');
            console.log('💾 Surrounding data saved for:', searchName);
        });
    }

    // Save/Load LocalStorage to File
    if (saveLocalStorageFileBtn) {
        saveLocalStorageFileBtn.addEventListener('click', function() {
            const userData = localStorage.getItem(USER_DATA_STORAGE_KEY);
            if (!userData) {
                alert('⚠️ ไม่พบข้อมูลใน LocalStorage');
                return;
            }

            const blob = new Blob([userData], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `psychomatrix_backup_${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            
            alert('✅ บันทึกไฟล์สำรองเรียบร้อยแล้ว');
            console.log('💾 Backup saved to file');
        });
    }

    if (loadLocalStorageFileBtn && loadLocalStorageFileInput) {
        loadLocalStorageFileBtn.addEventListener('click', function() {
            loadLocalStorageFileInput.click();
        });

        loadLocalStorageFileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const fileContent = e.target.result;
                    const parsedData = JSON.parse(fileContent);
                    saveUserData(parsedData);
                    alert('✅ โหลดข้อมูลจากไฟล์สำเร็จ');
                    populateSearchSelect();
                    searchModal.classList.add('hidden');
                    console.log('📥 Data loaded from file:', Object.keys(parsedData).length, 'entries');
                } catch (error) {
                    console.error('❌ File parse error:', error);
                    alert('❌ ไฟล์ไม่ถูกต้อง ต้องเป็น JSON format');
                }
            };
            reader.readAsText(file);
        });
    }

    // ==================== INITIAL SETUP ====================
    
    // Generate surrounding fields
    generateSurroundingFields();
    
    // Populate search dropdown
    populateSearchSelect();
    
    // Log ready status
    console.log('✅ Psychomatrix.js v2.1 Fully Initialized');
    console.log('📌 Debug Mode: Check console for all operations');

    // ==================== DEBUG INFORMATION ====================
    console.log('=== DEBUG INFO ===');
    console.log('Form element:', mainForm);
    console.log('API Endpoint:', PSYCHOMATRIX_FUNCTION);
    console.log('Storage key:', USER_DATA_STORAGE_KEY);
    console.log('==================');
});

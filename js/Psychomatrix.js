// Psychomatrix.js - Version 2.3 (FINAL)
// Complete implementation for GitHub Pages + Supabase Edge Functions
// Features: localStorage, Modal Management, API Integration, Debug Logging
// Created: 2025-12-24

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Psychomatrix.js v2.3 Initializing...');
    
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
    console.log('==================== API CALL START ====================');
    console.log('📤 Function: callPsychomatrixAPI()');
    console.log('📡 Endpoint:', PSYCHOMATRIX_FUNCTION);
    console.log('🕐 Time:', new Date().toLocaleString('th-TH'));
    
    try {
        showLoading(true);
 
        // Log raw input
        console.log('📥 Raw Input Data:', formData);
        console.log('📊 Data Types:');
        Object.entries(formData).forEach(([key, val]) => {
            console.log(`   ${key}: ${typeof val} = ${val}`);
        });

        // Build payload (เหมือนเดิมทุกประการ)
        const payload = {
            action: 'analyze',
            search_name: formData.search_name || '',
            use_average: Boolean(formData.use_average),
            option: formData.option || 'BD',
            birth_day: String(formData.birth_day || ''),
            birth_month: String(formData.birth_month || ''),
            birth_century: String(formData.birth_century || '20'),
            birth_year: String(formData.birth_year || ''),
            birth_hour: String(formData.birth_hour || '00'),
            birth_minute: String(formData.birth_minute || '00'),
            id_card: String(formData.id_card || ''),
            full_name: String(formData.full_name || '')
        };

        // Add surrounding data if exists
        if (formData.surrounding_data && typeof formData.surrounding_data === 'object') {
            const filtered = {};
            Object.entries(formData.surrounding_data).forEach(([k, v]) => {
                if (v && String(v).trim()) filtered[k] = String(v).trim();
            });
            
            if (Object.keys(filtered).length > 0) {
                payload.surrounding_data = filtered;
                console.log('📎 Surrounding data added:', Object.keys(filtered).length, 'fields');
            } else {
                console.log('📎 No surrounding data to add (all empty)');
            }
        } else {
            console.log('📎 No surrounding data in formData');
        }

        console.log('📦 FINAL PAYLOAD:');
        console.log('Method: POST');
        console.log('Content-Type: application/json');
        console.log('Body:', JSON.stringify(payload, null, 2));
        
        // Show payload size
        const payloadSize = JSON.stringify(payload).length;
        console.log(`📊 Payload size: ${payloadSize} bytes`);

        const response = await fetch(PSYCHOMATRIX_FUNCTION, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            mode: 'cors',
            cache: 'no-cache'
        });

        console.log('📥 Response received:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries([...response.headers.entries()])
        });

        if (!response.ok) {
            console.error('❌ Response NOT OK');
            const errorText = await response.text();
            console.error('Error body:', errorText);
            
            // Try to parse as JSON
            let errorDetails = errorText;
            try {
                const errorJson = JSON.parse(errorText);
                console.error('Parsed error JSON:', errorJson);
                errorDetails = JSON.stringify(errorJson, null, 2);
            } catch (e) {
                console.error('Could not parse error as JSON, using raw text');
            }
            
            throw new Error(`HTTP ${response.status}: ${response.statusText}\n\n${errorDetails}`);
        }

        const result = await response.json();
        console.log('✅ SUCCESS! Response data:', result);
        
        // **เปลี่ยน: ตอนนี้ response มีโครงสร้าง { success: true, results: [...] }**
        if (!result.success) {
            throw new Error(result.error || 'API call was not successful');
        }
        
        // Store in sessionStorage
        console.log('💾 Storing result in sessionStorage...');
        sessionStorage.setItem('psychomatrixResult', JSON.stringify(result));
        console.log('✅ Stored successfully');
        
        // Redirect
        // ใน callPsychomatrixAPI() function - หาส่วน redirect
        console.log('✅ SUCCESS! Response data:', result);

        // **เปลี่ยน: ส่ง option ผ่าน URL parameter แทน sessionStorage**
        const option = formData.option || 'BD';
        const redirectUrl = `result.html?option=${encodeURIComponent(option)}`;

        console.log('🔄 Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;

    } catch (error) {
        console.error('❌ CATCH BLOCK - API CALL FAILED:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
        
        showLoading(false);
        
        // Enhanced error message
        let errorMessage = error.message;
        if (error.message.includes('400')) {
            errorMessage += '\n\n💡 สาเหตุที่เป็นไปได้:\n' +
                           '1. ข้อมูลขาด field ที่จำเป็นต้องใช้งาน\n' +
                           '2. ชนิดข้อมูลไม่ถูกต้อง\n' +
                           '3. Edge Function ไม่พบ field ที่ต้องการ\n\n' +
                           '🔍 ตรวจสอบข้อมูลใน Debug Logger ที่มุมล่างขวา';
        }
        
        alert(`❌ เกิดข้อผิดพลาด:\n\n${errorMessage}`);
    } finally {
        console.log('==================== API CALL END ====================');
        setTimeout(() => showLoading(false), 1000);
    }
}



    // ==================== MAIN FORM HANDLER ====================

    async function handleFormSubmission(submitter) {
        console.log('🔧 handleFormSubmission() called with submitter:', submitter);
        
        const action = submitter ? submitter.value : '';
        const searchName = mainSearchNameInput.value.trim();
        
        console.log('📊 Action:', action, '| Search Name:', searchName);

        if (action === 'save') {
            // ==================== SAVE ACTION ====================
            console.log('💾 Processing SAVE action...');
            
            if (!searchName) {
                alert('⚠️ กรุณาระบุชื่อสำหรับบันทึกข้อมูล');
                mainSearchNameInput.focus();
                return;
            }

            // Validate time fields
            const birthHour = document.querySelector('select[name="birth_hour"]').value;
            const birthMinute = document.querySelector('select[name="birth_minute"]').value;
            
            if (birthHour && (parseInt(birthHour) < 0 || parseInt(birthHour) > 23)) {
                alert('⚠️ โปรดระบุชั่วโมงที่ถูกต้อง (00-23)');
                return;
            }
            if (birthMinute && (parseInt(birthMinute) < 0 || parseInt(birthMinute) > 59)) {
                alert('⚠️ โปรดระบุนาทีที่ถูกต้อง (00-59)');
                return;
            }

            const storedData = getStoredUserData();
            storedData[searchName] = storedData[searchName] || {};

            // Collect main form data
            const mainData = {
                birth_day: document.querySelector('select[name="birth_day"]').value,
                birth_month: document.querySelector('select[name="birth_month"]').value,
                birth_century: document.querySelector('select[name="birth_century"]').value,
                birth_year: document.querySelector('select[name="birth_year"]').value,
                birth_hour: birthHour,
                birth_minute: birthMinute,
                id_card: document.querySelector('input[name="id_card"]').value,
                full_name: mainFullNameInput.value,
                option: document.querySelector('select[name="option"]').value
            };
            
            storedData[searchName].main_data = mainData;

            saveUserData(storedData);
            alert('✅ บันทึกข้อมูลหลักเรียบร้อยแล้ว');
            populateSearchSelect();
            console.log('💾 SAVE completed for:', searchName);
            
        } else if (action === 'analyze') {
            // ==================== ANALYZE ACTION ====================
            console.log('🔮 Processing ANALYZE action...');

            // Validate required fields based on option
            const option = document.querySelector('select[name="option"]').value;
            const birthDay = document.querySelector('select[name="birth_day"]').value;
            const birthMonth = document.querySelector('select[name="birth_month"]').value;
            const idCard = document.querySelector('input[name="id_card"]').value;
            const fullName = document.querySelector('input[name="full_name"]').value;
            
            console.log('📋 Validation for option:', option);
            console.log('📋 Birth Date:', birthDay, birthMonth);
            console.log('📋 ID Card:', idCard);
            console.log('📋 Full Name:', fullName);

            if (option.includes('BD') && (!birthDay || !birthMonth)) {
                alert('⚠️ กรุณากรอกวันเกิดให้ครบถ้วน');
                return;
            }
            if (option.includes('IDC') && !idCard) {
                alert('⚠️ กรุณากรอกเลขบัตรประชาชน');
                return;
            }
            if (option.includes('FullName') && !fullName) {
                alert('⚠️ กรุณากรอกชื่อ-สกุล');
                return;
            }

            // Prepare data for API
            const formData = {
                action: 'analyze',
                search_name: searchName,
                use_average: document.querySelector('#use_average').checked,
                option: option,
                birth_day: birthDay,
                birth_month: birthMonth,
                birth_century: document.querySelector('select[name="birth_century"]').value,
                birth_year: document.querySelector('select[name="birth_year"]').value,
                birth_hour: document.querySelector('select[name="birth_hour"]').value,
                birth_minute: document.querySelector('select[name="birth_minute"]').value,
                id_card: idCard,
                full_name: fullName
            };

            console.log('📦 COMPLETE FORM DATA:');
            console.log(JSON.stringify(formData, null, 2));

            // Add surrounding data if exists
            const storedData = getStoredUserData();
            if (searchName && storedData[searchName] && storedData[searchName].surrounding_data) {
                const surrounding = storedData[searchName].surrounding_data;
                const filtered = {};
                Object.entries(surrounding).forEach(([k,v]) => {
                    if (v && v.trim()) filtered[k] = v.trim();
                });
                if (Object.keys(filtered).length > 0) {
                    formData.surrounding_data = filtered;
                    console.log('📎 Added surrounding data:', Object.keys(filtered).length, 'fields');
                }
            }

            // Call API
            console.log('🚀 Calling API with prepared data...');
            await callPsychomatrixAPI(formData);
            
        } else {
            console.warn('⚠️ Unknown action:', action);
        }
    }

    // ==================== EVENT LISTENERS ====================

    // Form submission handling
    if (mainForm) {
        console.log('🎯 Setting up form submission handlers...');
        
        // Handle form submit event
        mainForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🎯 Form submit event triggered');
            await handleFormSubmission(e.submitter || document.activeElement);
        });
        
        // Also handle direct button clicks for extra reliability
        const analyzeBtn = mainForm.querySelector('button[value="analyze"]');
        const saveBtn = mainForm.querySelector('button[value="save"]');
        
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Analyze button clicked directly');
                await handleFormSubmission(this);
            });
        }
        
        if (saveBtn) {
            saveBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Save button clicked directly');
                await handleFormSubmission(this);
            });
        }
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
    console.log('✅ Psychomatrix.js v2.2 Fully Initialized');
    console.log('📌 Debug Mode: Check console for all operations');

    // ==================== DEBUG INFORMATION ====================
    console.log('=== DEBUG INFO ===');
    console.log('Form element:', mainForm);
    console.log('API Endpoint:', PSYCHOMATRIX_FUNCTION);
    console.log('Storage key:', USER_DATA_STORAGE_KEY);
    console.log('==================');
});

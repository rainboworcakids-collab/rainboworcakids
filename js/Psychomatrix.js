// Psychomatrix.js - Version 1.0
// รวม script.js เดิม + AJAX เรียก Edge Functions
// สำหรับ GitHub Pages + Supabase Edge Functions

document.addEventListener('DOMContentLoaded', function() {
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
    const DESTINY_FUNCTION = `https://${SUPABASE_URL}/functions/v1/destiny-calculate`;

    // ==================== HELPER FUNCTIONS ====================

    function getStoredUserData() {
        const data = localStorage.getItem(USER_DATA_STORAGE_KEY);
        return data ? JSON.parse(data) : {};
    }

    function saveUserData(data) {
        localStorage.setItem(USER_DATA_STORAGE_KEY, JSON.stringify(data));
    }

    function loadData(searchName) {
        if (!searchName) {
            alert('โปรดระบุ Search Name ที่ต้องการโหลด.');
            clearAllFormAndModalFields();
            return;
        }

        const storedData = getStoredUserData();
        const data = storedData[searchName];

        if (!data) {
            alert(`ไม่พบข้อมูลสำหรับ Search Name: "${searchName}"`);
            clearAllFormAndModalFields();
            mainSearchNameInput.value = searchName;
            return;
        }

        // Populate main form fields
        if (data.main_data) {
            document.querySelector('select[name="birth_day"]').value = data.main_data.birth_day || '';
            document.querySelector('select[name="birth_month"]').value = data.main_data.birth_month || '';
            document.querySelector('select[name="birth_century"]').value = data.main_data.birth_century || '';
            document.querySelector('select[name="birth_year"]').value = data.main_data.birth_year || '';
            document.querySelector('select[name="birth_hour"]').value = data.main_data.birth_hour || '00';
            document.querySelector('select[name="birth_minute"]').value = data.main_data.birth_minute || '00';
            document.querySelector('input[name="id_card"]').value = data.main_data.id_card || '';
            mainFullNameInput.value = data.main_data.full_name || '';
            
            const optionSelect = document.querySelector('select[name="option"]');
            if (optionSelect) {
                const savedOption = data.main_data.option || 'BD';
                const optionExists = Array.from(optionSelect.options).some(opt => opt.value === savedOption);
                optionSelect.value = optionExists ? savedOption : optionSelect.options[0].value;
            }
            mainSearchNameInput.value = searchName;
        } else {
            clearMainFormFieldsExceptSearchName();
            mainSearchNameInput.value = searchName;
        }

        // Populate surrounding data fields in modal
        if (data.surrounding_data) {
            for (let i = 1; i <= 20; i++) {
                const fieldName = `surrounding_${String(i).padStart(2, '0')}`;
                const modalField = document.getElementById(`modal_${fieldName}`);
                if (modalField) {
                    modalField.value = data.surrounding_data[fieldName] || '';
                }
            }
        } else {
            clearSurroundingModalFields();
        }
        modalSearchNameInput.value = searchName;
    }

    function clearMainFormFieldsExceptSearchName() {
        document.querySelector('select[name="birth_day"]').value = '';
        document.querySelector('select[name="birth_month"]').value = '';
        document.querySelector('select[name="birth_century"]').value = '';
        document.querySelector('select[name="birth_year"]').value = '';
        document.querySelector('select[name="birth_hour"]').value = '00';
        document.querySelector('select[name="birth_minute"]').value = '00';
        document.querySelector('input[name="id_card"]').value = '';
        mainFullNameInput.value = '';
        document.querySelector('select[name="option"]').value = 'BD';
    }

    function clearSurroundingModalFields() {
        for (let i = 1; i <= 20; i++) {
            document.getElementById(`modal_surrounding_${String(i).padStart(2, '0')}`).value = '';
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

        for (const searchName in storedData) {
            const option = document.createElement('option');
            option.value = searchName;
            option.textContent = searchName;
            searchSelect.appendChild(option);
        }
    }

    function showLoading(show = true) {
        let loadingEl = document.getElementById('loadingIndicator');
        if (!loadingEl) {
            loadingEl = document.createElement('div');
            loadingEl.id = 'loadingIndicator';
            loadingEl.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
            loadingEl.innerHTML = '<div class="bg-white p-6 rounded shadow-lg"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div><p class="mt-4 text-center">กำลังคำนวณ...</p></div>';
            document.body.appendChild(loadingEl);
        }
        loadingEl.style.display = show ? 'flex' : 'none';
    }

    // ==================== NEW: AJAX TO EDGE FUNCTION ====================

    async function callPsychomatrixAPI(formData) {
        try {
            showLoading(true);
            
            const response = await fetch(PSYCHOMATRIX_FUNCTION, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            // Store result in localStorage for result.html to read
            sessionStorage.setItem('psychomatrixResult', JSON.stringify(result));
            
            // Redirect to result.html
            window.location.href = 'result.html';
            
        } catch (error) {
            console.error('API Error:', error);
            alert('เกิดข้อผิดพลาดในการคำนวณ: ' + error.message);
        } finally {
            showLoading(false);
        }
    }

    // ==================== EVENT LISTENERS ====================

    if (mainForm) {
        mainForm.addEventListener('submit', function(e) {
            const action = e.submitter ? e.submitter.value : '';
            const searchName = mainSearchNameInput.value.trim();

            if (action === 'save') {
                e.preventDefault();

                if (!searchName) {
                    alert('โปรดระบุ Search Name เพื่อบันทึกข้อมูล.');
                    return;
                }

                // Validate time
                const birthHour = document.querySelector('select[name="birth_hour"]').value;
                const birthMinute = document.querySelector('select[name="birth_minute"]').value;
                if (birthHour && (parseInt(birthHour) < 0 || parseInt(birthHour) > 23)) {
                    alert('โปรดระบุชั่วโมงที่ถูกต้อง (00-23).');
                    return;
                }
                if (birthMinute && (parseInt(birthMinute) < 0 || parseInt(birthMinute) > 59)) {
                    alert('โปรดระบุนาทีที่ถูกต้อง (00-59).');
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
                alert('บันทึกข้อมูลหลักเรียบร้อยแล้ว.');
                populateSearchSelect();

            } else if (action === 'analyze') {
                e.preventDefault();
                
                // Prepare data for API
                const formData = {
                    action: 'analyze',
                    search_name: searchName,
                    use_average: document.querySelector('#use_average').checked,
                    option: document.querySelector('select[name="option"]').value,
                    birth_day: document.querySelector('select[name="birth_day"]').value,
                    birth_month: document.querySelector('select[name="birth_month"]').value,
                    birth_century: document.querySelector('select[name="birth_century"]').value,
                    birth_year: document.querySelector('select[name="birth_year"]').value,
                    birth_hour: document.querySelector('select[name="birth_hour"]').value,
                    birth_minute: document.querySelector('select[name="birth_minute"]').value,
                    id_card: document.querySelector('input[name="id_card"]').value,
                    full_name: mainFullNameInput.value
                };

                // Add surrounding data
                const storedData = getStoredUserData();
                if (searchName && storedData[searchName] && storedData[searchName].surrounding_data) {
                    formData.surrounding_data = storedData[searchName].surrounding_data;
                }

                // Call Edge Function
                callPsychomatrixAPI(formData);
            }
        });
    }

    if (loadMainButton && searchModal) {
        loadMainButton.addEventListener('click', function() {
            populateSearchSelect();
            searchModal.classList.remove('hidden');
        });
    }

    if (cancelSearchModalBtn && searchModal) {
        cancelSearchModalBtn.addEventListener('click', function() {
            searchModal.classList.add('hidden');
        });
    }

    if (selectSearchBtn && searchSelect && mainSearchNameInput) {
        selectSearchBtn.addEventListener('click', function() {
            const selectedSearchName = searchSelect.value;
            if (selectedSearchName) {
                mainSearchNameInput.value = selectedSearchName;
                searchModal.classList.add('hidden');
                loadData(selectedSearchName);
            } else {
                alert('กรุณาเลือกชื่อที่บันทึกไว้.');
            }
        });
    }

    if (deleteSearchBtn && searchSelect) {
        deleteSearchBtn.addEventListener('click', function() {
            const searchNameToDelete = searchSelect.value;
            if (!searchNameToDelete) {
                alert('โปรดเลือกชื่อที่บันทึกไว้เพื่อลบ.');
                return;
            }

            if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูลที่บันทึกไว้ "${searchNameToDelete}"?`)) {
                return;
            }

            let storedData = getStoredUserData();
            if (storedData[searchNameToDelete]) {
                delete storedData[searchNameToDelete];
                saveUserData(storedData);
                alert(`ข้อมูล "${searchNameToDelete}" ถูกลบเรียบร้อยแล้ว.`);
                populateSearchSelect();
                if (mainSearchNameInput.value === searchNameToDelete) {
                    clearAllFormAndModalFields();
                }
                searchModal.classList.add('hidden');
            } else {
                alert('ไม่พบข้อมูลที่จะลบ.');
            }
        });
    }

    if (openSurroundingDataModalBtn && surroundingDataModal && modalSearchNameInput && mainSearchNameInput) {
        openSurroundingDataModalBtn.addEventListener('click', function() {
            const currentSearchName = mainSearchNameInput.value.trim();
            if (!currentSearchName) {
                alert('โปรดระบุ Search Name ที่ฟอร์มหลักก่อน เพื่อใช้เชื่อมโยงข้อมูลพลังตัวเลขรอบตัว');
                return;
            }
            modalSearchNameInput.value = currentSearchName;
            const storedData = getStoredUserData();
            if (storedData[currentSearchName] && storedData[currentSearchName].surrounding_data) {
                for (let i = 1; i <= 20; i++) {
                    const fieldName = `surrounding_${String(i).padStart(2, '0')}`;
                    document.getElementById(`modal_${fieldName}`).value = storedData[currentSearchName].surrounding_data[fieldName] || '';
                }
            } else {
                clearSurroundingModalFields();
            }
            surroundingDataModal.classList.remove('hidden');
        });
    }

    if (cancelSurroundingDataBtn && surroundingDataModal) {
        cancelSurroundingDataBtn.addEventListener('click', function() {
            surroundingDataModal.classList.add('hidden');
        });
    }

    if (surroundingDataForm) {
        surroundingDataForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const searchName = document.getElementById('modal_search_name').value.trim();
            if (!searchName) {
                alert('ไม่พบ Search Name ใน Modal กรุณาลองใหม่');
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
                alert('กรุณากรอกข้อมูลรอบตัวอย่างน้อย 1 ช่อง');
                return;
            }

            const storedData = getStoredUserData();
            if (!storedData[searchName]) {
                storedData[searchName] = {};
            }
            storedData[searchName].surrounding_data = surroundingData;

            saveUserData(storedData);
            alert('บันทึกข้อมูลพลังตัวเลขรอบตัวเรียบร้อยแล้ว.');
            surroundingDataModal.classList.add('hidden');
        });
    }

    // Save/Load LocalStorage to File
    if (saveLocalStorageFileBtn) {
        saveLocalStorageFileBtn.addEventListener('click', function() {
            const userData = localStorage.getItem(USER_DATA_STORAGE_KEY);
            if (!userData) {
                alert('ไม่พบข้อมูลที่จะบันทึกใน LocalStorage.');
                return;
            }

            const blob = new Blob([userData], { type: 'text/plain;charset=utf-8' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = 'psychomatrix_backup_[DATE].txt'.replace('[DATE]', new Date().toISOString().split('T')[0]);
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            alert('ข้อมูล LocalStorage ถูกบันทึกลงไฟล์เรียบร้อยแล้ว.');
        });
    }

    if (loadLocalStorageFileBtn && loadLocalStorageFileInput) {
        loadLocalStorageFileBtn.addEventListener('click', function() {
            loadLocalStorageFileInput.click();
        });

        loadLocalStorageFileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (!file) {
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const fileContent = e.target.result;
                    const parsedData = JSON.parse(fileContent);
                    saveUserData(parsedData);
                    alert('ข้อมูล LocalStorage ถูกโหลดจากไฟล์เรียบร้อยแล้ว. โปรดเลือกชื่อเพื่อโหลดข้อมูล.');
                    populateSearchSelect();
                    searchModal.classList.add('hidden');
                } catch (error) {
                    alert('เกิดข้อผิดพลาดในการอ่านหรือแยกวิเคราะห์ไฟล์: ตรวจสอบว่าไฟล์เป็นไฟล์ข้อความ JSON ที่ถูกต้อง.');
                    console.error('File read/parse error:', error);
                }
            };
            reader.readAsText(file);
        });
    }

    // Initial population
    populateSearchSelect();

    // ==================== สร้าง 20 Fields สำหรับ Surrounding Data ====================
    generateSurroundingFields();

    function generateSurroundingFields() {
        const container = document.getElementById('surroundingFieldsContainer');
        if (!container) {
            console.error('Error: surroundingFieldsContainer not found!');
            return;
        }
        
        container.innerHTML = ''; // Clear ทุกครั้งที่โหลด
        
        for (let i = 1; i <= 20; i++) {
            const fieldNumber = String(i).padStart(2, '0');
            const div = document.createElement('div');
            div.className = 'mb-4'; // Add margin
            div.innerHTML = `
                <label for="modal_surrounding_${fieldNumber}" class="block text-sm font-medium text-gray-700 mb-2">
                    ข้อมูลรอบตัว #${fieldNumber}:
                </label>
                <input type="text" id="modal_surrounding_${fieldNumber}" 
                       name="surrounding_${fieldNumber}"
                       class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 
                              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            `;
            container.appendChild(div);
        }
        
        console.log('✅ Generated 20 surrounding fields');
    }


});

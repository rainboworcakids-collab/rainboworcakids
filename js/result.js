// result.js - เวอร์ชันอัปเดต พร้อมโหลดจาก Supabase Storage
console.log('🚀 DEBUG: result.js loaded - v12-Supabase-Storage');

// Configuration
const currentPath = window.location.pathname;
const folderPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
const CONTENTS_DIR = 'PsychomatrixContents';
const BASE_PATH = `${folderPath}/${CONTENTS_DIR}`;

// ✅ Supabase Storage URLs
const SUPABASE_STORAGE_URL = 'https://oibubvhuiuurkxhnefsw.supabase.co/storage/v1/object/public/data';
const ROOT_NUMBER_URL = `${SUPABASE_STORAGE_URL}/RootNumber.json`;
const LIFE_PATH_PROPERTY_URL = `${SUPABASE_STORAGE_URL}/LifePathProperty.json`;
const PINNACLE_CYCLE_URL = `${SUPABASE_STORAGE_URL}/PinnacleCycle.json`;

console.log('📍 DEBUG: BASE_PATH:', BASE_PATH);
console.log('📍 DEBUG: Supabase URLs:', { ROOT_NUMBER_URL, LIFE_PATH_PROPERTY_URL, PINNACLE_CYCLE_URL });

// Global variables
let analysisData = null;
let pinnacleData = null;
let lifePathProperties = null;
let rootNumberData = null;
let currentOption = 'BD';

function setCalculationOption() {
    console.log('🔧 DEBUG: Setting calculation option...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const optionFromURL = urlParams.get('option');
    
    if (optionFromURL) {
        currentOption = optionFromURL;
        console.log(`✅ DEBUG: Using option from URL parameter: ${currentOption}`);
    } else {
        try {
            const optionFromStorage = sessionStorage.getItem('psychomatrixOption');
            if (optionFromStorage) {
                currentOption = optionFromStorage;
                console.log(`✅ DEBUG: Using option from sessionStorage: ${currentOption}`);
            } else {
                currentOption = 'BD';
                console.log(`⚠️ DEBUG: No option found, using default: ${currentOption}`);
            }
        } catch (error) {
            console.error('❌ DEBUG: Error reading sessionStorage:', error);
            currentOption = 'BD';
        }
    }
    
    if (window.pythagorean && window.pythagorean.setCalculationOption) {
        window.pythagorean.setCalculationOption(currentOption);
    }
    
    console.log(`✅ DEBUG: Final calculation option: ${currentOption}`);
    return currentOption;
}

// ===== CORE FUNCTIONS =====

function switchTab(tabName, buttonElement) {
    console.log('🔧 DEBUG: Switching to tab:', tabName);
    
    const tabContents = document.querySelectorAll('.tabcontent');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    const tabButtons = document.querySelectorAll('.tablink');
    tabButtons.forEach(btn => {
        btn.style.backgroundColor = "";
        btn.style.color = "#aaa";
    });
    
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    if (buttonElement) {
        buttonElement.style.backgroundColor = '#f1f2ff';
        buttonElement.style.color = '#00f';
    }
}

function toggleDebugInfo() {
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        debugInfo.classList.toggle('tw-hidden');
    }
}

function initializePage() {
    console.log('🌐 DEBUG: Initializing page...');
    
    currentOption = setCalculationOption();
    
    const psychomatrixResult = sessionStorage.getItem('psychomatrixResult');
    console.log('🔍 DEBUG: psychomatrixResult exists:', !!psychomatrixResult);
    
    setTimeout(() => {
        const defaultOpenButton = document.getElementById("defaultOpen");
        if (defaultOpenButton) {
            defaultOpenButton.click();
        }
        
        setTimeout(() => {
            loadAndDisplayResults();
        }, 100);
    }, 50);
}

// ==================== โหลดข้อมูลจาก Supabase Storage ====================

async function loadRootNumberData() {
    console.log('📦 DEBUG: Loading RootNumber.json from Supabase Storage...');
    
    if (window.rootNumberData) {
        console.log('✅ DEBUG: RootNumber.json already loaded');
        return window.rootNumberData;
    }
    
    try {
        console.log(`🔄 DEBUG: Loading from: ${ROOT_NUMBER_URL}`);
        const response = await fetch(ROOT_NUMBER_URL, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ DEBUG: Loaded RootNumber.json from Supabase Storage`);
            window.rootNumberData = data;
            rootNumberData = data;
            return data;
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ DEBUG: Error loading RootNumber.json:', error);
        const fallbackData = { 
            message: "ไม่สามารถโหลด RootNumber.json ได้",
            error: error.message,
            fallback: true 
        };
        window.rootNumberData = fallbackData;
        return fallbackData;
    }
}

async function loadLifePathProperties() {
    console.log('📦 DEBUG: Loading LifePathProperty.json from Supabase Storage...');
    
    if (window.lifePathProperties) {
        console.log('✅ DEBUG: LifePathProperty.json already loaded');
        return window.lifePathProperties;
    }
    
    try {
        console.log(`🔄 DEBUG: Loading from: ${LIFE_PATH_PROPERTY_URL}`);
        const response = await fetch(LIFE_PATH_PROPERTY_URL, {
            method: 'GET',
            headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log(`✅ DEBUG: Loaded LifePathProperty.json from Supabase Storage`);
            window.lifePathProperties = data;
            lifePathProperties = data;
            return data;
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ DEBUG: Error loading LifePathProperty.json:', error);
        const fallbackData = { 
            message: "ไม่สามารถโหลด LifePathProperty.json ได้",
            error: error.message,
            fallback: true 
        };
        window.lifePathProperties = fallbackData;
        return fallbackData;
    }
}

function getLifePathDetails(lifePathNumber) {
    console.log("🔍 DEBUG: getLifePathDetails() for number:", lifePathNumber);
    
    if (!lifePathProperties) {
        console.log("❌ DEBUG: lifePathProperties not loaded");
        return null;
    }
    
    const targetId = lifePathNumber.toString();
    
    if (lifePathProperties.LifePath && Array.isArray(lifePathProperties.LifePath)) {
        const foundItem = lifePathProperties.LifePath.find(item => item && item.ID === targetId);
        if (foundItem) {
            console.log("✅ DEBUG: Found in LifePath array");
            return foundItem;
        }
    }
    
    if (Array.isArray(lifePathProperties)) {
        const foundItem = lifePathProperties.find(item => item && item.ID === targetId);
        if (foundItem) {
            console.log("✅ DEBUG: Found in direct array");
            return foundItem;
        }
    }
    
    console.log("❌ DEBUG: No life path found for number:", lifePathNumber);
    return null;
}

function createLifePathDetailsHTML(lifePathNumber, lifePathData) {
    console.log('🎨 DEBUG: Creating life path details HTML');
    
    if (!lifePathData) {
        return '<div class="life-path-details"><p class="tw-text-gray-500 tw-text-center">No Life Path details available</p></div>';
    }
    
    
    let html = `
        <div class="life-path-details tw-mt-4 tw-p-4 tw-bg-gray-50 tw-rounded-lg" 
             style="display: block !important; visibility: visible !important;">
            <h3 class="tw-text-lg tw-font-bold tw-text-blue-800 tw-mb-3">Life Path Number ${lifePathNumber} Details</h3>
    `;
    
    /*
    let html = `
        <div class="life-path-details tw-mt-4 tw-p-4 tw-bg-gray-50 tw-rounded-lg">
            <h3 class="tw-text-lg tw-font-bold tw-text-blue-800 tw-mb-3">Life Path Number ${lifePathNumber} Details</h3>
    `;
    */
    
    if (lifePathData.ShortDefinition) {
        html += `
            <div class="tw-mb-3">
                <h4 class="tw-font-semibold tw-text-gray-700">Short Definition:</h4>
                <p class="tw-text-gray-600">${lifePathData.ShortDefinition}</p>
            </div>
        `;
    }
    
    if (lifePathData.MEANING) {
        html += `
            <div class="tw-mb-3">
                <h4 class="tw-font-semibold tw-text-gray-700">Meaning:</h4>
                <p class="tw-text-gray-600">${lifePathData.MEANING}</p>
            </div>
        `;
    }
    
    if (lifePathData.InherentDread) {
        html += `
            <div class="tw-mb-3 tw-p-2 tw-bg-red-50 tw-rounded">
                <h4 class="tw-font-semibold tw-text-red-700">Inherent Dread:</h4>
                <p class="tw-text-red-600">${lifePathData.InherentDread}</p>
            </div>
        `;
    }
    
    html += `</div>`;
    
    return html;
}

function convertNameToNumberStringFallback(name) {
    console.log('🔤 DEBUG: Converting name to numbers (fallback):', name);
    
    const thaiToEnglishMap = {
        'ก': 'K', 'ข': 'K', 'ค': 'K', 'ฆ': 'K', 'ง': 'N',
        'จ': 'J', 'ฉ': 'C', 'ช': 'C', 'ซ': 'S', 'ฌ': 'J', 'ญ': 'Y',
        'ฎ': 'D', 'ฏ': 'T', 'ฐ': 'T', 'ฑ': 'D', 'ฒ': 'T', 'ณ': 'N',
        'ด': 'D', 'ต': 'T', 'ถ': 'T', 'ท': 'T', 'ธ': 'T', 'น': 'N',
        'บ': 'B', 'ป': 'P', 'ผ': 'P', 'ฝ': 'F', 'พ': 'P', 'ฟ': 'F',
        'ภ': 'P', 'ม': 'M', 'ย': 'Y', 'ร': 'R', 'ล': 'L', 'ว': 'W',
        'ศ': 'S', 'ษ': 'S', 'ส': 'S', 'ห': 'H', 'ฬ': 'L', 'อ': 'O',
        'ฮ': 'H',
        'ะ': 'A', 'า': 'A', 'ำ': 'A', 'ิ': 'I', 'ี': 'I', 'ึ': 'U', 'ื': 'U',
        'ุ': 'U', 'ู': 'U', 'เ': 'E', 'แ': 'A', 'โ': 'O', 'ใ': 'I', 'ไ': 'I'
    };
    
    const letterToNumberMap = {
        'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
        'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
        'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8,
        '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
    };
    
    function letterToNumber(letter) {
        const upperLetter = letter.toUpperCase();
        
        if (thaiToEnglishMap[letter]) {
            return letterToNumberMap[thaiToEnglishMap[letter]] || 0;
        }
        
        return letterToNumberMap[upperLetter] || 0;
    }
    
    let numberString = '';
    const cleanedName = name.replace(/\s/g, '');
    
    for (let i = 0; i < cleanedName.length; i++) {
        const char = cleanedName[i];
        const number = letterToNumber(char);
        if (number > 0) {
            numberString += number.toString();
        }
    }
    
    console.log('🔤 DEBUG: Converted to:', numberString);
    return numberString;
}

function createNumberButton(number, category, actualNumber) {
    if (number === undefined || number === null || number === '') {
        return `<div class="number-button empty">-</div>`;
    }
    
    let filename = '';
    switch(category) {
        case 'Destiny':
            filename = `Destiny${number}.html`;
            break;
        case 'LifePath':
            filename = `LifePathNumber${number}.html`;
            break;
        case 'Karmic':
            filename = ``;
            break;
        case 'LifeLesson':
            filename = `KarmicLesson${number}.html`;
            break;
        default:
            filename = `${category}${number}.html`;
    }
    
    let url = filename ? `${BASE_PATH}/${filename}` : '';
    
    if (url) {
        return `
            <button class="number-button" 
                    onclick="loadExplainedContent('${url}', '${category}', ${number})">
                ${number}
            </button>
        `;
    } else {
        return `<div class="number-button static">${number}</div>`;
    }
}

function loadExplainedContent(url, category, number) {
    console.log(`🔄 DEBUG: Loading ${category} ${number} from: ${url}`);
    
    if (!url) {
        console.log('⚠️ DEBUG: No URL provided');
        return;
    }
    
    const explainedContent = document.getElementById('explainedContent');
    const explainedButton = document.querySelector('.tablink:nth-child(2)');
    
    if (!explainedContent || !explainedButton) {
        console.error('❌ DEBUG: Explained content or button not found');
        return;
    }
    
    explainedContent.innerHTML = `
        <div class="tw-text-center tw-py-8">
            <div class="spinner"></div>
            <p class="tw-mt-4 tw-text-gray-600">Loading ${category} ${number}...</p>
            <p class="tw-text-sm tw-text-gray-500">URL: ${url}</p>
        </div>
    `;
    
    switchTab('Explained', explainedButton);
    
    fetch(url, { 
        method: 'GET',
        cache: 'no-cache',
        headers: { 'Accept': 'text/html' }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            console.log(`✅ DEBUG: Success loading ${url}`);
            
            const fixedHtml = html.replace(
                /(src|href)=["']([^"']+)["']/g,
                (match, attr, path) => {
                    if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) {
                        return match;
                    }
                    
                    let newPath;
                    if (path.startsWith('/')) {
                        newPath = `${BASE_PATH}${path}`;
                    } else if (path.startsWith('./')) {
                        newPath = `${BASE_PATH}/${path.substring(2)}`;
                    } else {
                        newPath = `${BASE_PATH}/${path}`;
                    }
                    
                    return `${attr}="${newPath}"`;
                }
            );
            
            explainedContent.innerHTML = `
                <div class="external-content-body">
                    ${fixedHtml}
                </div>
            `;
            
        })
        .catch(error => {
            console.error(`❌ DEBUG: Error loading ${url}:`, error);
            explainedContent.innerHTML = `
                <div class="tw-text-center tw-py-8 tw-text-red-500">
                    <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                    <p class="tw-font-bold">Cannot load content</p>
                    <p class="tw-text-sm">${error.message}</p>
                    <p class="tw-text-sm tw-text-gray-500 tw-mt-2">URL: ${url}</p>
                </div>
            `;
        });
}

// โหลด Pinnacle Cycle
async function loadPinnacle() {
    console.log('📖 DEBUG: Loading Pinnacle Cycle...');
    
    const explainedContent = document.getElementById('explainedContent');
    const explainedButton = document.querySelector('.tablink:nth-child(2)');
    
    if (!explainedContent || !explainedButton) {
        console.error('❌ DEBUG: Explained content or button not found');
        return;
    }
    
    explainedContent.innerHTML = `
        <div class="tw-text-center tw-py-8">
            <div class="spinner"></div>
            <p class="tw-mt-4 tw-text-gray-600">กำลังโหลด Pinnacle Cycle...</p>
        </div>
    `;
    
    switchTab('Explained', explainedButton);
    
    try {
        if (window.pinnacle && typeof window.pinnacle.showPinnacleCycle === 'function') {
            await window.pinnacle.showPinnacleCycle(0);
        } else {
            throw new Error('Pinnacle module not available');
        }
        
    } catch (error) {
        console.error('❌ Error loading pinnacle:', error);
        explainedContent.innerHTML = `
            <div class="tw-text-center tw-py-8 tw-text-red-500">
                <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                <p class="tw-font-bold">ไม่สามารถโหลด Pinnacle Cycle</p>
                <p class="tw-text-sm">${error.message}</p>
                <button onclick="window.location.reload()" class="tw-mt-4 tw-bg-blue-500 tw-text-white tw-py-2 tw-px-4 tw-rounded">
                    โหลดหน้าใหม่
                </button>
            </div>
        `;
    }
}

function createResultSection(result, index) {
    console.log('🎨 DEBUG: Creating result section:', index);
    console.log('🎨 DEBUG: Result type:', result.type);
    
    const type = result.type || 'unknown';
    const title = result.title || `Result ${index + 1}`;
    const data = result.data || {};
    
    const isCombinedInfluence = type === 'combined-influence';
    
    if (isCombinedInfluence) {
        return `<div></div>`;
    } 

    const destinyNum = data.destiny_number || data.destiny;
    const lifePathNum = data.life_path_number || data.lifePath;
    const karmicNum = data.thirdAndFourth?.karmic || data.karmic;
    const lifeLessonNum = data.thirdAndFourth?.lifeLesson || data.lifeLesson;
    
    let lifePathDetails = null;
    let lifePathDetailsHTML = '';
    
    if (lifePathNum !== undefined && lifePathNum !== null) {
        lifePathDetails = getLifePathDetails(lifePathNum);
        if (lifePathDetails) {
            lifePathDetailsHTML = createLifePathDetailsHTML(lifePathNum, lifePathDetails);
        }
    }
    
    if (type === 'birth-date' && data.birth_date) {
        const birthDateStr = data.birth_date;
        let birthDay = '', birthMonth = '', birthYear = '';
        let birthHour = 0, birthMinute = 0;
        
        if (birthDateStr && birthDateStr.includes('/')) {
            const timeMatch = birthDateStr.match(/(\d{2}):(\d{2})/);
            if (timeMatch) {
                birthHour = parseInt(timeMatch[1]);
                birthMinute = parseInt(timeMatch[2]);
            }
            
            const dateParts = birthDateStr.split(' ');
            if (dateParts.length >= 2) {
                const datePart = dateParts[1];
                const [day, month, year] = datePart.split('/').map(Number);
                birthDay = day.toString().padStart(2, '0');
                birthMonth = month.toString().padStart(2, '0');
                birthYear = year.toString();
            }
        }
        
        pinnacleData = {
            lifePathNumber: data.life_path_number || data.lifePath || lifePathNum,
            birth_date: data.birth_date,
            UDate: birthDay,
            UMonth: birthMonth,
            UYear: birthYear,
            birth_hour: birthHour,
            birth_minute: birthMinute,
            destiny_number: data.destiny_number || data.destiny
        };
        
        // เก็บใน sessionStorage
        sessionStorage.setItem('pinnacleData', JSON.stringify(pinnacleData));
    
        // เก็บใน window ด้วย
        window.pinnacleData = pinnacleData;
        console.log('📊 DEBUG: Pinnacle data extracted:', window.pinnacleData);
    }
    
    let buttonsHTML = '';
    
    buttonsHTML += `
        <button onclick="window.pythagorean.showPythagoreanSquare(${index})" 
                class="tw-bg-blue-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-blue-600 tw-cursor-pointer tw-w-48 tw-inline-block tw-m-1">
            Pythagorean Square
        </button>
    `;
    
    if (type === 'birth-date' && pinnacleData) {
        buttonsHTML += `
            <button onclick="window.pinnacle.showPinnacleCycle(${index})" 
                    class="tw-bg-green-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-green-600 tw-cursor-pointer tw-w-48 tw-inline-block tw-m-1">
                Pinnacle Cycle
            </button>
        `;
    }
    
    let showCombinedButton = false;
    let combinedButtonText = '';
    
    switch(currentOption) {
        case 'BD':
        case 'IDC':
        case 'FullName':
            showCombinedButton = false;
            console.log(`🔧 DEBUG: Option ${currentOption} - Showing 2 buttons only`);
            break;
            
        case 'BD-IDC':
            showCombinedButton = true;
            combinedButtonText = 'Pythagorean Square (ค่าเฉลี่ย2ตาราง)';
            console.log(`🔧 DEBUG: Option ${currentOption} - Showing 3 buttons with: ${combinedButtonText}`);
            break;
            
        case 'BD-IDC-FullName':
            showCombinedButton = true;
            combinedButtonText = 'Pythagorean Square (ค่าเฉลี่ย3ตาราง)';
            console.log(`🔧 DEBUG: Option ${currentOption} - Showing 3 buttons with: ${combinedButtonText}`);
            break;
            
        case 'Num-Ard':
            showCombinedButton = true;
            combinedButtonText = 'Pythagorean Square (รวมเลขสิ่งแวดล้อม)';
            console.log(`🔧 DEBUG: Option ${currentOption} - Showing 3 buttons with: ${combinedButtonText}`);
            break;
            
        default:
            showCombinedButton = false;
            console.log(`⚠️ DEBUG: Unknown option ${currentOption} - Showing 2 buttons only`);
    }
    
    if (showCombinedButton) {
        buttonsHTML += `
            <button onclick="window.pythagorean.showCombinedPythagoreanSquare(${index}, ${JSON.stringify(result).replace(/"/g, '&quot;')})" 
                    class="tw-bg-purple-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-purple-600 tw-cursor-pointer tw-w-64 tw-inline-block tw-m-1">
                ${combinedButtonText}
            </button>
        `;
    }
    
    return `
        <div class="result-section tw-mb-8 tw-p-6 tw-bg-white tw-rounded-lg tw-shadow">
            <div class="section-header tw-text-xl tw-font-bold tw-text-blue-800 tw-mb-4 tw-pb-2 tw-border-b">
                <i class="fas fa-chart-bar tw-mr-2"></i>${title}
            </div>
            <div class="section-content">
                
                <div class="data-grid tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-mb-6">
                    <div class="data-item tw-text-center">
                        <div class="label tw-text-sm tw-font-semibold tw-text-gray-600 tw-mb-2">Life Path Number</div>
                        ${createNumberButton(lifePathNum, 'LifePath', lifePathNum)}
                        <div class="description tw-text-xs tw-text-gray-500 tw-mt-2">Life path and purpose</div>
                    </div>                        
                    <div class="data-item tw-text-center">
                        <div class="label tw-text-sm tw-font-semibold tw-text-gray-600 tw-mb-2">Destiny Number</div>
                        ${createNumberButton(destinyNum, 'Destiny', destinyNum)}
                        <div class="description tw-text-xs tw-text-gray-500 tw-mt-2">Personality and destiny</div>
                    </div>
                    <div class="data-item tw-text-center">
                        <div class="label tw-text-sm tw-font-semibold tw-text-gray-600 tw-mb-2">Karmic Number</div>
                        ${createNumberButton(karmicNum, 'Karmic', karmicNum)}
                        <div class="description tw-text-xs tw-text-gray-500 tw-mt-2">Karmic debt</div>
                    </div>
                    <div class="data-item tw-text-center">
                        <div class="label tw-text-sm tw-font-semibold tw-text-gray-600 tw-mb-2">Life Lesson</div>
                        ${createNumberButton(lifeLessonNum, 'LifeLesson', lifeLessonNum)}
                        <div class="description tw-text-xs tw-text-gray-500 tw-mt-2">Life lessons</div>
                    </div>
                </div>
                
                ${lifePathDetailsHTML || ''}
                
                <div class="tw-mx-auto tw-mt-8 tw-mb-4 tw-text-center">
                    ${buttonsHTML}
                </div>
            </div>
        </div>
    `;
}

function createFallbackDisplay(data) {
    console.log('🎨 DEBUG: Creating fallback display');
    
    return `
        <div class="result-section tw-mb-8 tw-p-6 tw-bg-white tw-rounded-lg tw-shadow">
            <div class="section-header tw-text-xl tw-font-bold tw-text-red-800 tw-mb-4">
                <i class="fas fa-exclamation-triangle tw-mr-2"></i>Raw Analysis Result
            </div>
            <div class="section-content">
                <p class="tw-text-gray-600">The data structure is not in the expected format:</p>
                <div class="tw-mt-4 tw-p-4 tw-bg-gray-100 tw-rounded tw-font-mono tw-text-sm">
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
        </div>
    `;
}

async function loadAndDisplayResults() {
    console.log('🔄 DEBUG: Starting loadAndDisplayResults()');
    
    const loadingSection = document.getElementById('loadingSection');
    const errorSection = document.getElementById('errorSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const loadingDetails = document.getElementById('loadingDetails');
    
    if (loadingDetails) {
        loadingDetails.textContent = `กำลังโหลดข้อมูลจาก Supabase Storage...`;
    }
    
    const resultData = sessionStorage.getItem('psychomatrixResult');
    
    if (!resultData) {
        console.log('❌ DEBUG: No data in sessionStorage');
        
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = 'ไม่พบข้อมูลการวิเคราะห์ กรุณากรอกข้อมูลใน Psychomatrix.html ก่อน';
        }
        
        setTimeout(() => {
            if (loadingSection) loadingSection.classList.add('tw-hidden');
            if (errorSection) errorSection.classList.remove('tw-hidden');
        }, 1000);
        return;
    }
    
    try {
        console.log('📦 DEBUG: Parsing result data...');
        if (loadingDetails) {
            loadingDetails.textContent = `กำลังแยกวิเคราะห์ข้อมูล JSON...`;
        }
        
        const data = JSON.parse(resultData);
        console.log('📦 DEBUG: Parsed data:', data);
        
        if (!data.success) {
            const errorMsg = data.error || 'API returned error';
            console.error('❌ DEBUG: API error:', errorMsg);
            throw new Error(errorMsg);
        }
        
        console.log('📦 DEBUG: Loading required JSON files from Supabase Storage...');
        if (loadingDetails) {
            loadingDetails.textContent = `กำลังโหลดข้อมูลจากเซิร์ฟเวอร์...`;
        }
        
        await Promise.all([
            loadRootNumberData(),
            loadLifePathProperties()
        ]);
        
        console.log('✅ DEBUG: JSON files loaded from Supabase');
        
        analysisData = data;
        window.analysisData = data;
        
        console.log('🎨 DEBUG: Displaying results...');
        if (loadingDetails) {
            loadingDetails.textContent = `กำลังแสดงผลลัพธ์...`;
        }
        
        displayResults(data);
        
        setTimeout(() => {
            if (loadingSection) loadingSection.classList.add('tw-hidden');
            if (resultsContainer) resultsContainer.classList.remove('tw-hidden');
            console.log('✅ DEBUG: Results displayed successfully');
        }, 500);
        
    } catch (error) {
        console.error('❌ DEBUG: Error in loadAndDisplayResults:', error);
        
        if (loadingDetails) {
            loadingDetails.textContent = `ข้อผิดพลาด: ${error.message}`;
        }
        
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = `เกิดข้อผิดพลาด: ${error.message}`;
        }
        
        setTimeout(() => {
            if (loadingSection) loadingSection.classList.add('tw-hidden');
            if (errorSection) errorSection.classList.remove('tw-hidden');
        }, 1000);
    }
}

function displayResults(data) {
    console.log('🎨 DEBUG: Displaying results');
    
    const resultsContainer = document.getElementById('resultsContainer');
    if (!resultsContainer) {
        console.error('❌ DEBUG: resultsContainer not found');
        return;
    }
    
    let html = '';
    
    if (data.results && Array.isArray(data.results)) {
        console.log(`🎨 DEBUG: Found ${data.results.length} results`);
        
        data.results.forEach((result, index) => {
            console.log(`🎨 DEBUG: Processing result ${index}:`, result.type);
            html += createResultSection(result, index);
        });
    } else if (data.data) {
        console.log('🎨 DEBUG: Using single result mode');
    } else {
        console.log('🎨 DEBUG: Creating fallback display');
        html += createFallbackDisplay(data);
    }
    
    resultsContainer.innerHTML = html;
    
    setTimeout(() => {
        const pythagoreanButtons = resultsContainer.querySelectorAll('button[onclick*="pythagorean.show"]');
        console.log(`🎯 DEBUG: Found ${pythagoreanButtons.length} Pythagorean buttons`);
    }, 100);
}

function testPythagoreanButton() {
    console.log('🧪 DEBUG: Testing Pythagorean button...');
    
    if (window.pythagorean && typeof window.pythagorean.showPythagoreanSquare === 'function') {
        console.log('✅ DEBUG: Calling pythagorean.showPythagoreanSquare(0)...');
        try {
            window.pythagorean.showPythagoreanSquare(0);
        } catch (error) {
            console.error('❌ DEBUG: Error calling function:', error);
        }
    } else {
        console.error('❌ DEBUG: pythagorean.showPythagoreanSquare is not available');
    }
}

function checkScriptsLoaded() {
    console.log('🔍 DEBUG: Checking loaded scripts:');
    
    const status = {
        switchTab: typeof switchTab === 'function',
        pythagorean: !!window.pythagorean,
        showPythagoreanSquare: window.pythagorean && typeof window.pythagorean.showPythagoreanSquare === 'function'
    };
    
    console.log('  - switchTab:', status.switchTab ? '✅ Loaded' : '❌ Missing');
    console.log('  - pythagorean:', status.pythagorean ? '✅ Loaded' : '❌ Missing');
    console.log('  - showPythagoreanSquare:', status.showPythagoreanSquare ? '✅ Loaded' : '❌ Missing');
    
    return status;
}

// ===== EXPORT FUNCTIONS TO GLOBAL SCOPE =====
window.switchTab = switchTab;
window.toggleDebugInfo = toggleDebugInfo;
window.loadExplainedContent = loadExplainedContent;
window.loadPinnacle = loadPinnacle;
window.testPythagoreanButton = testPythagoreanButton;
window.checkScriptsLoaded = checkScriptsLoaded;
window.currentOption = currentOption;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

console.log('✅ DEBUG: result.js loaded completely - Supabase Storage Ready');

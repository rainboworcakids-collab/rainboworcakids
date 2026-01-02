// result.js - เพิ่มส่วนตั้งค่า option
console.log('🚀 DEBUG: result.js loaded - v9.7-Option-Support');

// Configuration
const currentPath = window.location.pathname;
const folderPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
const CONTENTS_DIR = 'PsychomatrixContents';
const BASE_PATH = `${folderPath}/${CONTENTS_DIR}`;

console.log('📍 DEBUG: BASE_PATH:', BASE_PATH);

// Global variables
let analysisData = null;
let pinnacleData = null;
let lifePathProperties = null;
let rootNumberData = null;

// ===== ฟังก์ชันตั้งค่า option =====
function setCalculationOption() {
    console.log('🔧 DEBUG: Setting calculation option...');
    
    // ตรวจสอบ URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const optionFromURL = urlParams.get('option');
    
    // ตรวจสอบ sessionStorage
    const optionFromStorage = sessionStorage.getItem('calculationOption');
    
    // กำหนดค่า option (ลำดับความสำคัญ: URL > sessionStorage > ค่าเริ่มต้น)
    let selectedOption = 'Num-Ard';
    
    if (optionFromURL) {
        selectedOption = optionFromURL;
        console.log(`✅ DEBUG: Using option from URL: ${selectedOption}`);
    } else if (optionFromStorage) {
        selectedOption = optionFromStorage;
        console.log(`✅ DEBUG: Using option from sessionStorage: ${selectedOption}`);
    }
    
    // ตั้งค่าใน pythagorean module
    if (window.pythagorean && window.pythagorean.setCalculationOption) {
        window.pythagorean.setCalculationOption(selectedOption);
    }
    
    console.log(`✅ DEBUG: Final calculation option: ${selectedOption}`);
    return selectedOption;
}

// ===== CORE FUNCTIONS =====

// Tab switching function
function switchTab(tabName, buttonElement) {
    console.log('🔧 DEBUG: Switching to tab:', tabName);
    
    // Hide all tab content
    const tabContents = document.querySelectorAll('.tabcontent');
    tabContents.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Reset all tab buttons
    const tabButtons = document.querySelectorAll('.tablink');
    tabButtons.forEach(btn => {
        btn.style.backgroundColor = "";
        btn.style.color = "#aaa";
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Style active button
    if (buttonElement) {
        buttonElement.style.backgroundColor = '#f1f2ff';
        buttonElement.style.color = '#00f';
    }
}

// Toggle debug info
function toggleDebugInfo() {
    const debugInfo = document.getElementById('debugInfo');
    if (debugInfo) {
        debugInfo.classList.toggle('tw-hidden');
    }
}

// Initialize page
function initializePage() {
    console.log('🌐 DEBUG: Initializing page...');
    
    // ตั้งค่า option ก่อน
    setCalculationOption();
    
    // Check for data in sessionStorage
    const psychomatrixResult = sessionStorage.getItem('psychomatrixResult');
    console.log('🔍 DEBUG: psychomatrixResult exists:', !!psychomatrixResult);
    
    if (psychomatrixResult) {
        console.log('🔍 DEBUG: Data length:', psychomatrixResult.length);
    }
    
    // Open default tab
    setTimeout(() => {
        const defaultOpenButton = document.getElementById("defaultOpen");
        if (defaultOpenButton) {
            defaultOpenButton.click();
        }
        
        // Load and display results
        setTimeout(() => {
            loadAndDisplayResults();
        }, 100);
    }, 50);
}


// Load RootNumber.json
async function loadRootNumberData() {
    console.log('📦 DEBUG: Loading RootNumber.json...');
    
    if (window.rootNumberData) {
        console.log('✅ DEBUG: RootNumber.json already loaded');
        return window.rootNumberData;
    }
    
    try {
        // ลองหลาย path
        const possiblePaths = [
            'data/RootNumber.json',
            '../data/RootNumber.json',
            './data/RootNumber.json',
            `${folderPath}/data/RootNumber.json`
        ];
        
        let loadedData = null;
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ DEBUG: Loaded RootNumber.json from: ${path}`);
                    loadedData = data;
                    break;
                }
            } catch (error) {
                console.log(`❌ DEBUG: Failed to load from ${path}:`, error.message);
                continue;
            }
        }
        
        if (loadedData) {
            window.rootNumberData = loadedData;
            rootNumberData = loadedData;
            return loadedData;
        } else {
            console.error('❌ DEBUG: Failed to load RootNumber.json from all paths');
            return null;
        }
    } catch (error) {
        console.error('❌ DEBUG: Error loading RootNumber.json:', error);
        return null;
    }
}

// Load LifePathProperty.json
async function loadLifePathProperties() {
    console.log('📦 DEBUG: Loading LifePathProperty.json...');
    
    if (window.lifePathProperties) {
        console.log('✅ DEBUG: LifePathProperty.json already loaded');
        return window.lifePathProperties;
    }
    
    try {
        const possiblePaths = [
            'data/LifePathProperty.json',
            '../data/LifePathProperty.json',
            './data/LifePathProperty.json',
            `${folderPath}/data/LifePathProperty.json`
        ];
        
        let loadedData = null;
        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ DEBUG: Loaded LifePathProperty.json from: ${path}`);
                    loadedData = data;
                    break;
                }
            } catch (error) {
                console.log(`❌ DEBUG: Failed to load from ${path}:`, error.message);
                continue;
            }
        }
        
        if (loadedData) {
            window.lifePathProperties = loadedData;
            lifePathProperties = loadedData;
            return loadedData;
        } else {
            console.error('❌ DEBUG: Failed to load LifePathProperty.json from all paths');
            return null;
        }
    } catch (error) {
        console.error('❌ DEBUG: Error loading LifePathProperty.json:', error);
        return null;
    }
}

// Get life path details
function getLifePathDetails(lifePathNumber) {
    console.log("🔍 DEBUG: getLifePathDetails() for number:", lifePathNumber);
    
    if (!lifePathProperties) {
        console.log("❌ DEBUG: lifePathProperties not loaded");
        return null;
    }
    
    const targetId = lifePathNumber.toString();
    
    // Check different possible structures
    if (lifePathProperties.LifePath && Array.isArray(lifePathProperties.LifePath)) {
        const foundItem = lifePathProperties.LifePath.find(item => item && item.ID === targetId);
        if (foundItem) {
            console.log("✅ DEBUG: Found in LifePath array");
            return foundItem;
        }
    }
    
    // Try direct array
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

// Create life path details HTML
function createLifePathDetailsHTML(lifePathNumber, lifePathData) {
    console.log('🎨 DEBUG: Creating life path details HTML');
    
    if (!lifePathData) {
        return '<div class="life-path-details"><p class="tw-text-gray-500 tw-text-center">No Life Path details available</p></div>';
    }
    
    let html = `
        <div class="life-path-details tw-mt-4 tw-p-4 tw-bg-gray-50 tw-rounded-lg">
            <h3 class="tw-text-lg tw-font-bold tw-text-blue-800 tw-mb-3">Life Path Number ${lifePathNumber} Details</h3>
    `;
    
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

// Convert name to number string (fallback function)
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

// Create number button
function createNumberButton(number, category, actualNumber) {
    if (number === undefined || number === null || number === '') {
        return `<div class="number-button empty">-</div>`;
    }
    
    // Filename mapping
    let filename = '';
    switch(category) {
        case 'Destiny':
            filename = `Destiny${number}.html`;
            break;
        case 'LifePath':
            filename = `LifePathNumber${number}.html`;
            break;
        case 'Karmic':
            filename = ``; // No specific page for Karmic
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

// Load explained content
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
            
            // Fix relative paths
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

// Load Pinnacle
function loadPinnacle() {
    console.log('📖 DEBUG: Loading Pinnacle Cycle');
    
    const explainedContent = document.getElementById('explainedContent');
    const explainedButton = document.querySelector('.tablink:nth-child(2)');
    
    if (!explainedContent || !explainedButton) {
        console.error('❌ DEBUG: Explained content or button not found');
        return;
    }
    
    // Check if we have pinnacle data
    if (!pinnacleData) {
        explainedContent.innerHTML = `
            <div class="tw-text-center tw-py-8 tw-text-red-500">
                <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                <p class="tw-font-bold">No birth date data available</p>
                <p class="tw-text-sm">Please analyze birth date data first to view Pinnacle Cycle</p>
            </div>
        `;
        switchTab('Explained', explainedButton);
        return;
    }
    
    const url = `${BASE_PATH}/pinnacle.html`;
    console.log('📖 DEBUG: Pinnacle URL:', url);
    
    explainedContent.innerHTML = `
        <div class="tw-text-center tw-py-8">
            <div class="spinner"></div>
            <p class="tw-mt-4 tw-text-gray-600">Loading Pinnacle Cycle...</p>
        </div>
    `;
    
    switchTab('Explained', explainedButton);
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            explainedContent.innerHTML = `
                <div class="external-content-body">
                    ${html}
                </div>
            `;
        })
        .catch(error => {
            console.error(`❌ DEBUG: Error loading pinnacle:`, error);
            explainedContent.innerHTML = `
                <div class="tw-text-center tw-py-8 tw-text-red-500">
                    <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                    <p class="tw-font-bold">Cannot load Pinnacle Cycle</p>
                    <p class="tw-text-sm">${error.message}</p>
                </div>
            `;
        });
}

// Create result section
function createResultSection(result, index) {
    console.log('🎨 DEBUG: Creating result section:', index);
    
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
        pinnacleData = {
            lifePathNumber: lifePathNum,
            birth_date: data.birth_date,
            UDate: data.birth_date.split('/')[0] || '',
            UMonth: data.birth_date.split('/')[1] || '',
            UYear: data.birth_date.split('/')[2] ? data.birth_date.split('/')[2].split(' ')[0] : ''
        };
        console.log('📊 DEBUG: Pinnacle data extracted:', pinnacleData);
    }
    
    // ตรวจสอบ option ปัจจุบันและกำหนดข้อความปุ่มตามเงื่อนไข
    const currentOption = window.pythagorean ? window.pythagorean.calculationOption : 'Num-Ard';
    
    console.log(`🔧 DEBUG: Current option for button display: ${currentOption}`);
    
    // กำหนดปุ่มที่จะแสดงตาม option
    let showBasicPythagorean = true; // แสดงปุ่ม Pythagorean Square พื้นฐานเสมอ
    let showPinnacle = true; // แสดงปุ่ม Pinnacle Cycle เสมอ
    let showCombinedButton = false; // แสดงปุ่ม combined หรือไม่
    let combinedButtonText = '';
    
    // กำหนดตามเงื่อนไขที่ให้มา
    switch(currentOption) {
        case 'BD':
        case 'IDC':
        case 'FullName':
            // แสดงเฉพาะ 2 ปุ่มแรก
            showCombinedButton = false;
            break;
            
        case 'BD-IDC':
            showCombinedButton = true;
            combinedButtonText = 'Pythagorean Square (ค่าเฉลี่ย2ตาราง)';
            break;
            
        case 'BD-IDC-FullName':
            showCombinedButton = true;
            combinedButtonText = 'Pythagorean Square (ค่าเฉลี่ย3ตาราง)';
            break;
            
        case 'Num-Ard':
            showCombinedButton = true;
            combinedButtonText = 'Pythagorean Square (รวมเลขสิ่งแวดล้อม)';
            break;
            
        default:
            showCombinedButton = false;
    }
    
    console.log(`🔧 DEBUG: Button display settings:`);
    console.log(`  - Basic Pythagorean: ${showBasicPythagorean}`);
    console.log(`  - Pinnacle: ${showPinnacle}`);
    console.log(`  - Combined: ${showCombinedButton} (${combinedButtonText})`);
    
    // สร้าง HTML สำหรับปุ่ม
    let buttonsHTML = '';
    
    // ปุ่ม Pythagorean Square พื้นฐาน
    if (showBasicPythagorean) {
        buttonsHTML += `
            <button onclick="pythagorean.showPythagoreanSquare(${index})" 
                    class="tw-bg-blue-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-blue-600 tw-cursor-pointer tw-w-48 tw-inline-block tw-m-1">
                Pythagorean Square
            </button>
        `;
    }
    
    // ปุ่ม Pinnacle Cycle
    if (showPinnacle) {
        buttonsHTML += `
            <button onclick="loadPinnacle()" 
                    class="tw-bg-green-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-green-600 tw-cursor-pointer tw-w-48 tw-inline-block tw-m-1">
                Pinnacle Cycle
            </button>
        `;
    }
    
    // ปุ่ม Combined (ถ้าต้องแสดง)
    if (showCombinedButton && combinedButtonText) {
        buttonsHTML += `
            <button onclick="pythagorean.showCombinedPythagoreanSquare(${index}, ${JSON.stringify(result).replace(/"/g, '&quot;')})" 
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
                
                <!-- Number Grid -->
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
                
                <!-- Buttons for additional content -->
                <div class="tw-mx-auto tw-mt-8 tw-mb-4 tw-text-center">
                    ${buttonsHTML}
                </div>
            </div>
        </div>
    `;
}

// Create fallback display
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

// Load and display results
async function loadAndDisplayResults() {
    console.log('🔄 DEBUG: Starting loadAndDisplayResults()');
    
    const loadingSection = document.getElementById('loadingSection');
    const errorSection = document.getElementById('errorSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const loadingDetails = document.getElementById('loadingDetails');
    
    if (loadingDetails) {
        loadingDetails.textContent = `Checking sessionStorage for data...`;
    }
    
    // Read from sessionStorage
    const resultData = sessionStorage.getItem('psychomatrixResult');
    
    if (!resultData) {
        console.log('❌ DEBUG: No data in sessionStorage');
        
        // Update error message
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = 'No analysis data found. Please fill in the data on Psychomatrix.html first.';
        }
        
        // Show debug info
        const debugSessionStorage = document.getElementById('debugSessionStorage');
        if (debugSessionStorage) {
            debugSessionStorage.textContent = `sessionStorage.psychomatrixResult: NOT FOUND`;
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
            loadingDetails.textContent = `Parsing JSON data...`;
        }
        
        const data = JSON.parse(resultData);
        console.log('📦 DEBUG: Parsed data:', data);
        
        if (!data.success) {
            const errorMsg = data.error || 'API returned error';
            console.error('❌ DEBUG: API error:', errorMsg);
            throw new Error(errorMsg);
        }
        
        // Load required JSON files
        console.log('📦 DEBUG: Loading required JSON files...');
        if (loadingDetails) {
            loadingDetails.textContent = `Loading configuration files...`;
        }
        
        await Promise.all([
            loadRootNumberData(),
            loadLifePathProperties()
        ]);
        
        console.log('✅ DEBUG: JSON files loaded');
        
        // Store analysis data globally
        analysisData = data;
        window.analysisData = data;
        
        console.log('🎨 DEBUG: Displaying results...');
        if (loadingDetails) {
            loadingDetails.textContent = `Rendering results...`;
        }
        
        displayResults(data);
        
        setTimeout(() => {
            if (loadingSection) loadingSection.classList.add('tw-hidden');
            if (resultsContainer) resultsContainer.classList.remove('tw-hidden');
            console.log('✅ DEBUG: Results displayed successfully');
        }, 500);
        
    } catch (error) {
        console.error('❌ DEBUG: Error in loadAndDisplayResults:', error);
        console.error('❌ DEBUG: Error stack:', error.stack);
        
        if (loadingDetails) {
            loadingDetails.textContent = `Error: ${error.message}`;
        }
        
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = `Error: ${error.message}`;
        }
        
        // Show debug info
        const debugSessionStorage = document.getElementById('debugSessionStorage');
        if (debugSessionStorage && resultData) {
            debugSessionStorage.textContent = `sessionStorage.psychomatrixResult: ${resultData.substring(0, 200)}...`;
        }
        
        setTimeout(() => {
            if (loadingSection) loadingSection.classList.add('tw-hidden');
            if (errorSection) errorSection.classList.remove('tw-hidden');
        }, 1000);
    }
}

// Display results from API
function displayResults(data) {
    console.log('🎨 DEBUG: Displaying results');
    console.log('🎨 DEBUG: Data structure:', data);
    
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
      //  html += createResultSection({
    //        type: 'single',
    //        title: 'Analysis Result',
    //        data: data.data
     //   }, 0);
    } else {
        console.log('🎨 DEBUG: Creating fallback display');
        html += createFallbackDisplay(data);
    }
    
    resultsContainer.innerHTML = html;
    
    // Add event listeners for Pythagorean buttons
    setTimeout(() => {
        const pythagoreanButtons = resultsContainer.querySelectorAll('button[onclick*="pythagorean.show"]');
        console.log(`🎯 DEBUG: Found ${pythagoreanButtons.length} Pythagorean buttons`);
    }, 100);
}

// Test Pythagorean button
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

// Check scripts loaded
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

console.log('✅ DEBUG: result.js loaded completely version 9.7');

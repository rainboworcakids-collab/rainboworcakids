// result.js - Main result handling functions
console.log('🚀 DEBUG: result.js loaded - Version 7.5');

// ===== GLOBAL FUNCTIONS =====

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

// ===== MAIN INITIALIZATION =====

// Initialize page
function initializePage() {
    console.log('🌐 DEBUG: initializePage() called');
    
    // ตรวจสอบว่าไฟล์ pythagorean.js โหลดแล้วหรือไม่
    if (!window.pythagorean) {
        console.error('❌ CRITICAL: pythagorean.js not loaded!');
        
        // แสดง error message
        const errorSection = document.getElementById('errorSection');
        const errorMessage = document.getElementById('errorMessage');
        if (errorSection && errorMessage) {
            errorMessage.textContent = 'JavaScript files failed to load. Please refresh the page.';
            errorSection.classList.remove('tw-hidden');
        }
        return;
    }
    
    console.log('🌐 DEBUG: All JavaScript files loaded successfully');
    
    // Log all sessionStorage keys
    console.log('🔍 DEBUG: sessionStorage keys:', Object.keys(sessionStorage));
    
    // Check for data
    const psychomatrixResult = sessionStorage.getItem('psychomatrixResult');
    console.log('🔍 DEBUG: psychomatrixResult exists:', !!psychomatrixResult);
    
    if (psychomatrixResult) {
        try {
            window.analysisData = JSON.parse(psychomatrixResult);
            console.log('✅ DEBUG: Parsed analysisData');
        } catch (error) {
            console.error('❌ DEBUG: Error parsing sessionStorage data:', error);
        }
    }
    
    // Update loading details
    const loadingDetails = document.getElementById('loadingDetails');
    if (loadingDetails) {
        loadingDetails.textContent = 'Initializing application...';
    }
    
    // Open default tab
    setTimeout(() => {
        try {
            const defaultTab = document.getElementById("defaultOpen");
            if (defaultTab) {
                defaultTab.click();
                console.log('✅ DEBUG: Default tab opened');
            } else {
                console.error('❌ DEBUG: defaultOpen button not found');
            }
        } catch (error) {
            console.error('❌ DEBUG: Error opening default tab:', error);
        }
        
        // Load and display results
        setTimeout(() => {
            loadAndDisplayResults();
        }, 100);
    }, 50);
}

// ===== DATA LOADING FUNCTIONS =====

// Load LifePathProperty.json
async function loadLifePathProperties() {
    console.log('🔄 DEBUG: loadLifePathProperties() called');
    
    // ลองหลายๆ path
    const possiblePaths = [
        // สำหรับ GitHub Pages
        '/data/LifePathProperty.json',
        './data/LifePathProperty.json',
        '../data/LifePathProperty.json',
        'data/LifePathProperty.json',
        // สำหรับโครงสร้างอื่น
        '../../data/LifePathProperty.json'
    ];
    
    // เพิ่ม path จาก BASE_PATH ถ้ามี
    if (window.BASE_PATH) {
        possiblePaths.unshift(`${window.BASE_PATH}/../data/LifePathProperty.json`);
    }
    
    // ลองโหลดจาก cache ก่อน
    const cachedData = localStorage.getItem('lifePathPropertiesCache');
    if (cachedData) {
        try {
            console.log('📦 DEBUG: Loading from localStorage cache');
            const data = JSON.parse(cachedData);
            window.lifePathProperties = data;
            return data;
        } catch (error) {
            console.log('❌ DEBUG: Error parsing cache:', error);
        }
    }
    
    for (const lifePathUrl of possiblePaths) {
        console.log(`📂 DEBUG: Trying to load from: "${lifePathUrl}"`);
        
        try {
            const response = await fetch(lifePathUrl);
            console.log(`📂 DEBUG: Response status: ${response.status}`);
            
            if (!response.ok) {
                console.log(`❌ DEBUG: Failed (${response.status}), trying next...`);
                continue;
            }
            
            const data = await response.json();
            console.log('✅ DEBUG: Loaded successfully from:', lifePathUrl);
            
            // บันทึกลง cache
            localStorage.setItem('lifePathPropertiesCache', JSON.stringify(data));
            
            // ปรับโครงสร้างข้อมูล
            window.lifePathProperties = normalizeLifePathData(data);
            return window.lifePathProperties;
            
        } catch (error) {
            console.log(`❌ DEBUG: Error loading "${lifePathUrl}":`, error.message);
        }
    }
    
    console.error('❌ DEBUG: Failed to load LifePathProperty.json from all paths');
    return createFallbackLifePathData();
}

// ปรับโครงสร้างข้อมูล
function normalizeLifePathData(data) {
    if (!data) return null;
    
    // กรณี 1: data มีโครงสร้าง { LifePath: [...] } อยู่แล้ว
    if (data.LifePath && Array.isArray(data.LifePath)) {
        return data;
    }
    
    // กรณี 2: data เป็น array โดยตรง
    if (Array.isArray(data)) {
        return { LifePath: data };
    }
    
    // กรณี 3: data เป็น object ที่มี key เป็นตัวเลข
    if (typeof data === 'object') {
        const keys = Object.keys(data);
        const numericKeys = keys.filter(key => !isNaN(parseInt(key)));
        
        if (numericKeys.length > 0) {
            const lifePathArray = numericKeys.map(key => {
                const item = data[key];
                if (!item.ID) item.ID = key;
                return item;
            });
            return { LifePath: lifePathArray };
        }
    }
    
    return data;
}

// สร้างข้อมูล fallback
function createFallbackLifePathData() {
    console.log('⚠️ DEBUG: Creating fallback LifePath data');
    
    const fallbackData = {
        LifePath: [
            { ID: "1", ShortDefinition: "ผู้นำ", MEANING: "ความเป็นผู้นำ", InherentDread: "..." },
            { ID: "2", ShortDefinition: "ผู้ประสาน", MEANING: "การทำงานร่วมกัน", InherentDread: "..." },
            { ID: "3", ShortDefinition: "ผู้สร้างสรรค์", MEANING: "ความคิดสร้างสรรค์", InherentDread: "..." },
            { ID: "4", ShortDefinition: "ผู้สร้าง", MEANING: "ความมั่นคง", InherentDread: "..." },
            { ID: "5", ShortDefinition: "ผู้เปลี่ยนแปลง", MEANING: "การเปลี่ยนแปลง", InherentDread: "..." },
            { ID: "6", ShortDefinition: "ผู้ดูแล", MEANING: "ความรับผิดชอบ", InherentDread: "..." },
            { ID: "7", ShortDefinition: "ผู้แสวงหา", MEANING: "ปัญญา", InherentDread: "..." },
            { ID: "8", ShortDefinition: "ผู้บริหาร", MEANING: "ความสำเร็จ", InherentDread: "..." },
            { ID: "9", ShortDefinition: "ผู้ให้", MEANING: "มนุษยธรรม", InherentDread: "..." }
        ]
    };
    
    localStorage.setItem('lifePathPropertiesCache', JSON.stringify(fallbackData));
    window.lifePathProperties = fallbackData;
    return fallbackData;
}

// Get life path details from JSON
function getLifePathDetails(lifePathNumber) {
    console.log("🔍 DEBUG: getLifePathDetails() called for number:", lifePathNumber);
    
    if (!window.lifePathProperties) {
        console.log("❌ DEBUG: lifePathProperties not loaded");
        return null;
    }
    
    const targetId = lifePathNumber.toString();
    
    let lifePathArray = [];
    if (window.lifePathProperties.LifePath && Array.isArray(window.lifePathProperties.LifePath)) {
        lifePathArray = window.lifePathProperties.LifePath;
    } else if (Array.isArray(window.lifePathProperties)) {
        lifePathArray = window.lifePathProperties;
    } else {
        return null;
    }
    
    const foundItem = lifePathArray.find(item => {
        return item && item.ID && item.ID.toString() === targetId;
    });
    
    return foundItem || null;
}

// Create HTML for life path details
function createLifePathDetailsHTML(lifePathNumber, lifePathData) {
    if (!lifePathData) {
        return '<div class="life-path-details"><p class="tw-text-gray-500 tw-text-center">No Life Path details available</p></div>';
    }
    
    return `
        <div class="life-path-details">
            <h3>Life Path Number ${lifePathNumber} Details</h3>
            <div class="life-path-detail-item">
                <h4>Short Definition</h4>
                <p>${lifePathData.ShortDefinition || 'No definition available'}</p>
            </div>
            <div class="life-path-detail-item">
                <h4>Meaning</h4>
                <p>${lifePathData.MEANING || 'No meaning available'}</p>
            </div>
            <div class="life-path-detail-item inherent-dread">
                <h4>Inherent Dread</h4>
                <p>${lifePathData.InherentDread || 'No inherent dread specified'}</p>
            </div>
        </div>
    `;
}

// ===== MAIN RESULT LOADING =====

// Load results from sessionStorage
async function loadAndDisplayResults() {
    console.log('🔄 DEBUG: loadAndDisplayResults() called');
    
    const loadingSection = document.getElementById('loadingSection');
    const errorSection = document.getElementById('errorSection');
    const resultsContainer = document.getElementById('resultsContainer');
    const loadingDetails = document.getElementById('loadingDetails');
    
    if (loadingDetails) {
        loadingDetails.textContent = 'Checking sessionStorage for data...';
    }
    
    // Read from sessionStorage
    const resultData = sessionStorage.getItem('psychomatrixResult');
    
    if (!resultData) {
        console.log('❌ DEBUG: No data in sessionStorage');
        
        setTimeout(() => {
            if (loadingSection) loadingSection.classList.add('tw-hidden');
            if (errorSection) errorSection.classList.remove('tw-hidden');
        }, 1000);
        return;
    }
    
    try {
        console.log('📦 DEBUG: Parsing result data...');
        if (loadingDetails) {
            loadingDetails.textContent = 'Parsing JSON data...';
        }
        
        const data = JSON.parse(resultData);
        
        if (!data.success) {
            throw new Error(data.error || 'API returned error');
        }
        
        window.analysisData = data;
        
        if (loadingDetails) {
            loadingDetails.textContent = 'Loading Life Path properties...';
        }
        
        // Load LifePathProperty.json
        await loadLifePathProperties();
        
        if (loadingDetails) {
            loadingDetails.textContent = 'Rendering results...';
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
            loadingDetails.textContent = `Error: ${error.message}`;
        }
        
        setTimeout(() => {
            if (loadingSection) loadingSection.classList.add('tw-hidden');
            if (errorSection) errorSection.classList.remove('tw-hidden');
        }, 1000);
    }
}

// Display results from API
function displayResults(data) {
    console.log('🎨 DEBUG: displayResults() called');
    
    const resultsContainer = document.getElementById('resultsContainer');
    if (!resultsContainer) return;
    
    let html = '';
    
    if (data.results && Array.isArray(data.results)) {
        console.log(`🎨 DEBUG: Found ${data.results.length} results`);
        data.results.forEach((result, index) => {
            html += createResultSection(result, index);
        });
    } else if (data.data) {
        html += createSingleResultSection(data);
    } else {
        html += createFallbackDisplay(data);
    }
    
    resultsContainer.innerHTML = html;
    
    // ตั้งค่า pinnacleData หากมีข้อมูล
    if (data.results && data.results.length > 0 && data.results[0].data) {
        const resultData = data.results[0].data;
        if (resultData.birth_date) {
            window.pinnacleData = {
                lifePathNumber: resultData.life_path_number || resultData.destiny_number,
                birth_date: resultData.birth_date,
                UDate: resultData.birth_date.split('/')[0] || '',
                UMonth: resultData.birth_date.split('/')[1] || '',
                UYear: resultData.birth_date.split('/')[2] || ''
            };
        }
    }
}

// ===== RESULT SECTION CREATION =====

// Create result section for each result
function createResultSection(result, index) {
    const type = result.type || 'unknown';
    const title = result.title || `Result ${index + 1}`;
    const data = result.data || {};
    
    const destinyNum = data.destiny_number;
    const lifePathNum = data.life_path_number;
    const karmicNum = data.thirdAndFourth?.karmic;
    const lifeLessonNum = data.thirdAndFourth?.lifeLesson;
    
    // Get life path details
    const lifePathDetails = getLifePathDetails(lifePathNum);
    const lifePathDetailsHTML = createLifePathDetailsHTML(lifePathNum, lifePathDetails);
    
    // ตรวจสอบว่ามีฟังก์ชัน pythagorean หรือไม่
    const hasPythagorean = window.pythagorean && 
                         typeof window.pythagorean.showPythagoreanSquare === 'function';
    
    return `
        <div class="result-section">
            <div class="section-header">
                <i class="fas fa-chart-bar tw-mr-2"></i>${title}
            </div>
            <div class="section-content">
                <!-- Number Grid -->
                <div class="data-grid">
                    <div class="data-item">
                        <div class="label">Life Path Number</div>
                        ${createNumberButton(lifePathNum, 'LifePath', lifePathNum)}
                        <div class="description">Life path and purpose</div>
                    </div>
                    <div class="data-item">
                        <div class="label">Destiny Number</div>
                        ${createNumberButton(destinyNum, 'Destiny', destinyNum)}
                        <div class="description">${data.destiny_meaning || 'Personality and destiny'}</div>
                    </div>
                    <div class="data-item">
                        <div class="label">Karmic Number</div>
                        ${createNumberButton(karmicNum, 'Karmic', karmicNum)}
                        <div class="description">Karmic debt</div>
                    </div>
                    <div class="data-item">
                        <div class="label">Life Lesson</div>
                        ${createNumberButton(lifeLessonNum, 'LifeLesson', lifeLessonNum)}
                        <div class="description">Life lessons</div>
                    </div>
                </div>
                
                <!-- Display Life Path Details from JSON -->
                ${lifePathDetailsHTML}
                
                <!-- Buttons for additional content -->
                <div class="tw-mx-auto tw-mt-8 tw-mb-4 tw-px-4 tw-text-center">
                    ${hasPythagorean ? `
                        <button onclick="window.pythagorean.showPythagoreanSquare(${index})" 
                                class="tw-bg-blue-500 tw-text-white tw-py-4 tw-px-8 tw-rounded-full hover:tw-bg-green-600 tw-cursor-pointer tw-w-48 tw-inline-block tw-text-lg">
                            Pythagorean Square
                        </button>
                        <button onclick="window.pythagorean.showCombinedPythagoreanSquare(${index})" 
                                class="tw-bg-purple-500 tw-text-white tw-py-4 tw-px-8 tw-rounded-full hover:tw-bg-purple-600 tw-cursor-pointer tw-w-64 tw-inline-block tw-ml-4 tw-text-lg">
                            Pythagorean Square (รวมเลขสิ่งแวดล้อม)
                        </button>
                    ` : `
                        <button onclick="showPythagoreanSquare(${index})" 
                                class="tw-bg-blue-500 tw-text-white tw-py-4 tw-px-8 tw-rounded-full hover:tw-bg-green-600 tw-cursor-pointer tw-w-48 tw-inline-block tw-text-lg">
                            Pythagorean Square
                        </button>
                    `}
                    <button onclick="loadPinnacle()" 
                            class="tw-bg-blue-500 tw-text-white tw-py-4 tw-px-8 tw-rounded-full hover:tw-bg-green-600 tw-cursor-pointer tw-w-48 tw-inline-block tw-ml-4 tw-text-lg">
                        Pinnacle Cycle
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Fallback function ถ้า pythagorean.js ไม่โหลด
function showPythagoreanSquare(resultIndex) {
    console.log(`📊 DEBUG: showPythagoreanSquare fallback called for index ${resultIndex}`);
    
    const explainedContent = document.getElementById('explainedContent');
    const explainedButton = document.querySelector('.tablink:nth-child(2)');
    
    if (explainedContent && explainedButton) {
        explainedContent.innerHTML = `
            <div class="tw-text-center tw-py-8 tw-text-red-500">
                <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                <p class="tw-font-bold">Pythagorean Square function not available</p>
                <p class="tw-text-sm">The pythagorean.js file failed to load. Please refresh the page.</p>
            </div>
        `;
        switchTab('Explained', explainedButton);
    }
}

// Create number button
function createNumberButton(number, category, actualNumber) {
    if (!number && number !== 0) return `<div class="text-gray">-</div>`;
    
    let filename;
    switch(category) {
        case 'Destiny': filename = `Destiny${number}.html`; break;
        case 'LifePath': filename = `LifePathNumber${number}.html`; break;
        case 'Karmic': filename = ``; break;
        case 'LifeLesson': filename = `KarmicLesson${number}.html`; break;
        default: filename = `${category}${number}.html`;
    }
    
    let url = ``;
    if (filename && window.BASE_PATH) {
        url = `${window.BASE_PATH}/${filename}`;
    }
    
    if (!filename) {
        return `<div class="number-display">${number}</div>`;
    }
    
    return `
        <button class="number-button" 
                onclick="loadExplainedContent('${url}', '${category}', ${number})">
            ${number}
        </button>
    `;
}

// Create single result section
function createSingleResultSection(data) {
    return `
        <div class="result-section">
            <div class="section-header">
                <i class="fas fa-chart-bar tw-mr-2"></i>Analysis Result
            </div>
            <div class="section-content">
                <div class="tw-text-center tw-py-8">
                    <p class="tw-text-gray-600">Single result mode - Data structure needs adjustment</p>
                    <pre class="tw-mt-4 tw-p-4 tw-bg-gray-100 tw-rounded tw-text-sm">${JSON.stringify(data.data, null, 2)}</pre>
                </div>
            </div>
        </div>
    `;
}

// Create fallback display
function createFallbackDisplay(data) {
    return `
        <div class="result-section">
            <div class="section-header">
                <i class="fas fa-exclamation-triangle tw-mr-2"></i>Raw Analysis Result
            </div>
            <div class="section-content">
                <p class="tw-ml-4 tw-mt-2 tw-text-gray-600">The data structure is not in the expected format.</p>
                <div class="tw-ml-4 tw-mt-4 tw-p-4 tw-bg-gray-100 tw-rounded tw-font-mono tw-text-sm">
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
            </div>
        </div>
    `;
}

// ===== CONTENT LOADING FUNCTIONS =====

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
        </div>
    `;
    
    switchTab('Explained', explainedButton);
    
    fetch(url, { 
        method: 'GET',
        cache: 'no-cache',
        headers: { 'Accept': 'text/html' }
    })
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(html => {
            const fixedHtml = fixRelativePaths(html);
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
    
    if (!window.pinnacleData || !window.pinnacleData.lifePathNumber) {
        explainedContent.innerHTML = `
            <div class="tw-text-center tw-py-8 tw-text-red-500">
                <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                <p class="tw-font-bold">No birth date data available</p>
                <p class="tw-text-sm">Please analyze birth date data first</p>
            </div>
        `;
        switchTab('Explained', explainedButton);
        return;
    }
    
    const url = window.BASE_PATH ? `${window.BASE_PATH}/pinnacle.html` : 'pinnacle.html';
    
    explainedContent.innerHTML = `
        <div class="tw-text-center tw-py-8">
            <div class="spinner"></div>
            <p class="tw-mt-4 tw-text-gray-600">Loading Pinnacle Cycle...</p>
        </div>
    `;
    
    switchTab('Explained', explainedButton);
    
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
            console.error(`❌ DEBUG: Error loading ${url}:`, error);
            explainedContent.innerHTML = `
                <div class="tw-text-center tw-py-8 tw-text-red-500">
                    <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                    <p class="tw-font-bold">Cannot load Pinnacle Cycle</p>
                    <p class="tw-text-sm">${error.message}</p>
                </div>
            `;
        });
}

// Fix relative paths for GitHub Pages
function fixRelativePaths(html) {
    if (!window.BASE_PATH) return html;
    
    let fixedHtml = html;
    
    // Fix img src paths
    fixedHtml = fixedHtml.replace(/src="([^"]*)"/g, function(match, path) {
        if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) {
            return match;
        }
        
        let newPath;
        if (path.startsWith('/')) {
            newPath = `${window.BASE_PATH}${path}`;
        } else if (path.startsWith('./')) {
            newPath = `${window.BASE_PATH}/${path.substring(2)}`;
        } else {
            newPath = `${window.BASE_PATH}/${path}`;
        }
        
        return `src="${newPath}"`;
    });
    
    // Fix link href paths for CSS
    fixedHtml = fixedHtml.replace(/href="([^"]*\.css)"/g, function(match, path) {
        if (path.startsWith('http') || path.startsWith('//')) {
            return match;
        }
        
        let newPath;
        if (path.startsWith('/')) {
            newPath = `${window.BASE_PATH}${path}`;
        } else if (path.startsWith('./')) {
            newPath = `${window.BASE_PATH}/${path.substring(2)}`;
        } else {
            newPath = `${window.BASE_PATH}/${path}`;
        }
        
        return `href="${newPath}"`;
    });
    
    return fixedHtml;
}

// ===== EXPOSE FUNCTIONS TO GLOBAL SCOPE =====
// ทำให้ฟังก์ชันเหล่านี้สามารถเรียกใช้จาก HTML ได้
window.switchTab = switchTab;
window.toggleDebugInfo = toggleDebugInfo;
window.loadExplainedContent = loadExplainedContent;
window.loadPinnacle = loadPinnacle;
window.showPythagoreanSquare = showPythagoreanSquare;
window.loadAndDisplayResults = loadAndDisplayResults;
window.initializePage = initializePage;

console.log('✅ DEBUG: result.js loaded completely');

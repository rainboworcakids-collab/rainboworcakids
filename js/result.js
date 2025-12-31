// result.js - Main result handling functions

// Version Info
const VERSION = 'v8.4-Complete-Integration';

// Configuration for GitHub Pages
const currentPath = window.location.pathname;
const folderPath = currentPath.substring(0, currentPath.lastIndexOf('/'));
const CONTENTS_DIR = 'PsychomatrixContents';
const BASE_PATH = `${folderPath}/${CONTENTS_DIR}`;

console.log('🚀 DEBUG: result.js loaded -', VERSION);
console.log('📍 DEBUG: currentPath:', currentPath);
console.log('📍 DEBUG: folderPath:', folderPath);
console.log('📍 DEBUG: BASE_PATH:', BASE_PATH);
console.log('📍 DEBUG: CONTENTS_DIR:', CONTENTS_DIR);

// Store analysis data
let analysisData = null;
let pinnacleData = null;

// Store LifePathProperty.json data
let lifePathProperties = null;

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
    debugInfo.classList.toggle('tw-hidden');
}

// Initialize page
function initializePage() {
    console.log('🌐 DEBUG: DOM Content Loaded');
    console.log('🌐 DEBUG: Psychomatrix Results Loaded');
    console.log('🌐 DEBUG: Timestamp:', new Date().toISOString());
    
    // Log all sessionStorage keys
    console.log('🔍 DEBUG: sessionStorage keys:', Object.keys(sessionStorage));
    
    // Log specific keys we're looking for
    const psychomatrixResult = sessionStorage.getItem('psychomatrixResult');
    console.log('🔍 DEBUG: psychomatrixResult exists:', !!psychomatrixResult);
    
    if (psychomatrixResult) {
        console.log('🔍 DEBUG: psychomatrixResult length:', psychomatrixResult.length);
        console.log('🔍 DEBUG: psychomatrixResult preview (first 500 chars):', psychomatrixResult.substring(0, 500));
    }
    
    // Check for other possible storage locations
    const localStorageData = localStorage.getItem('psychomatrixFormData');
    console.log('🔍 DEBUG: localStorage psychomatrixFormData exists:', !!localStorageData);
    
    const lastData = localStorage.getItem('lastPsychomatrixData');
    console.log('🔍 DEBUG: localStorage lastPsychomatrixData exists:', !!lastData);
    
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    console.log('🔍 DEBUG: URL Parameters:', urlParams.toString());
    
    // Update loading details
    const loadingDetails = document.getElementById('loadingDetails');
    if (loadingDetails) {
        loadingDetails.textContent = `Checking data sources...`;
    }
    
    // Open default tab
    setTimeout(() => {
        document.getElementById("defaultOpen").click();
        
        // Load and display results
        setTimeout(() => {
            loadAndDisplayResults();
        }, 100);
    }, 50);
}

// Load LifePathProperty.json
async function loadLifePathProperties() {
    console.log('🔄 DEBUG: loadLifePathProperties() called');
    
    // ลองหลายๆ path ที่เป็นไปได้
    const possiblePaths = [
        `${folderPath}/data/LifePathProperty.json`,
        `./data/LifePathProperty.json`,
        `../data/LifePathProperty.json`,
        `${window.location.origin}${folderPath}/data/LifePathProperty.json`
    ];
    
    for (const lifePathUrl of possiblePaths) {
        console.log(`📂 DEBUG: Trying to load LifePathProperty.json from:`, lifePathUrl);
        
        try {
            const response = await fetch(lifePathUrl);
            console.log(`📂 DEBUG: Fetch response for ${lifePathUrl}:`, response.status, response.statusText);
            
            if (!response.ok) {
                console.log(`❌ DEBUG: Failed to load from ${lifePathUrl}, trying next...`);
                continue;
            }
            
            const data = await response.json();
            console.log('✅ DEBUG: Loaded LifePathProperty.json successfully from:', lifePathUrl);
            console.log('✅ DEBUG: Raw data type:', typeof data);
            console.log('✅ DEBUG: Data structure:', data);
            
            // Handle different data structures
            if (Array.isArray(data)) {
                console.log('✅ DEBUG: Data is an array, length:', data.length);
                lifePathProperties = data;
            } else if (typeof data === 'object' && data !== null) {
                console.log('✅ DEBUG: Data is an object, keys:', Object.keys(data));
                
                // Try to convert object to array
                // Method 1: Check if it has numeric keys (like {"1": {...}, "2": {...}})
                const numericKeys = Object.keys(data).filter(key => !isNaN(key));
                if (numericKeys.length > 0) {
                    console.log('✅ DEBUG: Object has numeric keys, converting to array');
                    lifePathProperties = Object.values(data).map((item, index) => {
                        // Ensure each item has LifePathNumber
                        if (!item.LifePathNumber && numericKeys[index]) {
                            item.LifePathNumber = parseInt(numericKeys[index]);
                        }
                        return item;
                    });
                } 
                // Method 2: Try to access by LifePathNumber property
                else if (Object.values(data).some(item => item.LifePathNumber)) {
                    console.log('✅ DEBUG: Object values have LifePathNumber property');
                    lifePathProperties = Object.values(data);
                } else {
                    console.log('⚠️ DEBUG: Object structure not recognized, using as-is');
                    lifePathProperties = data; // Keep as object
                }
            } else {
                console.error('❌ DEBUG: Unknown data format:', typeof data);
                lifePathProperties = null;
            }
            
            console.log('✅ DEBUG: Final lifePathProperties:', lifePathProperties);
            return lifePathProperties;
            
        } catch (error) {
            console.log(`❌ DEBUG: Error loading from ${lifePathUrl}:`, error.message);
            continue;
        }
    }
    
    console.error('❌ DEBUG: Failed to load LifePathProperty.json from all paths');
    lifePathProperties = null;
    return null;
}

// Get life path details from JSON
function getLifePathDetails(lifePathNumber) {
    console.log("🔍 DEBUG: getLifePathDetails() called for number:", lifePathNumber);
    
    // ตรวจสอบว่า lifePathProperties มีข้อมูลและมีโครงสร้างถูกต้อง
    if (!lifePathProperties || !lifePathProperties.LifePath || !Array.isArray(lifePathProperties.LifePath)) {
        console.log("❌ DEBUG: lifePathProperties not loaded properly or wrong structure");
        return null;
    }
    
    // แปลงตัวเลขเป็น string เพื่อค้นหา (เพราะใน JSON เก็บ ID เป็น string)
    const targetId = lifePathNumber.toString();
    
    console.log("🔍 DEBUG: Searching for ID:", targetId);
    console.log("🔍 DEBUG: LifePath array length:", lifePathProperties.LifePath.length);
    
    // ค้นหาใน array LifePath
    const foundItem = lifePathProperties.LifePath.find(item => {
        if (item && item.ID) {
            const match = item.ID === targetId;
            if (match) {
                console.log("✅ DEBUG: Found matching item:", item);
            }
            return match;
        }
        return false;
    });
    
    if (foundItem) {
        console.log("✅ DEBUG: Successfully found life path details for number:", lifePathNumber);
        return foundItem;
    } else {
        console.log("❌ DEBUG: No life path found for number:", lifePathNumber);
        console.log("❌ DEBUG: Available IDs:", lifePathProperties.LifePath.map(item => item.ID));
        return null;
    }
}

// Create HTML for life path details
function createLifePathDetailsHTML(lifePathNumber, lifePathData) {
    console.log('🖼️ DEBUG: createLifePathDetailsHTML() called');
    console.log('🖼️ DEBUG: lifePathNumber:', lifePathNumber);
    console.log('🖼️ DEBUG: lifePathData:', lifePathData);
    
    if (!lifePathData) {
        console.log('⚠️ DEBUG: No lifePathData for number:', lifePathNumber);
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

// Load results from sessionStorage
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
    
    console.log('🔍 DEBUG: Checking sessionStorage for psychomatrixResult:', resultData ? '✅ Data found' : '❌ No data');
    
    if (!resultData) {
        console.log('❌ DEBUG: No data in sessionStorage. Checking other sources...');
        
        // Check localStorage as fallback
        const localStorageData = localStorage.getItem('psychomatrixFormData');
        const lastData = localStorage.getItem('lastPsychomatrixData');
        
        if (loadingDetails) {
            loadingDetails.textContent = `No sessionStorage data. Checking localStorage...`;
        }
        
        // Update debug info
        const debugSessionStorage = document.getElementById('debugSessionStorage');
        const debugLocalStorage = document.getElementById('debugLocalStorage');
        const debugURLParams = document.getElementById('debugURLParams');
        
        if (debugSessionStorage) {
            debugSessionStorage.textContent = `sessionStorage.psychomatrixResult: ${resultData ? 'Exists (' + resultData.length + ' chars)' : 'NOT FOUND'}`;
        }
        
        if (debugLocalStorage) {
            debugLocalStorage.textContent = `localStorage.psychomatrixFormData: ${localStorageData ? 'Exists' : 'NOT FOUND'} | localStorage.lastPsychomatrixData: ${lastData ? 'Exists' : 'NOT FOUND'}`;
        }
        
        if (debugURLParams) {
            const urlParams = new URLSearchParams(window.location.search);
            debugURLParams.textContent = `URL Parameters: ${urlParams.toString() || 'None'}`;
        }
        
        setTimeout(() => {
            loadingSection.classList.add('tw-hidden');
            errorSection.classList.remove('tw-hidden');
        }, 1000);
        return;
    }
    
    try {
        console.log('📦 DEBUG: Parsing result data...');
        if (loadingDetails) {
            loadingDetails.textContent = `Parsing JSON data (${resultData.length} characters)...`;
        }
        
        const data = JSON.parse(resultData);
        console.log('📦 DEBUG: Parsed data structure:', data);
        
        if (loadingDetails) {
            loadingDetails.textContent = `Loading Life Path properties...`;
        }
        
        // Load LifePathProperty.json
        console.log('📦 DEBUG: Calling loadLifePathProperties()...');
        await loadLifePathProperties();
        console.log('📦 DEBUG: loadLifePathProperties() completed');
        console.log('📦 DEBUG: lifePathProperties after load:', lifePathProperties);
        
        if (loadingDetails) {
            loadingDetails.textContent = `Checking data validity...`;
        }
        
        if (!data.success) {
            const errorMsg = data.error || 'API returned error';
            console.error('❌ DEBUG: API error:', errorMsg);
            throw new Error(errorMsg);
        }
        
        console.log('✅ DEBUG: Data valid. Displaying results...');
        if (loadingDetails) {
            loadingDetails.textContent = `Rendering results...`;
        }
        
        displayResults(data);
        
        setTimeout(() => {
            loadingSection.classList.add('tw-hidden');
            resultsContainer.classList.remove('tw-hidden');
            console.log('✅ DEBUG: Results displayed successfully');
        }, 500);
        
    } catch (error) {
        console.error('❌ DEBUG: Error in loadAndDisplayResults:', error);
        console.error('❌ DEBUG: Error stack:', error.stack);
        
        if (loadingDetails) {
            loadingDetails.textContent = `Error: ${error.message}`;
        }
        
        // Update error message
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
            loadingSection.classList.add('tw-hidden');
            errorSection.classList.remove('tw-hidden');
        }, 1000);
    }
}

// Display results from API
function displayResults(data) {
    console.log('🎨 DEBUG: Starting displayResults()');
    console.log('🎨 DEBUG: Data received:', data);
    
    const resultsContainer = document.getElementById('resultsContainer');
    let html = '';
    
    console.log('🎨 DEBUG: Checking results structure...');
    console.log('🎨 DEBUG: data.results:', data.results);
    console.log('🎨 DEBUG: data.data:', data.data);
    
    // เก็บข้อมูล analysis ไว้ใช้สำหรับ Pythagorean Square
    analysisData = data;
    
    // ตั้งค่าใน global scope สำหรับไฟล์อื่นๆ ที่อาจเรียกใช้
    window.analysisData = data;
    console.log('✅ DEBUG: Set window.analysisData:', window.analysisData !== null);
    
    if (data.results && Array.isArray(data.results)) {
        console.log(`🎨 DEBUG: Found ${data.results.length} results in array`);
        data.results.forEach((result, index) => {
            console.log(`🎨 DEBUG: Result ${index}:`, result);
            html += createResultSection(result, index);
        });
    } else if (data.data) {
        console.log('🎨 DEBUG: Using single result mode with data.data');
        html += createSingleResultSection(data);
    } else {
        console.log('🎨 DEBUG: No standard structure found, creating fallback display');
        html += createFallbackDisplay(data);
    }
    
    resultsContainer.innerHTML = html;
    console.log('✅ DEBUG: HTML content set, length:', html.length);
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

// Create result section for each result
function createResultSection(result, index) {
    const type = result.type || 'unknown';
    const title = result.title || `Result ${index + 1}`;
    const data = result.data || {};
    
    const destinyNum = data.destiny_number;
    const lifePathNum = data.life_path_number;
    const karmicNum = data.thirdAndFourth?.karmic;
    const lifeLessonNum = data.thirdAndFourth?.lifeLesson;
    
    console.log('🎨 DEBUG: Creating result section:', { 
        type, title, destinyNum, lifePathNum, karmicNum, lifeLessonNum 
    });
    
    // Extract pinnacle data if available
    if (data.birth_date && destinyNum) {
        pinnacleData = {
            lifePathNumber: lifePathNum || destinyNum,
            birth_date: data.birth_date,
            UDate: data.birth_date ? data.birth_date.split('/')[0] : '',
            UMonth: data.birth_date ? data.birth_date.split('/')[1] : '',
            UYear: data.birth_date ? data.birth_date.split('/')[2] : ''
        };
        console.log('📊 DEBUG: Pinnacle data extracted:', pinnacleData);
    }
    
    // Get life path details from JSON
    console.log('🎨 DEBUG: Getting life path details for number:', lifePathNum);
    const lifePathDetails = getLifePathDetails(lifePathNum);
    console.log('🎨 DEBUG: Life path details found:', lifePathDetails);
    const lifePathDetailsHTML = createLifePathDetailsHTML(lifePathNum, lifePathDetails);
    
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
                    <button onclick="pythagorean.showPythagoreanSquare(${index})" 
                            class="tw-bg-blue-500 tw-text-white tw-py-4 tw-px-8 tw-rounded-full hover:tw-bg-green-600 tw-cursor-pointer tw-w-48 tw-inline-block tw-text-lg">
                        Pythagorean Square
                    </button>
                    <button onclick="loadPinnacle()" 
                            class="tw-bg-blue-500 tw-text-white tw-py-4 tw-px-8 tw-rounded-full hover:tw-bg-green-600 tw-cursor-pointer tw-w-48 tw-inline-block tw-ml-4 tw-text-lg">
                        Pinnacle Cycle
                    </button>
                    <button onclick="pythagorean.showCombinedPythagoreanSquare(${index})" 
                            class="tw-bg-purple-500 tw-text-white tw-py-4 tw-px-8 tw-rounded-full hover:tw-bg-purple-600 tw-cursor-pointer tw-w-64 tw-inline-block tw-mt-4 tw-text-lg">
                        Pythagorean Square (รวมเลขสิ่งแวดล้อม)
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create number button
function createNumberButton(number, category, actualNumber) {
    if (!number && number !== 0) return `<div class="text-gray">-</div>`;
    
    // Filename mapping
    let filename;
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
    
    let url = `${BASE_PATH}/${filename}`;
    if ( filename === ``) {
        url = ``;
    }
    
    return `
        <button class="number-button" 
                onclick="loadExplainedContent('${url}', '${category}', ${number})">
            ${number}
        </button>
    `;
}

// Create fallback display
function createFallbackDisplay(data) {
    console.log('🎨 DEBUG: Creating fallback display for data:', data);
    
    return `
        <div class="result-section">
            <div class="section-header">
                <i class="fas fa-exclamation-triangle tw-mr-2"></i>Raw Analysis Result
            </div>
            <div class="section-content">
                <p class="tw-ml-4 tw-mt-2 tw-text-gray-600">The data structure is not in the expected format. Here's what was received:</p>
                <div class="tw-ml-4 tw-mt-4 tw-p-4 tw-bg-gray-100 tw-rounded tw-font-mono tw-text-sm">
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                </div>
                
                <!-- Buttons for additional content -->
                <div class="tw-mx-auto tw-mt-8 tw-mb-4 tw-px-4 tw-text-center">
                    <button onclick="pythagorean.showPythagoreanSquare(0)" 
                            class="tw-bg-blue-500 tw-text-white tw-py-4 tw-px-8 tw-rounded-full hover:tw-bg-green-600 tw-cursor-pointer tw-w-48 tw-inline-block">
                        Pythagorean Square
                    </button>
                    <button onclick="loadPinnacle()" 
                            class="tw-bg-blue-500 tw-text-white tw-py-4 tw-px-8 tw-rounded-full hover:tw-bg-green-600 tw-cursor-pointer tw-w-48 tw-inline-block tw-ml-4">
                        Pinnacle Cycle
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Load explained content (สำหรับปุ่มตัวเลข)
function loadExplainedContent(url, category, number) {
    console.log(`🔄 DEBUG: Loading ${category} ${number} from: ${url}`);
    
    if ( url === ``) {
        return ``;
    }

    const explainedContent = document.getElementById('explainedContent');
    const explainedButton = document.querySelector('.tablink:nth-child(2)');
    
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
            console.log(`✅ DEBUG: Success loading ${url} (${html.length} bytes)`);
            
            // Fix relative paths
            const fixedHtml = fixRelativePaths(html);
            
            explainedContent.innerHTML = `
                <div class="external-content-body">
                    ${fixedHtml}
                </div>
            `;
            
            // เรียกฟังก์ชันปรับปรุง layout หลังจากโหลดเนื้อหาเสร็จ
            setTimeout(() => {
                adjustExplainedLayout();
            }, 100);
            
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
    
    if (!pinnacleData || !pinnacleData.lifePathNumber) {
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
            <p class="tw-text-sm tw-text-gray-500">URL: ${url}</p>
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

// ปรับปรุง layout ของเนื้อหาใน Explained Tab
function adjustExplainedLayout() {
    const explainedContent = document.getElementById('explainedContent');
    if (!explainedContent) return;
    
    // หา header ในเนื้อหาที่โหลดมา
    const pageHeader = explainedContent.querySelector('.page-header');
    if (pageHeader) {
        // ตรวจสอบว่ามี modern-number-overlay หรือไม่
        const modernNumberOverlay = pageHeader.querySelector('.modern-number-overlay');
        if (modernNumberOverlay) {
            // ถ้ามีให้ปรับแต่งเพิ่มเติม
            const numbers = modernNumberOverlay.querySelectorAll('.modern-number');
            if (numbers.length >= 2) {
                numbers[0].style.left = '0';
                numbers[0].style.top = '0';
                numbers[0].style.width = '120px';
                numbers[0].style.height = '120px';
                
                numbers[1].style.left = '20px';
                numbers[1].style.top = '20px';
                numbers[1].style.width = '120px';
                numbers[1].style.height = '120px';
                numbers[1].style.opacity = '0.6';
            }
        }
    }
    
    // ปรับปรุงหัวข้อ h1 ให้มีระยะห่างที่เหมาะสม
    const h1 = explainedContent.querySelector('h1');
    if (h1) {
        h1.style.marginLeft = '20px';
        h1.style.paddingTop = '10px';
        h1.style.maxWidth = 'calc(100% - 160px)';
    }
}

// Fix relative paths for GitHub Pages
function fixRelativePaths(html) {
    console.log('🔧 DEBUG: Fixing relative paths in HTML');
    
    let fixedHtml = html;
    
    // Fix img src paths
    fixedHtml = fixedHtml.replace(/src="([^"]*)"/g, function(match, path) {
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
        
        console.log(`🔧 DEBUG: Fixed img path: ${path} -> ${newPath}`);
        return `src="${newPath}"`;
    });
    
    // Fix link href paths for CSS
    fixedHtml = fixedHtml.replace(/href="([^"]*\.css)"/g, function(match, path) {
        if (path.startsWith('http') || path.startsWith('//')) {
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
        
        console.log(`🔧 DEBUG: Fixed CSS path: ${path} -> ${newPath}`);
        return `href="${newPath}"`;
    });
    
    return fixedHtml;
}

// ตรวจสอบว่า pythagorean ถูกโหลดแล้วหรือไม่
function checkPythagoreanLoaded() {
    if (!window.pythagorean || !window.pythagorean.showPythagoreanSquare) {
        console.error('❌ DEBUG: pythagorean.js not loaded properly');
        return false;
    }
    console.log('✅ DEBUG: pythagorean.js loaded successfully');
    return true;
}

// Expose functions to global scope
window.switchTab = switchTab;
window.toggleDebugInfo = toggleDebugInfo;
window.loadExplainedContent = loadExplainedContent;
window.loadPinnacle = loadPinnacle;
window.analysisData = analysisData;
window.pinnacleData = pinnacleData;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializePage);

console.log('✅ DEBUG: result.js loaded completely');

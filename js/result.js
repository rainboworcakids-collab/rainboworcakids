// result.js - Main result handling functions
// Version: v7.51-MultiEnvironment-Support

// Version Info
const VERSION = 'v7.51-MultiEnvironment-Support';

// Detect environment
const isGitHubPages = window.location.hostname.includes('github.io');
const isLocal = window.location.hostname.includes('localhost') || 
                window.location.hostname.includes('127.0.0.1');

// Get repository name from GitHub Pages URL
function getGitHubRepoName() {
    if (!isGitHubPages) return '';
    const pathSegments = window.location.pathname.split('/').filter(seg => seg);
    return pathSegments.length > 0 ? pathSegments[0] : '';
}

const repoName = getGitHubRepoName();
console.log('🌐 DEBUG: Environment Detection');
console.log('📍 DEBUG: isGitHubPages:', isGitHubPages);
console.log('📍 DEBUG: isLocal:', isLocal);
console.log('📍 DEBUG: repoName:', repoName);
console.log('📍 DEBUG: Full URL:', window.location.href);

// Configuration for different environments
const currentPath = window.location.pathname;
const folderPath = currentPath.substring(0, currentPath.lastIndexOf('/'));

let BASE_PATH, CONTENTS_DIR, DATA_BASE_PATH;

if (isGitHubPages && repoName) {
    // GitHub Pages with repository name (your case: rainboworcakids)
    CONTENTS_DIR = 'PsychomatrixContents';
    BASE_PATH = `/${repoName}/${CONTENTS_DIR}`;
    DATA_BASE_PATH = `/${repoName}/data`;
} else if (isLocal) {
    // Local Apache server
    CONTENTS_DIR = 'PsychomatrixContents';
    BASE_PATH = `${folderPath}/${CONTENTS_DIR}`;
    DATA_BASE_PATH = `${folderPath}/data`;
} else if (isGitHubPages && !repoName) {
    // GitHub Pages root domain
    CONTENTS_DIR = 'PsychomatrixContents';
    BASE_PATH = `/${CONTENTS_DIR}`;
    DATA_BASE_PATH = `/data`;
} else {
    // Fallback
    CONTENTS_DIR = 'PsychomatrixContents';
    BASE_PATH = `./${CONTENTS_DIR}`;
    DATA_BASE_PATH = `./data`;
}

console.log('🚀 DEBUG: result.js loaded -', VERSION);
console.log('📍 DEBUG: currentPath:', currentPath);
console.log('📍 DEBUG: folderPath:', folderPath);
console.log('📍 DEBUG: BASE_PATH:', BASE_PATH);
console.log('📍 DEBUG: DATA_BASE_PATH:', DATA_BASE_PATH);
console.log('📍 DEBUG: CONTENTS_DIR:', CONTENTS_DIR);

// Store analysis data
let analysisData = null;
let pinnacleData = null;

// Store LifePathProperty.json data
let lifePathProperties = null;

// Tab switching function
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

// Toggle debug info
function toggleDebugInfo() {
    const debugInfo = document.getElementById('debugInfo');
    debugInfo.classList.toggle('tw-hidden');
}

// Initialize page
function initializePage() {
    console.log('🌐 DEBUG: DOM Content Loaded');
    
    // Check sessionStorage
    const psychomatrixResult = sessionStorage.getItem('psychomatrixResult');
    console.log('🔍 DEBUG: psychomatrixResult exists:', !!psychomatrixResult);
    
    if (psychomatrixResult) {
        console.log('🔍 DEBUG: psychomatrixResult length:', psychomatrixResult.length);
    }
    
    // Update loading details
    const loadingDetails = document.getElementById('loadingDetails');
    if (loadingDetails) {
        loadingDetails.textContent = `Environment: ${isGitHubPages ? 'GitHub Pages' : isLocal ? 'Local Apache' : 'Unknown'}`;
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

// Load LifePathProperty.json with multi-environment support
async function loadLifePathProperties() {
    console.log('🔄 DEBUG: loadLifePathProperties() called');
    
    // Build possible paths based on environment
    const possiblePaths = [];
    
    // สำหรับ GitHub Pages ที่มี repo name (เช่น rainboworcakids)
    if (isGitHubPages && repoName) {
        possiblePaths.push(
            `/${repoName}/data/LifePathProperty.json`,
            `./data/LifePathProperty.json`,
            `../data/LifePathProperty.json`,
            `data/LifePathProperty.json`
        );
    } else if (isLocal) {
        // Local
        possiblePaths.push(
            './data/LifePathProperty.json',
            '../data/LifePathProperty.json',
            'data/LifePathProperty.json',
            '/rainboworcakids/data/LifePathProperty.json'
        );
    } else {
        // Fallback paths
        possiblePaths.push(
            './data/LifePathProperty.json',
            '../data/LifePathProperty.json',
            'data/LifePathProperty.json',
            '/data/LifePathProperty.json'
        );
    }
    
    console.log('📂 DEBUG: Possible paths for LifePathProperty.json:', possiblePaths);
    
    for (const lifePathUrl of possiblePaths) {
        console.log(`📂 DEBUG: Trying to load from: ${lifePathUrl}`);
        
        try {
            const response = await fetch(lifePathUrl);
            console.log(`📂 DEBUG: Fetch response: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                console.log(`❌ DEBUG: Failed to load from ${lifePathUrl}: ${response.status}`);
                continue;
            }
            
            const data = await response.json();
            console.log('✅ DEBUG: Loaded successfully from:', lifePathUrl);
            
            // Handle data structure
            if (Array.isArray(data)) {
                lifePathProperties = data;
            } else if (typeof data === 'object' && data !== null) {
                if (data.LifePath && Array.isArray(data.LifePath)) {
                    lifePathProperties = data.LifePath;
                } else {
                    // Convert object to array
                    lifePathProperties = Object.values(data);
                }
            }
            
            console.log('✅ DEBUG: LifePathProperties loaded:', lifePathProperties ? 'Yes' : 'No');
            return lifePathProperties;
            
        } catch (error) {
            console.log(`❌ DEBUG: Error loading from ${lifePathUrl}:`, error.message);
            continue;
        }
    }
    
    console.error('❌ DEBUG: Failed to load LifePathProperty.json from all paths');
    // สร้างข้อมูล fallback เพื่อไม่ให้ค้าง
    lifePathProperties = [
        { ID: "1", ShortDefinition: "ผู้นำ", MEANING: "ความเป็นผู้นำ", InherentDread: "การพึ่งพาผู้อื่น" },
        { ID: "2", ShortDefinition: "นักทูต", MEANING: "ความร่วมมือ", InherentDread: "การอยู่คนเดียว" },
        { ID: "3", ShortDefinition: "ผู้สร้าง", MEANING: "ความคิดสร้างสรรค์", InherentDread: "ความเบื่อหน่าย" },
        { ID: "4", ShortDefinition: "ผู้สร้างรากฐาน", MEANING: "ความมั่นคง", InherentDread: "ความไม่มั่นคง" },
        { ID: "5", ShortDefinition: "นักผจญภัย", MEANING: "อิสระ", InherentDread: "ความจำเจ" },
        { ID: "6", ShortDefinition: "ผู้ดูแล", MEANING: "ความรับผิดชอบ", InherentDread: "การถูกทอดทิ้ง" },
        { ID: "7", ShortDefinition: "นักปราชญ์", MEANING: "ปัญญา", InherentDread: "ความโง่เขลา" },
        { ID: "8", ShortDefinition: "ผู้นำธุรกิจ", MEANING: "อำนาจ", InherentDread: "ความอ่อนแอ" },
        { ID: "9", ShortDefinition: "นักมนุษยธรรม", MEANING: "การให้", InherentDread: "ความเห็นแก่ตัว" }
    ];
    
    return lifePathProperties;
}

// Get life path details from JSON
function getLifePathDetails(lifePathNumber) {
    console.log("🔍 DEBUG: getLifePathDetails() called for number:", lifePathNumber);
    
    if (!lifePathProperties) {
        console.log("❌ DEBUG: lifePathProperties not loaded");
        return null;
    }
    
    if (!lifePathNumber) {
        console.log("❌ DEBUG: lifePathNumber is null or undefined");
        return null;
    }
    
    const targetId = lifePathNumber.toString();
    console.log("🔍 DEBUG: Searching for ID:", targetId);
    
    // Search for matching item
    const foundItem = lifePathProperties.find(item => {
        if (item && item.ID) {
            return item.ID === targetId;
        }
        return false;
    });
    
    if (foundItem) {
        console.log("✅ DEBUG: Found life path details");
        return foundItem;
    } else {
        console.log("❌ DEBUG: No life path found for number:", lifePathNumber);
        return null;
    }
}

// Create HTML for life path details
function createLifePathDetailsHTML(lifePathNumber, lifePathData) {
    console.log('🖼️ DEBUG: createLifePathDetailsHTML() called');
    
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
    
    if (!resultData) {
        console.log('❌ DEBUG: No data in sessionStorage');
        
        setTimeout(() => {
            loadingSection.classList.add('tw-hidden');
            errorSection.classList.remove('tw-hidden');
            
            // Update debug info
            const debugSessionStorage = document.getElementById('debugSessionStorage');
            const debugLocalStorage = document.getElementById('debugLocalStorage');
            const debugURLParams = document.getElementById('debugURLParams');
            
            if (debugSessionStorage) {
                debugSessionStorage.textContent = `sessionStorage.psychomatrixResult: NOT FOUND`;
            }
            
            if (debugLocalStorage) {
                const localStorageData = localStorage.getItem('psychomatrixFormData');
                const lastData = localStorage.getItem('lastPsychomatrixData');
                debugLocalStorage.textContent = `localStorage.psychomatrixFormData: ${localStorageData ? 'Exists' : 'NOT FOUND'} | localStorage.lastPsychomatrixData: ${lastData ? 'Exists' : 'NOT FOUND'}`;
            }
            
            if (debugURLParams) {
                const urlParams = new URLSearchParams(window.location.search);
                debugURLParams.textContent = `URL Parameters: ${urlParams.toString() || 'None'}`;
            }
        }, 1000);
        return;
    }
    
    try {
        console.log('📦 DEBUG: Parsing result data...');
        const data = JSON.parse(resultData);
        
        // โหลด LifePathProperty.json (ไม่รอผลลัพธ์)
        loadLifePathProperties().then(() => {
            console.log('✅ DEBUG: LifePathProperties loaded, continuing...');
        }).catch(error => {
            console.error('❌ DEBUG: Error loading LifePathProperties:', error);
            // ยังคงดำเนินการต่อแม้ว่าจะโหลดไม่สำเร็จ
        });
        
        if (loadingDetails) {
            loadingDetails.textContent = `Rendering results...`;
        }
        
        // ตั้งค่าใน global scope
        analysisData = data;
        window.analysisData = data;
        
        // แสดงผลลัพธ์ทันที ไม่ต้องรอ LifePathProperty.json
        displayResults(data);
        
        setTimeout(() => {
            loadingSection.classList.add('tw-hidden');
            resultsContainer.classList.remove('tw-hidden');
            console.log('✅ DEBUG: Results displayed successfully');
        }, 500);
        
    } catch (error) {
        console.error('❌ DEBUG: Error in loadAndDisplayResults:', error);
        
        if (loadingDetails) {
            loadingDetails.textContent = `Error: ${error.message}`;
        }
        
        const errorMessage = document.getElementById('errorMessage');
        if (errorMessage) {
            errorMessage.textContent = `Error parsing data: ${error.message}`;
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
    
    const resultsContainer = document.getElementById('resultsContainer');
    let html = '';
    
    // เก็บข้อมูล analysis
    analysisData = data;
    window.analysisData = data;
    
    if (data.results && Array.isArray(data.results)) {
        console.log(`🎨 DEBUG: Found ${data.results.length} results`);
        data.results.forEach((result, index) => {
            html += createResultSection(result, index);
        });
    } else if (data.data) {
        console.log('🎨 DEBUG: Using single result mode');
        html += createSingleResultSection(data);
    } else {
        console.log('🎨 DEBUG: Creating fallback display');
        html += createFallbackDisplay(data);
    }
    
    resultsContainer.innerHTML = html;
    console.log('✅ DEBUG: HTML content set');
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
                    <p class="tw-text-gray-600">Single result mode</p>
                    <div class="data-grid">
                        <div class="data-item">
                            <div class="label">Data Available</div>
                            <div class="number-display">✓</div>
                            <div class="description">View details in Explained tab</div>
                        </div>
                    </div>
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
    
    console.log('🎨 DEBUG: Creating result section for:', title);
    
    // เก็บ pinnacle data
    if (data.birth_date && destinyNum) {
        pinnacleData = {
            lifePathNumber: lifePathNum || destinyNum,
            birth_date: data.birth_date,
            UDate: data.birth_date ? data.birth_date.split('/')[0] : '',
            UMonth: data.birth_date ? data.birth_date.split('/')[1] : '',
            UYear: data.birth_date ? data.birth_date.split('/')[2] : ''
        };
    }
    
    // ใช้ข้อมูล life path ที่มีอยู่หรือสร้าง fallback
    let lifePathDetailsHTML = '';
    if (lifePathNum) {
        const lifePathDetails = getLifePathDetails(lifePathNum);
        lifePathDetailsHTML = createLifePathDetailsHTML(lifePathNum, lifePathDetails);
    }
    
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
                
                <!-- Display Life Path Details -->
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

// Create number button with environment-aware URL
function createNumberButton(number, category, actualNumber) {
    if (!number && number !== 0) return `<div class="text-gray">-</div>`;
    
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
    
    if (!filename) return `<div class="number-display">${number}</div>`;
    
    const url = `${BASE_PATH}/${filename}`;
    
    return `
        <button class="number-button" 
                onclick="loadExplainedContent('${url}', '${category}', ${number})">
            ${number}
        </button>
    `;
}

// Create fallback display
function createFallbackDisplay(data) {
    return `
        <div class="result-section">
            <div class="section-header">
                <i class="fas fa-exclamation-triangle tw-mr-2"></i>Analysis Result
            </div>
            <div class="section-content">
                <p class="tw-text-gray-600">Data received successfully</p>
                
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

// Load explained content
function loadExplainedContent(url, category, number) {
    console.log(`🔄 DEBUG: Loading ${category} ${number} from: ${url}`);
    
    if (!url) {
        console.log('⚠️ DEBUG: No valid URL provided');
        return;
    }

    const explainedContent = document.getElementById('explainedContent');
    const explainedButton = document.querySelector('.tablink:nth-child(2)');
    
    explainedContent.innerHTML = `
        <div class="tw-text-center tw-py-8">
            <div class="spinner"></div>
            <p class="tw-mt-4 tw-text-gray-600">Loading ${category} ${number}...</p>
        </div>
    `;
    
    switchTab('Explained', explainedButton);
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            // Fix relative paths
            const fixedHtml = fixRelativePaths(html, url);
            
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
    
    if (!pinnacleData || !pinnacleData.lifePathNumber) {
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
    
    const url = `${BASE_PATH}/pinnacle.html`;
    
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
                throw new Error(`HTTP ${response.status}`);
            }
            return response.text();
        })
        .then(html => {
            const fixedHtml = fixRelativePaths(html, url);
            
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
                    <p class="tw-font-bold">Cannot load Pinnacle Cycle</p>
                    <p class="tw-text-sm">${error.message}</p>
                </div>
            `;
        });
}

// Fix relative paths for different environments
function fixRelativePaths(html, baseUrl) {
    let fixedHtml = html;
    
    // Fix img src paths
    fixedHtml = fixedHtml.replace(/src="([^"]*)"/g, function(match, path) {
        if (path.startsWith('http') || path.startsWith('//') || path.startsWith('data:')) {
            return match;
        }
        
        let newPath;
        if (path.startsWith('/')) {
            if (isGitHubPages && repoName && !path.startsWith(`/${repoName}`)) {
                newPath = `/${repoName}${path}`;
            } else {
                newPath = path;
            }
        } else if (path.startsWith('./')) {
            newPath = path;
        } else {
            newPath = `./${path}`;
        }
        
        return `src="${newPath}"`;
    });
    
    return fixedHtml;
}

// Expose functions to global scope
window.switchTab = switchTab;
window.toggleDebugInfo = toggleDebugInfo;
window.loadExplainedContent = loadExplainedContent;
window.loadPinnacle = loadPinnacle;
window.analysisData = analysisData;
window.pinnacleData = pinnacleData;
window.getGitHubRepoName = getGitHubRepoName;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initializePage);

console.log('✅ DEBUG: result.js loaded completely');

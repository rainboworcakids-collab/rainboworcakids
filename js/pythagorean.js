// pythagorean.js - Pythagorean Square calculations (แก้ไขแสดงข้อมูล PHP)
console.log('🚀 DEBUG: pythagorean.js loaded v8.8 - PHP Data Display Fix');

const pythagorean = {
    showPythagoreanSquare: async function(resultIndex, phpCombinedInfluence = '') {
        console.log(`📊 DEBUG: showPythagoreanSquare called for index ${resultIndex}`);
        await this._calculatePythagoreanSquare(resultIndex, 'basic', phpCombinedInfluence);
    },

    showCombinedPythagoreanSquare: async function(resultIndex, phpCombinedInfluence = '') {
        console.log(`📊 DEBUG: showCombinedPythagoreanSquare called for index ${resultIndex}`);
        await this._calculatePythagoreanSquare(resultIndex, 'combined', phpCombinedInfluence);
    },

    _calculatePythagoreanSquare: async function(resultIndex, calculationType, phpCombinedInfluence = '') {
        const explainedContent = document.getElementById('explainedContent');
        const explainedButton = document.querySelector('.tablink:nth-child(2)');
        
        if (!explainedContent || !explainedButton) {
            console.error('❌ DEBUG: Explained content or button not found');
            return;
        }
        
        const analysisData = this._getAnalysisData();
        
        if (!analysisData) {
            explainedContent.innerHTML = `
                <div class="tw-text-center tw-py-8 tw-text-red-500">
                    <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                    <p class="tw-font-bold">No analysis data available</p>
                </div>
            `;
            window.switchTab('Explained', explainedButton);
            return;
        }
        
        let result = null;
        let title = `Result ${resultIndex + 1}`;
        
        if (analysisData.results && Array.isArray(analysisData.results)) {
            if (analysisData.results[resultIndex]) {
                result = analysisData.results[resultIndex];
                title = result.title || title;
            } else if (analysisData.results.length > 0) {
                result = analysisData.results[0];
                title = result.title || title;
                resultIndex = 0;
            }
        }
        
        if (!result) {
            explainedContent.innerHTML = `
                <div class="tw-text-center tw-py-8 tw-text-red-500">
                    <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                    <p class="tw-font-bold">No data available</p>
                </div>
            `;
            window.switchTab('Explained', explainedButton);
            return;
        }
        
        explainedContent.innerHTML = `
            <div class="tw-text-center tw-py-8">
                <div class="spinner"></div>
                <p class="tw-mt-4 tw-text-gray-600">Calculating Pythagorean Square...</p>
            </div>
        `;
        window.switchTab('Explained', explainedButton);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (calculationType === 'basic') {
                this._displayWithPHPData(result, resultIndex, phpCombinedInfluence, 'basic');
            } else {
                this._displayWithPHPData(result, resultIndex, phpCombinedInfluence, 'combined');
            }
            
        } catch (error) {
            console.error('❌ DEBUG: Error in calculation:', error);
            explainedContent.innerHTML = `
                <div class="tw-text-center tw-py-8 tw-text-red-500">
                    <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                    <p class="tw-font-bold">Calculation error</p>
                    <p class="tw-text-sm">${error.message}</p>
                </div>
            `;
        }
    },

    _getAnalysisData: function() {
        if (window.analysisData) {
            return window.analysisData;
        }
        
        const psychomatrixResult = sessionStorage.getItem('psychomatrixResult');
        if (psychomatrixResult) {
            try {
                const data = JSON.parse(psychomatrixResult);
                window.analysisData = data;
                return data;
            } catch (error) {
                console.error('❌ DEBUG: Error parsing sessionStorage data:', error);
            }
        }
        
        return null;
    },

    _displayWithPHPData: function(result, resultIndex, phpCombinedInfluence, calculationType) {
        const explainedContent = document.getElementById('explainedContent');
        if (!explainedContent) return;
        
        const data = result.data || {};
        
        // ดึงข้อมูลจาก data ที่ PHP ส่งมา
        const lifePathNum = data.life_path_number || 
                           (data['เลขเส้นทางชีวิต-Life Path Number'] ? 
                            data['เลขเส้นทางชีวิต-Life Path Number'].split(' - ')[0] : null);
        
        const destinyNum = data.destiny_number || 
                          (data['เลขภาระกิจ-Destiny Number'] ? 
                           data['เลขภาระกิจ-Destiny Number'].split(' - ')[0] : null);
        
        // สร้าง number string จากข้อมูลที่มี
        let numberString = '';
        
        // 1. จาก birth date
        if (data.birth_date) {
            const birthNumbers = data.birth_date.replace(/[\/: ]/g, '');
            numberString += birthNumbers;
        }
        
        // 2. จาก ID card
        if (data.id_card) {
            numberString += data.id_card.replace(/\D/g, '');
        }
        
        // 3. จาก full name - ถ้ามี numberString ใน data
        if (data.number_string) {
            numberString += data.number_string;
        } else if (data.full_name) {
            const cleanName = data.full_name.replace(/\s/g, '');
            numberString += this.convertNameToNumberString(cleanName);
        }
        
        // 4. เพิ่มตัวเลขพิเศษ
        [lifePathNum, destinyNum].forEach(num => {
            if (num && !isNaN(num)) {
                const numStr = Math.abs(parseInt(num)).toString();
                for (let i = 0; i < numStr.length; i++) {
                    const digit = numStr[i];
                    if (digit >= '1' && digit <= '9') {
                        numberString += digit;
                    }
                }
            }
        });
        
        // สำหรับ combined type ให้เพิ่ม surrounding numbers
        if (calculationType === 'combined') {
            const surroundingNumbers = localStorage.getItem('lifePathSurroundingNumbers');
            if (surroundingNumbers) {
                try {
                    const numbersArray = JSON.parse(surroundingNumbers);
                    if (Array.isArray(numbersArray)) {
                        numbersArray.forEach(num => {
                            if (num && num.toString) {
                                const numStr = num.toString();
                                for (let i = 0; i < numStr.length; i++) {
                                    const digit = numStr[i];
                                    if (digit >= '1' && digit <= '9') {
                                        numberString += digit;
                                    }
                                }
                            }
                        });
                    }
                } catch (error) {
                    console.error('❌ DEBUG: Error parsing surrounding numbers:', error);
                }
            }
        }
        
        // สร้าง Pythagorean Square จาก numberString
        const pythagoreanHTML = this.calculatePythagoreanSquareHTML(numberString);
        
        // สร้าง HTML สำหรับสรุปผลเลขแวดล้อม
        // ใช้ข้อมูลจาก RootNumber.json แทนข้อมูลจาก PHP
        let influenceHTML = '';
        if (phpCombinedInfluence) {
            influenceHTML = this._createInfluenceHTML(numberString, calculationType, phpCombinedInfluence);
        } else {
            influenceHTML = this._createInfluenceHTML(numberString, calculationType);
        }
        
        const titleSuffix = calculationType === 'combined' ? '(รวมเลขสิ่งแวดล้อม)' : '';
        
        explainedContent.innerHTML = `
            <div class="pythagorean-square-page">
                <h2 class="tw-text-xl tw-font-semibold tw-mt-4">Pythagorean Square ${titleSuffix} - ${result.title || `Result ${resultIndex + 1}`}</h2>
                
                ${calculationType === 'combined' ? `
                <div class="tw-mb-4 tw-p-3 tw-bg-yellow-50 tw-rounded tw-text-sm">
                    <p><strong>Combined Calculation</strong></p>
                    <ul class="tw-list-disc tw-list-inside tw-mt-1">
                        <li>Total digits: ${numberString.length}</li>
                        <li>รวมตัวเลขพิเศษ: Life Path, Destiny, Karmic, Life Lesson</li>
                        <li>รวมเลขสิ่งแวดล้อม 20 รายการ</li>
                    </ul>
                </div>
                ` : ''}
                
                ${pythagoreanHTML}
                ${influenceHTML}
                
                ${calculationType === 'basic' ? `
                <div class="tw-mt-8 tw-mb-4 tw-text-center">
                    <button onclick="window.pythagorean.showCombinedPythagoreanSquare(${resultIndex}, '${phpCombinedInfluence ? phpCombinedInfluence.replace(/'/g, "\\'") : ''}')" 
                            class="tw-bg-purple-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-purple-600 tw-cursor-pointer tw-w-64 tw-inline-block">
                        Pythagorean Square (รวมเลขสิ่งแวดล้อม 20 รายการ)
                    </button>
                </div>
                ` : ''}
            </div>
        `;
    },

    // สร้าง HTML สำหรับสรุปผลเลขแวดล้อมจาก RootNumber.json
    _createInfluenceHTML: function(numberString, calculationType, phpCombinedInfluence = '') {
        console.log('📊 DEBUG: Creating influence HTML from RootNumber.json');
        
        const counts = new Array(10).fill(0);
        
        for (let i = 0; i < numberString.length; i++) {
            const digit = parseInt(numberString[i]);
            if (digit >= 1 && digit <= 9) {
                counts[digit]++;
            }
        }
        
        let maxCount = 0;
        let influentialNumbers = [];
        
        for (let i = 1; i <= 9; i++) {
            if (counts[i] > maxCount) {
                maxCount = counts[i];
                influentialNumbers = [i];
            } else if (counts[i] === maxCount && counts[i] > 0) {
                influentialNumbers.push(i);
            }
        }
        
        let missingNumbers = [];
        for (let i = 1; i <= 9; i++) {
            if (counts[i] === 0) {
                missingNumbers.push(i);
            }
        }
        
        // ดึงข้อมูลความหมายจาก RootNumber.json
        let influentialNumbersHTML = '';
        if (influentialNumbers.length > 0) {
            influentialNumbers.forEach(num => {
                const meaning = this._getNumberMeaningFromRootNumber(num);
                influentialNumbersHTML += `
                    <div class="tw-mt-3 tw-p-3 tw-bg-gray-50 tw-rounded">
                        <div class="tw-font-bold tw-text-lg tw-text-blue-700">เลข ${num} (ปรากฏ ${counts[num]} ครั้ง)</div>
                        <div class="tw-mt-1 tw-text-gray-700">${meaning}</div>
                    </div>
                `;
            });
        } else {
            influentialNumbersHTML = '<p class="tw-text-gray-500">ไม่พบเลขที่มีอิทธิพลสูง</p>';
        }
        
        let missingNumbersHTML = '';
        if (missingNumbers.length > 0) {
            missingNumbersHTML = missingNumbers.join(', ');
        } else {
            missingNumbersHTML = 'ไม่มีเลขที่ขาดหายไป';
        }
        
        // ถ้ามีข้อมูลจาก PHP ให้แสดงด้วย
        let phpInfluenceHTML = '';
        if (phpCombinedInfluence) {
            phpInfluenceHTML = `
                <div class="tw-mt-4 tw-p-3 tw-bg-yellow-50 tw-rounded">
                    <p class="tw-font-bold">ข้อมูลจาก PHP (ระบบเดิม):</p>
                    <p class="tw-mt-1">${phpCombinedInfluence}</p>
                </div>
            `;
        }
        
        return `
            <div class="tw-mt-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                <h3 class="tw-text-lg tw-font-bold tw-text-blue-800 tw-mb-2">สรุปผลเลขแวดล้อมที่มีอิทธิพลสูง (ข้อมูลจาก RootNumber.json)</h3>
                <div class="tw-mt-2">
                    <div class="tw-mb-4">
                        <p class="tw-font-bold tw-text-gray-700">เลขที่มีอิทธิพลสูงสุด:</p>
                        ${influentialNumbersHTML}
                    </div>
                    <div class="tw-mt-4">
                        <p class="tw-font-bold tw-text-gray-700">เลขที่ขาดหายไป:</p>
                        <p class="tw-text-gray-700">${missingNumbersHTML}</p>
                    </div>
                    ${phpInfluenceHTML}
                    <div class="tw-mt-4 tw-pt-3 tw-border-t">
                        <p class="tw-text-sm tw-text-gray-600">
                            <strong>การคำนวณ:</strong> รวมตัวเลขจากข้อมูลทั้งหมด
                            ${calculationType === 'combined' ? '+ เลขสิ่งแวดล้อม 20 รายการ' : ''}
                        </p>
                        <p class="tw-text-sm tw-text-gray-600 tw-mt-1">
                            <strong>แหล่งข้อมูลความหมาย:</strong> RootNumber.json
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    // ดึงข้อมูลความหมายจาก RootNumber.json
    _getNumberMeaningFromRootNumber: function(number) {
        console.log(`🔍 DEBUG: Getting meaning for number ${number} from RootNumber.json`);
        
        // ตรวจสอบว่า rootNumberData มีอยู่ใน window หรือไม่
        if (!window.rootNumberData) {
            console.log('❌ DEBUG: rootNumberData not found in window, trying to get from result.js');
            // พยายามเรียกฟังก์ชันจาก result.js
            if (window.getNumberMeaning) {
                const meaningData = window.getNumberMeaning(number);
                if (meaningData && meaningData.MEANING) {
                    return meaningData.MEANING;
                }
            }
            return 'ไม่พบข้อมูลความหมายจาก RootNumber.json';
        }
        
        // ตรวจสอบโครงสร้างข้อมูล
        if (!window.rootNumberData.LifePath || !Array.isArray(window.rootNumberData.LifePath)) {
            console.log('❌ DEBUG: rootNumberData.LifePath not found or not array');
            return 'โครงสร้างข้อมูล RootNumber.json ไม่ถูกต้อง';
        }
        
        const targetId = number.toString();
        const foundItem = window.rootNumberData.LifePath.find(item => {
            if (item && item.ID) {
                return item.ID === targetId;
            }
            return false;
        });
        
        if (foundItem && foundItem.MEANING) {
            return foundItem.MEANING;
        } else {
            return `ไม่พบความหมายสำหรับเลข ${number} ใน RootNumber.json`;
        }
    },

    // ฟังก์ชันที่เหลือเหมือนเดิม
    calculatePythagoreanSquareHTML: function(numberString) {
        const counts = new Array(10).fill(0);
        
        for (let i = 0; i < numberString.length; i++) {
            const digit = parseInt(numberString[i]);
            if (digit >= 1 && digit <= 9) {
                counts[digit]++;
            }
        }
        
        const rowSums = [
            counts[1] + counts[4] + counts[7],
            counts[2] + counts[5] + counts[8],
            counts[3] + counts[6] + counts[9]
        ];
        
        const colSums = [
            counts[1] + counts[2] + counts[3],
            counts[4] + counts[5] + counts[6],
            counts[7] + counts[8] + counts[9]
        ];
        
        const diagonalLeft = counts[1] + counts[5] + counts[9];
        const diagonalRight = counts[7] + counts[5] + counts[3];
        
        return `
            <div class="pythagorean-square">
                <!-- แถวที่ 1 -->
                <div class="square-cell number-1">1<span>(${counts[1]})</span></div>
                <div class="square-cell number-4">4<span>(${counts[4]})</span></div>
                <div class="square-cell number-7">7<span>(${counts[7]})</span></div>
                <div class="square-cell" style="background-color: #e8f5e9; color: #2e7d32;">${rowSums[0]}</div>
                
                <!-- แถวที่ 2 -->
                <div class="square-cell number-2">2<span>(${counts[2]})</span></div>
                <div class="square-cell number-5">5<span>(${counts[5]})</span></div>
                <div class="square-cell number-8">8<span>(${counts[8]})</span></div>
                <div class="square-cell" style="background-color: #e8f5e9; color: #2e7d32;">${rowSums[1]}</div>
                
                <!-- แถวที่ 3 -->
                <div class="square-cell number-3">3<span>(${counts[3]})</span></div>
                <div class="square-cell number-6">6<span>(${counts[6]})</span></div>
                <div class="square-cell number-9">9<span>(${counts[9]})</span></div>
                <div class="square-cell" style="background-color: #e8f5e9; color: #2e7d32;">${rowSums[2]}</div>
                
                <!-- แถวที่ 4 -->
                <div class="square-cell" style="background-color: #e3f2fd; color: #1565c0;">${colSums[0]}</div>
                <div class="square-cell" style="background-color: #e3f2fd; color: #1565c0;">${colSums[1]}</div>
                <div class="square-cell" style="background-color: #e3f2fd; color: #1565c0;">${colSums[2]}</div>
                <div class="square-cell" style="background-color: #fce4ec; color: #ad1457;">${diagonalLeft}/${diagonalRight}</div>
            </div>
        `;
    },

    convertNameToNumberString: function(name) {
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
        for (let i = 0; i < name.length; i++) {
            const char = name[i];
            const number = letterToNumber(char);
            numberString += number.toString();
        }
        
        return numberString;
    }
};

window.pythagorean = pythagorean;

console.log('✅ DEBUG: pythagorean.js loaded successfully');

// pythagorean.js - Pythagorean Square calculations
console.log('🚀 DEBUG: pythagorean.js loaded 8.4');

// Create global namespace
const pythagorean = {
    // Show Pythagorean Square
    showPythagoreanSquare: async function(resultIndex) {
        console.log(`📊 DEBUG: showPythagoreanSquare called for index ${resultIndex}`);
        await this._calculatePythagoreanSquare(resultIndex, 'basic');
    },

    // Show Combined Pythagorean Square
    showCombinedPythagoreanSquare: async function(resultIndex) {
        console.log(`📊 DEBUG: showCombinedPythagoreanSquare called for index ${resultIndex}`);
        await this._calculatePythagoreanSquare(resultIndex, 'combined');
    },

    // Main calculation function
    _calculatePythagoreanSquare: async function(resultIndex, calculationType) {
        const explainedContent = document.getElementById('explainedContent');
        const explainedButton = document.querySelector('.tablink:nth-child(2)');
        
        if (!explainedContent || !explainedButton) {
            console.error('❌ DEBUG: Explained content or button not found');
            return;
        }
        
        // ตรวจสอบข้อมูล
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
        
        // ดึงข้อมูลผลลัพธ์
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
        
        // แสดง loading
        explainedContent.innerHTML = `
            <div class="tw-text-center tw-py-8">
                <div class="spinner"></div>
                <p class="tw-mt-4 tw-text-gray-600">Calculating Pythagorean Square...</p>
            </div>
        `;
        window.switchTab('Explained', explainedButton);
        
        try {
            // ให้เวลาสำหรับการแสดง loading
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // คำนวณและแสดงผล
            if (calculationType === 'basic') {
                this._calculateLocally(result, resultIndex, analysisData);
            } else {
                this._calculateCombinedLocally(result, resultIndex, analysisData);
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

    // ฟังก์ชันตรวจสอบข้อมูล
    _getAnalysisData: function() {
        console.log('🔍 DEBUG: Getting analysis data');
        
        // 1. ตรวจสอบ window.analysisData
        if (window.analysisData) {
            return window.analysisData;
        }
        
        // 2. ตรวจสอบ sessionStorage
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

    // คำนวณแบบ local (basic)
    _calculateLocally: function(result, resultIndex, analysisData) {
        console.log('🔄 DEBUG: Local calculation (basic)');
        const explainedContent = document.getElementById('explainedContent');
        
        if (!explainedContent) return;
        
        const data = result.data || {};
        const lifePathNum = data.life_path_number || data.lifePath;
        const destinyNum = data.destiny_number || data.destiny;
        const karmicNum = data.thirdAndFourth?.karmic || data.karmic;
        const lifeLessonNum = data.thirdAndFourth?.lifeLesson || data.lifeLesson;
        
        // สร้าง number string
        let numberString = '';
        
        if (result.number_string) {
            numberString = result.number_string;
        } else {
            if (data.birth_date) {
                const birthNumbers = data.birth_date.replace(/[\/: ]/g, '');
                numberString += birthNumbers;
            }
            if (data.id_card) {
                numberString += data.id_card.replace(/\D/g, '');
            }
            if (data.full_name) {
                const cleanName = data.full_name.replace(/\s/g, '');
                numberString += this.convertNameToNumberString(cleanName);
            }
        }
        
        // เพิ่มตัวเลขพิเศษ
        const specialNumbers = [lifePathNum, destinyNum, karmicNum, lifeLessonNum];
        specialNumbers.forEach(num => {
            if (num !== undefined && num !== null && num !== '') {
                const numStr = num.toString();
                for (let i = 0; i < numStr.length; i++) {
                    const digit = numStr[i];
                    if (digit >= '1' && digit <= '9') {
                        numberString += digit;
                    }
                }
            }
        });
        
        // คำนวณและแสดงผล
        const pythagoreanHTML = this.calculatePythagoreanSquareHTML(numberString);
        const mostInfluentialHTML = this.calculateMostInfluentialNumbers(numberString);
        
        explainedContent.innerHTML = `
            <div class="pythagorean-square-container">
                <h2>Pythagorean Square - ${result.title || `Result ${resultIndex + 1}`}</h2>
                <div class="tw-mb-4 tw-p-3 tw-bg-blue-50 tw-rounded tw-text-sm">
                    <p><strong>Basic Calculation</strong></p>
                    <ul class="tw-list-disc tw-list-inside tw-mt-1">
                        <li>Total digits: ${numberString.length}</li>
                        <li>Life Path: ${lifePathNum || 'N/A'}</li>
                        <li>Destiny: ${destinyNum || 'N/A'}</li>
                    </ul>
                </div>
                ${pythagoreanHTML}
                ${mostInfluentialHTML}
                <div class="tw-mt-8 tw-text-center">
                    <button onclick="window.pythagorean.showCombinedPythagoreanSquare(${resultIndex})" 
                            class="tw-bg-purple-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-purple-600 tw-cursor-pointer tw-w-64 tw-inline-block">
                        Pythagorean Square (รวมเลขสิ่งแวดล้อม 20 รายการ)
                    </button>
                </div>
            </div>
        `;
    },

    // คำนวณแบบ local (combined)
    _calculateCombinedLocally: function(result, resultIndex, analysisData) {
        console.log('🔄 DEBUG: Local calculation (combined)');
        const explainedContent = document.getElementById('explainedContent');
        
        if (!explainedContent) return;
        
        const data = result.data || {};
        const lifePathNum = data.life_path_number || data.lifePath;
        const destinyNum = data.destiny_number || data.destiny;
        const karmicNum = data.thirdAndFourth?.karmic || data.karmic;
        const lifeLessonNum = data.thirdAndFourth?.lifeLesson || data.lifeLesson;
        
        // ดึงข้อมูล surrounding numbers
        const surroundingNumbers = localStorage.getItem('lifePathSurroundingNumbers');
        
        // สร้าง number string
        let combinedNumberString = '';
        
        if (result.number_string) {
            combinedNumberString += result.number_string;
        } else {
            if (data.birth_date) {
                const birthNumbers = data.birth_date.replace(/[\/: ]/g, '');
                combinedNumberString += birthNumbers;
            }
            if (data.id_card) {
                combinedNumberString += data.id_card.replace(/\D/g, '');
            }
            if (data.full_name) {
                const cleanName = data.full_name.replace(/\s/g, '');
                combinedNumberString += this.convertNameToNumberString(cleanName);
            }
        }
        
        // เพิ่มตัวเลขพิเศษ
        const specialNumbers = [lifePathNum, destinyNum, karmicNum, lifeLessonNum];
        specialNumbers.forEach(num => {
            if (num !== undefined && num !== null) {
                const numStr = num.toString();
                for (let i = 0; i < numStr.length; i++) {
                    const digit = numStr[i];
                    if (digit >= '1' && digit <= '9') {
                        combinedNumberString += digit;
                    }
                }
            }
        });
        
        // เพิ่มเลขสิ่งแวดล้อม
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
                                    combinedNumberString += digit;
                                }
                            }
                        }
                    });
                }
            } catch (error) {
                console.error('❌ DEBUG: Error parsing surrounding numbers:', error);
            }
        }
        
        // คำนวณและแสดงผล
        const pythagoreanHTML = this.calculatePythagoreanSquareHTML(combinedNumberString);
        const mostInfluentialHTML = this.calculateMostInfluentialNumbers(combinedNumberString);
        
        explainedContent.innerHTML = `
            <div class="pythagorean-square-container">
                <h2>Pythagorean Square (รวมเลขสิ่งแวดล้อม) - ${result.title || `Result ${resultIndex + 1}`}</h2>
                <div class="tw-mb-4 tw-p-3 tw-bg-yellow-50 tw-rounded tw-text-sm">
                    <p><strong>Combined Calculation</strong></p>
                    <ul class="tw-list-disc tw-list-inside tw-mt-1">
                        <li>Total digits: ${combinedNumberString.length}</li>
                        <li>Including 20 surrounding numbers</li>
                    </ul>
                </div>
                ${pythagoreanHTML}
                ${mostInfluentialHTML}
            </div>
        `;
    },

    // ===== UTILITY FUNCTIONS =====
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
                <div class="square-cell number-1">1<span>(${counts[1]})</span></div>
                <div class="square-cell number-4">4<span>(${counts[4]})</span></div>
                <div class="square-cell number-7">7<span>(${counts[7]})</span></div>
                
                <div class="square-cell number-2">2<span>(${counts[2]})</span></div>
                <div class="square-cell number-5">5<span>(${counts[5]})</span></div>
                <div class="square-cell number-8">8<span>(${counts[8]})</span></div>
                
                <div class="square-cell number-3">3<span>(${counts[3]})</span></div>
                <div class="square-cell number-6">6<span>(${counts[6]})</span></div>
                <div class="square-cell number-9">9<span>(${counts[9]})</span></div>
                
                <div class="square-cell sum">${rowSums[0]}</div>
                <div class="square-cell sum">${rowSums[1]}</div>
                <div class="square-cell sum">${rowSums[2]}</div>
                
                <div class="square-cell sum">${colSums[0]}</div>
                <div class="square-cell sum">${colSums[1]}</div>
                <div class="square-cell sum">${colSums[2]}</div>
                <div class="square-cell sum">${diagonalLeft}/${diagonalRight}</div>
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
    },

    calculateMostInfluentialNumbers: function(numberString) {
        const counts = new Array(10).fill(0);
        
        for (let i = 0; i < numberString.length; i++) {
            const digit = parseInt(numberString[i]);
            if (digit >= 1 && digit <= 9) {
                counts[digit]++;
            }
        }
        
        const maxCount = Math.max(...counts.slice(1));
        const influentialNumbers = [];
        for (let i = 1; i <= 9; i++) {
            if (counts[i] === maxCount) {
                influentialNumbers.push(i);
            }
        }
        
        const missingNumbers = [];
        for (let i = 1; i <= 9; i++) {
            if (counts[i] === 0) {
                missingNumbers.push(i);
            }
        }
        
        return `
            <div class="tw-mt-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                <h3 class="tw-text-lg tw-font-bold tw-text-blue-800 tw-mb-2">สรุปผลเลขแวดล้อมที่มีอิทธิพลสูง</h3>
                <p class="tw-text-gray-700">
                    <strong>เลขที่มีอิทธิพลสูงสุด:</strong> 
                    ${influentialNumbers.length > 0 ? influentialNumbers.join(', ') : 'ไม่พบ'}
                    (ปรากฏ ${maxCount} ครั้ง)
                </p>
                <p class="tw-text-gray-700 tw-mt-2">
                    <strong>เลขที่ขาดหายไป:</strong> 
                    ${missingNumbers.length > 0 ? missingNumbers.join(', ') : 'ไม่มี'}
                </p>
            </div>
        `;
    }
};

// Expose to global scope
window.pythagorean = pythagorean;

console.log('✅ DEBUG: pythagorean.js loaded successfully');
console.log('📋 DEBUG: Available functions:', Object.keys(pythagorean));

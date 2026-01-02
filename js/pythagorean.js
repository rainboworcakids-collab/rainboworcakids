// pythagorean.js - Pythagorean Square calculations (Fixed with PHP Logic)
console.log('🚀 DEBUG: pythagorean.js loaded 9.2 - Fixed Storage and API Integration');

// Create global namespace
const pythagorean = {
    // โหลด RootNumber.json
    async loadRootNumberData() {
        if (window.rootNumberData) {
            console.log('✅ DEBUG: RootNumber.json already loaded version 9.0');
            return window.rootNumberData;
        }
        
        try {
            const response = await fetch('data/RootNumber.json');
            if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            const data = await response.json();
            window.rootNumberData = data;
            console.log('✅ DEBUG: RootNumber.json loaded successfully');
            return data;
        } catch (error) {
            console.error('❌ DEBUG: Error loading RootNumber.json:', error);
            window.rootNumberData = { LifePath: [] };
            return window.rootNumberData;
        }
    },
    
    // ฟังก์ชันแปลงตัวอักษรเป็นตัวเลข (ตาม numerology_functions.php)
    letterToNumber(letter) {
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
            'ุ': 'U', 'ู': 'U', 'เ': 'E', 'แ': 'A', 'โ': 'O', 'ใ': 'I', 'ไ': 'I',
            '็': '', '์': '', 'ๆ': '', 'ฯ': '', 'ๅ': ''
        };

        const map = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
            'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
            'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8,
            '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '0': 0
        };

        // แปลงเป็นตัวพิมพ์ใหญ่
        let upperLetter = letter.toUpperCase();
        
        // ถ้าเป็นอักษรไทย ให้แปลงเป็นอังกฤษก่อน
        if (thaiToEnglishMap[letter]) {
            upperLetter = thaiToEnglishMap[letter];
        }
        
        return map[upperLetter] || 0;
    },

    // คำนวณ Destiny Number (ตาม numerology_functions.php)
    calculateDestinyNumber(input) {
        let str = input.replace(/\D/g, '');
        let length = str.length;
        
        if (length % 2 !== 0) {
            str = '0' + str;
            length = str.length;
        }

        const halfLength = length / 2;
        const group1 = str.substring(0, halfLength);
        const group2 = str.substring(halfLength);

        const reduceToSingleDigit = (numStr) => {
            let sum = 0;
            for (let i = 0; i < numStr.length; i++) {
                sum += parseInt(numStr[i]);
            }
            
            while (sum > 9) {
                const sumStr = sum.toString();
                sum = 0;
                for (let i = 0; i < sumStr.length; i++) {
                    sum += parseInt(sumStr[i]);
                }
            }
            
            return sum === 0 ? 1 : sum;
        };

        const digit1 = reduceToSingleDigit(group1);
        const digit2 = reduceToSingleDigit(group2);
        
        return parseInt(digit1.toString() + digit2.toString());
    },

    // คำนวณ Life Path Number
    calculateLifePathNumber(destinyNumber) {
        let num = destinyNumber;
        
        while (num > 9) {
            let sum = 0;
            while (num > 0) {
                sum += num % 10;
                num = Math.floor(num / 10);
            }
            num = sum;
        }
        
        return num;
    },

    // แปลงชื่อเป็นตัวเลข (ตาม PHP) - คืนค่าเป็น object เหมือน PHP
    calculateNameNumbers(fullName) {
        if (!fullName || fullName.trim() === '') {
            return {
                destiny: 0,
                lifePath: 0,
                karmic: 0,
                lifeLesson: 0,
                numberString: ''
            };
        }
        
        const name = fullName.replace(/\s/g, '');
        let numberString = '';
        
        for (let i = 0; i < name.length; i++) {
            const char = name[i];
            numberString += this.letterToNumber(char).toString();
        }
        
        const destiny = this.calculateDestinyNumber(numberString);
        const lifePath = this.calculateLifePathNumber(destiny);
        
        // คำนวณ thirdAndFourthNumbers
        const thirdAndFourth = this._calculateThirdAndFourthNumbers(numberString, destiny);
        
        return {
            destiny: destiny,
            lifePath: lifePath,
            karmic: thirdAndFourth.karmic,
            lifeLesson: thirdAndFourth.lifeLesson,
            numberString: numberString
        };
    },

    // คำนวณ Third and Fourth Numbers (เหมือน PHP)
    _calculateThirdAndFourthNumbers(input, destinyNumber) {
        const firstDigit = parseInt(input[0]);
        let karmicNumber = destinyNumber - (2 * firstDigit);
        karmicNumber = karmicNumber < 0 ? 0 : karmicNumber;
        
        let lifeLessonNumber = karmicNumber;
        
        // ถ้าเป็น 11 หรือ 22 ให้คืนค่าเดิม
        if (karmicNumber === 11 || karmicNumber === 22) {
            return {
                karmic: karmicNumber,
                lifeLesson: karmicNumber
            };
        }
        
        // ลดเหลือเลขหลักเดียว
        while (lifeLessonNumber > 9) {
            let sum = 0;
            while (lifeLessonNumber > 0) {
                sum += lifeLessonNumber % 10;
                lifeLessonNumber = Math.floor(lifeLessonNumber / 10);
            }
            lifeLessonNumber = sum;
        }
        
        return {
            karmic: karmicNumber,
            lifeLesson: lifeLessonNumber
        };
    },

    // ===== ฟังก์ชันหลักสำหรับ Pythagorean Square =====
    showPythagoreanSquare: async function(resultIndex) {
        console.log(`📊 DEBUG: showPythagoreanSquare called for index ${resultIndex}`);
        await this._calculatePythagoreanSquare(resultIndex, 'basic');
    },

    showCombinedPythagoreanSquare: async function(resultIndex, resultData = null) {
        console.log(`📊 DEBUG: showCombinedPythagoreanSquare called for index ${resultIndex}`);
        if (resultData) {
            console.log('✅ DEBUG: Using provided resultData');
            await this._calculatePythagoreanSquare(resultIndex, 'combined', resultData);
        } else {
            console.log('🔄 DEBUG: No resultData provided, fetching from analysis');
            await this._calculatePythagoreanSquare(resultIndex, 'combined');
        }
    },

    // ฟังก์ชันคำนวณหลัก
    async _calculatePythagoreanSquare(resultIndex, calculationType, providedResult = null) {
        console.log(`🧮 DEBUG: _calculatePythagoreanSquare type=${calculationType}, resultIndex=${resultIndex}`);
        
        const explainedContent = document.getElementById('explainedContent');
        const explainedButton = document.querySelector('.tablink:nth-child(2)');
        
        if (!explainedContent || !explainedButton) {
            console.error('❌ DEBUG: Explained content or button not found');
            return;
        }
        
        await this.loadRootNumberData();
        
        // แสดง loading
        explainedContent.innerHTML = `
            <div class="tw-text-center tw-py-8">
                <div class="spinner"></div>
                <p class="tw-mt-4 tw-text-gray-600">กำลังคำนวณ Pythagorean Square...</p>
            </div>
        `;
        window.switchTab('Explained', explainedButton);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 100));
            
            let result;
            if (providedResult) {
                result = providedResult;
                console.log('✅ DEBUG: Using provided result data');
            } else {
                const analysisData = this._getAnalysisData();
                if (!analysisData) {
                    this._showError(explainedContent, explainedButton, 'No analysis data available');
                    return;
                }
                result = this._getResultData(analysisData, resultIndex);
                if (!result) {
                    this._showError(explainedContent, explainedButton, 'No data available');
                    return;
                }
            }
            
            if (calculationType === 'basic') {
                this._calculateBasicSquare(explainedContent, result, resultIndex);
            } else {
                await this._calculateCombinedSquare(explainedContent, result, resultIndex);
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

    // ฟังก์ชันดึงข้อมูล
    _getAnalysisData() {
        if (window.analysisData) return window.analysisData;
        
        const psychomatrixResult = sessionStorage.getItem('psychomatrixResult');
        if (psychomatrixResult) {
            try {
                const data = JSON.parse(psychomatrixResult);
                window.analysisData = data;
                console.log('✅ DEBUG: Loaded analysisData from sessionStorage');
                return data;
            } catch (error) {
                console.error('❌ DEBUG: Error parsing sessionStorage data:', error);
            }
        }
        
        return null;
    },

    _getResultData(analysisData, resultIndex) {
        if (analysisData.results && Array.isArray(analysisData.results)) {
            if (analysisData.results[resultIndex]) {
                console.log(`✅ DEBUG: Found result at index ${resultIndex}: ${analysisData.results[resultIndex].type}`);
                return analysisData.results[resultIndex];
            } else if (analysisData.results.length > 0) {
                console.log(`⚠️ DEBUG: Index ${resultIndex} not found, using first result`);
                return analysisData.results[0];
            }
        }
        console.error('❌ DEBUG: No results found in analysis data');
        return null;
    },

    _showError(explainedContent, explainedButton, message) {
        explainedContent.innerHTML = `
            <div class="tw-text-center tw-py-8 tw-text-red-500">
                <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                <p class="tw-font-bold">${message}</p>
            </div>
        `;
        window.switchTab('Explained', explainedButton);
    },

    // คำนวณแบบพื้นฐาน
    _calculateBasicSquare(explainedContent, result, resultIndex) {
        console.log(`📊 DEBUG: _calculateBasicSquare for ${result.type}`);
        const data = result.data || {};
        const lifePathNum = data.life_path_number || data.lifePath;
        const destinyNum = data.destiny_number || data.destiny;
        
        // สร้าง number string จากข้อมูลต่างๆ
        let numberString = this._buildNumberString(data);
        
        console.log(`🔢 DEBUG: Basic number string: ${numberString} (${numberString.length} digits)`);
        
        // สร้างตาราง (ไม่ใช้ค่าเฉลี่ย)
        const counts = this._buildPythagoreanSquare(numberString, 0);
        const tableHTML = this._generatePythagoreanTable(counts, false, 0);
        const analysisHTML = this._generateAnalysis(counts, 0);
        
        explainedContent.innerHTML = `
            <div class="pythagorean-square-container">
                <h2 class="tw-text-2xl tw-font-bold tw-text-blue-800 tw-mb-4">Pythagorean Square - ${result.title || `Result ${resultIndex + 1}`}</h2>
                <div class="tw-mb-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                    <p class="tw-font-bold tw-text-blue-700">📊 Basic Calculation</p>
                    <ul class="tw-list-disc tw-list-inside tw-mt-2">
                        <li>Total digits: ${numberString.length}</li>
                        <li>Life Path: ${lifePathNum || 'N/A'}</li>
                        <li>Destiny: ${destinyNum || 'N/A'}</li>
                        <li>ใช้ค่าเฉลี่ย: ไม่</li>
                    </ul>
                </div>
                ${tableHTML}
                ${analysisHTML}
                <div class="tw-mt-8 tw-text-center">
                    <button onclick="window.pythagorean.showCombinedPythagoreanSquare(${resultIndex}, ${JSON.stringify(result).replace(/"/g, '&quot;')})" 
                            class="tw-bg-purple-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-purple-600 tw-cursor-pointer tw-w-64">
                        Pythagorean Square (รวมเลขสิ่งแวดล้อม + ค่าเฉลี่ย)
                    </button>
                </div>
            </div>
        `;
    },

    // คำนวณแบบรวมข้อมูลสิ่งแวดล้อม
    async _calculateCombinedSquare(explainedContent, result, resultIndex) {
        console.log(`📊 DEBUG: _calculateCombinedSquare for ${result.type}`);
        
        // ตรวจสอบว่าผลลัพธ์นี้เป็น combined-influence หรือมี surrounding_data หรือไม่
        if (result.type === 'combined-influence' || (result.data && result.data.surrounding_data)) {
            console.log('✅ DEBUG: Using combined-influence data from API response');
            this._calculateFromResultData(explainedContent, result, resultIndex);
            return;
        }
        
        // ถ้าไม่ใช่ combined-influence ให้คำนวณจากข้อมูลพื้นฐานทั้งหมด + ข้อมูลสิ่งแวดล้อม
        console.log('🔄 DEBUG: Calculating combined square from ALL basic data + surroundings');
        
        // 1. ดึงข้อมูลทั้งหมดจาก analysisData
        const analysisData = this._getAnalysisData();
        if (!analysisData) {
            this._showError(explainedContent, null, 'ไม่พบข้อมูลการวิเคราะห์');
            return;
        }
        
        // 2. หาข้อมูลพื้นฐานทั้งหมด (Birth Date, ID Card, Full Name)
        const birthDateResult = analysisData.results.find(r => r.type === 'birth-date');
        const idCardResult = analysisData.results.find(r => r.type === 'id-card');
        const fullNameResult = analysisData.results.find(r => r.type === 'full-name');
        
        console.log('🔍 DEBUG: Found results:', {
            birthDate: !!birthDateResult,
            idCard: !!idCardResult,
            fullName: !!fullNameResult
        });
        
        // 3. สร้าง combined number string จากข้อมูลพื้นฐานทั้งหมด
        let combinedNumberString = '';
        let basicItemCount = 0;
        let basicItemsInfo = [];
        
        // 3.1 Birth Date
        if (birthDateResult && birthDateResult.data) {
            const birthData = birthDateResult.data;
            const birthNumbers = this._buildNumberString(birthData);
            combinedNumberString += birthNumbers;
            basicItemCount++;
            basicItemsInfo.push({
                type: 'Birth Date',
                lifepath: birthData.life_path_number || birthData.lifePath,
                destiny: birthData.destiny_number || birthData.destiny,
                digits: birthNumbers.length
            });
            console.log(`📅 DEBUG: Added Birth Date - Lifepath: ${birthData.life_path_number}, Digits: ${birthNumbers.length}`);
        }
        
        // 3.2 ID Card
        if (idCardResult && idCardResult.data) {
            const idCardData = idCardResult.data;
            const idCardNumbers = this._buildNumberString(idCardData);
            combinedNumberString += idCardNumbers;
            basicItemCount++;
            basicItemsInfo.push({
                type: 'ID Card',
                lifepath: idCardData.life_path_number || idCardData.lifePath,
                destiny: idCardData.destiny_number || idCardData.destiny,
                digits: idCardNumbers.length
            });
            console.log(`🪪 DEBUG: Added ID Card - Lifepath: ${idCardData.life_path_number}, Digits: ${idCardNumbers.length}`);
        }
        
        // 3.3 Full Name
        if (fullNameResult && fullNameResult.data) {
            const fullNameData = fullNameResult.data;
            const fullNameNumbers = this._buildNumberString(fullNameData);
            combinedNumberString += fullNameNumbers;
            basicItemCount++;
            basicItemsInfo.push({
                type: 'Full Name',
                lifepath: fullNameData.life_path_number || fullNameData.lifePath,
                destiny: fullNameData.destiny_number || fullNameData.destiny,
                digits: fullNameNumbers.length
            });
            console.log(`✍️ DEBUG: Added Full Name - Lifepath: ${fullNameData.life_path_number}, Digits: ${fullNameNumbers.length}`);
        }
        
        console.log(`🔢 DEBUG: Basic combined string: ${combinedNumberString} (${combinedNumberString.length} digits)`);
        console.log(`📊 DEBUG: Basic items count: ${basicItemCount}`);
        
        // 4. ดึงข้อมูลสิ่งแวดล้อม
        const surroundingData = this._getSurroundingDataFromStorage();
        console.log(`🔍 DEBUG: Surrounding data items: ${Object.keys(surroundingData).length}`);
        
        if (Object.keys(surroundingData).length === 0) {
            this._showError(explainedContent, null, 'ไม่พบข้อมูลสิ่งแวดล้อม 20 รายการ');
            return;
        }
        
        // 5. ตรวจสอบการใช้ค่าเฉลี่ย (ต้องเป็น true เสมอสำหรับ combined)
        const useAverage = true; // สำหรับ combined-influence ต้องใช้ค่าเฉลี่ยเสมอ
        
        console.log(`📊 DEBUG: Use average: ${useAverage} (always true for combined)`);
        
        // 6. เพิ่มข้อมูลสิ่งแวดล้อมและนับจำนวน
        let surroundingItems = [];
        Object.keys(surroundingData).forEach(key => {
            const value = surroundingData[key];
            if (value && value.trim() !== '') {
                surroundingItems.push(value);
                const numbers = this._convertTextToNumbers(value);
                combinedNumberString += numbers;
                
                // สำหรับ combined-influence ให้นับทุก item
                // (จะถูกนับใน average_cell ต่อไป)
            }
        });
        
        // 7. คำนวณ average_cell (ต้องใช้ค่าเฉลี่ย)
        // ข้อมูลพื้นฐาน: 3 รายการ (Birth Date, ID Card, Full Name)
        // ข้อมูลสิ่งแวดล้อม: 17 รายการ (จาก debug log)
        // รวม: 20 รายการ
        const average_cell = basicItemCount + surroundingItems.length;
        
        console.log(`✅ DEBUG: Final calculation:`);
        console.log(`  - Basic items: ${basicItemCount} (ควรเป็น 3)`);
        console.log(`  - Surrounding items: ${surroundingItems.length}`);
        console.log(`  - Total items: ${average_cell} (ควรเป็น 20)`);
        console.log(`  - Total digits: ${combinedNumberString.length}`);
        console.log(`  - Average cell: ${average_cell}`);
        
        // 8. สร้าง Pythagorean Square (ใช้ค่าเฉลี่ย)
        const counts = this._buildPythagoreanSquare(combinedNumberString, average_cell);
        
        // 9. สร้างรายการข้อมูลพื้นฐาน
        let basicItemsList = '';
        basicItemsInfo.forEach((item, index) => {
            basicItemsList += `
                <li class="tw-mb-2 tw-p-2 tw-bg-white tw-rounded">
                    <span class="tw-font-semibold tw-text-blue-600">${item.type}:</span>
                    <div class="tw-text-gray-700 tw-mt-1">
                        <span class="tw-text-sm">Lifepath: ${item.lifepath || 'N/A'}</span> | 
                        <span class="tw-text-sm">Destiny: ${item.destiny || 'N/A'}</span> | 
                        <span class="tw-text-sm">ตัวเลข: ${item.digits} หลัก</span>
                    </div>
                </li>
            `;
        });
        
        // 10. แสดงผล (แสดงค่าเฉลี่ย)
        const tableHTML = this._generatePythagoreanTable(counts, true, average_cell);
        const analysisHTML = this._generateCombinedAnalysis(
            counts, 
            average_cell, 
            combinedNumberString.length, 
            surroundingItems,
            true,
            basicItemsInfo
        );
        
        explainedContent.innerHTML = `
            <div class="pythagorean-square-container">
                <h2 class="tw-text-2xl tw-font-bold tw-text-purple-800 tw-mb-4">
                    Pythagorean Square (รวมเลขสิ่งแวดล้อม + ค่าเฉลี่ย) - Combined Analysis
                </h2>
                
                <div class="tw-mb-6 tw-p-4 tw-bg-yellow-50 tw-rounded-lg">
                    <p class="tw-font-bold tw-text-yellow-700">🧲 Combined Calculation with Average</p>
                    <ul class="tw-list-disc tw-list-inside tw-mt-2">
                        <li>ตัวเลขทั้งหมด: ${combinedNumberString.length} หลัก</li>
                        <li>ข้อมูลพื้นฐาน: ${basicItemCount} รายการ (Birth Date, ID Card, Full Name)</li>
                        <li>ข้อมูลสิ่งแวดล้อม: ${surroundingItems.length} รายการ</li>
                        <li class="tw-font-bold tw-text-red-600">ใช้ค่าเฉลี่ย: ใช่ (หารด้วย ${average_cell})</li>
                        <li>ค่าที่แสดง: <span class="tw-font-bold">ค่าที่หารด้วย ${average_cell} แล้ว</span></li>
                    </ul>
                    
                    ${basicItemCount > 0 ? `
                    <div class="tw-mt-4 tw-p-3 tw-bg-blue-50 tw-rounded">
                        <h4 class="tw-font-bold tw-text-blue-700 tw-mb-2">ข้อมูลพื้นฐานที่ใช้:</h4>
                        <ul class="tw-list-decimal tw-list-inside">
                            ${basicItemsList}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                
                ${tableHTML}
                ${analysisHTML}
                
                <div class="tw-mt-8 tw-text-center">
                    <button onclick="window.pythagorean.showPythagoreanSquare(${resultIndex}, ${JSON.stringify(result).replace(/"/g, '&quot;')})" 
                            class="tw-bg-blue-500 tw-text-white tw-py-2 tw-px-6 tw-rounded-full hover:tw-bg-blue-600 tw-cursor-pointer">
                        ← กลับไป Pythagorean Square มาตรฐาน (ไม่ใช้ค่าเฉลี่ย)
                    </button>
                </div>
            </div>
        `;
    },    
    
    // สร้างการวิเคราะห์พื้นฐาน (เพิ่ม average_cell parameter)
    _generateAnalysis(counts, average_cell = 0) {
        const maxCount = Math.max(...Object.values(counts));
        const influentialNumbers = [];
        const missingNumbers = [];
        
        for (let i = 1; i <= 9; i++) {
            if (counts[i] === maxCount) influentialNumbers.push(i);
            if (counts[i] === 0) missingNumbers.push(i);
        }
        
        const averageNote = average_cell > 0 
            ? `<p class="tw-text-blue-600 tw-mt-2"><i class="fas fa-calculator tw-mr-2"></i>ค่าที่แสดงเป็นค่าหลังหารด้วย ${average_cell} แล้ว</p>`
            : '';
        
        return `
            <div class="tw-mt-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                <h3 class="tw-text-lg tw-font-bold tw-text-blue-800 tw-mb-2">สรุปผลเลขแวดล้อมที่มีอิทธิพลสูง</h3>
                ${averageNote}
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                    <div>
                        <h4 class="tw-font-bold tw-text-green-700">เลขที่มีอิทธิพลสูงสุด:</h4>
                        <p class="tw-text-gray-700">${influentialNumbers.join(', ') || 'ไม่พบ'} (ปรากฏ ${maxCount} ครั้ง)</p>
                        ${average_cell > 0 ? 
                            `<p class="tw-text-xs tw-text-gray-500">ค่าจริง: ${maxCount * average_cell} ครั้ง</p>` 
                            : ''}
                    </div>
                    <div>
                        <h4 class="tw-font-bold tw-text-red-700">เลขที่ขาดหายไป:</h4>
                        <p class="tw-text-gray-700">${missingNumbers.join(', ') || 'ไม่มี'}</p>
                    </div>
                </div>
            </div>
        `;
    },

    // สร้างการวิเคราะห์แบบรวม (เพิ่ม showAverage parameter)
    _generateCombinedAnalysis(counts, average_cell, totalDigits, surroundingItems, showAverage = false, basicItemsInfo = []) {
        const maxCount = Math.max(...Object.values(counts));
        const influentialNumbers = [];
        const missingNumbers = [];
        
        for (let i = 1; i <= 9; i++) {
            if (counts[i] === maxCount) influentialNumbers.push(i);
            if (counts[i] === 0) missingNumbers.push(i);
        }
        
        // สร้างรายการข้อมูลสิ่งแวดล้อม
        let surroundingItemsList = '';
        if (Array.isArray(surroundingItems)) {
            surroundingItems.forEach((item, index) => {
                if (item && item.trim() !== '') {
                    surroundingItemsList += `
                        <li class="tw-mb-2 tw-p-2 tw-bg-white tw-rounded">
                            <span class="tw-font-semibold tw-text-blue-600">รายการที่ ${index + 1}:</span>
                            <div class="tw-text-gray-700 tw-mt-1">${item.substring(0, 80)}${item.length > 80 ? '...' : ''}</div>
                            ${showAverage ? 
                                `<div class="tw-text-xs tw-text-gray-500 tw-mt-1">
                                    <i class="fas fa-hashtag tw-mr-1"></i>ตัวเลข: ${this._convertTextToNumbers(item).substring(0, 30)}${this._convertTextToNumbers(item).length > 30 ? '...' : ''}
                                </div>` 
                                : ''}
                        </li>
                    `;
                }
            });
        }
        
        // สร้างรายการข้อมูลพื้นฐาน
        let basicItemsList = '';
        if (Array.isArray(basicItemsInfo) && basicItemsInfo.length > 0) {
            basicItemsInfo.forEach((item, index) => {
                basicItemsList += `
                    <li class="tw-mb-2">
                        <span class="tw-font-semibold tw-text-green-600">${item.type}:</span>
                        <span class="tw-text-gray-700"> Lifepath ${item.lifepath || 'N/A'}, Destiny ${item.destiny || 'N/A'}, ${item.digits} หลัก</span>
                    </li>
                `;
            });
        }
        
        const averageSection = showAverage && average_cell > 0 ? `
            <div class="tw-mt-4 tw-p-4 tw-bg-red-50 tw-rounded-lg">
                <h4 class="tw-font-bold tw-text-red-700 tw-mb-3">
                    <i class="fas fa-calculator tw-mr-2"></i>การคำนวณค่าเฉลี่ย
                </h4>
                <ul class="tw-list-disc tw-list-inside">
                    <li>จำนวนข้อมูลทั้งหมด: ${average_cell} รายการ</li>
                    <li>จำนวนข้อมูลพื้นฐาน: ${basicItemsInfo.length} รายการ (Birth Date, ID Card, Full Name)</li>
                    <li>จำนวนข้อมูลสิ่งแวดล้อม: ${surroundingItems.length} รายการ</li>
                    <li>ทุกค่าในตารางถูกหารด้วย ${average_cell}</li>
                    <li class="tw-font-bold tw-text-red-600">ค่าที่แสดง = ค่าจริง ÷ ${average_cell}</li>
                </ul>
                
                ${basicItemsInfo.length > 0 ? `
                <div class="tw-mt-3 tw-p-3 tw-bg-green-50 tw-rounded">
                    <h5 class="tw-font-bold tw-text-green-700 tw-mb-2">รายละเอียดข้อมูลพื้นฐาน:</h5>
                    <ul class="tw-list-decimal tw-list-inside">
                        ${basicItemsList}
                    </ul>
                </div>
                ` : ''}
            </div>
        ` : '';
        
        return `
            <div class="tw-mt-8 tw-p-6 tw-bg-gradient-to-r tw-from-blue-50 tw-to-purple-50 tw-rounded-xl">
                <h3 class="tw-text-xl tw-font-bold tw-text-gray-800 tw-mb-4">
                    สรุปผลเลขแวดล้อมที่มีอิทธิพลสูง
                    ${showAverage ? '<span class="tw-text-red-600">(ใช้ค่าเฉลี่ย)</span>' : ''}
                </h3>
                
                <div class="tw-mb-6">
                    <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
                        <div class="tw-p-4 tw-bg-white tw-rounded-lg tw-shadow">
                            <h4 class="tw-font-bold tw-text-green-700 tw-mb-3">
                                <i class="fas fa-chart-line tw-mr-2"></i>เลขที่มีอิทธิพลสูงสุด:
                            </h4>
                            <p class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-2">
                                ${influentialNumbers.join(', ') || 'ไม่พบ'}
                            </p>
                            <p class="tw-text-gray-600">ปรากฏ ${maxCount} ครั้ง</p>
                            ${showAverage && average_cell > 0 ? 
                                `<p class="tw-text-xs tw-text-gray-500">ค่าจริง: ${maxCount * average_cell} ครั้ง</p>` 
                                : ''}
                        </div>
                        
                        <div class="tw-p-4 tw-bg-white tw-rounded-lg tw-shadow">
                            <h4 class="tw-font-bold tw-text-red-700 tw-mb-3">
                                <i class="fas fa-exclamation-circle tw-mr-2"></i>เลขที่ขาดหายไป:
                            </h4>
                            <p class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-2">
                                ${missingNumbers.join(', ') || 'ไม่มี'}
                            </p>
                        </div>
                    </div>
                </div>
                
                ${averageSection}
                
                ${surroundingItems.length > 0 ? `
                <div class="tw-mt-6 tw-p-4 tw-bg-gray-50 tw-rounded-lg">
                    <h4 class="tw-font-bold tw-text-gray-700 tw-mb-3">
                        รายการข้อมูลสิ่งแวดล้อมที่ใช้ (${surroundingItems.length} รายการ):
                    </h4>
                    <ul class="tw-list-decimal tw-list-inside tw-pl-4 tw-max-h-60 tw-overflow-y-auto">
                        ${surroundingItemsList}
                    </ul>
                </div>
                ` : ''}
                
                <div class="tw-mt-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                    <h4 class="tw-font-bold tw-text-blue-700 tw-mb-3">
                        <i class="fas fa-info-circle tw-mr-2"></i>ข้อมูลการคำนวณ:
                    </h4>
                    <ul class="tw-list-disc tw-list-inside">
                        <li>ตัวเลขทั้งหมด: ${totalDigits} หลัก</li>
                        <li>ข้อมูลพื้นฐาน: ${basicItemsInfo.length} รายการ</li>
                        <li>ข้อมูลสิ่งแวดล้อม: ${surroundingItems.length} รายการ</li>
                        <li>ค่าเฉลี่ยที่ใช้: ${average_cell > 0 ? average_cell + ' ตาราง' : 'ไม่ใช้'}</li>
                        <li>วิธีคำนวณ: ${average_cell > 0 ? 'หารด้วยค่าเฉลี่ย' : 'นับความถี่ปกติ'}</li>
                        ${showAverage ? '<li class="tw-font-bold tw-text-red-600">หมายเหตุ: ค่าที่แสดงเป็นค่าหลังหารด้วยค่าเฉลี่ยแล้ว</li>' : ''}
                    </ul>
                </div>
            </div>
        `;
    },

    // คำนวณจากข้อมูลใน result (API response)
    _calculateFromResultData(explainedContent, result, resultIndex) {
        console.log('🧮 DEBUG: _calculateFromResultData');
        const data = result.data || {};
        
        // ตรวจสอบว่า API response มี average_cell หรือไม่
        const hasAverage = data.average_cell && data.average_cell > 0;
        const average_cell = data.average_cell || 0;
        
        // ใช้ข้อมูลที่ API คำนวณไว้แล้ว
        const counts = data.pythagorean_square || this._buildPythagoreanSquare(
            data.combined_number_string || '', 
            average_cell
        );
        
        const tableHTML = this._generatePythagoreanTable(counts, hasAverage, average_cell);
        const analysisHTML = this._generateCombinedAnalysis(
            counts, 
            average_cell, 
            data.combined_number_string ? data.combined_number_string.length : 0, 
            data.surrounding_data ? Object.values(data.surrounding_data).filter(v => v && v.trim() !== '') : [],
            hasAverage
        );
        
        explainedContent.innerHTML = `
            <div class="pythagorean-square-container">
                <h2 class="tw-text-2xl tw-font-bold tw-text-purple-800 tw-mb-4">
                    Pythagorean Square (รวมเลขสิ่งแวดล้อม) - ${result.title || `Result ${resultIndex + 1}`}
                </h2>
                
                <div class="tw-mb-6 tw-p-4 tw-bg-green-50 tw-rounded-lg">
                    <p class="tw-font-bold tw-text-green-700">✅ ใช้ข้อมูลจาก API Response</p>
                    <ul class="tw-list-disc tw-list-inside tw-mt-2">
                        <li>ตัวเลขทั้งหมด: ${data.combined_number_string ? data.combined_number_string.length : 'N/A'} หลัก</li>
                        <li>ข้อมูลสิ่งแวดล้อม: ${data.surrounding_data ? Object.keys(data.surrounding_data).length : 0} รายการ</li>
                        <li class="tw-font-bold ${hasAverage ? 'tw-text-red-600' : 'tw-text-gray-600'}">
                            ใช้ค่าเฉลี่ย: ${hasAverage ? `ใช่ (หารด้วย ${average_cell})` : 'ไม่ใช้'}
                        </li>
                    </ul>
                </div>
                
                ${tableHTML}
                ${analysisHTML}
                
                <div class="tw-mt-8 tw-text-center">
                    <button onclick="window.pythagorean.showPythagoreanSquare(${resultIndex}, ${JSON.stringify(result).replace(/"/g, '&quot;')})" 
                            class="tw-bg-blue-500 tw-text-white tw-py-2 tw-px-6 tw-rounded-full hover:tw-bg-blue-600 tw-cursor-pointer">
                        ← กลับไป Pythagorean Square มาตรฐาน
                    </button>
                </div>
            </div>
        `;
    },    
    
    // ดึงข้อมูลสิ่งแวดล้อมจาก storage
    _getSurroundingDataFromStorage() {
        console.log('🔍 DEBUG: _getSurroundingDataFromStorage called');
        const surroundingData = {};
        
        // วิธีที่ 1: ลองดึงจาก API response ใน sessionStorage ก่อน
        try {
            const psychomatrixResult = sessionStorage.getItem('psychomatrixResult');
            if (psychomatrixResult) {
                const analysisData = JSON.parse(psychomatrixResult);
                if (analysisData && analysisData.results) {
                    // หา combined-influence result
                    const combinedResult = analysisData.results.find(r => r.type === 'combined-influence');
                    if (combinedResult && combinedResult.data && combinedResult.data.surrounding_data) {
                        console.log('✅ DEBUG: Found surrounding data in API response');
                        return combinedResult.data.surrounding_data;
                    }
                }
            }
        } catch (error) {
            console.error('❌ DEBUG: Error getting surrounding data from API response:', error);
        }
        
        // วิธีที่ 2: ลองดึงจาก sessionStorage (จาก Psychomatrix.html)
        try {
            const formDataStr = sessionStorage.getItem('psychomatrixFormData');
            if (formDataStr) {
                const formData = JSON.parse(formDataStr);
                console.log('🔍 DEBUG: Found psychomatrixFormData in sessionStorage');
                
                // ดึงข้อมูล surrounding fields (01-20)
                for (let i = 1; i <= 20; i++) {
                    const key = `surrounding_${i.toString().padStart(2, '0')}`;
                    if (formData[key] !== undefined && formData[key] !== null && formData[key].toString().trim() !== '') {
                        surroundingData[key] = formData[key];
                    }
                }
                
                if (Object.keys(surroundingData).length > 0) {
                    console.log(`✅ DEBUG: Found ${Object.keys(surroundingData).length} surrounding fields in sessionStorage`);
                    return surroundingData;
                }
            }
        } catch (error) {
            console.error('❌ DEBUG: Error parsing psychomatrixFormData:', error);
        }
        
        console.log('⚠️ DEBUG: No surrounding data found in any storage');
        return {};
    },

    _convertTextToNumbers(text) {
        if (!text || text.trim() === '') return '';
        
        let numberString = '';
        const cleanedText = text.replace(/\s/g, '');
        
        for (let i = 0; i < cleanedText.length; i++) {
            const char = cleanedText[i];
            const number = this.letterToNumber(char);
            if (number > 0) {
                numberString += number.toString();
            }
        }
        
        return numberString;
    },

    // สร้าง number string จากข้อมูลพื้นฐาน
    _buildNumberString(data) {
        let numberString = '';
        
        // 1. Birth Date
        if (data.birth_date) {
            const birthNumbers = data.birth_date.replace(/[\/: ]/g, '');
            numberString += birthNumbers;
        }
        
        // 2. ID Card
        if (data.id_card) {
            numberString += data.id_card.replace(/\D/g, '');
        }
        
        // 3. Full Name (แปลงเป็นตัวเลข)
        if (data.full_name) {
            const nameNumbers = this.calculateNameNumbers(data.full_name);
            numberString += nameNumbers.numberString;
        } else if (data.number_string) {
            // ถ้ามี number_string จาก API ให้ใช้
            numberString += data.number_string;
        }
        
        // 4. Special numbers (Life Path, Destiny, etc.)
        const lifePathNum = data.life_path_number || data.lifePath;
        const destinyNum = data.destiny_number || data.destiny;
        const karmicNum = data.thirdAndFourth?.karmic || data.karmic;
        const lifeLessonNum = data.thirdAndFourth?.lifeLesson || data.lifeLesson;
        
        [lifePathNum, destinyNum, karmicNum, lifeLessonNum].forEach(num => {
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
        
        return numberString;
    },

    // สร้าง Pythagorean Square (ตาม PHP function buildPythagoreanSquare)
    _buildPythagoreanSquare(numbers, average_cell) {
        const counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0};
        
        // นับความถี่ของตัวเลข 1-9
        for (let i = 0; i < numbers.length; i++) {
            const digit = parseInt(numbers[i]);
            if (digit >= 1 && digit <= 9) {
                counts[digit]++;
            }
        }
        
        // ถ้ามีการใช้ค่าเฉลี่ย
        if (average_cell > 0) {
            for (let i = 1; i <= 9; i++) {
                counts[i] = Math.floor(counts[i] / average_cell);
            }
        }
        
        return counts;
    },

    // สร้างตาราง Pythagorean Square
    _generatePythagoreanTable(counts, showAverage = false, averageValue = 0) {
        // คำนวณผลรวมแถว (ใช้ค่าจริง ไม่ใช่ค่าเฉลี่ย)
        const rowSums = [
            counts[1] + counts[4] + counts[7],
            counts[2] + counts[5] + counts[8],
            counts[3] + counts[6] + counts[9]
        ];
        
        // คำนวณผลรวมคอลัมน์
        const colSums = [
            counts[1] + counts[2] + counts[3],
            counts[4] + counts[5] + counts[6],
            counts[7] + counts[8] + counts[9]
        ];
        
        // คำนวณผลรวมแนวทแยง
        const diagonalLeft = counts[1] + counts[5] + counts[9];
        const diagonalRight = counts[7] + counts[5] + counts[3];
        
        // สร้างข้อความแสดงค่าเฉลี่ย
        const averageNote = showAverage && averageValue > 0 
            ? `<div class="tw-mt-2 tw-text-xs tw-text-blue-600">(หารด้วย ${averageValue})</div>`
            : '';
        
        // สร้างข้อความสำหรับแต่ละเซลล์
        const createCell = (number, count) => {
            const originalCount = count * (showAverage && averageValue > 0 ? averageValue : 1);
            return `
                <div class="cell-${number} tw-bg-${this._getCellColor(number)}-100 tw-border tw-border-${this._getCellColor(number)}-300 tw-rounded tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-2">
                    <div class="tw-font-bold tw-text-lg">${number}</div>
                    <div class="tw-text-sm tw-text-gray-600">(${count})</div>
                    ${showAverage && averageValue > 0 ? 
                        `<div class="tw-text-xs tw-text-gray-500">เดิม: ${originalCount}</div>` 
                        : ''}
                </div>
            `;
        };
        
        return `
            <div class="tw-mb-6">
                <h3 class="tw-text-lg tw-font-bold tw-text-gray-800 tw-mb-3">Pythagorean Square</h3>
                ${averageNote}
                <div class="pythagorean-table tw-grid tw-grid-cols-4 tw-grid-rows-4 tw-gap-2 tw-max-w-md tw-mx-auto">
                    <!-- แถวที่ 1 -->
                    ${createCell(1, counts[1])}
                    ${createCell(4, counts[4])}
                    ${createCell(7, counts[7])}
                    <div class="cell-sum tw-bg-gray-100 tw-border tw-border-gray-300 tw-rounded tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-2">
                        <div class="tw-font-bold tw-text-lg">${rowSums[0]}</div>
                        ${showAverage && averageValue > 0 ? 
                            `<div class="tw-text-xs tw-text-gray-500">เดิม: ${rowSums[0] * averageValue}</div>` 
                            : ''}
                    </div>
                    
                    <!-- แถวที่ 2 -->
                    ${createCell(2, counts[2])}
                    ${createCell(5, counts[5])}
                    ${createCell(8, counts[8])}
                    <div class="cell-sum tw-bg-gray-100 tw-border tw-border-gray-300 tw-rounded tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-2">
                        <div class="tw-font-bold tw-text-lg">${rowSums[1]}</div>
                        ${showAverage && averageValue > 0 ? 
                            `<div class="tw-text-xs tw-text-gray-500">เดิม: ${rowSums[1] * averageValue}</div>` 
                            : ''}
                    </div>
                    
                    <!-- แถวที่ 3 -->
                    ${createCell(3, counts[3])}
                    ${createCell(6, counts[6])}
                    ${createCell(9, counts[9])}
                    <div class="cell-sum tw-bg-gray-100 tw-border tw-border-gray-300 tw-rounded tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-2">
                        <div class="tw-font-bold tw-text-lg">${rowSums[2]}</div>
                        ${showAverage && averageValue > 0 ? 
                            `<div class="tw-text-xs tw-text-gray-500">เดิม: ${rowSums[2] * averageValue}</div>` 
                            : ''}
                    </div>
                    
                    <!-- แถวที่ 4 (ผลรวมคอลัมน์และแนวทแยง) -->
                    <div class="cell-sum tw-bg-gray-200 tw-border tw-border-gray-400 tw-rounded tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-2">
                        <div class="tw-font-bold tw-text-lg">${colSums[0]}</div>
                        ${showAverage && averageValue > 0 ? 
                            `<div class="tw-text-xs tw-text-gray-500">เดิม: ${colSums[0] * averageValue}</div>` 
                            : ''}
                    </div>
                    <div class="cell-sum tw-bg-gray-200 tw-border tw-border-gray-400 tw-rounded tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-2">
                        <div class="tw-font-bold tw-text-lg">${colSums[1]}</div>
                        ${showAverage && averageValue > 0 ? 
                            `<div class="tw-text-xs tw-text-gray-500">เดิม: ${colSums[1] * averageValue}</div>` 
                            : ''}
                    </div>
                    <div class="cell-sum tw-bg-gray-200 tw-border tw-border-gray-400 tw-rounded tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-2">
                        <div class="tw-font-bold tw-text-lg">${colSums[2]}</div>
                        ${showAverage && averageValue > 0 ? 
                            `<div class="tw-text-xs tw-text-gray-500">เดิม: ${colSums[2] * averageValue}</div>` 
                            : ''}
                    </div>
                    <div class="cell-sum tw-bg-gray-300 tw-border tw-border-gray-500 tw-rounded tw-flex tw-flex-col tw-justify-center tw-items-center tw-p-2">
                        <div class="tw-font-bold tw-text-lg">${diagonalLeft}/${diagonalRight}</div>
                        ${showAverage && averageValue > 0 ? 
                            `<div class="tw-text-xs tw-text-gray-500">เดิม: ${diagonalLeft * averageValue}/${diagonalRight * averageValue}</div>` 
                            : ''}
                    </div>
                </div>
                
                <div class="tw-mt-4 tw-text-center tw-text-sm tw-text-gray-600">
                    <p>คอลัมน์ 4 = ผลรวมแถว | แถว 4 = ผลรวมคอลัมน์ | (4,4) = แนวทแยงซ้าย/ขวา</p>
                    ${showAverage && averageValue > 0 ? 
                        `<p class="tw-text-blue-600 tw-font-semibold">* แสดงค่าเฉลี่ยที่หารด้วย ${averageValue}</p>` 
                        : ''}
                </div>
            </div>
        `;
    },

    // ฟังก์ชันช่วยกำหนดสีของเซลล์
    _getCellColor(number) {
        const colorMap = {
            1: 'red',
            2: 'orange',
            3: 'yellow',
            4: 'blue',
            5: 'green',
            6: 'teal',
            7: 'purple',
            8: 'pink',
            9: 'indigo'
        };
        return colorMap[number] || 'gray';
    },


    // สร้างการวิเคราะห์พื้นฐาน
    _generateAnalysis(counts) {
        const maxCount = Math.max(...Object.values(counts));
        const influentialNumbers = [];
        const missingNumbers = [];
        
        for (let i = 1; i <= 9; i++) {
            if (counts[i] === maxCount) influentialNumbers.push(i);
            if (counts[i] === 0) missingNumbers.push(i);
        }
        
        return `
            <div class="tw-mt-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                <h3 class="tw-text-lg tw-font-bold tw-text-blue-800 tw-mb-2">สรุปผลเลขแวดล้อมที่มีอิทธิพลสูง</h3>
                <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                    <div>
                        <h4 class="tw-font-bold tw-text-green-700">เลขที่มีอิทธิพลสูงสุด:</h4>
                        <p class="tw-text-gray-700">${influentialNumbers.join(', ') || 'ไม่พบ'} (ปรากฏ ${maxCount} ครั้ง)</p>
                    </div>
                    <div>
                        <h4 class="tw-font-bold tw-text-red-700">เลขที่ขาดหายไป:</h4>
                        <p class="tw-text-gray-700">${missingNumbers.join(', ') || 'ไม่มี'}</p>
                    </div>
                </div>
            </div>
        `;
    },

    // สร้างการวิเคราะห์แบบรวม
    _generateCombinedAnalysis(counts, average_cell, totalDigits, surroundingItems) {
        const maxCount = Math.max(...Object.values(counts));
        const influentialNumbers = [];
        const missingNumbers = [];
        
        for (let i = 1; i <= 9; i++) {
            if (counts[i] === maxCount) influentialNumbers.push(i);
            if (counts[i] === 0) missingNumbers.push(i);
        }
        
        // สร้างรายการข้อมูลสิ่งแวดล้อม
        let surroundingItemsList = '';
        if (Array.isArray(surroundingItems)) {
            surroundingItems.forEach((item, index) => {
                if (item && item.trim() !== '') {
                    surroundingItemsList += `
                        <li class="tw-mb-2">
                            <span class="tw-font-semibold">รายการที่ ${index + 1}:</span>
                            <span class="tw-text-gray-700">${item.substring(0, 50)}${item.length > 50 ? '...' : ''}</span>
                        </li>
                    `;
                }
            });
        }
        
        return `
            <div class="tw-mt-8 tw-p-6 tw-bg-gradient-to-r tw-from-blue-50 tw-to-purple-50 tw-rounded-xl">
                <h3 class="tw-text-xl tw-font-bold tw-text-gray-800 tw-mb-4">
                    สรุปผลเลขแวดล้อมที่มีอิทธิพลสูง
                </h3>
                
                <div class="tw-mb-6">
                    <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-2 tw-gap-6">
                        <div class="tw-p-4 tw-bg-white tw-rounded-lg tw-shadow">
                            <h4 class="tw-font-bold tw-text-green-700 tw-mb-3">
                                <i class="fas fa-chart-line tw-mr-2"></i>เลขที่มีอิทธิพลสูงสุด:
                            </h4>
                            <p class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-2">
                                ${influentialNumbers.join(', ') || 'ไม่พบ'}
                            </p>
                            <p class="tw-text-gray-600">ปรากฏ ${maxCount} ครั้ง</p>
                        </div>
                        
                        <div class="tw-p-4 tw-bg-white tw-rounded-lg tw-shadow">
                            <h4 class="tw-font-bold tw-text-red-700 tw-mb-3">
                                <i class="fas fa-exclamation-circle tw-mr-2"></i>เลขที่ขาดหายไป:
                            </h4>
                            <p class="tw-text-2xl tw-font-bold tw-text-gray-800 tw-mb-2">
                                ${missingNumbers.join(', ') || 'ไม่มี'}
                            </p>
                        </div>
                    </div>
                </div>
                
                ${surroundingItems.length > 0 ? `
                <div class="tw-mt-6 tw-p-4 tw-bg-gray-50 tw-rounded-lg">
                    <h4 class="tw-font-bold tw-text-gray-700 tw-mb-3">
                        รายการข้อมูลสิ่งแวดล้อมที่ใช้ (${surroundingItems.length} รายการ):
                    </h4>
                    <ul class="tw-list-decimal tw-list-inside tw-pl-4 tw-max-h-60 tw-overflow-y-auto">
                        ${surroundingItemsList}
                    </ul>
                </div>
                ` : ''}
                
                <div class="tw-mt-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                    <h4 class="tw-font-bold tw-text-blue-700 tw-mb-3">
                        <i class="fas fa-info-circle tw-mr-2"></i>ข้อมูลการคำนวณ:
                    </h4>
                    <ul class="tw-list-disc tw-list-inside">
                        <li>ตัวเลขทั้งหมด: ${totalDigits} หลัก</li>
                        <li>ค่าเฉลี่ยที่ใช้: ${average_cell > 0 ? average_cell + ' ตาราง' : 'ไม่ใช้'}</li>
                        <li>วิธีคำนวณ: ${average_cell > 0 ? 'หารด้วยค่าเฉลี่ย' : 'นับความถี่ปกติ'}</li>
                    </ul>
                </div>
            </div>
        `;
    },

    // ฟังก์ชันช่วยสำหรับ debug
    testFunction() {
        console.log('✅ DEBUG: pythagorean.js functions are working');
        console.log('Available functions:', Object.keys(this));
    }
};

// Expose to global scope
window.pythagorean = pythagorean;

console.log('✅ DEBUG: pythagorean.js v9.2 loaded successfully with storage fix');

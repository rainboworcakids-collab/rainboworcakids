// pythagorean.js - Pythagorean Square calculations (Multi-mode Support)
console.log('🚀 DEBUG: pythagorean.js loaded v10.1 - Multi-mode Support');

const pythagorean = {
    // เก็บ option ที่เลือก (จะถูกตั้งค่าใน result.js)
    calculationOption: 'Num-Ard', // ค่าเริ่มต้น: Num-Ard
    
    // ตั้งค่า option
    setCalculationOption(option) {
        this.calculationOption = option;
        console.log(`✅ DEBUG: Calculation option set to: ${option}`);
    },
    
    // โหลด RootNumber.json
    async loadRootNumberData() {
        if (window.rootNumberData) {
            console.log('✅ DEBUG: RootNumber.json already loaded');
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

        let upperLetter = letter.toUpperCase();
        
        if (thaiToEnglishMap[letter]) {
            upperLetter = thaiToEnglishMap[letter];
        }
        
        return map[upperLetter] || 0;
    },

    // คำนวณ Destiny Number
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

    // แปลงชื่อเป็นตัวเลข
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
        
        const thirdAndFourth = this._calculateThirdAndFourthNumbers(numberString, destiny);
        
        return {
            destiny: destiny,
            lifePath: lifePath,
            karmic: thirdAndFourth.karmic,
            lifeLesson: thirdAndFourth.lifeLesson,
            numberString: numberString
        };
    },

    // คำนวณ Third and Fourth Numbers
    _calculateThirdAndFourthNumbers(input, destinyNumber) {
        const firstDigit = parseInt(input[0]);
        let karmicNumber = destinyNumber - (2 * firstDigit);
        karmicNumber = karmicNumber < 0 ? 0 : karmicNumber;
        
        let lifeLessonNumber = karmicNumber;
        
        if (karmicNumber === 11 || karmicNumber === 22) {
            return {
                karmic: karmicNumber,
                lifeLesson: karmicNumber
            };
        }
        
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
        console.log(`📊 DEBUG: Current calculation option: ${this.calculationOption}`);
        
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
        console.log(`🧮 DEBUG: Calculation option: ${this.calculationOption}`);
        
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
                // ตรวจสอบ option และเลือกวิธีการคำนวณ
                if (this.calculationOption === 'Num-Ard') {
                    await this._calculateNumArdSquare(explainedContent, result, resultIndex);
                } else if (this.calculationOption === 'BD-IDC') {
                    await this._calculateBDIDCSquare(explainedContent, result, resultIndex);
                } else if (this.calculationOption === 'BD-IDC-FullName') {
                    await this._calculateBDIDCFullNameSquare(explainedContent, result, resultIndex);
                } else {
                    // ค่าเริ่มต้น: Num-Ard
                    await this._calculateNumArdSquare(explainedContent, result, resultIndex);
                }
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

    // ดึงข้อมูล
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

    // ===== โหมดการคำนวณต่าง ๆ =====
    
    // 1. คำนวณแบบพื้นฐาน (ไม่ใช้ค่าเฉลี่ย)
    _calculateBasicSquare(explainedContent, result, resultIndex) {
        console.log(`📊 DEBUG: _calculateBasicSquare for ${result.type}`);
        const data = result.data || {};
        const lifePathNum = data.life_path_number || data.lifePath;
        const destinyNum = data.destiny_number || data.destiny;
        
        let numberString = this._buildNumberString(data);
        
        console.log(`🔢 DEBUG: Basic number string: ${numberString} (${numberString.length} digits)`);
        
        const counts = this._buildPythagoreanSquare(numberString, 0);
        const tableHTML = this._generatePythagoreanTable(counts, false, 0);
        const analysisHTML = this._generateAnalysis(counts, 0);
        
        let combinedButtonText = 'Pythagorean Square (รวมเลขสิ่งแวดล้อม)';
        if (this.calculationOption === 'BD-IDC') {
            combinedButtonText = 'Pythagorean Square (ค่าเฉลี่ย2ตาราง)';
        } else if (this.calculationOption === 'BD-IDC-FullName') {
            combinedButtonText = 'Pythagorean Square (ค่าเฉลี่ย3ตาราง)';
        }
        
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
                        ${combinedButtonText}
                    </button>
                </div>
            </div>
        `;
    },

    // 2. โหมด Num-Ard (รวมทุกตัวเลขรอบตัว + 20 รายการ)
    async _calculateNumArdSquare(explainedContent, result, resultIndex) {
        console.log('📊 DEBUG: _calculateNumArdSquare - Num-Ard Mode');
        
        // ตรวจสอบว่าผลลัพธ์นี้เป็น combined-influence หรือมี surrounding_data หรือไม่
        if (result.type === 'combined-influence' || (result.data && result.data.surrounding_data)) {
            console.log('✅ DEBUG: Using combined-influence data from API response');
            this._calculateFromResultData(explainedContent, result, resultIndex);
            return;
        }
        
        console.log('🔄 DEBUG: Calculating Num-Ard square from ALL basic data + surroundings');
        
        const analysisData = this._getAnalysisData();
        if (!analysisData) {
            this._showError(explainedContent, null, 'ไม่พบข้อมูลการวิเคราะห์');
            return;
        }
        
        // ดึงข้อมูลพื้นฐานทั้งหมด
        const birthDateResult = analysisData.results.find(r => r.type === 'birth-date');
        const idCardResult = analysisData.results.find(r => r.type === 'id-card');
        const fullNameResult = analysisData.results.find(r => r.type === 'full-name');
        
        console.log('🔍 DEBUG: Found results:', {
            birthDate: !!birthDateResult,
            idCard: !!idCardResult,
            fullName: !!fullNameResult
        });
        
        let combinedNumberString = '';
        let basicItemCount = 0;
        let basicItemsInfo = [];
        
        // Birth Date
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
        }
        
        // ID Card
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
        }
        
        // Full Name
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
        }
        
        console.log(`🔢 DEBUG: Basic combined string: ${combinedNumberString} (${combinedNumberString.length} digits)`);
        
        // ดึงข้อมูลสิ่งแวดล้อม
        const surroundingData = this._getSurroundingDataFromStorage();
        console.log(`🔍 DEBUG: Surrounding data items: ${Object.keys(surroundingData).length}`);
        
        let surroundingItems = [];
        Object.keys(surroundingData).forEach(key => {
            const value = surroundingData[key];
            if (value && value.trim() !== '') {
                surroundingItems.push(value);
                const numbers = this._convertTextToNumbers(value);
                combinedNumberString += numbers;
            }
        });
        
        const average_cell = basicItemCount + surroundingItems.length;
        
        console.log(`✅ DEBUG: Num-Ard calculation:`);
        console.log(`  - Basic items: ${basicItemCount}`);
        console.log(`  - Surrounding items: ${surroundingItems.length}`);
        console.log(`  - Total items: ${average_cell}`);
        console.log(`  - Total digits: ${combinedNumberString.length}`);
        
        const counts = this._buildPythagoreanSquare(combinedNumberString, average_cell);
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
                    Pythagorean Square (รวมเลขสิ่งแวดล้อม) - Num-Ard Mode
                </h2>
                
                <div class="tw-mb-6 tw-p-4 tw-bg-yellow-50 tw-rounded-lg">
                    <p class="tw-font-bold tw-text-yellow-700">🧲 Num-Ard Calculation with Average</p>
                    <ul class="tw-list-disc tw-list-inside tw-mt-2">
                        <li>ตัวเลขทั้งหมด: ${combinedNumberString.length} หลัก</li>
                        <li>ข้อมูลพื้นฐาน: ${basicItemCount} รายการ</li>
                        <li>ข้อมูลสิ่งแวดล้อม: ${surroundingItems.length} รายการ</li>
                        <li class="tw-font-bold tw-text-red-600">ใช้ค่าเฉลี่ย: ใช่ (หารด้วย ${average_cell})</li>
                    </ul>
                </div>
                
                ${tableHTML}
                ${analysisHTML}
                
                <div class="tw-mt-8 tw-text-center">
                    <button onclick="window.pythagorean.showPythagoreanSquare(${resultIndex})" 
                            class="tw-bg-blue-500 tw-text-white tw-py-2 tw-px-6 tw-rounded-full hover:tw-bg-blue-600 tw-cursor-pointer">
                        ← กลับไป Pythagorean Square มาตรฐาน
                    </button>
                </div>
            </div>
        `;
    },

// ===== เพิ่มฟังก์ชันคำนวณค่าเฉลี่ยแบบแยกตาราง =====
_buildPythagoreanSquareAverage: function(numberStringsArray, average_cell) {
    console.log('🧮 DEBUG: Building Pythagorean Square with cell-by-cell average');
    console.log('🧮 DEBUG: Number of tables:', numberStringsArray.length);
    console.log('🧮 DEBUG: Average cell:', average_cell);
    
    // เริ่มต้น counts สำหรับแต่ละตาราง
    const tableCounts = [];
    
    // สร้าง counts สำหรับแต่ละตาราง
    for (let i = 0; i < numberStringsArray.length; i++) {
        const counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0};
        const numbers = numberStringsArray[i];
        
        for (let j = 0; j < numbers.length; j++) {
            const digit = parseInt(numbers[j]);
            if (digit >= 1 && digit <= 9) {
                counts[digit]++;
            }
        }
        
        tableCounts.push(counts);
        console.log(`📊 DEBUG: Table ${i+1} counts:`, counts);
    }
    
    // สร้างผลลัพธ์เฉลี่ย
    const averageCounts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0};
    
    // บวกค่าทั้งหมดจากทุกตาราง
    for (let i = 1; i <= 9; i++) {
        let sum = 0;
        for (let j = 0; j < tableCounts.length; j++) {
            sum += tableCounts[j][i];
        }
        
        // คำนวณค่าเฉลี่ย
        if (average_cell > 0) {
            averageCounts[i] = Math.floor(sum / average_cell);
        } else {
            averageCounts[i] = sum;
        }
        
        console.log(`🔢 DEBUG: Cell ${i}: ${sum} / ${average_cell} = ${averageCounts[i]}`);
    }
    
    return averageCounts;
},

    // 3. โหมด BD-IDC (Birth Date + ID Card เฉลี่ย 2 ตาราง)
    async _calculateBDIDCSquare(explainedContent, result, resultIndex) {
    console.log('📊 DEBUG: _calculateBDIDCSquare - BD-IDC Mode');
    
    const analysisData = this._getAnalysisData();
    if (!analysisData) {
        this._showError(explainedContent, null, 'ไม่พบข้อมูลการวิเคราะห์');
        return;
    }
    
    // ดึงข้อมูลเฉพาะ Birth Date และ ID Card
    const birthDateResult = analysisData.results.find(r => r.type === 'birth-date');
    const idCardResult = analysisData.results.find(r => r.type === 'id-card');
    
    console.log('🔍 DEBUG: Found results for BD-IDC:', {
        birthDate: !!birthDateResult,
        idCard: !!idCardResult
    });
    
    if (!birthDateResult || !idCardResult) {
        this._showError(explainedContent, null, 'ไม่พบข้อมูล Birth Date หรือ ID Card');
        return;
    }
    
    // แยกสร้าง number string สำหรับแต่ละตาราง
    let birthDateNumbers = '';
    let idCardNumbers = '';
    let basicItemsInfo = [];
    
    // Birth Date
    if (birthDateResult && birthDateResult.data) {
        const birthData = birthDateResult.data;
        birthDateNumbers = this._buildNumberString(birthData);
        basicItemsInfo.push({
            type: 'Birth Date',
            lifepath: birthData.life_path_number || birthData.lifePath,
            destiny: birthData.destiny_number || birthData.destiny,
            digits: birthDateNumbers.length
        });
    }
    
    // ID Card
    if (idCardResult && idCardResult.data) {
        const idCardData = idCardResult.data;
        idCardNumbers = this._buildNumberString(idCardData);
        basicItemsInfo.push({
            type: 'ID Card',
            lifepath: idCardData.life_path_number || idCardData.lifePath,
            destiny: idCardData.destiny_number || idCardData.destiny,
            digits: idCardNumbers.length
        });
    }
    
    console.log(`🔢 DEBUG: Birth Date numbers: ${birthDateNumbers} (${birthDateNumbers.length} digits)`);
    console.log(`🔢 DEBUG: ID Card numbers: ${idCardNumbers} (${idCardNumbers.length} digits)`);
    
    // รวมตัวเลขทั้งสองชุดสำหรับการคำนวณแบบปกติ
    const combinedNumberString = birthDateNumbers + idCardNumbers;
    
    // คำนวณค่าเฉลี่ย (หารด้วย 2) แบบ cell-by-cell
    const average_cell = 2;
    
    // ใช้ฟังก์ชันคำนวณค่าเฉลี่ยแบบใหม่
    const counts = this._buildPythagoreanSquareAverage([birthDateNumbers, idCardNumbers], average_cell);
    
    console.log(`✅ DEBUG: BD-IDC calculation (cell-by-cell average):`);
    console.log('  - Tables: 2 (Birth Date, ID Card)');
    console.log(`  - Average cell: ${average_cell}`);
    console.log(`  - Total digits: ${combinedNumberString.length}`);
    console.log('  - Final counts:', counts);
    
    const tableHTML = this._generatePythagoreanTable(counts, true, average_cell);
    const analysisHTML = this._generateCombinedAnalysis(
        counts, 
        average_cell, 
        combinedNumberString.length, 
        [],
        true,
        basicItemsInfo
    );
    
    explainedContent.innerHTML = `
        <div class="pythagorean-square-container">
            <h2 class="tw-text-2xl tw-font-bold tw-text-green-800 tw-mb-4">
                Pythagorean Square (ค่าเฉลี่ย2ตาราง) - BD-IDC Mode
            </h2>
            
            <div class="tw-mb-6 tw-p-4 tw-bg-green-50 tw-rounded-lg">
                <p class="tw-font-bold tw-text-green-700">📊 BD-IDC Calculation (Birth Date + ID Card)</p>
                <ul class="tw-list-disc tw-list-inside tw-mt-2">
                    <li>ตัวเลขทั้งหมด: ${combinedNumberString.length} หลัก</li>
                    <li>ข้อมูลที่ใช้: Birth Date และ ID Card</li>
                    <li class="tw-font-bold tw-text-red-600">ใช้ค่าเฉลี่ย: ใช่ (หารด้วย ${average_cell})</li>
                    <li>สูตร: cell1 = (cell1 ของตารางวันเกิด + cell1 ของตารางบัตรประชาชน) ÷ 2</li>
                    <li>จำนวนตาราง: 2 ตาราง</li>
                </ul>
                
                <div class="tw-mt-4 tw-p-3 tw-bg-blue-50 tw-rounded">
                    <h4 class="tw-font-bold tw-text-blue-700 tw-mb-2">รายละเอียดการคำนวณ:</h4>
                    <ul class="tw-list-decimal tw-list-inside">
                        <li>Birth Date: ${birthDateNumbers.length} หลัก</li>
                        <li>ID Card: ${idCardNumbers.length} หลัก</li>
                        <li>รวมตัวเลข: ${combinedNumberString.length} หลัก</li>
                        <li>วิธีคำนวณ: หารด้วย ${average_cell}</li>
                    </ul>
                </div>
            </div>
            
            ${tableHTML}
            ${analysisHTML}
            
            <div class="tw-mt-8 tw-text-center">
                <button onclick="window.pythagorean.showPythagoreanSquare(${resultIndex})" 
                        class="tw-bg-blue-500 tw-text-white tw-py-2 tw-px-6 tw-rounded-full hover:tw-bg-blue-600 tw-cursor-pointer">
                    ← กลับไป Pythagorean Square มาตรฐาน
                </button>
            </div>
        </div>
    `;
},

    // 4. โหมด BD-IDC-FullName (Birth Date + ID Card + Full Name เฉลี่ย 3 ตาราง)
    async _calculateBDIDCFullNameSquare(explainedContent, result, resultIndex) {
        console.log('📊 DEBUG: _calculateBDIDCFullNameSquare - BD-IDC-FullName Mode');
        
        const analysisData = this._getAnalysisData();
        if (!analysisData) {
            this._showError(explainedContent, null, 'ไม่พบข้อมูลการวิเคราะห์');
            return;
        }
        
        // ดึงข้อมูล Birth Date, ID Card และ Full Name
        const birthDateResult = analysisData.results.find(r => r.type === 'birth-date');
        const idCardResult = analysisData.results.find(r => r.type === 'id-card');
        const fullNameResult = analysisData.results.find(r => r.type === 'full-name');
        
        console.log('🔍 DEBUG: Found results for BD-IDC-FullName:', {
            birthDate: !!birthDateResult,
            idCard: !!idCardResult,
            fullName: !!fullNameResult
        });
        
        if (!birthDateResult || !idCardResult || !fullNameResult) {
            this._showError(explainedContent, null, 'ไม่พบข้อมูลครบถ้วน (Birth Date, ID Card, Full Name)');
            return;
        }
        
        // แยกสร้าง number string สำหรับแต่ละตาราง
        let birthDateNumbers = '';
        let idCardNumbers = '';
        let fullNameNumbers = '';
        let basicItemsInfo = [];
        
        // Birth Date
        if (birthDateResult && birthDateResult.data) {
            const birthData = birthDateResult.data;
            birthDateNumbers = this._buildNumberString(birthData);
            basicItemsInfo.push({
                type: 'Birth Date',
                lifepath: birthData.life_path_number || birthData.lifePath,
                destiny: birthData.destiny_number || birthData.destiny,
                digits: birthDateNumbers.length
            });
        }
        
        // ID Card
        if (idCardResult && idCardResult.data) {
            const idCardData = idCardResult.data;
            idCardNumbers = this._buildNumberString(idCardData);
            basicItemsInfo.push({
                type: 'ID Card',
                lifepath: idCardData.life_path_number || idCardData.lifePath,
                destiny: idCardData.destiny_number || idCardData.destiny,
                digits: idCardNumbers.length
            });
        }
        
        // Full Name
        if (fullNameResult && fullNameResult.data) {
            const fullNameData = fullNameResult.data;
            fullNameNumbers = this._buildNumberString(fullNameData);
            basicItemsInfo.push({
                type: 'Full Name',
                lifepath: fullNameData.life_path_number || fullNameData.lifePath,
                destiny: fullNameData.destiny_number || fullNameData.destiny,
                digits: fullNameNumbers.length
            });
        }
        
        console.log(`🔢 DEBUG: Birth Date numbers: ${birthDateNumbers} (${birthDateNumbers.length} digits)`);
        console.log(`🔢 DEBUG: ID Card numbers: ${idCardNumbers} (${idCardNumbers.length} digits)`);
        console.log(`🔢 DEBUG: Full Name numbers: ${fullNameNumbers} (${fullNameNumbers.length} digits)`);
        
        // รวมตัวเลขทั้งสามชุดสำหรับการคำนวณแบบปกติ
        const combinedNumberString = birthDateNumbers + idCardNumbers + fullNameNumbers;
        
        // คำนวณค่าเฉลี่ย (หารด้วย 3) แบบ cell-by-cell
        const average_cell = 3;
        
        // ใช้ฟังก์ชันคำนวณค่าเฉลี่ยแบบใหม่
        const counts = this._buildPythagoreanSquareAverage(
            [birthDateNumbers, idCardNumbers, fullNameNumbers], 
            average_cell
        );
        
        console.log(`✅ DEBUG: BD-IDC-FullName calculation (cell-by-cell average):`);
        console.log('  - Tables: 3 (Birth Date, ID Card, Full Name)');
        console.log(`  - Average cell: ${average_cell}`);
        console.log(`  - Total digits: ${combinedNumberString.length}`);
        console.log('  - Final counts:', counts);
        
        const tableHTML = this._generatePythagoreanTable(counts, true, average_cell);
        const analysisHTML = this._generateCombinedAnalysis(
            counts, 
            average_cell, 
            combinedNumberString.length, 
            [],
            true,
            basicItemsInfo
        );
        
        explainedContent.innerHTML = `
            <div class="pythagorean-square-container">
                <h2 class="tw-text-2xl tw-font-bold tw-text-indigo-800 tw-mb-4">
                    Pythagorean Square (ค่าเฉลี่ย3ตาราง) - BD-IDC-FullName Mode
                </h2>
                
                <div class="tw-mb-6 tw-p-4 tw-bg-indigo-50 tw-rounded-lg">
                    <p class="tw-font-bold tw-text-indigo-700">📊 BD-IDC-FullName Calculation (Birth Date + ID Card + Full Name)</p>
                    <ul class="tw-list-disc tw-list-inside tw-mt-2">
                        <li>ตัวเลขทั้งหมด: ${combinedNumberString.length} หลัก</li>
                        <li>ข้อมูลที่ใช้: Birth Date, ID Card และ Full Name</li>
                        <li class="tw-font-bold tw-text-red-600">ใช้ค่าเฉลี่ย: ใช่ (หารด้วย ${average_cell})</li>
                        <li>สูตร: cell1 = (cell1 ของตารางวันเกิด + cell1 ของตารางบัตรประชาชน + cell1 ของตารางชื่อสกุล) ÷ 3</li>
                        <li>จำนวนตาราง: 3 ตาราง</li>
                    </ul>
                    
                    <div class="tw-mt-4 tw-p-3 tw-bg-blue-50 tw-rounded">
                        <h4 class="tw-font-bold tw-text-blue-700 tw-mb-2">รายละเอียดการคำนวณ:</h4>
                        <ul class="tw-list-decimal tw-list-inside">
                            <li>Birth Date: ${birthDateNumbers.length} หลัก</li>
                            <li>ID Card: ${idCardNumbers.length} หลัก</li>
                            <li>Full Name: ${fullNameNumbers.length} หลัก</li>
                            <li>รวมตัวเลข: ${combinedNumberString.length} หลัก</li>
                            <li>วิธีคำนวณ: หารด้วย ${average_cell}</li>
                        </ul>
                    </div>
                </div>
                
                ${tableHTML}
                ${analysisHTML}
                
                <div class="tw-mt-8 tw-text-center">
                    <button onclick="window.pythagorean.showPythagoreanSquare(${resultIndex})" 
                            class="tw-bg-blue-500 tw-text-white tw-py-2 tw-px-6 tw-rounded-full hover:tw-bg-blue-600 tw-cursor-pointer">
                        ← กลับไป Pythagorean Square มาตรฐาน
                    </button>
                </div>
            </div>
        `;
    },

    // 5. คำนวณจากข้อมูลใน result (API response)
    _calculateFromResultData(explainedContent, result, resultIndex) {
        console.log('🧮 DEBUG: _calculateFromResultData');
        const data = result.data || {};
        
        const hasAverage = data.average_cell && data.average_cell > 0;
        const average_cell = data.average_cell || 0;
        
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

    // ===== ฟังก์ชันช่วยเหลือ =====
    
    // ดึงข้อมูลสิ่งแวดล้อมจาก storage
    _getSurroundingDataFromStorage() {
        console.log('🔍 DEBUG: _getSurroundingDataFromStorage called');
        const surroundingData = {};
        
        try {
            const psychomatrixResult = sessionStorage.getItem('psychomatrixResult');
            if (psychomatrixResult) {
                const analysisData = JSON.parse(psychomatrixResult);
                if (analysisData && analysisData.results) {
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
        
        try {
            const formDataStr = sessionStorage.getItem('psychomatrixFormData');
            if (formDataStr) {
                const formData = JSON.parse(formDataStr);
                console.log('🔍 DEBUG: Found psychomatrixFormData in sessionStorage');
                
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

    _buildNumberString(data) {
        let numberString = '';
        
        if (data.birth_date) {
            const birthNumbers = data.birth_date.replace(/[\/: ]/g, '');
            numberString += birthNumbers;
        }
        
        if (data.id_card) {
            numberString += data.id_card.replace(/\D/g, '');
        }
        
        if (data.full_name) {
            const nameNumbers = this.calculateNameNumbers(data.full_name);
            numberString += nameNumbers.numberString;
        } else if (data.number_string) {
            numberString += data.number_string;
        }
        
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

    _buildPythagoreanSquare(numbers, average_cell) {
        const counts = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0};
        
        for (let i = 0; i < numbers.length; i++) {
            const digit = parseInt(numbers[i]);
            if (digit >= 1 && digit <= 9) {
                counts[digit]++;
            }
        }
        
        if (average_cell > 0) {
            for (let i = 1; i <= 9; i++) {
                counts[i] = Math.floor(counts[i] / average_cell);
            }
        }
        
        return counts;
    },

    _generatePythagoreanTable(counts, showAverage = false, averageValue = 0) {
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
        
        const averageNote = showAverage && averageValue > 0 
            ? `<div class="tw-mt-2 tw-text-xs tw-text-blue-600">(หารด้วย ${averageValue})</div>`
            : '';
        
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
                    
                    <!-- แถวที่ 4 -->
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

    _generateCombinedAnalysis(counts, average_cell, totalDigits, surroundingItems, showAverage = false, basicItemsInfo = []) {
        const maxCount = Math.max(...Object.values(counts));
        const influentialNumbers = [];
        const missingNumbers = [];
        
        for (let i = 1; i <= 9; i++) {
            if (counts[i] === maxCount) influentialNumbers.push(i);
            if (counts[i] === 0) missingNumbers.push(i);
        }
        
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
                    <li>ทุกค่าในตารางถูกหารด้วย ${average_cell}</li>
                    <li class="tw-font-bold tw-text-red-600">ค่าที่แสดง = ค่าจริง ÷ ${average_cell}</li>
                </ul>
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
                
                ${basicItemsInfo.length > 0 ? `
                <div class="tw-mt-6 tw-p-4 tw-bg-green-50 tw-rounded-lg">
                    <h4 class="tw-font-bold tw-text-green-700 tw-mb-3">
                        รายการข้อมูลพื้นฐานที่ใช้ (${basicItemsInfo.length} รายการ):
                    </h4>
                    <ul class="tw-list-decimal tw-list-inside tw-pl-4">
                        ${basicItemsList}
                    </ul>
                </div>
                ` : ''}
                
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
            </div>
        `;
    },

    testFunction() {
        console.log('✅ DEBUG: pythagorean.js v10 functions are working');
        console.log('Calculation option:', this.calculationOption);
        console.log('Available functions:', Object.keys(this));
    }
};

window.pythagorean = pythagorean;
console.log('✅ DEBUG: pythagorean.js v10.1 loaded successfully with multi-mode support');
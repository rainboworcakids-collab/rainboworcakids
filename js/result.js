// pythagorean.js - Pythagorean Square calculations using Edge Function

console.log('🚀 DEBUG: pythagorean.js เริ่มโหลด');

try {
    // ===== Edge Function Configuration =====
    const EDGE_FUNCTION_URL = 'https://oibubvhuiuurkxhnefsw.supabase.co/functions/v1/psychomatrix-pythagorean';

    // Create global namespace for pythagorean functions
    const pythagorean = {
        // Show Pythagorean Square
        showPythagoreanSquare: async function(resultIndex) {
            console.log(`📊 DEBUG: Showing Pythagorean Square for result ${resultIndex}`);
            await this._calculatePythagoreanSquare(resultIndex, 'basic');
        },

        // Show Combined Pythagorean Square
        showCombinedPythagoreanSquare: async function(resultIndex) {
            console.log(`📊 DEBUG: Showing Combined Pythagorean Square for result ${resultIndex}`);
            await this._calculatePythagoreanSquare(resultIndex, 'combined');
        },

        // Main calculation function using Edge Function
        _calculatePythagoreanSquare: async function(resultIndex, calculationType) {
            const explainedContent = document.getElementById('explainedContent');
            const explainedButton = document.querySelector('.tablink:nth-child(2)');
            
            // ตรวจสอบว่ามีข้อมูลหรือไม่ (ใช้ฟังก์ชันตรวจสอบใหม่)
            const analysisData = this._getAnalysisData();
            
            if (!analysisData) {
                explainedContent.innerHTML = `
                    <div class="tw-text-center tw-py-8 tw-text-red-500">
                        <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                        <p class="tw-font-bold">No analysis data available</p>
                        <p class="tw-text-sm">Please analyze your data first on the Psychomatrix page</p>
                        <button onclick="window.location.href='Psychomatrix.html'" 
                                class="tw-mt-4 tw-bg-blue-500 hover:tw-bg-blue-600 tw-text-white tw-font-bold tw-py-2 tw-px-6 tw-rounded">
                            Go to Input Form
                        </button>
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
            } else if (analysisData.data) {
                result = {
                    data: analysisData.data,
                    title: 'Analysis Result',
                    type: 'full-name'
                };
                title = 'Analysis Result';
            }
            
            if (!result) {
                explainedContent.innerHTML = `
                    <div class="tw-text-center tw-py-8 tw-text-red-500">
                        <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                        <p class="tw-font-bold">No Pythagorean Square data available</p>
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
                    <p class="tw-text-sm tw-text-gray-500">Using Edge Function: ${calculationType} calculation</p>
                </div>
            `;
            window.switchTab('Explained', explainedButton);
            
            try {
                // สร้าง request body สำหรับ Edge Function
                const requestBody = {
                    result_data: {
                        type: result.type || 'full-name',
                        data: result.data
                    },
                    calculation_type: calculationType
                };
                
                // ถ้าเป็น combined type ให้ดึงข้อมูล surrounding numbers
                if (calculationType === 'combined') {
                    const surroundingNumbers = localStorage.getItem('lifePathSurroundingNumbers');
                    if (surroundingNumbers) {
                        try {
                            requestBody.surrounding_data = JSON.parse(surroundingNumbers);
                            console.log('✅ DEBUG: Added surrounding data to request');
                        } catch (error) {
                            console.error('❌ DEBUG: Error parsing surrounding numbers:', error);
                        }
                    }
                }
                
                console.log('📤 DEBUG: Sending request to Edge Function:', requestBody);
                
                // เรียก Edge Function
                const response = await fetch(EDGE_FUNCTION_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });
                
                if (!response.ok) {
                    throw new Error(`Edge Function returned ${response.status}: ${response.statusText}`);
                }
                
                const edgeResult = await response.json();
                console.log('📥 DEBUG: Edge Function response:', edgeResult);
                
                if (!edgeResult.success) {
                    throw new Error(edgeResult.error || 'Unknown error from Edge Function');
                }
                
                // แสดงผลลัพธ์
                this._displayEdgeFunctionResult(explainedContent, edgeResult, title, calculationType, resultIndex);
                
            } catch (error) {
                console.error('❌ DEBUG: Error calling Edge Function:', error);
                
                // Fallback to local calculation
                console.log('🔄 DEBUG: Falling back to local calculation');
                if (calculationType === 'basic') {
                    this._calculateLocally(result, resultIndex, analysisData);
                } else {
                    this._calculateCombinedLocally(result, resultIndex, analysisData);
                }
            }
        },

        // ฟังก์ชันตรวจสอบข้อมูลจากหลายแหล่ง
        _getAnalysisData: function() {
            console.log('🔍 DEBUG: Checking analysis data from all sources...');
            
            // 1. ตรวจสอบ window.analysisData
            if (window.analysisData) {
                console.log('✅ DEBUG: Found data in window.analysisData');
                return window.analysisData;
            }
            
            // 2. ตรวจสอบ sessionStorage
            const psychomatrixResult = sessionStorage.getItem('psychomatrixResult');
            if (psychomatrixResult) {
                try {
                    console.log('✅ DEBUG: Found data in sessionStorage');
                    const data = JSON.parse(psychomatrixResult);
                    window.analysisData = data; // ตั้งค่าใน global scope
                    return data;
                } catch (error) {
                    console.error('❌ DEBUG: Error parsing sessionStorage data:', error);
                }
            }
            
            // 3. ตรวจสอบ localStorage
            const localStorageData = localStorage.getItem('psychomatrixFormData') || 
                                    localStorage.getItem('lastPsychomatrixData');
            if (localStorageData) {
                try {
                    console.log('✅ DEBUG: Found data in localStorage');
                    const parsedData = JSON.parse(localStorageData);
                    const data = {
                        success: true,
                        results: [
                            {
                                title: 'Analysis from Local Storage',
                                type: 'full-name',
                                data: parsedData
                            }
                        ]
                    };
                    window.analysisData = data;
                    return data;
                } catch (error) {
                    console.error('❌ DEBUG: Error parsing localStorage data:', error);
                }
            }
            
            console.log('❌ DEBUG: No analysis data found in any source');
            return null;
        },

        // แสดงผลลัพธ์จาก Edge Function
        _displayEdgeFunctionResult: function(container, edgeResult, title, calculationType, resultIndex) {
            let html = `
                <div class="pythagorean-square-container">
                    <h2>Pythagorean Square${calculationType === 'combined' ? ' (รวมเลขสิ่งแวดล้อม)' : ''} - ${title}</h2>
            `;
            
            // Summary box
            if (calculationType === 'combined') {
                html += `
                    <div class="tw-mb-4 tw-p-3 tw-bg-yellow-50 tw-rounded tw-text-sm">
                        <p><strong>หมายเหตุ:</strong> ตารางนี้รวมสถิติจาก:</p>
                        <ul class="tw-list-disc tw-list-inside tw-mt-1">
                            <li>ข้อมูลหลัก (วันเกิด/บัตรประชาชน/ชื่อ)</li>
                            <li>ตัวเลขพิเศษ (Life Path, Destiny, Karmic, Life Lesson)</li>
                            <li>เลขสิ่งแวดล้อม 20 รายการจาก Local Storage</li>
                        </ul>
                    </div>
                `;
            } else {
                html += `
                    <div class="tw-mb-4 tw-p-3 tw-bg-blue-50 tw-rounded tw-text-sm">
                        <p><strong>Data Summary:</strong></p>
                        <ul class="tw-list-disc tw-list-inside tw-mt-1">
                            <li>Total digits analyzed: ${edgeResult.combined_number_string?.length || 0}</li>
                            <li>Calculation type: ${edgeResult.calculation_type}</li>
                            <li>Generated by: Edge Function</li>
                        </ul>
                    </div>
                `;
            }
            
            // Pythagorean Square HTML จาก Edge Function
            if (edgeResult.pythagorean_html) {
                html += edgeResult.pythagorean_html;
            } else {
                html += '<p class="tw-text-red-500">No Pythagorean Square data available from Edge Function.</p>';
            }
            
            // Influential numbers
            if (edgeResult.influential_numbers && edgeResult.influential_numbers.length > 0) {
                html += `
                    <div class="tw-mt-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                        <h3 class="tw-text-lg tw-font-bold tw-text-blue-800 tw-mb-2">สรุปผลเลขแวดล้อมที่มีอิทธิพลสูง</h3>
                        <p class="tw-text-gray-700">
                            <strong>เลขที่มีอิทธิพลสูงสุด:</strong> 
                            ${edgeResult.influential_numbers.join(', ')}
                            (ปรากฏ ${edgeResult.max_count} ครั้ง)
                        </p>
                        <p class="tw-text-gray-700 tw-mt-2">
                            <strong>เลขที่ขาดหายไป:</strong> 
                            ${edgeResult.missing_numbers?.length > 0 ? edgeResult.missing_numbers.join(', ') : 'ไม่มี'}
                        </p>
                    </div>
                `;
            }
            
            // Description
            html += `
                <div class="tw-mt-8 tw-text-sm tw-text-gray-600">
                    <p><strong>คำอธิบาย:</strong> ตาราง Pythagorean Square แสดงความถี่ของตัวเลข 1-9 จากข้อมูลของคุณ</p>
                    <p class="tw-mt-2">ตัวเลขในวงเล็บแสดงจำนวนครั้งที่ปรากฏ ส่วนผลรวมแถว/คอลัมน์/แนวทแยงแสดงอิทธิพลของตัวเลขในแต่ละด้าน</p>
                </div>
            `;
            
            // Button for combined view (if currently basic)
            if (calculationType === 'basic') {
                html += `
                    <div class="tw-mt-8 tw-text-center">
                        <button onclick="pythagorean.showCombinedPythagoreanSquare(${resultIndex})" 
                                class="tw-bg-purple-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-purple-600 tw-cursor-pointer tw-w-64 tw-inline-block">
                            Pythagorean Square (รวมเลขสิ่งแวดล้อม 20 รายการ)
                        </button>
                    </div>
                `;
            }
            
            html += `</div>`;
            
            container.innerHTML = html;
        },

        // Fallback: คำนวณแบบ local (basic)
        _calculateLocally: function(result, resultIndex, analysisData) {
            console.log('🔄 DEBUG: Using local calculation (basic)');
            const explainedContent = document.getElementById('explainedContent');
            
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
                        <p><strong>Local Calculation Fallback</strong> (Edge Function failed)</p>
                        <ul class="tw-list-disc tw-list-inside tw-mt-1">
                            <li>Total digits analyzed: ${numberString.length}</li>
                            <li>Life Path: ${lifePathNum || 'N/A'}</li>
                            <li>Destiny: ${destinyNum || 'N/A'}</li>
                            <li>Karmic: ${karmicNum || 'N/A'}</li>
                            <li>Life Lesson: ${lifeLessonNum || 'N/A'}</li>
                        </ul>
                    </div>
                    ${pythagoreanHTML}
                    ${mostInfluentialHTML}
                    <div class="tw-mt-8 tw-text-center">
                        <button onclick="pythagorean.showCombinedPythagoreanSquare(${resultIndex})" 
                                class="tw-bg-purple-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-purple-600 tw-cursor-pointer tw-w-64 tw-inline-block">
                            Pythagorean Square (รวมเลขสิ่งแวดล้อม 20 รายการ)
                        </button>
                    </div>
                </div>
            `;
        },

        // Fallback: คำนวณแบบ local (combined)
        _calculateCombinedLocally: function(result, resultIndex, analysisData) {
            console.log('🔄 DEBUG: Using local calculation (combined)');
            const explainedContent = document.getElementById('explainedContent');
            
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
                if (num !== undefined && num !== null && num !== '') {
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
                        <p><strong>Local Calculation Fallback</strong> (Edge Function failed)</p>
                        <p><strong>หมายเหตุ:</strong> ตารางนี้รวมสถิติจาก:</p>
                        <ul class="tw-list-disc tw-list-inside tw-mt-1">
                            <li>ข้อมูลหลัก (วันเกิด/บัตรประชาชน/ชื่อ)</li>
                            <li>ตัวเลขพิเศษ (Life Path, Destiny, Karmic, Life Lesson)</li>
                            <li>เลขสิ่งแวดล้อม 20 รายการจาก Local Storage</li>
                            <li>Total digits analyzed: ${combinedNumberString.length}</li>
                        </ul>
                    </div>
                    ${pythagoreanHTML}
                    ${mostInfluentialHTML}
                </div>
            `;
        },

        // ===== Local calculation functions (for fallback) =====
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
                    <div class="square-cell number-1" style="grid-row: 1; grid-column: 1;">1<span>(${counts[1]})</span></div>
                    <div class="square-cell number-4" style="grid-row: 1; grid-column: 2;">4<span>(${counts[4]})</span></div>
                    <div class="square-cell number-7" style="grid-row: 1; grid-column: 3;">7<span>(${counts[7]})</span></div>
                    
                    <div class="square-cell number-2" style="grid-row: 2; grid-column: 1;">2<span>(${counts[2]})</span></div>
                    <div class="square-cell number-5" style="grid-row: 2; grid-column: 2;">5<span>(${counts[5]})</span></div>
                    <div class="square-cell number-8" style="grid-row: 2; grid-column: 3;">8<span>(${counts[8]})</span></div>
                    
                    <div class="square-cell number-3" style="grid-row: 3; grid-column: 1;">3<span>(${counts[3]})</span></div>
                    <div class="square-cell number-6" style="grid-row: 3; grid-column: 2;">6<span>(${counts[6]})</span></div>
                    <div class="square-cell number-9" style="grid-row: 3; grid-column: 3;">9<span>(${counts[9]})</span></div>
                    
                    <div class="square-cell sum" style="grid-row: 1; grid-column: 4;">${rowSums[0]}</div>
                    <div class="square-cell sum" style="grid-row: 2; grid-column: 4;">${rowSums[1]}</div>
                    <div class="square-cell sum" style="grid-row: 3; grid-column: 4;">${rowSums[2]}</div>
                    
                    <div class="square-cell sum" style="grid-row: 4; grid-column: 1;">${colSums[0]}</div>
                    <div class="square-cell sum" style="grid-row: 4; grid-column: 2;">${colSums[1]}</div>
                    <div class="square-cell sum" style="grid-row: 4; grid-column: 3;">${colSums[2]}</div>
                    <div class="square-cell sum" style="grid-row: 4; grid-column: 4;">${diagonalLeft}/${diagonalRight}</div>
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

    console.log('✅ DEBUG: pythagorean.js โหลดสำเร็จแล้ว');

} catch (error) {
    console.error('❌ ผิดพลาดร้ายแรงใน pythagorean.js:', error);
    
    // สร้าง object พื้นฐานเพื่อป้องกัน error
    window.pythagorean = {
        showPythagoreanSquare: function(resultIndex) {
            console.error('pythagorean.js โหลดไม่สมบูรณ์');
            const explainedContent = document.getElementById('explainedContent');
            if (explainedContent) {
                explainedContent.innerHTML = `
                    <div class="tw-text-center tw-py-8 tw-text-red-500">
                        <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                        <p class="tw-font-bold">ฟังก์ชัน Pythagorean Square ไม่พร้อมใช้งาน</p>
                        <p class="tw-text-sm">กรุณารีเฟรชหน้าเว็บใหม่ หรือตรวจสอบ Console (F12) สำหรับรายละเอียด</p>
                        <div class="tw-mt-4 tw-text-left tw-text-xs tw-bg-gray-100 tw-p-3 tw-rounded">
                            <p><strong>รายละเอียดข้อผิดพลาด:</strong></p>
                            <p>${error.message || 'Unknown error'}</p>
                        </div>
                    </div>
                `;
            }
        },
        showCombinedPythagoreanSquare: function(resultIndex) {
            this.showPythagoreanSquare(resultIndex);
        }
    };
}

console.log('✅ DEBUG: pythagorean.js โหลดสมบูรณ์พร้อม fallback protection');

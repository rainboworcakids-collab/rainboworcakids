// pythagorean.js - Pythagorean Square calculations using Supabase Edge Function
console.log('🚀 DEBUG: pythagorean.js loaded - Version 7.5-EdgeFunction');

// ตั้งค่า Edge Function URL - แก้ไขตาม URL จริงของคุณ
const EDGE_FUNCTION_URL = 'https://your-project.supabase.co/functions/v1/psychomatrix-pythagorean';

// Create global namespace
const pythagorean = {
    // Show Pythagorean Square
    showPythagoreanSquare: async function(resultIndex) {
        console.log(`📊 DEBUG: showPythagoreanSquare called for index ${resultIndex}`);
        await this._calculateViaEdgeFunction(resultIndex, 'basic');
    },

    // Show Combined Pythagorean Square
    showCombinedPythagoreanSquare: async function(resultIndex) {
        console.log(`📊 DEBUG: showCombinedPythagoreanSquare called for index ${resultIndex}`);
        await this._calculateViaEdgeFunction(resultIndex, 'combined');
    },

    // เรียกใช้ Edge Function สำหรับคำนวณ Pythagorean Square
    _calculateViaEdgeFunction: async function(resultIndex, calculationType) {
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
                <p class="tw-mt-4 tw-text-gray-600">Calculating Pythagorean Square via Edge Function...</p>
            </div>
        `;
        window.switchTab('Explained', explainedButton);
        
        try {
            console.log('🌐 DEBUG: Calling Edge Function:', EDGE_FUNCTION_URL);
            
            // เตรียมข้อมูลสำหรับส่งไป Edge Function
            const requestBody = {
                result_data: result,
                calculation_type: calculationType,
                surrounding_data: calculationType === 'combined' ? this._getSurroundingData() : null
            };
            
            console.log('📤 DEBUG: Request body:', requestBody);
            
            // เรียกใช้ Edge Function
            const response = await fetch(EDGE_FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this._getSupabaseToken()}`
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`Edge Function returned ${response.status}: ${response.statusText}`);
            }
            
            const resultData = await response.json();
            console.log('📥 DEBUG: Edge Function response:', resultData);
            
            if (!resultData.success) {
                throw new Error(resultData.error || 'Edge Function calculation failed');
            }
            
            // แสดงผลลัพธ์จาก Edge Function
            this._displayEdgeFunctionResult(resultData, title, calculationType, resultIndex);
            
        } catch (error) {
            console.error('❌ DEBUG: Edge Function error:', error);
            
            // ถ้า Edge Function ล้มเหลว ให้ใช้การคำนวณในเครื่องแบบง่ายๆ
            explainedContent.innerHTML = `
                <div class="tw-text-center tw-py-8">
                    <div class="spinner"></div>
                    <p class="tw-mt-4 tw-text-gray-600">Edge Function failed, falling back to local calculation...</p>
                </div>
            `;
            
            // รอสักครู่แล้วเรียกใช้ fallback
            setTimeout(() => {
                this._fallbackLocalCalculation(result, resultIndex, calculationType, title);
            }, 500);
        }
    },

    // Fallback: การคำนวณในเครื่องเมื่อ Edge Function ล้มเหลว
    _fallbackLocalCalculation: function(result, resultIndex, calculationType, title) {
        const explainedContent = document.getElementById('explainedContent');
        
        if (!explainedContent) return;
        
        const data = result.data || {};
        
        // สร้าง number string แบบง่ายๆ
        let numberString = '';
        
        // เพิ่มวันเกิด (ถ้ามี)
        if (data.birth_date) {
            numberString += data.birth_date.replace(/[\/: ]/g, '');
        }
        
        // เพิ่มชื่อ (ถ้ามี)
        if (data.full_name) {
            const cleanName = data.full_name.replace(/\s/g, '');
            numberString += this._convertNameToNumbers(cleanName);
        }
        
        // เพิ่มเลขพิเศษ
        const specialNumbers = [
            data.life_path_number,
            data.destiny_number,
            data.thirdAndFourth?.karmic,
            data.thirdAndFourth?.lifeLesson
        ];
        
        specialNumbers.forEach(num => {
            if (num !== undefined && num !== null) {
                numberString += num.toString();
            }
        });
        
        // คำนวณ Pythagorean Square
        const counts = new Array(10).fill(0);
        for (let i = 0; i < numberString.length; i++) {
            const digit = parseInt(numberString[i]);
            if (digit >= 1 && digit <= 9) {
                counts[digit]++;
            }
        }
        
        // สร้าง HTML แบบง่ายๆ
        const html = this._createSimplePythagoreanHTML(counts, title, calculationType, resultIndex, true);
        explainedContent.innerHTML = html;
    },

    // แสดงผลลัพธ์จาก Edge Function
    _displayEdgeFunctionResult: function(resultData, title, calculationType, resultIndex) {
        const explainedContent = document.getElementById('explainedContent');
        
        if (!explainedContent) return;
        
        const typeLabel = calculationType === 'basic' ? 'Basic' : 'Combined (รวมเลขสิ่งแวดล้อม)';
        const otherType = calculationType === 'basic' ? 'combined' : 'basic';
        const otherButtonText = calculationType === 'basic' ? 'รวมเลขสิ่งแวดล้อม' : 'พื้นฐาน';
        
        const html = `
            <div class="pythagorean-square-container">
                <h2>Pythagorean Square (${typeLabel}) - ${title}</h2>
                <div class="tw-mb-4 tw-p-3 tw-bg-blue-50 tw-rounded tw-text-sm">
                    <p><strong>✅ Calculation via Supabase Edge Function</strong></p>
                    <ul class="tw-list-disc tw-list-inside tw-mt-1">
                        <li>Total digits: ${resultData.combined_number_string?.length || 'N/A'}</li>
                        <li>Calculation type: ${resultData.calculation_type}</li>
                        <li>Processed at: ${new Date(resultData.timestamp).toLocaleTimeString()}</li>
                    </ul>
                </div>
                
                <!-- แสดง Pythagorean Square จาก Edge Function -->
                <div class="pythagorean-square-wrapper">
                    ${resultData.pythagorean_html || '<p class="tw-text-red-500">No HTML content from Edge Function</p>'}
                </div>
                
                <!-- แสดงเลขที่มีอิทธิพลสูงสุด -->
                <div class="tw-mt-6 tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                    <h3 class="tw-text-lg tw-font-bold tw-text-blue-800 tw-mb-2">สรุปผลเลขแวดล้อมที่มีอิทธิพลสูง</h3>
                    <p class="tw-text-gray-700">
                        <strong>เลขที่มีอิทธิพลสูงสุด:</strong> 
                        ${resultData.influential_numbers && resultData.influential_numbers.length > 0 ? 
                            resultData.influential_numbers.join(', ') : 'ไม่พบ'}
                        (ปรากฏ ${resultData.max_count || 0} ครั้ง)
                    </p>
                    <p class="tw-text-gray-700 tw-mt-2">
                        <strong>เลขที่ขาดหายไป:</strong> 
                        ${resultData.missing_numbers && resultData.missing_numbers.length > 0 ? 
                            resultData.missing_numbers.join(', ') : 'ไม่มี'}
                    </p>
                </div>
                
                <!-- ปุ่มสลับระหว่าง basic/combined -->
                <div class="tw-mt-8 tw-text-center">
                    <button onclick="window.pythagorean._calculateViaEdgeFunction(${resultIndex}, '${otherType}')" 
                            class="tw-bg-purple-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-purple-600 tw-cursor-pointer tw-w-64 tw-inline-block">
                        แสดงแบบ ${otherButtonText}
                    </button>
                </div>
                
                <!-- Debug information -->
                <div class="tw-mt-6 tw-p-4 tw-bg-gray-100 tw-rounded tw-text-xs tw-font-mono tw-hidden" id="debugInfo">
                    <p><strong>Debug Information:</strong></p>
                    <pre>${JSON.stringify(resultData, null, 2)}</pre>
                </div>
                
                <div class="tw-mt-4 tw-text-center">
                    <button onclick="document.getElementById('debugInfo').classList.toggle('tw-hidden')" 
                            class="tw-text-gray-500 hover:tw-text-gray-700 tw-text-sm">
                        Toggle Debug Info
                    </button>
                </div>
            </div>
        `;
        
        explainedContent.innerHTML = html;
    },

    // ===== UTILITY FUNCTIONS =====
    
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

    // ฟังก์ชันดึงข้อมูล surrounding numbers
    _getSurroundingData: function() {
        // ลองดึงจาก localStorage ก่อน
        const surroundingNumbers = localStorage.getItem('lifePathSurroundingNumbers');
        
        if (surroundingNumbers) {
            try {
                return JSON.parse(surroundingNumbers);
            } catch (error) {
                console.error('❌ DEBUG: Error parsing surrounding numbers:', error);
            }
        }
        
        // ถ้าไม่มีให้คืนค่า default
        return {
            mother_name: "นางสมศรี ใจดี",
            father_name: "นายสมชาย ใจดี",
            spouse_name: "นางสาวสวยใส ใจงาม",
            child1_name: "เด็กชายดีดี มีสุข",
            child2_name: "เด็กหญิงสุขสันต์ มีดี",
            best_friend: "เพื่อนสนิท",
            boss_name: "หัวหน้างาน",
            company_name: "ชื่อบริษัท",
            school_name: "ชื่อโรงเรียน",
            university_name: "ชื่อมหาวิทยาลัย"
        };
    },

    // ฟังก์ชันดึง Supabase token
    _getSupabaseToken: function() {
        // ในกรณีที่ใช้ anonymous access หรือมี token ใน localStorage
        const supabaseToken = localStorage.getItem('supabase_token') || 
                             sessionStorage.getItem('supabase_token') ||
                             'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs'; // anonymous token ตัวอย่าง
        
        return supabaseToken;
    },

    // แปลงชื่อเป็นตัวเลข (สำหรับ fallback)
    _convertNameToNumbers: function(name) {
        const thaiToEnglishMap = {
            'ก': 'K', 'ข': 'K', 'ค': 'K', 'ฆ': 'K', 'ง': 'N',
            'จ': 'J', 'ฉ': 'C', 'ช': 'C', 'ซ': 'S', 'ฌ': 'J', 'ญ': 'Y',
            'ฎ': 'D', 'ฏ': 'T', 'ฐ': 'T', 'ฑ': 'D', 'ฒ': 'T', 'ณ': 'N',
            'ด': 'D', 'ต': 'T', 'ถ': 'T', 'ท': 'T', 'ธ': 'T', 'น': 'N',
            'บ': 'B', 'ป': 'P', 'ผ': 'P', 'ฝ': 'F', 'พ': 'P', 'ฟ': 'F',
            'ภ': 'P', 'ม': 'M', 'ย': 'Y', 'ร': 'R', 'ล': 'L', 'ว': 'W',
            'ศ': 'S', 'ษ': 'S', 'ส': 'S', 'ห': 'H', 'ฬ': 'L', 'อ': 'O',
            'ฮ': 'H'
        };
        
        const letterToNumberMap = {
            'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8, 'I': 9,
            'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'O': 6, 'P': 7, 'Q': 8, 'R': 9,
            'S': 1, 'T': 2, 'U': 3, 'V': 4, 'W': 5, 'X': 6, 'Y': 7, 'Z': 8
        };
        
        let result = '';
        for (let i = 0; i < name.length; i++) {
            const char = name[i];
            let englishChar = thaiToEnglishMap[char];
            
            if (englishChar) {
                const number = letterToNumberMap[englishChar] || 0;
                if (number > 0) {
                    result += number;
                }
            }
        }
        
        return result;
    },

    // สร้าง Pythagorean Square HTML แบบง่าย (สำหรับ fallback)
    _createSimplePythagoreanHTML: function(counts, title, calculationType, resultIndex, isFallback = false) {
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
        
        const typeLabel = calculationType === 'basic' ? 'Basic' : 'Combined (รวมเลขสิ่งแวดล้อม)';
        const otherType = calculationType === 'basic' ? 'combined' : 'basic';
        const otherButtonText = calculationType === 'basic' ? 'รวมเลขสิ่งแวดล้อม' : 'พื้นฐาน';
        const fallbackNote = isFallback ? '⚠️ Local Fallback Calculation' : '✅ Edge Function Calculation';
        
        return `
            <div class="pythagorean-square-container">
                <h2>Pythagorean Square (${typeLabel}) - ${title}</h2>
                <div class="tw-mb-4 tw-p-3 ${isFallback ? 'tw-bg-yellow-50' : 'tw-bg-blue-50'} tw-rounded tw-text-sm">
                    <p><strong>${fallbackNote}</strong></p>
                    <ul class="tw-list-disc tw-list-inside tw-mt-1">
                        <li>Calculation type: ${calculationType}</li>
                        <li>Total counts: ${counts.slice(1).reduce((a, b) => a + b, 0)}</li>
                        ${isFallback ? '<li>Using local fallback calculation</li>' : ''}
                    </ul>
                </div>
                
                <!-- Pythagorean Square -->
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
                
                <!-- ปุ่มสลับระหว่าง basic/combined -->
                <div class="tw-mt-8 tw-text-center">
                    <button onclick="window.pythagorean._calculateViaEdgeFunction(${resultIndex}, '${otherType}')" 
                            class="tw-bg-purple-500 tw-text-white tw-py-3 tw-px-6 tw-rounded-full hover:tw-bg-purple-600 tw-cursor-pointer tw-w-64 tw-inline-block">
                        แสดงแบบ ${otherButtonText}
                    </button>
                </div>
                
                ${isFallback ? `
                <div class="tw-mt-6 tw-p-4 tw-bg-red-50 tw-rounded">
                    <p class="tw-text-red-700"><strong>⚠️ Note:</strong> Using local fallback calculation because Edge Function is unavailable.</p>
                    <p class="tw-text-sm tw-text-red-600 tw-mt-2">Please check your Supabase Edge Function configuration.</p>
                </div>
                ` : ''}
            </div>
        `;
    }
};

// Expose to global scope
window.pythagorean = pythagorean;

console.log('✅ DEBUG: pythagorean.js loaded successfully');
console.log('📋 DEBUG: Available functions:', Object.keys(pythagorean));
console.log('🌐 DEBUG: Edge Function URL:', EDGE_FUNCTION_URL);
console.log('💡 DEBUG: This version uses Supabase Edge Function for calculations');

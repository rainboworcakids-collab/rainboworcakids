// pinnacle.js - เวอร์ชันที่ทำงานร่วมกับ result.js ได้ (v3.6-Compatible)
console.log('🚀 DEBUG: pinnacle.js loaded - v3.6-Compatible-with-result');

// ==================== MINIMAL VERSION - ทำงานร่วมกับ result.js ====================
// ไม่เรียกใช้โค้ดใดๆ จนกว่าจะถูกเรียกโดย result.js โดยตรง

function ChangeMaster(Num) {
    if (Num == 11) return 2;
    else if (Num == 22) return 4;
    else if (Num == 33) return 6;
    return Num;
}

function calculateLifePathNumber(destinyNumber) {
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
}


// ==================== LAZY LOADER ====================
// ใช้ lazy loading ไม่โหลดข้อมูลจนกว่าจำเป็น
let pinnacleMeaningsLoaded = false;
let pinnacleMeanings = null;

async function lazyLoadPinnacleMeanings() {
    // ==================== SUPABASE CONFIG ====================
    const SUPABASE_STORAGE_URL = 'https://oibubvhuiuurkxhnefsw.supabase.co/storage/v1/object/public/data';
    const PINNACLE_CYCLE_URL = `${SUPABASE_STORAGE_URL}/PinnacleCycle.json`;

    if (pinnacleMeaningsLoaded) return pinnacleMeanings;
    
    console.log('📦 DEBUG: Lazy loading pinnacle meanings...');
    try {
        const response = await fetch(PINNACLE_CYCLE_URL, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        
        if (response.ok) {
            const data = await response.json();
            pinnacleMeanings = data.PinnacleCycles || [];
            pinnacleMeaningsLoaded = true;
            console.log('✅ DEBUG: Pinnacle meanings loaded');
        }
    } catch (error) {
        console.error('❌ DEBUG: Error loading pinnacle meanings:', error);
    }
    return pinnacleMeanings;
}

// ==================== PINNACLE MODULE ====================
const pinnacle = {
    // ฟังก์ชันหลักที่ result.js จะเรียก
    async showPinnacleCycle(resultIndex) {
        console.log(`📊 DEBUG: showPinnacleCycle called from result.js for index ${resultIndex}`);
        
        const explainedContent = document.getElementById('explainedContent');
        const explainedButton = document.querySelector('.tablink:nth-child(2)');
        
        if (!explainedContent || !explainedButton) {
            console.error('❌ DEBUG: Explained content or button not found');
            return;
        }
        
        // แสดง loading state
        explainedContent.innerHTML = `
            <div class="tw-text-center tw-py-8">
                <div class="spinner tw-inline-block tw-w-12 tw-h-12 tw-border-4 tw-border-blue-500 tw-border-t-transparent tw-rounded-full tw-animate-spin"></div>
                <p class="tw-mt-4 tw-text-gray-600">กำลังคำนวณ Pinnacle Cycle...</p>
            </div>
        `;
        
        // ใช้ switchTab จาก result.js
        if (window.switchTab) {
            window.switchTab('Explained', explainedButton);
        }
        
        try {
            // 1. ดึงข้อมูล pinnacleData (ใช้จาก result.js)
            const pinnacleData = await this._getPinnacleData();
            if (!pinnacleData) {
                throw new Error('ไม่พบข้อมูลวันเกิดสำหรับการคำนวณ Pinnacle Cycle');
            }
            
            // 2. คำนวณ Pinnacle
            const calculatedData = await this._calculatePinnacle(pinnacleData);
            
            // 3. แสดงผล HTML
            const html = this._generatePinnacleHTML(calculatedData);
            explainedContent.innerHTML = html;
            
            // 4. สร้างกราฟ (ถ้ามี Chart.js)
            setTimeout(() => {
                this._generatePinnacleCharts(calculatedData);
            }, 100);
            
            // 5. โหลดความหมาย
            setTimeout(async () => {
                await this._displayPinnacleMeanings(calculatedData);
            }, 300);
            
        } catch (error) {
            console.error('❌ DEBUG: Error in showPinnacleCycle:', error);
            this._showError(explainedContent, error.message);
        }
    },
    
    // ดึงข้อมูล pinnacleData (จาก sessionStorage หรือ result.js)
    async _getPinnacleData() {
        console.log('🔍 DEBUG: Getting pinnacle data...');
        
        // 1. ลองดึงจาก sessionStorage (หลัก)
        const pinnacleDataFromStorage = sessionStorage.getItem('pinnacleData');
        if (pinnacleDataFromStorage) {
            try {
                const data = JSON.parse(pinnacleDataFromStorage);
                console.log('✅ DEBUG: Got pinnacle data from sessionStorage');
                return data;
            } catch (error) {
                console.error('❌ DEBUG: Error parsing pinnacleData from sessionStorage:', error);
            }
        }
        
        // 2. ลองดึงจาก window.pinnacleData (ที่ result.js ตั้งค่า)
        if (window.pinnacleData) {
            console.log('✅ DEBUG: Got pinnacle data from window.pinnacleData');
            return window.pinnacleData;
        }
        
        // 3. ลองดึงจาก window.analysisData (ผลลัพธ์จาก result.js)
        if (window.analysisData && window.analysisData.results) {
            const birthDateResult = window.analysisData.results.find(r => r.type === 'birth-date');
            if (birthDateResult && birthDateResult.data) {
                const data = birthDateResult.data;
                const birthDateStr = data.birth_date;
                
                if (birthDateStr) {
                    // แยกข้อมูลวันเกิด
                    const timeMatch = birthDateStr.match(/(\d{2}):(\d{2})/);
                    let birthHour = 0, birthMinute = 0;
                    if (timeMatch) {
                        birthHour = parseInt(timeMatch[1]);
                        birthMinute = parseInt(timeMatch[2]);
                    }
                    
                    // แยกวันที่
                    const dateParts = birthDateStr.split(' ');
                    let birthDay = '', birthMonth = '', birthYear = '';
                    if (dateParts.length >= 2) {
                        const datePart = dateParts[1];
                        const [day, month, year] = datePart.split('/').map(Number);
                        birthDay = day.toString().padStart(2, '0');
                        birthMonth = month.toString().padStart(2, '0');
                        birthYear = year.toString();
                    } else {
                        const [day, month, year] = birthDateStr.split('/').map(Number);
                        birthDay = day.toString().padStart(2, '0');
                        birthMonth = month.toString().padStart(2, '0');
                        birthYear = year.toString();
                    }
                    
                    const pinnacleData = {
                        lifePathNumber: data.life_path_number,
                        birth_date: data.birth_date,
                        UDate: birthDay,
                        UMonth: birthMonth,
                        UYear: birthYear,
                        birth_hour: birthHour,
                        birth_minute: birthMinute,
                        destiny_number: data.destiny_number
                    };
                    
                    console.log('✅ DEBUG: Created pinnacle data from analysisData');
                    return pinnacleData;
                }
            }
        }
        
        throw new Error('ไม่พบข้อมูลวันเกิด กรุณากลับไปกรอกข้อมูลในหน้า Psychomatrix ก่อน');
    },
    
    // คำนวณ Pinnacle
    async _calculatePinnacle(pinnacleData) {
        console.log('🧮 DEBUG: Calculating pinnacle...');
        
        const lifePathNumber = parseInt(pinnacleData.lifePathNumber);
        const birthDay = parseInt(pinnacleData.UDate);
        const birthMonth = parseInt(pinnacleData.UMonth);
        const birthYear = parseInt(pinnacleData.UYear);
        const birthHour = parseInt(pinnacleData.birth_hour) || 0;
        const birthMinute = parseInt(pinnacleData.birth_minute) || 0;
        
        // คำนวณอายุปัจจุบัน
        const currentYear = new Date().getFullYear();
        const currentAge = currentYear - birthYear;
        
        // คำนวณ Pinnacle Numbers
        const pinnacleNumbers = this._calculatePinnacleNumbers(birthMonth, birthDay, birthYear);
        
        // กำหนดช่วงอายุ (ใช้สูตรพื้นฐานตาม API)
        const firstCycleEnd = 27; // ตามค่าเริ่มต้นจาก API
        const secondCycleEnd = 36;
        const thirdCycleEnd = 45;
        
        const cycles = [
            {
                cycleNumber: 1,
                pinnacleNumber: pinnacleNumbers.Pinnacle1st,
                ageRange: `0-${firstCycleEnd}`,
                isCurrent: false
            },
            {
                cycleNumber: 2,
                pinnacleNumber: pinnacleNumbers.Pinnacle2nd,
                ageRange: `${firstCycleEnd + 1}-${secondCycleEnd}`,
                isCurrent: false
            },
            {
                cycleNumber: 3,
                pinnacleNumber: pinnacleNumbers.Pinnacle3rd,
                ageRange: `${secondCycleEnd + 1}-${thirdCycleEnd}`,
                isCurrent: false
            },
            {
                cycleNumber: 4,
                pinnacleNumber: pinnacleNumbers.Pinnacle4th,
                ageRange: `${thirdCycleEnd + 1}+`,
                isCurrent: false
            }
        ];
        
        // กำหนด cycle ปัจจุบัน
        cycles.forEach(cycle => {
            const range = cycle.ageRange;
            if (range.includes('+')) {
                const startAge = parseInt(range.split('+')[0]);
                cycle.isCurrent = currentAge >= startAge;
            } else {
                const [startAge, endAge] = range.split('-').map(Number);
                cycle.isCurrent = currentAge >= startAge && currentAge <= endAge;
            }
        });
        
        // คำนวณ Personal Year
        const personalYearNumber = this._calculatePersonalYear(
            birthDay,
            birthMonth,
            currentYear,
            birthHour,
            birthMinute
        );
        
        return {
            lifePathNumber: lifePathNumber,
            birthDate: {
                day: pinnacleData.UDate,
                month: pinnacleData.UMonth,
                year: pinnacleData.UYear.toString(),
                hour: birthHour,
                minute: birthMinute
            },
            currentAge: currentAge,
            personalYearNumber: personalYearNumber,
            pinnacleNumbers: pinnacleNumbers,
            cycles: cycles,
            currentCycle: cycles.find(cycle => cycle.isCurrent),
            calculatedLocally: true
        };
    },
    
    // คำนวณ Pinnacle Numbers
    _calculatePinnacleNumbers(month, day, year) {
        const pinnacle1 = this._calculateSinglePinnacle(month, day);
        const pinnacle2 = this._calculateSinglePinnacle(year, day);
        const pinnacle3 = this._calculateSinglePinnacle(pinnacle1, pinnacle2);
        const pinnacle4 = this._calculateSinglePinnacle(month, year);
        
        return {
            Pinnacle1st: pinnacle1,
            Pinnacle2nd: pinnacle2,
            Pinnacle3rd: pinnacle3,
            Pinnacle4th: pinnacle4
        };
    },
    
    // คำนวณ Pinnacle เดียว
    _calculateSinglePinnacle(num1, num2) {
        const n1 = parseInt(num1) || 0;
        const n2 = parseInt(num2) || 0;
        let sum = n1 + n2;
        
        while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
            const digits = sum.toString().split('').map(Number);
            sum = digits.reduce((a, b) => a + b, 0);
        }
        
        return ChangeMaster(sum);
    },
    
    // คำนวณ Personal Year
    _calculatePersonalYear(day, month, year, hour = 0, minute = 0) {
        // สร้างสตริงต่อกันแบบเดียวกับ pinnacle.php
        const combinedStr = 
            day.toString() + 
            month.toString() + 
            year.toString() + 
            hour.toString() + 
            minute.toString();
        
        // คำนวณ Life Path Number จากสตริง
        const lifePathNum = this._calculateLifePathNumberFromString(combinedStr);
        
        // ใช้ ChangeMaster
        return ChangeMaster(lifePathNum);
    },
    
    // ฟังก์ชัน processNum สำหรับคำนวณ Personal Year (แบบเดียวกับ API)
    _processNum(pp, lp) {
        for (let i = 0; i < lp; i++) {
            const intPart = Math.floor(pp / 10);
            const remainder = pp % 10;
            pp = intPart + remainder;
        }
        return pp;
    },
    
    // สร้าง HTML
    _generatePinnacleHTML(pinnacleData) {
        const currentCycle = pinnacleData.currentCycle;
        const currentAge = pinnacleData.currentAge;
        
        return `
            <div class="pinnacle-container tw-max-w-6xl tw-mx-auto tw-p-4">
                <h1 class="tw-text-3xl tw-font-bold tw-text-center tw-mb-6 tw-text-purple-800">
                    วงจรยอดเขาชีวิต (Pinnacle Cycle)
                </h1>
                
                <div class="tw-mb-6 tw-p-4 tw-bg-blue-50 tw-border-l-4 tw-border-blue-500 tw-rounded-lg">
                    <p class="tw-text-blue-700">
                        <strong>ข้อมูลนี้คำนวณจาก:</strong> วันที่ ${pinnacleData.birthDate.day}/${pinnacleData.birthDate.month}/${pinnacleData.birthDate.year}
                        (อายุ ${currentAge} ปี, Life Path Number: ${pinnacleData.lifePathNumber})
                    </p>
                </div>
                
                <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4 tw-mb-8">
                    ${pinnacleData.cycles.map(cycle => `
                        <div class="tw-p-4 tw-bg-white tw-rounded-lg tw-shadow tw-text-center ${cycle.isCurrent ? 'tw-border-2 tw-border-blue-500' : ''}">
                            <h3 class="tw-text-lg tw-font-bold tw-text-gray-800">Pinnacle ${cycle.cycleNumber}</h3>
                            <div class="tw-text-3xl tw-font-bold tw-text-blue-600 tw-my-2">${cycle.pinnacleNumber}</div>
                            <p class="tw-text-gray-600">${cycle.ageRange}</p>
                            ${cycle.isCurrent ? '<div class="tw-mt-2 tw-text-green-600 tw-font-semibold">ปัจจุบัน</div>' : ''}
                        </div>
                    `).join('')}
                </div>
                
                ${currentCycle ? `
                    <div class="tw-mb-8 tw-p-6 tw-bg-green-50 tw-rounded-lg">
                        <h2 class="tw-text-xl tw-font-bold tw-text-green-800 tw-mb-3">
                            📍 คุณอยู่ใน Pinnacle Cycle ${currentCycle.cycleNumber}
                        </h2>
                        <p class="tw-text-green-700">
                            ช่วงอายุ: ${currentCycle.ageRange}<br>
                            เลข Pinnacle: ${currentCycle.pinnacleNumber}<br>
                            Personal Year: ${pinnacleData.personalYearNumber}
                        </p>
                    </div>
                ` : ''}
                
                <div class="tw-mb-8">
                    <h2 class="tw-text-2xl tw-font-bold tw-text-purple-800 tw-mb-6">
                        รายละเอียด Pinnacle Cycles
                    </h2>
                    <div class="tw-grid tw-grid-cols-1 tw-gap-6">
                        ${pinnacleData.cycles.map(cycle => `
                            <div class="tw-bg-white tw-rounded-xl tw-shadow-lg tw-overflow-hidden">
                                <div class="tw-p-4 tw-bg-gradient-to-r tw-from-blue-50 tw-to-indigo-50">
                                    <div class="tw-flex tw-items-center">
                                        <div class="tw-w-10 tw-h-10 tw-bg-blue-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mr-4">
                                            <span class="tw-text-xl tw-font-bold tw-text-white">${cycle.cycleNumber}</span>
                                        </div>
                                        <div>
                                            <h3 class="tw-text-xl tw-font-bold tw-text-gray-800">Pinnacle Cycle ${cycle.cycleNumber}</h3>
                                            <p class="tw-text-gray-600">เลข: ${cycle.pinnacleNumber} • ช่วงอายุ: ${cycle.ageRange}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="tw-p-4">
                                    <div class="tw-mb-4">
                                        <h4 class="tw-text-lg tw-font-bold tw-text-gray-700 tw-mb-2">กราฟ Pinnacle Cycle ${cycle.cycleNumber}</h4>
                                        <div class="tw-h-80 tw-bg-gray-50 tw-rounded-lg tw-p-4">
                                            <canvas id="pinnacleChart${cycle.cycleNumber}"></canvas>
                                        </div>
                                    </div>
                                    
                                    <div class="tw-mt-4">
                                        <h4 class="tw-text-lg tw-font-bold tw-text-gray-700 tw-mb-2">ความหมาย</h4>
                                        <div class="pinnacle-meaning-container" 
                                             data-cycle="${cycle.cycleNumber}" 
                                             data-number="${cycle.pinnacleNumber}"
                                             data-is-current="${cycle.isCurrent}">
                                            <div class="tw-text-center tw-py-4">
                                                <div class="spinner tw-inline-block tw-w-6 tw-h-6 tw-border-4 tw-border-blue-500 tw-border-t-transparent tw-rounded-full tw-animate-spin"></div>
                                                <p class="tw-mt-2 tw-text-gray-500">กำลังโหลดความหมาย...</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="tw-mt-8 tw-p-4 tw-bg-gray-50 tw-rounded-lg">
                    <p class="tw-text-gray-700">
                        <strong>หมายเหตุ:</strong> Pinnacle Cycle คือ 4 ช่วงอายุสำคัญในชีวิต ที่มีเลขนำทางในแต่ละช่วง 
                        ขึ้นอยู่กับเลข Life Path ของแต่ละคน ช่วยให้เข้าใจบทเรียนชีวิตและเตรียมตัวรับการเปลี่ยนแปลง
                    </p>
                </div>
            </div>
        `;
    },
    
    // แสดงความหมาย
    async _displayPinnacleMeanings(pinnacleData) {
        try {
            await lazyLoadPinnacleMeanings();
            
            pinnacleData.cycles.forEach(cycle => {
                try {
                    const meaning = this._getPinnacleMeaningFromData(cycle.pinnacleNumber, cycle.cycleNumber);
                    const containers = document.querySelectorAll(`[data-cycle="${cycle.cycleNumber}"][data-number="${cycle.pinnacleNumber}"]`);
                    
                    containers.forEach(container => {
                        if (container) {
                            const isCurrent = container.getAttribute('data-is-current') === 'true';
                            container.innerHTML = `
                                <div class="tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                                    <p class="tw-text-gray-700 tw-leading-relaxed">${meaning}</p>
                                    ${isCurrent ? `
                                        <div class="tw-mt-3 tw-p-2 tw-bg-green-100 tw-rounded">
                                            <p class="tw-text-sm tw-text-green-700">
                                                <strong>คุณอยู่ในช่วงนี้:</strong> ความหมายนี้สะท้อนถึงบทเรียนและโอกาสที่คุณกำลังเผชิญอยู่ในปัจจุบัน
                                            </p>
                                        </div>
                                    ` : ''}
                                </div>
                            `;
                        }
                    });
                } catch (error) {
                    console.error(`❌ DEBUG: Error for pinnacle ${cycle.pinnacleNumber}:`, error);
                }
            });
            
        } catch (error) {
            console.error('❌ DEBUG: Error loading meanings:', error);
        }
    },
    
    // ดึงความหมายจากข้อมูล
    _getPinnacleMeaningFromData(pinnacleNumber, cycleIndex) {
        if (!pinnacleMeanings) {
            return `ความหมายของ Pinnacle เลข ${pinnacleNumber} กำลังโหลด...`;
        }
        
        const targetNumber = pinnacleNumber.toString();
        const meaningData = pinnacleMeanings.find(m => m.PinnacleNumber === targetNumber);
        
        if (!meaningData) {
            return `ไม่พบความหมายสำหรับ Pinnacle เลข ${pinnacleNumber}`;
        }
        
        let meaningKey;
        switch(cycleIndex) {
            case 1: meaningKey = 'Pinnacle1st'; break;
            case 2:
            case 3: meaningKey = 'Pinnacle2nd'; break;
            case 4: meaningKey = 'Pinnacle4th'; break;
            default: meaningKey = 'Pinnacle1st';
        }
        
        return meaningData[meaningKey] || `ไม่มีข้อมูลสำหรับ Pinnacle เลข ${pinnacleNumber}`;
    },
    
    // สร้างกราฟ (แก้ไขให้แสดงแกน X แบบเดียวกับ pinnacle.php)
    _generatePinnacleCharts(pinnacleData) {
        if (typeof Chart === 'undefined') {
            console.warn('⚠️ DEBUG: Chart.js not loaded, skipping charts');
            return;
        }
        
        // สีจาก PsychomatrixStyle.css
        const colorMap = {
            1: { bg: 'rgba(255, 224, 224, 0.5)', border: 'rgba(255, 0, 0, 1)' },
            2: { bg: 'rgba(249, 234, 230, 0.5)', border: 'rgba(249, 115, 22, 1)' },
            3: { bg: 'rgba(255, 254, 234, 0.5)', border: 'rgba(204, 204, 143, 1)' },
            4: { bg: 'rgba(210, 245, 238, 0.5)', border: 'rgba(34, 197, 94, 1)' },
            5: { bg: 'rgba(219, 239, 250, 0.5)', border: 'rgba(59, 130, 246, 1)' },
            6: { bg: 'rgba(214, 253, 254, 0.5)', border: 'rgba(6, 182, 212, 1)' },
            7: { bg: 'rgba(239, 223, 255, 0.5)', border: 'rgba(139, 92, 246, 1)' },
            8: { bg: 'rgba(254, 234, 255, 0.5)', border: 'rgba(236, 72, 153, 1)' },
            9: { bg: 'rgba(255, 254, 234, 0.5)', border: 'rgba(250, 204, 21, 1)' }
        };
        
        // สีพิเศษสำหรับกรณี personalYear == Pinnacle
        const highlightColor = { 
            bg: 'rgba(179, 49, 87, 1)', 
            border: 'rgba(255, 20, 20, 1)' 
        };
        
        // ข้อมูลธาตุ (จาก LifePathProperty.json)
        const lifePathPropertyData = {
            "1": "ทอง",
            "2": "น้ำ",
            "3": "ไฟ",
            "4": "ไม้",
            "5": "ดิน",
            "6": "ทอง",
            "7": "น้ำ",
            "8": "ไฟ",
            "9": "ไม้"
        };
        
        // ความสัมพันธ์ธาตุ (จาก ElementsRelations.json)
        const elementsRelationsData = {
            "ทอง": {
                "ไม้": "นำโชคมีชัย",
                "ดิน": "ส่งเสริมให้ลาภ",
                "ทอง": "กลมกลืนสุขสงบ",
                "น้ำ": "ให้เพื่อรับโชค",
                "ไฟ": "พ่ายแพ้"
            },
            "น้ำ": {
                "ไฟ": "นำโชคมีชัย",
                "ทอง": "ส่งเสริมให้ลาภ",
                "น้ำ": "กลมกลืนสุขสงบ",
                "ไม้": "ให้เพื่อรับโชค",
                "ดิน": "พ่ายแพ้"
            },
            "ไฟ": {
                "ทอง": "นำโชคมีชัย",
                "ไม้": "ส่งเสริมให้ลาภ",
                "ไฟ": "กลมกลืนสุขสงบ",
                "ดิน": "ให้เพื่อรับโชค",
                "น้ำ": "พ่ายแพ้"
            },
            "ไม้": {
                "ดิน": "นำโชคมีชัย",
                "น้ำ": "ส่งเสริมให้ลาภ",
                "ไม้": "กลมกลืนสุขสงบ",
                "ไฟ": "ให้เพื่อรับโชค",
                "ทอง": "พ่ายแพ้"
            },
            "ดิน": {
                "น้ำ": "นำโชคมีชัย",
                "ไฟ": "ส่งเสริมให้ลาภ",
                "ดิน": "กลมกลืนสุขสงบ",
                "ทอง": "ให้เพื่อรับโชค",
                "ไม้": "พ่ายแพ้"
            }
        };
        
        // ฟังก์ชันช่วยเหลือภายใน
        const getElementFromNumber = (number) => {
            return lifePathPropertyData[number] || "ไม่พบข้อมูลธาตุ";
        };
        
        const getElementRelation = (elementFrom, elementTo) => {
            if (!elementFrom || !elementTo || elementFrom === "ไม่พบข้อมูลธาตุ" || elementTo === "ไม่พบข้อมูลธาตุ") {
                return "ไม่พบข้อมูลความสัมพันธ์";
            }
            return elementsRelationsData[elementFrom]?.[elementTo] || "ไม่พบข้อมูลความสัมพันธ์";
        };
        
        // คำนวณธาตุของ Life Path
        const lifePathElement = getElementFromNumber(pinnacleData.lifePathNumber);
        
        // คำนวณอายุปัจจุบัน
        const currentYear = new Date().getFullYear();
        const currentAge = currentYear - parseInt(pinnacleData.birthDate.year);
        
        setTimeout(() => {
            pinnacleData.cycles.forEach(cycle => {
                const chartId = `pinnacleChart${cycle.cycleNumber}`;
                const canvas = document.getElementById(chartId);
                
                if (!canvas) {
                    console.error(`❌ DEBUG: Canvas ${chartId} not found`);
                    return;
                }
                
                try {
                    // กำหนดช่วงอายุ
                    const ageRange = cycle.ageRange;
                    let startAge = 0, endAge = 0;
                    
                    if (ageRange.includes('+')) {
                        startAge = parseInt(ageRange.replace('+', '')) || 0;
                        endAge = startAge + 20;
                    } else {
                        const [start, end] = ageRange.split('-').map(s => parseInt(s));
                        startAge = start || 0;
                        endAge = end || startAge + 10;
                    }
                    
                    const labels = [];
                    const data = [];
                    const backgroundColors = [];
                    const borderColors = [];
                    const borderWidths = [];
                    
                    const day = parseInt(pinnacleData.birthDate.day);
                    const month = parseInt(pinnacleData.birthDate.month);
                    const hour = pinnacleData.birthDate.hour || 0;
                    const minute = pinnacleData.birthDate.minute || 0;
                    
                    // คำนวณ Personal Year Number สำหรับแต่ละปี
                    for (let age = startAge; age <= endAge; age++) {
                        const year = parseInt(pinnacleData.birthDate.year) + age;
                        const yearTH = year + 543; // คำนวณปี พ.ศ.
                        
                        // คำนวณ Personal Year Number
                        const combinedStr = day.toString() + month.toString() + year.toString() + hour.toString() + minute.toString();
                        let personalYear = this._calculateLifePathNumberFromString(combinedStr);
                        personalYear = ChangeMaster(personalYear);
                        
                        data.push(personalYear);
                        
                        // ดึงธาตุและความสัมพันธ์
                        const yearElement = getElementFromNumber(personalYear);
                        const elementRelation = getElementRelation(yearElement, lifePathElement);
                        
                        // สร้าง label แบบเดียวกับ pinnacle.php
                        labels.push(`${year} (${yearTH})-${yearElement}-${elementRelation}-อายุ ${age}ปี`);
                        
                        // ตรวจสอบเงื่อนไขการให้สี
                        const isCurrentAge = (age === currentAge);
                        const isPinnacleYear = (personalYear === cycle.pinnacleNumber);
                        
                        if (isCurrentAge && isPinnacleYear) {
                            backgroundColors.push('rgba(30, 64, 175, 0.9)');
                            borderColors.push(highlightColor.bg);
                            borderWidths.push(4);
                        } else if (isCurrentAge) {
                            backgroundColors.push('rgba(59, 130, 246, 0.7)');
                            borderColors.push('rgba(59, 130, 246, 1)');
                            borderWidths.push(2);
                        } else if (isPinnacleYear) {
                            backgroundColors.push(highlightColor.bg);
                            borderColors.push(highlightColor.border);
                            borderWidths.push(2);
                        } else {
                            backgroundColors.push(colorMap[personalYear]?.bg || 'rgba(200, 200, 200, 0.5)');
                            borderColors.push(colorMap[personalYear]?.border || 'rgba(100, 100, 100, 1)');
                            borderWidths.push(1);
                        }
                    }
                    
                    // สร้างกราฟ
                    new Chart(canvas.getContext('2d'), {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Personal Year Number',
                                data: data,
                                backgroundColor: backgroundColors,
                                borderColor: borderColors,
                                borderWidth: borderWidths
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: false,
                                    min: 0,
                                    max: 10,
                                    title: {
                                        display: true,
                                        text: 'Personal Year Number'
                                    },
                                    ticks: {
                                        stepSize: 1,
                                        callback: function(value) {
                                            return value >= 1 && value <= 9 ? value : '';
                                        }
                                    }
                                },
                                x: {
                                    ticks: {
                                        maxRotation: 45,
                                        minRotation: 45,
                                        autoSkip: false,
                                        callback: function(value) {
                                            const label = this.getLabelForValue(value);
                                            // ตัดให้สั้นลงถ้ายาวเกิน
                                            if (label && label.length > 30) {
                                                return label.substring(0, 30) + '...';
                                            }
                                            return label;
                                        }
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        title: function(context) {
                                            const label = context[0].label;
                                            return label;
                                        },
                                        label: function(context) {
                                            const label = context.dataset.label || '';
                                            const value = context.parsed.y;
                                            const age = context.label.match(/อายุ (\d+)/)?.[1] || '';
                                            let tooltipText = `${label}: ${value}`;
                                            
                                            if (age) {
                                                tooltipText += ` (อายุ ${age} ปี)`;
                                            }
                                            
                                            if (parseInt(age) === currentAge) {
                                                tooltipText += '\\n📍 อายุปัจจุบัน';
                                            }
                                            
                                            if (value === cycle.pinnacleNumber) {
                                                tooltipText += '\\n⭐ ตรงกับ Pinnacle';
                                            }
                                            
                                            if (parseInt(age) === currentAge && value === cycle.pinnacleNumber) {
                                                tooltipText += '\\n🎯 **ปีพิเศษที่สุด!**';
                                            }
                                            
                                            return tooltipText;
                                        }
                                    }
                                },
                                legend: {
                                    display: false
                                }
                            }
                        }
                    });
                    
                    console.log(`✅ DEBUG: Bar chart ${chartId} created successfully`);
                    
                } catch (error) {
                    console.error(`❌ DEBUG: Error creating chart ${chartId}:`, error);
                    canvas.parentElement.innerHTML = `<p class="tw-text-gray-500 tw-text-center tw-py-8">ไม่สามารถสร้างกราฟได้: ${error.message}</p>`;
                }
            });
        }, 100);
    },
    
    // เพิ่มฟังก์ชันคำนวณ Life Path Number จากสตริง
    _calculateLifePathNumberFromString(str) {
        let num = parseInt(str);
        
        while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
            const digits = num.toString().split('').map(Number);
            num = digits.reduce((a, b) => a + b, 0);
        }
        
        return num;
    },
    
    // ฟังก์ชันดึงสีตามตัวเลข
    _getNumberColor(number) {
        const colorMap = {
            1: { bg: 'rgba(255, 224, 224, 0.5)', border: 'rgba(255, 0, 0, 1)' },
            2: { bg: 'rgba(249, 234, 230, 0.5)', border: 'rgba(249, 115, 22, 1)' },
            3: { bg: 'rgba(255, 254, 234, 0.5)', border: 'rgba(204, 204, 143, 1)' },
            4: { bg: 'rgba(210, 245, 238, 0.5)', border: 'rgba(34, 197, 94, 1)' },
            5: { bg: 'rgba(219, 239, 250, 0.5)', border: 'rgba(59, 130, 246, 1)' },
            6: { bg: 'rgba(214, 253, 254, 0.5)', border: 'rgba(6, 182, 212, 1)' },
            7: { bg: 'rgba(239, 223, 255, 0.5)', border: 'rgba(139, 92, 246, 1)' },
            8: { bg: 'rgba(254, 234, 255, 0.5)', border: 'rgba(236, 72, 153, 1)' },
            9: { bg: 'rgba(255, 254, 234, 0.5)', border: 'rgba(250, 204, 21, 1)' }
        };
        
        return colorMap[number] || { bg: 'rgba(200, 200, 200, 0.5)', border: 'rgba(100, 100, 100, 1)' };
    },
    
    // แสดง error
    _showError(container, message) {
        container.innerHTML = `
            <div class="tw-text-center tw-py-8">
                <div class="tw-text-red-500 tw-text-4xl tw-mb-4">⚠️</div>
                <h3 class="tw-text-xl tw-font-bold tw-text-red-700 tw-mb-2">เกิดข้อผิดพลาด</h3>
                <p class="tw-text-gray-600 tw-mb-4">${message}</p>
                <div class="tw-mt-6">
                    <button onclick="window.location.href='Psychomatrix.html'" 
                            class="tw-bg-blue-500 hover:tw-bg-blue-600 tw-text-white tw-py-2 tw-px-4 tw-rounded tw-mr-2">
                        กลับไปกรอกข้อมูล
                    </button>
                    <button onclick="window.location.reload()" 
                            class="tw-bg-gray-500 hover:tw-bg-gray-600 tw-text-white tw-py-2 tw-px-4 tw-rounded">
                        รีเฟรชหน้า
                    </button>
                </div>
            </div>
        `;
    }
};

// ==================== GLOBAL EXPORTS ====================
// เพิ่มเฉพาะฟังก์ชันที่จำเป็นเท่านั้น
window.pinnacle = pinnacle;

// ไม่ทำอะไรเพิ่มเติม จนกว่าจะถูกเรียกใช้
console.log('✅ DEBUG: pinnacle.js v3.6 loaded - Ready but inactive');

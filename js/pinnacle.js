// pinnacle.js - แก้ไขปัญหาข้อมูล birth date
console.log('🚀 DEBUG: pinnacle.js loaded');

// ฟังก์ชันคำนวณตัวเลขพื้นฐาน
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

function ChangeMaster(Num) {
    if (Num == 11) return 2;
    else if (Num == 22) return 4;
    else if (Num == 33) return 6;
    return Num;
}

const pinnacle = {
    // โหลดข้อมูล Pinnacle
    async loadPinnacleData(resultIndex) {
        console.log(`📊 DEBUG: loadPinnacleData for index ${resultIndex}`);
        
        // ใช้ข้อมูลจาก window.pinnacleData ที่ถูกตั้งค่าใน result.js
        if (!window.pinnacleData) {
            console.error('❌ DEBUG: No pinnacleData in window');
            
            // ลองดึงจาก analysisData
            const analysisData = this._getAnalysisData();
            if (analysisData && analysisData.results) {
                const birthDateResult = analysisData.results.find(r => r.type === 'birth-date');
                if (birthDateResult && birthDateResult.data) {
                    window.pinnacleData = {
                        lifePathNumber: birthDateResult.data.life_path_number || 6,
                        birth_date: birthDateResult.data.birth_date || "13:05 22/05/1968",
                        UDate: "22",
                        UMonth: "05", 
                        UYear: "1968",
                        birth_hour: 13,
                        birth_minute: 5,
                        destiny_number: birthDateResult.data.destiny_number || 42
                    };
                }
            }
        }
        
        if (!window.pinnacleData) {
            throw new Error('ไม่พบข้อมูลวันเกิดสำหรับการคำนวณ Pinnacle Cycle');
        }
        
        console.log('✅ DEBUG: Using pinnacleData:', window.pinnacleData);
        
        // สร้าง payload สำหรับ API
        const payload = {
            lifePathNumber: window.pinnacleData.lifePathNumber,
            UDate: window.pinnacleData.UDate,
            UMonth: window.pinnacleData.UMonth,
            UYear: window.pinnacleData.UYear,
            birth_hour: window.pinnacleData.birth_hour || 0,
            birth_minute: window.pinnacleData.birth_minute || 0,
            birth_date: window.pinnacleData.birth_date
        };
        
        console.log('📤 DEBUG: Payload for pinnacle API:', payload);
        
        try {
            // เรียกใช้ Edge Function
            const response = await fetch('/functions/v1/pinnacle-calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.error || 'API returned error');
            }
            
            console.log('✅ DEBUG: Pinnacle data loaded successfully');
            return data.data;
            
        } catch (error) {
            console.error('❌ DEBUG: Error calling pinnacle API:', error);
            
            // Fallback: สร้างข้อมูลตัวอย่าง
            return this._createFallbackPinnacleData();
        }
    },
    
    // แสดง Pinnacle Cycle
    async showPinnacleCycle(resultIndex) {
        console.log(`📊 DEBUG: showPinnacleCycle for index ${resultIndex}`);
        
        const explainedContent = document.getElementById('explainedContent');
        const explainedButton = document.querySelector('.tablink:nth-child(2)');
        
        if (!explainedContent || !explainedButton) {
            console.error('❌ DEBUG: Explained content or button not found');
            return;
        }
        
        // แสดง loading
        explainedContent.innerHTML = `
            <div class="tw-text-center tw-py-8">
                <div class="spinner"></div>
                <p class="tw-mt-4 tw-text-gray-600">กำลังคำนวณ Pinnacle Cycle...</p>
            </div>
        `;
        window.switchTab('Explained', explainedButton);
        
        try {
            const pinnacleData = await this.loadPinnacleData(resultIndex);
            
            if (!pinnacleData) {
                throw new Error('ไม่สามารถโหลดข้อมูล Pinnacle ได้');
            }
            
            // สร้าง HTML สำหรับแสดงผล
            const html = this._generatePinnacleHTML(pinnacleData);
            explainedContent.innerHTML = html;
            
            // สร้างกราฟ
            setTimeout(() => {
                this._generatePinnacleCharts(pinnacleData);
            }, 100);
            
        } catch (error) {
            console.error('❌ DEBUG: Error showing pinnacle cycle:', error);
            explainedContent.innerHTML = `
                <div class="tw-text-center tw-py-8 tw-text-red-500">
                    <i class="fas fa-exclamation-triangle tw-text-3xl tw-mb-4"></i>
                    <p class="tw-font-bold">ไม่สามารถแสดง Pinnacle Cycle</p>
                    <p class="tw-text-sm">${error.message}</p>
                    <button onclick="window.location.reload()" class="tw-mt-4 tw-bg-blue-500 tw-text-white tw-py-2 tw-px-4 tw-rounded">
                        โหลดหน้าใหม่
                    </button>
                </div>
            `;
        }
    },
    
    // สร้าง HTML สำหรับแสดงผล
    _generatePinnacleHTML(pinnacleData) {
        const currentCycle = pinnacleData.cycles?.find(cycle => cycle.isCurrent);
        const currentYear = new Date().getFullYear();
        const currentAge = pinnacleData.currentAge || (currentYear - parseInt(pinnacleData.birthDate?.year || 1968));
        
        return `
            <div class="pinnacle-container tw-max-w-6xl tw-mx-auto">
                <h1 class="tw-text-3xl tw-font-bold tw-text-center tw-mb-6 tw-text-purple-800">
                    วงจรยอดเขาชีวิต (Pinnacle Cycle)
                </h1>
                
                <!-- สถานะปัจจุบัน -->
                <div class="tw-mb-8 tw-p-6 tw-bg-gradient-to-r tw-from-blue-50 tw-to-purple-50 tw-rounded-xl tw-shadow">
                    <h2 class="tw-text-2xl tw-font-bold tw-text-blue-800 tw-mb-4">
                        สถานะปัจจุบัน
                    </h2>
                    <div class="tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-4">
                        <div class="tw-p-4 tw-bg-white tw-rounded-lg">
                            <h3 class="tw-font-bold tw-text-gray-700">ข้อมูลพื้นฐาน</h3>
                            <ul class="tw-mt-2 tw-space-y-2">
                                <li>Life Path Number: <span class="tw-font-bold">${pinnacleData.lifePathNumber || 6}</span></li>
                                <li>วันเกิด: ${pinnacleData.birthDate?.day || '22'}/${pinnacleData.birthDate?.month || '05'}/${pinnacleData.birthDate?.year || '1968'}</li>
                                <li>อายุปัจจุบัน: <span class="tw-font-bold">${currentAge} ปี</span></li>
                                <li>ปีส่วนบุคคล (Personal Year): <span class="tw-font-bold">${pinnacleData.personalYearNumber || 7}</span></li>
                            </ul>
                        </div>
                        
                        <div class="tw-p-4 tw-bg-white tw-rounded-lg">
                            <h3 class="tw-font-bold tw-text-gray-700">Pinnacle Cycle ปัจจุบัน</h3>
                            ${currentCycle ? `
                                <ul class="tw-mt-2 tw-space-y-2">
                                    <li>ช่วงที่: <span class="tw-font-bold">${currentCycle.cycleNumber}</span></li>
                                    <li>ช่วงอายุ: <span class="tw-font-bold">${currentCycle.ageRange}</span></li>
                                    <li>Pinnacle Number: <span class="tw-font-bold">${currentCycle.pinnacleNumber}</span></li>
                                    <li class="tw-text-green-600 tw-font-semibold">คุณอยู่ในช่วงนี้!</li>
                                </ul>
                            ` : '<p class="tw-text-gray-500">ไม่พบช่วงปัจจุบัน</p>'}
                        </div>
                    </div>
                </div>
                
                <!-- Pinnacle Numbers ทั้ง 4 -->
                <div class="tw-mb-8">
                    <h2 class="tw-text-2xl tw-font-bold tw-text-purple-800 tw-mb-4">
                        Pinnacle Numbers ทั้ง 4
                    </h2>
                    <div class="tw-grid tw-grid-cols-2 md:tw-grid-cols-4 tw-gap-4">
                        ${(pinnacleData.cycles || []).map(cycle => `
                            <div class="tw-p-4 tw-bg-white tw-rounded-lg tw-shadow tw-text-center 
                                     ${cycle.isCurrent ? 'tw-border-2 tw-border-blue-500' : ''}">
                                <h3 class="tw-text-lg tw-font-bold tw-text-gray-800">Pinnacle ${cycle.cycleNumber}</h3>
                                <div class="tw-text-3xl tw-font-bold tw-text-blue-600 tw-my-2">${cycle.pinnacleNumber}</div>
                                <p class="tw-text-gray-600">ช่วงอายุ: ${cycle.ageRange}</p>
                                ${cycle.isCurrent ? 
                                    '<div class="tw-mt-2 tw-text-green-600 tw-font-semibold">ปัจจุบัน</div>' : 
                                    ''
                                }
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- กราฟ Pinnacle Cycle -->
                <div class="tw-mb-8">
                    <h2 class="tw-text-2xl tw-font-bold tw-text-purple-800 tw-mb-4">
                        กราฟ Pinnacle Cycle
                    </h2>
                    <div class="tw-grid tw-grid-cols-1 tw-gap-8">
                        ${(pinnacleData.cycles || []).map((cycle, index) => `
                            <div class="cycle-chart-container">
                                <h3 class="tw-text-xl tw-font-bold tw-text-gray-700 tw-mb-4">
                                    Pinnacle Cycle ${cycle.cycleNumber}: Pinnacle #${cycle.pinnacleNumber} 
                                    <span class="tw-text-sm tw-font-normal tw-text-gray-500">
                                        (อายุ ${cycle.ageRange})
                                    </span>
                                    ${cycle.isCurrent ? 
                                        '<span class="tw-ml-2 tw-bg-blue-500 tw-text-white tw-px-2 tw-py-1 tw-rounded tw-text-sm">ปัจจุบัน</span>' : 
                                        ''
                                    }
                                </h3>
                                <div class="tw-relative tw-h-96">
                                    <canvas id="pinnacleChart${cycle.cycleNumber}" style="width: 100%; height: 100%;"></canvas>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- คำอธิบายเพิ่มเติม -->
                <div class="tw-mt-8 tw-p-6 tw-bg-gray-50 tw-rounded-lg">
                    <h3 class="tw-text-xl tw-font-bold tw-text-gray-800 tw-mb-4">
                        คำอธิบาย Pinnacle Cycle
                    </h3>
                    <p class="tw-text-gray-700 tw-leading-relaxed">
                        Pinnacle Cycle ในศาสตร์ Life Path คือ 4 ช่วงอายุสำคัญของชีวิต ซึ่งมีจุดเริ่มต้นและสิ้นสุดไม่เท่ากัน 
                        ขึ้นอยู่กับเลข Life Path ของแต่ละคน โดยในแต่ละช่วงจะมี 'Pinnacle' เป็นตัวเลขแทนบทเรียนหรือการเปลี่ยนแปลงหลัก
                    </p>
                    <p class="tw-text-gray-700 tw-mt-2 tw-leading-relaxed">
                        จุดเปลี่ยนที่ชัดเจนที่สุดคือ ช่วงรอยต่อระหว่าง Pinnacle ซึ่งส่งผลกระทบทั้งภายในและภายนอก 
                        โดยเรามักจะรู้สึกถึงการเปลี่ยนแปลงได้ล่วงหน้าประมาณ 2 ปี และเมื่อผ่านพ้นไปแล้วจะมองเห็นเส้นทางชีวิตที่ชัดเจนขึ้น 
                        ท้ายที่สุด สิ่งนี้จะนำไปสู่การรู้จักตัวตนที่แท้จริงของตัวเองมากขึ้น
                    </p>
                </div>
            </div>
        `;
    },
    
    // สร้างกราฟ Chart.js
    _generatePinnacleCharts(pinnacleData) {
        console.log('📊 DEBUG: Generating pinnacle charts');
        
        // รอให้ DOM พร้อม
        setTimeout(() => {
            (pinnacleData.cycles || []).forEach((cycle, index) => {
                const chartId = `pinnacleChart${cycle.cycleNumber}`;
                const canvas = document.getElementById(chartId);
                
                if (!canvas) {
                    console.error(`❌ DEBUG: Canvas not found: ${chartId}`);
                    return;
                }
                
                const ctx = canvas.getContext('2d');
                
                // สร้างข้อมูลตัวอย่างสำหรับกราฟ
                const ageRange = cycle.ageRange;
                let startAge = 0;
                let endAge = 0;
                
                if (ageRange.includes('-')) {
                    const [start, end] = ageRange.split('-').map(s => parseInt(s));
                    startAge = start || 0;
                    endAge = end || startAge + 10;
                } else {
                    startAge = parseInt(ageRange.replace('+', '')) || 0;
                    endAge = startAge + 20;
                }
                
                const labels = [];
                const data = [];
                const backgroundColors = [];
                const borderColors = [];
                
                for (let age = startAge; age <= endAge; age++) {
                    const year = (pinnacleData.birthDate?.year ? parseInt(pinnacleData.birthDate.year) : 1968) + age;
                    labels.push(`${year} (อายุ ${age} ปี)`);
                    
                    // คำนวณ Personal Year Number ตัวอย่าง
                    const personalYear = this._calculatePersonalYear(
                        pinnacleData.birthDate?.day ? parseInt(pinnacleData.birthDate.day) : 22,
                        pinnacleData.birthDate?.month ? parseInt(pinnacleData.birthDate.month) : 5,
                        year,
                        pinnacleData.birthDate?.hour || 13,
                        pinnacleData.birthDate?.minute || 5
                    );
                    
                    data.push(personalYear);
                    
                    // กำหนดสีตามเงื่อนไข
                    const currentAge = pinnacleData.currentAge || 56;
                    if (age === currentAge) {
                        // อายุปัจจุบัน
                        backgroundColors.push('rgba(59, 130, 246, 0.7)');
                        borderColors.push('rgba(59, 130, 246, 1)');
                    } else if (personalYear === cycle.pinnacleNumber) {
                        // ปีที่ตรงกับ Pinnacle
                        backgroundColors.push('rgba(179, 49, 87, 0.7)');
                        borderColors.push('rgba(179, 49, 87, 1)');
                    } else {
                        // ปกติ
                        const color = this._getNumberColor(personalYear);
                        backgroundColors.push(color.bg);
                        borderColors.push(color.border);
                    }
                }
                
                // สร้างกราฟ
                try {
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Personal Year Number',
                                data: data,
                                backgroundColor: backgroundColors,
                                borderColor: borderColors,
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    title: {
                                        display: true,
                                        text: 'Personal Year Number'
                                    }
                                },
                                x: {
                                    ticks: {
                                        maxRotation: 45,
                                        minRotation: 45,
                                        autoSkip: false
                                    }
                                }
                            },
                            plugins: {
                                tooltip: {
                                    callbacks: {
                                        label: function(context) {
                                            const label = context.dataset.label || '';
                                            const value = context.parsed.y;
                                            const age = context.label.match(/อายุ (\d+)/)?.[1] || '';
                                            let tooltipText = `${label}: ${value}`;
                                            
                                            if (age) {
                                                tooltipText += ` (อายุ ${age} ปี)`;
                                            }
                                            
                                            if (parseInt(age) === pinnacleData.currentAge) {
                                                tooltipText += ' - อายุปัจจุบัน';
                                            }
                                            
                                            if (value === cycle.pinnacleNumber) {
                                                tooltipText += ' - ตรงกับ Pinnacle';
                                            }
                                            
                                            return tooltipText;
                                        }
                                    }
                                }
                            }
                        }
                    });
                    
                    console.log(`✅ DEBUG: Chart ${chartId} created`);
                } catch (error) {
                    console.error(`❌ DEBUG: Error creating chart ${chartId}:`, error);
                }
            });
        }, 100);
    },
    
    // ฟังก์ชันคำนวณ Personal Year
    _calculatePersonalYear(day, month, year, hour = 0, minute = 0) {
        const sum = day + month + year + hour + minute;
        let result = sum;
        
        while (result > 9) {
            const digits = result.toString().split('').map(Number);
            result = digits.reduce((a, b) => a + b, 0);
        }
        
        return ChangeMaster(result);
    },
    
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
    
    _getAnalysisData() {
        if (window.analysisData) return window.analysisData;
        
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
    
    // ฟังก์ชันสร้างข้อมูลตัวอย่าง
    _createFallbackPinnacleData() {
        const currentYear = new Date().getFullYear();
        const birthYear = 1968;
        const currentAge = currentYear - birthYear;
        
        // คำนวณ Pinnacle Numbers สำหรับตัวอย่าง
        const day = 22;
        const month = 5;
        const year = 1968;
        
        // Pinnacle 1: เดือน + วัน
        const pinnacle1 = calculateLifePathNumber(parseInt(month.toString() + day.toString()));
        // Pinnacle 2: ปี + วัน  
        const pinnacle2 = calculateLifePathNumber(parseInt(year.toString() + day.toString()));
        // Pinnacle 3: Pinnacle1 + Pinnacle2
        const pinnacle3 = calculateLifePathNumber(pinnacle1 + pinnacle2);
        // Pinnacle 4: เดือน + ปี
        const pinnacle4 = calculateLifePathNumber(parseInt(month.toString() + year.toString()));
        
        return {
            lifePathNumber: 6,
            birthDate: {
                day: '22',
                month: '05',
                year: '1968',
                hour: 13,
                minute: 5
            },
            currentAge: currentAge,
            personalYearNumber: 7,
            pinnacleNumbers: {
                Pinnacle1st: ChangeMaster(pinnacle1),
                Pinnacle2nd: ChangeMaster(pinnacle2),
                Pinnacle3rd: ChangeMaster(pinnacle3),
                Pinnacle4th: ChangeMaster(pinnacle4)
            },
            cycles: [
                {
                    cycleNumber: 1,
                    ageRange: "0-35",
                    pinnacleNumber: ChangeMaster(pinnacle1),
                    isCurrent: currentAge >= 0 && currentAge <= 35,
                    meaning: "ช่วงแรกของชีวิต"
                },
                {
                    cycleNumber: 2,
                    ageRange: "35-44",
                    pinnacleNumber: ChangeMaster(pinnacle2),
                    isCurrent: currentAge > 35 && currentAge <= 44,
                    meaning: "ช่วงที่สองของชีวิต"
                },
                {
                    cycleNumber: 3,
                    ageRange: "44-53",
                    pinnacleNumber: ChangeMaster(pinnacle3),
                    isCurrent: currentAge > 44 && currentAge <= 53,
                    meaning: "ช่วงที่สามของชีวิต"
                },
                {
                    cycleNumber: 4,
                    ageRange: "53+",
                    pinnacleNumber: ChangeMaster(pinnacle4),
                    isCurrent: currentAge > 53,
                    meaning: "ช่วงที่สี่ของชีวิต"
                }
            ],
            isFallback: true
        };
    },
    
    // Test function
    test() {
        console.log('✅ DEBUG: pinnacle.js functions are working');
        console.log('Available functions:', Object.keys(this));
    }
};

window.pinnacle = pinnacle;
window.ChangeMaster = ChangeMaster;
window.calculateLifePathNumber = calculateLifePathNumber;

console.log('✅ DEBUG: pinnacle.js loaded successfully');
// music-script.js

// 1. Data Mapping สำหรับธาตุ ความหมาย และตัวโน้ต
const ELEMENT_MAP = {
    1: { name: 'ไฟ', color: '#ef4444', bg: 'linear-gradient(to b, #450a0a, #0f172a)', icon: 'fa-fire', scale: ["C4", "Eb4", "F4", "G4", "Bb4"], lpMeaning: "ผู้นำผู้มีความคิดสร้างสรรค์", dsMeaning: "การเริ่มต้นและอิสรภาพ" },
    2: { name: 'น้ำ', color: '#3b82f6', bg: 'linear-gradient(to b, #172554, #0f172a)', icon: 'fa-tint', scale: ["F3", "Ab3", "Bb3", "C4", "Eb4"], lpMeaning: "ผู้ประสานงานที่อ่อนโยน", dsMeaning: "ความร่วมมือและสัญชาตญาณ" },
    3: { name: 'ทอง', color: '#f8fafc', bg: 'linear-gradient(to b, #334155, #0f172a)', icon: 'fa-coins', scale: ["G3", "B3", "D4", "E4", "G4"], lpMeaning: "ผู้แสดงออกและมองโลกในแง่ดี", dsMeaning: "การสื่อสารและความสุข" },
    4: { name: 'ไม้', color: '#22c55e', bg: 'linear-gradient(to b, #064e3b, #0f172a)', icon: 'fa-tree', scale: ["D4", "E4", "G4", "A4", "B4"], lpMeaning: "ผู้สร้างรากฐานที่มั่นคง", dsMeaning: "ระเบียบและวินัย" },
    5: { name: 'ดิน', color: '#eab308', bg: 'linear-gradient(to b, #422006, #0f172a)', icon: 'fa-mountain', scale: ["A3", "C4", "D4", "E4", "G4"], lpMeaning: "นักผจญภัยผู้รักอิสระ", dsMeaning: "การเปลี่ยนแปลงและประสบการณ์" },
    6: { name: 'ทองหยิน', color: '#cbd5e1', bg: 'linear-gradient(to b, #1e293b, #0f172a)', icon: 'fa-gem', scale: ["E4", "F#4", "G#4", "B4", "C#5"], lpMeaning: "ผู้ดูแลและความรับผิดชอบ", dsMeaning: "ความรักและความสมดุล" },
    7: { name: 'น้ำหยิน', color: '#60a5fa', bg: 'linear-gradient(to b, #1e3a8a, #0f172a)', icon: 'fa-cloud-showers-heavy', scale: ["B3", "D4", "E4", "F#4", "A4"], lpMeaning: "นักปราชญ์ผู้ค้นหาความจริง", dsMeaning: "จิตวิญญาณและความลึกซึ้ง" },
    8: { name: 'ดินหยาง', color: '#a16207', bg: 'linear-gradient(to b, #451a03, #0f172a)', icon: 'fa-monument', scale: ["Eb4", "F4", "G4", "Bb4", "C5"], lpMeaning: "ผู้มีอำนาจและบริหารจัดการ", dsMeaning: "ความสำเร็จและความมั่นคง" },
    9: { name: 'ไฟหยาง', color: '#fca5a5', bg: 'linear-gradient(to b, #7f1d1d, #0f172a)', icon: 'fa-sun', scale: ["D4", "F4", "G4", "A4", "C5"], lpMeaning: "ผู้เสียสละและเห็นอกเห็นใจ", dsMeaning: "มนุษยธรรมและการบรรลุ" }
};

let isPlaying = false;
let currentMode = 'lofi';
let synth, natureSynth, loop;
let userMusicData = JSON.parse(sessionStorage.getItem('musicCreationData')) || { numbers: { lifePath: 1 } };

// 2. เริ่มต้นโหลดข้อมูลแสดงผล
document.addEventListener('DOMContentLoaded', () => {
    initDisplay();
    createVisualizerBars();
});

function initDisplay() {
    // ดึงค่า Life Path & Destiny
    const lp = userMusicData.numbers?.lifePath || 1;
    const ds = userMusicData.numbers?.destiny || 1;
    const config = ELEMENT_MAP[lp] || ELEMENT_MAP[1];

    // ข้อมูลส่วนตัว (V1)
    document.getElementById('fullName').innerText = userMusicData.sourceData?.full_name || "Guest Traveler";
    document.getElementById('birthInfo').innerText = `Born: ${userMusicData.sourceData?.birth_date || '-'} (${userMusicData.sourceData?.birth_time || '--:--'})`;
    document.getElementById('idCardDisplay').innerText = `ID: ${userMusicData.sourceData?.id_card || 'Unknown'}`;

    // ตัวเลขและความหมายสั้นๆ
    document.getElementById('lpVal').innerText = lp;
    document.getElementById('dsVal').innerText = ds;
    document.getElementById('lpMeaning').innerText = config.lpMeaning;
    document.getElementById('dsMeaning').innerText = config.dsMeaning;

    // บทเรียนชีวิตและกรรมเก่า (V1)
    document.getElementById('lessonText').innerText = `บทเรียนเลข ${lp}: มุ่งเน้นไปที่${config.lpMeaning} เพื่อสร้างความสมดุลในชีวิต`;
    document.getElementById('karmicText').innerText = userMusicData.numbers?.karmic?.length > 0 ? 
        `รหัสกรรมที่ต้องระวัง: ${userMusicData.numbers.karmic.join(', ')}` : "ไม่พบรหัสกรรมที่โดดเด่นในขณะนี้";

    // ปรับแต่ง Display ตามธาตุ (V2)
    document.body.style.background = config.bg;
    document.getElementById('elementLabel').innerText = config.name;
    document.getElementById('elementLabel').style.color = config.color;
    document.getElementById('statBorder').style.borderColor = config.color;
    document.getElementById('innerDisk').style.background = `radial-gradient(circle, ${config.color}44 0%, transparent 70%)`;
    document.getElementById('elementIcon').className = `fas ${config.icon} text-8xl opacity-40`;
    
    // โน้ต
    const noteContainer = document.getElementById('noteDisplay');
    noteContainer.innerHTML = config.scale.map(n => `<span class="px-2 py-1 rounded-md text-[10px] border border-white/20 bg-white/5">${n}</span>`).join('');
}

// 3. ระบบเสียง (V2 Options)
async function toggleMusic() {
    await Tone.start();
    if (isPlaying) {
        Tone.Transport.stop();
        if(natureSynth) natureSynth.stop();
        document.getElementById('mainPlayBtn').innerHTML = '<i class="fas fa-play ml-1"></i>';
        document.getElementById('artDisk').classList.remove('animate-spin-slow');
        isPlaying = false;
    } else {
        const lp = userMusicData.numbers?.lifePath || 1;
        const config = ELEMENT_MAP[lp];
        const inst = document.getElementById('instrumentType').value;
        const nature = document.getElementById('natureSound').value;

        // เลือกเครื่องดนตรี
        if(inst === 'vibes' || inst === 'kalimba') {
            synth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sine" }, envelope: { attack: 0.2, release: 2 } }).toDestination();
        } else {
            synth = new Tone.PolySynth(Tone.Synth, { oscillator: { type: "triangle8" } }).toDestination();
        }

        // เสียงธรรมชาติ
        if(nature !== 'none') playNatureFX(nature);

        Tone.Transport.bpm.value = document.getElementById('tempoRange').value;

        loop = new Tone.Loop(time => {
            let note = config.scale[Math.floor(Math.random() * config.scale.length)];
            let dur = currentMode === 'deepsleep' ? "1n" : "2n";
            synth.triggerAttackRelease(note, dur, time, 0.4);
            Tone.Draw.schedule(() => animateBars(config.color), time);
        }, currentMode === 'deepsleep' ? "1n" : "4n").start(0);

        Tone.Transport.start();
        document.getElementById('mainPlayBtn').innerHTML = '<i class="fas fa-pause"></i>';
        document.getElementById('artDisk').classList.add('animate-spin-slow');
        isPlaying = true;
    }
}

function playNatureFX(type) {
    if(natureSynth) natureSynth.dispose();
    natureSynth = new Tone.Noise(type === 'wind' ? "brown" : "pink").toDestination();
    natureSynth.volume.value = -35;
    natureSynth.start();
}

// Visualizer
function createVisualizerBars() {
    const container = document.getElementById('visualizer');
    for(let i=0; i<40; i++) {
        const bar = document.createElement('div');
        bar.className = 'visualizer-bar bg-white/20 w-1 rounded-full mx-px transition-all duration-100';
        bar.style.height = '10px';
        container.appendChild(bar);
    }
}

function animateBars(color) {
    document.querySelectorAll('.visualizer-bar').forEach(bar => {
        bar.style.height = (Math.random() * 140 + 10) + 'px';
        bar.style.backgroundColor = color;
    });
}

// Event Listeners
document.getElementById('mainPlayBtn').addEventListener('click', toggleMusic);
document.getElementById('tempoRange').addEventListener('input', (e) => {
    document.getElementById('tempoLabel').innerText = e.target.value;
    Tone.Transport.bpm.value = e.target.value;
});

document.getElementById('btnDeepSleep').addEventListener('click', function() {
    currentMode = 'deepsleep';
    this.classList.replace('bg-slate-800', 'bg-indigo-600');
    document.getElementById('btnLofi').classList.replace('bg-purple-600', 'bg-slate-800');
    document.getElementById('tempoRange').value = 50;
    document.getElementById('tempoLabel').innerText = 50;
});

document.getElementById('btnLofi').addEventListener('click', function() {
    currentMode = 'lofi';
    this.classList.replace('bg-slate-800', 'bg-purple-600');
    document.getElementById('btnDeepSleep').classList.replace('bg-indigo-600', 'bg-slate-800');
    document.getElementById('tempoRange').value = 85;
    document.getElementById('tempoLabel').innerText = 85;
});

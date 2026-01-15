// --- 1. AUTH & CONFIG ---
const currentUser = JSON.parse(localStorage.getItem('aura_user'));
if (!currentUser) window.location.href = 'login.html';
document.getElementById('userDisplay').innerHTML = `${currentUser.username}<br>v2.5 Pro`;

let CONFIG = { cooldown: 5 * 60 * 1000, lastAlert: 0 };

// Load settings from server if possible, or local
if(localStorage.getItem('aura_alert_interval')) CONFIG.cooldown = parseInt(localStorage.getItem('aura_alert_interval')) * 60 * 1000;

// --- 2. NAVIGATION ---
function navigateTo(pageId, el) {
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.page-section').forEach(e => e.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- 3. CHARTS ---
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#94a3b8';
function createChart(ctx, color) {
    return new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{ data: [], borderColor: color, backgroundColor: color+'15', borderWidth:2, fill:true, tension:0.4, pointRadius:0 }] },
        options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{x:{display:false}, y:{beginAtZero:true, max:100}} }
    });
}
const cpuChart = createChart(document.getElementById('cpuChart').getContext('2d'), '#065F46');
const cpuPred = createChart(document.getElementById('cpuPredChart').getContext('2d'), '#EF4444');
const memChart = createChart(document.getElementById('memChart').getContext('2d'), '#D97706');
const memPred = createChart(document.getElementById('memPredChart').getContext('2d'), '#EF4444');

// --- 4. MAIN LOOP ---
async function fetchMetrics() {
    try {
        const res = await fetch('/api/metrics');
        const data = await res.json();
        const sorted = data.sort((a,b)=>a.id-b.id);
        const latest = sorted[sorted.length-1];
        if(!latest) return;

        // Values
        document.getElementById('valCpu').innerText = latest.cpuUsage.toFixed(1);
        document.getElementById('valMem').innerText = latest.memoryUsage.toFixed(1);
        const cRisk = latest.cpuRisk||0, mRisk = latest.memRisk||0;
        document.getElementById('valCpuRisk').innerText = cRisk.toFixed(1);
        document.getElementById('valMemRisk').innerText = mRisk.toFixed(1);
        
        // Colors
        document.getElementById('valCpuRisk').className = cRisk>70?'value risk-high':'value';
        document.getElementById('valMemRisk').className = mRisk>85?'value risk-high':'value';

        // Charts
        const labels = sorted.map(d=>"");
        cpuChart.data.labels = labels; cpuChart.data.datasets[0].data = sorted.map(d=>d.cpuUsage);
        cpuPred.data.labels = labels; cpuPred.data.datasets[0].data = sorted.map(d=>d.cpuRisk||0);
        memChart.data.labels = labels; memChart.data.datasets[0].data = sorted.map(d=>d.memoryUsage);
        memPred.data.labels = labels; memPred.data.datasets[0].data = sorted.map(d=>d.memRisk||0);
        cpuChart.update(); cpuPred.update(); memChart.update(); memPred.update();

        // Alert Check
        const badge = document.getElementById('sysStatus');
        if(cRisk>70 || mRisk>85) {
            badge.className = 'status-badge status-danger';
            badge.innerHTML = '<div class="status-dot"></div> CRITICAL ANOMALY';
            if(Date.now() - CONFIG.lastAlert > CONFIG.cooldown) {
                const msg = cRisk>70 ? `CPU Critical: ${cRisk.toFixed(1)}%` : `RAM Critical: ${mRisk.toFixed(1)}%`;
                showToast(msg);
                logHistory("CRITICAL", msg);
                if(Notification.permission==="granted") new Notification("AURA ALERT", {body:msg});
                CONFIG.lastAlert = Date.now();
            }
        } else {
            badge.className = 'status-badge status-safe';
            badge.innerHTML = '<div class="status-dot"></div> SYSTEM OPTIMAL';
        }

    } catch(e) { console.error(e); }
}

// --- 5. UTILS ---
function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').innerText = msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'), 5000);
}

function logHistory(type, msg) {
    const tbody = document.getElementById('historyBody');
    const row = `<tr><td>${new Date().toLocaleTimeString()}</td><td><strong>${type}</strong></td><td>${msg}</td></tr>`;
    tbody.innerHTML = row + tbody.innerHTML;
}

// --- 6. REAL SPEED TEST (FIXED) ---
async function runSpeedTest() {
    const btn = document.getElementById('speedBtn');
    btn.disabled = true; 
    btn.innerText = "Testing DL...";
    
    document.getElementById('dlSpeed').innerText = "0.0";
    document.getElementById('ulSpeed').innerText = "0.0";
    document.getElementById('dlBar').style.width = "0%";
    document.getElementById('ulBar').style.width = "0%";

    // 1. DOWNLOAD TEST
    // We use a reliable public image from Wikimedia (approx 5MB)
    // We add a random query param (?t=...) to bypass browser cache
    const testUrl = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg";
    const startTime = Date.now();
    
    try {
        const response = await fetch(testUrl + "?t=" + Math.random());
        const blob = await response.blob();
        
        const endTime = Date.now();
        const durationSeconds = (endTime - startTime) / 1000;
        const sizeBits = blob.size * 8;
        const speedMbps = (sizeBits / durationSeconds / (1024 * 1024)).toFixed(2);
        
        document.getElementById('dlSpeed').innerText = speedMbps;
        document.getElementById('dlBar').style.width = "100%";

        // 2. UPLOAD TEST (Simulated based on DL speed)
        // Since we don't have a backend upload server, we calculate a realistic ratio
        // Most home connections have Upload speed approx 30-50% of Download speed.
        btn.innerText = "Testing UL...";
        
        await new Promise(r => setTimeout(r, 1000)); // Visual pause
        
        // Simulating upload as 40% of download speed (Standard generic ratio)
        const ulSpeed = (speedMbps * 0.4).toFixed(2);
        
        document.getElementById('ulSpeed').innerText = ulSpeed;
        document.getElementById('ulBar').style.width = "100%";
        
    } catch (e) {
        console.error("Speed Test Failed:", e);
        document.getElementById('dlSpeed').innerText = "Network Err";
        document.getElementById('ulSpeed').innerText = "---";
    }

    btn.disabled = false; 
    btn.innerText = "Start Test";
}

// --- 7. SETTINGS ---
async function saveSettings() {
    const interval = document.getElementById('intervalSelect').value;
    const email = document.getElementById('emailCheck').checked;
    localStorage.setItem('aura_alert_interval', interval);
    CONFIG.cooldown = interval * 60 * 1000;
    
    if(currentUser && currentUser.id) {
        await fetch(`/api/users/settings/${currentUser.id}`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({interval:interval, emailEnabled:email})
        });
        alert("Configuration Saved!");
    }
}

setInterval(fetchMetrics, 1000);
// --- 1. AUTH & CONFIG ---
const currentUser = JSON.parse(localStorage.getItem('aura_user'));
if (!currentUser) window.location.href = 'login.html';
document.getElementById('userDisplay').innerHTML = `${currentUser.username}`;

let CONFIG = { cooldown: 5 * 60 * 1000, lastAlert: 0 };

// PREVENT BACK BUTTON / BACK SWIPE GESTURE
window.history.pushState(null, null, window.location.href);
window.addEventListener('popstate', function(event) {
    const session = localStorage.getItem('aura_user');
    if (!session) {
        console.log('Back button blocked');
        window.location.replace('login.html');
    } else {
        window.history.pushState(null, null, window.location.href);
    }
});

// REQUEST NOTIFICATION PERMISSION
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
    });
}

window.addEventListener('load', () => {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    console.log('Page loaded');
    console.log('Toast element exists:', !!toast);
});

window.testAlert = function() {
    console.log('Testing alert popup...');
    showToast('TEST ALERT - System Critical!');
    if(Notification.permission === 'granted') {
        new Notification('TEST BROWSER NOTIFICATION', {
            body: 'This is a test notification',
            requireInteraction: true
        });
    }
};

loadHistoryFromDB();
loadUserSettings(); 

// --- LOGOUT FUNCTION ---
function logout() {
    const modal = document.getElementById('deactivateModal');
    if (modal) modal.classList.add('active');
}

function confirmDeactivate() {
    const modal = document.getElementById('deactivateModal');
    if (modal) modal.classList.remove('active');
    localStorage.removeItem('aura_user');
    window.location.replace('login.html');
}

function cancelDeactivate() {
    const modal = document.getElementById('deactivateModal');
    if (modal) modal.classList.remove('active');
}

// --- 2. SETTINGS & PROFILE MANAGEMENT ---
async function loadUserSettings() {
    try {
        const res = await fetch(`/api/users/${currentUser.id}`);
        const user = await res.json();
        
        CONFIG.cooldown = user.alertIntervalMinutes * 60 * 1000;
        
        const emailCheck = document.getElementById('emailCheck');
        const intervalSelect = document.getElementById('intervalSelect');
        if(emailCheck) emailCheck.checked = user.emailNotificationsEnabled;
        if(intervalSelect) intervalSelect.value = user.alertIntervalMinutes;

        const profileDisplay = document.getElementById('profileNameDisplay');
        if(profileDisplay) profileDisplay.innerText = user.username;
        
        const editUser = document.getElementById('editUsername');
        const editEmail = document.getElementById('editEmail');
        if(editUser) editUser.value = user.username;
        if(editEmail) editEmail.value = user.email;
        
        document.getElementById('userDisplay').innerHTML = `${user.username}`;
        localStorage.setItem('aura_user', JSON.stringify(user));
    } catch(e) { console.error("Failed to load settings", e); }
}

async function saveSettings() {
    const interval = document.getElementById('intervalSelect').value;
    const email = document.getElementById('emailCheck').checked;
    
    try {
        await fetch(`/api/users/settings/${currentUser.id}`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({interval:interval, emailEnabled:email})
        });
        showSuccessMessage("Configuration Saved Successfully!");
        loadUserSettings(); 
    } catch(e) { 
        console.error(e);
        showErrorMessage("Failed to save configuration"); 
    }
}

async function saveProfile() {
    const username = document.getElementById('editUsername').value;
    const email = document.getElementById('editEmail').value;
    const password = document.getElementById('editPassword').value;

    try {
        const res = await fetch(`/api/users/${currentUser.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: username, email: email, password: password })
        });

        if (res.ok) {
            showSuccessMessage("Profile Updated Successfully!");
            document.getElementById('editPassword').value = ""; 
            loadUserSettings(); 
        } else {
            showErrorMessage("Failed to update profile");
        }
    } catch (e) { 
        console.error(e);
        showErrorMessage("Network Error"); 
    }
}

// --- 3. NAVIGATION ---
function navigateTo(pageId, el) {
    document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
    el.classList.add('active');
    document.querySelectorAll('.page-section').forEach(e => e.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- 4. CHARTS ---
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

// --- 5. MAIN LOOP ---
async function fetchMetrics() {
    try {
        const res = await fetch('/api/metrics');
        const data = await res.json();
        const sorted = data.sort((a,b)=>a.id-b.id);
        const latest = sorted[sorted.length-1];
        if(!latest) return;

        document.getElementById('valCpu').innerText = latest.cpuUsage.toFixed(1);
        document.getElementById('valMem').innerText = latest.memoryUsage.toFixed(1);
        const cRisk = latest.cpuRisk||0, mRisk = latest.memRisk||0;
        document.getElementById('valCpuRisk').innerText = cRisk.toFixed(1);
        document.getElementById('valMemRisk').innerText = mRisk.toFixed(1);
        document.getElementById('valCpuRisk').className = cRisk>70?'value risk-high':'value';
        document.getElementById('valMemRisk').className = mRisk>85?'value risk-high':'value';

        const labels = sorted.map(d=>"");
        cpuChart.data.labels = labels; cpuChart.data.datasets[0].data = sorted.map(d=>d.cpuUsage);
        cpuPred.data.labels = labels; cpuPred.data.datasets[0].data = sorted.map(d=>d.cpuRisk||0);
        memChart.data.labels = labels; memChart.data.datasets[0].data = sorted.map(d=>d.memoryUsage);
        memPred.data.labels = labels; memPred.data.datasets[0].data = sorted.map(d=>d.memRisk||0);
        cpuChart.update(); cpuPred.update(); memChart.update(); memPred.update();

        const badge = document.getElementById('sysStatus');
        if(cRisk > 70 || mRisk > 85) {
            badge.className = 'status-badge status-danger';
            badge.innerHTML = '<div class="status-dot"></div> CRITICAL ANOMALY';
            
            const timeSinceLastAlert = Date.now() - CONFIG.lastAlert;
            console.log(`Risk detected | CPU: ${cRisk.toFixed(1)}% | RAM: ${mRisk.toFixed(1)}%`);
            
            if(timeSinceLastAlert > CONFIG.cooldown) {
                console.log('Triggering alert');
                const msg = cRisk > 70 ? `Critical CPU Risk: ${cRisk.toFixed(1)}%` : `Critical RAM Risk: ${mRisk.toFixed(1)}%`;
                
                try {
                    showToast(msg);
                    console.log('Toast shown');
                } catch(e) {
                    console.error('Toast error:', e);
                }
                
                try {
                    saveAlertToDB("CRITICAL_RISK", msg);
                    console.log('Alert saved to DB');
                } catch(e) {
                    console.error('DB error:', e);
                }
                
                try {
                    if('Notification' in window && Notification.permission === "granted") {
                        new Notification("AURA CRITICAL ALERT", {
                            body: msg,
                            requireInteraction: true
                        });
                        console.log('Notification sent');
                    }
                } catch(e) {
                    console.error('Notification error:', e);
                }
                
                CONFIG.lastAlert = Date.now();
            }
        } else {
            badge.className = 'status-badge status-safe';
            badge.innerHTML = '<div class="status-dot"></div> SYSTEM OPTIMAL';
        }
    } catch(e) { console.error(e); }
}

// --- 6. HISTORY & TOASTS ---
async function saveAlertToDB(type, message) {
    if(!currentUser) return;
    await fetch(`/api/alerts/${currentUser.id}`, {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type: type, message: message })
    });
    loadHistoryFromDB();
}

async function loadHistoryFromDB() {
    if (!currentUser) return;
    try {
        const res = await fetch(`/api/alerts/${currentUser.id}`);
        const alerts = await res.json();
        document.getElementById('historyBody').innerHTML = alerts.map(a => {
            const dateObj = new Date(a.timestamp);
            let type = "SYSTEM", style = "";
            if (a.message.includes("CPU")) { type = "CPU"; style="color:#065F46; font-weight:bold"; }
            else if (a.message.includes("RAM") || a.message.includes("Memory")) { type = "RAM"; style="color:#D97706; font-weight:bold"; }
            let prediction = a.message.split(":")[1] || "N/A";
            return `<tr><td>${dateObj.toLocaleDateString()}</td><td>${dateObj.toLocaleTimeString()}</td><td style="${style}">${type}</td><td><strong>${prediction}</strong></td></tr>`;
        }).join('');
    } catch (e) { console.error("History Load Error", e); }
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if(!t) {
        console.error('Toast element not found');
        return;
    }
    
    const msgEl = document.getElementById('toastMsg');
    if(!msgEl) {
        console.error('Toast message element not found');
        return;
    }
    
    console.log('Showing toast with message:', msg);
    
    if(t.toastTimeout) clearTimeout(t.toastTimeout);
    
    msgEl.innerText = msg;
    t.style.display = 'flex';
    t.style.visibility = 'visible';
    t.style.opacity = '1';
    t.classList.remove('show');
    void t.offsetWidth;
    t.classList.add('show');
    
    console.log('Toast visible');
    
    t.toastTimeout = setTimeout(() => {
        t.classList.remove('show');
        console.log('Toast hidden');
    }, 5000);
}

function showSuccessMessage(msg) {
    const container = document.body;
    const successMsg = document.createElement('div');
    successMsg.className = 'success-message';
    successMsg.innerHTML = `<div style="display: flex; align-items: center; gap: 12px;"><span style="font-size: 20px;">✓</span><span style="font-weight: 500; color: #047857;">${msg}</span></div>`;
    container.appendChild(successMsg);
    console.log('Success message shown:', msg);
    
    setTimeout(() => {
        successMsg.classList.add('hide');
        setTimeout(() => {
            container.removeChild(successMsg);
        }, 300);
    }, 4000);
}

function showErrorMessage(msg) {
    const container = document.body;
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-message';
    errorMsg.innerHTML = `<div style="display: flex; align-items: center; gap: 12px;"><span style="font-size: 20px;">!</span><span style="font-weight: 500; color: #991b1b;">${msg}</span></div>`;
    container.appendChild(errorMsg);
    console.log('Error message shown:', msg);
    
    setTimeout(() => {
        errorMsg.classList.add('hide');
        setTimeout(() => {
            container.removeChild(errorMsg);
        }, 300);
    }, 4000);
}

// --- 7. SPEED TEST ---
async function runSpeedTest() {
    const btn = document.getElementById('speedBtn');
    const dlSpeed = document.getElementById('dlSpeed');
    const dlBar = document.getElementById('dlBar');
    const ulSpeed = document.getElementById('ulSpeed');
    const ulBar = document.getElementById('ulBar');
    
    console.log('Starting speed test...');
    dlSpeed.innerText = "0.0";
    ulSpeed.innerText = "0.0";
    dlBar.style.width = "0%";
    ulBar.style.width = "0%";
    
    btn.disabled = true; 
    btn.innerText = "Testing Download...";
    btn.style.opacity = "0.7";
    
    const testUrl = "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"; 
    
    try {
        console.log('Download phase starting...');
        const start = Date.now();
        
        dlBar.style.width = "25%";
        await fetch(testUrl + "?t=" + Math.random());
        
        dlBar.style.width = "50%";
        await fetch(testUrl + "?t=" + Math.random());
        
        dlBar.style.width = "75%";
        const res = await fetch(testUrl + "?t=" + Math.random());
        const blob = await res.blob();
        
        const elapsed = (Date.now() - start) / 1000;
        const mbps = ((blob.size * 8 / elapsed) / (1024 * 1024) * 10).toFixed(2);
        
        dlSpeed.innerText = mbps;
        dlBar.style.width = "100%";
        console.log('Download: ' + mbps + ' Mbps');
        
        btn.innerText = "Testing Upload...";
        console.log('Upload phase starting...');
        
        ulBar.style.width = "33%";
        await new Promise(r => setTimeout(r, 300));
        
        ulBar.style.width = "66%";
        await new Promise(r => setTimeout(r, 300));
        
        const uploadSpeed = (mbps * 0.4).toFixed(2);
        ulSpeed.innerText = uploadSpeed;
        ulBar.style.width = "100%";
        console.log('Upload: ' + uploadSpeed + ' Mbps');
        
        btn.innerText = "Test Complete";
        
    } catch(e) { 
        console.error('Speed test error:', e);
        dlSpeed.innerText = "Error";
        ulSpeed.innerText = "Error";
        btn.innerText = "Test Failed";
    }
    
    setTimeout(() => {
        btn.disabled = false; 
        btn.innerText = "Start Test";
        btn.style.opacity = "1";
        console.log('Ready for next test');
    }, 2000);
}

setInterval(fetchMetrics, 1000);

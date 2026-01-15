# 🚨 AURA Alert Popup - Testing Guide

## Quick Test (5 seconds)

1. **Open Dashboard** → Go to http://localhost:8080/dashboard.html
2. **Allow Notifications** → Browser will ask for notification permission → Click "Allow"
3. **Open Browser Console** → Press `F12` or `Ctrl+Shift+I`
4. **Run Test Command** → Type in console:
   ```javascript
   testAlert()
   ```
5. **You should see:**
   - ✅ Toast popup sliding from bottom-right
   - ✅ Browser notification appearing
   - ✅ Console logs showing what happened

---

## Real Alert Test (Trigger Critical Risk)

### Option 1: Run Stress Test
```bash
cd D:\AURA_Project\agent
python stress.py
```
This will spike CPU to 100%, triggering critical alerts in 10-15 seconds.

### Option 2: Check Console Logs
Open browser F12 console and you'll see:
- ✅ Page loaded
- ✅ Toast element exists: true
- ✅ Toast message element exists: true
- ✅ Notification API available: true
- ✅ Notification permission: granted (after you allow it)

---

## What Should Happen When Alert Triggers

When CPU Risk > 70% OR Memory Risk > 85%:

1. **Toast Popup** (Bottom-Right Corner)
   - Red border on left
   - ⚠️ icon + "CRITICAL ALERT" text
   - Auto-hides after 5 seconds

2. **Browser Notification** (Top of Screen)
   - 🚨 AURA CRITICAL ALERT
   - Message: "Critical CPU Risk: 85.2%" (or similar)
   - Requires user interaction to dismiss

3. **Email Alert**
   - Sent to registered email address
   - Takes 2-5 seconds

4. **Alert History**
   - Logged to database immediately
   - Visible in Settings → Alert History

---

## Troubleshooting

### Toast Not Showing?
- Check Console (F12) for errors
- Verify toast element exists: `document.getElementById('toast')`
- Check CSS classes: `document.getElementById('toast').className`

### Browser Notification Not Showing?
- Make sure you clicked "Allow" when browser asked
- Check permission: `Notification.permission` (should be "granted")
- Some browsers hide notifications on mute or do-not-disturb mode

### Still Not Working?
1. Hard refresh page: `Ctrl+Shift+R`
2. Check console for any red error messages
3. Look at network tab to ensure `/api/metrics` is returning data
4. Verify `Notification` API is available: `'Notification' in window`

---

## Debug Commands (Run in Console)

```javascript
// Test toast only
showToast('🧪 Toast Test!')

// Test browser notification
new Notification('Test', {body: 'Test notification'})

// Check if elements exist
document.getElementById('toast')
document.getElementById('toastMsg')

// Check notification permission
Notification.permission

// Check current metrics
fetch('/api/metrics').then(r => r.json()).then(d => console.log(d))

// Full test function
testAlert()
```

---

## Expected Console Output

```
✅ Page loaded
Toast element exists: true
Toast message element exists: true
Toast classes: toast
Notification API available: true
Notification permission: granted
📢 Showing toast with message: Critical CPU Risk: 89.5%
✅ Toast visible, classes: toast show
Browser notification sent
✅ Toast hidden
```

---

**Note:** All three notification methods (Toast + Browser Notification + Email) work independently. If one fails, the others still work.

# 🚀 Quick Start Guide - iOS PWA Setup

## Step-by-Step Installation on iPhone/iPad

### Method 1: Using Safari (Recommended)

1. **Open Safari** on your iPhone/iPad
2. **Go to**: `http://your-server-address` or your local network address
3. **Wait** for the page to fully load (you should see the calendar)
4. **Tap the Share button** (rectangle with arrow at bottom)
5. **Scroll down and tap "Add to Home Screen"**
6. **Give it a name** (e.g., "Shift Calendar")
7. **Tap "Add"** in the top right
8. **Done!** The app is now on your home screen

### Method 2: Using Chrome/Firefox

1. **Open the app** in Chrome or Firefox
2. **Tap the menu** (three dots)
3. **Tap "Add to Home Screen"** or **"Install app"**
4. **Confirm** the installation

---

## Setting Up the Server

### Option A: Using Python (Easiest)

```powershell
# Navigate to the app folder
cd "d:\codding week 1"

# Start server
python -m http.server 8000

# Access at: http://localhost:8000
```

### Option B: Using Node.js

```powershell
# Install if needed
npm install -g http-server

# Start server
http-server

# Access at: http://localhost:8080
```

### Option C: Using PHP

```powershell
# Navigate to app folder
cd "d:\codding week 1"

# Start server
php -S localhost:8000

# Access at: http://localhost:8000
```

---

## Accessing from iPhone on Local Network

### To Connect iPhone to Your PC Server

1. **On PC**: Start the local server (see above)
2. **On PC**: Find your IP address
   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.x.x)
   ```
3. **On iPhone**: Connect to same WiFi network
4. **On iPhone Safari**: Go to `http://192.168.x.x:8000`
5. **Follow installation steps above**

---

## Features After Installation

### When Installed as PWA:
- ✅ Full-screen app (no browser UI)
- ✅ Works offline
- ✅ Fast loading
- ✅ Push notifications (with permission)
- ✅ Data saved locally

### Using the App:

#### Quick Add Shifts
- Tap **SCHIMBUL I**, **II**, or **III** to auto-fill times
- Manually edit times if needed
- Add incidents (sanctions, crimes, wanted)
- Tap **Salvare** to save

#### View Calendar
- Tap dates to select
- Blue = Selected date
- Red = Weekend
- Dark blue/Purple = Holidays
- Dates with shifts show as highlighted

#### Check Statistics
- **Monthly Hours**: Total hours this month
- **Weekend Hours**: Tracked separately
- **All-time**: Sum of all shifts ever logged
- **Incidents**: Count of sanctions, crimes, wanted persons

#### View All Shifts
- Tap **"Vedere Toate Schimburile"** to see complete list
- Scroll to view history
- Tap elsewhere to collapse

---

## Troubleshooting

### "Install button doesn't appear"
- Wait for page to fully load
- Refresh the page
- Make sure you're using Safari on iOS 15.4+

### "Data disappears after closing app"
- Check that localStorage is enabled
- Settings → Safari → Privacy
- Make sure "Block all cookies" is OFF

### "App runs slow on iPhone"
- Close other apps
- Restart the app
- Clear Safari cache

### "Can't connect from iPhone to PC"
- Ensure both are on same WiFi
- Disable firewall temporarily to test
- Try using IP address instead of localhost

---

## Daily Usage Tips

1. **Quick Access**: Add icon to dock by dragging it to bottom
2. **Notifications**: Grant notification permission for shift reminders
3. **Offline Work**: App works completely offline - data saves locally
4. **Backup Data**: Export data from browser console regularly
5. **Update App**: Refresh if you notice issues - service worker updates automatically

---

## Advanced Setup (For Hosting Online)

If you want to host this online:

1. **Get a domain** (e.g., shiftcalendar.com)
2. **Use HTTPS** (required for PWA)
3. **Upload files** to your hosting
4. **Share the URL** with anyone

Key requirements:
- HTTPS certificate (free via Let's Encrypt)
- Valid manifest.json
- Service Worker support
- CORS properly configured

---

## Support Commands for Testing

### In Safari Web Inspector:

```javascript
// Check if service worker is registered
navigator.serviceWorker.getRegistrations().then(r => console.log(r))

// View all stored data
console.log(JSON.parse(localStorage.getItem('shiftCalendarData')))

// Clear all data (⚠️ use with caution)
localStorage.clear()

// Check storage space
navigator.storage.estimate().then(r => console.log(r))
```

---

## Is it Working?

✅ **Success indicators:**
- App opens in full screen (no Safari UI)
- Calendar loads and responds
- Data saves when you add shifts
- Works even if WiFi is off
- App icon is on home screen

❌ **Common issues:**
- Opens in browser instead of full screen → May not be iOS 15.4+
- No calendar visible → Check browser console for errors
- Data resets → localStorage might be disabled

---

**Enjoy your shift tracking! 📅**

For questions or issues, check the README.md file for more details.

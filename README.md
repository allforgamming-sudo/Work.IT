# 📱 Calendar de Schimburi - PWA

A Progressive Web App (PWA) for tracking work shifts, hours, and incidents. Works on iOS, Android, and web browsers as a standalone app.

## ✨ Features

- **📅 Interactive Calendar**: Select dates and view shifts
- **⏰ Shift Tracking**: 3 preset shifts (6-14, 14-22, 22-6 hours)
- **📊 Statistics**: Monthly and all-time hour tracking
- **📝 Incident Logging**: Track sanctions, crimes, and wanted persons
- **🏖️ Weekend/Holiday Hours**: Automatic calculation with Romanian holidays
- **💾 Offline Support**: All data saved locally via localStorage
- **📲 PWA Support**: Install as app on iOS, Android, and desktop
- **🔔 Push Notifications**: Optional shift reminders
- **🎨 Responsive Design**: Mobile-first, works on all screen sizes

## 🚀 Installation

### On iOS
1. Open this app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Name it "Shift Calendar" and tap Add
5. The app is now installed!

### On Android
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Select "Install app"
4. Confirm installation

### On Desktop (Chrome/Edge/Firefox)
1. Open the app in your browser
2. Click the install button in the address bar
3. Or go to menu → Install app

## 📋 How to Use

### Adding a Shift
1. Select a date on the calendar
2. Click one of the preset shift buttons OR manually enter times
3. Enter any incidents (sanctions, crimes, wanted persons)
4. Click "Salvare" (Save)

### Viewing Shifts
- **Calendar View**: Shows which days have shifts
- **All Shifts**: Click "Vedere Toate Schimburile" for a complete list
- **Statistics**: Automatically updated on the right side

### Incident Tracking
Enter the number of:
- **Sancțiuni** - Sanctions given
- **Infracțiuni** - Crimes detected
- **Persoane Urmărite** - Wanted persons apprehended

## 🗓️ Special Features

### Romanian Holidays
The app includes all Romanian public holidays for 2026 with special hour calculations:
- New Year (Jan 1-2)
- Epiphany (Jan 6-7)
- Union Day (Jan 24)
- Good Friday & Easter (Apr 10-13)
- May Day (May 1)
- Pentecost (May 31 - Jun 1)
- Assumption (Aug 15)
- St. Andrew's Day (Nov 30)
- National Day (Dec 1)
- Christmas (Dec 25-26)

### Hour Calculation
- **Normal Hours**: Weekday hours (Mon-Thu 24h, Fri before 22:00)
- **Weekend Hours**: Fri 22:00-end, Sat-Sun, and holidays
- **Automatic Midnight Crossing**: Shifts crossing midnight are split correctly

## 💾 Data Storage

All data is stored locally in your device using **localStorage**:
- Data persists even after closing the app
- Data syncs across tabs/windows
- No data sent to servers (privacy-first)

### Export Data
View and copy your data from browser console:
```javascript
console.log(localStorage.getItem('shiftCalendarData'))
```

## ⚙️ Technical Details

### Files Included
- `index.html` - Main app structure
- `styles.css` - Responsive styling
- `app.js` - Application logic
- `manifest.json` - PWA configuration
- `service-worker.js` - Offline support
- `shifts_data.json` - Legacy data file (reference)

### Browser Support
- ✅ Safari 15.4+ (iOS 15.4+)
- ✅ Chrome 90+ (Android)
- ✅ Firefox 92+ (All platforms)
- ✅ Edge 90+ (Windows/Mac)

### Performance
- Fast load time (< 2s)
- Works offline
- Lightweight (~50KB total)
- No external dependencies

## 🔐 Privacy

- All data stored locally on your device
- No user tracking
- No ads
- No analytics
- No internet required

## 🛠️ Development

### Running Locally
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Customization
Edit the following in `app.js` to modify:
- Shift times and names
- Romanian holidays
- Statistics calculations
- Color schemes (in `styles.css`)

## 📱 Testing on iOS

### Safari Browser Test
1. Open in Safari (PWA works best)
2. Open DevTools (Develop → Device → Simulator)
3. Test responsive design

### App Installation
- "Add to Home Screen" creates a full-screen app
- Works completely offline
- Can send notifications

### Debugging
Use Web Inspector in Safari:
- Settings → Safari → Advanced → Web Inspector
- Open app on device
- Connect Mac and inspect

## 🐛 Troubleshooting

### App not installing?
- Make sure you're on iOS 15.4+
- Clear Safari cache and try again
- Use Safari (other browsers have limitations)

### Data not saving?
- Check browser's localStorage is enabled
- Try clearing cache and reloading
- Check browser console for errors

### Service Worker not working?
- Open in a secure context (https or localhost)
- Clear browser cache
- Uninstall and reinstall the app

## 📄 License

Free to use and modify. This is a utility app for personal use.

## 🤝 Contributing

Feel free to fork and customize this app for your needs!

## 📞 Support

For issues or questions, check the browser console (F12 → Console) for error messages.

---

**Made with ❤️ for shift workers**

Version: 1.0.0
Last Updated: January 2026

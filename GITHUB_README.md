# 📅 Shift Calendar PWA

> A Progressive Web App for tracking work shifts, hours worked, and incidents. Works on iOS, Android, and web browsers as a native-like application.

[![Vercel Status](https://img.shields.io/badge/Vercel-Ready-brightgreen)](https://vercel.com)
[![License](https://img.shields.io/badge/License-Free-brightgreen)](#license)
[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)]()

## 🎯 Features

- 📱 **Progressive Web App** - Install on home screen
- 📅 **Interactive Calendar** - Select dates and view shifts  
- ⏰ **3 Preset Shifts** - 6-14, 14-22, 22-6 hours
- 🏖️ **Smart Hour Calculation** - Weekend & holiday differentiation
- 📊 **Statistics Tracking** - Monthly and all-time hours
- 📝 **Incident Logging** - Sanctions, crimes, wanted persons
- 🔔 **Push Notifications** - Shift reminders
- 💾 **Offline Support** - Works without internet
- 📲 **Any Device** - iOS, Android, Desktop
- 🔒 **Privacy First** - All data stored locally
- ⚡ **Fast Loading** - < 2 seconds

## 🚀 Quick Start

### Option 1: Deploy to Vercel (Easiest)

```bash
1. Fork this repo
2. Sign up at vercel.com
3. Import from GitHub
4. Deploy (one-click)
5. Share URL with friends
```

**Live Demo**: https://shift-calendar.vercel.app

### Option 2: Run Locally

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Then open: `http://localhost:8000`

### Option 3: iPhone Installation

1. Open Safari on iPhone
2. Go to: `https://shift-calendar.vercel.app`
3. Tap Share → Add to Home Screen
4. Tap "Add"
5. **Done!** App is installed

## 📋 How to Use

### Adding a Shift
1. Select date on calendar
2. Click preset shift button OR enter custom times
3. Add any incidents (optional)
4. Click "Salvare" (Save)

### Viewing Data
- **Calendar**: See all shifts at a glance
- **Statistics**: Auto-updates with monthly and all-time totals
- **All Shifts**: Complete list of all entries

### Features
- **Automatic Calculations**: Hours split by weekend/holiday
- **Romanian Holidays**: 16 holidays included for 2026
- **Incident Tracking**: Count sanctions, crimes, wanted persons
- **Offline**: Works completely without internet
- **Local Storage**: No data sent to servers

## 📁 Project Structure

```
shift-calendar/
├── index.html           # Main app
├── styles.css          # Responsive design
├── app.js              # Application logic
├── manifest.json       # PWA configuration
├── service-worker.js   # Offline support
├── vercel.json         # Vercel config
└── README.md           # This file
```

## 🌐 Browser Support

| Browser | iOS | Android | Desktop |
|---------|-----|---------|---------|
| Safari | ✅ 15.4+ | — | ✅ |
| Chrome | — | ✅ | ✅ |
| Firefox | ✅ | ✅ | ✅ |
| Edge | — | — | ✅ |

## 💾 Data Storage

- **100% Local** - Data never leaves your device
- **Persistent** - Survives app restart
- **Private** - No tracking or analytics
- **No Server** - Works offline
- **Device Quota** - ~50MB available per device

## 🔐 Privacy & Security

✅ **Your data is private:**
- No server communication
- No user tracking
- No analytics
- No ads
- Fully GDPR compliant

✅ **HTTPS everywhere:**
- Automatic SSL on Vercel
- Secure by default
- Required for PWA features

## 📱 iOS PWA Benefits

When installed on home screen:
- ✅ Full-screen app (no browser UI)
- ✅ App icon on home screen
- ✅ Works offline
- ✅ Instant loading
- ✅ Push notifications possible
- ✅ Acts like native app

## 🛠️ Customization

### Edit Shift Times
In `app.js`:
```javascript
// Line 24-26
"06:00", "14:00"  // Shift I
"14:00", "22:00"  // Shift II
"22:00", "06:00"  // Shift III
```

### Change Colors
In `styles.css`:
```css
--primary-color: #1e3a8a;      /* Blues */
--weekend-color: #dc2626;      /* Reds */
--holiday-color: #7c3aed;      /* Purples */
```

### Add/Update Holidays
In `app.js`:
```javascript
holidays: new Set([
    "2027-01-01",  // Add new dates here
])
```

### Change Language
All text in HTML/JS is in Romanian - easily change to any language.

## 🚀 Deployment

### Vercel (Recommended - Free)

```bash
1. Push to GitHub
2. Connect GitHub to Vercel
3. Auto-deploys on push
4. Share URL: https://shift-calendar.vercel.app
```

See [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) for detailed steps.

### Other Platforms

Works on any static hosting:
- Netlify
- GitHub Pages  
- Firebase Hosting
- AWS S3
- Any web server

## 📊 Technical Details

### Stack
- **HTML5** - Semantic structure
- **CSS3** - Mobile-first responsive
- **JavaScript (ES6+)** - No frameworks
- **Service Workers** - Offline support
- **LocalStorage** - Data persistence
- **PWA Manifest** - App metadata

### Performance
- **Size**: ~50KB (HTML, CSS, JS)
- **Load Time**: < 2 seconds
- **Cache**: Service Worker caching
- **Offline**: Fully functional

### API
- **No External APIs** - Fully standalone
- **No Dependencies** - Vanilla JavaScript
- **No Backend** - Static files only
- **No Authentication** - Open to all

## 📚 Documentation

- [README.md](./README.md) - Full feature guide
- [SETUP_IOS.md](./SETUP_IOS.md) - iOS installation
- [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md) - Vercel deployment
- [DOCUMENTATION.md](./DOCUMENTATION.md) - Technical docs

## 🐛 Troubleshooting

### App not installing on iOS
- Ensure iOS 15.4+
- Use Safari (not Chrome)
- Clear Safari cache
- Try again after refresh

### Data not saving
- Enable localStorage in settings
- Check "Block all cookies" is OFF
- Try private browsing mode

### Service Worker issues
- Use localhost or HTTPS only
- Clear browser cache
- Check DevTools → Application

### Performance issues
- Close other apps
- Clear cache
- Restart app
- Check connection

## 🤝 Contributing

Found a bug or want to improve? Feel free to:
1. Fork the repo
2. Make changes
3. Submit pull request
4. Or open an issue

## 📄 License

Free to use and modify. No attribution required.

## 💡 Ideas for Enhancement

- [ ] Export to CSV
- [ ] Cloud backup
- [ ] Dark mode
- [ ] Multi-language
- [ ] Analytics dashboard
- [ ] Photo attachments
- [ ] Recurring shifts
- [ ] Team sharing

## 📞 Support

- Check browser console (F12) for errors
- Read documentation files
- Check GitHub issues
- Open new issue with error details

## 🎉 Credits

**Original App**: Python/Tkinter desktop application
**Converted to PWA**: HTML/CSS/JavaScript (2026)
**Hosting**: Vercel (Free tier)

---

## ⏱️ Getting Started (5 minutes)

```
1. Fork/Clone repo
2. Deploy to Vercel
3. Share URL
4. Anyone can use
5. Data stays private
```

**That's it!** Your app is live worldwide. 🚀

---

**Made with ❤️ for shift workers**

- Platform: Progressive Web App
- Devices: iOS, Android, Web
- Cost: Free ✓
- Data: Private ✓
- Updates: Automatic ✓

### Quick Links
- 🌐 **Live App**: https://shift-calendar.vercel.app
- 📖 **Docs**: [VERCEL_QUICKSTART.md](./VERCEL_QUICKSTART.md)
- 🚀 **Deploy**: [DEPLOY_VERCEL.md](./DEPLOY_VERCEL.md)
- 📱 **iOS Guide**: [SETUP_IOS.md](./SETUP_IOS.md)

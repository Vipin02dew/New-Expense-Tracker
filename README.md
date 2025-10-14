# 💰 Expense Tracker PWA

A comprehensive Progressive Web App for personal and group expense management with offline-first capabilities, gamification, and visual analytics.

## ✨ Features

### Personal Expense Management
- **Dashboard with Real-time KPIs**: Daily spend, monthly total, average daily spend, budget remaining
- **Visual Analytics**: Weekly spending trends and monthly category breakdown charts
- **Top 5 Expenses**: Cumulative expenses by category for the month
- **Smart Category Detection**: Auto-suggest categories based on expense description keywords
- **Transaction Management**: Add, edit, delete, search, and filter all expenses
  - ✏️ Edit any transaction with pre-filled form
  - 🗑️ Delete transactions with confirmation
  - Member attribution shows who added each expense
  - Real-time search and category filtering

### Group Expense Management
- **Create & Join Groups**: Share unique group codes to collaborate with friends/family
- **Shared Transactions**: All members can add expenses affecting the group
- **Automatic Split Calculations**: Fair expense distribution among group members
- **Member Attribution**: Track who added each expense with timestamps
- **Edit & Manage Groups**: Rename groups, leave groups anytime
- **Serverless Sync (NEW!)**: 
  - 📤 Export group data as JSON file
  - 📥 Import from other members to sync
  - Share files via any method (WhatsApp, email, etc.)
  - No server needed - data stays with members
  - Auto-merges without duplicates

### Savings & Goals
- **Savings Goals**: Create custom goals with progress tracking and manual contributions
- **What-If Calculator**: Visualize savings by reducing spending in specific categories
- **1, 6, 12-month projections**: See long-term impact of spending changes

### Gamification
- **Achievement System**: Unlock badges for milestones (First Entry, Money Master, Strategic Saver, etc.)
- **Streak Tracking**: Daily login monitoring with visual streak counter
- **Reward Stickers**: Snapchat-style celebratory animations when staying under budget

### Data Management
- **Excel Import/Export**: Full data portability for personal expenses
- **Group Data Sync**: JSON export/import for group synchronization
- **Local Storage**: Complete offline functionality
- **Backup & Restore**: Easy data migration between devices
- **Theme Support**: Dark/light mode with preference persistence
- **Smart Notifications**: Toast messages for all actions (save, edit, delete, sync)

### PWA Features
- **Offline-First**: Works without internet after first load
- **Installable**: Add to home screen like a native app
- **Mobile-First Design**: Optimized for phone screens
- **Responsive**: Adapts to all screen sizes

## 🚀 GitHub Pages Deployment

### Quick Setup (5 minutes)

1. **Create GitHub Repository**
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it `expense-tracker-pwa` (or any name you prefer)
   - Don't initialize with README (we have one)

2. **Upload Files to GitHub**
   
   **Option A: Using Git (Recommended)**
   ```bash
   git clone https://github.com/YOUR-USERNAME/expense-tracker-pwa.git
   cd expense-tracker-pwa
   # Copy all project files here
   git add .
   git commit -m "Initial commit - Expense Tracker PWA"
   git push origin main
   ```

   **Option B: Upload via GitHub Web**
   - Go to your repository
   - Click "Add file" → "Upload files"
   - Drag all files: `index.html`, `styles.css`, `app.js`, `manifest.json`, `service-worker.js`, `README.md`
   - Click "Commit changes"

3. **Enable GitHub Pages**
   - Go to repository **Settings**
   - Click **Pages** in left sidebar
   - Under **Source**, select:
     - Branch: `main`
     - Folder: `/ (root)`
   - Click **Save**
   - Wait 1-2 minutes for deployment

4. **Access Your Live App**
   - URL format: `https://YOUR-USERNAME.github.io/REPO-NAME/`
   - Example: `https://johndoe.github.io/expense-tracker-pwa/`
   - Share this link - users just click and use!

### ✅ Deployment Verification

After deployment, verify PWA features work:
1. **Offline Test**: Open app → Close tab → Disconnect internet → Open app again (should work!)
2. **Install Test**: Look for "Install" button in browser (Chrome/Edge address bar)
3. **Mobile Test**: Open on phone → Should see "Add to Home Screen" prompt

### 📝 Important Notes for GitHub Pages

- ✅ **All paths are relative**: App works in any subdirectory
- ✅ **HTTPS automatic**: GitHub Pages provides free SSL
- ✅ **CDN cached**: Chart.js and SheetJS load from CDN
- ✅ **PWA ready**: Service worker uses relative paths
- ✅ **No build needed**: Pure HTML/CSS/JS - just upload and go!

### Alternative Deployment Options

#### Netlify (Drag & Drop)
1. Go to [netlify.com](https://netlify.com)
2. Drag the entire project folder to Netlify
3. Get instant live URL

#### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Get instant live URL

## 📱 Local Development

### Option 1: Python HTTP Server (Recommended)
```bash
python -m http.server 5000
```
Open `http://localhost:5000`

### Option 2: Node.js HTTP Server
```bash
npx http-server -p 5000
```
Open `http://localhost:5000`

### Option 3: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

## 📂 Project Structure

```
expense-tracker-pwa/
├── index.html          # Main HTML with all screens
├── styles.css          # Mobile-first responsive styles
├── app.js              # Complete app logic
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline functionality
└── README.md          # This file
```

## 🎯 Usage Guide

### First Time Setup
1. Click **"Get Started"** on landing page
2. Set your name and monthly budget in **Profile**
3. Start adding expenses!

### Adding Expenses
1. Tap the **+** button in bottom navigation
2. Enter amount, description, select category
3. Date defaults to today (customizable)
4. For group expenses, check **"Group Expense"** and select group

### Creating Groups
1. Go to **Profile** → **Manage Groups**
2. Tap **+** to create new group
3. Share the 6-digit code with friends
4. They join via **"Join Group"** on landing page

### Setting Savings Goals
1. Navigate to **Goals** screen
2. Tap **+** to create new goal
3. Enter goal name, target amount, and icon
4. Contribute savings manually anytime

### Using What-If Calculator
1. Go to **Goals** screen
2. Tap **"What-If Savings Calculator"**
3. Select category and reduction amount
4. See projected savings for 1, 6, 12 months

### Unlocking Achievements
- **First Entry**: Add your first expense
- **Money Master**: Log 100+ expenses
- **Strategic Saver**: Stay under budget 3 months in a row
- **Goal Achiever**: Complete a savings goal
- **Week Warrior**: 7-day login streak
- **Month Champion**: 30-day login streak

## 💾 Data Privacy

- **100% Local Storage**: All data stored in browser (localStorage)
- **No Server**: No data sent to any server
- **No Tracking**: No analytics or tracking
- **Full Control**: Export, backup, or delete data anytime

## 🔧 Technical Details

### Technologies
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Charts**: Chart.js for visualizations
- **Excel**: SheetJS (xlsx) for import/export
- **PWA**: Service Worker, Web App Manifest
- **Storage**: localStorage API

### Browser Support
- Chrome/Edge: ✅ Full support
- Safari: ✅ Full support
- Firefox: ✅ Full support
- Mobile Browsers: ✅ Optimized

### Performance
- **First Load**: < 2 seconds
- **Offline**: Full functionality
- **Storage**: ~5MB localStorage limit
- **Install Size**: < 500KB

## 🎨 Customization

### Change Theme Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary: #6366f1;  /* Main brand color */
    --success: #10b981;  /* Success/positive */
    --danger: #ef4444;   /* Danger/negative */
}
```

### Add More Categories
Edit `CATEGORIES` object in `app.js`:
```javascript
const CATEGORIES = {
    'YourCategory': ['keyword1', 'keyword2', ...],
    ...
}
```

## 📄 License

MIT License - Free to use, modify, and distribute

## 👨‍💻 Credits

**Made by VIPIN DEWANGAN**  
LinkedIn: [linkedin.com/in/vipin-dewangan-finance](https://www.linkedin.com/in/vipin-dewangan-finance)

## 🐛 Troubleshooting

### App not loading?
- Clear browser cache and reload
- Check browser console for errors
- Ensure JavaScript is enabled

### Data not persisting?
- Check if cookies/storage are enabled
- Try different browser
- Export data as backup

### PWA not installing?
- Use HTTPS (required for PWA)
- Works on GitHub Pages automatically
- Check browser supports PWA

## 🔄 Updates

To update your deployed app:
```bash
git add .
git commit -m "Update app"
git push origin main
```
GitHub Pages auto-deploys in ~1 minute!

---

**Need help?** Open an issue on GitHub or contact via LinkedIn.

**Happy Tracking! 💰**

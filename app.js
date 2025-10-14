let appState = {
    user: {
        name: 'User',
        email: '',
        budget: 10000,
        photo: null,
        theme: 'light',
        lastLogin: null,
        streak: 0
    },
    expenses: [],
    goals: [],
    groups: [],
    achievements: [],
    currentGoalId: null,
    currentExpenseId: null,
    currentGroupId: null
};

const CATEGORIES = {
    'Food': ['food', 'restaurant', 'lunch', 'dinner', 'breakfast', 'coffee', 'meal', 'pizza', 'burger'],
    'Transport': ['uber', 'taxi', 'bus', 'metro', 'fuel', 'petrol', 'parking', 'train', 'auto'],
    'Shopping': ['shop', 'clothes', 'amazon', 'flipkart', 'purchase', 'buy', 'store'],
    'Entertainment': ['movie', 'netflix', 'spotify', 'game', 'concert', 'show', 'theatre'],
    'Bills': ['electricity', 'water', 'internet', 'phone', 'rent', 'emi', 'bill'],
    'Healthcare': ['doctor', 'medicine', 'hospital', 'pharmacy', 'health', 'medical'],
    'Education': ['book', 'course', 'tuition', 'school', 'college', 'study'],
    'Other': []
};

const ACHIEVEMENTS_DATA = [
    { id: 'first_entry', name: 'First Entry', icon: '💡', desc: 'Added your first expense', condition: (state) => state.expenses.length >= 1 },
    { id: 'money_master', name: 'Money Master', icon: '💰', desc: 'Logged 100+ expenses', condition: (state) => state.expenses.length >= 100 },
    { id: 'strategic_saver', name: 'Strategic Saver', icon: '🧠', desc: 'Under budget 3 months', condition: (state) => checkUnderBudgetStreak(state) >= 3 },
    { id: 'goal_achiever', name: 'Goal Achiever', icon: '🎯', desc: 'Completed a savings goal', condition: (state) => state.goals.some(g => g.current >= g.target) },
    { id: 'week_warrior', name: 'Week Warrior', icon: '⚡', desc: '7 day login streak', condition: (state) => state.user.streak >= 7 },
    { id: 'month_champion', name: 'Month Champion', icon: '👑', desc: '30 day login streak', condition: (state) => state.user.streak >= 30 }
];

let weeklyChart = null;
let categoryChart = null;
let deferredPrompt = null;

function initApp() {
    loadState();
    setupTheme();
    updateStreak();
    setupPWA();
    setupEventListeners();
    
    if (localStorage.getItem('hasVisited')) {
        showScreen('dashboard-screen');
        updateDashboard();
    }
    
    setInterval(updateCurrentDate, 60000);
}

function loadState() {
    const saved = localStorage.getItem('expenseTrackerState');
    if (saved) {
        const parsed = JSON.parse(saved);
        appState = { ...appState, ...parsed };
    }
}

function saveState() {
    localStorage.setItem('expenseTrackerState', JSON.stringify(appState));
}

function setupTheme() {
    document.body.setAttribute('data-theme', appState.user.theme);
    updateThemeIcon();
}

function toggleTheme() {
    appState.user.theme = appState.user.theme === 'light' ? 'dark' : 'light';
    setupTheme();
    saveState();
}

function updateThemeIcon() {
    const icon = document.querySelector('.theme-toggle');
    if (icon) {
        icon.textContent = appState.user.theme === 'light' ? '🌙' : '☀️';
    }
}

function setupPWA() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('service-worker.js').catch(err => {
            console.log('SW registration failed:', err);
        });
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        const installBtn = document.getElementById('install-button');
        if (installBtn) {
            installBtn.style.display = 'block';
            installBtn.onclick = async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    deferredPrompt = null;
                    installBtn.style.display = 'none';
                }
            };
        }
    });
}

function setupEventListeners() {
    document.getElementById('is-group-expense').addEventListener('change', (e) => {
        document.getElementById('group-expense-options').style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked) {
            updateGroupSelect();
        }
    });
}

function updateStreak() {
    const today = new Date().toDateString();
    const lastLogin = appState.user.lastLogin;
    
    if (lastLogin !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastLogin === yesterday.toDateString()) {
            appState.user.streak++;
        } else if (lastLogin !== null) {
            appState.user.streak = 1;
        } else {
            appState.user.streak = 1;
        }
        
        appState.user.lastLogin = today;
        saveState();
        checkAchievements();
    }
}

function startApp() {
    localStorage.setItem('hasVisited', 'true');
    showScreen('dashboard-screen');
    updateDashboard();
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    
    if (screenId === 'dashboard-screen') {
        updateDashboard();
    } else if (screenId === 'transactions-screen') {
        displayTransactions();
        populateCategoryFilter();
    } else if (screenId === 'add-expense-screen') {
        resetExpenseForm();
    } else if (screenId === 'goals-screen') {
        displayGoals();
    } else if (screenId === 'profile-screen') {
        loadProfile();
    } else if (screenId === 'groups-screen') {
        displayGroups();
    }
}

function updateCurrentDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
}

function updateDashboard() {
    updateCurrentDate();
    updateUserDisplay();
    updateKPIs();
    updateCharts();
    updateTopExpenses();
    updateStreakDisplay();
}

function updateUserDisplay() {
    const nameEl = document.getElementById('user-name');
    if (nameEl) nameEl.textContent = appState.user.name;
    
    const photo = appState.user.photo || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%236366f1'/%3E%3Ctext x='50' y='50' text-anchor='middle' dy='.3em' fill='white' font-size='40' font-family='Arial'%3E" + appState.user.name.charAt(0).toUpperCase() + "%3C/text%3E%3C/svg%3E";
    
    const avatars = document.querySelectorAll('.avatar-small, .avatar-large');
    avatars.forEach(av => av.src = photo);
}

function updateKPIs() {
    const today = new Date().toDateString();
    const todayExpenses = appState.expenses.filter(e => new Date(e.date).toDateString() === today);
    const todayTotal = todayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthExpenses = appState.expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    const monthTotal = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    const daysInMonth = new Date().getDate();
    const avgDaily = daysInMonth > 0 ? monthTotal / daysInMonth : 0;
    
    const budgetLeft = appState.user.budget - monthTotal;
    const budgetPercent = appState.user.budget > 0 ? (budgetLeft / appState.user.budget) * 100 : 0;
    
    document.getElementById('today-spend').textContent = `₹${todayTotal.toFixed(0)}`;
    document.getElementById('month-spend').textContent = `₹${monthTotal.toFixed(0)}`;
    document.getElementById('avg-daily').textContent = `₹${avgDaily.toFixed(0)}`;
    document.getElementById('budget-left').textContent = `₹${budgetLeft.toFixed(0)}`;
    document.getElementById('budget-progress').style.width = `${Math.max(0, budgetPercent)}%`;
    
    if (budgetLeft < 0) {
        document.getElementById('budget-left').style.color = '#ef4444';
    }
    
    if (monthTotal < appState.user.budget && monthExpenses.length > 0) {
        checkRewardSticker();
    }
}

function updateStreakDisplay() {
    const streakEl = document.getElementById('streak-count');
    if (streakEl) {
        streakEl.textContent = appState.user.streak;
    }
}

function updateCharts() {
    updateWeeklyChart();
    updateCategoryChart();
}

function updateWeeklyChart() {
    const ctx = document.getElementById('weekly-chart');
    if (!ctx) return;
    
    const last7Days = [];
    const amounts = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayExpenses = appState.expenses.filter(e => 
            new Date(e.date).toDateString() === date.toDateString()
        );
        amounts.push(dayExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0));
    }
    
    if (weeklyChart) {
        weeklyChart.destroy();
    }
    
    weeklyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [{
                label: 'Daily Spending',
                data: amounts,
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

function updateCategoryChart() {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthExpenses = appState.expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const categoryTotals = {};
    monthExpenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount);
    });
    
    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    const colors = [
        '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', 
        '#10b981', '#3b82f6', '#ef4444', '#84cc16'
    ];
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { 
                    position: 'bottom',
                    labels: { padding: 15, font: { size: 12 } }
                }
            }
        }
    });
}

function updateTopExpenses() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthExpenses = appState.expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    
    const categoryTotals = {};
    const categoryCount = {};
    
    monthExpenses.forEach(e => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + parseFloat(e.amount);
        categoryCount[e.category] = (categoryCount[e.category] || 0) + 1;
    });
    
    const sorted = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const listEl = document.getElementById('top-expenses-list');
    if (!listEl) return;
    
    if (sorted.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📊</div><p>No expenses this month</p></div>';
        return;
    }
    
    const icons = {
        'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️',
        'Entertainment': '🎬', 'Bills': '📄', 'Healthcare': '⚕️',
        'Education': '📚', 'Other': '📦'
    };
    
    listEl.innerHTML = sorted.map(([cat, amount]) => `
        <div class="expense-item">
            <span class="expense-icon">${icons[cat] || '📦'}</span>
            <div class="expense-info">
                <div class="expense-category">${cat}</div>
                <div class="expense-count">${categoryCount[cat]} transactions</div>
            </div>
            <div class="expense-amount">₹${amount.toFixed(0)}</div>
        </div>
    `).join('');
}

function resetExpenseForm() {
    document.getElementById('expense-form').reset();
    document.getElementById('expense-date').valueAsDate = new Date();
    document.getElementById('is-group-expense').checked = false;
    document.getElementById('group-expense-options').style.display = 'none';
}

function suggestCategory() {
    const desc = document.getElementById('expense-description').value.toLowerCase();
    const suggestionsEl = document.getElementById('category-suggestions');
    
    if (desc.length < 2) {
        suggestionsEl.innerHTML = '';
        return;
    }
    
    const suggestions = [];
    for (const [category, keywords] of Object.entries(CATEGORIES)) {
        if (keywords.some(kw => desc.includes(kw))) {
            suggestions.push(category);
        }
    }
    
    if (suggestions.length > 0) {
        suggestionsEl.innerHTML = suggestions.map(cat => 
            `<div class="suggestion-item" onclick="selectCategory('${cat}')">${cat}</div>`
        ).join('');
    } else {
        suggestionsEl.innerHTML = '';
    }
}

function selectCategory(category) {
    document.getElementById('expense-category').value = category;
    document.getElementById('category-suggestions').innerHTML = '';
}

function saveExpense(event) {
    if (event) event.preventDefault();
    
    const amount = document.getElementById('expense-amount').value;
    const description = document.getElementById('expense-description').value;
    const category = document.getElementById('expense-category').value;
    const date = document.getElementById('expense-date').value;
    const isGroup = document.getElementById('is-group-expense').checked;
    
    if (!amount || !description || !category || !date) {
        alert('Please fill all fields');
        return;
    }
    
    if (appState.currentExpenseId) {
        const expense = appState.expenses.find(e => e.id === appState.currentExpenseId);
        if (expense) {
            expense.amount = parseFloat(amount);
            expense.description = description;
            expense.category = category;
            expense.date = date;
            expense.updatedAt = new Date().toISOString();
            
            if (isGroup) {
                const groupId = document.getElementById('expense-group').value;
                if (groupId) {
                    expense.groupId = groupId;
                    const group = appState.groups.find(g => g.id === groupId);
                    if (group) {
                        expense.splitAmount = parseFloat(amount) / (group.members.length + 1);
                    }
                }
            } else {
                delete expense.groupId;
                delete expense.splitAmount;
            }
            
            showNotification('Transaction updated');
        }
        appState.currentExpenseId = null;
    } else {
        const expense = {
            id: Date.now().toString(),
            amount: parseFloat(amount),
            description,
            category,
            date,
            timestamp: new Date().toISOString(),
            addedBy: appState.user.name
        };
        
        if (isGroup) {
            const groupId = document.getElementById('expense-group').value;
            if (groupId) {
                expense.groupId = groupId;
                const group = appState.groups.find(g => g.id === groupId);
                if (group) {
                    expense.splitAmount = parseFloat(amount) / (group.members.length + 1);
                }
            }
        }
        
        appState.expenses.push(expense);
        showNotification('Transaction added');
    }
    
    saveState();
    checkAchievements();
    
    document.querySelector('#add-expense-screen .screen-header h2').textContent = 'Add Expense';
    showScreen('dashboard-screen');
    updateDashboard();
}

function displayTransactions() {
    const listEl = document.getElementById('transactions-list');
    if (!listEl) return;
    
    if (appState.expenses.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">💳</div><p>No transactions yet</p><button class="btn btn-primary" onclick="showScreen(\'add-expense-screen\')">Add First Expense</button></div>';
        return;
    }
    
    const sorted = [...appState.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const icons = {
        'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️',
        'Entertainment': '🎬', 'Bills': '📄', 'Healthcare': '⚕️',
        'Education': '📚', 'Other': '📦'
    };
    
    listEl.innerHTML = sorted.map(exp => `
        <div class="transaction-item">
            <span class="transaction-icon">${icons[exp.category] || '📦'}</span>
            <div class="transaction-info">
                <div class="transaction-desc">${exp.description}</div>
                <div class="transaction-meta">
                    ${exp.category} • ${new Date(exp.date).toLocaleDateString()}
                    ${exp.groupId ? ' • Group' : ''}
                    ${exp.addedBy ? ' • ' + exp.addedBy : ''}
                </div>
            </div>
            <div class="transaction-amount">-₹${exp.amount.toFixed(0)}</div>
            <div class="transaction-actions">
                <button class="icon-btn-small" onclick="editExpense('${exp.id}')" title="Edit">✏️</button>
                <button class="icon-btn-small" onclick="deleteExpense('${exp.id}')" title="Delete">🗑️</button>
            </div>
        </div>
    `).join('');
}

function editExpense(expenseId) {
    const expense = appState.expenses.find(e => e.id === expenseId);
    if (!expense) return;
    
    appState.currentExpenseId = expenseId;
    
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-description').value = expense.description;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-date').value = expense.date;
    
    if (expense.groupId) {
        document.getElementById('is-group-expense').checked = true;
        document.getElementById('group-expense-options').style.display = 'block';
        updateGroupSelect();
        document.getElementById('expense-group').value = expense.groupId;
    }
    
    showScreen('add-expense-screen');
    document.querySelector('#add-expense-screen .screen-header h2').textContent = 'Edit Expense';
}

function deleteExpense(expenseId) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        appState.expenses = appState.expenses.filter(e => e.id !== expenseId);
        saveState();
        displayTransactions();
        updateDashboard();
        showNotification('Transaction deleted');
    }
}

function showSearchFilter() {
    const filterEl = document.getElementById('search-filter');
    filterEl.style.display = filterEl.style.display === 'none' ? 'flex' : 'none';
}

function populateCategoryFilter() {
    const select = document.getElementById('category-filter');
    const categories = [...new Set(appState.expenses.map(e => e.category))];
    select.innerHTML = '<option value="">All Categories</option>' + 
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function filterTransactions() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const category = document.getElementById('category-filter').value;
    
    let filtered = appState.expenses;
    
    if (searchTerm) {
        filtered = filtered.filter(e => 
            e.description.toLowerCase().includes(searchTerm) ||
            e.category.toLowerCase().includes(searchTerm)
        );
    }
    
    if (category) {
        filtered = filtered.filter(e => e.category === category);
    }
    
    const sorted = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    const listEl = document.getElementById('transactions-list');
    
    const icons = {
        'Food': '🍔', 'Transport': '🚗', 'Shopping': '🛍️',
        'Entertainment': '🎬', 'Bills': '📄', 'Healthcare': '⚕️',
        'Education': '📚', 'Other': '📦'
    };
    
    listEl.innerHTML = sorted.map(exp => `
        <div class="transaction-item">
            <span class="transaction-icon">${icons[exp.category] || '📦'}</span>
            <div class="transaction-info">
                <div class="transaction-desc">${exp.description}</div>
                <div class="transaction-meta">
                    ${exp.category} • ${new Date(exp.date).toLocaleDateString()}
                </div>
            </div>
            <div class="transaction-amount">-₹${exp.amount.toFixed(0)}</div>
        </div>
    `).join('');
}

function displayGoals() {
    const listEl = document.getElementById('goals-list');
    if (!listEl) return;
    
    if (appState.goals.length === 0) {
        listEl.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🎯</div><p>No goals yet</p></div>';
        return;
    }
    
    listEl.innerHTML = appState.goals.map(goal => {
        const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
        return `
            <div class="goal-card">
                <div class="goal-header">
                    <div class="goal-title">
                        <span class="goal-icon">${goal.icon}</span>
                        <span>${goal.name}</span>
                    </div>
                </div>
                <div class="goal-progress-bar">
                    <div class="goal-progress-fill" style="width: ${Math.min(100, progress)}%"></div>
                </div>
                <div class="goal-stats">
                    <span>₹${goal.current.toFixed(0)} / ₹${goal.target.toFixed(0)}</span>
                    <span>${progress.toFixed(0)}% achieved</span>
                </div>
                <div class="goal-actions">
                    <button class="btn btn-primary btn-small" onclick="showContributeModal('${goal.id}')">Contribute</button>
                </div>
            </div>
        `;
    }).join('');
}

function showAddGoalModal() {
    document.getElementById('goal-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function createGoal() {
    const name = document.getElementById('goal-name').value;
    const target = parseFloat(document.getElementById('goal-target').value);
    const icon = document.getElementById('goal-icon').value;
    
    if (!name || !target) {
        alert('Please fill all fields');
        return;
    }
    
    const goal = {
        id: Date.now().toString(),
        name,
        target,
        current: 0,
        icon,
        createdAt: new Date().toISOString()
    };
    
    appState.goals.push(goal);
    saveState();
    closeModal();
    displayGoals();
}

function showContributeModal(goalId) {
    appState.currentGoalId = goalId;
    const goal = appState.goals.find(g => g.id === goalId);
    document.getElementById('contribute-goal-name').textContent = `Contributing to: ${goal.name}`;
    document.getElementById('contribute-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function contributeToGoal() {
    const amount = parseFloat(document.getElementById('contribute-amount').value);
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const goal = appState.goals.find(g => g.id === appState.currentGoalId);
    if (goal) {
        goal.current += amount;
        saveState();
        checkAchievements();
        closeModal();
        displayGoals();
    }
}

function showWhatIfCalculator() {
    document.getElementById('whatif-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function calculateWhatIf() {
    const category = document.getElementById('whatif-category').value;
    const reduction = parseFloat(document.getElementById('whatif-amount').value);
    
    if (!reduction || reduction <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    const resultsEl = document.getElementById('whatif-results');
    resultsEl.innerHTML = `
        <div class="whatif-result">
            <span class="whatif-period">1 Month</span>
            <span class="whatif-amount">₹${reduction.toFixed(0)}</span>
        </div>
        <div class="whatif-result">
            <span class="whatif-period">6 Months</span>
            <span class="whatif-amount">₹${(reduction * 6).toFixed(0)}</span>
        </div>
        <div class="whatif-result">
            <span class="whatif-period">12 Months</span>
            <span class="whatif-amount">₹${(reduction * 12).toFixed(0)}</span>
        </div>
        <p style="margin-top: 16px; color: var(--text-secondary); font-size: 14px;">
            If you cut ${category} by ₹${reduction}/month, you'll save ₹${(reduction * 12).toFixed(0)} in a year!
        </p>
    `;
}

function loadProfile() {
    document.getElementById('profile-name').value = appState.user.name;
    document.getElementById('profile-budget').value = appState.user.budget;
    updateUserDisplay();
    displayAchievements();
    displayProfileGroups();
}

function saveProfile() {
    const name = document.getElementById('profile-name').value;
    const budget = parseFloat(document.getElementById('profile-budget').value);
    
    if (name) appState.user.name = name;
    if (budget) appState.user.budget = budget;
    
    saveState();
    updateUserDisplay();
    updateDashboard();
    alert('Profile saved successfully!');
}

function uploadPhoto(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            appState.user.photo = e.target.result;
            saveState();
            updateUserDisplay();
        };
        reader.readAsDataURL(file);
    }
}

function displayAchievements() {
    const listEl = document.getElementById('achievements-list');
    if (!listEl) return;
    
    listEl.innerHTML = ACHIEVEMENTS_DATA.map(ach => {
        const unlocked = appState.achievements.includes(ach.id);
        return `
            <div class="achievement-badge ${unlocked ? 'unlocked' : 'locked'}" title="${ach.desc}">
                <div class="achievement-badge-icon">${ach.icon}</div>
                <div class="achievement-badge-name">${ach.name}</div>
            </div>
        `;
    }).join('');
}

function checkAchievements() {
    ACHIEVEMENTS_DATA.forEach(ach => {
        if (!appState.achievements.includes(ach.id) && ach.condition(appState)) {
            appState.achievements.push(ach.id);
            saveState();
            showAchievementPopup(ach);
        }
    });
}

function showAchievementPopup(achievement) {
    const popup = document.getElementById('achievement-popup');
    document.getElementById('achievement-icon').textContent = achievement.icon;
    document.getElementById('achievement-title').textContent = achievement.name;
    document.getElementById('achievement-description').textContent = achievement.desc;
    
    popup.classList.add('active');
    setTimeout(() => {
        popup.classList.remove('active');
    }, 3000);
}

function checkRewardSticker() {
    const lastSticker = localStorage.getItem('lastRewardSticker');
    const currentMonth = new Date().getMonth() + '-' + new Date().getFullYear();
    
    if (lastSticker !== currentMonth) {
        showRewardSticker('🌟', 'Awesome! You spent less than your budget this month!');
        localStorage.setItem('lastRewardSticker', currentMonth);
    }
}

function showRewardSticker(emoji, text) {
    const sticker = document.getElementById('reward-sticker');
    sticker.querySelector('.sticker-emoji').textContent = emoji;
    sticker.querySelector('.sticker-text').textContent = text;
    
    sticker.classList.add('active');
    setTimeout(() => {
        sticker.classList.remove('active');
    }, 2000);
}

function checkUnderBudgetStreak(state) {
    let streak = 0;
    const now = new Date();
    
    for (let i = 0; i < 12; i++) {
        const month = now.getMonth() - i;
        const year = now.getFullYear();
        const monthExpenses = state.expenses.filter(e => {
            const d = new Date(e.date);
            return d.getMonth() === month && d.getFullYear() === year;
        });
        const total = monthExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
        
        if (total < state.user.budget) {
            streak++;
        } else {
            break;
        }
    }
    
    return streak;
}

function showCreateGroupModal() {
    document.getElementById('group-modal').classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function createGroup() {
    const name = document.getElementById('new-group-name').value;
    
    if (!name) {
        alert('Please enter a group name');
        return;
    }
    
    const group = {
        id: Date.now().toString(),
        name,
        code: generateGroupCode(),
        members: [],
        createdBy: appState.user.name,
        createdAt: new Date().toISOString()
    };
    
    appState.groups.push(group);
    saveState();
    closeModal();
    displayGroups();
}

function generateGroupCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function displayGroups() {
    const container = document.getElementById('groups-container');
    if (!container) return;
    
    if (appState.groups.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">👥</div><p>No groups yet</p></div>';
        return;
    }
    
    container.innerHTML = appState.groups.map(group => `
        <div class="group-card">
            <div class="group-header">
                <div class="group-name">${group.name}</div>
            </div>
            <div class="group-code">Code: ${group.code}</div>
            <div class="group-members">${group.members.length + 1} members</div>
            <div class="group-actions">
                <button class="btn btn-outline btn-small" onclick="shareGroup('${group.code}')">📤 Share</button>
                <button class="btn btn-outline btn-small" onclick="editGroup('${group.id}')">✏️ Edit</button>
                <button class="btn btn-outline btn-small" onclick="syncGroupData('${group.id}')">🔄 Sync</button>
                <button class="btn btn-danger btn-small" onclick="leaveGroup('${group.id}')">🚪 Leave</button>
            </div>
        </div>
    `).join('');
}

function displayProfileGroups() {
    const listEl = document.getElementById('groups-list');
    if (!listEl) return;
    
    if (appState.groups.length === 0) {
        listEl.innerHTML = '<p style="color: var(--text-secondary); font-size: 14px;">No groups</p>';
        return;
    }
    
    listEl.innerHTML = appState.groups.map(g => 
        `<div style="padding: 8px 0; border-bottom: 1px solid var(--border);">${g.name} (${g.members.length + 1} members)</div>`
    ).join('');
}

function shareGroup(code) {
    const shareText = `Join my expense group! Use code: ${code}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Join Expense Group',
            text: shareText
        });
    } else {
        navigator.clipboard.writeText(code);
        alert('Group code copied to clipboard!');
    }
}

function joinGroup() {
    const code = document.getElementById('join-group-code').value.toUpperCase();
    
    if (!code) {
        alert('Please enter a group code');
        return;
    }
    
    const group = appState.groups.find(g => g.code === code);
    
    if (group) {
        if (!group.members.includes(appState.user.name)) {
            group.members.push(appState.user.name);
            saveState();
            alert('Successfully joined group!');
            showScreen('dashboard-screen');
        } else {
            alert('You are already in this group');
        }
    } else {
        alert('Invalid group code');
    }
}

function updateGroupSelect() {
    const select = document.getElementById('expense-group');
    select.innerHTML = appState.groups.map(g => 
        `<option value="${g.id}">${g.name}</option>`
    ).join('');
}

function exportData() {
    if (appState.expenses.length === 0) {
        alert('No data to export');
        return;
    }
    
    const data = appState.expenses.map(e => ({
        Date: e.date,
        Description: e.description,
        Category: e.category,
        Amount: e.amount,
        'Added By': e.addedBy || appState.user.name,
        Group: e.groupId ? appState.groups.find(g => g.id === e.groupId)?.name || 'N/A' : 'Personal'
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');
    
    XLSX.writeFile(wb, `expense-tracker-${new Date().toISOString().split('T')[0]}.xlsx`);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        
        json.forEach(row => {
            if (row.Date && row.Amount && row.Category) {
                appState.expenses.push({
                    id: Date.now().toString() + Math.random(),
                    date: row.Date,
                    description: row.Description || 'Imported',
                    category: row.Category,
                    amount: parseFloat(row.Amount),
                    addedBy: row['Added By'] || appState.user.name,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        saveState();
        alert('Data imported successfully!');
        updateDashboard();
    };
    reader.readAsArrayBuffer(file);
}

function clearData() {
    if (confirm('Are you sure you want to clear all transactions? This cannot be undone.')) {
        appState.expenses = [];
        saveState();
        alert('All transactions cleared');
        updateDashboard();
        displayTransactions();
    }
}

function resetApp() {
    if (confirm('Are you sure you want to reset the entire app? This will delete ALL data including profile, expenses, goals, and groups. This cannot be undone.')) {
        localStorage.clear();
        location.reload();
    }
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    document.getElementById('modal-overlay').classList.remove('active');
    
    document.getElementById('goal-name').value = '';
    document.getElementById('goal-target').value = '';
    document.getElementById('new-group-name').value = '';
    document.getElementById('contribute-amount').value = '';
    document.getElementById('whatif-amount').value = '';
    if (document.getElementById('edit-group-name')) {
        document.getElementById('edit-group-name').value = '';
    }
    if (document.getElementById('goal-deadline')) {
        document.getElementById('goal-deadline').value = '';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function editGroup(groupId) {
    const group = appState.groups.find(g => g.id === groupId);
    if (!group) return;
    
    appState.currentGroupId = groupId;
    const modal = document.getElementById('edit-group-modal');
    document.getElementById('edit-group-name').value = group.name;
    modal.classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function saveGroupEdit() {
    const group = appState.groups.find(g => g.id === appState.currentGroupId);
    if (!group) return;
    
    const newName = document.getElementById('edit-group-name').value.trim();
    if (!newName) {
        alert('Please enter a group name');
        return;
    }
    
    group.name = newName;
    saveState();
    closeModal();
    displayGroups();
    showNotification('Group updated');
}

function leaveGroup(groupId) {
    if (!confirm('Are you sure you want to leave this group? Your shared expenses will remain with other members.')) {
        return;
    }
    
    const group = appState.groups.find(g => g.id === groupId);
    if (group) {
        group.members = group.members.filter(m => m !== appState.user.name);
        if (group.members.length === 0 && group.createdBy === appState.user.name) {
            appState.groups = appState.groups.filter(g => g.id !== groupId);
        }
        appState.expenses = appState.expenses.filter(e => e.groupId !== groupId);
        saveState();
        displayGroups();
        showNotification('Left group successfully');
    }
}

function exportGroupData(groupId) {
    const group = appState.groups.find(g => g.id === groupId);
    if (!group) return;
    
    const groupExpenses = appState.expenses.filter(e => e.groupId === groupId);
    const groupData = {
        group: {
            id: group.id,
            name: group.name,
            code: group.code,
            members: group.members,
            createdBy: group.createdBy,
            createdAt: group.createdAt
        },
        expenses: groupExpenses,
        exportedBy: appState.user.name,
        exportedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(groupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `group-${group.name}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    showNotification('Group data exported');
}

function importGroupData() {
    document.getElementById('import-group-file').click();
}

function handleGroupImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const groupData = JSON.parse(e.target.result);
            
            const existingGroup = appState.groups.find(g => g.id === groupData.group.id);
            if (existingGroup) {
                if (!existingGroup.members.includes(appState.user.name)) {
                    existingGroup.members.push(appState.user.name);
                }
                
                groupData.expenses.forEach(exp => {
                    const existingExp = appState.expenses.find(e => e.id === exp.id);
                    if (!existingExp) {
                        appState.expenses.push(exp);
                    }
                });
            } else {
                groupData.group.members.push(appState.user.name);
                appState.groups.push(groupData.group);
                appState.expenses.push(...groupData.expenses);
            }
            
            saveState();
            displayGroups();
            updateDashboard();
            showNotification('Group data synced successfully');
        } catch (error) {
            alert('Invalid group data file');
        }
    };
    reader.readAsText(file);
}

function syncGroupData(groupId) {
    const modal = document.getElementById('sync-modal');
    appState.currentGroupId = groupId;
    const group = appState.groups.find(g => g.id === groupId);
    document.getElementById('sync-group-name').textContent = `Sync: ${group.name}`;
    modal.classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

document.addEventListener('DOMContentLoaded', initApp);

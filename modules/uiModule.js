// modules/uiModule.js
const UIModule = (function() {
    // Initialize module
    function init() {
        setupNavigation();
        setupThemeToggle();
        setupSettings();
        addNotificationStyles();
    }
    
    // Setup navigation between panels
    function setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const panels = document.querySelectorAll('.panel');
        
        navButtons.forEach(button => {
            button.addEventListener('click', function() {
                const panelId = this.getAttribute('data-panel');
                
                // Update active button
                navButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Show corresponding panel
                panels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.id === panelId) {
                        panel.classList.add('active');
                        
                        // Update today's log when switching to time panel
                        if (panelId === 'timePanel' && typeof TimeLogModule !== 'undefined') {
                            TimeLogModule.updateTodayLog();
                        }
                    }
                });
            });
        });
    }
    
    // Setup theme toggle - FIXED VERSION
    function setupThemeToggle() {
        const themeBtn = document.getElementById('themeBtn');
        
        if (themeBtn) {
            // Load saved theme first
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                const icon = themeBtn.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-sun';
                }
            }
            
            // Add click event listener
            themeBtn.addEventListener('click', function() {
                const isDark = document.body.classList.toggle('dark-theme');
                
                // Update icon
                const icon = this.querySelector('i');
                if (icon) {
                    if (isDark) {
                        icon.className = 'fas fa-sun';
                    } else {
                        icon.className = 'fas fa-moon';
                    }
                }
                
                // Save preference
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                
                showNotification(`Switched to ${isDark ? 'dark' : 'light'} theme`, 'info');
            });
        }
    }
    
    // Setup settings
    function setupSettings() {
        const settingsBtn = document.getElementById('settingsBtn');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                // Create settings modal
                const settingsHtml = `
                    <div class="modal active" id="settingsModal">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h3><i class="fas fa-cog"></i> Settings</h3>
                                <button class="close-btn" id="closeSettingsModal">&times;</button>
                            </div>
                            <div class="modal-body">
                                <div class="settings-option">
                                    <h4>Monthly Budget</h4>
                                    <div class="budget-input">
                                        <span>₱</span>
                                        <input type="number" id="budgetInput" value="${typeof BudgetModule !== 'undefined' ? BudgetModule.getMonthlyBudget() : '1500'}" min="1">
                                    </div>
                                    <button class="btn-primary" id="saveBudgetBtn">Update Budget</button>
                                </div>
                                <div class="settings-option">
                                    <h4>Data Management</h4>
                                    <button class="btn-secondary" id="exportDataBtn">Export All Data</button>
                                    <button class="btn-secondary" id="resetDataBtn">Reset All Data</button>
                                </div>
                                <div class="settings-option">
                                    <h4>Appearance</h4>
                                    <div class="theme-toggle">
                                        <label>
                                            <input type="checkbox" id="themeToggle" ${localStorage.getItem('theme') === 'dark' ? 'checked' : ''}>
                                            Dark Mode
                                        </label>
                                    </div>
                                </div>
                                <div class="settings-option">
                                    <h4>About</h4>
                                    <p>Budget Tracker Pro v1.0</p>
                                    <p>Track expenses, transportation costs, and time logs in one app.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Add modal to DOM
                const modalContainer = document.createElement('div');
                modalContainer.innerHTML = settingsHtml;
                document.body.appendChild(modalContainer);
                
                // Setup event listeners for the modal
                const closeBtn = document.getElementById('closeSettingsModal');
                if (closeBtn) {
                    closeBtn.addEventListener('click', function() {
                        document.getElementById('settingsModal').remove();
                    });
                }
                
                const saveBudgetBtn = document.getElementById('saveBudgetBtn');
                if (saveBudgetBtn) {
                    saveBudgetBtn.addEventListener('click', function() {
                        const newBudget = parseFloat(document.getElementById('budgetInput').value);
                        if (!isNaN(newBudget) && newBudget > 0) {
                            if (typeof BudgetModule !== 'undefined') {
                                BudgetModule.setMonthlyBudget(newBudget);
                            }
                            document.getElementById('settingsModal').remove();
                            showNotification('Budget updated successfully!', 'success');
                        } else {
                            alert('Please enter a valid budget amount');
                        }
                    });
                }
                
                const exportDataBtn = document.getElementById('exportDataBtn');
                if (exportDataBtn) {
                    exportDataBtn.addEventListener('click', exportAllData);
                }
                
                const resetDataBtn = document.getElementById('resetDataBtn');
                if (resetDataBtn) {
                    resetDataBtn.addEventListener('click', resetAllData);
                }
                
                const themeToggle = document.getElementById('themeToggle');
                if (themeToggle) {
                    themeToggle.addEventListener('change', function() {
                        const isDark = this.checked;
                        document.body.classList.toggle('dark-theme', isDark);
                        
                        // Update theme button icon
                        const themeBtn = document.getElementById('themeBtn');
                        if (themeBtn) {
                            const icon = themeBtn.querySelector('i');
                            if (icon) {
                                icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
                            }
                        }
                        
                        localStorage.setItem('theme', isDark ? 'dark' : 'light');
                        showNotification(`${isDark ? 'Dark' : 'Light'} theme applied`, 'info');
                    });
                }
                
                // Close when clicking outside
                const settingsModal = document.getElementById('settingsModal');
                if (settingsModal) {
                    settingsModal.addEventListener('click', function(e) {
                        if (e.target === this) {
                            this.remove();
                        }
                    });
                }
            });
        }
    }
    
    // Export all data
    function exportAllData() {
        // Collect all data
        const exportData = {
            expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
            transportLogs: JSON.parse(localStorage.getItem('transportLogs') || '[]'),
            timeLogs: JSON.parse(localStorage.getItem('timeLogs') || '[]'),
            monthlyBudget: localStorage.getItem('monthlyBudget') || '1500',
            theme: localStorage.getItem('theme') || 'light',
            exportDate: new Date().toISOString()
        };
        
        // Create JSON file
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget_tracker_data_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('All data exported successfully!', 'success');
    }
    
    // Reset all data
    function resetAllData() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.clear();
            
            // Set default theme to light
            localStorage.setItem('theme', 'light');
            
            // Reload the page to reset everything
            location.reload();
        }
    }
    
    // Add notification styles to head
    function addNotificationStyles() {
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
                
                .notification {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    padding: 12px 20px;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 1000;
                    animation: slideIn 0.3s ease;
                    max-width: 300px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .notification.success {
                    background-color: #4ade80;
                }
                
                .notification.error {
                    background-color: #ef4444;
                }
                
                .notification.info {
                    background-color: #4361ee;
                }
                
                .notification.warning {
                    background-color: #f59e0b;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Show notification
    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
    // Public API
    return {
        init,
        showNotification,
        setupThemeToggle
    };
})();
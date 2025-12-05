// modules/uiModule.js
const UIModule = (function() {
    // Initialize module
    function init() {
        setupNavigation();
        setupThemeToggle();
        setupSettings();
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
                    }
                });
            });
        });
    }
    
    // Setup theme toggle
    function setupThemeToggle() {
        const themeBtn = document.getElementById('themeBtn');
        
        if (themeBtn) {
            themeBtn.addEventListener('click', function() {
                const isDark = document.body.classList.toggle('dark-theme');
                
                // Update icon
                const icon = this.querySelector('i');
                if (isDark) {
                    icon.className = 'fas fa-sun';
                } else {
                    icon.className = 'fas fa-moon';
                }
                
                // Save preference
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
                
                showNotification(`Switched to ${isDark ? 'dark' : 'light'} theme`, 'info');
            });
            
            // Load saved theme
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.add('dark-theme');
                const icon = themeBtn.querySelector('i');
                icon.className = 'fas fa-sun';
            }
        }
    }
    
    // Setup settings
    function setupSettings() {
        const settingsBtn = document.getElementById('settingsBtn');
        
        if (settingsBtn) {
            settingsBtn.addEventListener('click', function() {
                // In a full app, this would open a settings panel
                // For now, show a simple dialog with options
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
                                        <input type="number" id="budgetInput" value="${BudgetModule.getMonthlyBudget()}" min="1">
                                    </div>
                                    <button class="btn-primary" id="saveBudgetBtn">Update Budget</button>
                                </div>
                                <div class="settings-option">
                                    <h4>Data Management</h4>
                                    <button class="btn-secondary" id="exportDataBtn">Export All Data</button>
                                    <button class="btn-secondary" id="resetDataBtn">Reset All Data</button>
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
                document.getElementById('closeSettingsModal').addEventListener('click', function() {
                    document.getElementById('settingsModal').remove();
                });
                
                document.getElementById('saveBudgetBtn').addEventListener('click', function() {
                    const newBudget = parseFloat(document.getElementById('budgetInput').value);
                    if (!isNaN(newBudget) && newBudget > 0) {
                        BudgetModule.setMonthlyBudget(newBudget);
                        document.getElementById('settingsModal').remove();
                        showNotification('Budget updated successfully!', 'success');
                    } else {
                        alert('Please enter a valid budget amount');
                    }
                });
                
                document.getElementById('exportDataBtn').addEventListener('click', exportAllData);
                document.getElementById('resetDataBtn').addEventListener('click', resetAllData);
                
                // Close when clicking outside
                document.getElementById('settingsModal').addEventListener('click', function(e) {
                    if (e.target === this) {
                        this.remove();
                    }
                });
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
            
            // Reload the page to reset everything
            location.reload();
        }
    }
    
    // Show notification
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        // Set background color based on type
        if (type === 'success') {
            notification.style.backgroundColor = '#4ade80';
        } else if (type === 'error') {
            notification.style.backgroundColor = '#ef4444';
        } else {
            notification.style.backgroundColor = '#4361ee';
        }
        
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
        init
    };
})();
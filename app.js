// app.js
// Main application controller

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initializeApp();
});

function initializeApp() {
    console.log('Budget Tracker App Initializing...');
    
    // Set current month display
    updateCurrentMonthDisplay();
    
    // Initialize theme first
    if (typeof UIModule !== 'undefined') {
        UIModule.init();
    }
    
    // Initialize other modules
    if (typeof ExpenseModule !== 'undefined') ExpenseModule.init();
    if (typeof TransportModule !== 'undefined') TransportModule.init();
    if (typeof TimeLogModule !== 'undefined') TimeLogModule.init();
    if (typeof BudgetModule !== 'undefined') BudgetModule.init();
    if (typeof NamedBudgetModule !== 'undefined') NamedBudgetModule.init(); // Changed from QuarterlyBudgetModule
    
    // Set date inputs to current date
    setCurrentDates();
    
    // Update current time display
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Update dashboard with empty data
    if (typeof BudgetModule !== 'undefined') {
        BudgetModule.updateDashboard();
        
        // Setup expense update listener
        if (typeof ExpenseModule !== 'undefined') {
            const originalSaveExpenses = ExpenseModule.saveExpenses;
            ExpenseModule.saveExpenses = function() {
                originalSaveExpenses.call(this);
                BudgetModule.onExpensesUpdated();
            };
        }
    }
    
    // Setup daily spending button
    const dailySpendingBtn = document.getElementById('dailySpendingBtn');
    if (dailySpendingBtn) {
        dailySpendingBtn.addEventListener('click', showDailySpending);
    }
    
    // Setup budget config card click
    const budgetConfigCard = document.getElementById('budgetConfigCard');
    if (budgetConfigCard) {
        budgetConfigCard.addEventListener('click', function() {
            if (typeof BudgetModule !== 'undefined') {
                BudgetModule.openBudgetConfigModal();
            }
        });
    }
    
    // Initialize fare table
    if (typeof TransportModule !== 'undefined') {
        TransportModule.updateFareTable();
    }
    
    // Setup named budget module listeners if available
    if (typeof NamedBudgetModule !== 'undefined') {
        // Listen for expense updates to refresh named budgets if needed
        const originalSaveExpenses = ExpenseModule.saveExpenses;
        ExpenseModule.saveExpenses = function() {
            originalSaveExpenses.call(this);
            // If a named budget is currently loaded, refresh it
            if (NamedBudgetModule.currentBudgetData) {
                NamedBudgetModule.loadBudgetDataById(NamedBudgetModule.currentBudgetData.budget.id);
            }
        };
    }
    
    console.log('Budget Tracker App Initialized!');
}

function updateCurrentMonthDisplay() {
    const currentMonthElement = document.querySelector('.current-month');
    if (currentMonthElement) {
        const now = new Date('2025-12-05'); // Fixed date for this app
        currentMonthElement.textContent = now.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });
    }
}

function setCurrentDates() {
    const today = new Date('2025-12-05').toISOString().split('T')[0];
    const firstOfMonth = new Date(2025, 11, 1).toISOString().split('T')[0];
    const lastOfMonth = new Date(2025, 11, 31).toISOString().split('T')[0];
    
    // Get all date inputs and set to current date
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        // Don't override if it already has a value (like in modals)
        if (!input.value) {
            // Check if it's a budget modal date field
            if (input.id === 'namedBudgetStartDate' || input.id === 'namedBudgetEndDate') {
                // Leave budget dates as they are (they have defaults)
                return;
            }
            input.value = today;
        }
        input.min = firstOfMonth;
        input.max = lastOfMonth;
    });
    
    // Set specific date inputs
    const tripDateFilter = document.getElementById('tripDateFilter');
    if (tripDateFilter) {
        tripDateFilter.value = '';
        tripDateFilter.min = firstOfMonth;
        tripDateFilter.max = lastOfMonth;
    }
    
    // Set log date to today by default
    const logDate = document.getElementById('logDate');
    if (logDate) {
        logDate.value = today;
        logDate.min = firstOfMonth;
        logDate.max = lastOfMonth;
    }
    
    // Set daily date to today
    const dailyDate = document.getElementById('dailyDate');
    if (dailyDate) {
        dailyDate.value = today;
        dailyDate.min = firstOfMonth;
        dailyDate.max = lastOfMonth;
    }
    
    // Set budget start date to today if empty
    const budgetStartDate = document.getElementById('budgetStartDate');
    if (budgetStartDate && !budgetStartDate.value) {
        budgetStartDate.value = today;
    }
    
    // Set named budget start date to today if empty
    const namedBudgetStartDate = document.getElementById('namedBudgetStartDate');
    if (namedBudgetStartDate && !namedBudgetStartDate.value) {
        namedBudgetStartDate.value = today;
    }
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    const currentTimeElement = document.getElementById('currentTime');
    const currentDateElement = document.getElementById('currentDate');
    
    if (currentTimeElement) currentTimeElement.textContent = timeString;
    if (currentDateElement) currentDateElement.textContent = dateString;
}

// Global function for daily spending
function showDailySpending() {
    if (typeof BudgetModule !== 'undefined') {
        BudgetModule.showDailySpending();
    }
}

// Reset function
function resetToDecember5() {
    if (confirm('Reset all data and start fresh for December 5, 2025?')) {
        localStorage.clear();
        localStorage.setItem('monthlyBudget', '1500');
        localStorage.setItem('budgetConfig', JSON.stringify({
            description: 'December 2025 Budget',
            amount: 1500,
            startDate: '2025-12-05',
            endDate: '2026-01-04',
            duration: 30
        }));
        localStorage.setItem('theme', 'light');
        location.reload();
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set default stations for LRT calculator
    const stationFrom = document.getElementById('stationFrom');
    const stationTo = document.getElementById('stationTo');
    
    if (stationFrom) stationFrom.value = '5th Avenue';
    if (stationTo) stationTo.value = 'Gil Puyat';
    
    // Add click handler for modal close buttons
    document.addEventListener('click', function(e) {
        // Handle modal close buttons
        if (e.target.classList.contains('close-btn')) {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
            }
        }
    });
    
    // Initialize named budget duration calculation
    const budgetDuration = document.getElementById('budgetDuration');
    if (budgetDuration) {
        budgetDuration.addEventListener('change', function() {
            const customDaysGroup = document.getElementById('customDaysGroup');
            if (this.value === 'custom') {
                if (customDaysGroup) customDaysGroup.style.display = 'block';
            } else {
                if (customDaysGroup) customDaysGroup.style.display = 'none';
                if (typeof NamedBudgetModule !== 'undefined') {
                    NamedBudgetModule.calculateEndDate();
                    NamedBudgetModule.calculateNamedBudgetBreakdown();
                }
            }
        });
    }
    
    // Initialize budget amount calculation
    const namedBudgetAmount = document.getElementById('namedBudgetAmount');
    if (namedBudgetAmount) {
        namedBudgetAmount.addEventListener('input', function() {
            if (typeof NamedBudgetModule !== 'undefined') {
                NamedBudgetModule.calculateNamedBudgetBreakdown();
            }
        });
    }
});

// Global function to show notification (used by modules)
function showNotification(message, type = 'info') {
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
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;
    
    // Set background color based on type
    if (type === 'success') {
        notification.style.backgroundColor = '#4ade80';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    } else if (type === 'warning') {
        notification.style.backgroundColor = '#f59e0b';
    } else {
        notification.style.backgroundColor = '#4361ee';
    }
    
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(note => note.remove());
    
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

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Utility function to get category info
function getCategoryInfo(category) {
    const categories = {
        transport: { name: 'Transportation', color: '#4361ee', icon: 'fas fa-train' },
        food: { name: 'Food', color: '#f59e0b', icon: 'fas fa-utensils' },
        coffee: { name: 'Coffee', color: '#8b4513', icon: 'fas fa-coffee' },
        groceries: { name: 'Groceries', color: '#4ade80', icon: 'fas fa-shopping-basket' },
        entertainment: { name: 'Entertainment', color: '#ec4899', icon: 'fas fa-film' },
        other: { name: 'Other', color: '#64748b', icon: 'fas fa-wallet' }
    };
    
    return categories[category] || categories.other;
}

// Utility function to format date range
function formatDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
}

// Export function for other modules to use
window.showNotification = showNotification;
window.formatDate = formatDate;
window.getCategoryInfo = getCategoryInfo;
window.formatDateRange = formatDateRange;
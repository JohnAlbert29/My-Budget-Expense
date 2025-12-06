// app.js
// Main application controller

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initializeApp();
});

function initializeApp() {
    console.log('Budget Tracker App Initializing...');
    
    // Set current month to December 2025
    updateCurrentMonthDisplay();
    
    // Initialize modules
    if (typeof ExpenseModule !== 'undefined') ExpenseModule.init();
    if (typeof TransportModule !== 'undefined') TransportModule.init();
    if (typeof TimeLogModule !== 'undefined') TimeLogModule.init();
    if (typeof BudgetModule !== 'undefined') BudgetModule.init();
    if (typeof UIModule !== 'undefined') UIModule.init();
    
    // Set current date in date inputs to December 5, 2025
    setDecember5Dates();
    
    // Update current time display
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Update dashboard with empty data
    if (typeof BudgetModule !== 'undefined') {
        BudgetModule.updateDashboard();
        
        // Setup expense update listener
        if (typeof ExpenseModule !== 'undefined') {
            // Override the saveExpenses function to trigger dashboard updates
            const originalSaveExpenses = ExpenseModule.saveExpenses;
            ExpenseModule.saveExpenses = function() {
                originalSaveExpenses.call(this);
                BudgetModule.onExpensesUpdated();
            };
        }
    }
    
    // Update fare table
    updateFareTable();
    
    console.log('Budget Tracker App Initialized! Starting fresh for December 5, 2025.');
}

function updateCurrentMonthDisplay() {
    const currentMonthElement = document.querySelector('.current-month');
    if (currentMonthElement) {
        currentMonthElement.textContent = 'December 2025';
    }
}

function setDecember5Dates() {
    // Set all dates to December 5, 2025
    const december5 = '2025-12-05';
    const decemberStart = '2025-12-01';
    const decemberEnd = '2025-12-31';
    
    // Get all date inputs and set to December 5, 2025
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.value = december5;
        input.min = decemberStart;
        input.max = decemberEnd;
    });
}

function updateCurrentTime() {
    // Use actual current time
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    // But use December 5, 2025 for the date display
    const dateString = 'Friday, December 5, 2025';
    
    const currentTimeElement = document.getElementById('currentTime');
    const currentDateElement = document.getElementById('currentDate');
    
    if (currentTimeElement) currentTimeElement.textContent = timeString;
    if (currentDateElement) currentDateElement.textContent = dateString;
}

// Update fare table
function updateFareTable() {
    // Calculate Baclaran to Roosevelt (19 stations)
    const stations1 = 19;
    const fare1 = 16.25 + (stations1 * 1.47);
    const discountedFare1 = fare1 * 0.5;
    
    // Calculate average trip (5 stations)
    const stations2 = 5;
    const fare2 = 16.25 + (stations2 * 1.47);
    const discountedFare2 = fare2 * 0.5;
    
    // Calculate short trip (3 stations)
    const stations3 = 3;
    const fare3 = 16.25 + (stations3 * 1.47);
    const discountedFare3 = fare3 * 0.5;
    
    // Update the display
    document.getElementById('fullFare1').textContent = fare1.toFixed(2);
    document.getElementById('discountedFare1').textContent = discountedFare1.toFixed(2);
    
    document.getElementById('fullFare2').textContent = fare2.toFixed(2);
    document.getElementById('discountedFare2').textContent = discountedFare2.toFixed(2);
    
    document.getElementById('fullFare3').textContent = fare3.toFixed(2);
    document.getElementById('discountedFare3').textContent = discountedFare3.toFixed(2);
}

// Add this to your app.js
function showDailySpending() {
    BudgetModule.showDailySpending();
}

// In app.js, add to initializeApp function:
function initializeApp() {
    console.log('Budget Tracker App Initializing...');
    
    // Set current month to December 2025
    updateCurrentMonthDisplay();
    
    // Initialize modules
    if (typeof ExpenseModule !== 'undefined') ExpenseModule.init();
    if (typeof TransportModule !== 'undefined') TransportModule.init();
    if (typeof TimeLogModule !== 'undefined') TimeLogModule.init();
    if (typeof BudgetModule !== 'undefined') BudgetModule.init();
    if (typeof UIModule !== 'undefined') UIModule.init();
    
    // Set current date in date inputs to December 5, 2025
    setDecember5Dates();
    
    // Update current time display
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Update dashboard with empty data
    if (typeof BudgetModule !== 'undefined') {
        BudgetModule.updateDashboard();
        
        // Setup expense update listener
        if (typeof ExpenseModule !== 'undefined') {
            // Override the saveExpenses function to trigger dashboard updates
            const originalSaveExpenses = ExpenseModule.saveExpenses;
            ExpenseModule.saveExpenses = function() {
                originalSaveExpenses.call(this);
                BudgetModule.onExpensesUpdated();
            };
        }
    }
    
    console.log('Budget Tracker App Initialized! Starting fresh for December 5, 2025.');
}

// app.js - Updated with new module initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    console.log('Budget Tracker App Initializing...');
    
    updateCurrentMonthDisplay();
    
    // Initialize all modules
    if (typeof ExpenseModule !== 'undefined') ExpenseModule.init();
    if (typeof TransportModule !== 'undefined') TransportModule.init();
    if (typeof TimeLogModule !== 'undefined') TimeLogModule.init();
    if (typeof BudgetModule !== 'undefined') BudgetModule.init();
    if (typeof QuarterlyBudgetModule !== 'undefined') QuarterlyBudgetModule.init();
    if (typeof UIModule !== 'undefined') UIModule.init();
    
    setDecember5Dates();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
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
    
    console.log('Budget Tracker App Initialized!');
}

function updateCurrentMonthDisplay() {
    const currentMonthElement = document.querySelector('.current-month');
    if (currentMonthElement) {
        currentMonthElement.textContent = 'December 2025';
    }
}

function setDecember5Dates() {
    const december5 = '2025-12-05';
    const decemberStart = '2025-12-01';
    const decemberEnd = '2025-12-31';
    
    const dateInputs = document.querySelectorAll('input[type="date"]');
    dateInputs.forEach(input => {
        input.value = december5;
        input.min = decemberStart;
        input.max = decemberEnd;
    });
    
    // Set trip date filter to empty by default
    const tripDateFilter = document.getElementById('tripDateFilter');
    if (tripDateFilter) {
        tripDateFilter.value = '';
        tripDateFilter.min = decemberStart;
        tripDateFilter.max = decemberEnd;
    }
}

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    const dateString = 'Friday, December 5, 2025';
    
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
        location.reload();
    }
}

// Add LRT fare initialization
document.addEventListener('DOMContentLoaded', function() {
    // Set default stations to 5th Avenue and Gil Puyat
    const stationFrom = document.getElementById('stationFrom');
    const stationTo = document.getElementById('stationTo');
    
    if (stationFrom) stationFrom.value = '5th Avenue';
    if (stationTo) stationTo.value = 'Gil Puyat';
});
// Add event listener for daily spending
document.addEventListener('DOMContentLoaded', function() {
    // Add daily spending button event listener
    const dailySpendingBtn = document.getElementById('dailySpendingBtn');
    if (dailySpendingBtn) {
        dailySpendingBtn.addEventListener('click', showDailySpending);
    }
    
    // Initialize fare table
    updateFareTable();
});
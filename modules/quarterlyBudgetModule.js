// modules/quarterlyBudgetModule.js
const QuarterlyBudgetModule = (function() {
    // Private variables
    let quarterlyBudgets = [];
    let currentQuarterData = null;
    
    // DOM Elements
    const createQuarterlyBudgetBtn = document.getElementById('createQuarterlyBudgetBtn');
    const quarterlyBudgetModal = document.getElementById('quarterlyBudgetModal');
    const quarterlyBudgetForm = document.getElementById('quarterlyBudgetForm');
    const quarterSelect = document.getElementById('quarterSelect');
    const yearSelect = document.getElementById('yearSelect');
    const loadQuarterDataBtn = document.getElementById('loadQuarterDataBtn');
    const quarterSummary = document.getElementById('quarterSummary');
    const quarterDetails = document.getElementById('quarterDetails');
    const printQuarterReportBtn = document.getElementById('printQuarterReportBtn');
    const exportQuarterCSVBtn = document.getElementById('exportQuarterCSVBtn');
    const exportQuarterPDFBtn = document.getElementById('exportQuarterPDFBtn');
    
    // Initialize module
    function init() {
        loadQuarterlyBudgets();
        setupEventListeners();
    }
    
    // Load quarterly budgets from localStorage
    function loadQuarterlyBudgets() {
        const storedBudgets = localStorage.getItem('quarterlyBudgets');
        quarterlyBudgets = storedBudgets ? JSON.parse(storedBudgets) : [];
        
        // Create default Q4 2025 budget if none exists
        if (quarterlyBudgets.length === 0) {
            const defaultBudget = {
                id: Date.now(),
                name: 'Q4 2025 Budget',
                quarter: 'Q4',
                year: 2025,
                amount: 4500, // ₱1,500 × 3 months
                startDate: '2025-10-01',
                endDate: '2025-12-31',
                createdAt: new Date().toISOString()
            };
            quarterlyBudgets.push(defaultBudget);
            saveQuarterlyBudgets();
        }
    }
    
    // Save quarterly budgets to localStorage
    function saveQuarterlyBudgets() {
        localStorage.setItem('quarterlyBudgets', JSON.stringify(quarterlyBudgets));
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Create quarterly budget button
        if (createQuarterlyBudgetBtn) {
            createQuarterlyBudgetBtn.addEventListener('click', openQuarterlyBudgetModal);
        }
        
        // Quarterly budget modal
        const closeQuarterlyBudgetModal = document.getElementById('closeQuarterlyBudgetModal');
        const cancelQuarterlyBudgetBtn = document.getElementById('cancelQuarterlyBudgetBtn');
        
        if (closeQuarterlyBudgetModal) {
            closeQuarterlyBudgetModal.addEventListener('click', closeQuarterlyBudgetModalFunc);
        }
        
        if (cancelQuarterlyBudgetBtn) {
            cancelQuarterlyBudgetBtn.addEventListener('click', closeQuarterlyBudgetModalFunc);
        }
        
        if (quarterlyBudgetForm) {
            quarterlyBudgetForm.addEventListener('submit', handleQuarterlyBudgetSubmit);
        }
        
        // Calculate budget breakdown on input
        const quarterlyBudgetAmount = document.getElementById('quarterlyBudgetAmount');
        if (quarterlyBudgetAmount) {
            quarterlyBudgetAmount.addEventListener('input', calculateQuarterlyBudgetBreakdown);
        }
        
        // Quarter data loading
        if (loadQuarterDataBtn) {
            loadQuarterDataBtn.addEventListener('click', loadQuarterData);
        }
        
        // Report buttons
        if (printQuarterReportBtn) {
            printQuarterReportBtn.addEventListener('click', printQuarterReport);
        }
        
        if (exportQuarterCSVBtn) {
            exportQuarterCSVBtn.addEventListener('click', exportQuarterCSV);
        }
        
        if (exportQuarterPDFBtn) {
            exportQuarterPDFBtn.addEventListener('click', exportQuarterPDF);
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === quarterlyBudgetModal) {
                closeQuarterlyBudgetModalFunc();
            }
        });
    }
    
    // Open quarterly budget modal
    function openQuarterlyBudgetModal() {
        if (quarterlyBudgetModal) {
            quarterlyBudgetModal.classList.add('active');
            
            // Set default values
            document.getElementById('quarterlyBudgetName').value = '';
            document.getElementById('quarterlyBudgetQuarter').value = 'Q4';
            document.getElementById('quarterlyBudgetYear').value = new Date().getFullYear();
            document.getElementById('quarterlyBudgetAmount').value = '';
            document.getElementById('quarterlyBudgetStartDate').value = '';
            document.getElementById('quarterlyBudgetEndDate').value = '';
            
            calculateQuarterlyBudgetBreakdown();
        }
    }
    
    // Close quarterly budget modal
    function closeQuarterlyBudgetModalFunc() {
        if (quarterlyBudgetModal) {
            quarterlyBudgetModal.classList.remove('active');
            quarterlyBudgetForm.reset();
        }
    }
    
    // Calculate quarterly budget breakdown
    function calculateQuarterlyBudgetBreakdown() {
        const amountInput = document.getElementById('quarterlyBudgetAmount');
        if (!amountInput) return;
        
        const amount = parseFloat(amountInput.value) || 0;
        
        // Calculate breakdowns
        const monthlyBudget = amount / 3;
        const weeklyBudget = amount / 13; // Approx 13 weeks in a quarter
        const dailyBudget = amount / 90; // Approx 90 days in a quarter
        
        // Update displays
        const monthlyBudgetCalc = document.getElementById('monthlyBudgetCalc');
        const weeklyBudgetCalcQ = document.getElementById('weeklyBudgetCalcQ');
        const dailyBudgetCalcQ = document.getElementById('dailyBudgetCalcQ');
        
        if (monthlyBudgetCalc) monthlyBudgetCalc.textContent = `₱${monthlyBudget.toFixed(2)}`;
        if (weeklyBudgetCalcQ) weeklyBudgetCalcQ.textContent = `₱${weeklyBudget.toFixed(2)}`;
        if (dailyBudgetCalcQ) dailyBudgetCalcQ.textContent = `₱${dailyBudget.toFixed(2)}`;
    }
    
    // Handle quarterly budget submission
    function handleQuarterlyBudgetSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('quarterlyBudgetName').value;
        const quarter = document.getElementById('quarterlyBudgetQuarter').value;
        const year = parseInt(document.getElementById('quarterlyBudgetYear').value);
        const amount = parseFloat(document.getElementById('quarterlyBudgetAmount').value);
        const startDate = document.getElementById('quarterlyBudgetStartDate').value;
        const endDate = document.getElementById('quarterlyBudgetEndDate').value;
        
        if (!name || !quarter || !year || !amount || !startDate || !endDate) {
            alert('Please fill in all required fields');
            return;
        }
        
        const newBudget = {
            id: Date.now(),
            name,
            quarter,
            year,
            amount,
            startDate,
            endDate,
            createdAt: new Date().toISOString()
        };
        
        quarterlyBudgets.push(newBudget);
        saveQuarterlyBudgets();
        closeQuarterlyBudgetModalFunc();
        
        showNotification('Quarterly budget created successfully!', 'success');
    }
    
    // Load quarter data
    function loadQuarterData() {
        const quarterValue = quarterSelect.value;
        const yearValue = parseInt(yearSelect.value);
        
        if (!quarterValue) {
            alert('Please select a quarter');
            return;
        }
        
        // Parse quarter and year from selection
        const [quarter, year] = quarterValue.split('-');
        
        // Get quarter dates
        const quarterDates = getQuarterDates(quarter, parseInt(year));
        
        // Get expenses for this quarter
        let quarterExpenses = [];
        let quarterTransportLogs = [];
        let quarterTimeLogs = [];
        
        if (typeof ExpenseModule !== 'undefined') {
            const allExpenses = ExpenseModule.getAllExpenses();
            quarterExpenses = allExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= quarterDates.start && expenseDate <= quarterDates.end;
            });
        }
        
        if (typeof TransportModule !== 'undefined') {
            quarterTransportLogs = TransportModule.getLogsByDateRange(quarterDates.start, quarterDates.end);
        }
        
        if (typeof TimeLogModule !== 'undefined') {
            quarterTimeLogs = TimeLogModule.getLogsByDateRange(quarterDates.start, quarterDates.end);
        }
        
        // Calculate totals
        const totalExpenses = quarterExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalTransportCost = quarterTransportLogs.reduce((sum, log) => sum + log.cost, 0);
        const totalTransportSavings = quarterTransportLogs.reduce((sum, log) => sum + log.savings, 0);
        
        // Group expenses by category
        const expensesByCategory = quarterExpenses.reduce((cats, exp) => {
            cats[exp.category] = (cats[exp.category] || 0) + exp.amount;
            return cats;
        }, {});
        
        // Group expenses by month
        const expensesByMonth = quarterExpenses.reduce((months, exp) => {
            const date = new Date(exp.date);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            if (!months[monthKey]) {
                months[monthKey] = {
                    total: 0,
                    expenses: []
                };
            }
            months[monthKey].total += exp.amount;
            months[monthKey].expenses.push(exp);
            return months;
        }, {});
        
        // Store current quarter data
        currentQuarterData = {
            quarter,
            year: parseInt(year),
            dates: quarterDates,
            expenses: quarterExpenses,
            transportLogs: quarterTransportLogs,
            timeLogs: quarterTimeLogs,
            totals: {
                expenses: totalExpenses,
                transportCost: totalTransportCost,
                transportSavings: totalTransportSavings
            },
            byCategory: expensesByCategory,
            byMonth: expensesByMonth
        };
        
        // Display quarter data
        displayQuarterData();
    }
    
    // Get quarter dates
    function getQuarterDates(quarter, year) {
        let startDate, endDate;
        
        switch(quarter) {
            case 'Q1':
                startDate = new Date(year, 0, 1); // January 1
                endDate = new Date(year, 2, 31); // March 31
                break;
            case 'Q2':
                startDate = new Date(year, 3, 1); // April 1
                endDate = new Date(year, 5, 30); // June 30
                break;
            case 'Q3':
                startDate = new Date(year, 6, 1); // July 1
                endDate = new Date(year, 8, 30); // September 30
                break;
            case 'Q4':
                startDate = new Date(year, 9, 1); // October 1
                endDate = new Date(year, 11, 31); // December 31
                break;
            default:
                startDate = new Date(year, 0, 1);
                endDate = new Date(year, 11, 31);
        }
        
        return {
            start: startDate,
            end: endDate,
            quarter: quarter,
            year: year
        };
    }
    
    // Display quarter data
    function displayQuarterData() {
        if (!currentQuarterData) return;
        
        const data = currentQuarterData;
        const quarterName = `${data.quarter} ${data.year}`;
        const startDateStr = data.dates.start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const endDateStr = data.dates.end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        // Update quarter summary
        quarterSummary.innerHTML = `
            <h3><i class="fas fa-chart-pie"></i> ${quarterName} Summary</h3>
            <div class="summary-grid">
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-receipt"></i>
                    </div>
                    <div class="summary-info">
                        <h4>Total Expenses</h4>
                        <div class="amount">₱${data.totals.expenses.toFixed(2)}</div>
                        <small>${data.expenses.length} transactions</small>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-train"></i>
                    </div>
                    <div class="summary-info">
                        <h4>Transport Cost</h4>
                        <div class="amount">₱${data.totals.transportCost.toFixed(2)}</div>
                        <small>${data.transportLogs.length} trips</small>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-piggy-bank"></i>
                    </div>
                    <div class="summary-info">
                        <h4>LRT Savings</h4>
                        <div class="amount">₱${data.totals.transportSavings.toFixed(2)}</div>
                        <small>From discounts</small>
                    </div>
                </div>
                <div class="summary-card">
                    <div class="summary-icon">
                        <i class="fas fa-calendar"></i>
                    </div>
                    <div class="summary-info">
                        <h4>Period</h4>
                        <div class="amount">${data.quarter}</div>
                        <small>${startDateStr} to ${endDateStr}</small>
                    </div>
                </div>
            </div>
        `;
        
        // Update quarter details
        quarterDetails.innerHTML = `
            <div class="details-grid">
                <div class="details-section">
                    <h4><i class="fas fa-list"></i> Expenses by Category</h4>
                    <div class="category-breakdown">
                        ${Object.entries(data.byCategory).map(([category, amount]) => {
                            const categoryInfo = getCategoryInfo(category);
                            const percentage = (amount / data.totals.expenses) * 100;
                            return `
                                <div class="category-item">
                                    <div class="category-info">
                                        <div class="category-color" style="background-color: ${categoryInfo.color}"></div>
                                        <span>${categoryInfo.name}</span>
                                    </div>
                                    <div class="category-stats">
                                        <span class="amount">₱${amount.toFixed(2)}</span>
                                        <span class="percentage">${percentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                
                <div class="details-section">
                    <h4><i class="fas fa-calendar-alt"></i> Monthly Breakdown</h4>
                    <div class="monthly-breakdown">
                        ${Object.entries(data.byMonth).map(([monthKey, monthData]) => {
                            const [year, month] = monthKey.split('-');
                            const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' });
                            return `
                                <div class="month-item">
                                    <div class="month-header">
                                        <span>${monthName} ${year}</span>
                                        <span class="amount">₱${monthData.total.toFixed(2)}</span>
                                    </div>
                                    <div class="month-details">
                                        <small>${monthData.expenses.length} expenses</small>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            
            <div class="details-section full-width">
                <h4><i class="fas fa-history"></i> Recent Transactions</h4>
                <div class="recent-transactions">
                    ${data.expenses.slice(0, 10).map(expense => {
                        const categoryInfo = getCategoryInfo(expense.category);
                        const date = new Date(expense.date);
                        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        return `
                            <div class="transaction-item">
                                <div class="transaction-info">
                                    <div class="transaction-category" style="background-color: ${categoryInfo.color}"></div>
                                    <div>
                                        <div class="transaction-desc">${expense.description || 'No description'}</div>
                                        <div class="transaction-meta">${categoryInfo.name} • ${dateStr}</div>
                                    </div>
                                </div>
                                <div class="transaction-amount">₱${expense.amount.toFixed(2)}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    }
    
    // Get category info
    function getCategoryInfo(category) {
        const categories = {
            transport: { name: 'Transportation', color: '#4361ee' },
            food: { name: 'Food', color: '#f59e0b' },
            coffee: { name: 'Coffee', color: '#8b4513' },
            groceries: { name: 'Groceries', color: '#4ade80' },
            entertainment: { name: 'Entertainment', color: '#ec4899' },
            other: { name: 'Other', color: '#64748b' }
        };
        
        return categories[category] || categories.other;
    }
    
    // Print quarter report
    function printQuarterReport() {
        if (!currentQuarterData) {
            alert('Please load quarter data first');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        const data = currentQuarterData;
        const quarterName = `${data.quarter} ${data.year}`;
        const startDateStr = data.dates.start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const endDateStr = data.dates.end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Quarterly Report - ${quarterName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #4361ee; border-bottom: 2px solid #4361ee; padding-bottom: 10px; }
                    .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
                    .summary-item { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                    .category-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .amount { font-weight: bold; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .date { color: #666; margin: 10px 0; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Budget Tracker - Quarterly Report</h1>
                    <h2>${quarterName}</h2>
                    <div class="date">${startDateStr} to ${endDateStr}</div>
                </div>
                
                <div class="summary">
                    <div class="summary-item">
                        <h3>Total Expenses</h3>
                        <div class="amount">₱${data.totals.expenses.toFixed(2)}</div>
                        <small>${data.expenses.length} transactions</small>
                    </div>
                    <div class="summary-item">
                        <h3>Transport Cost</h3>
                        <div class="amount">₱${data.totals.transportCost.toFixed(2)}</div>
                        <small>${data.transportLogs.length} trips</small>
                    </div>
                    <div class="summary-item">
                        <h3>LRT Savings</h3>
                        <div class="amount">₱${data.totals.transportSavings.toFixed(2)}</div>
                        <small>From discounts</small>
                    </div>
                    <div class="summary-item">
                        <h3>Average Daily</h3>
                        <div class="amount">₱${(data.totals.expenses / 90).toFixed(2)}</div>
                        <small>Per day estimate</small>
                    </div>
                </div>
                
                <h3>Expenses by Category</h3>
                ${Object.entries(data.byCategory).map(([category, amount]) => {
                    const categoryInfo = getCategoryInfo(category);
                    const percentage = (amount / data.totals.expenses) * 100;
                    return `
                        <div class="category-item">
                            <span>${categoryInfo.name}</span>
                            <div>
                                <span class="amount">₱${amount.toFixed(2)}</span>
                                <span>(${percentage.toFixed(1)}%)</span>
                            </div>
                        </div>
                    `;
                }).join('')}
                
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()">Print Report</button>
                    <button onclick="window.close()">Close</button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    // Export quarter data as CSV
    function exportQuarterCSV() {
        if (!currentQuarterData) {
            alert('Please load quarter data first');
            return;
        }
        
        const data = currentQuarterData;
        let csvContent = "Quarterly Report\n";
        csvContent += `Quarter: ${data.quarter} ${data.year}\n`;
        csvContent += `Period: ${data.dates.start.toLocaleDateString()} to ${data.dates.end.toLocaleDateString()}\n\n`;
        
        // Summary section
        csvContent += "SUMMARY\n";
        csvContent += "Metric,Amount,Details\n";
        csvContent += `Total Expenses,₱${data.totals.expenses.toFixed(2)},${data.expenses.length} transactions\n`;
        csvContent += `Transport Cost,₱${data.totals.transportCost.toFixed(2)},${data.transportLogs.length} trips\n`;
        csvContent += `LRT Savings,₱${data.totals.transportSavings.toFixed(2)},From discounts\n\n`;
        
        // Category breakdown
        csvContent += "CATEGORY BREAKDOWN\n";
        csvContent += "Category,Amount,Percentage\n";
        Object.entries(data.byCategory).forEach(([category, amount]) => {
            const categoryInfo = getCategoryInfo(category);
            const percentage = (amount / data.totals.expenses) * 100;
            csvContent += `${categoryInfo.name},₱${amount.toFixed(2)},${percentage.toFixed(1)}%\n`;
        });
        csvContent += "\n";
        
        // Monthly breakdown
        csvContent += "MONTHLY BREAKDOWN\n";
        csvContent += "Month,Amount,Transactions\n";
        Object.entries(data.byMonth).forEach(([monthKey, monthData]) => {
            const [year, month] = monthKey.split('-');
            const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' });
            csvContent += `${monthName} ${year},₱${monthData.total.toFixed(2)},${monthData.expenses.length}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quarterly_report_${data.quarter}_${data.year}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Quarterly report exported as CSV!', 'success');
    }
    
    // Export quarter data as PDF (simulated)
    function exportQuarterPDF() {
        if (!currentQuarterData) {
            alert('Please load quarter data first');
            return;
        }
        
        alert('PDF export functionality would be implemented with a PDF library like jsPDF or html2pdf.js in a production environment.');
        showNotification('PDF export simulated - would use jsPDF library', 'info');
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
        init,
        loadQuarterData,
        printQuarterReport,
        exportQuarterCSV,
        exportQuarterPDF
    };
})();
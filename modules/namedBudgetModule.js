// modules/namedBudgetModule.js
const NamedBudgetModule = (function() {
    // Private variables
    let namedBudgets = [];
    let currentBudgetData = null;
    let archivedBudgets = [];
    
    // Initialize module
    function init() {
        loadNamedBudgets();
        loadArchivedBudgets();
        setupEventListeners();
        updateBudgetDropdown();
    }
    
    // Load named budgets from localStorage
    function loadNamedBudgets() {
        const storedBudgets = localStorage.getItem('namedBudgets');
        namedBudgets = storedBudgets ? JSON.parse(storedBudgets) : [];
        
        // Create default 1st Cut Off budget if none exists
        if (namedBudgets.length === 0) {
            const defaultBudget = {
                id: Date.now(),
                name: '1st Cut Off Budget',
                description: 'Budget for 1st cut off period',
                amount: 1500,
                startDate: '2025-12-05',
                endDate: '2025-12-15',
                duration: 10,
                type: 'cutoff',
                status: 'active',
                createdAt: new Date().toISOString(),
                expenses: [],
                transportLogs: [],
                timeLogs: []
            };
            namedBudgets.push(defaultBudget);
            saveNamedBudgets();
        }
    }
    
    // Load archived budgets from localStorage
    function loadArchivedBudgets() {
        const storedArchived = localStorage.getItem('archivedBudgets');
        archivedBudgets = storedArchived ? JSON.parse(storedArchived) : [];
    }
    
    // Save named budgets to localStorage
    function saveNamedBudgets() {
        localStorage.setItem('namedBudgets', JSON.stringify(namedBudgets));
    }
    
    // Save archived budgets to localStorage
    function saveArchivedBudgets() {
        localStorage.setItem('archivedBudgets', JSON.stringify(archivedBudgets));
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Create named budget button
        const createNamedBudgetBtn = document.getElementById('createNamedBudgetBtn');
        if (createNamedBudgetBtn) {
            createNamedBudgetBtn.addEventListener('click', openNamedBudgetModal);
        }
        
        // Named budget modal
        const closeNamedBudgetModal = document.getElementById('closeNamedBudgetModal');
        const cancelNamedBudgetBtn = document.getElementById('cancelNamedBudgetBtn');
        const namedBudgetForm = document.getElementById('namedBudgetForm');
        
        if (closeNamedBudgetModal) {
            closeNamedBudgetModal.addEventListener('click', closeNamedBudgetModalFunc);
        }
        
        if (cancelNamedBudgetBtn) {
            cancelNamedBudgetBtn.addEventListener('click', closeNamedBudgetModalFunc);
        }
        
        if (namedBudgetForm) {
            namedBudgetForm.addEventListener('submit', handleNamedBudgetSubmit);
        }
        
        // Calculate budget breakdown on input
        const namedBudgetAmount = document.getElementById('namedBudgetAmount');
        if (namedBudgetAmount) {
            namedBudgetAmount.addEventListener('input', calculateNamedBudgetBreakdown);
        }
        
        // Budget data loading
        const loadBudgetDataBtn = document.getElementById('loadBudgetDataBtn');
        if (loadBudgetDataBtn) {
            loadBudgetDataBtn.addEventListener('click', loadBudgetData);
        }
        
        // Report buttons
        const printBudgetReportBtn = document.getElementById('printBudgetReportBtn');
        if (printBudgetReportBtn) {
            printBudgetReportBtn.addEventListener('click', printBudgetReport);
        }
        
        const exportBudgetCSVBtn = document.getElementById('exportBudgetCSVBtn');
        if (exportBudgetCSVBtn) {
            exportBudgetCSVBtn.addEventListener('click', exportBudgetCSV);
        }
        
        const exportBudgetPDFBtn = document.getElementById('exportBudgetPDFBtn');
        if (exportBudgetPDFBtn) {
            exportBudgetPDFBtn.addEventListener('click', exportBudgetPDF);
        }
        
        // Archive button
        const archiveBudgetBtn = document.getElementById('archiveBudgetBtn');
        if (archiveBudgetBtn) {
            archiveBudgetBtn.addEventListener('click', archiveCurrentBudget);
        }
        
        // View archive button
        const viewArchiveBtn = document.getElementById('viewArchiveBtn');
        if (viewArchiveBtn) {
            viewArchiveBtn.addEventListener('click', viewBudgetArchive);
        }
        
        // Delete budget button
        const deleteBudgetBtn = document.getElementById('deleteBudgetBtn');
        if (deleteBudgetBtn) {
            deleteBudgetBtn.addEventListener('click', deleteCurrentBudget);
        }
        
        // Budget dropdown change
        const budgetSelect = document.getElementById('budgetSelect');
        if (budgetSelect) {
            budgetSelect.addEventListener('change', function() {
                if (this.value) {
                    loadBudgetDataById(this.value);
                }
            });
        }
        
        // Duration select change
        const budgetDuration = document.getElementById('budgetDuration');
        if (budgetDuration) {
            budgetDuration.addEventListener('change', calculateNamedBudgetBreakdown);
        }
        
        // Start date change
        const budgetStartDate = document.getElementById('namedBudgetStartDate');
        if (budgetStartDate) {
            budgetStartDate.addEventListener('change', function() {
                calculateEndDate();
                calculateNamedBudgetBreakdown();
            });
        }
        
        // Custom days input
        const customDaysInput = document.getElementById('customDays');
        if (customDaysInput) {
            customDaysInput.addEventListener('input', function() {
                calculateEndDate();
                calculateNamedBudgetBreakdown();
            });
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            const namedBudgetModal = document.getElementById('namedBudgetModal');
            if (event.target === namedBudgetModal) {
                closeNamedBudgetModalFunc();
            }
        });
    }
    
    // Update budget dropdown with available budgets
    function updateBudgetDropdown() {
        const budgetSelect = document.getElementById('budgetSelect');
        if (!budgetSelect) return;
        
        budgetSelect.innerHTML = '<option value="">Select a Budget</option>';
        
        namedBudgets.forEach(budget => {
            const option = document.createElement('option');
            option.value = budget.id;
            option.textContent = `${budget.name} (${formatDateRange(budget.startDate, budget.endDate)})`;
            budgetSelect.appendChild(option);
        });
    }
    
    // Format date range
    function formatDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return `${start.getDate()}/${start.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
    }
    
    // Open named budget modal
    function openNamedBudgetModal() {
        const namedBudgetModal = document.getElementById('namedBudgetModal');
        if (namedBudgetModal) {
            namedBudgetModal.classList.add('active');
            
            // Set default values
            document.getElementById('namedBudgetName').value = '';
            document.getElementById('budgetDescription').value = '';
            document.getElementById('budgetType').value = 'cutoff';
            document.getElementById('namedBudgetAmount').value = '';
            document.getElementById('namedBudgetStartDate').value = '2025-12-05';
            document.getElementById('namedBudgetEndDate').value = '2025-12-15';
            
            // Set duration to custom
            document.getElementById('budgetDuration').value = 'custom';
            document.getElementById('customDaysGroup').style.display = 'block';
            
            calculateNamedBudgetBreakdown();
        }
    }
    
    // Close named budget modal
    function closeNamedBudgetModalFunc() {
        const namedBudgetModal = document.getElementById('namedBudgetModal');
        if (namedBudgetModal) {
            namedBudgetModal.classList.remove('active');
            const namedBudgetForm = document.getElementById('namedBudgetForm');
            if (namedBudgetForm) namedBudgetForm.reset();
        }
    }
    
    // Calculate end date based on start date and duration
    function calculateEndDate() {
        const startDateInput = document.getElementById('namedBudgetStartDate');
        const endDateInput = document.getElementById('namedBudgetEndDate');
        const durationSelect = document.getElementById('budgetDuration');
        const customDaysInput = document.getElementById('customDays');
        
        if (!startDateInput || !endDateInput) return;
        
        const startDate = new Date(startDateInput.value);
        let days = 10; // Default for cut off
        
        if (durationSelect.value === 'custom') {
            days = parseInt(customDaysInput.value) || 10;
        } else {
            days = parseInt(durationSelect.value) || 10;
        }
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);
        
        // Format date as YYYY-MM-DD
        const endDateStr = endDate.toISOString().split('T')[0];
        endDateInput.value = endDateStr;
    }
    
    // Calculate named budget breakdown
    function calculateNamedBudgetBreakdown() {
        const amountInput = document.getElementById('namedBudgetAmount');
        const durationSelect = document.getElementById('budgetDuration');
        const customDaysInput = document.getElementById('customDays');
        
        if (!amountInput) return;
        
        const amount = parseFloat(amountInput.value) || 0;
        let days = 10;
        
        if (durationSelect.value === 'custom') {
            days = parseInt(customDaysInput.value) || 10;
        } else {
            days = parseInt(durationSelect.value) || 10;
        }
        
        const dailyBudget = amount / days;
        const weeklyBudget = dailyBudget * 7;
        const monthlyBudget = dailyBudget * 30;
        
        // Update displays
        const monthlyBudgetCalc = document.getElementById('monthlyBudgetCalc');
        const weeklyBudgetCalc = document.getElementById('weeklyBudgetCalc');
        const dailyBudgetCalc = document.getElementById('dailyBudgetCalc');
        
        if (monthlyBudgetCalc) monthlyBudgetCalc.textContent = `₱${monthlyBudget.toFixed(2)}`;
        if (weeklyBudgetCalc) weeklyBudgetCalc.textContent = `₱${weeklyBudget.toFixed(2)}`;
        if (dailyBudgetCalc) dailyBudgetCalc.textContent = `₱${dailyBudget.toFixed(2)}`;
    }
    
    // Handle named budget submission
    function handleNamedBudgetSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('namedBudgetName').value;
        const description = document.getElementById('budgetDescription').value;
        const type = document.getElementById('budgetType').value;
        const amount = parseFloat(document.getElementById('namedBudgetAmount').value);
        const startDate = document.getElementById('namedBudgetStartDate').value;
        const endDate = document.getElementById('namedBudgetEndDate').value;
        const durationSelect = document.getElementById('budgetDuration').value;
        const customDaysInput = document.getElementById('customDays');
        
        let duration = 10;
        if (durationSelect === 'custom') {
            duration = parseInt(customDaysInput.value) || 10;
        } else {
            duration = parseInt(durationSelect) || 10;
        }
        
        if (!name || !description || !amount || !startDate || !endDate) {
            alert('Please fill in all required fields');
            return;
        }
        
        const newBudget = {
            id: Date.now(),
            name,
            description,
            type,
            amount,
            startDate,
            endDate,
            duration,
            status: 'active',
            createdAt: new Date().toISOString(),
            expenses: [],
            transportLogs: [],
            timeLogs: []
        };
        
        namedBudgets.push(newBudget);
        saveNamedBudgets();
        updateBudgetDropdown();
        closeNamedBudgetModalFunc();
        
        showNotification(`"${name}" budget created successfully!`, 'success');
    }
    
    // Load budget data by ID
    function loadBudgetDataById(budgetId) {
        const budget = namedBudgets.find(b => b.id.toString() === budgetId.toString());
        if (!budget) {
            alert('Budget not found');
            return;
        }
        
        // Get expenses for this budget period
        let budgetExpenses = [];
        let budgetTransportLogs = [];
        let budgetTimeLogs = [];
        
        if (typeof ExpenseModule !== 'undefined') {
            const allExpenses = ExpenseModule.getAllExpenses();
            budgetExpenses = allExpenses.filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate >= new Date(budget.startDate) && expenseDate <= new Date(budget.endDate);
            });
        }
        
        if (typeof TransportModule !== 'undefined') {
            const allTransportLogs = TransportModule.getAllLogs();
            budgetTransportLogs = allTransportLogs.filter(log => {
                const logDate = new Date(log.date);
                return logDate >= new Date(budget.startDate) && logDate <= new Date(budget.endDate);
            });
        }
        
        if (typeof TimeLogModule !== 'undefined') {
            const allTimeLogs = TimeLogModule.getAllLogs();
            budgetTimeLogs = allTimeLogs.filter(log => {
                const logDate = new Date(log.date);
                return logDate >= new Date(budget.startDate) && logDate <= new Date(budget.endDate);
            });
        }
        
        // Calculate totals
        const totalExpenses = budgetExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalTransportCost = budgetTransportLogs.reduce((sum, log) => sum + log.cost, 0);
        const totalTransportSavings = budgetTransportLogs.reduce((sum, log) => sum + log.savings, 0);
        
        // Store current budget data
        currentBudgetData = {
            budget: budget,
            expenses: budgetExpenses,
            transportLogs: budgetTransportLogs,
            timeLogs: budgetTimeLogs,
            totals: {
                budget: budget.amount,
                expenses: totalExpenses,
                transportCost: totalTransportCost,
                transportSavings: totalTransportSavings,
                remaining: budget.amount - totalExpenses
            }
        };
        
        // Display budget data
        displayBudgetData();
    }
    
    // Load budget data (for button click)
    function loadBudgetData() {
        const budgetSelect = document.getElementById('budgetSelect');
        if (!budgetSelect || !budgetSelect.value) {
            alert('Please select a budget first');
            return;
        }
        
        loadBudgetDataById(budgetSelect.value);
    }
    
    // Display budget data
    function displayBudgetData() {
        if (!currentBudgetData) return;
        
        const data = currentBudgetData;
        const budget = data.budget;
        
        // Update budget summary
        const budgetSummary = document.getElementById('budgetSummary');
        if (budgetSummary) {
            const startDateStr = new Date(budget.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            const endDateStr = new Date(budget.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            budgetSummary.innerHTML = `
                <h3><i class="fas fa-chart-pie"></i> ${budget.name} - Summary</h3>
                <div class="summary-grid">
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-coins"></i>
                        </div>
                        <div class="summary-info">
                            <h4>Budget Amount</h4>
                            <div class="amount">₱${data.totals.budget.toFixed(2)}</div>
                            <small>${budget.type.toUpperCase()} Budget</small>
                        </div>
                    </div>
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
                            <i class="fas fa-piggy-bank"></i>
                        </div>
                        <div class="summary-info">
                            <h4>Remaining Budget</h4>
                            <div class="amount ${data.totals.remaining < 0 ? 'negative' : ''}">₱${data.totals.remaining.toFixed(2)}</div>
                            <small>${(data.totals.remaining / data.totals.budget * 100).toFixed(1)}% remaining</small>
                        </div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="summary-info">
                            <h4>Period</h4>
                            <div class="amount">${budget.duration} days</div>
                            <small>${startDateStr} to ${endDateStr}</small>
                        </div>
                    </div>
                </div>
                <div class="budget-description">
                    <p><strong>Description:</strong> ${budget.description}</p>
                </div>
            `;
        }
        
        // Update budget details
        const budgetDetails = document.getElementById('budgetDetails');
        if (budgetDetails) {
            // Group expenses by category
            const expensesByCategory = data.expenses.reduce((cats, exp) => {
                cats[exp.category] = (cats[exp.category] || 0) + exp.amount;
                return cats;
            }, {});
            
            // Group expenses by day
            const expensesByDay = data.expenses.reduce((days, exp) => {
                const date = exp.date;
                if (!days[date]) {
                    days[date] = {
                        total: 0,
                        expenses: []
                    };
                }
                days[date].total += exp.amount;
                days[date].expenses.push(exp);
                return days;
            }, {});
            
            budgetDetails.innerHTML = `
                <div class="details-grid">
                    <div class="details-section">
                        <h4><i class="fas fa-list"></i> Expenses by Category</h4>
                        <div class="category-breakdown">
                            ${Object.entries(expensesByCategory).map(([category, amount]) => {
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
                        <h4><i class="fas fa-train"></i> Transportation Summary</h4>
                        <div class="transport-summary">
                            <div class="transport-item">
                                <span>Total Trips:</span>
                                <strong>${data.transportLogs.length}</strong>
                            </div>
                            <div class="transport-item">
                                <span>Transport Cost:</span>
                                <strong>₱${data.totals.transportCost.toFixed(2)}</strong>
                            </div>
                            <div class="transport-item">
                                <span>Discount Savings:</span>
                                <strong class="savings">₱${data.totals.transportSavings.toFixed(2)}</strong>
                            </div>
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
                        ${data.expenses.length === 0 ? '<div class="empty-state small"><p>No expenses recorded for this period</p></div>' : ''}
                    </div>
                </div>
            `;
        }
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
    
    // Archive current budget
    function archiveCurrentBudget() {
        if (!currentBudgetData) {
            alert('Please load a budget first');
            return;
        }
        
        if (confirm(`Are you sure you want to archive "${currentBudgetData.budget.name}"?`)) {
            const budget = currentBudgetData.budget;
            
            // Mark budget as archived
            budget.status = 'archived';
            budget.archivedAt = new Date().toISOString();
            
            // Move to archived budgets
            archivedBudgets.push(budget);
            
            // Remove from active budgets
            namedBudgets = namedBudgets.filter(b => b.id !== budget.id);
            
            saveNamedBudgets();
            saveArchivedBudgets();
            updateBudgetDropdown();
            
            // Clear current view
            currentBudgetData = null;
            document.getElementById('budgetSummary').innerHTML = '';
            document.getElementById('budgetDetails').innerHTML = '';
            
            showNotification(`"${budget.name}" has been archived`, 'success');
        }
    }
    
    // View budget archive
    function viewBudgetArchive() {
        if (archivedBudgets.length === 0) {
            alert('No archived budgets found');
            return;
        }
        
        let archiveHTML = `
            <div class="modal active" id="archiveModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-archive"></i> Archived Budgets</h3>
                        <button class="close-btn" id="closeArchiveModal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="archive-list">
        `;
        
        archivedBudgets.forEach(budget => {
            const archivedDate = new Date(budget.archivedAt).toLocaleDateString();
            const startDate = new Date(budget.startDate).toLocaleDateString();
            const endDate = new Date(budget.endDate).toLocaleDateString();
            
            archiveHTML += `
                <div class="archive-item">
                    <div class="archive-header">
                        <h4>${budget.name}</h4>
                        <span class="archive-date">Archived: ${archivedDate}</span>
                    </div>
                    <div class="archive-details">
                        <p><strong>Description:</strong> ${budget.description}</p>
                        <p><strong>Amount:</strong> ₱${budget.amount.toFixed(2)}</p>
                        <p><strong>Period:</strong> ${startDate} to ${endDate} (${budget.duration} days)</p>
                        <p><strong>Type:</strong> ${budget.type.toUpperCase()}</p>
                    </div>
                </div>
            `;
        });
        
        archiveHTML += `
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = archiveHTML;
        document.body.appendChild(modalContainer);
        
        // Setup close button
        const closeBtn = document.getElementById('closeArchiveModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                document.getElementById('archiveModal').remove();
            });
        }
        
        // Close when clicking outside
        const archiveModal = document.getElementById('archiveModal');
        if (archiveModal) {
            archiveModal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.remove();
                }
            });
        }
    }
    
    // Delete current budget
    function deleteCurrentBudget() {
        if (!currentBudgetData) {
            alert('Please load a budget first');
            return;
        }
        
        const budget = currentBudgetData.budget;
        
        if (confirm(`Are you sure you want to delete "${budget.name}" permanently? This cannot be undone.`)) {
            // Remove from active budgets
            namedBudgets = namedBudgets.filter(b => b.id !== budget.id);
            
            saveNamedBudgets();
            updateBudgetDropdown();
            
            // Clear current view
            currentBudgetData = null;
            document.getElementById('budgetSummary').innerHTML = '';
            document.getElementById('budgetDetails').innerHTML = '';
            
            showNotification(`"${budget.name}" has been deleted`, 'success');
        }
    }
    
    // Print budget report
    function printBudgetReport() {
        if (!currentBudgetData) {
            alert('Please load budget data first');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        const data = currentBudgetData;
        const budget = data.budget;
        
        const startDateStr = new Date(budget.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const endDateStr = new Date(budget.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Budget Report - ${budget.name}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #4361ee; border-bottom: 2px solid #4361ee; padding-bottom: 10px; }
                    .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
                    .summary-item { padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
                    .category-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
                    .amount { font-weight: bold; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .date { color: #666; margin: 10px 0; }
                    .negative { color: #ef4444; }
                    .savings { color: #4ade80; }
                    @media print {
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Budget Tracker - ${budget.name}</h1>
                    <h2>${budget.description}</h2>
                    <div class="date">${startDateStr} to ${endDateStr}</div>
                </div>
                
                <div class="summary">
                    <div class="summary-item">
                        <h3>Budget Amount</h3>
                        <div class="amount">₱${data.totals.budget.toFixed(2)}</div>
                    </div>
                    <div class="summary-item">
                        <h3>Total Expenses</h3>
                        <div class="amount">₱${data.totals.expenses.toFixed(2)}</div>
                        <small>${data.expenses.length} transactions</small>
                    </div>
                    <div class="summary-item ${data.totals.remaining < 0 ? 'negative' : ''}">
                        <h3>${data.totals.remaining < 0 ? 'Overspent' : 'Remaining Budget'}</h3>
                        <div class="amount">₱${Math.abs(data.totals.remaining).toFixed(2)}</div>
                        <small>${(data.totals.remaining / data.totals.budget * 100).toFixed(1)}%</small>
                    </div>
                    <div class="summary-item">
                        <h3>Period</h3>
                        <div class="amount">${budget.duration} days</div>
                    </div>
                </div>
                
                <div class="no-print" style="margin-top: 30px; text-align: center;">
                    <button onclick="window.print()">Print Report</button>
                    <button onclick="window.close()">Close</button>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
    }
    
    // Export budget data as CSV
    function exportBudgetCSV() {
        if (!currentBudgetData) {
            alert('Please load budget data first');
            return;
        }
        
        const data = currentBudgetData;
        const budget = data.budget;
        
        let csvContent = "Budget Report\n";
        csvContent += `Budget Name: ${budget.name}\n`;
        csvContent += `Description: ${budget.description}\n`;
        csvContent += `Period: ${new Date(budget.startDate).toLocaleDateString()} to ${new Date(budget.endDate).toLocaleDateString()}\n\n`;
        
        // Summary section
        csvContent += "SUMMARY\n";
        csvContent += "Metric,Amount,Details\n";
        csvContent += `Budget Amount,₱${data.totals.budget.toFixed(2)},\n`;
        csvContent += `Total Expenses,₱${data.totals.expenses.toFixed(2)},${data.expenses.length} transactions\n`;
        csvContent += `Remaining Budget,₱${data.totals.remaining.toFixed(2)},${(data.totals.remaining / data.totals.budget * 100).toFixed(1)}%\n`;
        csvContent += `Transport Cost,₱${data.totals.transportCost.toFixed(2)},${data.transportLogs.length} trips\n`;
        csvContent += `Discount Savings,₱${data.totals.transportSavings.toFixed(2)},From discounts\n\n`;
        
        // Expense transactions
        csvContent += "EXPENSE TRANSACTIONS\n";
        csvContent += "Date,Category,Description,Amount\n";
        data.expenses.forEach(expense => {
            const categoryInfo = getCategoryInfo(expense.category);
            csvContent += `${expense.date},${categoryInfo.name},"${expense.description || ''}",₱${expense.amount.toFixed(2)}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `budget_report_${budget.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Budget report exported as CSV!', 'success');
    }
    
    // Export budget data as PDF (simulated)
    function exportBudgetPDF() {
        if (!currentBudgetData) {
            alert('Please load budget data first');
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
    
    // Get all named budgets
    function getAllNamedBudgets() {
        return namedBudgets;
    }
    
    // Get archived budgets
    function getArchivedBudgets() {
        return archivedBudgets;
    }
    
    // Public API
    return {
        init,
        loadBudgetDataById,
        printBudgetReport,
        exportBudgetCSV,
        exportBudgetPDF,
        archiveCurrentBudget,
        viewBudgetArchive,
        deleteCurrentBudget,
        getAllNamedBudgets,
        getArchivedBudgets
    };
})();
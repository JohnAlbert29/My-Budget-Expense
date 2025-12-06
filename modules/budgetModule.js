// modules/budgetModule.js
const BudgetModule = (function() {
    // Private variables
    let monthlyBudget = 1500;
    let chart = null;
    let budgetConfig = {
        description: 'December 2025 Budget',
        startDate: '2025-12-05',
        endDate: '2026-01-04',
        duration: 30,
        amount: 1500
    };
    
    // DOM Elements
    const monthlyBudgetElement = document.getElementById('monthlyBudget');
    const totalSpentElement = document.getElementById('totalSpent');
    const remainingBudgetElement = document.getElementById('remainingBudget');
    const discountSavingsElement = document.getElementById('discountSavings');
    const categoryList = document.getElementById('categoryList');
    const expenseChart = document.getElementById('expenseChart');
    const budgetDescriptionElement = document.getElementById('budgetDescription');
    const budgetPeriodElement = document.getElementById('budgetPeriod');
    const dailySpendingAvgElement = document.getElementById('dailySpendingAvg');
    const daysLeftElement = document.getElementById('daysLeft');
    const dailyBudgetElement = document.getElementById('dailyBudget');
    const dailyProgressBars = document.getElementById('dailyProgressBars');
    const budgetConfigModal = document.getElementById('budgetConfigModal');
    
    // Initialize module
    function init() {
        // Load budget from localStorage
        const storedBudget = localStorage.getItem('monthlyBudget');
        if (storedBudget) {
            monthlyBudget = parseFloat(storedBudget);
            if (monthlyBudgetElement) monthlyBudgetElement.textContent = monthlyBudget.toFixed(2);
        }
        
        // Load budget config
        const storedConfig = localStorage.getItem('budgetConfig');
        if (storedConfig) {
            budgetConfig = JSON.parse(storedConfig);
            monthlyBudget = budgetConfig.amount;
        }
        
        updateDashboard();
        setupEventListeners();
        calculateDailyProgress();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Budget editing
        const budgetConfigCard = document.getElementById('budgetConfigCard');
        if (budgetConfigCard) {
            budgetConfigCard.addEventListener('click', openBudgetConfigModal);
        }
        
        // Budget config modal
        const closeBudgetConfigModal = document.getElementById('closeBudgetConfigModal');
        const cancelBudgetConfigBtn = document.getElementById('cancelBudgetConfigBtn');
        const budgetConfigForm = document.getElementById('budgetConfigForm');
        const budgetDurationSelect = document.getElementById('budgetDuration');
        const budgetStartDateInput = document.getElementById('budgetStartDate');
        const budgetAmountInput = document.getElementById('budgetAmount');
        
        if (closeBudgetConfigModal) {
            closeBudgetConfigModal.addEventListener('click', closeBudgetConfigModalFunc);
        }
        
        if (cancelBudgetConfigBtn) {
            cancelBudgetConfigBtn.addEventListener('click', closeBudgetConfigModalFunc);
        }
        
        if (budgetConfigForm) {
            budgetConfigForm.addEventListener('submit', handleBudgetConfigSubmit);
        }
        
        if (budgetDurationSelect) {
            budgetDurationSelect.addEventListener('change', function() {
                const customDaysGroup = document.getElementById('customDaysGroup');
                if (this.value === 'custom') {
                    customDaysGroup.style.display = 'block';
                } else {
                    customDaysGroup.style.display = 'none';
                    calculateEndDate();
                }
            });
        }
        
        if (budgetStartDateInput) {
            budgetStartDateInput.addEventListener('change', calculateEndDate);
        }
        
        if (budgetAmountInput) {
            budgetAmountInput.addEventListener('input', calculateDailyWeeklyBudget);
        }
        
        // Custom days input
        const customDaysInput = document.getElementById('customDays');
        if (customDaysInput) {
            customDaysInput.addEventListener('input', calculateEndDate);
        }
        
        // Daily spending button
        const dailySpendingBtn = document.getElementById('dailySpendingBtn');
        if (dailySpendingBtn) {
            dailySpendingBtn.addEventListener('click', showDailySpending);
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === budgetConfigModal) {
                closeBudgetConfigModalFunc();
            }
        });
    }
    
    // Open budget config modal
    function openBudgetConfigModal() {
        if (budgetConfigModal) {
            budgetConfigModal.classList.add('active');
            
            // Fill form with current values
            document.getElementById('budgetDescription').value = budgetConfig.description;
            document.getElementById('budgetAmount').value = budgetConfig.amount;
            document.getElementById('budgetStartDate').value = budgetConfig.startDate;
            document.getElementById('budgetEndDate').value = budgetConfig.endDate;
            
            // Set duration
            const durationSelect = document.getElementById('budgetDuration');
            if (budgetConfig.duration === 7) durationSelect.value = '7';
            else if (budgetConfig.duration === 14) durationSelect.value = '14';
            else if (budgetConfig.duration === 30) durationSelect.value = '30';
            else if (budgetConfig.duration === 60) durationSelect.value = '60';
            else if (budgetConfig.duration === 90) durationSelect.value = '90';
            else {
                durationSelect.value = 'custom';
                document.getElementById('customDaysGroup').style.display = 'block';
                document.getElementById('customDays').value = budgetConfig.duration;
            }
            
            calculateDailyWeeklyBudget();
        }
    }
    
    // Close budget config modal
    function closeBudgetConfigModalFunc() {
        if (budgetConfigModal) {
            budgetConfigModal.classList.remove('active');
        }
    }
    
    // Calculate end date based on start date and duration
    function calculateEndDate() {
        const startDateInput = document.getElementById('budgetStartDate');
        const endDateInput = document.getElementById('budgetEndDate');
        const durationSelect = document.getElementById('budgetDuration');
        const customDaysInput = document.getElementById('customDays');
        
        if (!startDateInput || !endDateInput) return;
        
        const startDate = new Date(startDateInput.value);
        let days = 30; // Default
        
        if (durationSelect.value === 'custom') {
            days = parseInt(customDaysInput.value) || 30;
        } else {
            days = parseInt(durationSelect.value) || 30;
        }
        
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + days);
        
        // Format date as YYYY-MM-DD
        const endDateStr = endDate.toISOString().split('T')[0];
        endDateInput.value = endDateStr;
        
        calculateDailyWeeklyBudget();
    }
    
    // Calculate daily and weekly budget
    function calculateDailyWeeklyBudget() {
        const amountInput = document.getElementById('budgetAmount');
        const durationSelect = document.getElementById('budgetDuration');
        const customDaysInput = document.getElementById('customDays');
        
        if (!amountInput) return;
        
        const amount = parseFloat(amountInput.value) || 0;
        let days = 30;
        
        if (durationSelect.value === 'custom') {
            days = parseInt(customDaysInput.value) || 30;
        } else {
            days = parseInt(durationSelect.value) || 30;
        }
        
        const dailyBudget = amount / days;
        const weeklyBudget = dailyBudget * 7;
        
        const dailyBudgetCalc = document.getElementById('dailyBudgetCalc');
        const weeklyBudgetCalc = document.getElementById('weeklyBudgetCalc');
        
        if (dailyBudgetCalc) dailyBudgetCalc.textContent = `₱${dailyBudget.toFixed(2)}`;
        if (weeklyBudgetCalc) weeklyBudgetCalc.textContent = `₱${weeklyBudget.toFixed(2)}`;
    }
    
    // Handle budget config submission
    function handleBudgetConfigSubmit(e) {
        e.preventDefault();
        
        const description = document.getElementById('budgetDescription').value;
        const amount = parseFloat(document.getElementById('budgetAmount').value);
        const startDate = document.getElementById('budgetStartDate').value;
        const endDate = document.getElementById('budgetEndDate').value;
        const durationSelect = document.getElementById('budgetDuration').value;
        const customDaysInput = document.getElementById('customDays');
        
        let duration = 30;
        if (durationSelect === 'custom') {
            duration = parseInt(customDaysInput.value) || 30;
        } else {
            duration = parseInt(durationSelect) || 30;
        }
        
        // Update budget config
        budgetConfig = {
            description,
            amount,
            startDate,
            endDate,
            duration
        };
        
        // Save to localStorage
        localStorage.setItem('budgetConfig', JSON.stringify(budgetConfig));
        localStorage.setItem('monthlyBudget', amount.toString());
        
        monthlyBudget = amount;
        
        // Update UI
        updateDashboard();
        closeBudgetConfigModalFunc();
        
        // Show success message
        showNotification('Budget configuration saved!', 'success');
    }
    
    // Update dashboard with current data
    function updateDashboard() {
        // Get expenses
        let totalSpent = 0;
        let expensesByCategory = {};
        
        if (typeof ExpenseModule !== 'undefined') {
            totalSpent = ExpenseModule.getTotalSpent();
            
            // Calculate expenses by category
            const categories = ['transport', 'food', 'coffee', 'groceries', 'entertainment', 'other'];
            categories.forEach(category => {
                const categoryExpenses = ExpenseModule.getExpensesByCategory(category);
                const categoryTotal = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
                expensesByCategory[category] = categoryTotal;
            });
        }
        
        // Get discount savings
        let discountSavings = 0;
        if (typeof TransportModule !== 'undefined') {
            discountSavings = TransportModule.getTotalSavings();
        }
        
        // Calculate remaining budget
        const remainingBudget = monthlyBudget - totalSpent;
        
        // Calculate days left
        const today = new Date('2025-12-05');
        const endDate = new Date(budgetConfig.endDate);
        const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));
        
        // Calculate daily budget
        const dailyBudget = monthlyBudget / budgetConfig.duration;
        
        // Calculate average daily spending
        const startDate = new Date(budgetConfig.startDate);
        const daysPassed = Math.max(1, Math.ceil((today - startDate) / (1000 * 60 * 60 * 24)));
        const avgDailySpending = totalSpent / daysPassed;
        
        // Update UI
        if (monthlyBudgetElement) monthlyBudgetElement.textContent = monthlyBudget.toFixed(2);
        if (totalSpentElement) totalSpentElement.textContent = totalSpent.toFixed(2);
        if (remainingBudgetElement) remainingBudgetElement.textContent = Math.max(0, remainingBudget).toFixed(2);
        if (discountSavingsElement) discountSavingsElement.textContent = discountSavings.toFixed(2);
        
        // Update budget info
        if (budgetDescriptionElement) budgetDescriptionElement.textContent = budgetConfig.description;
        if (budgetPeriodElement) {
            const start = new Date(budgetConfig.startDate);
            const end = new Date(budgetConfig.endDate);
            const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            budgetPeriodElement.textContent = `${startStr} - ${endStr}`;
        }
        
        if (dailySpendingAvgElement) dailySpendingAvgElement.textContent = `Daily: ₱${avgDailySpending.toFixed(2)}`;
        if (daysLeftElement) daysLeftElement.textContent = `${daysLeft} days left`;
        if (dailyBudgetElement) dailyBudgetElement.textContent = `₱${dailyBudget.toFixed(2)}/day`;
        
        // Update category breakdown
        updateCategoryBreakdown(expensesByCategory);
        
        // Update chart
        updateChart(expensesByCategory);
        
        // Update remaining budget color if low
        if (remainingBudgetElement) {
            if (remainingBudget < monthlyBudget * 0.2) {
                remainingBudgetElement.parentElement.style.color = '#ef4444';
            } else if (remainingBudget < monthlyBudget * 0.5) {
                remainingBudgetElement.parentElement.style.color = '#f59e0b';
            } else {
                remainingBudgetElement.parentElement.style.color = '';
            }
        }
        
        // Check if budget term has ended
        checkBudgetTermEnd();
    }
    
    // Update category breakdown list
    function updateCategoryBreakdown(expensesByCategory) {
        if (!categoryList) return;
        
        // Clear list
        categoryList.innerHTML = '';
        
        // Category data
        const categories = [
            { id: 'transport', name: 'Transportation', color: '#4361ee' },
            { id: 'food', name: 'Food', color: '#f59e0b' },
            { id: 'coffee', name: 'Coffee', color: '#8b4513' },
            { id: 'groceries', name: 'Groceries', color: '#4ade80' },
            { id: 'entertainment', name: 'Entertainment', color: '#ec4899' },
            { id: 'other', name: 'Other', color: '#64748b' }
        ];
        
        // Add each category to the list
        categories.forEach(category => {
            const amount = expensesByCategory[category.id] || 0;
            if (amount > 0) {
                const categoryItem = document.createElement('div');
                categoryItem.className = 'category-item';
                categoryItem.innerHTML = `
                    <div class="category-info">
                        <div class="category-color" style="background-color: ${category.color}"></div>
                        <span class="category-name">${category.name}</span>
                    </div>
                    <div class="category-amount">₱${amount.toFixed(2)}</div>
                `;
                categoryList.appendChild(categoryItem);
            }
        });
        
        // If no expenses yet
        if (categoryList.children.length === 0) {
            categoryList.innerHTML = `
                <div class="empty-state small">
                    <p>No expenses recorded yet</p>
                </div>
            `;
        }
    }
    
    // Update chart
    function updateChart(expensesByCategory) {
        if (!expenseChart) return;
        
        const ctx = expenseChart.getContext('2d');
        
        // Destroy existing chart
        if (chart) {
            chart.destroy();
        }
        
        // Category data
        const categories = ['Transportation', 'Food', 'Coffee', 'Groceries', 'Entertainment', 'Other'];
        const colors = ['#4361ee', '#f59e0b', '#8b4513', '#4ade80', '#ec4899', '#64748b'];
        
        // Prepare data
        const data = [
            expensesByCategory.transport || 0,
            expensesByCategory.food || 0,
            expensesByCategory.coffee || 0,
            expensesByCategory.groceries || 0,
            expensesByCategory.entertainment || 0,
            expensesByCategory.other || 0
        ];
        
        // Filter out zero values for better visualization
        const filteredLabels = [];
        const filteredData = [];
        const filteredColors = [];
        
        data.forEach((value, index) => {
            if (value > 0) {
                filteredLabels.push(categories[index]);
                filteredData.push(value);
                filteredColors.push(colors[index]);
            }
        });
        
        // Create chart
        chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: filteredLabels,
                datasets: [{
                    data: filteredData,
                    backgroundColor: filteredColors,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += '₱' + context.parsed.toFixed(2);
                                return label;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    // Calculate daily progress
    function calculateDailyProgress() {
        if (!dailyProgressBars) return;
        
        // Clear existing bars
        dailyProgressBars.innerHTML = '';
        
        // Get expenses by day
        if (typeof ExpenseModule !== 'undefined') {
            const expenses = ExpenseModule.getAllExpenses();
            const dailyTotals = {};
            
            // Group expenses by day
            expenses.forEach(expense => {
                const date = expense.date;
                if (!dailyTotals[date]) {
                    dailyTotals[date] = 0;
                }
                dailyTotals[date] += expense.amount;
            });
            
            // Get sorted dates
            const dates = Object.keys(dailyTotals).sort();
            
            // Show last 7 days or all days if less than 7
            const displayDates = dates.slice(-7);
            
            // Calculate max spending for scaling
            const maxSpending = Math.max(...Object.values(dailyTotals), 1);
            
            // Create progress bars
            displayDates.forEach(date => {
                const spending = dailyTotals[date];
                const percentage = (spending / maxSpending) * 100;
                
                const barContainer = document.createElement('div');
                barContainer.className = 'daily-bar-container';
                
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                const dayNum = dateObj.getDate();
                
                barContainer.innerHTML = `
                    <div class="bar-info">
                        <div class="bar-date">${dayName} ${dayNum}</div>
                        <div class="bar-amount">₱${spending.toFixed(2)}</div>
                    </div>
                    <div class="bar-bg">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                `;
                
                dailyProgressBars.appendChild(barContainer);
            });
            
            // If no expenses
            if (displayDates.length === 0) {
                dailyProgressBars.innerHTML = `
                    <div class="empty-state small">
                        <p>No daily spending data yet</p>
                    </div>
                `;
            }
        }
    }
    
    // Show daily spending modal
    function showDailySpending() {
        const date = '2025-12-05'; // Current date
        const dailyData = getDailySpending(date);
        
        const dailyTotalDisplay = document.getElementById('dailyTotalDisplay');
        const dailyBreakdown = document.getElementById('dailyBreakdown');
        
        dailyTotalDisplay.innerHTML = `
            <h4>Total Spending on ${formatDate(date)}</h4>
            <div class="amount">₱${dailyData.total.toFixed(2)}</div>
            <p>${dailyData.expenses.length} expense${dailyData.expenses.length !== 1 ? 's' : ''}</p>
        `;
        
        dailyBreakdown.innerHTML = '';
        
        if (dailyData.expenses.length === 0) {
            dailyBreakdown.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-receipt"></i>
                    <p>No expenses recorded for this date</p>
                </div>
            `;
        } else {
            Object.entries(dailyData.byCategory).forEach(([category, amount]) => {
                const categoryInfo = getCategoryInfo(category);
                const div = document.createElement('div');
                div.className = 'daily-category';
                div.innerHTML = `
                    <div class="category-info">
                        <div class="category-color" style="background-color: ${categoryInfo.color}"></div>
                        <span>${categoryInfo.name}</span>
                    </div>
                    <div class="category-amount">₱${amount.toFixed(2)}</div>
                `;
                dailyBreakdown.appendChild(div);
            });
            
            // Also show individual expenses
            dailyData.expenses.forEach(expense => {
                const categoryInfo = getCategoryInfo(expense.category);
                const div = document.createElement('div');
                div.className = 'daily-expense-item';
                div.innerHTML = `
                    <div class="expense-detail">
                        <div class="expense-category-small" style="background-color: ${categoryInfo.color}"></div>
                        <span>${expense.description || 'No description'}</span>
                    </div>
                    <div class="expense-amount-small">₱${expense.amount.toFixed(2)}</div>
                `;
                dailyBreakdown.appendChild(div);
            });
        }
        
        // Show modal
        document.getElementById('dailySpendingModal').classList.add('active');
        
        // Setup close button
        const closeDailyModal = document.getElementById('closeDailyModal');
        if (closeDailyModal) {
            closeDailyModal.onclick = function() {
                document.getElementById('dailySpendingModal').classList.remove('active');
            };
        }
        
        // Setup date change
        const dailyDateInput = document.getElementById('dailyDate');
        if (dailyDateInput) {
            dailyDateInput.onchange = function() {
                showDailySpendingForDate(this.value);
            };
        }
    }
    
    // Show daily spending for specific date
    function showDailySpendingForDate(date) {
        const dailyData = getDailySpending(date);
        
        const dailyTotalDisplay = document.getElementById('dailyTotalDisplay');
        const dailyBreakdown = document.getElementById('dailyBreakdown');
        
        dailyTotalDisplay.innerHTML = `
            <h4>Total Spending on ${formatDate(date)}</h4>
            <div class="amount">₱${dailyData.total.toFixed(2)}</div>
            <p>${dailyData.expenses.length} expense${dailyData.expenses.length !== 1 ? 's' : ''}</p>
        `;
        
        dailyBreakdown.innerHTML = '';
        
        if (dailyData.expenses.length === 0) {
            dailyBreakdown.innerHTML = `
                <div class="empty-state small">
                    <i class="fas fa-receipt"></i>
                    <p>No expenses recorded for this date</p>
                </div>
            `;
        } else {
            Object.entries(dailyData.byCategory).forEach(([category, amount]) => {
                const categoryInfo = getCategoryInfo(category);
                const div = document.createElement('div');
                div.className = 'daily-category';
                div.innerHTML = `
                    <div class="category-info">
                        <div class="category-color" style="background-color: ${categoryInfo.color}"></div>
                        <span>${categoryInfo.name}</span>
                    </div>
                    <div class="category-amount">₱${amount.toFixed(2)}</div>
                `;
                dailyBreakdown.appendChild(div);
            });
            
            // Also show individual expenses
            dailyData.expenses.forEach(expense => {
                const categoryInfo = getCategoryInfo(expense.category);
                const div = document.createElement('div');
                div.className = 'daily-expense-item';
                div.innerHTML = `
                    <div class="expense-detail">
                        <div class="expense-category-small" style="background-color: ${categoryInfo.color}"></div>
                        <span>${expense.description || 'No description'}</span>
                    </div>
                    <div class="expense-amount-small">₱${expense.amount.toFixed(2)}</div>
                `;
                dailyBreakdown.appendChild(div);
            });
        }
    }
    
    // Get daily spending data
    function getDailySpending(date) {
        if (typeof ExpenseModule !== 'undefined' && ExpenseModule.getDailySpending) {
            return ExpenseModule.getDailySpending(date);
        }
        
        // Fallback if ExpenseModule doesn't have getDailySpending
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const expenses = ExpenseModule.getAllExpenses();
        const dailyExpenses = expenses.filter(expense => expense.date === dateStr);
        
        return {
            date: dateStr,
            total: dailyExpenses.reduce((sum, exp) => sum + exp.amount, 0),
            expenses: dailyExpenses,
            byCategory: dailyExpenses.reduce((cats, exp) => {
                cats[exp.category] = (cats[exp.category] || 0) + exp.amount;
                return cats;
            }, {})
        };
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
    
    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'long', 
            day: 'numeric' 
        });
    }
    
    // Check if budget term has ended
    function checkBudgetTermEnd() {
        const today = new Date('2025-12-05');
        const endDate = new Date(budgetConfig.endDate);
        
        // If today is after end date, show report
        if (today > endDate) {
            setTimeout(() => {
                if (confirm('Your budget term has ended! Would you like to see your spending report?')) {
                    generateEndTermReport();
                }
            }, 1000);
        }
    }
    
    // Generate end of term report
    function generateEndTermReport() {
        const startDate = new Date(budgetConfig.startDate);
        const endDate = new Date(budgetConfig.endDate);
        const totalBudget = budgetConfig.amount;
        
        // Get all expenses within the budget period
        const allExpenses = ExpenseModule.getAllExpenses();
        const periodExpenses = allExpenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });
        
        // Calculate totals
        const totalSpent = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalSaved = totalBudget - totalSpent;
        const savingsPercentage = (totalSaved / totalBudget) * 100;
        
        // Group by category
        const byCategory = periodExpenses.reduce((cats, exp) => {
            cats[exp.category] = (cats[exp.category] || 0) + exp.amount;
            return cats;
        }, {});
        
        // Group by day
        const byDay = periodExpenses.reduce((days, exp) => {
            if (!days[exp.date]) {
                days[exp.date] = {
                    total: 0,
                    expenses: []
                };
            }
            days[exp.date].total += exp.amount;
            days[exp.date].expenses.push(exp);
            return days;
        }, {});
        
        // Sort days
        const sortedDays = Object.keys(byDay).sort();
        
        // Generate report HTML
        let reportHTML = `
            <div class="report-header">
                <h4>${budgetConfig.description}</h4>
                <p>${formatDate(budgetConfig.startDate)} to ${formatDate(budgetConfig.endDate)}</p>
            </div>
            
            <div class="report-summary">
                <div class="summary-item">
                    <span>Budget Amount:</span>
                    <strong>₱${totalBudget.toFixed(2)}</strong>
                </div>
                <div class="summary-item">
                    <span>Total Spent:</span>
                    <strong>₱${totalSpent.toFixed(2)}</strong>
                </div>
                <div class="summary-item ${totalSaved >= 0 ? 'positive' : 'negative'}">
                    <span>${totalSaved >= 0 ? 'Money Saved:' : 'Overspent:'}</span>
                    <strong>₱${Math.abs(totalSaved).toFixed(2)}</strong>
                </div>
                <div class="summary-item">
                    <span>Savings Rate:</span>
                    <strong>${savingsPercentage.toFixed(1)}%</strong>
                </div>
            </div>
            
            <div class="report-section">
                <h5>Spending by Category</h5>
                <div class="category-breakdown">
        `;
        
        // Add category breakdown
        Object.entries(byCategory).forEach(([category, amount]) => {
            const categoryInfo = getCategoryInfo(category);
            const percentage = (amount / totalSpent) * 100;
            
            reportHTML += `
                <div class="category-report-item">
                    <div class="category-info">
                        <div class="category-color" style="background-color: ${categoryInfo.color}"></div>
                        <span>${categoryInfo.name}</span>
                    </div>
                    <div class="category-stats">
                        <span>₱${amount.toFixed(2)}</span>
                        <span class="percentage">${percentage.toFixed(1)}%</span>
                    </div>
                </div>
            `;
        });
        
        reportHTML += `
                </div>
            </div>
            
            <div class="report-section">
                <h5>Daily Spending Breakdown</h5>
                <div class="daily-breakdown-report">
        `;
        
        // Add daily breakdown
        sortedDays.forEach(date => {
            const dayData = byDay[date];
            reportHTML += `
                <div class="daily-report-item">
                    <div class="daily-header">
                        <strong>${formatDate(date)}</strong>
                        <span>₱${dayData.total.toFixed(2)}</span>
                    </div>
                    <div class="daily-expenses">
            `;
            
            dayData.expenses.forEach(expense => {
                const categoryInfo = getCategoryInfo(expense.category);
                reportHTML += `
                    <div class="expense-item-small">
                        <div class="expense-info">
                            <div class="expense-category-tiny" style="background-color: ${categoryInfo.color}"></div>
                            <span>${expense.description || 'No description'}</span>
                        </div>
                        <span class="expense-amount-tiny">₱${expense.amount.toFixed(2)}</span>
                    </div>
                `;
            });
            
            reportHTML += `
                    </div>
                </div>
            `;
        });
        
        reportHTML += `
                </div>
            </div>
            
            <div class="report-insights">
                <h5>Key Insights</h5>
                <ul>
                    <li>Average daily spending: ₱${(totalSpent / budgetConfig.duration).toFixed(2)}</li>
                    <li>Highest spending category: ${getHighestSpendingCategory(byCategory)}</li>
                    <li>Most expensive day: ${getMostExpensiveDay(byDay)}</li>
                    <li>Total LRT savings: ₱${TransportModule.getTotalSavings().toFixed(2)}</li>
                </ul>
            </div>
        `;
        
        // Display report in modal
        const reportContent = document.getElementById('endTermReportContent');
        if (reportContent) {
            reportContent.innerHTML = reportHTML;
            document.getElementById('endTermReportModal').classList.add('active');
            
            // Setup close button
            const closeEndTermModal = document.getElementById('closeEndTermModal');
            if (closeEndTermModal) {
                closeEndTermModal.onclick = function() {
                    document.getElementById('endTermReportModal').classList.remove('active');
                };
            }
            
            // Setup print button
            const printReportBtn = document.getElementById('printReportBtn');
            if (printReportBtn) {
                printReportBtn.onclick = function() {
                    printReport();
                };
            }
            
            // Setup export button
            const exportReportBtn = document.getElementById('exportReportBtn');
            if (exportReportBtn) {
                exportReportBtn.onclick = function() {
                    exportReportAsPDF();
                };
            }
        }
    }
    
    // Get highest spending category
    function getHighestSpendingCategory(byCategory) {
        if (Object.keys(byCategory).length === 0) return 'None';
        
        const highest = Object.entries(byCategory).reduce((max, [category, amount]) => {
            return amount > max.amount ? { category, amount } : max;
        }, { category: '', amount: 0 });
        
        const categoryInfo = getCategoryInfo(highest.category);
        return `${categoryInfo.name} (₱${highest.amount.toFixed(2)})`;
    }
    
    // Get most expensive day
    function getMostExpensiveDay(byDay) {
        if (Object.keys(byDay).length === 0) return 'None';
        
        const highest = Object.entries(byDay).reduce((max, [date, data]) => {
            return data.total > max.total ? { date, total: data.total } : max;
        }, { date: '', total: 0 });
        
        return `${formatDate(highest.date)} (₱${highest.total.toFixed(2)})`;
    }
    
    // Print report
    function printReport() {
        const printContent = document.getElementById('endTermReportContent').innerHTML;
        const originalContent = document.body.innerHTML;
        
        document.body.innerHTML = `
            <div style="padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="text-align: center; color: #4361ee;">Budget Tracker Report</h2>
                ${printContent}
            </div>
        `;
        
        window.print();
        document.body.innerHTML = originalContent;
        location.reload();
    }
    
    // Export report as PDF (simplified version)
    function exportReportAsPDF() {
        alert('PDF export would be implemented with a library like jsPDF or html2pdf.js in a production app.');
        // In a real app, you would use:
        // import jsPDF from 'jspdf';
        // import html2canvas from 'html2canvas';
        // Then convert the report content to PDF
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
    
    // Get monthly budget
    function getMonthlyBudget() {
        return monthlyBudget;
    }
    
    // Set monthly budget
    function setMonthlyBudget(newBudget) {
        monthlyBudget = newBudget;
        localStorage.setItem('monthlyBudget', monthlyBudget.toString());
        updateDashboard();
    }
    
    // Get budget config
    function getBudgetConfig() {
        return budgetConfig;
    }
    
    // Update daily progress when expenses change
    function onExpensesUpdated() {
        updateDashboard();
        calculateDailyProgress();
    }
    
    // Public API
    return {
        init,
        updateDashboard,
        getMonthlyBudget,
        setMonthlyBudget,
        getBudgetConfig,
        onExpensesUpdated,
        showDailySpending,
        generateEndTermReport
    };
})();
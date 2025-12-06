// modules/expenseModule.js
const ExpenseModule = (function() {
    // Private variables
    let expenses = [];
    
    // DOM Elements
    const expenseList = document.getElementById('expenseList');
    const addExpenseBtn = document.getElementById('addExpenseBtn');
    const addFirstExpenseBtn = document.getElementById('addFirstExpenseBtn');
    const expenseModal = document.getElementById('expenseModal');
    const closeExpenseModal = document.getElementById('closeExpenseModal');
    const cancelExpenseBtn = document.getElementById('cancelExpenseBtn');
    const expenseForm = document.getElementById('expenseForm');
    const expenseCategoryFilter = document.getElementById('expenseCategory');
    const expenseDateFilter = document.getElementById('expenseDate');
    
    // Initialize module
    function init() {
        loadExpenses();
        setupEventListeners();
    }
    
    // Load expenses from localStorage
    function loadExpenses() {
        const storedExpenses = localStorage.getItem('expenses');
        expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
        renderExpenses();
    }
    
    // Save expenses to localStorage
    function saveExpenses() {
        localStorage.setItem('expenses', JSON.stringify(expenses));
        // Update dashboard
        if (typeof BudgetModule !== 'undefined') BudgetModule.updateDashboard();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Add expense buttons
        if (addExpenseBtn) addExpenseBtn.addEventListener('click', openExpenseModal);
        if (addFirstExpenseBtn) addFirstExpenseBtn.addEventListener('click', openExpenseModal);
        
        // Modal controls
        if (closeExpenseModal) closeExpenseModal.addEventListener('click', closeModal);
        if (cancelExpenseBtn) cancelExpenseBtn.addEventListener('click', closeModal);
        
        // Expense form submission
        if (expenseForm) expenseForm.addEventListener('submit', handleExpenseSubmit);
        
        // Filter changes
        if (expenseCategoryFilter) expenseCategoryFilter.addEventListener('change', renderExpenses);
        if (expenseDateFilter) expenseDateFilter.addEventListener('change', renderExpenses);
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === expenseModal) {
                closeModal();
            }
        });
    }
    
    // Open expense modal
    function openExpenseModal() {
        if (expenseModal) {
            expenseModal.classList.add('active');
            // Set today's date as default
            document.getElementById('expenseDateInput').value = '2025-12-05';
        }
    }
    
    // Close modal
    function closeModal() {
        if (expenseModal) {
            expenseModal.classList.remove('active');
            expenseForm.reset();
        }
    }
    
    // Handle expense form submission
    function handleExpenseSubmit(e) {
        e.preventDefault();
        
        const category = document.getElementById('newExpenseCategory').value;
        const amount = parseFloat(document.getElementById('expenseAmount').value);
        const description = document.getElementById('expenseDescription').value;
        const date = document.getElementById('expenseDateInput').value;
        
        if (!category || !amount || !date) {
            alert('Please fill in all required fields');
            return;
        }
        
        const newExpense = {
            id: Date.now(),
            category,
            amount,
            description,
            date
        };
        
        expenses.push(newExpense);
        saveExpenses();
        renderExpenses();
        closeModal();
        
        // Show success message
        showNotification('Expense added successfully!', 'success');
    }
    
    // Render expenses to the list
    function renderExpenses() {
        if (!expenseList) return;
        
        const categoryFilter = expenseCategoryFilter ? expenseCategoryFilter.value : 'all';
        const dateFilter = expenseDateFilter ? expenseDateFilter.value : '';
        
        // Filter expenses
        let filteredExpenses = [...expenses];
        
        if (categoryFilter !== 'all') {
            filteredExpenses = filteredExpenses.filter(expense => expense.category === categoryFilter);
        }
        
        if (dateFilter) {
            filteredExpenses = filteredExpenses.filter(expense => expense.date === dateFilter);
        }
        
        // Clear list
        expenseList.innerHTML = '';
        
        // Check if there are expenses
        if (filteredExpenses.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-receipt"></i>
                <p>No expenses found for the selected filters</p>
                <button class="btn-primary" id="addFirstExpenseBtn2">Add New Expense</button>
            `;
            expenseList.appendChild(emptyState);
            
            // Add event listener to the new button
            document.getElementById('addFirstExpenseBtn2').addEventListener('click', openExpenseModal);
            return;
        }
        
        // Sort by date (newest first)
        filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add each expense to the list
        filteredExpenses.forEach(expense => {
            const expenseItem = createExpenseElement(expense);
            expenseList.appendChild(expenseItem);
        });
    }
    
    // Create expense element
    function createExpenseElement(expense) {
        const div = document.createElement('div');
        div.className = 'expense-item';
        
        // Get category info
        const categoryInfo = getCategoryInfo(expense.category);
        
        // Format date
        const dateObj = new Date(expense.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        div.innerHTML = `
            <div class="expense-category">
                <div class="category-icon" style="background-color: ${categoryInfo.color}">
                    <i class="${categoryInfo.icon}"></i>
                </div>
                <div class="expense-details">
                    <h4>${categoryInfo.name}</h4>
                    <p>${expense.description || 'No description'}</p>
                </div>
            </div>
            <div class="expense-info">
                <div class="expense-amount">₱${expense.amount.toFixed(2)}</div>
                <div class="expense-date">${formattedDate}</div>
                <div class="expense-actions">
                    <button class="btn-icon" onclick="ExpenseModule.editExpense(${expense.id})" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="ExpenseModule.deleteExpense(${expense.id})" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        return div;
    }
    
    // Get category information
    function getCategoryInfo(category) {
        const categories = {
            transport: { name: 'Transportation', icon: 'fas fa-train', color: '#4361ee' },
            food: { name: 'Food', icon: 'fas fa-utensils', color: '#f59e0b' },
            coffee: { name: 'Coffee', icon: 'fas fa-coffee', color: '#8b4513' },
            groceries: { name: 'Groceries', icon: 'fas fa-shopping-basket', color: '#4ade80' },
            entertainment: { name: 'Entertainment', icon: 'fas fa-film', color: '#ec4899' },
            other: { name: 'Other', icon: 'fas fa-wallet', color: '#64748b' }
        };
        
        return categories[category] || categories.other;
    }
    
    // Get all expenses
    function getAllExpenses() {
        return expenses;
    }
    
    // Get expenses by category
    function getExpensesByCategory(category) {
        return expenses.filter(expense => expense.category === category);
    }
    
    // Get total spent
    function getTotalSpent() {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    }
    
    // Get expenses by month
    function getExpensesByMonth(year, month) {
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getFullYear() === year && expenseDate.getMonth() === month;
        });
    }
    
    // Edit expense
    function editExpense(expenseId) {
        const expense = expenses.find(e => e.id === expenseId);
        if (!expense) return;
        
        // Open modal with existing data
        openExpenseModal();
        
        // Pre-fill form
        setTimeout(() => {
            document.getElementById('newExpenseCategory').value = expense.category;
            document.getElementById('expenseAmount').value = expense.amount;
            document.getElementById('expenseDescription').value = expense.description || '';
            document.getElementById('expenseDateInput').value = expense.date;
            
            // Change form submission to edit mode
            const form = document.getElementById('expenseForm');
            form.onsubmit = function(e) {
                e.preventDefault();
                
                expense.category = document.getElementById('newExpenseCategory').value;
                expense.amount = parseFloat(document.getElementById('expenseAmount').value);
                expense.description = document.getElementById('expenseDescription').value;
                expense.date = document.getElementById('expenseDateInput').value;
                
                saveExpenses();
                renderExpenses();
                closeModal();
                
                showNotification('Expense updated!', 'success');
                
                // Reset form handler
                form.onsubmit = handleExpenseSubmit;
            };
        }, 100);
    }
    
    // Delete expense
    function deleteExpense(expenseId) {
        if (confirm('Are you sure you want to delete this expense?')) {
            expenses = expenses.filter(e => e.id !== expenseId);
            saveExpenses();
            renderExpenses();
            showNotification('Expense deleted', 'success');
        }
    }
    
    // Get expenses by date range
    function getExpensesByDateRange(startDate, endDate) {
        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= startDate && expenseDate <= endDate;
        });
    }
    
    // Get total spent by date range
    function getTotalSpentByDateRange(startDate, endDate) {
        const filteredExpenses = getExpensesByDateRange(startDate, endDate);
        return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
    }
    
    // Get daily spending
    function getDailySpending(date) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
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
    
    // Get daily products (expenses by day)
    function getDailyProducts() {
        const dailyProducts = {};
        
        expenses.forEach(expense => {
            const date = expense.date;
            if (!dailyProducts[date]) {
                dailyProducts[date] = {
                    total: 0,
                    items: []
                };
            }
            dailyProducts[date].total += expense.amount;
            dailyProducts[date].items.push({
                category: expense.category,
                description: expense.description || 'No description',
                amount: expense.amount,
                time: expense.time || 'N/A'
            });
        });
        
        return dailyProducts;
    }
    
    // Get spending summary for a period
    function getSpendingSummary(startDate, endDate) {
        const periodExpenses = getExpensesByDateRange(startDate, endDate);
        const totalSpent = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        
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
                    count: 0
                };
            }
            days[exp.date].total += exp.amount;
            days[exp.date].count += 1;
            return days;
        }, {});
        
        return {
            totalSpent,
            averageDaily: totalSpent / Object.keys(byDay).length || 0,
            byCategory,
            byDay,
            expenseCount: periodExpenses.length,
            periodStart: startDate,
            periodEnd: endDate
        };
    }
    
    // Get top spending categories
    function getTopCategories(limit = 3) {
        const categoryTotals = {};
        
        expenses.forEach(expense => {
            categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
        });
        
        // Convert to array and sort
        const sortedCategories = Object.entries(categoryTotals)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: (amount / getTotalSpent()) * 100
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, limit);
        
        return sortedCategories;
    }
    
    // Get recurring expenses (same category, similar amount)
    function getRecurringExpenses() {
        const recurring = {};
        
        // Group by category and description
        expenses.forEach(expense => {
            const key = `${expense.category}-${expense.description}`;
            if (!recurring[key]) {
                recurring[key] = {
                    category: expense.category,
                    description: expense.description,
                    count: 0,
                    total: 0,
                    average: 0,
                    dates: []
                };
            }
            
            recurring[key].count += 1;
            recurring[key].total += expense.amount;
            recurring[key].average = recurring[key].total / recurring[key].count;
            recurring[key].dates.push(expense.date);
        });
        
        // Filter for expenses that appear multiple times
        const filteredRecurring = Object.values(recurring).filter(item => item.count > 1);
        
        return filteredRecurring.sort((a, b) => b.count - a.count);
    }
    
    // Export expenses to CSV
    function exportToCSV() {
        if (expenses.length === 0) {
            alert('No expenses to export');
            return;
        }
        
        // Create CSV content
        let csvContent = "Date,Category,Description,Amount\n";
        
        expenses.forEach(expense => {
            const date = new Date(expense.date).toLocaleDateString('en-US');
            const category = getCategoryInfo(expense.category).name;
            const description = expense.description ? `"${expense.description}"` : '';
            const amount = expense.amount.toFixed(2);
            
            csvContent += `${date},${category},${description},${amount}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Expenses exported to CSV!', 'success');
    }
    
    // Clear all expenses
    function clearAllExpenses() {
        if (confirm('Are you sure you want to delete ALL expenses? This cannot be undone.')) {
            expenses = [];
            saveExpenses();
            renderExpenses();
            showNotification('All expenses cleared', 'success');
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
        init,
        loadExpenses,
        saveExpenses,
        getAllExpenses,
        getExpensesByCategory,
        getTotalSpent,
        getExpensesByMonth,
        editExpense,
        deleteExpense,
        getExpensesByDateRange,
        getTotalSpentByDateRange,
        getDailySpending,
        getDailyProducts,
        getSpendingSummary,
        getTopCategories,
        getRecurringExpenses,
        exportToCSV,
        clearAllExpenses
    };
})();
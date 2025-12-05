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
            document.getElementById('expenseDateInput').value = new Date().toISOString().split('T')[0];
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
        getAllExpenses,
        getExpensesByCategory,
        getTotalSpent,
        getExpensesByMonth
    };
})();
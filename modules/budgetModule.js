// modules/budgetModule.js
const BudgetModule = (function() {
    // Private variables
    let monthlyBudget = 1500;
    let chart = null;
    
    // DOM Elements
    const monthlyBudgetElement = document.getElementById('monthlyBudget');
    const totalSpentElement = document.getElementById('totalSpent');
    const remainingBudgetElement = document.getElementById('remainingBudget');
    const discountSavingsElement = document.getElementById('discountSavings');
    const categoryList = document.getElementById('categoryList');
    const expenseChart = document.getElementById('expenseChart');
    
    // Initialize module
    function init() {
        // Load budget from localStorage
        const storedBudget = localStorage.getItem('monthlyBudget');
        if (storedBudget) {
            monthlyBudget = parseFloat(storedBudget);
            if (monthlyBudgetElement) monthlyBudgetElement.textContent = monthlyBudget.toFixed(2);
        }
        
        updateDashboard();
        setupEventListeners();
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Budget editing (in a real app, you'd have a way to edit the budget)
        if (monthlyBudgetElement) {
            monthlyBudgetElement.addEventListener('click', function() {
                const newBudget = prompt('Enter new monthly budget:', monthlyBudget);
                if (newBudget && !isNaN(newBudget) && parseFloat(newBudget) > 0) {
                    monthlyBudget = parseFloat(newBudget);
                    localStorage.setItem('monthlyBudget', monthlyBudget.toString());
                    this.textContent = monthlyBudget.toFixed(2);
                    updateDashboard();
                    showNotification('Monthly budget updated!', 'success');
                }
            });
        }
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
        
        // Update UI
        if (totalSpentElement) totalSpentElement.textContent = totalSpent.toFixed(2);
        if (remainingBudgetElement) remainingBudgetElement.textContent = Math.max(0, remainingBudget).toFixed(2);
        if (discountSavingsElement) discountSavingsElement.textContent = discountSavings.toFixed(2);
        
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
        updateDashboard,
        getMonthlyBudget,
        setMonthlyBudget
    };
})();
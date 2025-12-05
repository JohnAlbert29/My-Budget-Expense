// modules/transportModule.js
const TransportModule = (function() {
    // Private variables
    let transportLogs = [];
    
    // LRT station data with distances (for fare calculation)
    const lrtStations = [
        { name: 'Baclaran', position: 0 },
        { name: 'EDSA', position: 1 },
        { name: 'Libertad', position: 2 },
        { name: 'Gil Puyat', position: 3 },
        { name: 'Vito Cruz', position: 4 },
        { name: 'Quirino', position: 5 },
        { name: 'Pedro Gil', position: 6 },
        { name: 'United Nations', position: 7 },
        { name: 'Central Terminal', position: 8 },
        { name: 'Carriedo', position: 9 },
        { name: 'Doroteo Jose', position: 10 },
        { name: 'Bambang', position: 11 },
        { name: 'Tayuman', position: 12 },
        { name: 'Blumentritt', position: 13 },
        { name: 'Abad Santos', position: 14 },
        { name: 'R. Papa', position: 15 },
        { name: '5th Avenue', position: 16 },
        { name: 'Monumento', position: 17 },
        { name: 'Balintawak', position: 18 },
        { name: 'Roosevelt', position: 19 }
    ];
    
    // Updated LRT 1 fare calculation (accurate as of 2025)
    // Base fare without discount: ₱16.25 (₱15.00 base fare + ₱1.25 RFID fee)
    // Additional fare per station: ₱1.47
    // 50% discount for students/seniors/PWDs
    const baseFare = 16.25; // Minimum fare including RFID fee
    const farePerStation = 1.47; // Additional fare per station
    
    // DOM Elements
    const stationFrom = document.getElementById('stationFrom');
    const stationTo = document.getElementById('stationTo');
    const tripCount = document.getElementById('tripCount');
    const tripCost = document.getElementById('tripCost');
    const tripSavings = document.getElementById('tripSavings');
    const saveTripBtn = document.getElementById('saveTripBtn');
    const addTransportBtn = document.getElementById('addTransportBtn');
    const transportLog = document.getElementById('transportLog');
    
    // Initialize module
    function init() {
        loadTransportLogs();
        setupEventListeners();
        calculateTripCost(); // Initial calculation
    }
    
    // Load transport logs from localStorage
    function loadTransportLogs() {
        const storedLogs = localStorage.getItem('transportLogs');
        transportLogs = storedLogs ? JSON.parse(storedLogs) : [];
        renderTransportLogs();
    }
    
    // Save transport logs to localStorage
    function saveTransportLogs() {
        localStorage.setItem('transportLogs', JSON.stringify(transportLogs));
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Calculate trip cost when inputs change
        if (stationFrom) stationFrom.addEventListener('change', calculateTripCost);
        if (stationTo) stationTo.addEventListener('change', calculateTripCost);
        if (tripCount) tripCount.addEventListener('input', calculateTripCost);
        
        // Save trip button
        if (saveTripBtn) saveTripBtn.addEventListener('click', saveTrip);
        
        // Add transport button
        if (addTransportBtn) addTransportBtn.addEventListener('click', function() {
            // Scroll to calculator
            document.getElementById('tripCalculator').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Calculate trip cost
    function calculateTripCost() {
        if (!stationFrom || !stationTo || !tripCount) return;
        
        const fromStation = stationFrom.value;
        const toStation = stationTo.value;
        const trips = parseInt(tripCount.value) || 1;
        
        // Get station positions
        const fromPos = lrtStations.find(station => station.name === fromStation)?.position || 0;
        const toPos = lrtStations.find(station => station.name === toStation)?.position || 0;
        
        // Calculate stations traveled
        const stationsTraveled = Math.abs(toPos - fromPos);
        
        // Calculate fare (with 50% discount applied)
        let fare = baseFare + (stationsTraveled * farePerStation);
        let discountedFare = fare * 0.5; // 50% discount
        
        // Calculate total for all trips
        let totalCost = discountedFare * trips;
        let totalSavings = (fare * trips) - totalCost;
        
        // Update display
        if (tripCost) tripCost.textContent = `₱${totalCost.toFixed(2)}`;
        if (tripSavings) tripSavings.textContent = `₱${totalSavings.toFixed(2)}`;
        
        return {
            from: fromStation,
            to: toStation,
            stations: stationsTraveled,
            fare: fare,
            discountedFare: discountedFare,
            trips: trips,
            totalCost: totalCost,
            totalSavings: totalSavings
        };
    }
    
    // Save trip to log
    function saveTrip() {
        const tripData = calculateTripCost();
        
        if (!tripData) return;
        
        const newLog = {
            id: Date.now(),
            from: tripData.from,
            to: tripData.to,
            stations: tripData.stations,
            trips: tripData.trips,
            cost: tripData.totalCost,
            savings: tripData.totalSavings,
            date: '2025-12-05' // Always use December 5, 2025
        };
        
        transportLogs.push(newLog);
        saveTransportLogs();
        renderTransportLogs();
        
        // Also add as expense
        if (typeof ExpenseModule !== 'undefined') {
            // We need to access the expense module's internal function
            // For simplicity, we'll just add directly to localStorage
            const storedExpenses = localStorage.getItem('expenses');
            const expenses = storedExpenses ? JSON.parse(storedExpenses) : [];
            
            expenses.push({
                id: Date.now() + 1,
                category: 'transport',
                amount: tripData.totalCost,
                description: `LRT: ${tripData.from} to ${tripData.to} (${tripData.trips} trips)`,
                date: '2025-12-05'
            });
            
            localStorage.setItem('expenses', JSON.stringify(expenses));
            
            // Refresh expenses if module is loaded
            ExpenseModule.loadExpenses();
        }
        
        // Show success message
        showNotification('Trip saved successfully!', 'success');
    }
    
    // Render transport logs
    function renderTransportLogs() {
        if (!transportLog) return;
        
        // Clear log
        transportLog.innerHTML = '';
        
        // Check if there are logs
        if (transportLogs.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-train"></i>
                <p>No trips recorded yet</p>
                <p class="small">Add a trip using the calculator above</p>
            `;
            transportLog.appendChild(emptyState);
            return;
        }
        
        // Sort by date (newest first)
        const sortedLogs = [...transportLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Show only last 5 logs
        const recentLogs = sortedLogs.slice(0, 5);
        
        // Add each log to the list
        recentLogs.forEach(log => {
            const logItem = createLogElement(log);
            transportLog.appendChild(logItem);
        });
        
        // Show "view all" if there are more logs
        if (transportLogs.length > 5) {
            const viewAll = document.createElement('div');
            viewAll.className = 'view-all';
            viewAll.innerHTML = `<a href="#" id="viewAllLogs">View all ${transportLogs.length} trips</a>`;
            transportLog.appendChild(viewAll);
            
            document.getElementById('viewAllLogs').addEventListener('click', function(e) {
                e.preventDefault();
                // In a full app, this would show all logs in a separate view
                alert(`You have ${transportLogs.length} trip records. This would open a full log view in a complete app.`);
            });
        }
    }
    
    // Create log element
    function createLogElement(log) {
        const div = document.createElement('div');
        div.className = 'log-item';
        
        // Format date
        const dateObj = new Date(log.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        div.innerHTML = `
            <div>
                <div class="log-route">${log.from} → ${log.to}</div>
                <div class="log-details">${log.trips} trip(s) • ${log.stations} stations</div>
            </div>
            <div class="log-info">
                <div class="log-cost">₱${log.cost.toFixed(2)}</div>
                <div class="log-savings">Save: ₱${log.savings.toFixed(2)}</div>
                <div class="log-date">${formattedDate}</div>
            </div>
        `;
        
        return div;
    }
    
    // Get total discount savings
    function getTotalSavings() {
        return transportLogs.reduce((total, log) => total + log.savings, 0);
    }
    
    // Get transport logs by month
    function getLogsByMonth(year, month) {
        return transportLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate.getFullYear() === year && logDate.getMonth() === month;
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
        loadTransportLogs,
        getTotalSavings,
        getLogsByMonth
    };
})();
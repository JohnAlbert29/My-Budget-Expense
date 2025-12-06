// modules/transportModule.js
const TransportModule = (function() {
    // Private variables
    let transportLogs = [];
    let currentDiscount = 50; // 50% discount by default
    
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
    
    // LRT 1 fare calculation (2025 pricing)
    // Special route: 5th Avenue to Gil Puyat (3 stations)
    // Regular fare: ₱32, Discounted fare (50% off): ₱16
    // Base fare: ₱26 + ₱2 per station
    const baseFare = 26.00; // Minimum regular fare
    const farePerStation = 2.00; // Additional fare per station
    
    // DOM Elements
    const stationFrom = document.getElementById('stationFrom');
    const stationTo = document.getElementById('stationTo');
    const tripCount = document.getElementById('tripCount');
    const tripDate = document.getElementById('tripDate');
    const tripCost = document.getElementById('tripCost');
    const tripSavings = document.getElementById('tripSavings');
    const saveTripBtn = document.getElementById('saveTripBtn');
    const addTransportBtn = document.getElementById('addTransportBtn');
    const transportLog = document.getElementById('transportLog');
    const discountToggle = document.getElementById('discountToggle');
    const discountPercentage = document.getElementById('discountPercentage');
    const applyDiscountBtn = document.getElementById('applyDiscountBtn');
    const editTripBtn = document.getElementById('editTripBtn');
    const tripDateFilter = document.getElementById('tripDateFilter');
    const exportTripsBtn = document.getElementById('exportTripsBtn');
    const clearTripsBtn = document.getElementById('clearTripsBtn');
    
    // Initialize module
    function init() {
        loadTransportLogs();
        setupEventListeners();
        calculateTripCost(); // Initial calculation
        updateFareTable(); // Update fare display
        setupDatePicker(); // Setup date picker
    }
    
    // Setup date picker
    function setupDatePicker() {
        // Set default date to today (December 5, 2025)
        const today = '2025-12-05';
        
        // Set trip date
        if (tripDate) {
            tripDate.value = today;
            tripDate.min = '2025-12-01';
            tripDate.max = '2025-12-31';
        }
        
        // Set date filter to empty by default
        if (tripDateFilter) {
            tripDateFilter.value = '';
            tripDateFilter.min = '2025-12-01';
            tripDateFilter.max = '2025-12-31';
        }
    }
    
    // Load transport logs from localStorage
    function loadTransportLogs() {
        const storedLogs = localStorage.getItem('transportLogs');
        transportLogs = storedLogs ? JSON.parse(storedLogs) : [];
        
        const storedDiscount = localStorage.getItem('lrtDiscount');
        if (storedDiscount) {
            currentDiscount = parseInt(storedDiscount);
        }
        
        renderTransportLogs();
    }
    
    // Save transport logs to localStorage
    function saveTransportLogs() {
        localStorage.setItem('transportLogs', JSON.stringify(transportLogs));
        localStorage.setItem('lrtDiscount', currentDiscount.toString());
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Calculate trip cost when inputs change
        if (stationFrom) stationFrom.addEventListener('change', calculateTripCost);
        if (stationTo) stationTo.addEventListener('change', calculateTripCost);
        if (tripCount) tripCount.addEventListener('input', calculateTripCost);
        if (tripDate) tripDate.addEventListener('change', calculateTripCost);
        
        // Discount controls
        if (discountToggle) {
            discountToggle.addEventListener('change', function() {
                if (this.checked) {
                    currentDiscount = 50;
                    discountPercentage.value = currentDiscount;
                } else {
                    currentDiscount = 0;
                    discountPercentage.value = currentDiscount;
                }
                calculateTripCost();
                updateFareTable();
            });
        }
        
        if (applyDiscountBtn) {
            applyDiscountBtn.addEventListener('click', function() {
                const discount = parseInt(discountPercentage.value) || 0;
                if (discount >= 0 && discount <= 100) {
                    currentDiscount = discount;
                    discountToggle.checked = discount > 0;
                    calculateTripCost();
                    updateFareTable();
                    showNotification(`Discount set to ${discount}%`, 'success');
                } else {
                    alert('Please enter a valid discount percentage (0-100)');
                }
            });
        }
        
        if (discountPercentage) {
            discountPercentage.addEventListener('input', function() {
                const discount = parseInt(this.value) || 0;
                if (discount >= 0 && discount <= 100) {
                    discountToggle.checked = discount > 0;
                }
            });
        }
        
        // Save trip button
        if (saveTripBtn) saveTripBtn.addEventListener('click', saveTrip);
        
        // Add transport button
        if (addTransportBtn) addTransportBtn.addEventListener('click', function() {
            // Scroll to calculator
            document.getElementById('tripCalculator').scrollIntoView({ behavior: 'smooth' });
        });
        
        // Edit trip functionality
        if (editTripBtn) editTripBtn.addEventListener('click', editSelectedTrip);
        
        // Date filter
        if (tripDateFilter) {
            tripDateFilter.addEventListener('change', renderTransportLogs);
        }
        
        // Export trips button
        if (exportTripsBtn) {
            exportTripsBtn.addEventListener('click', exportTripsToCSV);
        }
        
        // Clear trips button
        if (clearTripsBtn) {
            clearTripsBtn.addEventListener('click', clearAllTrips);
        }
    }
    
    // Calculate trip cost
    function calculateTripCost() {
        if (!stationFrom || !stationTo || !tripCount || !tripDate) return;
        
        const fromStation = stationFrom.value;
        const toStation = stationTo.value;
        const trips = parseInt(tripCount.value) || 1;
        const discount = currentDiscount;
        const selectedDate = tripDate.value;
        
        // Get station positions
        const fromPos = lrtStations.find(station => station.name === fromStation)?.position || 0;
        const toPos = lrtStations.find(station => station.name === toStation)?.position || 0;
        
        // Calculate stations traveled
        const stationsTraveled = Math.abs(toPos - fromPos);
        
        // Special case: 5th Avenue to Gil Puyat (3 stations) = ₱32 regular, ₱16 discounted
        let fare = calculateFare(fromStation, toStation, stationsTraveled);
        let discountedFare = fare * (1 - discount / 100);
        
        // Calculate total for all trips
        let totalCost = discountedFare * trips;
        let totalSavings = (fare * trips) - totalCost;
        
        // Update display
        if (tripCost) tripCost.textContent = `₱${totalCost.toFixed(2)}`;
        if (tripSavings) tripSavings.textContent = `₱${totalSavings.toFixed(2)}`;
        
        // Update discount display
        if (discountPercentage) discountPercentage.value = discount;
        if (discountToggle) discountToggle.checked = discount > 0;
        
        // Update current discount display
        const currentDiscountElement = document.getElementById('currentDiscount');
        if (currentDiscountElement) currentDiscountElement.textContent = discount;
        
        return {
            date: selectedDate,
            from: fromStation,
            to: toStation,
            stations: stationsTraveled,
            fare: fare,
            discountedFare: discountedFare,
            trips: trips,
            discount: discount,
            totalCost: totalCost,
            totalSavings: totalSavings
        };
    }
    
    // Calculate fare based on stations
    function calculateFare(fromStation, toStation, stationsTraveled) {
        // Special case: 5th Avenue to Gil Puyat (3 stations) = ₱32
        if ((fromStation === '5th Avenue' && toStation === 'Gil Puyat') ||
            (fromStation === 'Gil Puyat' && toStation === '5th Avenue')) {
            return 32.00;
        }
        
        // Calculate regular fare: base fare + (stations * fare per station)
        return baseFare + (stationsTraveled * farePerStation);
    }
    
    // Update fare table with current discount
    function updateFareTable() {
        // Calculate 5th Avenue to Gil Puyat (3 stations)
        const fare1 = 32.00; // Fixed price
        const discountedFare1 = fare1 * (1 - currentDiscount / 100);
        
        // Calculate average trip (5 stations)
        const stations2 = 5;
        const fare2 = baseFare + (stations2 * farePerStation);
        const discountedFare2 = fare2 * (1 - currentDiscount / 100);
        
        // Calculate Baclaran to Roosevelt (19 stations)
        const stations3 = 19;
        const fare3 = baseFare + (stations3 * farePerStation);
        const discountedFare3 = fare3 * (1 - currentDiscount / 100);
        
        // Update the display
        document.getElementById('fullFare1').textContent = fare1.toFixed(2);
        document.getElementById('discountedFare1').textContent = discountedFare1.toFixed(2);
        
        document.getElementById('fullFare2').textContent = fare2.toFixed(2);
        document.getElementById('discountedFare2').textContent = discountedFare2.toFixed(2);
        
        document.getElementById('fullFare3').textContent = fare3.toFixed(2);
        document.getElementById('discountedFare3').textContent = discountedFare3.toFixed(2);
        
        // Update discount info
        const discountInfo = document.querySelectorAll('.discount-info');
        discountInfo.forEach(el => {
            el.textContent = `with ${currentDiscount}% discount`;
        });
    }
    
    // Save trip to log
    function saveTrip() {
        const tripData = calculateTripCost();
        
        if (!tripData) return;
        
        const newLog = {
            id: Date.now(),
            date: tripData.date,
            from: tripData.from,
            to: tripData.to,
            stations: tripData.stations,
            trips: tripData.trips,
            fare: tripData.fare,
            discountedFare: tripData.discountedFare,
            discount: tripData.discount,
            cost: tripData.totalCost,
            savings: tripData.totalSavings,
            timestamp: new Date().toISOString()
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
                description: `LRT: ${tripData.from} to ${tripData.to} (${tripData.trips} trips, ${tripData.discount}% discount)`,
                date: tripData.date,
                timestamp: new Date().toISOString()
            });
            
            localStorage.setItem('expenses', JSON.stringify(expenses));
            
            // Refresh expenses if module is loaded
            if (ExpenseModule.loadExpenses) {
                ExpenseModule.loadExpenses();
            }
        }
        
        // Show success message
        showNotification(`Trip saved for ${formatDate(tripData.date)}! ${tripData.discount > 0 ? `Saved ₱${tripData.totalSavings.toFixed(2)} with ${tripData.discount}% discount` : 'No discount applied'}`, 'success');
        
        // Reset form
        resetTripForm();
    }
    
    // Reset trip form
    function resetTripForm() {
        if (tripDate) tripDate.value = '2025-12-05';
        if (tripCount) tripCount.value = 2;
        if (saveTripBtn) {
            saveTripBtn.textContent = 'Save Trip to Log';
            saveTripBtn.onclick = saveTrip;
        }
    }
    
    // Render transport logs
    function renderTransportLogs() {
        if (!transportLog) return;
        
        const dateFilter = tripDateFilter ? tripDateFilter.value : '';
        
        // Filter logs
        let filteredLogs = [...transportLogs];
        
        if (dateFilter) {
            filteredLogs = filteredLogs.filter(log => log.date === dateFilter);
        }
        
        // Clear log
        transportLog.innerHTML = '';
        
        // Check if there are logs
        if (filteredLogs.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-train"></i>
                <p>No trips ${dateFilter ? 'for selected date' : 'recorded yet'}</p>
                ${dateFilter ? `
                    <p class="small">No trips recorded on ${formatDate(dateFilter)}</p>
                    <button class="btn-primary" onclick="document.getElementById('tripDateFilter').value=''; TransportModule.renderTransportLogs()">
                        Clear Filter
                    </button>
                ` : `
                    <p class="small">Add a trip using the calculator above</p>
                `}
            `;
            transportLog.appendChild(emptyState);
            return;
        }
        
        // Sort by date (newest first)
        const sortedLogs = [...filteredLogs].sort((a, b) => {
            const dateCompare = new Date(b.date) - new Date(a.date);
            if (dateCompare !== 0) return dateCompare;
            return b.id - a.id;
        });
        
        // Show all filtered logs
        sortedLogs.forEach(log => {
            const logItem = createLogElement(log);
            transportLog.appendChild(logItem);
        });
        
        // Show date filter info if filtered
        if (dateFilter) {
            const filterInfo = document.createElement('div');
            filterInfo.className = 'filter-info';
            filterInfo.innerHTML = `
                <span>Showing ${filteredLogs.length} trip${filteredLogs.length !== 1 ? 's' : ''} for ${formatDate(dateFilter)}</span>
                <button class="btn-small" onclick="document.getElementById('tripDateFilter').value=''; TransportModule.renderTransportLogs()">
                    Clear Filter
                </button>
            `;
            transportLog.appendChild(filterInfo);
        }
        
        // Add summary if showing all logs
        if (!dateFilter && transportLogs.length > 0) {
            const summary = document.createElement('div');
            summary.className = 'log-summary';
            
            const totalTrips = transportLogs.reduce((sum, log) => sum + log.trips, 0);
            const totalCost = transportLogs.reduce((sum, log) => sum + log.cost, 0);
            const totalSavings = transportLogs.reduce((sum, log) => sum + log.savings, 0);
            
            summary.innerHTML = `
                <div class="summary-item">
                    <span>Total Trips:</span>
                    <strong>${totalTrips}</strong>
                </div>
                <div class="summary-item">
                    <span>Total Cost:</span>
                    <strong>₱${totalCost.toFixed(2)}</strong>
                </div>
                <div class="summary-item">
                    <span>Total Savings:</span>
                    <strong class="savings">₱${totalSavings.toFixed(2)}</strong>
                </div>
            `;
            
            transportLog.appendChild(summary);
        }
    }
    
    // Create log element
    function createLogElement(log) {
        const div = document.createElement('div');
        div.className = 'log-item';
        div.dataset.id = log.id;
        
        // Format date
        const formattedDate = formatDate(log.date);
        const dateTime = new Date(log.date + 'T12:00:00');
        const dayName = dateTime.toLocaleDateString('en-US', { weekday: 'short' });
        
        div.innerHTML = `
            <div>
                <div class="log-date-badge">${dayName}</div>
                <div class="log-route">${log.from} → ${log.to}</div>
                <div class="log-details">${log.trips} trip(s) • ${log.stations} stations</div>
                <div class="log-discount">${log.discount}% discount applied</div>
                <div class="log-full-date">${formattedDate}</div>
            </div>
            <div class="log-info">
                <div class="log-cost">₱${log.cost.toFixed(2)}</div>
                <div class="log-savings ${log.discount > 0 ? 'has-savings' : 'no-savings'}">
                    ${log.discount > 0 ? `Save: ₱${log.savings.toFixed(2)}` : 'Regular fare'}
                </div>
                <div class="log-actions">
                    <button class="btn-icon small edit-trip" data-id="${log.id}" title="Edit Trip">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon small delete-trip" data-id="${log.id}" title="Delete Trip">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners for edit/delete buttons
        const editBtn = div.querySelector('.edit-trip');
        const deleteBtn = div.querySelector('.delete-trip');
        
        if (editBtn) {
            editBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                editTrip(log.id);
            });
        }
        
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteTrip(log.id);
            });
        }
        
        // Make entire log item clickable for selection
        div.addEventListener('click', function() {
            selectTrip(log.id);
        });
        
        return div;
    }
    
    // Edit a trip
    function editTrip(tripId) {
        const trip = transportLogs.find(t => t.id === tripId);
        if (!trip) return;
        
        // Fill calculator with trip data
        if (stationFrom) stationFrom.value = trip.from;
        if (stationTo) stationTo.value = trip.to;
        if (tripCount) tripCount.value = trip.trips;
        if (tripDate) tripDate.value = trip.date;
        if (discountPercentage) discountPercentage.value = trip.discount;
        if (discountToggle) discountToggle.checked = trip.discount > 0;
        
        currentDiscount = trip.discount;
        
        // Update calculation
        calculateTripCost();
        
        // Scroll to calculator
        document.getElementById('tripCalculator').scrollIntoView({ behavior: 'smooth' });
        
        // Show edit mode
        saveTripBtn.textContent = 'Update Trip';
        saveTripBtn.onclick = function() {
            updateTrip(tripId);
        };
        
        showNotification(`Editing trip from ${trip.from} to ${trip.to} on ${formatDate(trip.date)}`, 'info');
    }
    
    // Update an existing trip
    function updateTrip(tripId) {
        const tripData = calculateTripCost();
        if (!tripData) return;
        
        const index = transportLogs.findIndex(t => t.id === tripId);
        if (index === -1) return;
        
        // Update the trip
        transportLogs[index] = {
            id: tripId,
            date: tripData.date,
            from: tripData.from,
            to: tripData.to,
            stations: tripData.stations,
            trips: tripData.trips,
            fare: tripData.fare,
            discountedFare: tripData.discountedFare,
            discount: tripData.discount,
            cost: tripData.totalCost,
            savings: tripData.totalSavings,
            timestamp: new Date().toISOString()
        };
        
        saveTransportLogs();
        renderTransportLogs();
        
        // Reset button
        saveTripBtn.textContent = 'Save Trip to Log';
        saveTripBtn.onclick = saveTrip;
        
        showNotification('Trip updated successfully!', 'success');
    }
    
    // Delete a trip
    function deleteTrip(tripId) {
        if (confirm('Are you sure you want to delete this trip?')) {
            transportLogs = transportLogs.filter(t => t.id !== tripId);
            saveTransportLogs();
            renderTransportLogs();
            showNotification('Trip deleted', 'success');
        }
    }
    
    // Select a trip for editing
    function selectTrip(tripId) {
        // Remove selection from all trips
        document.querySelectorAll('.log-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Add selection to clicked trip
        const selectedTrip = document.querySelector(`.log-item[data-id="${tripId}"]`);
        if (selectedTrip) {
            selectedTrip.classList.add('selected');
        }
    }
    
    // Edit selected trip
    function editSelectedTrip() {
        const selectedTrip = document.querySelector('.log-item.selected');
        if (!selectedTrip) {
            showNotification('Please select a trip to edit', 'error');
            return;
        }
        
        const tripId = parseInt(selectedTrip.dataset.id);
        editTrip(tripId);
    }
    
    // Get logs by date range
    function getLogsByDateRange(startDate, endDate) {
        return transportLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= startDate && logDate <= endDate;
        });
    }
    
    // Get logs by specific date
    function getLogsByDate(date) {
        return transportLogs.filter(log => log.date === date);
    }
    
    // Get total discount savings
    function getTotalSavings() {
        return transportLogs.reduce((total, log) => total + log.savings, 0);
    }
    
    // Get total cost
    function getTotalCost() {
        return transportLogs.reduce((total, log) => total + log.cost, 0);
    }
    
    // Get total trips count
    function getTotalTrips() {
        return transportLogs.reduce((total, log) => total + log.trips, 0);
    }
    
    // Get current discount
    function getCurrentDiscount() {
        return currentDiscount;
    }
    
    // Set discount
    function setDiscount(discount) {
        if (discount >= 0 && discount <= 100) {
            currentDiscount = discount;
            calculateTripCost();
            updateFareTable();
            return true;
        }
        return false;
    }
    
    // Export trips to CSV
    function exportTripsToCSV() {
        if (transportLogs.length === 0) {
            alert('No trips to export');
            return;
        }
        
        // Create CSV content
        let csvContent = "Date,Day,From Station,To Station,Stations Traveled,Trips,Regular Fare,Discount %,Discounted Fare,Total Cost,Savings\n";
        
        transportLogs.forEach(log => {
            const date = new Date(log.date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            csvContent += `${log.date},${dayName},${log.from},${log.to},${log.stations},${log.trips},₱${log.fare.toFixed(2)},${log.discount}%,₱${log.discountedFare.toFixed(2)},₱${log.cost.toFixed(2)},₱${log.savings.toFixed(2)}\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lrt_trips_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Trips exported to CSV!', 'success');
    }
    
    // Clear all trips
    function clearAllTrips() {
        if (confirm('Are you sure you want to delete ALL trips? This cannot be undone.')) {
            transportLogs = [];
            saveTransportLogs();
            renderTransportLogs();
            showNotification('All trips cleared', 'success');
        }
    }
    
    // Get daily spending for a specific date
    function getDailySpending(date) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        const dailyTrips = transportLogs.filter(log => log.date === dateStr);
        
        const totalCost = dailyTrips.reduce((sum, log) => sum + log.cost, 0);
        const totalSavings = dailyTrips.reduce((sum, log) => sum + log.savings, 0);
        
        return {
            date: dateStr,
            trips: dailyTrips,
            totalCost: totalCost,
            totalSavings: totalSavings,
            tripCount: dailyTrips.length
        };
    }
    
    // Get monthly summary
    function getMonthlySummary(year, month) {
        const monthlyTrips = transportLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate.getFullYear() === year && logDate.getMonth() === month;
        });
        
        const totalCost = monthlyTrips.reduce((sum, log) => sum + log.cost, 0);
        const totalSavings = monthlyTrips.reduce((sum, log) => sum + log.savings, 0);
        const totalTrips = monthlyTrips.reduce((sum, log) => sum + log.trips, 0);
        
        // Group by day
        const byDay = monthlyTrips.reduce((days, log) => {
            if (!days[log.date]) {
                days[log.date] = {
                    totalCost: 0,
                    totalSavings: 0,
                    trips: 0,
                    logs: []
                };
            }
            days[log.date].totalCost += log.cost;
            days[log.date].totalSavings += log.savings;
            days[log.date].trips += log.trips;
            days[log.date].logs.push(log);
            return days;
        }, {});
        
        return {
            year: year,
            month: month,
            totalCost: totalCost,
            totalSavings: totalSavings,
            totalTrips: totalTrips,
            tripCount: monthlyTrips.length,
            byDay: byDay
        };
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
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
        getTotalCost,
        getTotalTrips,
        getLogsByDateRange,
        getLogsByDate,
        getLogsByMonth: function(year, month) {
            return transportLogs.filter(log => {
                const logDate = new Date(log.date);
                return logDate.getFullYear() === year && logDate.getMonth() === month;
            });
        },
        getDailySpending,
        getMonthlySummary,
        getCurrentDiscount,
        setDiscount,
        exportTripsToCSV,
        clearAllTrips,
        renderTransportLogs,
        getTransportLogs: function() {
            return transportLogs;
        }
    };
})();
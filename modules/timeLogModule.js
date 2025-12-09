// modules/timeLogModule.js
const TimeLogModule = (function() {
    // Private variables
    let timeLogs = [];
    let selectedLogForEdit = null;
    
    // DOM Elements
    const timeInBtn = document.getElementById('timeInBtn');
    const timeOutBtn = document.getElementById('timeOutBtn');
    const todayTimeIn = document.getElementById('todayTimeIn');
    const todayTimeOut = document.getElementById('todayTimeOut');
    const todayTotalHours = document.getElementById('todayTotalHours');
    const logDate = document.getElementById('logDate');
    const timeLogList = document.getElementById('timeLogList');
    const exportLogBtn = document.getElementById('exportLogBtn');
    
    // Initialize module
    function init() {
        loadTimeLogs();
        setupEventListeners();
        updateTodayLog();
    }
    
    // Load time logs from localStorage
    function loadTimeLogs() {
        const storedLogs = localStorage.getItem('timeLogs');
        timeLogs = storedLogs ? JSON.parse(storedLogs) : [];
        renderTimeLogs();
    }
    
    // Save time logs to localStorage
    function saveTimeLogs() {
        localStorage.setItem('timeLogs', JSON.stringify(timeLogs));
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Time in/out buttons
        if (timeInBtn) timeInBtn.addEventListener('click', recordTimeIn);
        if (timeOutBtn) timeOutBtn.addEventListener('click', recordTimeOut);
        
        // Date filter
        if (logDate) logDate.addEventListener('change', renderTimeLogs);
        
        // Export button
        if (exportLogBtn) exportLogBtn.addEventListener('click', exportLogs);
    }
    
    // Record time in with current time
    function recordTimeIn() {
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0].substring(0, 5);
        const dateString = now.toISOString().split('T')[0];
        
        // Check if log for today already exists
        const existingLogIndex = timeLogs.findIndex(log => log.date === dateString);
        
        if (existingLogIndex >= 0) {
            // Check if time in already exists for today
            if (timeLogs[existingLogIndex].timeIn) {
                if (!confirm('You already have a Time In for today. Do you want to update it?')) {
                    return;
                }
            }
            // Update existing log
            timeLogs[existingLogIndex].timeIn = timeString;
            timeLogs[existingLogIndex].duration = calculateDuration(timeString, timeLogs[existingLogIndex].timeOut);
        } else {
            // Create new log
            const newLog = {
                id: Date.now(),
                date: dateString,
                timeIn: timeString,
                timeOut: '',
                duration: ''
            };
            timeLogs.unshift(newLog);
        }
        
        saveTimeLogs();
        updateTodayLog();
        renderTimeLogs();
        
        showNotification(`Time in recorded: ${timeString}`, 'success');
    }
    
    // Record time out with current time
    function recordTimeOut() {
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0].substring(0, 5);
        const dateString = now.toISOString().split('T')[0];
        
        // Check if log for today exists
        const existingLogIndex = timeLogs.findIndex(log => log.date === dateString);
        
        if (existingLogIndex >= 0 && timeLogs[existingLogIndex].timeIn) {
            // Update existing log
            timeLogs[existingLogIndex].timeOut = timeString;
            timeLogs[existingLogIndex].duration = calculateDuration(timeLogs[existingLogIndex].timeIn, timeString);
        } else {
            // Create new log with only time out (unusual but possible)
            const newLog = {
                id: Date.now(),
                date: dateString,
                timeIn: '',
                timeOut: timeString,
                duration: ''
            };
            timeLogs.unshift(newLog);
        }
        
        saveTimeLogs();
        updateTodayLog();
        renderTimeLogs();
        
        showNotification(`Time out recorded: ${timeString}`, 'success');
    }
    
    // Calculate duration between two times
    function calculateDuration(timeIn, timeOut) {
        if (!timeIn || !timeOut) return '';
        
        const [inHours, inMinutes] = timeIn.split(':').map(Number);
        const [outHours, outMinutes] = timeOut.split(':').map(Number);
        
        let totalMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
        
        // Handle overnight shifts
        if (totalMinutes < 0) {
            totalMinutes += 24 * 60;
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours}h ${minutes}m`;
    }
    
    // Update today's log display
    function updateTodayLog() {
        const today = new Date().toISOString().split('T')[0];
        const todayLog = timeLogs.find(log => log.date === today);
        
        if (todayTimeIn) todayTimeIn.textContent = todayLog?.timeIn || '--:--';
        if (todayTimeOut) todayTimeOut.textContent = todayLog?.timeOut || '--:--';
        if (todayTotalHours) todayTotalHours.textContent = todayLog?.duration || '0h 0m';
    }
    
    // Render time logs
    function renderTimeLogs() {
        if (!timeLogList) return;
        
        const dateFilter = logDate ? logDate.value : '';
        
        // Filter logs
        let filteredLogs = [...timeLogs];
        
        if (dateFilter) {
            filteredLogs = filteredLogs.filter(log => log.date === dateFilter);
        }
        
        // Clear list
        timeLogList.innerHTML = '';
        
        // Check if there are logs
        if (filteredLogs.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <i class="fas fa-clock"></i>
                <p>No time logs found for the selected date</p>
            `;
            timeLogList.appendChild(emptyState);
            return;
        }
        
        // Sort by date (newest first)
        filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add each log to the list
        filteredLogs.forEach(log => {
            const logItem = createTimeLogElement(log);
            timeLogList.appendChild(logItem);
        });
    }
    
    // Create time log element with edit functionality
    function createTimeLogElement(log) {
        const div = document.createElement('div');
        div.className = 'time-log-item';
        div.dataset.id = log.id;
        
        // Format date
        const dateObj = new Date(log.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        div.innerHTML = `
            <div class="log-date">${formattedDate}</div>
            <div class="log-times">
                <div class="log-time">
                    <span class="time-label">In:</span>
                    <strong class="time-in-display">${log.timeIn || '--:--'}</strong>
                    <button class="btn-icon-small edit-time-btn" data-field="timeIn" title="Edit Time In">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
                <div class="log-time">
                    <span class="time-label">Out:</span>
                    <strong class="time-out-display">${log.timeOut || '--:--'}</strong>
                    <button class="btn-icon-small edit-time-btn" data-field="timeOut" title="Edit Time Out">
                        <i class="fas fa-edit"></i>
                    </button>
                </div>
            </div>
            <div class="log-duration">
                <span class="duration-label">Total:</span>
                <span class="duration-value">${log.duration || '--'}</span>
                <button class="btn-icon-small delete-log-btn" title="Delete Log">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners for edit buttons
        const editButtons = div.querySelectorAll('.edit-time-btn');
        editButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const field = this.getAttribute('data-field');
                editTimeEntry(log.id, field, log[field] || '');
            });
        });
        
        // Add event listener for delete button
        const deleteBtn = div.querySelector('.delete-log-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                deleteTimeLog(log.id);
            });
        }
        
        return div;
    }
    
    // Edit time entry with confirmation
    function editTimeEntry(logId, field, currentValue) {
        selectedLogForEdit = timeLogs.find(log => log.id === logId);
        if (!selectedLogForEdit) return;
        
        const reason = prompt(`Enter reason for editing ${field} (from ${currentValue || 'empty'}):`);
        if (reason === null) return; // User cancelled
        
        const newTime = prompt(`Enter new ${field} (HH:MM format):`, currentValue || '');
        if (newTime === null) return; // User cancelled
        
        // Validate time format
        if (newTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(newTime)) {
            alert('Please enter time in HH:MM format (00:00 to 23:59)');
            return;
        }
        
        // Update the time
        selectedLogForEdit[field] = newTime || '';
        
        // Recalculate duration
        if (selectedLogForEdit.timeIn && selectedLogForEdit.timeOut) {
            selectedLogForEdit.duration = calculateDuration(selectedLogForEdit.timeIn, selectedLogForEdit.timeOut);
        } else {
            selectedLogForEdit.duration = '';
        }
        
        // Log the edit with reason
        if (!selectedLogForEdit.editHistory) {
            selectedLogForEdit.editHistory = [];
        }
        selectedLogForEdit.editHistory.push({
            timestamp: new Date().toISOString(),
            field: field,
            oldValue: currentValue,
            newValue: newTime,
            reason: reason
        });
        
        saveTimeLogs();
        renderTimeLogs();
        updateTodayLog();
        
        showNotification(`${field} updated successfully`, 'success');
    }
    
    // Delete time log with confirmation
    function deleteTimeLog(logId) {
        const logToDelete = timeLogs.find(log => log.id === logId);
        if (!logToDelete) return;
        
        const reason = prompt('Enter reason for deleting this time log:');
        if (reason === null) return; // User cancelled
        
        if (!confirm('Are you sure you want to delete this time log?')) {
            return;
        }
        
        // Log the deletion with reason
        if (!logToDelete.editHistory) {
            logToDelete.editHistory = [];
        }
        logToDelete.editHistory.push({
            timestamp: new Date().toISOString(),
            action: 'deleted',
            reason: reason
        });
        
        // Actually remove from array
        timeLogs = timeLogs.filter(log => log.id !== logId);
        
        saveTimeLogs();
        renderTimeLogs();
        updateTodayLog();
        
        showNotification('Time log deleted', 'success');
    }
    
    // Export logs
    function exportLogs() {
        // Create CSV content
        let csvContent = "Date,Time In,Time Out,Duration,Edit History\n";
        
        timeLogs.forEach(log => {
            const editHistory = log.editHistory ? 
                JSON.stringify(log.editHistory).replace(/"/g, '""') : 
                '';
            csvContent += `${log.date},"${log.timeIn || ''}","${log.timeOut || ''}","${log.duration || ''}","${editHistory}"\n`;
        });
        
        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `time_logs_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Time logs exported successfully!', 'success');
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
    
    // Get all time logs
    function getAllLogs() {
        return timeLogs;
    }
    
    // Get logs by date range
    function getLogsByDateRange(startDate, endDate) {
        return timeLogs.filter(log => {
            const logDate = new Date(log.date);
            return logDate >= startDate && logDate <= endDate;
        });
    }
    
    // Get logs by date
    function getLogsByDate(date) {
        const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
        return timeLogs.filter(log => log.date === dateStr);
    }
    
    // Get total hours worked in a period
    function getTotalHours(startDate, endDate) {
        const logs = getLogsByDateRange(startDate, endDate);
        let totalMinutes = 0;
        
        logs.forEach(log => {
            if (log.timeIn && log.timeOut) {
                const [inHours, inMinutes] = log.timeIn.split(':').map(Number);
                const [outHours, outMinutes] = log.timeOut.split(':').map(Number);
                
                let logMinutes = (outHours * 60 + outMinutes) - (inHours * 60 + inMinutes);
                if (logMinutes < 0) logMinutes += 24 * 60;
                
                totalMinutes += logMinutes;
            }
        });
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return `${hours}h ${minutes}m`;
    }
    
    // Public API
    return {
        init,
        loadTimeLogs,
        getAllLogs,
        getLogsByDateRange,
        getLogsByDate,
        getTotalHours,
        recordTimeIn,
        recordTimeOut,
        updateTodayLog
    };
})();
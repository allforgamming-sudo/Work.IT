// App State
let appState = {
    shifts: {},
    selectedDate: new Date(),
    holidays: new Set([
        "2026-01-01", "2026-01-02", "2026-01-06", "2026-01-07", "2026-01-24",
        "2026-04-10", "2026-04-12", "2026-04-13", "2026-05-01", "2026-05-31",
        "2026-06-01", "2026-08-15", "2026-11-30", "2026-12-01", "2026-12-25", "2026-12-26"
    ])
};

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadShifts();
    initializeCalendar();
    updateDisplay();
});

// ============ Calendar Functions ============

function initializeCalendar() {
    renderCalendar(appState.selectedDate);
}

function renderCalendar(date) {
    const calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = '';
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Add month/year header
    const header = document.createElement('div');
    header.style.gridColumn = '1 / -1';
    header.style.textAlign = 'center';
    header.style.fontWeight = '700';
    header.style.marginBottom = '8px';
    header.textContent = new Date(year, month).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
    calendarDiv.appendChild(header);
    
    // Day headers
    const dayNames = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-header';
        dayHeader.textContent = day;
        calendarDiv.appendChild(dayHeader);
    });
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    // Previous month's days
    for (let i = (firstDay || 7) - 1; i > 0; i--) {
        const day = daysInPrevMonth - i + 1;
        const dayDiv = createDayElement(day, new Date(year, month - 1, day), true);
        calendarDiv.appendChild(dayDiv);
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const dayDiv = createDayElement(day, currentDate, false);
        calendarDiv.appendChild(dayDiv);
    }
    
    // Next month's days
    const totalCells = calendarDiv.children.length - 8; // Exclude header row
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingCells; day++) {
        const dayDiv = createDayElement(day, new Date(year, month + 1, day), true);
        calendarDiv.appendChild(dayDiv);
    }
}

function createDayElement(day, fullDate, isOtherMonth) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = day;
    
    const dateStr = fullDate.toISOString().split('T')[0];
    
    if (isOtherMonth) {
        dayDiv.classList.add('other-month');
    } else {
        dayDiv.addEventListener('click', () => selectDate(fullDate));
        
        // Check if has shift
        if (appState.shifts[dateStr]) {
            dayDiv.classList.add('has-shift');
        }
        
        // Check if selected
        if (dateStr === appState.selectedDate.toISOString().split('T')[0]) {
            dayDiv.classList.add('selected');
        }
        
        // Check if holiday
        if (appState.holidays.has(dateStr)) {
            dayDiv.classList.add('holiday');
        } else if (isWeekend(fullDate)) {
            dayDiv.classList.add('weekend');
        }
    }
    
    return dayDiv;
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Sunday, 6 = Saturday
}

function selectDate(date) {
    appState.selectedDate = date;
    renderCalendar(appState.selectedDate);
    updateDisplay();
}

// ============ Shift Management ============

function quickAddShift(startTime, endTime) {
    document.getElementById('startTime').value = startTime;
    document.getElementById('endTime').value = endTime;
}

function saveShift() {
    const dateStr = appState.selectedDate.toISOString().split('T')[0];
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    
    if (!startTime || !endTime) {
        alert('Te rog să completezi ora de inceput și de sfarsit');
        return;
    }
    
    const sanctions = parseInt(document.getElementById('sanctionsInput').value) || 0;
    const crimes = parseInt(document.getElementById('crimesInput').value) || 0;
    const wanted = parseInt(document.getElementById('wantedInput').value) || 0;
    
    const hours = calculateHours(dateStr, startTime, endTime);
    
    appState.shifts[dateStr] = {
        start: startTime,
        end: endTime,
        hours: hours.total,
        normal_hours: hours.normal,
        weekend_hours: hours.weekend,
        sanctions: sanctions,
        crimes: crimes,
        wanted: wanted
    };
    
    saveShifts();
    clearFields();
    renderCalendar(appState.selectedDate);
    updateDisplay();
}

function deleteShift() {
    const dateStr = appState.selectedDate.toISOString().split('T')[0];
    if (appState.shifts[dateStr]) {
        delete appState.shifts[dateStr];
        saveShifts();
        clearFields();
        renderCalendar(appState.selectedDate);
        updateDisplay();
    }
}

function clearFields() {
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    document.getElementById('sanctionsInput').value = '';
    document.getElementById('crimesInput').value = '';
    document.getElementById('wantedInput').value = '';
    updateDisplay();
}

// ============ Hour Calculation ============

function calculateHours(dateStr, startTime, endTime) {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;
    
    let total = 0;
    let crossesMidnight = false;
    
    if (endMinutes <= startMinutes) {
        endMinutes += 24 * 60; // Next day
        crossesMidnight = true;
    }
    
    total = (endMinutes - startMinutes) / 60;
    
    let normal = total;
    let weekend = 0;
    
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    const isHoliday = appState.holidays.has(dateStr);
    const isFriday = dayOfWeek === 5;
    const isSaturday = dayOfWeek === 6;
    const isSunday = dayOfWeek === 0;
    
    if (isHoliday) {
        weekend = total;
        normal = 0;
    } else if (crossesMidnight) {
        if (isFriday) {
            // Friday to Saturday
            const hoursToMidnight = (24 * 60 - startMinutes) / 60;
            normal = hoursToMidnight;
            weekend = total - hoursToMidnight;
        } else if (isSaturday) {
            // Saturday to Sunday
            weekend = total;
            normal = 0;
        } else if (isSunday) {
            // Sunday to Monday
            const hoursToMidnight = (24 * 60 - startMinutes) / 60;
            weekend = hoursToMidnight;
            normal = total - hoursToMidnight;
        } else {
            // Weekday to weekday
            normal = total;
            weekend = 0;
        }
    } else if (isSaturday || isSunday) {
        weekend = total;
        normal = 0;
    }
    
    return {
        total: Math.round(total * 100) / 100,
        normal: Math.round(normal * 100) / 100,
        weekend: Math.round(weekend * 100) / 100
    };
}

// ============ Display Updates ============

function updateDisplay() {
    updateDateDisplay();
    updateShiftDisplay();
    updateIncidents();
    updateStatistics();
}

function updateDateDisplay() {
    const dateStr = appState.selectedDate.toISOString().split('T')[0];
    document.getElementById('dateValue').textContent = 
        appState.selectedDate.toLocaleDateString('ro-RO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const shift = appState.shifts[dateStr];
    if (shift) {
        document.getElementById('startTime').value = shift.start;
        document.getElementById('endTime').value = shift.end;
        document.getElementById('sanctionsInput').value = shift.sanctions || 0;
        document.getElementById('crimesInput').value = shift.crimes || 0;
        document.getElementById('wantedInput').value = shift.wanted || 0;
    } else {
        clearFields();
    }
}

function updateShiftDisplay() {
    const dateStr = appState.selectedDate.toISOString().split('T')[0];
    const shift = appState.shifts[dateStr];
    const shiftInfo = document.getElementById('shiftInfo');
    
    if (shift) {
        const isWeekendShift = shift.weekend_hours > 0 && shift.normal_hours === 0;
        const isHoliday = appState.holidays.has(dateStr);
        
        let html = `
            <strong>${shift.start} - ${shift.end}</strong><br>
            Total: ${shift.hours} ore<br>
            Ore normale: ${shift.normal_hours} ore<br>
            Ore weekend: ${shift.weekend_hours} ore
        `;
        
        if (shift.sanctions > 0 || shift.crimes > 0 || shift.wanted > 0) {
            html += `<br><br>Evenimente:<br>`;
            if (shift.sanctions > 0) html += `Sancțiuni: ${shift.sanctions}<br>`;
            if (shift.crimes > 0) html += `Infracțiuni: ${shift.crimes}<br>`;
            if (shift.wanted > 0) html += `Persoane urmărite: ${shift.wanted}<br>`;
        }
        
        shiftInfo.innerHTML = html;
    } else {
        shiftInfo.textContent = 'Nicio inregistrare de schimb';
    }
}

function updateIncidents() {
    const dateStr = appState.selectedDate.toISOString().split('T')[0];
    const shift = appState.shifts[dateStr];
    
    if (shift) {
        document.getElementById('sanctionsInput').value = shift.sanctions || 0;
        document.getElementById('crimesInput').value = shift.crimes || 0;
        document.getElementById('wantedInput').value = shift.wanted || 0;
    }
}

function updateStatistics() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let monthlyHours = 0, monthlyWeekend = 0, totalHours = 0, totalWeekend = 0;
    let monthlySanctions = 0, monthlyCrimes = 0, monthlyWanted = 0;
    let totalSanctions = 0, totalCrimes = 0, totalWanted = 0;
    
    for (const dateStr in appState.shifts) {
        const shift = appState.shifts[dateStr];
        const date = new Date(dateStr);
        
        totalHours += shift.hours;
        totalWeekend += shift.weekend_hours;
        totalSanctions += shift.sanctions || 0;
        totalCrimes += shift.crimes || 0;
        totalWanted += shift.wanted || 0;
        
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            monthlyHours += shift.hours;
            monthlyWeekend += shift.weekend_hours;
            monthlySanctions += shift.sanctions || 0;
            monthlyCrimes += shift.crimes || 0;
            monthlyWanted += shift.wanted || 0;
        }
    }
    
    document.getElementById('monthlyHours').textContent = monthlyHours.toFixed(2) + ' ore';
    document.getElementById('monthlyWeekend').textContent = monthlyWeekend.toFixed(2) + ' ore';
    document.getElementById('totalHours').textContent = totalHours.toFixed(2) + ' ore';
    document.getElementById('totalWeekend').textContent = totalWeekend.toFixed(2) + ' ore';
    
    document.getElementById('monthlySanctions').textContent = monthlySanctions;
    document.getElementById('monthlyCrimes').textContent = monthlyCrimes;
    document.getElementById('monthlyWanted').textContent = monthlyWanted;
    
    document.getElementById('totalSanctions').textContent = totalSanctions;
    document.getElementById('totalCrimes').textContent = totalCrimes;
    document.getElementById('totalWanted').textContent = totalWanted;
}

// ============ All Shifts View ============

function toggleAllShifts() {
    const container = document.getElementById('allShiftsContainer');
    container.classList.toggle('hidden');
    
    if (!container.classList.contains('hidden')) {
        displayAllShifts();
    }
}

function displayAllShifts() {
    const list = document.getElementById('allShiftsList');
    list.innerHTML = '';
    
    const sortedDates = Object.keys(appState.shifts).sort().reverse();
    
    if (sortedDates.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #999;">Nicio inregistrare</p>';
        return;
    }
    
    sortedDates.forEach(dateStr => {
        const shift = appState.shifts[dateStr];
        const date = new Date(dateStr);
        
        const isHoliday = appState.holidays.has(dateStr);
        const isWeekendDay = isWeekend(date);
        
        const item = document.createElement('div');
        item.className = 'shift-item';
        
        if (isHoliday) {
            item.classList.add('holiday');
        } else if (isWeekendDay) {
            item.classList.add('weekend');
        }
        
        const detailsHtml = `
            <div class="shift-item-date">${date.toLocaleDateString('ro-RO', { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit' })}</div>
            <div class="shift-item-details">
                <div><strong>Ore:</strong> ${shift.hours} (Normal: ${shift.normal_hours} | Weekend: ${shift.weekend_hours})</div>
                <div><strong>Schimb:</strong> ${shift.start} - ${shift.end}</div>
                ${shift.sanctions > 0 ? `<div><strong>Sancțiuni:</strong> ${shift.sanctions}</div>` : ''}
                ${shift.crimes > 0 ? `<div><strong>Infracțiuni:</strong> ${shift.crimes}</div>` : ''}
                ${shift.wanted > 0 ? `<div><strong>Urmărite:</strong> ${shift.wanted}</div>` : ''}
            </div>
        `;
        
        item.innerHTML = detailsHtml;
        list.appendChild(item);
    });
}

// ============ Storage ============

function saveShifts() {
    // Convert Set to Array for JSON serialization
    const dataToSave = {
        shifts: appState.shifts,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('shiftCalendarData', JSON.stringify(dataToSave));
}

function loadShifts() {
    const saved = localStorage.getItem('shiftCalendarData');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            appState.shifts = data.shifts || {};
        } catch (e) {
            console.error('Error loading shifts:', e);
        }
    }
}

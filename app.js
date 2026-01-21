// App State
let appState = {
    shifts: {},
    selectedDate: new Date(),
    user: {
        id: null,
        name: '',
        grade: '',
        email: ''
    },
    authMode: 'login', // 'login' or 'signup'
    holidays: new Set([
        "2026-01-01", "2026-01-02", "2026-01-06", "2026-01-07", "2026-01-24",
        "2026-04-10", "2026-04-12", "2026-04-13", "2026-05-01", "2026-05-31",
        "2026-06-01", "2026-08-15", "2026-11-30", "2026-12-01", "2026-12-25", "2026-12-26"
    ])
};

// Initialize App
document.addEventListener('DOMContentLoaded', async function() {
    await checkAuth();
    
    // Close modal on background click
    document.getElementById('loginModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeLoginModal();
        }
    });
    
    // Close shift details modal on background click
    document.getElementById('shiftDetailsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeShiftDetailsModal();
        }
    });
    
    // Mobile-friendly: Disable zoom on input focus
    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('focus', function() {
            document.querySelector('meta[name="viewport"]').setAttribute(
                'content', 
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0'
            );
        });
        el.addEventListener('blur', function() {
            document.querySelector('meta[name="viewport"]').setAttribute(
                'content', 
                'width=device-width, initial-scale=1.0'
            );
        });
    });
});

// ============ Calendar Functions ============

function initializeCalendar() {
    renderCalendar(appState.selectedDate);
}

function updateCalendar() {
    renderCalendar(appState.selectedDate);
}

function changeMonth(delta) {
    const newDate = new Date(appState.selectedDate);
    newDate.setMonth(newDate.getMonth() + delta);
    appState.selectedDate = newDate;
    renderCalendar(appState.selectedDate);
    updateDisplay();
}

function renderCalendar(date) {
    const calendarDiv = document.getElementById('calendar');
    calendarDiv.innerHTML = '';
    
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // Add month/year header with navigation
    const header = document.createElement('div');
    header.style.gridColumn = '1 / -1';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = '8px';
    header.style.padding = '0 8px';
    
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '◀';
    prevBtn.className = 'calendar-nav-btn';
    prevBtn.onclick = () => changeMonth(-1);
    
    const monthYear = document.createElement('span');
    monthYear.style.fontWeight = '700';
    monthYear.textContent = new Date(year, month).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '▶';
    nextBtn.className = 'calendar-nav-btn';
    nextBtn.onclick = () => changeMonth(1);
    
    header.appendChild(prevBtn);
    header.appendChild(monthYear);
    header.appendChild(nextBtn);
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
    
    // Use local date to avoid timezone issues
    const year = fullDate.getFullYear();
    const month = String(fullDate.getMonth() + 1).padStart(2, '0');
    const dayNum = String(fullDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayNum}`;
    
    if (isOtherMonth) {
        dayDiv.classList.add('other-month');
        dayDiv.textContent = day;
    } else {
        dayDiv.addEventListener('click', () => selectDate(fullDate));
        
        // Check if has shift and add shift indicator
        if (appState.shifts[dateStr]) {
            dayDiv.classList.add('has-shift');
            const shift = appState.shifts[dateStr];
            const shiftLabel = getShiftLabel(shift.start, shift.end);
            
            // Create shift label element
            const shiftSpan = document.createElement('div');
            shiftSpan.className = 'shift-label';
            shiftSpan.textContent = shiftLabel;
            dayDiv.appendChild(shiftSpan);
            
            // Create day number element
            const daySpan = document.createElement('div');
            daySpan.className = 'day-number';
            daySpan.textContent = day;
            dayDiv.appendChild(daySpan);
        } else {
            dayDiv.textContent = day;
        }
        
        // Check if selected - use same date format
        const selectedYear = appState.selectedDate.getFullYear();
        const selectedMonth = String(appState.selectedDate.getMonth() + 1).padStart(2, '0');
        const selectedDay = String(appState.selectedDate.getDate()).padStart(2, '0');
        const selectedDateStr = `${selectedYear}-${selectedMonth}-${selectedDay}`;
        
        if (dateStr === selectedDateStr) {
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

function getShiftLabel(startTime, endTime) {
    // Determine shift type based on start time
    if (startTime === '06:00') {
        return 'Sch I';
    } else if (startTime === '14:00') {
        return 'Sch II';
    } else if (startTime === '22:00') {
        return 'Sch III';
    }
    // For custom shifts, try to match by time range
    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 6 && hour < 14) {
        return 'Sch I';
    } else if (hour >= 14 && hour < 22) {
        return 'Sch II';
    } else {
        return 'Sch III';
    }
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
    // Set the start and end times
    document.getElementById('shiftTimeStart').value = startTime;
    document.getElementById('shiftTimeEnd').value = endTime;
    
    // Set date to selected date from calendar or today if none selected
    const dateToUse = appState.selectedDate || new Date();
    const year = dateToUse.getFullYear();
    const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
    const day = String(dateToUse.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    document.getElementById('shiftDate').value = dateStr;
    
    // Reset incidents to 0
    document.getElementById('shiftSanctions').value = '0';
    document.getElementById('shiftCrimes').value = '0';
    document.getElementById('shiftWanted').value = '0';
    
    // Provide visual feedback on mobile
    const btn = event.target.closest('.shift-btn');
    if (btn) {
        btn.classList.add('active');
        setTimeout(() => {
            btn.classList.remove('active');
        }, 150);
    }
    
    // Open the shift details modal
    openShiftDetailsModal();
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
        // Clear fields without calling updateDisplay
        document.getElementById('startTime').value = '';
        document.getElementById('endTime').value = '';
        document.getElementById('sanctionsInput').value = '';
        document.getElementById('crimesInput').value = '';
        document.getElementById('wantedInput').value = '';
    }
}

function updateShiftDisplay() {
    const dateStr = appState.selectedDate.toISOString().split('T')[0];
    const shift = appState.shifts[dateStr];
    const shiftInfo = document.getElementById('shiftInfo');
    
    if (shift) {
        const normalHours = shift.normal_hours || 0;
        const weekendHours = shift.weekend_hours || 0;
        const totalHours = shift.hours || 0;
        
        let html = `
            <strong>⏰ ${shift.start} - ${shift.end}</strong><br>
            <strong>Total Ore:</strong> ${totalHours.toFixed(2)} ore<br>
        `;
        
        if (normalHours > 0) {
            html += `<strong>Ore Normale:</strong> ${normalHours.toFixed(2)} ore<br>`;
        }
        
        if (weekendHours > 0) {
            html += `<strong>Ore Weekend/Sărbătoare:</strong> ${weekendHours.toFixed(2)} ore<br>`;
        }
        
        if (shift.sanctions > 0 || shift.crimes > 0 || shift.wanted > 0) {
            html += `<br><strong>🚨 Evenimente:</strong><br>`;
            if (shift.sanctions > 0) html += `📋 Sancțiuni: <strong>${shift.sanctions}</strong><br>`;
            if (shift.crimes > 0) html += `⚖️ Infracțiuni: <strong>${shift.crimes}</strong><br>`;
            if (shift.wanted > 0) html += `👤 Persoane Urmărite: <strong>${shift.wanted}</strong><br>`;
        }
        
        shiftInfo.innerHTML = html;
    } else {
        shiftInfo.innerHTML = '<em style="color: #999;">Nicio înregistrare de schimb pentru această dată</em>';
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
                <div><strong>⏰ Schimb:</strong> ${shift.start} - ${shift.end}</div>
                <div><strong>📊 Ore:</strong> ${shift.hours.toFixed(2)} (Normal: ${shift.normal_hours.toFixed(2)} | Weekend: ${shift.weekend_hours.toFixed(2)})</div>
                ${shift.sanctions > 0 || shift.crimes > 0 || shift.wanted > 0 ? '<div style="margin-top: 8px;"><strong>🚨 Evenimente:</strong></div>' : ''}
                ${shift.sanctions > 0 ? `<div>📋 Sancțiuni: <strong>${shift.sanctions}</strong></div>` : ''}
                ${shift.crimes > 0 ? `<div>⚖️ Infracțiuni: <strong>${shift.crimes}</strong></div>` : ''}
                ${shift.wanted > 0 ? `<div>👤 Persoane Urmărite: <strong>${shift.wanted}</strong></div>` : ''}
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

async function loadShifts() {
    try {
        // Try to load from Supabase first
        if (typeof supabase !== 'undefined' && appState.user.id) {
            const { data, error } = await supabase
                .from('shifts')
                .select('*')
                .eq('user_id', appState.user.id);
            
            if (data && !error) {
                // Convert Supabase data to appState format
                appState.shifts = {};
                data.forEach(shift => {
                    appState.shifts[shift.shift_date] = {
                        start: shift.start_time,
                        end: shift.end_time,
                        hours: parseFloat(shift.hours),
                        normal_hours: parseFloat(shift.normal_hours),
                        weekend_hours: parseFloat(shift.weekend_hours),
                        sanctions: shift.sanctions || 0,
                        crimes: shift.crimes || 0,
                        wanted: shift.wanted || 0,
                        weekend_shift: shift.weekend_shift,
                        timestamp: shift.created_at
                    };
                });
                console.log('Shifts loaded from Supabase:', data.length);
                
                // Save to localStorage as backup
                localStorage.setItem('shiftCalendarData', JSON.stringify({
                    shifts: appState.shifts
                }));
                return;
            }
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('shiftCalendarData');
        if (saved) {
            const data = JSON.parse(saved);
            appState.shifts = data.shifts || {};
            console.log('Shifts loaded from localStorage');
        }
    } catch (e) {
        console.error('Error loading shifts:', e);
    }
}

// ============ Authentication Functions ============

async function checkAuth() {
    console.log('checkAuth called');
    try {
        if (typeof supabase === 'undefined') {
            console.error('Supabase not initialized');
            // Still initialize calendar even if Supabase is not available
            initializeCalendar();
            console.log('Opening login modal - supabase undefined');
            openLoginModal();
            return;
        }
        
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session:', session);
        
        if (session) {
            appState.user.id = session.user.id;
            appState.user.email = session.user.email;
            await loadUserProfile();
            await loadShifts();
            initializeCalendar();
            updateDisplay();
            displayUserProfile();
        } else {
            // Initialize calendar even if not logged in
            console.log('No session - initializing calendar and opening login');
            initializeCalendar();
            openLoginModal();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        // Still initialize calendar on error
        initializeCalendar();
        console.log('Opening login modal - error caught');
        openLoginModal();
    }
}

function toggleAuthMode(event) {
    event.preventDefault();
    appState.authMode = appState.authMode === 'login' ? 'signup' : 'login';
    
    const profileFields = document.getElementById('profileFields');
    const modalTitle = document.getElementById('authModalTitle');
    const submitBtn = document.getElementById('authSubmitBtn');
    const switchText = document.getElementById('authSwitchText');
    const switchLink = document.getElementById('authSwitchLink');
    const nameField = document.getElementById('userName');
    const gradeField = document.getElementById('userGrade');
    
    if (appState.authMode === 'signup') {
        modalTitle.textContent = '📝 Înregistrare';
        submitBtn.textContent = 'Creare Cont';
        switchText.textContent = 'Ai deja cont? ';
        switchLink.textContent = 'Conectare';
        profileFields.style.display = 'block';
        nameField.required = true;
        gradeField.required = true;
    } else {
        modalTitle.textContent = '🔐 Autentificare';
        submitBtn.textContent = 'Conectare';
        switchText.textContent = 'Nu ai cont? ';
        switchLink.textContent = 'Înregistrare';
        profileFields.style.display = 'none';
        nameField.required = false;
        gradeField.required = false;
    }
}

async function handleAuth(event) {
    event.preventDefault();
    
    const email = document.getElementById('userEmail').value.trim();
    const password = document.getElementById('userPassword').value;
    
    try {
        if (appState.authMode === 'signup') {
            // Sign up
            const name = document.getElementById('userName').value.trim();
            const grade = document.getElementById('userGrade').value;
            
            if (!name || !grade) {
                alert('Te rog completează toate câmpurile');
                return;
            }
            
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            if (data.user) {
                appState.user.id = data.user.id;
                appState.user.email = data.user.email;
                appState.user.name = name;
                appState.user.grade = grade;
                
                await saveUserProfile();
                await loadShifts();
                initializeCalendar();
                updateDisplay();
                displayUserProfile();
                closeLoginModal();
                alert('✅ Cont creat cu succes!');
            }
        } else {
            // Sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            if (data.user) {
                appState.user.id = data.user.id;
                appState.user.email = data.user.email;
                
                await loadUserProfile();
                await loadShifts();
                initializeCalendar();
                updateDisplay();
                displayUserProfile();
                closeLoginModal();
            }
        }
    } catch (error) {
        console.error('Auth error:', error);
        alert('Eroare: ' + (error.message || 'A apărut o eroare la autentificare'));
    }
}

async function handleLogout() {
    const confirm = window.confirm('Ești sigur că vrei să te deconectezi?');
    
    if (confirm) {
        try {
            await supabase.auth.signOut();
            
            // Clear app state
            appState.shifts = {};
            appState.user = { id: null, name: '', grade: '', email: '' };
            
            // Clear local storage
            localStorage.removeItem('shiftCalendarData');
            localStorage.removeItem('userProfile');
            localStorage.removeItem('userId');
            
            // Reset UI
            document.getElementById('userInfo').style.display = 'none';
            
            // Show login modal
            openLoginModal();
            
            alert('✅ Deconectat cu succes!');
        } catch (error) {
            console.error('Logout error:', error);
            alert('Eroare la deconectare');
        }
    }
}

// User Profile Management Functions
function openLoginModal() {
    console.log('openLoginModal called');
    const modal = document.getElementById('loginModal');
    console.log('Login modal element:', modal);
    if (modal) {
        modal.classList.add('active');
        console.log('Modal classes:', modal.className);
    } else {
        console.error('Login modal element not found!');
    }
    
    // Don't allow closing if not authenticated
    const closeBtn = document.getElementById('authCloseBtn');
    if (appState.user.id) {
        closeBtn.style.display = 'flex';
    } else {
        closeBtn.style.display = 'none';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
    // Reset form
    document.getElementById('userName').value = '';
    document.getElementById('userGrade').value = 'Polițist';
}

async function saveUserProfile() {
    try {
        const userProfile = {
            name: appState.user.name,
            grade: appState.user.grade
        };
        
        // Save to localStorage as backup
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        // Save to Supabase
        if (typeof supabase !== 'undefined') {
            if (appState.user.id) {
                // Update existing user
                const { error } = await supabase
                    .from('users')
                    .update(userProfile)
                    .eq('id', appState.user.id);
                
                if (error) throw error;
                console.log('User profile updated in Supabase');
            } else {
                // Create new user
                const { data, error } = await supabase
                    .from('users')
                    .insert([userProfile])
                    .select()
                    .single();
                
                if (error) throw error;
                appState.user.id = data.id;
                localStorage.setItem('userId', data.id);
                console.log('User profile created in Supabase:', data.id);
            }
        }
    } catch (e) {
        console.error('Error saving user profile:', e);
        alert('Eroare la salvarea profilului. Datele vor fi salvate local.');
    }
}

async function loadUserProfile() {
    try {
        // Try to load user ID from localStorage
        const savedUserId = localStorage.getItem('userId');
        
        // Try to load from Supabase first
        if (typeof supabase !== 'undefined' && savedUserId) {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', savedUserId)
                .single();
            
            if (data && !error) {
                appState.user.id = data.id;
                appState.user.name = data.name || '';
                appState.user.grade = data.grade || 'Agent de politie';
                console.log('User profile loaded from Supabase');
                return;
            }
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            const userProfile = JSON.parse(saved);
            appState.user.name = userProfile.name || '';
            appState.user.grade = userProfile.grade || 'Agent de politie';
            console.log('User profile loaded from localStorage');
        }
    } catch (e) {
        console.error('Error loading user profile:', e);
    }
}

function displayUserProfile() {
    const userDisplay = document.getElementById('userDisplay');
    const userInfo = document.getElementById('userInfo');
    
    if (appState.user.name) {
        userDisplay.textContent = `${appState.user.name} - ${appState.user.grade}`;
        userInfo.style.display = 'flex';
    } else {
        userInfo.style.display = 'none';
        userDisplay.textContent = '';
    }
}

// ============ Settings Modal Functions ============

function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.add('active');
}

function closeSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('active');
}

async function clearAllData() {
    console.log('clearAllData function called');
    const confirmDelete = confirm('⚠️ Ești sigur că vrei să ștergi toate datele?\n\nAceastă acțiune va șterge permanent:\n• Toate schimburile înregistrate\n• Statisticile\n• Evenimentele\n\nAceastă acțiune NU poate fi anulată!');
    
    console.log('First confirmation:', confirmDelete);
    
    if (confirmDelete) {
        const doubleConfirm = confirm('🚨 CONFIRMARE FINALĂ\n\nVrei să continui cu ștergerea tuturor datelor?');
        
        console.log('Second confirmation:', doubleConfirm);
        
        if (doubleConfirm) {
            try {
                // Clear from Supabase
                if (typeof supabase !== 'undefined' && appState.user.id) {
                    const { error } = await supabase
                        .from('shifts')
                        .delete()
                        .eq('user_id', appState.user.id);
                    
                    if (error) {
                        console.error('Error clearing Supabase data:', error);
                    } else {
                        console.log('Data cleared from Supabase');
                    }
                }
                
                // Clear all shifts data locally
                appState.shifts = {};
                localStorage.removeItem('shiftCalendarData');
                
                // Reset selected date to today
                appState.selectedDate = new Date();
                
                console.log('Data cleared, updating UI...');
                
                // Update all UI components
                updateCalendar();
                updateStatistics();
                updateShiftDisplay();
                updateIncidents();
                displayAllShifts();
                
                console.log('UI updated successfully');
                
                // Close modal and show success
                closeSettingsModal();
                alert('✅ Toate datele au fost șterse cu succes!');
            } catch (error) {
                console.error('Error clearing data:', error);
                alert('Eroare la ștergerea datelor: ' + error.message);
            }
        }
    }
}

// ============ Shift Details Modal Functions ============

function openShiftDetailsModal() {
    const modal = document.getElementById('shiftDetailsModal');
    modal.classList.add('active');
}

function closeShiftDetailsModal() {
    const modal = document.getElementById('shiftDetailsModal');
    modal.classList.remove('active');
    // Reset form
    document.getElementById('shiftDate').value = '';
    document.getElementById('shiftTimeStart').value = '';
    document.getElementById('shiftTimeEnd').value = '';
    document.getElementById('shiftSanctions').value = '0';
    document.getElementById('shiftCrimes').value = '0';
    document.getElementById('shiftWanted').value = '0';
}

async function handleShiftDetailsSubmit(event) {
    event.preventDefault();
    
    const shiftDate = document.getElementById('shiftDate').value;
    const startTime = document.getElementById('shiftTimeStart').value;
    const endTime = document.getElementById('shiftTimeEnd').value;
    const sanctions = parseInt(document.getElementById('shiftSanctions').value) || 0;
    const crimes = parseInt(document.getElementById('shiftCrimes').value) || 0;
    const wanted = parseInt(document.getElementById('shiftWanted').value) || 0;
    
    if (!startTime || !endTime) {
        alert('Te rog completeaza orele de inceput si sfarsit');
        return;
    }
    
    // Calculate hours
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    let hours = (end - start) / (1000 * 60 * 60);
    
    // Handle overnight shifts
    const isOvernightShift = hours < 0;
    if (isOvernightShift) {
        hours += 24;
    }
    
    // Check if date is weekend or holiday
    const shiftDateObj = new Date(shiftDate + 'T00:00:00');
    const dayOfWeek = shiftDateObj.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = appState.holidays.has(shiftDate);
    
    // Calculate normal vs weekend hours
    let normalHours = 0;
    let weekendHours = 0;
    
    if (isOvernightShift) {
        // For overnight shifts, split hours between two days
        const hoursBeforeMidnight = 24 - parseInt(startTime.split(':')[0]) - (parseInt(startTime.split(':')[1]) / 60);
        const hoursAfterMidnight = hours - hoursBeforeMidnight;
        
        // Check if start date is weekend/holiday
        const startIsWeekendOrHoliday = isWeekend || isHoliday;
        
        // Check if next day is weekend/holiday
        const nextDay = new Date(shiftDateObj);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayOfWeek = nextDay.getDay();
        const nextDayIsWeekend = nextDayOfWeek === 0 || nextDayOfWeek === 6;
        const nextDayStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
        const nextDayIsHoliday = appState.holidays.has(nextDayStr);
        const nextIsWeekendOrHoliday = nextDayIsWeekend || nextDayIsHoliday;
        
        // Calculate weekend hours for each part
        if (startIsWeekendOrHoliday) {
            weekendHours += hoursBeforeMidnight;
        } else {
            normalHours += hoursBeforeMidnight;
        }
        
        if (nextIsWeekendOrHoliday) {
            weekendHours += hoursAfterMidnight;
        } else {
            normalHours += hoursAfterMidnight;
        }
    } else {
        // For same-day shifts
        if (isWeekend || isHoliday) {
            weekendHours = hours;
            normalHours = 0;
        } else {
            normalHours = hours;
            weekendHours = 0;
        }
    }
    
    // Save shift to appState as OBJECT (not array)
    appState.shifts[shiftDate] = {
        start: startTime,
        end: endTime,
        hours: hours,
        normal_hours: normalHours,
        weekend_hours: weekendHours,
        sanctions: sanctions,
        crimes: crimes,
        wanted: wanted,
        weekend_shift: isWeekend || isHoliday,
        timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    try {
        localStorage.setItem('shiftCalendarData', JSON.stringify({
            shifts: appState.shifts
        }));
        console.log('✅ Shift saved to localStorage');
        
        // Save to Supabase
        if (typeof supabase !== 'undefined' && appState.user.id) {
            const shiftData = {
                user_id: appState.user.id,
                shift_date: shiftDate,
                start_time: startTime,
                end_time: endTime,
                hours: hours,
                normal_hours: normalHours,
                weekend_hours: weekendHours,
                sanctions: sanctions,
                crimes: crimes,
                wanted: wanted,
                weekend_shift: isWeekend || isHoliday
            };
            
            const { error } = await supabase
                .from('shifts')
                .upsert(shiftData, { onConflict: 'user_id,shift_date' });
            
            if (error) {
                console.error('Error saving to Supabase:', error);
            } else {
                console.log('✅ Shift saved to Supabase');
            }
        }
    } catch (e) {
        console.error('❌ Error saving shifts:', e);
        alert('Eroare la salvarea datelor: ' + e.message);
        return;
    }
    
    // Select the date to show details
    const dateObj = new Date(shiftDate + 'T00:00:00');
    appState.selectedDate = dateObj;
    
    // Close modal first
    closeShiftDetailsModal();
    
    // Update UI in real-time
    updateCalendar();
    updateStats();
    updateShiftDisplay();
    updateIncidents();
    
    // Show success message
    alert('✅ Schimb salvat cu succes!');
}


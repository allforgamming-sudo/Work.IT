import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
from tkcalendar import Calendar
from datetime import datetime
import json
import os
from pathlib import Path

class ShiftCalendarApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Calendar de Schimburi - Tracker Ore Lucrate")
        self.root.geometry("1400x1000")
        self.data_file = "shifts_data.json"
        self.shifts = self.load_shifts()
        self.selected_date = datetime.now()
        
        self.setup_ui()
        
    def setup_ui(self):
        # Main frame with vertical layout
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky="nsew")
        
        # Configure grid weights
        self.root.grid_rowconfigure(0, weight=1)
        self.root.grid_columnconfigure(0, weight=1)
        main_frame.grid_rowconfigure(1, weight=1)
        main_frame.grid_columnconfigure(0, weight=1)
        
        # ===== TOP SECTION - Quick Select Shift =====
        preset_frame = ttk.LabelFrame(main_frame, text="Selectare Rapidă Schimb", padding="15")
        preset_frame.grid(row=0, column=0, sticky="ew", pady=5)
        
        ttk.Button(preset_frame, text="SCHIMBUL I\n06:00 - 14:00", 
                   command=lambda: self.quick_add_shift("06:00", "14:00")).pack(side="left", padx=5, fill="x", expand=True)
        ttk.Button(preset_frame, text="SCHIMBUL II\n14:00 - 22:00", 
                   command=lambda: self.quick_add_shift("14:00", "22:00")).pack(side="left", padx=5, fill="x", expand=True)
        ttk.Button(preset_frame, text="SCHIMBUL III\n22:00 - 06:00", 
                   command=lambda: self.quick_add_shift("22:00", "06:00")).pack(side="left", padx=5, fill="x", expand=True)
        
        # ===== MIDDLE SECTION - Calendar, Statistics, and Incidents =====
        middle_frame = ttk.Frame(main_frame)
        middle_frame.grid(row=1, column=0, sticky="nsew", pady=5)
        middle_frame.grid_columnconfigure(0, weight=2)  # Calendar gets 2x weight
        middle_frame.grid_columnconfigure(1, weight=1)  # Statistics gets 1x weight
        middle_frame.grid_columnconfigure(2, weight=1)  # Incidents gets 1x weight
        middle_frame.grid_rowconfigure(0, weight=1)
        
        # Left - Calendar (larger)
        cal_frame = ttk.LabelFrame(middle_frame, text="Selectare Data", padding="10")
        cal_frame.grid(row=0, column=0, sticky="nsew", padx=2, pady=5)
        
        self.calendar = Calendar(
            cal_frame,
            selectmode='day',
            year=datetime.now().year,
            month=datetime.now().month,
            day=datetime.now().day,
            date_pattern='yyyy-mm-dd',
            font=("Arial", 12),
            headersforegound="black",
            weekendforeground="red",
            locale='ro_RO'
        )
        self.calendar.pack(padx=10, pady=10, fill="both", expand=True)
        self.calendar.bind('<<CalendarSelected>>', self.on_date_selected)
        
        # Mark Romanian public holidays as weekend days (red) for 2026
        holidays_2026 = [
            "2026-01-01",  # Anul Nou
            "2026-01-02",  # A doua zi după Anul Nou
            "2026-01-06",  # Botezul Domnului – Boboteaza
            "2026-01-07",  # Soborul Sfântului Ioan Botezătorul
            "2026-01-24",  # Ziua Unirii Principatelor Române (Saturday)
            "2026-04-10",  # Vinerea Mare (Friday)
            "2026-04-12",  # Paște ortodox (Sunday)
            "2026-04-13",  # A doua zi de Paște (Monday)
            "2026-05-01",  # Ziua Muncii (Friday)
            "2026-05-31",  # Rusalii (Sunday)
            "2026-06-01",  # A doua zi de Rusalii + Ziua Copilului (Monday)
            "2026-08-15",  # Adormirea Maicii Domnului (Saturday)
            "2026-11-30",  # Sfântul Andrei (Monday)
            "2026-12-01",  # Ziua Națională a României (Tuesday)
            "2026-12-25",  # Crăciunul (Friday)
            "2026-12-26",  # A doua zi de Crăciun (Saturday)
        ]
        
        # Store holidays for reference and separate by type
        self.holidays = set(holidays_2026)
        self.weekend_holidays = set()  # Holidays that fall on weekends (Sat/Sun)
        self.weekday_holidays = set()  # Holidays that fall on weekdays
        
        # Categorize holidays
        for holiday in holidays_2026:
            try:
                holiday_date = datetime.strptime(holiday, '%Y-%m-%d')
                self.weekend_holidays.add(holiday)  # All holidays are treated as weekend hours
                # Mark with dark blue for all holidays
                self.calendar.tag_config(holiday, background="#00008B", foreground="white")
                self.calendar.calevent_create(holiday_date, '', 'holiday')
            except:
                pass
        
        # Right - Statistics
        stats_frame = ttk.LabelFrame(middle_frame, text="Statistici Ore Lucrate", padding="10")
        stats_frame.grid(row=0, column=1, sticky="nsew", padx=2, pady=5)
        
        # Hours statistics
        ttk.Label(stats_frame, text="Total Ore (Luna Aceasta):", font=("Arial", 10, "bold")).pack(anchor="w", pady=3)
        self.monthly_hours_label = ttk.Label(stats_frame, text="0.00 ore", 
                                            font=("Arial", 10, "bold"), foreground="blue")
        self.monthly_hours_label.pack(anchor="w", pady=1)
        
        ttk.Label(stats_frame, text="Ore de Weekend (Luna Aceasta):", font=("Arial", 10, "bold")).pack(anchor="w", pady=(8, 3))
        self.monthly_weekend_label = ttk.Label(stats_frame, text="0.00 ore", 
                                              font=("Arial", 10, "bold"), foreground="red")
        self.monthly_weekend_label.pack(anchor="w", pady=1)
        
        ttk.Label(stats_frame, text="Total Ore (Tot Timpul):", font=("Arial", 10, "bold")).pack(anchor="w", pady=(8, 3))
        self.total_hours_label = ttk.Label(stats_frame, text="0.00 ore", 
                                          font=("Arial", 10, "bold"), foreground="blue")
        self.total_hours_label.pack(anchor="w", pady=1)
        
        ttk.Label(stats_frame, text="Ore de Weekend (Tot Timpul):", font=("Arial", 10, "bold")).pack(anchor="w", pady=(8, 3))
        self.total_weekend_label = ttk.Label(stats_frame, text="0.00 ore", 
                                            font=("Arial", 10, "bold"), foreground="red")
        self.total_weekend_label.pack(anchor="w", pady=1)
        
        # Separator
        ttk.Separator(stats_frame, orient="horizontal").pack(fill="x", pady=8)
        
        # Events statistics - with color-coded values
        ttk.Label(stats_frame, text="Evenimente (Luna Aceasta):", font=("Arial", 10, "bold")).pack(anchor="w", pady=3)
        
        monthly_incidents_frame = ttk.Frame(stats_frame)
        monthly_incidents_frame.pack(anchor="w", pady=1, fill="x")
        ttk.Label(monthly_incidents_frame, text="S: ", font=("Arial", 10, "bold"), foreground="darkgreen").pack(side="left")
        self.monthly_sanctions_label = ttk.Label(monthly_incidents_frame, text="0", font=("Arial", 10, "bold"), foreground="darkgreen")
        self.monthly_sanctions_label.pack(side="left")
        ttk.Label(monthly_incidents_frame, text=" | I: ", font=("Arial", 10, "bold"), foreground="darkgreen").pack(side="left")
        self.monthly_crimes_label = ttk.Label(monthly_incidents_frame, text="0", font=("Arial", 10, "bold"), foreground="purple")
        self.monthly_crimes_label.pack(side="left")
        ttk.Label(monthly_incidents_frame, text=" | P: ", font=("Arial", 10, "bold"), foreground="darkgreen").pack(side="left")
        self.monthly_wanted_label = ttk.Label(monthly_incidents_frame, text="0", font=("Arial", 10, "bold"), foreground="blue")
        self.monthly_wanted_label.pack(side="left")
        
        ttk.Label(stats_frame, text="Evenimente (Tot Timpul):", font=("Arial", 10, "bold")).pack(anchor="w", pady=(8, 3))
        
        total_incidents_frame = ttk.Frame(stats_frame)
        total_incidents_frame.pack(anchor="w", pady=1, fill="x")
        ttk.Label(total_incidents_frame, text="S: ", font=("Arial", 10, "bold"), foreground="darkgreen").pack(side="left")
        self.total_sanctions_label = ttk.Label(total_incidents_frame, text="0", font=("Arial", 10, "bold"), foreground="darkgreen")
        self.total_sanctions_label.pack(side="left")
        ttk.Label(total_incidents_frame, text=" | I: ", font=("Arial", 10, "bold"), foreground="darkgreen").pack(side="left")
        self.total_crimes_label = ttk.Label(total_incidents_frame, text="0", font=("Arial", 10, "bold"), foreground="purple")
        self.total_crimes_label.pack(side="left")
        ttk.Label(total_incidents_frame, text=" | P: ", font=("Arial", 10, "bold"), foreground="darkgreen").pack(side="left")
        self.total_wanted_label = ttk.Label(total_incidents_frame, text="0", font=("Arial", 10, "bold"), foreground="blue")
        self.total_wanted_label.pack(side="left")
        
        # Right-Right - Incident Tracking
        incident_frame = ttk.LabelFrame(middle_frame, text="Înregistrare Evenimente", padding="10")
        incident_frame.grid(row=0, column=2, sticky="nsew", padx=2, pady=5)
        incident_frame.grid_columnconfigure(0, weight=1)
        
        # Column 1 - Sancțiuni Constatate
        sanctions_frame = ttk.LabelFrame(incident_frame, text="Sancțiuni Constatate", padding="8")
        sanctions_frame.pack(fill="x", padx=2, pady=2)
        
        ttk.Label(sanctions_frame, text="Număr:", font=("Arial", 9)).pack(anchor="w")
        self.sanctions_entry = ttk.Entry(sanctions_frame, width=12, font=("Arial", 9))
        self.sanctions_entry.pack(anchor="w", padx=3, pady=2, fill="x")
        
        # Column 2 - Infracțiuni Constatate
        crimes_frame = ttk.LabelFrame(incident_frame, text="Infracțiuni Constatate", padding="8")
        crimes_frame.pack(fill="x", padx=2, pady=2)
        
        ttk.Label(crimes_frame, text="Număr:", font=("Arial", 9)).pack(anchor="w")
        self.crimes_entry = ttk.Entry(crimes_frame, width=12, font=("Arial", 9))
        self.crimes_entry.pack(anchor="w", padx=3, pady=2, fill="x")
        
        # Column 3 - Persoane Urmărite Depistate
        wanted_frame = ttk.LabelFrame(incident_frame, text="Persoane Urmărite Depistate", padding="8")
        wanted_frame.pack(fill="x", padx=2, pady=2)
        
        ttk.Label(wanted_frame, text="Număr:", font=("Arial", 9)).pack(anchor="w")
        self.wanted_entry = ttk.Entry(wanted_frame, width=12, font=("Arial", 9))
        self.wanted_entry.pack(anchor="w", padx=3, pady=2, fill="x")
        
        # ===== BOTTOM SECTION - Shift Details =====
        detail_frame = ttk.LabelFrame(main_frame, text="Detalii Schimb", padding="10")
        detail_frame.grid(row=2, column=0, sticky="ew", pady=5)
        detail_frame.grid_columnconfigure(0, weight=1)
        detail_frame.grid_columnconfigure(1, weight=1)
        
        # Left side - Input and Management
        left_detail = ttk.Frame(detail_frame)
        left_detail.grid(row=0, column=0, sticky="ew", padx=5)
        
        # Selected date display
        self.date_label = ttk.Label(left_detail, text=f"Date: {datetime.now().strftime('%Y-%m-%d')}", 
                                    font=("Arial", 9, "bold"))
        self.date_label.pack(pady=2)
        
        # Shift info frame
        info_frame = ttk.Frame(left_detail)
        info_frame.pack(fill="x", pady=5)
        
        ttk.Label(info_frame, text="Ora Inceput (HH:MM):", font=("Arial", 9)).pack(anchor="w")
        self.start_time_entry = ttk.Entry(info_frame, width=12, font=("Arial", 9))
        self.start_time_entry.pack(anchor="w", padx=5, pady=1)
        
        ttk.Label(info_frame, text="Ora Sfarsit (HH:MM):", font=("Arial", 9)).pack(anchor="w", pady=(5, 0))
        self.end_time_entry = ttk.Entry(info_frame, width=12, font=("Arial", 9))
        self.end_time_entry.pack(anchor="w", padx=5, pady=1)
        
        # Buttons for shift management
        button_frame = ttk.Frame(left_detail)
        button_frame.pack(fill="x", pady=5)
        
        ttk.Button(button_frame, text="Salvare", command=self.save_shift).pack(side="left", padx=1, fill="x", expand=True)
        ttk.Button(button_frame, text="Sterge", command=self.delete_shift).pack(side="left", padx=1, fill="x", expand=True)
        ttk.Button(button_frame, text="Golire", command=self.clear_fields).pack(side="left", padx=1, fill="x", expand=True)
        
        # Right side - Current Shift Display
        shift_frame = ttk.LabelFrame(detail_frame, text="Schimb Curent", padding="10")
        shift_frame.grid(row=0, column=1, sticky="ew", padx=5)
        
        self.shift_display = ttk.Label(shift_frame, text="Nicio inregistrare de schimb", 
                                      font=("Arial", 10), foreground="gray")
        self.shift_display.pack(pady=5)
        
        # View All Shifts button
        ttk.Button(detail_frame, text="Vedere Toate Schimburile", command=self.view_all_shifts).grid(row=1, column=0, columnspan=2, pady=5, sticky="ew", padx=5)
        
        # Load initial data
        self.on_date_selected()
        self.update_statistics()
    
    def set_shift_times(self, start_time, end_time):
        """Set shift times from preset buttons"""
        self.start_time_entry.delete(0, tk.END)
        self.start_time_entry.insert(0, start_time)
        self.end_time_entry.delete(0, tk.END)
        self.end_time_entry.insert(0, end_time)
    
    def calculate_shift_hours(self, date_str, start_time, end_time):
        """Calculate normal and weekend hours for a shift that may cross midnight/weekend boundary"""
        start_obj = datetime.strptime(start_time, '%H:%M')
        end_obj = datetime.strptime(end_time, '%H:%M')
        
        # Parse the date
        date_obj = datetime.strptime(date_str, '%Y-%m-%d')
        current_weekday = date_obj.weekday()  # 0=Monday, 5=Saturday, 6=Sunday
        
        # Check if current date is a holiday (all holidays count as 8 weekend hours)
        is_holiday = date_str in self.holidays
        
        is_tomorrow_holiday = False
        
        if end_obj < start_obj:  # Crosses midnight
            try:
                tomorrow = date_obj.replace(day=date_obj.day+1) if date_obj.day < 28 else date_obj.replace(month=date_obj.month+1, day=1)
                tomorrow_str = tomorrow.strftime('%Y-%m-%d')
                is_tomorrow_holiday = tomorrow_str in self.holidays
            except:
                pass
        
        # Calculate total hours first
        total_hours = (end_obj - start_obj).total_seconds() / 3600
        if total_hours < 0:
            total_hours += 24  # Shift crosses midnight
        
        # Determine if shift crosses into the next day
        crosses_midnight = end_obj < start_obj
        
        normal_hours = total_hours
        weekend_hours = 0.0
        
        if crosses_midnight:
            # Shift goes from today to tomorrow (e.g., 22:00-06:00)
            tomorrow_weekday = (current_weekday + 1) % 7
            
            # Hours until midnight (same day)
            hours_today = (24 - start_obj.hour - (start_obj.minute / 60))
            
            # Hours after midnight (next day)
            hours_tomorrow = end_obj.hour + (end_obj.minute / 60)
            
            # Handle holidays (all count as 8 weekend hours)
            if is_holiday or is_tomorrow_holiday:
                # If either day is a holiday, entire shift is weekend hours
                weekend_hours = total_hours
                normal_hours = 0.0
            elif current_weekday == 4:  # Friday to Saturday
                # Friday hours are normal, Saturday hours are weekend
                normal_hours = hours_today
                weekend_hours = hours_tomorrow
            elif current_weekday == 5:  # Saturday to Sunday
                # Both are weekend
                normal_hours = 0.0
                weekend_hours = total_hours
            elif current_weekday == 6:  # Sunday to Monday
                # Sunday hours are weekend, Monday hours are normal
                weekend_hours = hours_today
                normal_hours = hours_tomorrow
            else:
                # Weekday to weekday (Mon-Thu to next day)
                normal_hours = total_hours
                weekend_hours = 0.0
        else:
            # Shift is within same day
            if is_holiday or current_weekday >= 5:
                # Holiday or weekend = 8 weekend hours
                weekend_hours = total_hours
                normal_hours = 0.0
            else:
                # Regular weekday
                normal_hours = total_hours
                weekend_hours = 0.0
        
        return normal_hours, weekend_hours
    
    def quick_add_shift(self, start_time, end_time):
        """Quickly add a shift with preset times and save automatically"""
        try:
            date_str = self.calendar.get_date()
            
            # Calculate normal and weekend hours
            normal_hours, weekend_hours = self.calculate_shift_hours(date_str, start_time, end_time)
            total_hours = normal_hours + weekend_hours
            
            # Get current incident values
            sanctions = self.sanctions_entry.get().strip()
            crimes = self.crimes_entry.get().strip()
            wanted = self.wanted_entry.get().strip()
            
            # Save shift
            self.shifts[date_str] = {
                'start': start_time,
                'end': end_time,
                'hours': total_hours,
                'normal_hours': normal_hours,
                'weekend_hours': weekend_hours,
                'sanctions': int(sanctions) if sanctions.isdigit() else 0,
                'crimes': int(crimes) if crimes.isdigit() else 0,
                'wanted': int(wanted) if wanted.isdigit() else 0
            }
            
            self.save_shifts()
            messagebox.showinfo("Succes", f"Schimb salvat! ({normal_hours:.2f}h + {weekend_hours:.2f}h weekend)")
            self.display_shift_for_date(date_str)
            self.update_statistics()
            
            # Update the entry fields to show what was saved
            self.start_time_entry.delete(0, tk.END)
            self.start_time_entry.insert(0, start_time)
            self.end_time_entry.delete(0, tk.END)
            self.end_time_entry.insert(0, end_time)
            
            # Show incident tracking popup
            self.show_incident_popup()
            
        except Exception as e:
            messagebox.showerror("Eroare", f"A apărut o eroare: {str(e)}")
        
    def on_date_selected(self, event=None):
        """Handle calendar date selection"""
        selected = self.calendar.get_date()
        self.selected_date = datetime.strptime(selected, '%Y-%m-%d')
        self.date_label.config(text=f"Date: {selected}")
        self.display_shift_for_date(selected)
        
    def display_shift_for_date(self, date_str):
        """Display shift information for selected date"""
        if date_str in self.shifts:
            shift = self.shifts[date_str]
            start = shift.get('start', 'N/A')
            end = shift.get('end', 'N/A')
            hours = shift.get('hours', 0)
            normal_hours = shift.get('normal_hours', hours)
            weekend_hours = shift.get('weekend_hours', 0)
            
            # Display with normal and weekend hour breakdown
            if weekend_hours > 0:
                self.shift_display.config(
                    text=f"{start} - {end}\n({normal_hours:.2f}h + {weekend_hours:.2f}h weekend)",
                    foreground="green"
                )
            else:
                self.shift_display.config(
                    text=f"{start} - {end}\n({hours:.2f} hours)",
                    foreground="green"
                )
            
            self.start_time_entry.delete(0, tk.END)
            self.start_time_entry.insert(0, start if start != 'N/A' else "")
            self.end_time_entry.delete(0, tk.END)
            self.end_time_entry.insert(0, end if end != 'N/A' else "")
            
            # Update statistics to reflect the new shift data
            self.update_statistics()
        else:
            self.shift_display.config(text="Nicio inregistrare de schimb", foreground="gray")
            self.clear_fields()
            
    def save_shift(self):
        """Save shift for selected date"""
        date_str = self.calendar.get_date()
        start_time = self.start_time_entry.get().strip()
        end_time = self.end_time_entry.get().strip()
        
        if not start_time or not end_time:
            messagebox.showwarning("Eroare Intrare", "Vă rugăm să introduceți ora de început și sfarsit")
            return
            
        try:
            # Validate time format
            datetime.strptime(start_time, '%H:%M')
            datetime.strptime(end_time, '%H:%M')
            
            # Calculate normal and weekend hours
            normal_hours, weekend_hours = self.calculate_shift_hours(date_str, start_time, end_time)
            total_hours = normal_hours + weekend_hours
            
            # Get current incident values
            sanctions = self.sanctions_entry.get().strip()
            crimes = self.crimes_entry.get().strip()
            wanted = self.wanted_entry.get().strip()
            
            self.shifts[date_str] = {
                'start': start_time,
                'end': end_time,
                'hours': total_hours,
                'normal_hours': normal_hours,
                'weekend_hours': weekend_hours,
                'sanctions': int(sanctions) if sanctions.isdigit() else 0,
                'crimes': int(crimes) if crimes.isdigit() else 0,
                'wanted': int(wanted) if wanted.isdigit() else 0
            }
            
            self.save_shifts()
            messagebox.showinfo("Succes", f"Schimb salvat! ({normal_hours:.2f}h + {weekend_hours:.2f}h weekend)")
            self.display_shift_for_date(date_str)
            self.update_statistics()
            
            # Show incident tracking popup
            self.show_incident_popup()
            
        except ValueError:
            messagebox.showerror("Eroare Format", "Vă rugăm să utilizați formatul HH:MM (ex: 09:30)")
            
    def delete_shift(self):
        """Delete shift for selected date"""
        date_str = self.calendar.get_date()
        if date_str in self.shifts:
            self.shifts.pop(date_str)
            self.save_shifts()
            messagebox.showinfo("Succes", "Schimb șters")
            self.display_shift_for_date(date_str)
            self.update_statistics()
        else:
            messagebox.showwarning("Nicio Inregistrare", "Nicio inregistrare de schimb pentru această dată")
            
    def clear_fields(self):
        """Clear input fields"""
        self.start_time_entry.delete(0, tk.END)
        self.end_time_entry.delete(0, tk.END)
    
    def show_incident_popup(self):
        """Show popup to record incidents for the shift"""
        incident_window = tk.Toplevel(self.root)
        incident_window.title("Înregistrare Evenimente")
        incident_window.geometry("500x300")
        incident_window.resizable(False, False)
        
        # Main frame
        main_frame = ttk.Frame(incident_window, padding="20")
        main_frame.pack(fill="both", expand=True)
        
        ttk.Label(main_frame, text="Introduceți evenimentele din timpul schimbului:", 
                  font=("Arial", 12, "bold")).pack(pady=10)
        
        # Frame for three columns
        columns_frame = ttk.Frame(main_frame)
        columns_frame.pack(fill="both", expand=True, pady=10)
        
        # Column 1 - Sancțiuni
        sanctions_col = ttk.LabelFrame(columns_frame, text="Sancțiuni Constatate", padding="10")
        sanctions_col.pack(side="left", fill="both", expand=True, padx=5)
        
        ttk.Label(sanctions_col, text="Număr:", font=("Arial", 10)).pack(anchor="w")
        sanctions_popup_entry = ttk.Entry(sanctions_col, font=("Arial", 10), width=15)
        sanctions_popup_entry.pack(anchor="w", fill="x", pady=5)
        
        # Column 2 - Infracțiuni
        crimes_col = ttk.LabelFrame(columns_frame, text="Infracțiuni Constatate", padding="10")
        crimes_col.pack(side="left", fill="both", expand=True, padx=5)
        
        ttk.Label(crimes_col, text="Număr:", font=("Arial", 10)).pack(anchor="w")
        crimes_popup_entry = ttk.Entry(crimes_col, font=("Arial", 10), width=15)
        crimes_popup_entry.pack(anchor="w", fill="x", pady=5)
        
        # Column 3 - Persoane Urmărite
        wanted_col = ttk.LabelFrame(columns_frame, text="Persoane Urmărite Depistate", padding="10")
        wanted_col.pack(side="left", fill="both", expand=True, padx=5)
        
        ttk.Label(wanted_col, text="Număr:", font=("Arial", 10)).pack(anchor="w")
        wanted_popup_entry = ttk.Entry(wanted_col, font=("Arial", 10), width=15)
        wanted_popup_entry.pack(anchor="w", fill="x", pady=5)
        
        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.pack(fill="x", pady=10)
        
        def save_incidents():
            sanctions_val = sanctions_popup_entry.get().strip()
            crimes_val = crimes_popup_entry.get().strip()
            wanted_val = wanted_popup_entry.get().strip()
            
            # Update main window fields
            self.sanctions_entry.delete(0, tk.END)
            if sanctions_val:
                self.sanctions_entry.insert(0, sanctions_val)
            
            self.crimes_entry.delete(0, tk.END)
            if crimes_val:
                self.crimes_entry.insert(0, crimes_val)
            
            self.wanted_entry.delete(0, tk.END)
            if wanted_val:
                self.wanted_entry.insert(0, wanted_val)
            
            # Save incidents to database
            date_str = self.calendar.get_date()
            if date_str in self.shifts:
                self.shifts[date_str]['sanctions'] = int(sanctions_val) if sanctions_val.isdigit() else 0
                self.shifts[date_str]['crimes'] = int(crimes_val) if crimes_val.isdigit() else 0
                self.shifts[date_str]['wanted'] = int(wanted_val) if wanted_val.isdigit() else 0
                self.save_shifts()
                self.update_statistics()
            
            incident_window.destroy()
        
        ttk.Button(button_frame, text="Salvare", command=save_incidents).pack(side="left", fill="x", expand=True, padx=2)
        ttk.Button(button_frame, text="Anulare", command=incident_window.destroy).pack(side="left", fill="x", expand=True, padx=2)
        
    def update_statistics(self):
        """Update work hours and incident statistics"""
        current_month = datetime.now().month
        current_year = datetime.now().year
        
        monthly_hours = 0
        monthly_weekend_hours = 0
        total_hours = 0
        total_weekend_hours = 0
        
        # Incident counters
        monthly_sanctions = 0
        monthly_crimes = 0
        monthly_wanted = 0
        total_sanctions = 0
        total_crimes = 0
        total_wanted = 0
        
        for date_str, shift in self.shifts.items():
            hours = shift.get('hours', 0)
            # Use the pre-calculated weekend_hours if available, otherwise calculate from date
            weekend_hours = shift.get('weekend_hours', 0)
            normal_hours = shift.get('normal_hours', hours)
            
            total_hours += hours
            total_weekend_hours += weekend_hours
            
            # Get incident counts
            sanctions = shift.get('sanctions', 0)
            crimes = shift.get('crimes', 0)
            wanted = shift.get('wanted', 0)
            total_sanctions += sanctions
            total_crimes += crimes
            total_wanted += wanted
            
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                
                if date_obj.month == current_month and date_obj.year == current_year:
                    monthly_hours += hours
                    monthly_weekend_hours += weekend_hours
                    monthly_sanctions += sanctions
                    monthly_crimes += crimes
                    monthly_wanted += wanted
            except:
                pass
                
        # Update hour labels
        self.monthly_hours_label.config(text=f"{monthly_hours:.2f} hours")
        self.monthly_weekend_label.config(text=f"{monthly_weekend_hours:.2f} hours")
        self.total_hours_label.config(text=f"{total_hours:.2f} hours")
        self.total_weekend_label.config(text=f"{total_weekend_hours:.2f} hours")
        
        # Update incident labels (S: Sancțiuni, I: Infracțiuni, P: Persoane)
        self.monthly_sanctions_label.config(text=str(monthly_sanctions))
        self.monthly_crimes_label.config(text=str(monthly_crimes))
        self.monthly_wanted_label.config(text=str(monthly_wanted))
        
        self.total_sanctions_label.config(text=str(total_sanctions))
        self.total_crimes_label.config(text=str(total_crimes))
        self.total_wanted_label.config(text=str(total_wanted))
    
    def delete_month(self):
        """Delete all shifts for a selected month/year"""
        # Create a new window for month selection
        delete_window = tk.Toplevel(self.root)
        delete_window.title("Ștergere Înregistrări Luna/An")
        delete_window.geometry("500x350")
        
        frame = ttk.Frame(delete_window, padding="20")
        frame.pack(fill="both", expand=True)
        
        ttk.Label(frame, text="Selectați anul și luna pentru ștergere:", font=("Arial", 14, "bold")).pack(pady=15)
        
        # Year selection
        ttk.Label(frame, text="Anul:", font=("Arial", 11)).pack(anchor="w", pady=(10, 5))
        year_var = tk.StringVar(value=str(datetime.now().year))
        year_spin = ttk.Spinbox(frame, from_=2000, to=2099, textvariable=year_var, width=15, font=("Arial", 11))
        year_spin.pack(anchor="w", pady=5, fill="x")
        
        # Month selection
        ttk.Label(frame, text="Luna:", font=("Arial", 11)).pack(anchor="w", pady=(15, 5))
        month_var = tk.StringVar(value=str(datetime.now().month))
        months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
        month_combo = ttk.Combobox(frame, textvariable=month_var, values=months, state="readonly", width=22, font=("Arial", 11))
        month_combo.current(datetime.now().month - 1)
        month_combo.pack(anchor="w", pady=5, fill="x")
        
        def perform_delete():
            month_name = month_var.get()
            months_list = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                           "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
            month = months_list.index(month_name) + 1
            self._delete_month_backend(int(year_var.get()), month)
            delete_window.destroy()
        
        def delete_year():
            self._delete_year_backend(int(year_var.get()))
            delete_window.destroy()
        
        # Button frame
        button_frame = ttk.Frame(frame)
        button_frame.pack(pady=30, fill="x")
        
        ttk.Button(button_frame, text="Ștergere Luna Selectată", command=perform_delete).pack(side="left", padx=5, fill="x", expand=True)
        ttk.Button(button_frame, text="Ștergere Anul", command=delete_year).pack(side="left", padx=5, fill="x", expand=True)
        ttk.Button(button_frame, text="Anulare", command=delete_window.destroy).pack(side="left", padx=5, fill="x", expand=True)
    
    def _delete_month_backend(self, year, month):
        """Backend function to delete a month"""
        months = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                  "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
        try:
            # Find and delete all shifts in selected month
            dates_to_delete = []
            for date_str in self.shifts.keys():
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    if date_obj.month == month and date_obj.year == year:
                        dates_to_delete.append(date_str)
                except:
                    pass
            
            if dates_to_delete:
                if messagebox.askyesno("Confirmare", f"Ștergeți {len(dates_to_delete)} schimburi din {months[month-1]}?"):
                    for date_str in dates_to_delete:
                        self.shifts.pop(date_str)
                    self.save_shifts()
                    messagebox.showinfo("Succes", f"Șterse {len(dates_to_delete)} înregistrări")
                    self.display_shift_for_date(self.calendar.get_date())
                    self.update_statistics()
            else:
                messagebox.showinfo("Nicio Înregistrare", f"Nicio inregistrare găsită pentru {months[month-1]}")
        except Exception as e:
            messagebox.showerror("Eroare", f"A apărut o eroare: {str(e)}")
    
    def _delete_year_backend(self, year):
        """Backend function to delete a year"""
        try:
            # Find and delete all shifts in selected year
            dates_to_delete = []
            for date_str in self.shifts.keys():
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    if date_obj.year == year:
                        dates_to_delete.append(date_str)
                except:
                    pass
            
            if dates_to_delete:
                if messagebox.askyesno("Confirmare", f"Ștergeți toate {len(dates_to_delete)} schimburile din {year}?"):
                    if messagebox.askyesno("Confirmare Finală", f"Ștergeți {len(dates_to_delete)} schimburi?"):
                        for date_str in dates_to_delete:
                            self.shifts.pop(date_str)
                        self.save_shifts()
                        messagebox.showinfo("Succes", f"Șterse {len(dates_to_delete)} schimburi din {year}")
                        self.display_shift_for_date(self.calendar.get_date())
                        self.update_statistics()
            else:
                messagebox.showinfo("Nicio Înregistrare", f"Nicio inregistrare găsită pentru {year}")
        except Exception as e:
            messagebox.showerror("Eroare", f"A apărut o eroare: {str(e)}")
    
    def delete_all(self):
        """Delete all recorded shifts"""
        if not messagebox.askyesno("Confirmare", "Sunteți sigur că doriți să ștergeți TOATE schimburile? Aceasta nu poate fi anulată!"):
            return
        
        if not messagebox.askyesno("Confirmare Finală", "Ștergeți permanent TOATE schimburile?"):
            return
        
        count = len(self.shifts)
        self.shifts.clear()
        self.save_shifts()
        messagebox.showinfo("Succes", f"Șterse toate {count} schimburi")
        self.display_shift_for_date(self.calendar.get_date())
        self.update_statistics()
        
    def view_all_shifts(self):
        """Display all recorded shifts sorted by year and month with delete option"""
        if not self.shifts:
            messagebox.showinfo("Nicio Inregistrare", "Nicio inregistrare de schimb deocamdată")
            return
            
        # Create new window
        view_window = tk.Toplevel(self.root)
        view_window.title("Toate Schimburile")
        view_window.geometry("700x550")
        
        months = ["1 - Ianuarie", "2 - Februarie", "3 - Martie", "4 - Aprilie", "5 - Mai", "6 - Iunie",
                  "7 - Iulie", "8 - August", "9 - Septembrie", "10 - Octombrie", "11 - Noiembrie", "12 - Decembrie"]
        
        # Treeview with grouping
        frame = ttk.Frame(view_window, padding="10")
        frame.pack(fill="both", expand=True)
        
        columns = ("Data", "Inceput", "Sfarsit", "Ore")
        tree = ttk.Treeview(frame, columns=columns, height=20)
        tree.column("#0", width=0, stretch=tk.NO)
        tree.column("Data", anchor=tk.W, width=120)
        tree.column("Inceput", anchor=tk.W, width=80)
        tree.column("Sfarsit", anchor=tk.W, width=80)
        tree.column("Ore", anchor=tk.W, width=80)
        
        tree.heading("#0", text="", anchor=tk.W)
        tree.heading("Data", text="Data", anchor=tk.W)
        tree.heading("Inceput", text="Inceput", anchor=tk.W)
        tree.heading("Sfarsit", text="Sfarsit", anchor=tk.W)
        tree.heading("Ore", text="Ore", anchor=tk.W)
        
        # Sort by date and group by month (across all years)
        sorted_dates = sorted(self.shifts.keys())
        
        # Create a dictionary to group by month
        months_dict = {}
        month_names = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                       "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
        
        # Initialize all months
        for month_idx in range(1, 13):
            months_dict[month_idx] = []
        
        # Group shifts by month
        for date_str in sorted_dates:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            month_num = date_obj.month
            months_dict[month_num].append(date_str)
        
        # Add to treeview grouped by month
        for month_num in range(1, 13):
            dates_in_month = months_dict[month_num]
            
            if dates_in_month:  # Only show months with data
                month_header_text = month_names[month_num - 1]
                month_id = tree.insert("", "end", text=month_header_text, values=("", "", "", ""), 
                                       tags=("header",))
                
                # Add all shifts in this month (sorted by date)
                for date_str in sorted(dates_in_month):
                    shift = self.shifts[date_str]
                    tree.insert(month_id, "end", text="",
                               values=(date_str, shift['start'], shift['end'], f"{shift['hours']:.2f}"))
        
        # Style headers
        tree.tag_configure("header", background="lightblue", font=("Arial", 10, "bold"))
        
        tree.pack(fill="both", expand=True, side="left")
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(frame, orient="vertical", command=tree.yview)
        scrollbar.pack(side="right", fill="y")
        tree.config(yscrollcommand=scrollbar.set)
        
        # Delete options frame at the bottom
        delete_frame = ttk.LabelFrame(view_window, text="Optiuni Ștergere", padding="15")
        delete_frame.pack(fill="x", padx=10, pady=10)
        
        # Year and Month selection
        select_frame = ttk.Frame(delete_frame)
        select_frame.pack(fill="x", pady=5)
        
        ttk.Label(select_frame, text="Anul:", font=("Arial", 10)).pack(side="left", padx=5)
        year_delete_var = tk.StringVar(value=str(datetime.now().year))
        year_spin = ttk.Spinbox(select_frame, from_=2000, to=2099, textvariable=year_delete_var, width=8, font=("Arial", 10))
        year_spin.pack(side="left", padx=2)
        
        ttk.Label(select_frame, text="Luna:", font=("Arial", 10)).pack(side="left", padx=5)
        month_delete_var = tk.StringVar(value="1")
        month_combo = ttk.Combobox(select_frame, textvariable=month_delete_var, 
                                    values=["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                                            "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"], 
                                    state="readonly", width=15, font=("Arial", 10))
        month_combo.current(0)
        month_combo.pack(side="left", padx=2)
        
        # Delete buttons
        button_frame = ttk.Frame(delete_frame)
        button_frame.pack(fill="x", pady=5)
        
        def delete_selected_month():
            try:
                year = int(year_delete_var.get())
                month_name = month_delete_var.get()
                # Convert month name to month number
                month_names_for_delete = ["Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                                          "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"]
                month = month_names_for_delete.index(month_name) + 1
                self._delete_month_backend(year, month)
                view_window.destroy()
            except Exception as e:
                messagebox.showerror("Eroare", f"A apărut o eroare: {str(e)}")
        
        def delete_selected_year():
            try:
                year = int(year_delete_var.get())
                self._delete_year_backend(year)
                view_window.destroy()
            except Exception as e:
                messagebox.showerror("Eroare", f"A apărut o eroare: {str(e)}")
        
        def delete_all_shifts():
            if not messagebox.askyesno("Confirmare", "Suneți sigur că doriți să ștergeți TOATE schimburile? Aceasta nu poate fi anulată!"):
                return
            
            if not messagebox.askyesno("Confirmare Finală", "Ștergeți permanent TOATE schimburile?"):
                return
            
            count = len(self.shifts)
            self.shifts.clear()
            self.save_shifts()
            messagebox.showinfo("Succes", f"Șterse toate {count} schimburi")
            self.display_shift_for_date(self.calendar.get_date())
            self.update_statistics()
            view_window.destroy()
        
        ttk.Button(button_frame, text="Ștergere Luna Selectată", command=delete_selected_month).pack(side="left", padx=5, fill="x", expand=True)
        ttk.Button(button_frame, text="Ștergere Anul", command=delete_selected_year).pack(side="left", padx=5, fill="x", expand=True)
        ttk.Button(button_frame, text="Ștergere Toate Schimburile", command=delete_all_shifts).pack(side="left", padx=5, fill="x", expand=True)
        
    def load_shifts(self):
        """Load shifts from JSON file"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r') as f:
                    return json.load(f)
            except:
                return {}
        return {}
        
    def save_shifts(self):
        """Save shifts to JSON file"""
        with open(self.data_file, 'w') as f:
            json.dump(self.shifts, f, indent=2)

if __name__ == "__main__":
    root = tk.Tk()
    app = ShiftCalendarApp(root)
    root.mainloop()

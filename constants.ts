import { Role, UserAccount, UserProfile, KpiMaster, KpiScoring, FeedbackCoaching, SelfAssessment, DepartmentDetails, AbsenceType, AttendanceRecord, EmployeeSchedule, ScheduleStatus, ScheduleDayDetails } from './types';

export const USERS: UserAccount[] = [
  { email: 'admin@hotel.com', role: Role.Admin, passcode: '123', employeeId: 'E000' },
  { email: 'fo.head@hotel.com', role: Role.DeptHead, department: 'Front Office', passcode: '123', employeeId: 'E100' },
  { email: 'hk.head@hotel.com', role: Role.DeptHead, department: 'Housekeeping', passcode: '123', employeeId: 'E200' },
  { email: 'john.doe@hotel.com', role: Role.Employee, department: 'Front Office', passcode: '123', employeeId: 'E101' },
  { email: 'jane.smith@hotel.com', role: Role.Employee, department: 'Housekeeping', passcode: '123', employeeId: 'E201' },
  { email: 'alice.j@hotel.com', role: Role.Employee, department: 'Front Office', passcode: '123', employeeId: 'E102' },

];

export let USER_PROFILES: UserProfile[] = [
  { employeeId: 'E000', name: 'Admin User', department: 'HRD', position: 'HR Director', email: 'admin@hotel.com', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=E000', joinDate: '2020-01-15', phone: '0812-3456-7890', skillLevel: 'Advanced', supervisorId: '' },
  { employeeId: 'E100', name: 'David Chen', department: 'Front Office', position: 'Front Office Manager', email: 'fo.head@hotel.com', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=E100', joinDate: '2021-03-20', phone: '0812-3456-7891', supervisorId: 'E000', emergencyContact: { name: 'Emily Chen', phone: '0811-2222-3333', relation: 'Spouse' }, skillLevel: 'Advanced' },
  { employeeId: 'E101', name: 'John Doe', department: 'Front Office', position: 'Receptionist', email: 'john.doe@hotel.com', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=E101', joinDate: '2022-06-01', phone: '0812-3456-7892', supervisorId: 'E100', certifications: ['Certified Guest Service Professional'], skillLevel: 'Intermediate' },
  { employeeId: 'E102', name: 'Alice Johnson', department: 'Front Office', position: 'Concierge', email: 'alice.j@hotel.com', status: 'Probation', avatar: 'https://i.pravatar.cc/150?u=E102', joinDate: '2023-10-15', phone: '0812-3456-7893', supervisorId: 'E100', skillLevel: 'Basic' },
  { employeeId: 'E200', name: 'Maria Garcia', department: 'Housekeeping', position: 'Executive Housekeeper', email: 'hk.head@hotel.com', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=E200', joinDate: '2019-11-05', phone: '0812-3456-7894', supervisorId: 'E000', emergencyContact: { name: 'Carlos Garcia', phone: '0844-5555-6666', relation: 'Spouse' }, skillLevel: 'Advanced' },
  { employeeId: 'E201', name: 'Jane Smith', department: 'Housekeeping', position: 'Room Attendant', email: 'jane.smith@hotel.com', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=E201', joinDate: '2023-01-10', phone: '0812-3456-7895', supervisorId: 'E200', certifications: ['WHMIS 2015'], skillLevel: 'Intermediate' },
];

export let DEPARTMENTS: DepartmentDetails[] = [
    { departmentId: 'D01', name: 'Front Office', code: 'FO', headId: 'E100', description: 'Handles guest arrivals, departures, and inquiries.', status: 'Active' },
    { departmentId: 'D02', name: 'Housekeeping', code: 'HK', headId: 'E200', description: 'Maintains cleanliness and appearance of the hotel.', status: 'Active' },
    { departmentId: 'D03', name: 'F&B Service', code: 'FNB', headId: '', description: 'Manages all food and beverage services.', status: 'Active' },
    { departmentId: 'D04', name: 'Engineering', code: 'ENG', headId: '', description: 'Responsible for maintenance of the hotel property.', status: 'Inactive' },
    { departmentId: 'D05', name: 'Sales & Marketing', code: 'SM', headId: '', description: 'Drives sales and marketing initiatives.', status: 'Active' },
    { departmentId: 'D06', name: 'HRD', code: 'HRD', headId: 'E000', description: 'Manages human resources and employee relations.', status: 'Active' },
];

export let DEPARTMENT_POSITIONS: Record<string, string[]> = {
    'Front Office': ['Front Office Manager', 'Receptionist', 'Concierge', 'Bell Captain'],
    'Housekeeping': ['Executive Housekeeper', 'Room Attendant', 'Public Area Attendant', 'Laundry Supervisor'],
    'F&B Service': ['F&B Manager', 'Waiter/Waitress', 'Bartender', 'Chef de Partie'],
    'Engineering': ['Chief Engineer', 'Technician', 'Plumber'],
    'Sales & Marketing': ['Sales Manager', 'Marketing Executive', 'Reservations Agent'],
    'HRD': ['HR Director', 'HR Coordinator', 'Training Manager'],
};


// Changed to let to allow for mock API updates
export let KPI_MASTER: KpiMaster[] = [
  { kpiId: 'K_AUTO_ATT', department: 'All', kpiName: 'Punctuality', description: 'Auto-calculated based on attendance records.', weight: 10 },
  { kpiId: 'K01', department: 'Front Office', kpiName: 'Guest Satisfaction', description: 'Score from guest surveys', weight: 40 },
  { kpiId: 'K02', department: 'Front Office', kpiName: 'Grooming', description: 'Adherence to uniform standards', weight: 20 },
  { kpiId: 'K03', department: 'Front Office', kpiName: 'Accuracy Check-in/out', description: 'Error rate in registration process', weight: 20 },
  { kpiId: 'K04', department: 'Front Office', kpiName: 'Complaint Handling', description: 'Effective resolution of guest issues', weight: 10 },
  { kpiId: 'K05', department: 'Housekeeping', kpiName: 'Room Quality', description: 'Cleanliness and preparation score', weight: 50 },
  { kpiId: 'K06', department: 'Housekeeping', kpiName: 'Speed', description: 'Time taken per room', weight: 20 },
  { kpiId: 'K07', department: 'Housekeeping', kpiName: 'Linen Usage', description: 'Efficient use of linens', weight: 10 },
  { kpiId: 'K08', department: 'Housekeeping', kpiName: 'Checklist Completion', description: '100% completion of room checklist', weight: 10 },
];

export let KPI_SCORING: KpiScoring[] = [];
export let FEEDBACK_COACHING: FeedbackCoaching[] = [];
export let SELF_ASSESSMENT: SelfAssessment[] = [];
export let ATTENDANCE_RECORDS: AttendanceRecord[] = [];
export let SCHEDULE_RECORDS: EmployeeSchedule[] = [];


// --- DYNAMIC DATA GENERATION ---
export const WORK_START_TIME = { hours: 9, minutes: 0 }; // Default start time, now used as a fallback

const generateDynamicData = () => {
    const now = new Date();
    const employees = USER_PROFILES.filter(profile => {
        const user = USERS.find(u => u.employeeId === profile.employeeId);
        return user && user.role !== Role.Admin;
    });
    
    // Clear existing dynamic data
    KPI_SCORING.length = 0;
    FEEDBACK_COACHING.length = 0;
    SELF_ASSESSMENT.length = 0;
    ATTENDANCE_RECORDS.length = 0;
    SCHEDULE_RECORDS.length = 0;

    // Generate data for the current month and the past two months
    for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
        const dateIterator = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
        const year = dateIterator.getFullYear();
        const month = dateIterator.getMonth();
        const monthStr = `${year}-${(month + 1).toString().padStart(2, '0')}`;
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // --- Generate Schedules for all months to allow historical attendance calculation ---
        employees.forEach(employee => {
            const schedule: Record<string, ScheduleDayDetails> = {};
            for (let day = 1; day <= daysInMonth; day++) {
                const dayStr = day.toString().padStart(2, '0');
                const dayDate = new Date(year, month, day);
                const dayOfWeek = dayDate.getDay();
                let status = (dayOfWeek === 0 || dayOfWeek === 6) ? ScheduleStatus.DayOff : ScheduleStatus.Workday;
                
                // Special case for Jane Smith - give her a day off on the 3rd
                if (employee.employeeId === 'E201' && day === 3) {
                    status = ScheduleStatus.DayOff;
                }

                if (status === ScheduleStatus.Workday) {
                    // John Doe has an evening shift on the 5th
                    if (employee.employeeId === 'E101' && day === 5) {
                         schedule[dayStr] = { status, startTime: '14:00', endTime: '22:00' };
                    } else {
                         schedule[dayStr] = { status, startTime: '09:00', endTime: '17:00' };
                    }
                } else {
                    schedule[dayStr] = { status };
                }
            }
             SCHEDULE_RECORDS.push({
                scheduleId: `SCH_${employee.employeeId}_${monthStr}`,
                employeeId: employee.employeeId,
                month: monthStr,
                schedule
            });
        });
        
        // --- Generate Attendance & KPI scores for each employee ---
        employees.forEach(employee => {
            const departmentKpis = KPI_MASTER.filter(k => k.department === employee.department || k.department === 'All');
            const manualKpis = departmentKpis.filter(k => k.kpiId !== 'K_AUTO_ATT');

            let lateDaysInMonth = 0;
            const isCurrentMonth = monthOffset === 0;
            const lastDayToProcess = isCurrentMonth ? now.getDate() : daysInMonth;
            const employeeSchedule = SCHEDULE_RECORDS.find(s => s.employeeId === employee.employeeId && s.month === monthStr);

            // Generate daily attendance records
            for (let day = 1; day <= lastDayToProcess; day++) {
                const dayStr = day.toString().padStart(2, '0');
                const dateStr = `${monthStr}-${dayStr}`;
                const daySchedule = employeeSchedule?.schedule[dayStr];

                if (daySchedule && daySchedule.status === ScheduleStatus.Workday && daySchedule.startTime) {
                    let lateMinutes = 0;
                    let absenceType = AbsenceType.Present;
                    const [startHours, startMinutes] = daySchedule.startTime.split(':').map(Number);
                    
                    // Alice Johnson (E102) has perfect attendance
                    if (employee.employeeId === 'E102') {
                        lateMinutes = 0;
                    } 
                    // John Doe (E101) is sometimes late
                    else if (employee.employeeId === 'E101' && (day % 4 === 0) && lateDaysInMonth < 2) {
                        lateMinutes = 15 + Math.floor(Math.random() * 15);
                        absenceType = AbsenceType.Late;
                        lateDaysInMonth++;
                    } 
                    // Others have a small chance of being late
                    else if (Math.random() < 0.05) {
                        lateMinutes = 5 + Math.floor(Math.random() * 10);
                        absenceType = AbsenceType.Late;
                    }

                    const checkInDate = new Date(year, month, day, startHours, startMinutes + lateMinutes);
                    const checkOutDate = new Date(year, month, day, startHours + 8, startMinutes + lateMinutes + Math.floor(Math.random() * 15));
                    
                    ATTENDANCE_RECORDS.push({
                        attendanceId: `A_${employee.employeeId}_${dateStr}`,
                        employeeId: employee.employeeId,
                        date: dateStr,
                        checkIn: checkInDate.toISOString(),
                        checkOut: checkOutDate.toISOString(),
                        lateMinutes: lateMinutes,
                        totalHours: 8,
                        absenceType: absenceType,
                        checkInMethod: 'GPS',
                        checkOutMethod: 'GPS'
                    });
                }
            }

            // Generate KPI scores
            manualKpis.forEach(kpi => {
                KPI_SCORING.push({
                    scoreId: `S_${employee.employeeId}_${kpi.kpiId}_${monthStr}`,
                    employeeId: employee.employeeId,
                    month: monthStr,
                    kpiId: kpi.kpiId,
                    score: 3 + Math.floor(Math.random() * 3), // Score between 3 and 5
                    notes: 'Good performance this month.',
                    evaluatedBy: employee.supervisorId || 'E000'
                });
            });
        });
        
        // --- Generate Feedback & Self-Assessments for last month ---
        if (monthOffset === 1) { // Previous month
            FEEDBACK_COACHING.push({
                feedbackId: 'F01_dynamic', employeeId: 'E101', month: monthStr, feedbackText: 'Great job with the guest check-ins last month.', coachingPlan: 'Keep up the good work.', by: 'E100', timestamp: new Date().toISOString()
            });
             SELF_ASSESSMENT.push({
                saId: 'SA01_dynamic', employeeId: 'E101', month: monthStr, strengths: 'Handled guest inquiries effectively.', weaknesses: 'Need to improve speed with the new system.'
            });
        }
    }
};

// Initialize data on load
generateDynamicData();
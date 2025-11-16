
import { Role, UserAccount, UserProfile, KpiMaster, KpiScoring, FeedbackCoaching, SelfAssessment, DepartmentDetails, AttendanceRecord, AbsenceType, KpiAttendanceScore, EmployeeSchedule, ScheduleStatus, ScheduleDayDetails, CareerPathRecommendation, DepartmentAnalyticsData, AIAnalyticsInsight, AICoachingSummary, ChatMessage } from '../types';
import { USERS, USER_PROFILES, KPI_MASTER, KPI_SCORING, FEEDBACK_COACHING, SELF_ASSESSMENT, DEPARTMENTS, DEPARTMENT_POSITIONS, ATTENDANCE_RECORDS, SCHEDULE_RECORDS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

// Simulate API delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getEmployeeById = async (id: string): Promise<UserProfile | undefined> => {
    await delay(100);
    return USER_PROFILES.find(e => e.employeeId === id);
}

export const getUserByEmail = async (email: string): Promise<UserAccount | undefined> => {
    await delay(100);
    return USERS.find(u => u.email === email);
}

export const getUsers = async (): Promise<UserAccount[]> => {
    await delay(100);
    return USERS;
}

export const getTeamByDepartment = async (department: string): Promise<UserProfile[]> => {
    await delay(200);
    const usersInDept = USER_PROFILES.filter(e => e.department === department);
    // Exclude Department Heads and Admins from team lists
    const teamMembers = usersInDept.filter(profile => {
        const user = USERS.find(u => u.employeeId === profile.employeeId);
        return user && user.role === Role.Employee;
    });
    return teamMembers;
}

export const getAllEmployees = async (): Promise<UserProfile[]> => {
    await delay(200);
    // Filter out the admin user from general employee lists
    return USER_PROFILES.filter(p => {
        const user = USERS.find(u => u.employeeId === p.employeeId);
        return user && user.role !== Role.Admin;
    });
}

export const getKpisByDepartment = async (department: string): Promise<KpiMaster[]> => {
    await delay(150);
    const departmentKpis = KPI_MASTER.filter(k => k.department === department);
    const allKpis = KPI_MASTER.filter(k => k.department === 'All');
    return [...allKpis, ...departmentKpis];
}

export const getAllKpis = async (): Promise<KpiMaster[]> => {
    await delay(150);
    return [...KPI_MASTER];
}

export const getScoresForEmployee = async (employeeId: string): Promise<KpiScoring[]> => {
    await delay(250);
    return KPI_SCORING.filter(s => s.employeeId === employeeId);
}

export const getFeedbackForEmployee = async (employeeId: string): Promise<FeedbackCoaching[]> => {
    await delay(200);
    return FEEDBACK_COACHING.filter(f => f.employeeId === employeeId);
}

export const getSelfAssessmentForEmployee = async (employeeId: string, month: string): Promise<SelfAssessment | undefined> => {
    await delay(200);
    return SELF_ASSESSMENT.find(sa => sa.employeeId === employeeId && sa.month === month);
}

export const submitSelfAssessment = async (assessmentData: Omit<SelfAssessment, 'saId' | 'attachments'>): Promise<SelfAssessment> => {
    await delay(300);
    const newAssessment: SelfAssessment = {
        ...assessmentData,
        saId: `SA${Date.now()}`,
    };
    SELF_ASSESSMENT.push(newAssessment);
    return newAssessment;
};

export const submitKpiScores = async (evaluatorId: string, employeeId: string, month: string, scores: Array<{ kpiId: string; score: number; notes: string }>): Promise<boolean> => {
    await delay(400);
    // Remove old scores for the same employee and month to avoid duplicates
    const otherScores = KPI_SCORING.filter(s => !(s.employeeId === employeeId && s.month === month));
    
    const newScores: KpiScoring[] = scores
        .filter(scoreData => scoreData.score > 0) // Only add scores that have been set
        .map(scoreData => ({
            scoreId: `S${Date.now()}${Math.random()}`,
            employeeId: employeeId,
            month: month,
            kpiId: scoreData.kpiId,
            score: scoreData.score,
            notes: scoreData.notes,
            evaluatedBy: evaluatorId,
        }));

    KPI_SCORING.splice(0, KPI_SCORING.length, ...otherScores, ...newScores);
    return true;
};

export const submitFeedback = async (feedbackData: Omit<FeedbackCoaching, 'feedbackId' | 'timestamp'>): Promise<FeedbackCoaching> => {
    await delay(300);
    const newFeedback: FeedbackCoaching = {
        ...feedbackData,
        feedbackId: `F${Date.now()}`,
        timestamp: new Date().toISOString(),
    };
    FEEDBACK_COACHING.unshift(newFeedback); // Add to the beginning of the array
    return newFeedback;
};


export const calculateKpiScoreForMonth = (scores: KpiScoring[], kpis: KpiMaster[], month: string, attendanceScore?: KpiAttendanceScore): number => {
    const monthScores = scores.filter(s => s.month === month);
    let totalScore = 0;
    let totalWeight = 0;

    // Manual scores
    monthScores.forEach(score => {
        const kpi = kpis.find(k => k.kpiId === score.kpiId);
        if (kpi && kpi.kpiId !== 'K_AUTO_ATT') {
            totalScore += (score.score / 5) * kpi.weight;
            totalWeight += kpi.weight;
        }
    });

    // Add auto-calculated attendance score
    const attendanceKpi = kpis.find(k => k.kpiId === 'K_AUTO_ATT');
    if (attendanceKpi && attendanceScore) {
        totalScore += (attendanceScore.finalScore / 5) * attendanceKpi.weight;
        totalWeight += attendanceKpi.weight;
    }

    if (totalWeight > 100) totalWeight = 100; // Cap weight at 100
    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
};

export const addKpi = async (kpi: Omit<KpiMaster, 'kpiId'>): Promise<KpiMaster> => {
    await delay(100);
    const newKpi: KpiMaster = { ...kpi, kpiId: `K${Math.floor(Math.random() * 1000)}` };
    KPI_MASTER.push(newKpi);
    return newKpi;
};

export const updateKpi = async (updatedKpi: KpiMaster): Promise<KpiMaster> => {
    await delay(100);
    const index = KPI_MASTER.findIndex(k => k.kpiId === updatedKpi.kpiId);
    if (index !== -1) {
        KPI_MASTER[index] = updatedKpi;
    }
    return updatedKpi;
};

export const updateUserProfile = async (updatedProfile: UserProfile): Promise<UserProfile> => {
    await delay(300);
    const index = USER_PROFILES.findIndex(p => p.employeeId === updatedProfile.employeeId);
    if (index !== -1) {
        USER_PROFILES[index] = updatedProfile;
        alert(`AUTOMATION: Profile for ${updatedProfile.name} updated. Notification sent to employee and HR.`);
    }
    return updatedProfile;
};

// Department Management APIs
export const getDepartments = async (): Promise<Array<DepartmentDetails & { employeeCount: number }>> => {
    await delay(200);
    return DEPARTMENTS.map(dept => ({
        ...dept,
        employeeCount: USER_PROFILES.filter(emp => emp.department === dept.name).length,
    }));
};

export const addDepartment = async (dept: Omit<DepartmentDetails, 'departmentId'>): Promise<DepartmentDetails> => {
    await delay(300);
    const newDept: DepartmentDetails = {
        ...dept,
        departmentId: `D${Date.now()}`,
    };
    DEPARTMENTS.push(newDept);
    DEPARTMENT_POSITIONS[newDept.name] = [];
    
    const userAccount = USERS.find(u => u.employeeId === newDept.headId);
    if (userAccount && userAccount.role !== Role.DeptHead) {
        userAccount.role = Role.DeptHead;
        userAccount.department = newDept.name;
        alert(`AUTOMATION: User ${userAccount.email} role updated to Department Head. A new passcode has been sent to their email.`);
    }
    return newDept;
};

export const updateDepartment = async (updatedDept: DepartmentDetails): Promise<DepartmentDetails> => {
    await delay(300);
    const index = DEPARTMENTS.findIndex(d => d.departmentId === updatedDept.departmentId);

    if (index !== -1) {
        const oldDept = DEPARTMENTS[index];
        const departmentNameChanged = oldDept.name !== updatedDept.name;

        if (departmentNameChanged) {
            DEPARTMENT_POSITIONS[updatedDept.name] = DEPARTMENT_POSITIONS[oldDept.name] || [];
            delete DEPARTMENT_POSITIONS[oldDept.name];
            USER_PROFILES.forEach(p => { if (p.department === oldDept.name) p.department = updatedDept.name; });
            USERS.forEach(u => { if (u.department === oldDept.name) u.department = updatedDept.name; });
            KPI_MASTER.forEach(k => { if (k.department === oldDept.name) k.department = updatedDept.name; });
        }
        
        if (oldDept.headId !== updatedDept.headId) {
            alert(`AUTOMATION: Notification sent to new department head for ${updatedDept.name}.`);
            const newUserAccount = USERS.find(u => u.employeeId === updatedDept.headId);
            if (newUserAccount) {
                 newUserAccount.role = Role.DeptHead;
                 newUserAccount.department = updatedDept.name;
            }
            const oldUserAccount = USERS.find(u => u.employeeId === oldDept.headId);
             if (oldUserAccount && !DEPARTMENTS.some(d => d.headId === oldDept.headId && d.departmentId !== updatedDept.departmentId)) {
                  oldUserAccount.role = Role.Employee;
             }
        }
        DEPARTMENTS[index] = updatedDept;
    }
    return updatedDept;
};

export const deleteDepartment = async (departmentId: string): Promise<boolean> => {
    await delay(300);
    const index = DEPARTMENTS.findIndex(d => d.departmentId === departmentId);
    if (index !== -1) {
        const deptToDelete = DEPARTMENTS[index];
        DEPARTMENTS.splice(index, 1);
        delete DEPARTMENT_POSITIONS[deptToDelete.name];
        return true;
    }
    return false;
};


export const getPositionsForDepartment = async (department: string): Promise<string[]> => {
    await delay(100);
    return DEPARTMENT_POSITIONS[department] || [];
};

export const addPositionToDepartment = async (departmentName: string, positionName: string): Promise<boolean> => {
    await delay(200);
    if (DEPARTMENT_POSITIONS[departmentName]) {
        if (DEPARTMENT_POSITIONS[departmentName].includes(positionName)) {
            throw new Error(`Position "${positionName}" already exists in ${departmentName}.`);
        }
        DEPARTMENT_POSITIONS[departmentName].push(positionName);
        return true;
    }
    throw new Error(`Department "${departmentName}" not found.`);
};

export const updatePositionInDepartment = async (departmentName: string, oldPosition: string, newPosition: string): Promise<boolean> => {
    await delay(200);
    const positions = DEPARTMENT_POSITIONS[departmentName];
    if (positions) {
        const index = positions.indexOf(oldPosition);
        if (index === -1) {
            throw new Error(`Position "${oldPosition}" not found in ${departmentName}.`);
        }
        if (positions.includes(newPosition) && oldPosition !== newPosition) {
            throw new Error(`Position "${newPosition}" already exists in ${departmentName}.`);
        }
        positions[index] = newPosition;
        USER_PROFILES.forEach(profile => {
            if (profile.department === departmentName && profile.position === oldPosition) {
                profile.position = newPosition;
            }
        });
        return true;
    }
    throw new Error(`Department "${departmentName}" not found.`);
};

export const deletePositionFromDepartment = async (departmentName: string, positionName: string): Promise<boolean> => {
    await delay(200);
    const isPositionInUse = USER_PROFILES.some(p => p.department === departmentName && p.position === positionName);
    if (isPositionInUse) {
        throw new Error(`Cannot delete position "${positionName}" as it is currently assigned to one or more employees.`);
    }
    const positions = DEPARTMENT_POSITIONS[departmentName];
    if (positions) {
        const index = positions.indexOf(positionName);
        if (index > -1) {
            positions.splice(index, 1);
            return true;
        }
    }
    throw new Error(`Department "${departmentName}" not found.`);
};


export const createUser = async (userData: {
    email: string;
    role: Role;
    department: string;
    passcode: string;
    name: string;
    position: string;
}): Promise<UserAccount> => {
    await delay(300);
    if (USERS.some(u => u.email === userData.email)) {
        throw new Error("User with this email already exists.");
    }
    const existingIds = USERS.map(u => parseInt(u.employeeId.substring(1), 10));
    const maxId = Math.max(...existingIds, 0);
    const newEmployeeId = `E${maxId + 1}`;

    const newUserAccount: UserAccount = {
        email: userData.email,
        role: userData.role,
        passcode: userData.passcode,
        employeeId: newEmployeeId,
    };
    if (userData.role !== Role.Admin) {
        newUserAccount.department = userData.department;
    }

    const newUserProfile: UserProfile = {
        employeeId: newEmployeeId,
        name: userData.name,
        department: userData.role === Role.Admin ? 'HRD' : userData.department,
        position: userData.position,
        email: userData.email,
        status: 'Active',
        avatar: `https://i.pravatar.cc/150?u=${newEmployeeId}`,
        joinDate: new Date().toISOString().split('T')[0],
    };

    USERS.push(newUserAccount);
    USER_PROFILES.push(newUserProfile);

    if (newUserAccount.role === Role.DeptHead && newUserAccount.department) {
        const department = DEPARTMENTS.find(d => d.name === newUserAccount.department);
        if (department && !department.headId) {
            department.headId = newUserAccount.employeeId;
        }
    }
    
    return newUserAccount;
};

export const updateUser = async (
    employeeId: string,
    data: { name: string; role: Role; department: string; position: string }
): Promise<UserProfile> => {
    await delay(300);

    const profileIndex = USER_PROFILES.findIndex(p => p.employeeId === employeeId);
    if (profileIndex === -1) {
        throw new Error("User profile not found.");
    }
    
    const accountIndex = USERS.findIndex(u => u.employeeId === employeeId);
    if (accountIndex === -1) {
        throw new Error("User account not found.");
    }

    // Update Profile
    USER_PROFILES[profileIndex] = {
        ...USER_PROFILES[profileIndex],
        name: data.name,
        department: data.department,
        position: data.position,
    };

    // Update Account
    USERS[accountIndex] = {
        ...USERS[accountIndex],
        role: data.role,
        department: data.role === Role.Admin ? undefined : data.department,
    };
    
    alert(`AUTOMATION: User ${USER_PROFILES[profileIndex].email} has been updated. A notification has been sent.`);

    return USER_PROFILES[profileIndex];
};


export const deleteUser = async (employeeId: string): Promise<boolean> => {
    await delay(300);

    if (employeeId === 'E000') {
        throw new Error("Cannot delete the primary admin account.");
    }
    
    const profileIndex = USER_PROFILES.findIndex(p => p.employeeId === employeeId);
    const accountIndex = USERS.findIndex(u => u.employeeId === employeeId);

    if (profileIndex === -1) {
        throw new Error("User profile not found for deletion.");
    }
    if (accountIndex === -1) {
        throw new Error("User account not found for deletion.");
    }

    const deletedProfile = USER_PROFILES.splice(profileIndex, 1)[0];
    USERS.splice(accountIndex, 1);

    // Clean up related data
    // Unassign as department head
    DEPARTMENTS.forEach(dept => {
        if (dept.headId === employeeId) {
            dept.headId = '';
        }
    });

    // Unassign as supervisor
    USER_PROFILES.forEach(profile => {
        if (profile.supervisorId === employeeId) {
            profile.supervisorId = undefined;
        }
    });

    // Clear associated records
    const clearUserRecords = (records: any[]) => records.filter(r => r.employeeId !== employeeId);

    const newKpiScoring = clearUserRecords(KPI_SCORING);
    KPI_SCORING.length = 0;
    Array.prototype.push.apply(KPI_SCORING, newKpiScoring);

    const newFeedback = clearUserRecords(FEEDBACK_COACHING);
    FEEDBACK_COACHING.length = 0;
    Array.prototype.push.apply(FEEDBACK_COACHING, newFeedback);

    const newAssessments = clearUserRecords(SELF_ASSESSMENT);
    SELF_ASSESSMENT.length = 0;
    Array.prototype.push.apply(SELF_ASSESSMENT, newAssessments);

    const newAttendance = clearUserRecords(ATTENDANCE_RECORDS);
    ATTENDANCE_RECORDS.length = 0;
    Array.prototype.push.apply(ATTENDANCE_RECORDS, newAttendance);

    const newSchedules = clearUserRecords(SCHEDULE_RECORDS);
    SCHEDULE_RECORDS.length = 0;
    Array.prototype.push.apply(SCHEDULE_RECORDS, newSchedules);
    
    alert(`AUTOMATION: User ${deletedProfile.name} and all associated data have been deleted.`);

    return true;
};


// --- NEW ATTENDANCE APIs ---

export const getAttendanceForEmployee = async (employeeId: string, month: string): Promise<AttendanceRecord[]> => {
    await delay(200);
    return ATTENDANCE_RECORDS.filter(r => r.employeeId === employeeId && r.date.startsWith(month));
};

export const recordCheckIn = async (employeeId: string, method: 'QR' | 'GPS' | 'Token'): Promise<AttendanceRecord> => {
    await delay(300);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const existingRecord = ATTENDANCE_RECORDS.find(r => r.employeeId === employeeId && r.date === todayStr);
    if (existingRecord && existingRecord.checkIn) {
        throw new Error("You have already checked in today.");
    }
    
    // Schedule-aware check-in
    const schedule = await getScheduleForEmployee(employeeId, today.toISOString().substring(0, 7));
    const dayStr = today.getDate().toString().padStart(2, '0');
    const daySchedule = schedule.schedule[dayStr];

    if (!daySchedule || daySchedule.status !== ScheduleStatus.Workday || !daySchedule.startTime) {
        throw new Error("You are not scheduled to work today.");
    }

    const checkInTime = new Date();
    const workStartTime = new Date(todayStr);
    const [startHours, startMinutes] = daySchedule.startTime.split(':').map(Number);
    workStartTime.setHours(startHours, startMinutes, 0, 0);

    const lateMinutes = Math.max(0, Math.floor((checkInTime.getTime() - workStartTime.getTime()) / 60000));
    
    if (lateMinutes > 0) {
        alert(`AUTOMATION: Lateness detected (${lateMinutes} mins). Email notification sent to employee and manager.`);
    }

    const newRecord: AttendanceRecord = {
        attendanceId: `A${Date.now()}`,
        employeeId,
        date: todayStr,
        checkIn: checkInTime.toISOString(),
        checkOut: null,
        lateMinutes,
        totalHours: 0,
        absenceType: lateMinutes > 0 ? AbsenceType.Late : AbsenceType.Present,
        checkInMethod: method,
        checkOutMethod: null,
    };

    if (existingRecord) {
        const index = ATTENDANCE_RECORDS.findIndex(r => r.attendanceId === existingRecord.attendanceId);
        ATTENDANCE_RECORDS[index] = newRecord;
    } else {
        ATTENDANCE_RECORDS.push(newRecord);
    }
    
    return newRecord;
};

export const recordCheckOut = async (employeeId: string, method: 'QR' | 'GPS' | 'Token'): Promise<AttendanceRecord> => {
    await delay(300);
    const todayStr = new Date().toISOString().split('T')[0];
    const recordIndex = ATTENDANCE_RECORDS.findIndex(r => r.employeeId === employeeId && r.date === todayStr);

    if (recordIndex === -1 || !ATTENDANCE_RECORDS[recordIndex].checkIn) {
        throw new Error("You must check in before checking out.");
    }
    if (ATTENDANCE_RECORDS[recordIndex].checkOut) {
        throw new Error("You have already checked out today.");
    }
    
    const record = ATTENDANCE_RECORDS[recordIndex];
    const checkOutTime = new Date();
    const checkInTime = new Date(record.checkIn!);

    const totalHours = parseFloat(((checkOutTime.getTime() - checkInTime.getTime()) / 3600000).toFixed(2));

    record.checkOut = checkOutTime.toISOString();
    record.totalHours = totalHours;
    record.checkOutMethod = method;
    
    if (record.absenceType === AbsenceType.MissingCheckout) {
        record.absenceType = record.lateMinutes > 0 ? AbsenceType.Late : AbsenceType.Present;
    }

    ATTENDANCE_RECORDS[recordIndex] = record;
    return record;
};


export const calculateAttendanceKpi = async (employeeId: string, month: string): Promise<KpiAttendanceScore> => {
    await delay(100);

    const records = ATTENDANCE_RECORDS.filter(r => r.employeeId === employeeId && r.date.startsWith(month));
    const schedule = await getScheduleForEmployee(employeeId, month);
    
    const lateCount = records.filter(r => r.absenceType === AbsenceType.Late).length;
    const missingCount = records.filter(r => r.absenceType === AbsenceType.MissingCheckout).length;

    let absentCount = 0;
    const [year, m] = month.split('-').map(Number);
    const daysInMonth = new Date(year, m, 0).getDate();
    const today = new Date();
    const lastDayToCheck = (today.getFullYear() === year && today.getMonth() + 1 === m) ? today.getDate() : daysInMonth;

    for (let i = 1; i <= lastDayToCheck; i++) {
        const day = i.toString().padStart(2, '0');
        const dateStr = `${month}-${day}`;

        const dayStatus = schedule.schedule[day]?.status || getDefaultDayStatus(dateStr);

        if (dayStatus === ScheduleStatus.Workday) {
            const recordExists = records.some(r => r.date === dateStr);
            if (!recordExists) {
                absentCount++;
            }
        }
    }

    let finalScore = 5;
    if (absentCount > 0) {
        finalScore = 1;
    } else {
        let score = 5 - (lateCount / 2);
        score -= missingCount;
        finalScore = Math.max(1, score);
    }
    
    let bonusApplied = false;
    if (finalScore < 5 && lateCount === 0 && absentCount === 0 && missingCount === 0) {
        const [year, m] = month.split('-').map(Number);
        const prevMonth = new Date(year, m - 2, 1).toISOString().substring(0, 7);
        const prev2Month = new Date(year, m - 3, 1).toISOString().substring(0, 7);
        const prevRecords = ATTENDANCE_RECORDS.filter(r => r.employeeId === employeeId && r.date.startsWith(prevMonth));
        const prev2Records = ATTENDANCE_RECORDS.filter(r => r.employeeId === employeeId && r.date.startsWith(prev2Month));
        if (prevRecords.every(r => r.absenceType !== AbsenceType.Late) && prev2Records.every(r => r.absenceType !== AbsenceType.Late)) {
            finalScore = Math.min(5, finalScore + 1);
            bonusApplied = true;
        }
    }

    return {
        employeeId,
        month,
        lateCount,
        missingCount,
        absentCount,
        finalScore: parseFloat(finalScore.toFixed(1)),
        bonusApplied
    };
};

export const getAttendanceKpiForEmployee = async(employeeId: string, month: string): Promise<KpiAttendanceScore> => {
    return calculateAttendanceKpi(employeeId, month);
}


// --- NEW SCHEDULE APIs ---

const getDefaultDayStatus = (dateStr: string): ScheduleStatus => {
    const dayOfWeek = new Date(dateStr + 'T12:00:00Z').getUTCDay();
    return (dayOfWeek === 0 || dayOfWeek === 6) ? ScheduleStatus.DayOff : ScheduleStatus.Workday;
};

const generateDefaultSchedule = (employeeId: string, month: string): EmployeeSchedule => {
    const [year, m] = month.split('-').map(Number);
    const daysInMonth = new Date(year, m, 0).getDate();
    const schedule: Record<string, ScheduleDayDetails> = {};
    for (let i = 1; i <= daysInMonth; i++) {
        const day = i.toString().padStart(2, '0');
        const dateStr = `${month}-${day}`;
        const status = getDefaultDayStatus(dateStr);
        if (status === ScheduleStatus.Workday) {
            schedule[day] = { status, startTime: '09:00', endTime: '17:00' };
        } else {
            schedule[day] = { status };
        }
    }
    return {
        scheduleId: `SCH_DEFAULT_${employeeId}_${month}`,
        employeeId,
        month,
        schedule,
    };
};

export const getScheduleForEmployee = async (employeeId: string, month: string): Promise<EmployeeSchedule> => {
    await delay(50);
    const existingSchedule = SCHEDULE_RECORDS.find(s => s.employeeId === employeeId && s.month === month);
    return existingSchedule || generateDefaultSchedule(employeeId, month);
};

export const getScheduleForTeam = async (departmentName: string, month: string): Promise<EmployeeSchedule[]> => {
    await delay(300);
    const team = await getTeamByDepartment(departmentName);
    const departmentHead = USER_PROFILES.find(p => p.department === departmentName && p.position.includes('Manager'));
    const membersToSchedule = departmentHead ? [...team, departmentHead] : team;
    
    const schedules = await Promise.all(
        membersToSchedule.map(employee => getScheduleForEmployee(employee.employeeId, month))
    );
    return schedules;
};

export const getScheduleForAll = async (month: string): Promise<EmployeeSchedule[]> => {
    await delay(500);
    const employees = await getAllEmployees();
    const schedules = await Promise.all(
        employees.map(employee => getScheduleForEmployee(employee.employeeId, month))
    );
    return schedules;
}

export const saveSchedules = async (schedulesToSave: EmployeeSchedule[]): Promise<boolean> => {
    await delay(400);
    schedulesToSave.forEach(updatedSchedule => {
        if (updatedSchedule.scheduleId.startsWith('SCH_DEFAULT')) {
            updatedSchedule.scheduleId = `SCH_${updatedSchedule.employeeId}_${updatedSchedule.month}`;
        }

        const index = SCHEDULE_RECORDS.findIndex(s => s.scheduleId === updatedSchedule.scheduleId || (s.employeeId === updatedSchedule.employeeId && s.month === updatedSchedule.month));
        if (index !== -1) {
            SCHEDULE_RECORDS[index] = updatedSchedule;
        } else {
            SCHEDULE_RECORDS.push(updatedSchedule);
        }
    });
    alert('AUTOMATION: Schedule updated. Notifications sent to relevant employees.');
    return true;
};


// --- NEW AI CAREER PATH API ---

export const generateCareerRecommendation = async (employeeId: string): Promise<CareerPathRecommendation> => {
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY as string});
    
    // 1. Gather Data
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    
    const profile = await getEmployeeById(employeeId);
    if (!profile) {
        throw new Error("Employee profile not found.");
    }
    
    const allScores = await getScoresForEmployee(employeeId);
    const allFeedback = await getFeedbackForEmployee(employeeId);
    const allAttendance = ATTENDANCE_RECORDS.filter(r => r.employeeId === employeeId);

    const recentScores = allScores.filter(s => new Date(s.month) >= sixMonthsAgo);
    const recentFeedback = allFeedback.filter(f => new Date(f.month) >= sixMonthsAgo);
    const recentAttendance = allAttendance.filter(r => new Date(r.date) >= sixMonthsAgo);

    // 2. Process Data
    const attendanceSummary = {
        totalWorkdays: recentAttendance.length,
        lateDays: recentAttendance.filter(r => r.absenceType === AbsenceType.Late).length,
        absentDays: recentAttendance.filter(r => r.absenceType === AbsenceType.Absent).length,
    };

    // 3. Construct Prompt
    const prompt = `
        Analyze the following hotel employee's performance data from the last 6 months and generate a career path recommendation.
        
        **Employee Data:**
        - Profile: ${JSON.stringify({ name: profile.name, department: profile.department, position: profile.position, joinDate: profile.joinDate, certifications: profile.certifications })}
        - KPI Scores (1-5 scale): ${JSON.stringify(recentScores.map(s => ({ month: s.month, kpiId: s.kpiId, score: s.score, notes: s.notes })))}
        - Attendance Summary: ${JSON.stringify(attendanceSummary)}
        - Supervisor Feedback: ${JSON.stringify(recentFeedback.map(f => ({ month: f.month, feedback: f.feedbackText })))}

        Based on this data, provide a realistic and actionable career path recommendation.
        - Identify key strengths and weaknesses.
        - Recommend a logical career path (e.g., "Front Desk Agent -> Front Desk Supervisor -> Assistant Front Office Manager").
        - For the immediate next step, estimate a timeline, suggest specific skills to develop, and recommend relevant internal training.
        - Conclude with a brief, motivational message.

        Internal training programs available are: 'Leadership 101', 'Advanced Guest Services', 'Conflict Resolution', 'Financial Basics for Managers', 'Train the Trainer'. Please select from this list.
    `;

    // 4. Define Response Schema
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of key strengths." },
        areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of areas for improvement." },
        recommendedPath: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of job titles for the career path." },
        nextStep: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            estimatedTimeline: { type: Type.STRING },
            skillsToDevelop: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedTraining: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
        },
        motivationalMessage: { type: Type.STRING },
      },
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
            },
        });

        const jsonResponse = response.text.trim();
        return JSON.parse(jsonResponse) as CareerPathRecommendation;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate AI career recommendation. Please check the API configuration or try again later.");
    }
};

// --- NEW DEPARTMENT ANALYTICS API ---

export const getDepartmentAnalyticsData = async (): Promise<DepartmentAnalyticsData> => {
    await delay(500); // Simulate network delay
    const analytics: DepartmentAnalyticsData = {};
    const now = new Date();

    const departments = ['Front Office', 'Housekeeping', 'F&B Service', 'Engineering', 'Security', 'Sales'];
    
    // Generate data for the current and past two months
    for (let i = 0; i < 3; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toISOString().substring(0, 7);
        analytics[monthStr] = [];

        departments.forEach(dept => {
            // Base values
            let baseKpi = 80;
            let baseLateness = 5;
            let baseAbsence = 2;

            // Make some departments predictably different
            if (dept === 'Housekeeping') { baseKpi = 72; baseLateness = 10; }
            if (dept === 'Sales') { baseKpi = 90; baseLateness = 2; }
            if (dept === 'Engineering') { baseKpi = 78; }
            if (dept === 'Security') { baseAbsence = 1; }

            // Add some monthly variation
            const monthRandomness = (2-i) * 2; // more recent months are slightly better
            
            analytics[monthStr].push({
                department: dept,
                avgKpi: Math.min(98, baseKpi + Math.random() * 5 + monthRandomness),
                lateCount: Math.max(0, baseLateness + Math.floor(Math.random() * 4) - i),
                present: 200 + Math.floor(Math.random() * 20),
                absent: Math.max(0, baseAbsence + Math.floor(Math.random() * 3) - i)
            });
        });
    }
    return analytics;
};

export const generateDepartmentInsights = async (monthlyData: any): Promise<AIAnalyticsInsight> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const prompt = `
        As a senior hotel operations analyst, analyze the following monthly performance data for several hotel departments.
        
        Data:
        ${JSON.stringify(monthlyData, null, 2)}

        Your task is to provide a concise and actionable analysis in JSON format.
        1.  **highlight**: Identify the single most critical area of concern (e.g., the department with the highest late count or lowest KPI). Provide a brief, one-sentence detail.
        2.  **positive_trend**: Identify the single most positive trend or best-performing department. Provide a brief, one-sentence detail.
        3.  **recommendations**: Provide one brief, actionable recommendation for each of the following departments: Front Office, Housekeeping, and Sales.
    `;
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            highlight: {
                type: Type.OBJECT,
                properties: {
                    area: { type: Type.STRING, description: "The title of the area of concern, e.g., 'Highest Late Count'." },
                    department: { type: Type.STRING },
                    details: { type: Type.STRING, description: "A brief, one-sentence detail about the concern."}
                }
            },
            positive_trend: {
                 type: Type.OBJECT,
                 properties: {
                    area: { type: Type.STRING, description: "The title of the positive trend, e.g., 'Highest KPI Score'." },
                    department: { type: Type.STRING },
                    details: { type: Type.STRING, description: "A brief, one-sentence detail about the trend."}
                }
            },
            recommendations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        department: { type: Type.STRING },
                        recommendation: { type: Type.STRING }
                    }
                }
            }
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
            },
        });

        const jsonResponse = response.text.trim();
        return JSON.parse(jsonResponse) as AIAnalyticsInsight;
    } catch (error) {
        console.error("Error calling Gemini API for department insights:", error);
        throw new Error("Failed to generate AI department insights.");
    }
};


// --- NEW AI COACHING ASSISTANT APIs ---

export const generateInitialCoachingSummary = async (employeeId: string): Promise<AICoachingSummary> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    // 1. Gather Data (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    
    const profile = await getEmployeeById(employeeId);
    if (!profile) throw new Error("Employee profile not found.");
    
    const recentScores = (await getScoresForEmployee(employeeId)).filter(s => new Date(s.month) >= sixMonthsAgo);
    const recentFeedback = (await getFeedbackForEmployee(employeeId)).filter(f => new Date(f.month) >= sixMonthsAgo);
    const recentAttendance = ATTENDANCE_RECORDS.filter(r => r.employeeId === employeeId && new Date(r.date) >= sixMonthsAgo);
    
    const attendanceSummary = {
        lateDays: recentAttendance.filter(r => r.absenceType === AbsenceType.Late).length,
        absentDays: recentAttendance.filter(r => r.absenceType === AbsenceType.Absent).length,
    };
    
    // 2. Construct Prompt
    const prompt = `
        You are an expert AI Performance Coach for hotel employees. Your tone is supportive, encouraging, and highly professional. Your goal is to provide actionable, personalized advice to help the employee excel.
        Analyze the provided 6-month performance data for the hotel employee, paying close attention to the KPI scores and any accompanying notes from their manager. Generate a concise and actionable coaching summary.

        **Employee Data:**
        - Profile: ${JSON.stringify({ name: profile.name, position: profile.position, department: profile.department, certifications: profile.certifications })}
        - KPI Scores (1-5 scale, with manager's notes): ${JSON.stringify(recentScores.map(s => ({ kpiId: s.kpiId, score: s.score, month: s.month, notes: s.notes })))}
        - Attendance Summary: ${JSON.stringify(attendanceSummary)}
        - Supervisor Feedback: ${JSON.stringify(recentFeedback.map(f => f.feedbackText))}

        **Instructions:**
        - Directly reference specific KPIs where the employee is excelling (scores 4-5) or needs improvement (scores 1-3) in your 'strengths' and 'areasForImprovement' sections.
        - Use the manager's notes from the KPI scores to add context to your analysis.
        - For 'actionPlan', create 3-5 specific, achievable tasks directly related to improving lower-scoring KPIs. Mix weekly and monthly goals.
        - For 'recommendedTraining', select ONLY from the available internal programs: 'Leadership 101', 'Advanced Guest Services', 'Conflict Resolution', 'Financial Basics for Managers', 'Train the Trainer'.
        - Keep all suggestions practical and relevant to a hotel environment.
    `;
    
    // 3. Define Schema
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            areasForImprovement: { type: Type.ARRAY, items: { type: Type.STRING } },
            kpiSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            punctualityTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedTraining: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionPlan: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        text: { type: Type.STRING },
                        completed: { type: Type.BOOLEAN },
                        timescale: { type: Type.STRING, enum: ['Weekly', 'Monthly'] }
                    }
                }
            },
            motivationalMessage: { type: Type.STRING }
        }
    };
    
    // 4. API Call
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema,
            },
        });
        const jsonResponse = response.text.trim();
        return JSON.parse(jsonResponse) as AICoachingSummary;
    } catch (error) {
        console.error("Error calling Gemini API for coaching summary:", error);
        throw new Error("Failed to generate AI coaching summary.");
    }
};

export const getAICoachingResponse = async (employeeId: string, chatHistory: ChatMessage[], userMessage: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    // 1. Gather Data (same as summary)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const profile = await getEmployeeById(employeeId);
    if (!profile) return "I'm sorry, I can't find your profile data right now.";
    const recentScores = (await getScoresForEmployee(employeeId)).filter(s => new Date(s.month) >= sixMonthsAgo);
    const recentAttendance = ATTENDANCE_RECORDS.filter(r => r.employeeId === employeeId && new Date(r.date) >= sixMonthsAgo);
    const attendanceSummary = { lateDays: recentAttendance.filter(r => r.absenceType === AbsenceType.Late).length };

    // 2. Construct Prompt
    const prompt = `
        You are an AI Performance Coach for hotel employees in an interactive chat. Your tone is supportive and professional.
        
        **Employee's Performance Context (last 6 months):**
        - Profile: ${JSON.stringify({ position: profile.position, department: profile.department })}
        - KPI Scores (with manager's notes): ${JSON.stringify(recentScores.map(s => ({ kpiId: s.kpiId, score: s.score, notes: s.notes })))}
        - Attendance: ${JSON.stringify(attendanceSummary)}

        **Chat History:**
        ${chatHistory.map(m => `${m.sender}: ${m.text}`).join('\n')}

        **User's New Message:**
        user: ${userMessage}

        **Your Task:**
        Based on the employee's performance data (especially KPI scores and notes) and the conversation so far, provide a helpful and personalized response to the user's latest message. Keep the response concise (2-3 paragraphs max) and directly address their question. If the user asks about a specific KPI or performance area, use the provided scores and notes to give a detailed, data-driven answer.
    `;
    
    // 3. API Call
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for chat response:", error);
        return "I'm having trouble connecting right now. Please try again in a moment.";
    }
};
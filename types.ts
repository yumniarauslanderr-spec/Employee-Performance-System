

export enum Role {
  Admin = 'Admin',
  DeptHead = 'Department Head',
  Employee = 'Employee',
}

export interface UserAccount {
  email: string;
  role: Role;
  department?: string;
  passcode: string;
  employeeId: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface UserProfile {
  employeeId: string;
  name: string;
  department: string;
  position: string;
  email: string;
  phone?: string;
  joinDate?: string; // ISO String 'YYYY-MM-DD'
  status: 'Active' | 'Inactive' | 'Probation';
  avatar: string;
  supervisorId?: string; // EmployeeID of supervisor
  certifications?: string[];
  skillLevel?: 'Basic' | 'Intermediate' | 'Advanced';
  emergencyContact?: EmergencyContact;
}

export interface DepartmentDetails {
    departmentId: string;
    name: string;
    code: string;
    headId: string; // employeeId of department head
    description: string;
    status: 'Active' | 'Inactive';
}


export interface KpiMaster {
  kpiId: string;
  department: string;
  kpiName: string;
  description: string;
  weight: number; // in percentage
}

export interface KpiScoring {
  scoreId: string;
  employeeId: string;
  month: string; // "YYYY-MM"
  kpiId: string;
  score: number; // 1-5
  notes: string;
  evidenceUrl?: string;
  evaluatedBy: string; // employeeId of evaluator
}

export interface SelfAssessment {
  saId: string;
  employeeId: string;
  month: string; // "YYYY-MM"
  strengths: string;
  weaknesses: string;
  attachments?: string[];
}

export interface FeedbackCoaching {
  feedbackId: string;
  employeeId: string;
  month: string; // "YYYY-MM"
  feedbackText: string;
  coachingPlan: string;
  by: string; // employeeId of provider
  timestamp: string; // ISO 8601
}

// --- NEW ATTENDANCE MODULE TYPES ---

export enum AbsenceType {
  Present = 'Present',
  Late = 'Late',
  Absent = 'Absent',
  OnLeave = 'On Leave',
  MissingCheckout = 'Missing Checkout',
}

export interface AttendanceRecord {
  attendanceId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string | null; // ISO 8601
  checkOut: string | null; // ISO 8601
  lateMinutes: number;
  totalHours: number;
  absenceType: AbsenceType;
  checkInMethod: 'QR' | 'GPS' | 'Token' | null;
  checkOutMethod: 'QR' | 'GPS' | 'Token' | null;
}

export interface KpiAttendanceScore {
  employeeId: string;
  month: string; // YYYY-MM
  lateCount: number;
  missingCount: number;
  absentCount: number;
  finalScore: number; // 1-5
  bonusApplied: boolean;
}

// --- NEW SCHEDULE MODULE TYPES ---
export enum ScheduleStatus {
    Workday = 'Workday',
    DayOff = 'Day Off',
    OnLeave = 'On Leave',
}

export interface ScheduleDayDetails {
    status: ScheduleStatus;
    startTime?: string; // "HH:mm"
    endTime?: string;   // "HH:mm"
}

export interface EmployeeSchedule {
    scheduleId: string;
    employeeId: string;
    month: string; // YYYY-MM
    // Key is the day of the month (e.g., "01", "02", ... "31")
    schedule: Record<string, ScheduleDayDetails>; 
}

// --- NEW AI CAREER PATH MODULE TYPES ---
export interface CareerPathRecommendation {
  strengths: string[];
  areasForImprovement: string[];
  recommendedPath: string[];
  nextStep: {
    role: string;
    estimatedTimeline: string;
    skillsToDevelop: string[];
    recommendedTraining: string[];
  };
  motivationalMessage: string;
}

// --- NEW DEPARTMENT ANALYTICS MODULE TYPES ---
export interface DepartmentAnalyticEntry {
  department: string;
  avgKpi: number;
  lateCount: number;
  present: number;
  absent: number;
}

export type DepartmentAnalyticsData = Record<string, DepartmentAnalyticEntry[]>; // Key is month "YYYY-MM"

export interface AIAnalyticsInsight {
  highlight: {
    area: string; // e.g., "Highest Late Count"
    department: string;
    details: string;
  };
  positive_trend: {
    area: string; // e.g., "Most Improved KPI"
    department: string;
    details: string;
  };
  recommendations: {
    department: string;
    recommendation: string;
  }[];
}

// --- NEW AI COACHING ASSISTANT MODULE TYPES ---
export interface AICoachingActionItem {
  text: string;
  completed: boolean;
  timescale: 'Weekly' | 'Monthly';
}

export interface AICoachingSummary {
  strengths: string[];
  areasForImprovement: string[];
  kpiSuggestions: string[];
  punctualityTips: string[];
  recommendedSkills: string[];
  recommendedTraining: string[];
  actionPlan: AICoachingActionItem[];
  motivationalMessage: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

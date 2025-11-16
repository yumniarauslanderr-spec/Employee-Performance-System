import React, { useEffect, useState, useCallback } from 'react';
import { UserAccount, UserProfile, KpiScoring, KpiMaster, FeedbackCoaching, SelfAssessment, KpiAttendanceScore, AttendanceRecord } from '../types';
import { getEmployeeById, getKpisByDepartment, getScoresForEmployee, getFeedbackForEmployee, getSelfAssessmentForEmployee, calculateKpiScoreForMonth, submitSelfAssessment, getAttendanceKpiForEmployee, getAttendanceForEmployee, recordCheckIn, recordCheckOut } from '../services/mockApi';
import Card from './common/Card';
import Badge from './common/Badge';
import Spinner from './common/Spinner';
import PerformanceTrendChart from './charts/PerformanceTrendChart';

interface EmployeeDashboardProps {
  user: UserAccount;
  navigate: (page: string) => void;
}

const KpiDetailModal: React.FC<{ kpi: KpiMaster, onClose: () => void }> = ({ kpi, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">{kpi.kpiName}</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div>
                <p className="text-gray-600 mb-4">{kpi.description}</p>
                 <div className="bg-gray-50 p-3 rounded-md">
                     <p className="text-sm font-medium text-gray-500">Weight</p>
                     <p className="text-lg font-semibold text-teal-700">{kpi.weight}%</p>
                 </div>
                 {kpi.kpiId === 'K_AUTO_ATT' && (
                    <div className="mt-4 text-sm text-blue-700 bg-blue-50 p-3 rounded-md">
                        This KPI is calculated automatically based on your attendance log and does not require manual evaluation.
                    </div>
                )}
            </div>
        </div>
    </div>
);


const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, navigate }) => {
  const [employee, setEmployee] = useState<UserProfile | null>(null);
  const [scores, setScores] = useState<KpiScoring[]>([]);
  const [kpis, setKpis] = useState<KpiMaster[]>([]);
  const [feedback, setFeedback] = useState<FeedbackCoaching[]>([]);
  const [selfAssessment, setSelfAssessment] = useState<SelfAssessment | null>(null);
  const [attendanceKpi, setAttendanceKpi] = useState<KpiAttendanceScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedKpi, setSelectedKpi] = useState<KpiMaster | null>(null);
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isProcessingAttendance, setIsProcessingAttendance] = useState(false);
  const [attendanceError, setAttendanceError] = useState('');

  const currentMonth = new Date().toISOString().substring(0, 7);
  const overallScore = calculateKpiScoreForMonth(scores, kpis, currentMonth, attendanceKpi || undefined);
  const displayMonth = new Date(currentMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    setAttendanceError('');
    const empData = await getEmployeeById(user.employeeId);
    if (empData) {
      setEmployee(empData);
      const [kpisData, scoresData, feedbackData, selfAssessmentData, attendanceKpiData, attendanceRecords] = await Promise.all([
        getKpisByDepartment(empData.department),
        getScoresForEmployee(user.employeeId),
        getFeedbackForEmployee(user.employeeId),
        getSelfAssessmentForEmployee(user.employeeId, currentMonth),
        getAttendanceKpiForEmployee(user.employeeId, currentMonth),
        getAttendanceForEmployee(user.employeeId, currentMonth)
      ]);
      setKpis(kpisData);
      setScores(scoresData);
      setFeedback(feedbackData);
      setSelfAssessment(selfAssessmentData || null);
      setAttendanceKpi(attendanceKpiData);

      const todayStr = new Date().toISOString().split('T')[0];
      const todayRec = attendanceRecords.find(r => r.date === todayStr) || null;
      setTodayRecord(todayRec);
    }
    setLoading(false);
  }, [user.employeeId, currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAssessmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!strengths.trim() || !weaknesses.trim()) {
        alert("Please complete both fields for your self-assessment.");
        return;
    }
    setIsSubmitting(true);
    try {
        const newAssessment = await submitSelfAssessment({
            employeeId: user.employeeId,
            month: currentMonth,
            strengths,
            weaknesses,
        });
        setSelfAssessment(newAssessment);
    } catch (error) {
        console.error("Failed to submit assessment:", error);
        alert("An error occurred while submitting. Please try again.");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleCheckIn = async () => {
    setIsProcessingAttendance(true);
    setAttendanceError('');
    try {
        await recordCheckIn(user.employeeId, 'GPS');
        // Manually refetch after action
        const attendanceRecords = await getAttendanceForEmployee(user.employeeId, currentMonth);
        const todayStr = new Date().toISOString().split('T')[0];
        setTodayRecord(attendanceRecords.find(r => r.date === todayStr) || null);
    } catch (e) {
        setAttendanceError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsProcessingAttendance(false);
    }
  };

   const handleCheckOut = async () => {
    setIsProcessingAttendance(true);
    setAttendanceError('');
    try {
        await recordCheckOut(user.employeeId, 'GPS');
        // Manually refetch after action
        const attendanceRecords = await getAttendanceForEmployee(user.employeeId, currentMonth);
        const todayStr = new Date().toISOString().split('T')[0];
        setTodayRecord(attendanceRecords.find(r => r.date === todayStr) || null);
    } catch (e) {
        setAttendanceError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsProcessingAttendance(false);
    }
  };


  if (loading) return <Spinner />;
  if (!employee) return <div>Employee not found.</div>;

  return (
    <>
    {selectedKpi && <KpiDetailModal kpi={selectedKpi} onClose={() => setSelectedKpi(null)} />}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-4 md:space-y-6">
        <Card>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <img className="w-20 h-20 rounded-full" src={employee.avatar} alt={employee.name} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800 text-center sm:text-left">{employee.name}</h2>
              <p className="text-gray-500 text-center sm:text-left">{employee.position} - {employee.department}</p>
            </div>
          </div>
        </Card>
        <Card title="Today's Attendance">
            <div className="space-y-3">
                {(() => {
                    if (!todayRecord || !todayRecord.checkIn) {
                        return <p className="text-gray-500">You have not checked in today.</p>;
                    }
                    if (todayRecord.checkIn && !todayRecord.checkOut) {
                        return <p className="text-green-700 font-semibold">Checked in at: {new Date(todayRecord.checkIn).toLocaleTimeString()}</p>;
                    }
                    if (todayRecord.checkIn && todayRecord.checkOut) {
                        return <p className="text-blue-700 font-semibold">Workday complete. Total hours: {todayRecord.totalHours}</p>;
                    }
                })()}
                {attendanceError && <p className="text-sm text-red-600">{attendanceError}</p>}
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                {(!todayRecord || !todayRecord.checkIn) && (
                    <button onClick={handleCheckIn} disabled={isProcessingAttendance} className="w-full sm:w-auto flex-1 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400">
                        {isProcessingAttendance ? 'Processing...' : 'Check In'}
                    </button>
                )}
                {(todayRecord?.checkIn && !todayRecord.checkOut) && (
                    <button onClick={handleCheckOut} disabled={isProcessingAttendance} className="w-full sm:w-auto flex-1 bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400">
                        {isProcessingAttendance ? 'Processing...' : 'Check Out'}
                    </button>
                )}
                <button onClick={() => navigate('attendance')} className="w-full sm:w-auto flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    View Log
                </button>
            </div>
        </Card>
        <Card title="Monthly Performance Overview">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Overall Score ({displayMonth})</p>
              <p className="text-3xl sm:text-4xl font-bold text-teal-600">{overallScore.toFixed(1)}/100</p>
            </div>
            <Badge score={overallScore} />
          </div>
        </Card>
        <Card title="Performance Trend">
          <PerformanceTrendChart scores={scores} kpis={kpis} />
        </Card>
        <Card title="Latest Feedback & Coaching">
            {feedback.length > 0 ? feedback.map(f => (
                <div key={f.feedbackId} className="border-b last:border-b-0 py-3">
                    <p className="text-sm text-gray-500">{new Date(f.timestamp).toLocaleDateString()}</p>
                    <p className="font-semibold mt-1">Feedback:</p>
                    <p className="text-gray-700">{f.feedbackText}</p>
                    <p className="font-semibold mt-2">Coaching Plan:</p>
                    <p className="text-gray-700">{f.coachingPlan}</p>
                </div>
            )) : <p className="text-gray-500">No feedback available.</p>}
        </Card>
      </div>

      {/* Right Column */}
      <div className="space-y-4 md:space-y-6">
        <Card title={`KPI Scores for ${displayMonth}`}>
            <ul className="space-y-1">
            {kpis.map(kpi => {
                let scoreValue: string | number = 'N/A';
                if (kpi.kpiId === 'K_AUTO_ATT') {
                    scoreValue = attendanceKpi?.finalScore || 'N/A';
                } else {
                    const score = scores.find(s => s.kpiId === kpi.kpiId && s.month === currentMonth);
                    scoreValue = score?.score || 'N/A';
                }

                return (
                    <li key={kpi.kpiId}>
                        <button onClick={() => setSelectedKpi(kpi)} className="flex justify-between items-center w-full text-left p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <span className="text-gray-600">{kpi.kpiName}</span>
                            <span className="font-bold text-teal-700">{scoreValue}/5</span>
                        </button>
                    </li>
                );
            })}
            </ul>
        </Card>
        {attendanceKpi && (
            <Card title="Punctuality Score Details">
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Late Days:</span><span className="font-medium text-gray-800">{attendanceKpi.lateCount}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Absences:</span><span className="font-medium text-gray-800">{attendanceKpi.absentCount}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Missing Checkouts:</span><span className="font-medium text-gray-800">{attendanceKpi.missingCount}</span></div>
                    {attendanceKpi.bonusApplied && <p className="text-center text-xs pt-2 text-green-600 font-semibold">Perfect Attendance Bonus Applied!</p>}
                </div>
            </Card>
        )}
        <Card title="Self-Assessment">
            {selfAssessment ? (
                <div>
                    <p className="font-semibold">Strengths:</p>
                    <p className="text-gray-700 mb-2 whitespace-pre-wrap">{selfAssessment.strengths}</p>
                    <p className="font-semibold">Areas for Improvement:</p>
                    <p className="text-gray-700 whitespace-pre-wrap">{selfAssessment.weaknesses}</p>
                </div>
            ) : (
                <form className="space-y-4" onSubmit={handleAssessmentSubmit}>
                    <div>
                        <label htmlFor="strengths" className="block text-sm font-medium text-gray-700">My Strengths</label>
                        <textarea 
                            id="strengths"
                            rows={4} 
                            value={strengths}
                            onChange={(e) => setStrengths(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            placeholder="Describe what you did well this month."
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="weaknesses" className="block text-sm font-medium text-gray-700">Areas for Improvement</label>
                        <textarea 
                            id="weaknesses"
                            rows={4} 
                            value={weaknesses}
                            onChange={(e) => setWeaknesses(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            placeholder="What could you improve upon next month?"
                            required
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Evidence (Optional)</label>
                        <input type="file" className="mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isSubmitting ? (
                             <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : "Submit Assessment"}
                    </button>
                </form>
            )}
        </Card>
      </div>
    </div>
    </>
  );
};

export default EmployeeDashboard;
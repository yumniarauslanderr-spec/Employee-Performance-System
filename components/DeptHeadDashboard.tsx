

import React, { useEffect, useState, useMemo } from 'react';
import { UserAccount, UserProfile, KpiScoring, KpiMaster, KpiAttendanceScore } from '../types';
import { getTeamByDepartment, calculateKpiScoreForMonth, getKpisByDepartment, getScoresForEmployee, submitKpiScores, submitFeedback, getAttendanceKpiForEmployee } from '../services/mockApi';
import Card from './common/Card';
import Badge from './common/Badge';
import Spinner from './common/Spinner';
import PerformanceBarChart from './charts/PerformanceBarChart';

// Modal for KPI Evaluation
const EvaluateModal: React.FC<{
    employee: UserProfile;
    kpis: KpiMaster[];
    existingScores: KpiScoring[];
    onClose: () => void;
    onSubmit: (scores: Array<{ kpiId: string; score: number; notes: string }>) => Promise<void>;
}> = ({ employee, kpis, existingScores, onClose, onSubmit }) => {
    const [scores, setScores] = useState<Record<string, { score: number; notes: string }>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    useEffect(() => {
        const initialScores: Record<string, { score: number; notes: string }> = {};
        kpis.forEach(kpi => {
            if (kpi.kpiId === 'K_AUTO_ATT') return;
            const existing = existingScores.find(s => s.kpiId === kpi.kpiId);
            initialScores[kpi.kpiId] = {
                score: existing?.score || 0,
                notes: existing?.notes || ''
            };
        });
        setScores(initialScores);
    }, [kpis, existingScores]);

    const handleScoreChange = (kpiId: string, value: string) => {
        setScores(prev => ({
            ...prev,
            [kpiId]: { ...prev[kpiId], score: parseInt(value, 10) }
        }));
    };
    
    const handleNotesChange = (kpiId: string, value: string) => {
         setScores(prev => ({
            ...prev,
            [kpiId]: { ...prev[kpiId], notes: value }
        }));
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const scoresToSubmit = Object.entries(scores).map(([kpiId, data]) => ({ kpiId, ...data }));
        await onSubmit(scoresToSubmit);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                     <h3 className="text-xl font-bold text-gray-800">Evaluate: {employee.name}</h3>
                     <p className="text-sm text-gray-500">{employee.position}</p>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto">
                    <div className="p-4 space-y-4">
                    {kpis.filter(kpi => kpi.kpiId !== 'K_AUTO_ATT').map(kpi => (
                        <div key={kpi.kpiId} className="border p-3 rounded-md bg-gray-50/50">
                            <label className="font-semibold text-gray-700">{kpi.kpiName} <span className="text-sm font-normal text-gray-500">({kpi.weight}%)</span></label>
                            <div className="flex items-center space-x-2 mt-2">
                                {[1, 2, 3, 4, 5].map(val => (
                                    <button
                                        type="button"
                                        key={val}
                                        onClick={() => handleScoreChange(kpi.kpiId, String(val))}
                                        className={`w-8 h-8 rounded-full border transition-colors text-sm ${scores[kpi.kpiId]?.score === val ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                             <textarea
                                value={scores[kpi.kpiId]?.notes || ''}
                                onChange={(e) => handleNotesChange(kpi.kpiId, e.target.value)}
                                rows={2}
                                placeholder="Add notes (optional)..."
                                className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            />
                        </div>
                    ))}
                    </div>
                </form>
                 <div className="p-4 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="w-32 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 flex justify-center items-center">
                       {isSubmitting ? (
                             <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// Modal for Feedback & Coaching
const FeedbackModal: React.FC<{
    employee: UserProfile;
    onClose: () => void;
    onSubmit: (feedback: { feedbackText: string; coachingPlan: string; }) => Promise<void>;
}> = ({ employee, onClose, onSubmit }) => {
    const [feedbackText, setFeedbackText] = useState('');
    const [coachingPlan, setCoachingPlan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSubmit({ feedbackText, coachingPlan });
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b">
                    <h3 className="text-xl font-bold text-gray-800">Feedback for: {employee.name}</h3>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label htmlFor="feedbackText" className="block text-sm font-medium text-gray-700">Feedback</label>
                        <textarea
                            id="feedbackText"
                            rows={4}
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            placeholder="Provide constructive feedback..."
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="coachingPlan" className="block text-sm font-medium text-gray-700">Coaching Plan</label>
                        <textarea
                            id="coachingPlan"
                            rows={3}
                            value={coachingPlan}
                            onChange={(e) => setCoachingPlan(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            placeholder="Outline next steps for improvement..."
                            required
                        />
                    </div>
                </div>
                 <div className="p-4 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="w-32 bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 flex justify-center items-center">
                        {isSubmitting ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
}


interface DeptHeadDashboardProps {
  user: UserAccount;
}

const DeptHeadDashboard: React.FC<DeptHeadDashboardProps> = ({ user }) => {
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [teamScores, setTeamScores] = useState<Record<string, KpiScoring[]>>({});
  const [teamAttendance, setTeamAttendance] = useState<Record<string, KpiAttendanceScore>>({});
  const [kpis, setKpis] = useState<KpiMaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{ type: 'evaluate' | 'feedback' | null; employee: UserProfile | null }>({ type: null, employee: null });

  const currentMonth = new Date().toISOString().substring(0, 7);
  const displayMonth = new Date(currentMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });

  const fetchData = async () => {
      if (!user.department) return;
      setLoading(true);
      const [teamData, kpisData] = await Promise.all([
        getTeamByDepartment(user.department),
        getKpisByDepartment(user.department),
      ]);
      setTeam(teamData);
      setKpis(kpisData);
      
      const scoresPromises = teamData.map(e => getScoresForEmployee(e.employeeId));
      const attendancePromises = teamData.map(e => getAttendanceKpiForEmployee(e.employeeId, currentMonth));
      
      const [scoresData, attendanceData] = await Promise.all([
        Promise.all(scoresPromises),
        Promise.all(attendancePromises)
      ]);

      const scoresMap: Record<string, KpiScoring[]> = {};
      const attendanceMap: Record<string, KpiAttendanceScore> = {};

      teamData.forEach((employee, index) => {
          scoresMap[employee.employeeId] = scoresData[index];
          attendanceMap[employee.employeeId] = attendanceData[index];
      });

      setTeamScores(scoresMap);
      setTeamAttendance(attendanceMap);
      setLoading(false);
  };

    useEffect(() => {
        fetchData();
    }, [user, currentMonth]);

    const handleEvaluationSubmit = async (scores: Array<{ kpiId: string; score: number; notes: string }>) => {
        if (!modalState.employee) return;
        await submitKpiScores(user.employeeId, modalState.employee.employeeId, currentMonth, scores);
        setModalState({ type: null, employee: null });
        fetchData(); // Refresh data after submission
        alert(`Scores for ${modalState.employee.name} submitted successfully!`);
    };

    const handleFeedbackSubmit = async (feedback: { feedbackText: string; coachingPlan: string; }) => {
        if (!modalState.employee) return;
        await submitFeedback({
            by: user.employeeId,
            employeeId: modalState.employee.employeeId,
            month: currentMonth,
            ...feedback
        });
        setModalState({ type: null, employee: null });
        alert(`Feedback for ${modalState.employee.name} submitted successfully!`);
    };

    const existingScoresForModal = useMemo(() => {
        if (!modalState.employee) return [];
        const employeeScores = teamScores[modalState.employee.employeeId] || [];
        return employeeScores.filter(s => s.month === currentMonth);
    }, [teamScores, modalState.employee, currentMonth]);

    if (loading) return <Spinner />;

    const chartData = team
        .map(employee => {
            const scores = teamScores[employee.employeeId] || [];
            const attendanceScore = teamAttendance[employee.employeeId];
            const overallScore = calculateKpiScoreForMonth(scores, kpis, currentMonth, attendanceScore);
            return { name: employee.name, score: overallScore };
        })
        .filter(item => item.score > 0);

    const sortedTeamByPunctuality = [...team].sort((a, b) => {
        const aAtt = teamAttendance[a.employeeId];
        const bAtt = teamAttendance[b.employeeId];
        if(!aAtt || !bAtt) return 0;
        if (aAtt.lateCount !== bAtt.lateCount) return aAtt.lateCount - bAtt.lateCount;
        if (aAtt.absentCount !== bAtt.absentCount) return aAtt.absentCount - bAtt.absentCount;
        return aAtt.missingCount - bAtt.missingCount;
    });

    return (
        <>
            {modalState.type === 'evaluate' && modalState.employee && (
                <EvaluateModal
                    employee={modalState.employee}
                    kpis={kpis}
                    existingScores={existingScoresForModal}
                    onClose={() => setModalState({ type: null, employee: null })}
                    onSubmit={handleEvaluationSubmit}
                />
            )}
            {modalState.type === 'feedback' && modalState.employee && (
                <FeedbackModal
                    employee={modalState.employee}
                    onClose={() => setModalState({ type: null, employee: null })}
                    onSubmit={handleFeedbackSubmit}
                />
            )}
            <div className="space-y-4 md:space-y-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                    {user.department} Dashboard
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card title={`Team Performance Overview - ${displayMonth}`}>
                        <PerformanceBarChart data={chartData} />
                    </Card>
                    <Card title="Team Punctuality">
                        <div className="space-y-3">
                            {sortedTeamByPunctuality.map((employee, index) => {
                                const att = teamAttendance[employee.employeeId];
                                if (!att) return null;
                                return (
                                <div key={employee.employeeId} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <img src={employee.avatar} alt={employee.name} className="w-10 h-10 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-gray-800">{employee.name}</p>
                                            {index === 0 && <p className="text-xs text-green-600 font-bold">Most Disciplined</p>}
                                        </div>
                                    </div>
                                    <div className="text-right text-sm">
                                        <p>Late: <span className="font-bold">{att.lateCount}</span></p>
                                        <p>Absent: <span className="font-bold">{att.absentCount}</span></p>
                                    </div>
                                </div>
                                )
                            })}
                        </div>
                    </Card>
                </div>

                <Card title="Team Members">
                    <div className="space-y-4">
                        {team.map(employee => {
                            const scores = teamScores[employee.employeeId] || [];
                            const attendanceScore = teamAttendance[employee.employeeId];
                            const overallScore = calculateKpiScoreForMonth(scores, kpis, currentMonth, attendanceScore);
                            const isEvaluated = scores.some(s => s.month === currentMonth);

                            return (
                                <div key={employee.employeeId} className="flex flex-col sm:flex-row items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                                        <img src={employee.avatar} alt={employee.name} className="w-12 h-12 rounded-full" />
                                        <div>
                                            <p className="font-bold text-gray-800">{employee.name}</p>
                                            <p className="text-sm text-gray-500">{employee.position}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
                                        <div className="text-center w-1/3 sm:w-auto">
                                            <p className="text-sm text-gray-500">Score</p>
                                            <p className="font-bold text-lg text-teal-700">{overallScore > 0 ? overallScore.toFixed(1) : 'N/A'}</p>
                                        </div>
                                        <div className="text-center w-1/3 sm:w-auto">
                                            {overallScore > 0 && <Badge score={overallScore} />}
                                        </div>
                                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-1/3 sm:w-auto items-end">
                                            <button onClick={() => setModalState({ type: 'evaluate', employee })} className="w-full sm:w-auto text-sm bg-teal-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-teal-700 transition-colors whitespace-nowrap">
                                                {isEvaluated ? 'Update Score' : 'Evaluate'}
                                            </button>
                                            <button onClick={() => setModalState({ type: 'feedback', employee })} className="w-full sm:w-auto text-sm bg-sky-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-sky-700 transition-colors">Feedback</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>
        </>
    );
};

export default DeptHeadDashboard;
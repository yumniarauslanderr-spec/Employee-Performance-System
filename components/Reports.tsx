

import React, { useState } from 'react';
import Card from './common/Card';
import { UserAccount, Role } from '../types';
import { 
    getAllEmployees, 
    getEmployeeById, 
    getTeamByDepartment, 
    getKpisByDepartment, 
    getScoresForEmployee, 
    calculateKpiScoreForMonth,
    getDepartments,
    getAttendanceKpiForEmployee
} from '../services/mockApi';

declare const jspdf: any;

interface ReportsProps {
  user: UserAccount;
}

const Reports: React.FC<ReportsProps> = ({ user }) => {
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7));
  const [reportType, setReportType] = useState("monthly-summary");
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    const { jsPDF } = jspdf;
    const doc = new jsPDF();
    let yPos = 40;
    const displayMonth = new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });


    const addLine = () => {
      yPos += 2;
      doc.line(14, yPos, 196, yPos);
      yPos += 8;
    };
    
    doc.setFontSize(18);
    doc.text(`Monthly Performance Summary - ${displayMonth}`, 14, 22);
    doc.setFontSize(10);
    doc.text(`Generated for: ${user.email}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 150, 30);

    if (user.role === Role.Employee) {
        const employee = await getEmployeeById(user.employeeId);
        if (employee) {
            const [kpis, scores, attendanceKpi] = await Promise.all([
                getKpisByDepartment(employee.department),
                getScoresForEmployee(employee.employeeId),
                getAttendanceKpiForEmployee(employee.employeeId, month)
            ]);
            const overallScore = calculateKpiScoreForMonth(scores, kpis, month, attendanceKpi);

            doc.setFontSize(14);
            doc.text(`${employee.name} - ${employee.position}`, 14, yPos);
            yPos += 8;
            doc.setFontSize(12);
            doc.text(`Overall Score: ${overallScore.toFixed(1)}/100`, 14, yPos);
            yPos += 6;
            addLine();
            doc.setFont(undefined, 'bold');
            doc.text("KPI", 14, yPos);
            doc.text("Score", 180, yPos);
            yPos += 6;
            doc.setFont(undefined, 'normal');

            kpis.forEach(kpi => {
                let scoreValue = 'N/A';
                if (kpi.kpiId === 'K_AUTO_ATT') {
                    scoreValue = attendanceKpi.finalScore.toString();
                } else {
                    const score = scores.find(s => s.kpiId === kpi.kpiId && s.month === month);
                    if (score) scoreValue = score.score.toString();
                }
                doc.text(kpi.kpiName, 14, yPos);
                doc.text(`${scoreValue} / 5`, 180, yPos);
                yPos += 7;
            });
        }
    } else if (user.role === Role.DeptHead && user.department) {
        const team = await getTeamByDepartment(user.department);
        const kpis = await getKpisByDepartment(user.department);

        doc.setFontSize(14);
        doc.text(`Department: ${user.department}`, 14, yPos);
        yPos += 10;
        addLine();
        doc.setFont(undefined, 'bold');
        doc.text("Employee", 14, yPos);
        doc.text("Position", 100, yPos);
        doc.text("Score", 180, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');

        for (const member of team) {
            const [scores, attendanceKpi] = await Promise.all([
                getScoresForEmployee(member.employeeId),
                getAttendanceKpiForEmployee(member.employeeId, month)
            ]);
            const overallScore = calculateKpiScoreForMonth(scores, kpis, month, attendanceKpi);
            doc.text(member.name, 14, yPos);
            doc.text(member.position, 100, yPos);
            doc.text(`${overallScore.toFixed(1)}`, 180, yPos);
            yPos += 7;
        }
    } else if (user.role === Role.Admin) {
        const allEmployees = await getAllEmployees();
        const allDepartments = await getDepartments();
        const departments = allDepartments.filter(d => d.name !== 'HRD');

        doc.setFontSize(14);
        doc.text(`Company-Wide Department Performance`, 14, yPos);
        yPos += 10;
        addLine();
        doc.setFont(undefined, 'bold');
        doc.text("Department", 14, yPos);
        doc.text("Avg. Score", 170, yPos);
        yPos += 6;
        doc.setFont(undefined, 'normal');

        for (const dept of departments) {
            const deptEmployees = allEmployees.filter(e => e.department === dept.name);
            const kpis = await getKpisByDepartment(dept.name);
            let totalScore = 0;
            let scoredEmployees = 0;

            for (const emp of deptEmployees) {
                 const [scores, attendanceKpi] = await Promise.all([
                    getScoresForEmployee(emp.employeeId),
                    getAttendanceKpiForEmployee(emp.employeeId, month)
                ]);
                const monthlyScore = calculateKpiScoreForMonth(scores, kpis, month, attendanceKpi);
                if (monthlyScore > 0) {
                    totalScore += monthlyScore;
                    scoredEmployees++;
                }
            }
            const avgScore = scoredEmployees > 0 ? totalScore / scoredEmployees : 0;
            doc.text(dept.name, 14, yPos);
            doc.text(`${avgScore.toFixed(1)} / 100`, 170, yPos);
            yPos += 7;
        }
    }

    doc.save(`performance-report-${month}.pdf`);
    alert('AUTOMATION: Monthly report PDF generated and sent via email.');
    setLoading(false);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Reports</h1>
      <Card title="Generate New Report">
        <div className="space-y-4">
           <div>
              <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">Report Type</label>
              <select 
                id="report-type" 
                name="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
              >
                <option value="monthly-summary">Monthly Performance Summary</option>
                <option value="dept-comparison" disabled>Department Comparison (Coming Soon)</option>
                <option value="kpi-trend" disabled>KPI Trend Analysis (Coming Soon)</option>
              </select>
           </div>
            <div>
              <label htmlFor="month-select" className="block text-sm font-medium text-gray-700">Select Month</label>
              <input 
                type="month" 
                id="month-select" 
                name="month" 
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm" />
            </div>
            <button 
                type="button" 
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
                {loading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Generating...</span>
                    </>
                ) : (
                    <span>Generate Report</span>
                )}
            </button>
        </div>
      </Card>
      <Card title="Past Reports">
        <p className="text-gray-500">No reports generated yet.</p>
      </Card>
    </div>
  );
};

export default Reports;
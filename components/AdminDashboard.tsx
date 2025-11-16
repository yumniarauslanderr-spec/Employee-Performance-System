

import React, { useEffect, useState, useRef } from 'react';
import { UserAccount, UserProfile, KpiScoring, KpiMaster, KpiAttendanceScore } from '../types';
import { getAllEmployees, getKpisByDepartment, getScoresForEmployee, calculateKpiScoreForMonth, getDepartments, getAttendanceKpiForEmployee } from '../services/mockApi';
import Card from './common/Card';
import Spinner from './common/Spinner';
import PerformanceBarChart from './charts/PerformanceBarChart';
import PerformancePieChart from './charts/PerformancePieChart';

declare const jspdf: any;
// Define the QRCode type for window object to satisfy TypeScript and avoid global declarations.
declare global {
    interface Window {
        QRCode: new (element: HTMLElement | string, options: any) => any;
    }
}

const AdminDashboard: React.FC = () => {
    const [employees, setEmployees] = useState<UserProfile[]>([]);
    const [departmentScores, setDepartmentScores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const qrCodeRef = useRef<HTMLDivElement>(null);

    const currentMonth = new Date().toISOString().substring(0, 7);
    const displayMonth = new Date(currentMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' });


    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [allEmployees, allDepartments] = await Promise.all([
                getAllEmployees(),
                getDepartments()
            ]);
            setEmployees(allEmployees);

            const departmentsToScore = allDepartments.filter(d => d.name !== 'HRD');

            const deptDataPromises = departmentsToScore.map(async (dept) => {
                const deptEmployees = allEmployees.filter(e => e.department === dept.name);
                const kpis = await getKpisByDepartment(dept.name);
                
                let totalMonthlyScore = 0;
                let scoredEmployeesCount = 0;

                for (const e of deptEmployees) {
                    const [scores, attendanceKpi] = await Promise.all([
                        getScoresForEmployee(e.employeeId),
                        getAttendanceKpiForEmployee(e.employeeId, currentMonth)
                    ]);
                    
                    const monthlyScore = calculateKpiScoreForMonth(scores, kpis, currentMonth, attendanceKpi);
                    if (monthlyScore > 0) {
                        totalMonthlyScore += monthlyScore;
                        scoredEmployeesCount++;
                    }
                }

                const avgScore = totalMonthlyScore / (scoredEmployeesCount || 1);
                
                return {
                    name: dept.name,
                    score: parseFloat(avgScore.toFixed(1)),
                    employeeCount: deptEmployees.length
                };
            });
            
            const results = await Promise.all(deptDataPromises);
            setDepartmentScores(results);
            setLoading(false);
        };
        fetchData();
    }, [currentMonth]);

    const generatePdfReport = () => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text(`Company-Wide Performance Report - ${displayMonth}`, 14, 22);
        
        doc.setFontSize(12);
        doc.text("Department Performance:", 14, 40);

        let y = 50;
        departmentScores.forEach(dept => {
            doc.text(`${dept.name}: Average Score - ${dept.score}/100`, 14, y);
            y += 10;
        });

        const qrCodeEl = qrCodeRef.current;
        // Check if the QRCode library is loaded on the window object before attempting to use it.
        // This prevents a "QRCode is not defined" runtime error.
        if (qrCodeEl && typeof window.QRCode !== 'undefined') {
            qrCodeEl.innerHTML = '';
            new window.QRCode(qrCodeEl, {
                text: `Verified Report: Employee Performance ${new Date().toISOString()}`,
                width: 64,
                height: 64,
            });
            
            setTimeout(() => { // Allow QR code to render
                const canvas = qrCodeEl.querySelector('canvas');
                if (canvas) {
                    try {
                        const qrImage = canvas.toDataURL('image/png');
                        doc.addImage(qrImage, 'PNG', 14, y + 10, 30, 30);
                        doc.text("Digital Verification", 14, y + 45);
                    } catch (e) {
                        console.error("Error adding QR code to PDF:", e);
                    }
                }
                doc.save("employee-performance-report.pdf");
            }, 500);
        } else {
            if (typeof window.QRCode === 'undefined') {
                console.warn("QRCode.js library not loaded. PDF will be generated without a QR code.");
            }
            doc.save("employee-performance-report.pdf");
        }
    };


    if (loading) return <Spinner />;
    
    const performanceStatusData = [
        { name: 'Excellent (90+)', value: departmentScores.filter(d => d.score >= 90).length },
        { name: 'Good (75-89)', value: departmentScores.filter(d => d.score >= 75 && d.score < 90).length },
        { name: 'Fair (60-74)', value: departmentScores.filter(d => d.score >= 60 && d.score < 75).length },
        { name: 'Poor (<60)', value: departmentScores.filter(d => d.score < 60).length },
    ].filter(d => d.value > 0);

    return (
        <div className="space-y-4 md:space-y-6">
            <div ref={qrCodeRef} style={{ display: 'none' }}></div>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Admin Dashboard</h1>
                <button onClick={generatePdfReport} className="bg-teal-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                    <span className="hidden sm:inline">Export Report (PDF)</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <Card title="Total Employees"><p className="text-3xl sm:text-4xl font-bold text-teal-600">{employees.length}</p></Card>
                <Card title="Active Departments"><p className="text-3xl sm:text-4xl font-bold text-teal-600">{departmentScores.length}</p></Card>
                <Card title="Company Avg. Score"><p className="text-3xl sm:text-4xl font-bold text-teal-600">{(departmentScores.reduce((a, b) => a + b.score, 0) / departmentScores.length || 0).toFixed(1)}</p></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
                <div className="lg:col-span-3">
                    <Card title={`Department Performance - ${displayMonth}`}>
                        <PerformanceBarChart data={departmentScores} />
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card title="Performance Status">
                       <PerformancePieChart data={performanceStatusData} />
                    </Card>
                </div>
            </div>
             <Card title="All Employees">
                 {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {employees.map(e => (
                         <div key={e.employeeId} className="border rounded-lg p-4 space-y-3">
                             <div className="flex items-center space-x-3">
                                <img src={e.avatar} alt={e.name} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-bold text-gray-800">{e.name}</p>
                                    <p className="text-sm text-gray-500">{e.position}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Department:</span>
                                <span className="font-semibold text-gray-800">{e.department}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600 font-medium">Status:</span>
                                <span className={`px-2 py-1 text-xs rounded-full ${e.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{e.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
                 {/* Desktop Table View */}
                 <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="p-3 font-semibold text-gray-600">Name</th>
                                <th className="p-3 font-semibold text-gray-600">Department</th>
                                <th className="p-3 font-semibold text-gray-600">Position</th>
                                <th className="p-3 font-semibold text-gray-600">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(e => (
                                <tr key={e.employeeId} className="border-b hover:bg-gray-50">
                                    <td className="p-3 flex items-center space-x-3">
                                        <img src={e.avatar} alt={e.name} className="w-10 h-10 rounded-full" />
                                        <span>{e.name}</span>
                                    </td>
                                    <td className="p-3 text-gray-600">{e.department}</td>
                                    <td className="p-3 text-gray-600">{e.position}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs rounded-full ${e.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{e.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </Card>
        </div>
    );
};

export default AdminDashboard;
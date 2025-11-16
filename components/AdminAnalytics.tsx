
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, CareerPathRecommendation, DepartmentAnalyticsData, AIAnalyticsInsight } from '../types';
import { getAllEmployees, generateCareerRecommendation, getDepartmentAnalyticsData, generateDepartmentInsights } from '../services/mockApi';
import Card from './common/Card';
import Spinner from './common/Spinner';
import PerformanceBarChart from './charts/PerformanceBarChart';
import PerformancePieChart from './charts/PerformancePieChart';
import DepartmentTrendChart from './charts/DepartmentTrendChart';


// --- Career Path AI Component (Tab 2) ---
const CareerPathAI: React.FC = () => {
  const [employees, setEmployees] = useState<UserProfile[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [recommendation, setRecommendation] = useState<CareerPathRecommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const emps = await getAllEmployees();
        setEmployees(emps);
      } catch (err) {
        setError("Failed to load employee list.");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const handleGenerateClick = async () => {
    if (!selectedEmployeeId) return;

    setIsGenerating(true);
    setRecommendation(null);
    setError(null);
    try {
      const result = await generateCareerRecommendation(selectedEmployeeId);
      setRecommendation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while generating the recommendation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedEmployee = employees.find(e => e.employeeId === selectedEmployeeId);

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-grow">
            <label htmlFor="employee-select" className="block text-sm font-medium text-gray-700">Select Employee</label>
            <select
              id="employee-select"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
              disabled={loading}
            >
              <option value="" disabled>{loading ? 'Loading...' : 'Choose an employee'}</option>
              {employees.map(emp => (
                <option key={emp.employeeId} value={emp.employeeId}>{emp.name} ({emp.department})</option>
              ))}
            </select>
          </div>
          <div className="self-end">
            <button
              onClick={handleGenerateClick}
              disabled={!selectedEmployeeId || isGenerating}
              className="w-full sm:w-auto bg-teal-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Analyzing...</span>
                </>
              ) : 'Generate'}
            </button>
          </div>
        </div>
      </Card>
      
      {isGenerating && (
        <div className="text-center p-8">
            <Spinner />
            <p className="mt-4 text-gray-600">AI is analyzing 6 months of performance data...<br/>This may take a moment.</p>
        </div>
      )}

      {error && (
        <Card>
            <p className="text-red-600 font-semibold">Error:</p>
            <p className="text-gray-700">{error}</p>
        </Card>
      )}

      {recommendation && selectedEmployee && (
        <Card>
            <div className="p-4 border-b">
                <div className="flex items-center space-x-4">
                    <img src={selectedEmployee.avatar} alt={selectedEmployee.name} className="w-16 h-16 rounded-full" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{selectedEmployee.name}</h2>
                        <p className="text-gray-500">Current Role: {selectedEmployee.position}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-lg text-green-700 mb-2">Strengths</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {(recommendation.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </div>
                 <div>
                    <h3 className="font-semibold text-lg text-amber-700 mb-2">Areas for Improvement</h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {(recommendation.areasForImprovement || []).map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                </div>
            </div>
            <div className="p-4 border-t">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Recommended Career Path</h3>
                <div className="flex items-center space-x-2 text-sm sm:text-base overflow-x-auto pb-2">
                    <span className="font-bold text-teal-700 whitespace-nowrap">{selectedEmployee.position}</span>
                    {(recommendation.recommendedPath || []).map((role, i) => (
                        <React.Fragment key={i}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                             <span className="font-bold text-teal-700 whitespace-nowrap">{role}</span>
                        </React.Fragment>
                    ))}
                </div>
            </div>
             <div className="p-4 bg-teal-50/50">
                <h3 className="font-semibold text-lg text-gray-800 mb-3">Your Next Step: {recommendation.nextStep?.role || 'N/A'}</h3>
                <p className="text-sm text-gray-600 mb-4">Estimated Timeline: <span className="font-semibold text-gray-800">{recommendation.nextStep?.estimatedTimeline || 'N/A'}</span></p>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Skills to Develop:</h4>
                        <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                            {(recommendation.nextStep?.skillsToDevelop || []).map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Recommended Training:</h4>
                         <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                            {(recommendation.nextStep?.recommendedTraining || []).map((t, i) => <li key={i}>{t}</li>)}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                 <p className="text-center italic text-gray-600">"{recommendation.motivationalMessage}"</p>
            </div>
        </Card>
      )}

       {!recommendation && !isGenerating && !error && (
            <div className="text-center p-8 text-gray-500">
                <p>Select an employee and click 'Generate' to see their AI-powered career path recommendation.</p>
            </div>
        )}
    </div>
  );
};


// --- Department Analytics Component (Tab 1) ---
const DepartmentAnalytics: React.FC = () => {
    const [analyticsData, setAnalyticsData] = useState<DepartmentAnalyticsData | null>(null);
    const [insights, setInsights] = useState<AIAnalyticsInsight | null>(null);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDepartmentAnalyticsData();
                setAnalyticsData(data);
                const latestMonth = Object.keys(data).sort().reverse()[0];
                setSelectedMonth(latestMonth);
            } catch (err) {
                setError("Failed to load analytics data.");
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedMonth && analyticsData) {
            const fetchInsights = async () => {
                setInsights(null);
                try {
                    const insightData = await generateDepartmentInsights(analyticsData[selectedMonth]);
                    setInsights(insightData);
                } catch (err) {
                    setError("Failed to generate AI insights.");
                }
            };
            fetchInsights();
        }
    }, [selectedMonth, analyticsData]);

    useEffect(() => {
        if(analyticsData) setLoading(false);
    }, [analyticsData])


    if (loading) return <Spinner />;
    if (error) return <Card><p className="text-red-600">{error}</p></Card>;
    if (!analyticsData) return null;

    const monthlyData = analyticsData[selectedMonth] || [];
    const totalAttendance = monthlyData.reduce((acc, dept) => acc + dept.present + dept.absent, 0);
    const totalPresent = monthlyData.reduce((acc, dept) => acc + dept.present, 0);
    const pieData = [
        { name: 'Present', value: totalPresent },
        { name: 'Absent', value: totalAttendance - totalPresent },
    ];
    const rankedDepts = [...monthlyData].sort((a, b) => b.avgKpi - a.avgKpi);

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-lg text-gray-800">Department Performance Dashboard</h2>
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                    >
                        {Object.keys(analyticsData).sort().reverse().map(month => (
                            <option key={month} value={month}>{new Date(month + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</option>
                        ))}
                    </select>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Avg. KPI Score"><p className="text-3xl font-bold text-teal-600">{(monthlyData.reduce((acc, d) => acc + d.avgKpi, 0) / monthlyData.length).toFixed(1)}</p></Card>
                <Card title="Total Late Arrivals"><p className="text-3xl font-bold text-amber-600">{monthlyData.reduce((acc, d) => acc + d.lateCount, 0)}</p></Card>
                <Card title="Attendance Rate"><p className="text-3xl font-bold text-sky-600">{((totalPresent / totalAttendance) * 100).toFixed(1)}%</p></Card>
            </div>
            
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3">
                    <Card title="KPI Score by Department">
                        <PerformanceBarChart data={monthlyData.map(d => ({ name: d.department, score: d.avgKpi }))} />
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card title="Overall Attendance">
                       <PerformancePieChart data={pieData} />
                    </Card>
                </div>
            </div>
            
            <Card title="3-Month KPI Trend">
                <DepartmentTrendChart analyticsData={analyticsData} />
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Performance Rankings">
                     <ol className="space-y-3">
                        {rankedDepts.map((dept, index) => (
                            <li key={dept.department} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm font-bold w-6 text-center">{index + 1}</span>
                                    <span className="font-semibold text-gray-700">{dept.department}</span>
                                </div>
                                <span className="font-bold text-teal-700">{dept.avgKpi.toFixed(1)}</span>
                            </li>
                        ))}
                     </ol>
                </Card>
                <Card title="Automated AI Insights">
                    {!insights ? <Spinner /> : (
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-amber-700">Highlight Area</h4>
                                <p className="text-sm text-gray-600"><strong>{insights.highlight.department}:</strong> {insights.highlight.details}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-green-700">Positive Trend</h4>
                                <p className="text-sm text-gray-600"><strong>{insights.positive_trend.department}:</strong> {insights.positive_trend.details}</p>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sky-700">Recommendations</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                                   {(insights.recommendations || []).map(rec => (
                                       <li key={rec.department}><strong>{rec.department}:</strong> {rec.recommendation}</li>
                                   ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};


// --- Main Component with Tabs ---
const AdminAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center">
         <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Analytics & AI Hub</h1>
          <div className="border-b border-gray-200 mt-4 sm:mt-0">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Department Analytics
              </button>
              <button
                onClick={() => setActiveTab('career')}
                className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'career' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Career Path AI
              </button>
            </nav>
          </div>
      </div>

      <div>
        {activeTab === 'analytics' ? <DepartmentAnalytics /> : <CareerPathAI />}
      </div>
    </div>
  );
};

export default AdminAnalytics;

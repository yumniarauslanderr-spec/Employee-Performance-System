

import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount, UserProfile, EmployeeSchedule, ScheduleStatus, ScheduleDayDetails } from '../types';
import { getTeamByDepartment, getScheduleForTeam, saveSchedules } from '../services/mockApi';
import Card from './common/Card';
import Spinner from './common/Spinner';

interface TeamScheduleProps {
  user: UserAccount;
}

const TeamSchedule: React.FC<TeamScheduleProps> = ({ user }) => {
  const [team, setTeam] = useState<UserProfile[]>([]);
  const [schedules, setSchedules] = useState<EmployeeSchedule[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const currentMonthStr = useMemo(() => currentDate.toISOString().substring(0, 7), [currentDate]);

  const fetchData = async () => {
    if (!user.department) return;
    setLoading(true);
    setHasChanges(false);
    const [teamData, scheduleData] = await Promise.all([
      getTeamByDepartment(user.department),
      getScheduleForTeam(user.department, currentMonthStr),
    ]);
    setTeam(teamData);
    setSchedules(scheduleData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.department, currentMonthStr]);

  const handleScheduleChange = (employeeId: string, day: string, field: 'status' | 'startTime' | 'endTime', value: string) => {
      setSchedules(prevSchedules =>
          prevSchedules.map(s => {
              if (s.employeeId === employeeId) {
                  const daySchedule = s.schedule[day] || { status: ScheduleStatus.Workday };
                  const newDaySchedule: ScheduleDayDetails = {
                      ...daySchedule,
                      [field]: value,
                  };

                  // If status is changed to not a workday, clear times
                  if (field === 'status' && value !== ScheduleStatus.Workday) {
                      delete newDaySchedule.startTime;
                      delete newDaySchedule.endTime;
                  }
                  
                  const newSchedule = { ...s.schedule, [day]: newDaySchedule };
                  return { ...s, schedule: newSchedule };
              }
              return s;
          })
      );
      setHasChanges(true);
  };
  
  const handleSaveChanges = async () => {
    setIsSaving(true);
    await saveSchedules(schedules);
    setIsSaving(false);
    setHasChanges(false);
  };
  
  const changeMonth = (offset: number) => {
    setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setMonth(newDate.getMonth() + offset);
        return newDate;
    });
  };

  const getStatusColor = (status?: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.Workday: return 'bg-white';
      case ScheduleStatus.DayOff: return 'bg-gray-200';
      case ScheduleStatus.OnLeave: return 'bg-blue-200';
      default: return 'bg-gray-50';
    }
  };

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    return new Date(year, month, 0).getDate();
  }, [currentDate]);

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Team Schedule</h1>
        <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button onClick={handleSaveChanges} disabled={!hasChanges || isSaving} className="w-full sm:w-auto bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
      </div>
      <Card>
        <div className="flex items-center justify-between mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-md hover:bg-gray-100">&lt;</button>
            <h2 className="text-lg font-semibold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-md hover:bg-gray-100">&gt;</button>
        </div>
        {loading ? <Spinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-center table-fixed">
              <colgroup>
                <col style={{ width: '150px' }} />
                {daysArray.map(day => <col key={day} style={{ width: '130px' }} />)}
              </colgroup>
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gray-100 p-2 border font-semibold text-gray-600 z-10">Employee</th>
                  {daysArray.map(day => <th key={day} className="p-2 border font-semibold text-gray-600">{day}</th>)}
                </tr>
              </thead>
              <tbody className="text-sm">
                {team.map(employee => {
                  const schedule = schedules.find(s => s.employeeId === employee.employeeId);
                  return (
                    <tr key={employee.employeeId}>
                      <td className="sticky left-0 bg-white p-2 border font-medium text-gray-800 text-left z-10">{employee.name}</td>
                      {daysArray.map(day => {
                        const dayStr = day.toString().padStart(2, '0');
                        const daySchedule = schedule?.schedule[dayStr];
                        const status = daySchedule?.status || ScheduleStatus.Workday;
                        return (
                          <td key={`${employee.employeeId}-${dayStr}`} className={`p-1 border align-top ${getStatusColor(status)}`}>
                            <select
                                value={status}
                                onChange={(e) => handleScheduleChange(employee.employeeId, dayStr, 'status', e.target.value)}
                                className={`w-full mb-1 p-1 border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-teal-500 appearance-none text-center ${getStatusColor(status)}`}
                            >
                                <option value={ScheduleStatus.Workday}>Work</option>
                                <option value={ScheduleStatus.DayOff}>Off</option>
                                <option value={ScheduleStatus.OnLeave}>Leave</option>
                            </select>
                            {status === ScheduleStatus.Workday && (
                                <div className="space-y-1">
                                    <input 
                                      type="time"
                                      value={daySchedule?.startTime || '09:00'}
                                      onChange={(e) => handleScheduleChange(employee.employeeId, dayStr, 'startTime', e.target.value)}
                                      className="w-full border-gray-300 rounded-md text-xs p-0.5 text-center"
                                    />
                                    <input 
                                      type="time"
                                      value={daySchedule?.endTime || '17:00'}
                                      onChange={(e) => handleScheduleChange(employee.employeeId, dayStr, 'endTime', e.target.value)}
                                      className="w-full border-gray-300 rounded-md text-xs p-0.5 text-center"
                                    />
                                </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
       <Card title="Legend">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-white border mr-2"></span> Workday</div>
            <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-gray-200 border mr-2"></span> Day Off</div>
            <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-blue-200 border mr-2"></span> On Leave</div>
          </div>
      </Card>
    </div>
  );
};

export default TeamSchedule;
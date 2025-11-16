
import React, { useState, useEffect, useMemo } from 'react';
import { UserAccount, EmployeeSchedule, ScheduleStatus } from '../types';
import { getScheduleForEmployee } from '../services/mockApi';
import Card from './common/Card';
import Spinner from './common/Spinner';

interface MyScheduleProps {
  user: UserAccount;
}

const MySchedule: React.FC<MyScheduleProps> = ({ user }) => {
  const [schedule, setSchedule] = useState<EmployeeSchedule | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const currentMonthStr = useMemo(() => currentDate.toISOString().substring(0, 7), [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    const scheduleData = await getScheduleForEmployee(user.employeeId, currentMonthStr);
    setSchedule(scheduleData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user.employeeId, currentMonthStr]);

  const changeMonth = (offset: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(1); // Set to the first day to avoid month-end issues
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const blanks = Array(firstDayOfMonth).fill(null);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatusInfo = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.Workday:
        return { text: 'Workday', color: 'bg-teal-100 text-teal-800' };
      case ScheduleStatus.DayOff:
        return { text: 'Day Off', color: 'bg-gray-200 text-gray-700' };
      case ScheduleStatus.OnLeave:
        return { text: 'On Leave', color: 'bg-blue-100 text-blue-800' };
      default:
        return { text: 'Workday', color: 'bg-teal-100 text-teal-800' };
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Schedule</h1>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
          <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {loading ? <Spinner /> : (
          <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-center bg-gray-100 font-semibold text-sm text-gray-600">{day}</div>
            ))}
            {blanks.map((_, index) => <div key={`blank-${index}`} className="bg-gray-50"></div>)}
            {daysArray.map(day => {
              const dayStr = day.toString().padStart(2, '0');
              const daySchedule = schedule?.schedule[dayStr];
              const status = daySchedule?.status || ScheduleStatus.Workday;
              const statusInfo = getStatusInfo(status);

              return (
                <div key={day} className="p-2 bg-white min-h-[120px] flex flex-col">
                  <span className="font-semibold text-gray-800">{day}</span>
                  <div className="mt-1 flex-grow">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                    {status === ScheduleStatus.Workday && daySchedule?.startTime && daySchedule?.endTime && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p>{daySchedule.startTime} - {daySchedule.endTime}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
      <Card title="Legend">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-teal-100 border mr-2"></span> Workday</div>
          <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-gray-200 border mr-2"></span> Day Off</div>
          <div className="flex items-center"><span className="w-4 h-4 rounded-full bg-blue-100 border mr-2"></span> On Leave</div>
        </div>
      </Card>
    </div>
  );
};

export default MySchedule;

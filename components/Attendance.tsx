
import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, AttendanceRecord, AbsenceType } from '../types';
import { getAttendanceForEmployee, recordCheckIn, recordCheckOut } from '../services/mockApi';
import Card from './common/Card';
import Spinner from './common/Spinner';

declare global {
    interface Window {
        QRCode: new (element: HTMLElement | string, options: any) => any;
    }
}

interface AttendanceProps {
  user: UserAccount;
}

const Attendance: React.FC<AttendanceProps> = ({ user }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
  
  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAttendanceForEmployee(user.employeeId, currentMonth);
      setRecords(data);
      
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRec = data.find(r => r.date === todayStr) || null;
      setTodayRecord(todayRec);
    } catch (e) {
      setError('Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.employeeId]);
  
  useEffect(() => {
        if (qrCodeRef.current && typeof window.QRCode !== 'undefined') {
            qrCodeRef.current.innerHTML = '';
            new window.QRCode(qrCodeRef.current, {
                text: JSON.stringify({ userId: user.employeeId, timestamp: Date.now() }),
                width: 128,
                height: 128,
                colorDark: "#0D2C54",
                colorLight: "#ffffff",
            });
        }
  }, [user.employeeId]);

  const handleCheckIn = async (method: 'QR' | 'GPS' | 'Token') => {
    setIsProcessing(true);
    setError('');
    try {
        await recordCheckIn(user.employeeId, method);
        fetchData();
        alert(`Successfully checked in via ${method}.`);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsProcessing(false);
    }
  };

   const handleCheckOut = async (method: 'QR' | 'GPS' | 'Token') => {
    setIsProcessing(true);
    setError('');
    try {
        await recordCheckOut(user.employeeId, method);
        fetchData();
        alert(`Successfully checked out via ${method}.`);
    } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
        setIsProcessing(false);
    }
  };

  const renderStatus = () => {
    if (!todayRecord || !todayRecord.checkIn) {
        return <p className="text-gray-500">You have not checked in today.</p>;
    }
    if (todayRecord.checkIn && !todayRecord.checkOut) {
        return <p className="text-green-700 font-semibold">Checked in at: {new Date(todayRecord.checkIn).toLocaleTimeString()}</p>;
    }
    if (todayRecord.checkIn && todayRecord.checkOut) {
        return <p className="text-blue-700 font-semibold">Completed for today. Total hours: {todayRecord.totalHours}</p>;
    }
    return null;
  };

  const getAbsenceTypeClass = (type: AbsenceType) => {
    switch(type) {
        case AbsenceType.Present: return 'bg-green-100 text-green-800';
        case AbsenceType.Late: return 'bg-yellow-100 text-yellow-800';
        case AbsenceType.Absent: return 'bg-red-100 text-red-800';
        case AbsenceType.MissingCheckout: return 'bg-orange-100 text-orange-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Attendance</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
            <Card title="Today's Status">
                <div className="space-y-3">
                    {renderStatus()}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            </Card>
            <Card title="Check-in / Check-out">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">Choose your preferred method. Clicking the QR code simulates a scan.</p>
                    <div className="flex justify-center my-4">
                        <div ref={qrCodeRef} className="p-2 border rounded-lg inline-block cursor-pointer" onClick={() => !todayRecord?.checkIn ? handleCheckIn('QR') : handleCheckOut('QR')}></div>
                    </div>
                     <button onClick={() => !todayRecord?.checkIn ? handleCheckIn('GPS') : handleCheckOut('GPS')} disabled={isProcessing} className="w-full bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-sky-700 transition-colors disabled:bg-gray-400">
                        Use GPS
                    </button>
                    <div className="flex items-center space-x-2">
                        <input type="text" placeholder="Enter Token" defaultValue={`TODAY${new Date().getDate()}`} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"/>
                        <button onClick={() => !todayRecord?.checkIn ? handleCheckIn('Token') : handleCheckOut('Token')} disabled={isProcessing} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 whitespace-nowrap">
                           Submit
                        </button>
                    </div>
                </div>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <Card title={`Attendance Log - ${new Date(currentMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}`}>
                {loading ? <Spinner /> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b bg-gray-50">
                                    <th className="p-3 font-semibold text-gray-600">Date</th>
                                    <th className="p-3 font-semibold text-gray-600">Status</th>
                                    <th className="p-3 font-semibold text-gray-600">Check-in</th>
                                    <th className="p-3 font-semibold text-gray-600">Check-out</th>
                                    <th className="p-3 font-semibold text-gray-600">Late (min)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map(r => (
                                <tr key={r.attendanceId} className="border-b hover:bg-gray-50">
                                    <td className="p-3 text-sm text-gray-800">{new Date(r.date + 'T12:00:00Z').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short'})}</td>
                                    <td className="p-3"><span className={`px-2 py-1 text-xs rounded-full ${getAbsenceTypeClass(r.absenceType)}`}>{r.absenceType}</span></td>
                                    <td className="p-3 text-sm text-gray-600">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : 'N/A'}</td>
                                    <td className="p-3 text-sm text-gray-600">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : 'N/A'}</td>
                                    <td className="p-3 text-sm font-medium">{r.lateMinutes > 0 ? <span className="text-yellow-600">{r.lateMinutes}</span> : '-'}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Attendance;

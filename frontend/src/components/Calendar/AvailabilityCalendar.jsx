import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  addDays,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../api/axios';

const AvailabilityCalendar = ({ driverId = null, isEmployerMode = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAvailabilities();
  }, [currentDate, driverId]);

  const fetchAvailabilities = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = isEmployerMode 
        ? `/hirer/drivers/${driverId}/availability` 
        : `/driver/availability`;
      
      console.log('Fetching availabilities from:', endpoint);
      const response = await api.get(endpoint);
      console.log('Availability response:', response.data);
      
      if (response.data.success) {
        setAvailabilities(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to load availability calendar.');
      }
    } catch (err) {
      setError('Failed to load availability calendar. ' + (err.response?.data?.message || err.message));
      console.error('Availability fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleDate = async (day) => {
    // Only drivers can toggle dates
    if (isEmployerMode) return;
    
    // Cannot toggle past dates
    if (isBefore(day, startOfDay(new Date()))) return;

    setUpdating(true);
    const dateStr = format(day, 'yyyy-MM-dd');
    const existing = availabilities.find(a => a.date.startsWith(dateStr));
    
    if (existing && existing.status === 'booked') {
        setUpdating(false);
        return;
    }

    const newStatus = existing && existing.status === 'unavailable' ? 'available' : 'unavailable';

    try {
      await api.post('/driver/availability', {
        date: dateStr,
        status: newStatus
      });
      await fetchAvailabilities();
    } catch (err) {
      console.error(err);
      setError('Failed to update date. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-white uppercase tracking-wider">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentDate);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-bold text-xs uppercase tracking-wider text-slate-500 py-2">
          {format(addDays(startDate, i), 'EEE')}
        </div>
      );
    }

    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const dateStr = format(day, 'yyyy-MM-dd');
        
        const isPast = isBefore(day, startOfDay(new Date()));
        const record = Array.isArray(availabilities) 
            ? availabilities.find(a => a && a.date && typeof a.date === 'string' && a.date.startsWith(dateStr))
            : null;
        
        let status = 'available';
        if (record) status = record.status;
        if (isPast) status = 'past';

        let bgClass = 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/50';
        let textClass = 'text-slate-300';
        let icon = null;

        if (status === 'past') {
          bgClass = 'bg-slate-900/50 border-slate-800/50 opacity-50';
          textClass = 'text-slate-600';
        } else if (status === 'unavailable') {
          bgClass = 'bg-red-900/20 border-red-500/30 hover:bg-red-900/40';
          textClass = 'text-red-400';
          icon = <XCircle className="w-3 h-3 absolute top-2 right-2 opacity-50" />;
        } else if (status === 'booked') {
          bgClass = 'bg-amber-900/20 border-amber-500/30';
          textClass = 'text-amber-400';
          icon = <AlertCircle className="w-3 h-3 absolute top-2 right-2 opacity-50" />;
        } else {
            icon = <CheckCircle className="w-3 h-3 absolute top-2 right-2 text-brandMint/30" />;
            if (!isEmployerMode) {
                bgClass = 'bg-slate-800/50 hover:bg-brandMint/10 hover:border-brandMint/50 border-slate-700/50 cursor-pointer transition-all';
            }
        }

        days.push(
          <div
            key={day}
            onClick={() => toggleDate(cloneDay)}
            className={`relative flex flex-col items-center justify-center h-20 border rounded-xl m-1 ${
              !isSameMonth(day, monthStart) ? 'opacity-30' : ''
            } ${bgClass} ${updating ? 'pointer-events-none opacity-50' : ''} ${!isEmployerMode && status !== 'past' && status !== 'booked' ? 'cursor-pointer' : ''}`}
          >
            <span className={`text-sm font-bold ${textClass}`}>{formattedDate}</span>
            {icon}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 shadow-2xl">
      {error && (
        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandMint"></div>
        </div>
      ) : (
        <>
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            
            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wider text-slate-400 justify-center">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600"></div> Available</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-900/50 border border-red-500/50"></div> Unavailable</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-900/50 border border-amber-500/50"></div> Booked</div>
            </div>
            
            {!isEmployerMode && (
                <div className="mt-4 text-center text-xs text-slate-500">
                    Click any available date to mark it as <span className="text-red-400">Unavailable</span>.
                </div>
            )}
        </>
      )}
    </div>
  );
};

export default AvailabilityCalendar;

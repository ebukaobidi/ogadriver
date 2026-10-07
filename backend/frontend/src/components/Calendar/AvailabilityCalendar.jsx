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
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
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
    if (isEmployerMode) return;
    if (isBefore(day, startOfDay(new Date()))) return;

    setUpdating(true);
    const dateStr = format(day, 'yyyy-MM-dd');
    const existing = availabilities.find(a => a.date && typeof a.date === 'string' && a.date.startsWith(dateStr));
    
    if (existing && (existing.status === 'booked' || existing.status === 'scheduled')) {
        setUpdating(false);
        return;
    }

    const newStatus = existing && existing.status === 'unavailable' ? 'available' : 'unavailable';

    // Optimistic Update
    const newAvails = [...availabilities];
    if (newStatus === 'available') {
      const idx = newAvails.findIndex(a => a.date && typeof a.date === 'string' && a.date.startsWith(dateStr));
      if (idx !== -1) newAvails.splice(idx, 1);
    } else {
      const idx = newAvails.findIndex(a => a.date && typeof a.date === 'string' && a.date.startsWith(dateStr));
      if (idx !== -1) newAvails[idx].status = 'unavailable';
      else newAvails.push({ date: dateStr, status: 'unavailable' });
    }
    setAvailabilities(newAvails);

    try {
      await api.post('/driver/availability', {
        date: dateStr,
        status: newStatus
      });
      // Silent sync
      const endpoint = isEmployerMode ? `/hirer/drivers/${driverId}/availability` : `/driver/availability`;
      const response = await api.get(endpoint);
      if (response.data.success) {
        setAvailabilities(response.data.data || []);
      }
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
        } else if (status === 'booked' || status === 'scheduled') {
          bgClass = 'bg-emerald-900/30 border-[#1cd188]/50';
          textClass = 'text-[#1cd188]';
          icon = <CheckCircle className="w-3 h-3 absolute top-2 right-2 text-[#1cd188]" />;
        } else {
            icon = <CheckCircle className="w-3 h-3 absolute top-2 right-2 text-[#1cd188]/30" />;
            if (!isEmployerMode) {
                bgClass = 'bg-slate-800/50 hover:bg-[#1cd188]/10 hover:border-[#1cd188]/50 border-slate-700/50 cursor-pointer transition-all';
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
    <div className="bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-2xl max-w-2xl mx-auto space-y-5">
      {/* Header Section */}
      <div className="space-y-2 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-[#1cd188]" />
          <h3 className="text-xl font-black text-white uppercase tracking-wider">MANAGE AVAILABILITY</h3>
        </div>
        <p className="text-slate-400 text-xs leading-relaxed">
          Employers check your availability before sending hiring proposals. Block out days when you are off-duty or unavailable.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1cd188]"></div>
        </div>
      ) : (
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-white/5 space-y-4 shadow-inner">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
            
            <div className="pt-4 border-t border-white/5 flex flex-wrap gap-5 text-xs font-bold uppercase tracking-wider text-slate-300 justify-center">
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-600"></div> Available</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div> Booked</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div> Unavailable</div>
            </div>
            
            {!isEmployerMode && (
                <div className="text-center text-xs space-y-0.5 pt-2">
                    <p className="text-[#1cd188] font-bold">Tap available days to toggle to Unavailable.</p>
                    <p className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">Unavailable days show as off-duty.</p>
                </div>
            )}

            
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const MaidSchedule = () => {
  const [weeklySchedule, setWeeklySchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [blockedSlots, setBlockedSlots] = useState([]);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Initialize weekly schedule
  useEffect(() => {
    fetchWeeklySchedule();
    fetchBlockedSlots();
  }, []);

  // Fetch maid's weekly schedule
  const fetchWeeklySchedule = async () => {
    try {
      const response = await api.get('/maids/schedule/weekly');
      setWeeklySchedule(response.data.data || []);
    } catch (err) {
      console.error('Error fetching schedule:', err);
    }
  };

  // Fetch blocked slots
  const fetchBlockedSlots = async () => {
    try {
      const response = await api.get('/maids/schedule/blocked-slots');
      setBlockedSlots(response.data.data || []);
    } catch (err) {
      console.error('Error fetching blocked slots:', err);
    }
  };

  // Handle time change
  const handleTimeChange = (dayOfWeek, field, value) => {
    const updatedSchedule = weeklySchedule.map((day) => {
      if (day.dayOfWeek === dayOfWeek) {
        return { ...day, [field]: value };
      }
      return day;
    });
    setWeeklySchedule(updatedSchedule);
  };

  // Handle availability toggle
  const handleAvailabilityToggle = (dayOfWeek) => {
    const updatedSchedule = weeklySchedule.map((day) => {
      if (day.dayOfWeek === dayOfWeek) {
        return { ...day, isAvailable: !day.isAvailable };
      }
      return day;
    });
    setWeeklySchedule(updatedSchedule);
  };

  // Save weekly schedule
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await api.put('/maids/schedule/weekly', {
        weeklySchedule: weeklySchedule,
      });

      setSuccess(response.data.message);
      setWeeklySchedule(response.data.data);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update schedule');
    } finally {
      setLoading(false);
    }
  };

  // Unblock a slot
  const handleUnblockSlot = async (slotId) => {
    try {
      await api.delete(`/maids/schedule/block-slot/${slotId}`);
      fetchBlockedSlots();
      setSuccess('Blocked slot removed');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unblock slot');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">📅 My Availability Schedule</h1>
          <p className="text-gray-600 mt-2">Set your working hours and manage blocked time slots</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Weekly Schedule Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Working Hours</h2>

          <form onSubmit={handleSaveSchedule} className="space-y-6">
            {weeklySchedule.length === 0 ? (
              <p className="text-gray-600">Loading schedule...</p>
            ) : (
              <div className="space-y-4">
                {weeklySchedule.map((day) => (
                  <div key={day.dayOfWeek} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {daysOfWeek[day.dayOfWeek]}
                      </h3>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={day.isAvailable}
                          onChange={() => handleAvailabilityToggle(day.dayOfWeek)}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          Available
                        </span>
                      </label>
                    </div>

                    {day.isAvailable && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Start Time
                          </label>
                          <input
                            type="time"
                            value={day.startTime}
                            onChange={(e) =>
                              handleTimeChange(day.dayOfWeek, 'startTime', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            End Time
                          </label>
                          <input
                            type="time"
                            value={day.endTime}
                            onChange={(e) =>
                              handleTimeChange(day.dayOfWeek, 'endTime', e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
                loading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {loading ? 'Saving...' : 'Save Schedule'}
            </button>
          </form>
        </div>

        {/* Blocked Slots Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Blocked Time Slots</h2>

          {blockedSlots.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No blocked slots. You're available to accept all bookings!
            </p>
          ) : (
            <div className="space-y-3">
              {blockedSlots.map((slot) => (
                <div
                  key={slot._id}
                  className="flex items-center justify-between border border-red-200 bg-red-50 rounded-lg p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {new Date(slot.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      {slot.startTime} - {slot.endTime} {slot.reason && `• ${slot.reason}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnblockSlot(slot._id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MaidSchedule;

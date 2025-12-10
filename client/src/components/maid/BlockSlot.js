import React, { useState } from 'react';
import api from '../../utils/api';

const BlockSlot = ({ onBlockSuccess }) => {
  const [formData, setFormData] = useState({
    date: '',
    startTime: '00:00',
    endTime: '23:59',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isFullDay, setIsFullDay] = useState(true);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.date) {
      setError('Please select a date');
      return;
    }

    if (!isFullDay && formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/maids/schedule/block-slot', {
        date: formData.date,
        startTime: isFullDay ? '00:00' : formData.startTime,
        endTime: isFullDay ? '23:59' : formData.endTime,
        reason: formData.reason || 'Unavailable',
      });

      setSuccess(response.data.message);

      // Reset form
      setFormData({
        date: '',
        startTime: '00:00',
        endTime: '23:59',
        reason: '',
      });

      // Notify parent component
      if (onBlockSuccess) {
        onBlockSuccess();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to block slot');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">🚫 Block Time Slot</h3>
      <p className="text-gray-600 mb-6">
        Block specific dates or times when you're not available for bookings
      </p>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={today}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Block Type Toggle */}
        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isFullDay}
              onChange={(e) => setIsFullDay(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Block entire day
            </span>
          </label>
        </div>

        {/* Time Range (if not full day) */}
        {!isFullDay && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason (Optional)
          </label>
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="e.g., Personal appointment, Sick leave"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 rounded-lg text-white font-medium ${
            loading
              ? 'bg-indigo-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {loading ? 'Blocking...' : 'Block Slot'}
        </button>
      </form>
    </div>
  );
};

export default BlockSlot;

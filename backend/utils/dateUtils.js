/**
 * Date and Time Formatting Utilities
 * Provides consistent date/time formatting across the backend
 */

/**
 * Format a date to human-readable format (e.g., "Monday, January 15, 2024")
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string
 */
const formatDate = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a date to ISO 8601 format (YYYY-MM-DD) for storage
 * @param {Date|string} date - Date object or date string
 * @returns {string} ISO formatted date string (YYYY-MM-DD)
 */
const formatDateISO = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format time in 24-hour format (HH:MM)
 * @param {string|Date} time - Time string (HH:MM or HH:MM:SS) or Date object
 * @returns {string} Formatted time string in 24-hour format (HH:MM)
 */
const formatTime = (time) => {
  if (!time) return '';
  
  // If it's a Date object
  if (time instanceof Date) {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // If it's a string, extract HH:MM
  const timeStr = String(time);
  const parts = timeStr.split(':');
  
  if (parts.length >= 2) {
    const hours = String(parts[0]).padStart(2, '0');
    const minutes = String(parts[1]).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  return timeStr;
};

/**
 * Check if a date is a weekday (Monday-Friday)
 * @param {Date|string} date - Date object or ISO string
 * @returns {boolean} True if weekday, false if weekend
 */
const isWeekday = (date) => {
  if (!date) return false;
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return false;
  }
  
  const dayOfWeek = dateObj.getDay();
  // 0 = Sunday, 6 = Saturday
  return dayOfWeek >= 1 && dayOfWeek <= 5;
};

/**
 * Get the day name for a given date
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Day name (e.g., "Monday", "Tuesday")
 */
const getDayName = (date) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
};

/**
 * Validate if a date string is in ISO 8601 format (YYYY-MM-DD)
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid ISO format
 */
const isValidISODate = (dateString) => {
  if (!dateString || typeof dateString !== 'string') return false;
  
  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Parse ISO date string to Date object
 * @param {string} isoString - ISO date string (YYYY-MM-DD)
 * @returns {Date|null} Date object or null if invalid
 */
const parseISODate = (isoString) => {
  if (!isoString) return null;
  
  const date = new Date(isoString);
  return isNaN(date.getTime()) ? null : date;
};

export {
  formatDate,
  formatDateISO,
  formatTime,
  isWeekday,
  getDayName,
  isValidISODate,
  parseISODate,
};

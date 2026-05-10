import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateISO,
  formatTime,
  isWeekday,
  getDayName,
  formatDateShort,
  parseISODate,
} from './dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format Date object to human-readable format', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDate(date);
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should format ISO string to human-readable format', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('January');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should return empty string for null/undefined', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('');
    });
  });

  describe('formatDateISO', () => {
    it('should format Date object to ISO 8601 format', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      const result = formatDateISO(date);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result).toContain('2024');
      expect(result).toContain('01');
    });

    it('should format string date to ISO format', () => {
      const result = formatDateISO('2024-01-15');
      expect(result).toBe('2024-01-15');
    });

    it('should pad single digit months and days', () => {
      const date = new Date('2024-03-05T12:00:00Z');
      const result = formatDateISO(date);
      expect(result).toMatch(/^\d{4}-03-05$/);
    });

    it('should return empty string for null/undefined', () => {
      expect(formatDateISO(null)).toBe('');
      expect(formatDateISO(undefined)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDateISO('invalid-date')).toBe('');
    });
  });

  describe('formatTime', () => {
    it('should format time string with seconds to HH:MM', () => {
      expect(formatTime('09:30:00')).toBe('09:30');
      expect(formatTime('14:45:30')).toBe('14:45');
    });

    it('should format time string without seconds', () => {
      expect(formatTime('09:30')).toBe('09:30');
      expect(formatTime('14:45')).toBe('14:45');
    });

    it('should format Date object to HH:MM', () => {
      const date = new Date('2024-01-15T09:30:00Z');
      const result = formatTime(date);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('should pad single digit hours and minutes', () => {
      expect(formatTime('9:5')).toBe('09:05');
    });

    it('should return empty string for null/undefined', () => {
      expect(formatTime(null)).toBe('');
      expect(formatTime(undefined)).toBe('');
      expect(formatTime('')).toBe('');
    });
  });

  describe('isWeekday', () => {
    it('should return true for Monday', () => {
      const monday = new Date('2024-01-15'); // Monday
      expect(isWeekday(monday)).toBe(true);
    });

    it('should return true for Tuesday', () => {
      const tuesday = new Date('2024-01-16'); // Tuesday
      expect(isWeekday(tuesday)).toBe(true);
    });

    it('should return true for Wednesday', () => {
      const wednesday = new Date('2024-01-17'); // Wednesday
      expect(isWeekday(wednesday)).toBe(true);
    });

    it('should return true for Thursday', () => {
      const thursday = new Date('2024-01-18'); // Thursday
      expect(isWeekday(thursday)).toBe(true);
    });

    it('should return true for Friday', () => {
      const friday = new Date('2024-01-19'); // Friday
      expect(isWeekday(friday)).toBe(true);
    });

    it('should return false for Saturday', () => {
      const saturday = new Date('2024-01-20'); // Saturday
      expect(isWeekday(saturday)).toBe(false);
    });

    it('should return false for Sunday', () => {
      const sunday = new Date('2024-01-21'); // Sunday
      expect(isWeekday(sunday)).toBe(false);
    });

    it('should work with ISO string', () => {
      expect(isWeekday('2024-01-15')).toBe(true); // Monday
      expect(isWeekday('2024-01-20')).toBe(false); // Saturday
    });

    it('should return false for null/undefined', () => {
      expect(isWeekday(null)).toBe(false);
      expect(isWeekday(undefined)).toBe(false);
    });

    it('should return false for invalid date', () => {
      expect(isWeekday('invalid-date')).toBe(false);
    });
  });

  describe('getDayName', () => {
    it('should return correct day name for Date object', () => {
      expect(getDayName(new Date('2024-01-15'))).toBe('Monday');
      expect(getDayName(new Date('2024-01-16'))).toBe('Tuesday');
      expect(getDayName(new Date('2024-01-17'))).toBe('Wednesday');
      expect(getDayName(new Date('2024-01-18'))).toBe('Thursday');
      expect(getDayName(new Date('2024-01-19'))).toBe('Friday');
      expect(getDayName(new Date('2024-01-20'))).toBe('Saturday');
      expect(getDayName(new Date('2024-01-21'))).toBe('Sunday');
    });

    it('should work with ISO string', () => {
      expect(getDayName('2024-01-15')).toBe('Monday');
      expect(getDayName('2024-01-20')).toBe('Saturday');
    });

    it('should return empty string for null/undefined', () => {
      expect(getDayName(null)).toBe('');
      expect(getDayName(undefined)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(getDayName('invalid-date')).toBe('');
    });
  });

  describe('formatDateShort', () => {
    it('should format date to short format', () => {
      const date = new Date('2024-01-15');
      const result = formatDateShort(date);
      expect(result).toContain('Jan');
      expect(result).toContain('15');
      expect(result).toContain('2024');
    });

    it('should work with ISO string', () => {
      const result = formatDateShort('2024-01-15');
      expect(result).toContain('Jan');
    });

    it('should return empty string for null/undefined', () => {
      expect(formatDateShort(null)).toBe('');
      expect(formatDateShort(undefined)).toBe('');
    });
  });

  describe('parseISODate', () => {
    it('should parse valid ISO date string', () => {
      const result = parseISODate('2024-01-15');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2024);
    });

    it('should return null for invalid date string', () => {
      expect(parseISODate('invalid-date')).toBeNull();
    });

    it('should return null for null/undefined', () => {
      expect(parseISODate(null)).toBeNull();
      expect(parseISODate(undefined)).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseISODate('')).toBeNull();
    });
  });
});

import Attendance from '../models/Attendance.js';
import Teacher from '../models/Teacher.js';
import logger from '../utils/logger.js';

class AttendanceService {
  /**
   * Mark teacher attendance for specific periods
   * @param {string} teacherId - Teacher ID
   * @param {Date} date - Attendance date
   * @param {Array<number>} absentPeriods - Array of absent period numbers (1-8)
   * @returns {Promise<Object>} Attendance record
   */
  async markPeriodAttendance(teacherId, date, absentPeriods = []) {
    try {
      // Validate date is a weekday
      const dayOfWeek = new Date(date).getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        throw new Error('Attendance can only be recorded for weekdays (Monday-Friday)');
      }

      // Validate teacher exists
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        throw new Error('Teacher not found');
      }

      // Validate period numbers
      if (!Array.isArray(absentPeriods)) {
        throw new Error('absentPeriods must be an array');
      }

      const invalidPeriods = absentPeriods.filter(p => p < 1 || p > 8);
      if (invalidPeriods.length > 0) {
        throw new Error(`Invalid period numbers: ${invalidPeriods.join(', ')}. Periods must be between 1 and 8`);
      }

      // Remove duplicates and sort
      const uniquePeriods = [...new Set(absentPeriods)].sort((a, b) => a - b);

      // Normalize date to start of day
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Determine status based on absent periods
      let status = 'present';
      if (uniquePeriods.length === 8) {
        status = 'absent'; // Full day absent
      } else if (uniquePeriods.length > 0) {
        status = 'present'; // Partially absent (present overall, but absent for some periods)
      }

      // Upsert: update if exists, create if not
      const attendance = await Attendance.findOneAndUpdate(
        {
          teacher: teacherId,
          date: normalizedDate,
        },
        {
          teacher: teacherId,
          date: normalizedDate,
          status,
          absentPeriods: uniquePeriods,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      ).populate('teacher', 'name subjects');

      logger.info('Period attendance marked', {
        teacherId,
        teacherName: teacher.name,
        date: normalizedDate.toISOString().split('T')[0],
        status,
        absentPeriods: uniquePeriods,
      });

      return attendance;
    } catch (error) {
      logger.error('Failed to mark period attendance', {
        error: error.message,
        teacherId,
        date,
        absentPeriods,
      });
      throw error;
    }
  }

  /**
   * Mark teacher attendance with upsert logic (legacy method - kept for backward compatibility)
   * @param {string} teacherId - Teacher ID
   * @param {Date} date - Attendance date
   * @param {string} status - Attendance status ('present' or 'absent')
   * @returns {Promise<Object>} Attendance record
   */
  async markAttendance(teacherId, date, status) {
    try {
      // Convert whole-day attendance to period-based
      let absentPeriods = [];
      if (status === 'absent') {
        // Full day absent = all 8 periods
        absentPeriods = [1, 2, 3, 4, 5, 6, 7, 8];
      }
      // If status is 'present', absentPeriods remains empty

      // Use the new period-based method
      return await this.markPeriodAttendance(teacherId, date, absentPeriods);
    } catch (error) {
      logger.error('Failed to mark attendance', {
        error: error.message,
        teacherId,
        date,
        status,
      });
      throw error;
    }
  }

  /**
   * Get attendance records by date
   * @param {Date} date - Date to query
   * @returns {Promise<Array>} Attendance records
   */
  async getAttendanceByDate(date) {
    try {
      // Normalize date to start of day
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const records = await Attendance.find({ date: normalizedDate })
        .populate('teacher', 'name subjects')
        .sort({ 'teacher.name': 1 });

      logger.info('Attendance records found by date', {
        date: normalizedDate.toISOString().split('T')[0],
        count: records.length,
      });

      return records;
    } catch (error) {
      logger.error('Failed to get attendance by date', {
        error: error.message,
        date,
      });
      throw error;
    }
  }

  /**
   * Get attendance records by teacher and date range
   * @param {string} teacherId - Teacher ID
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Attendance records
   */
  async getAttendanceByTeacher(teacherId, startDate, endDate) {
    try {
      // Normalize dates
      const normalizedStartDate = new Date(startDate);
      normalizedStartDate.setHours(0, 0, 0, 0);

      const normalizedEndDate = new Date(endDate);
      normalizedEndDate.setHours(23, 59, 59, 999);

      const records = await Attendance.find({
        teacher: teacherId,
        date: {
          $gte: normalizedStartDate,
          $lte: normalizedEndDate,
        },
      })
        .populate('teacher', 'name subjects')
        .sort({ date: 1 });

      logger.info('Attendance records found by teacher', {
        teacherId,
        startDate: normalizedStartDate.toISOString().split('T')[0],
        endDate: normalizedEndDate.toISOString().split('T')[0],
        count: records.length,
      });

      return records;
    } catch (error) {
      logger.error('Failed to get attendance by teacher', {
        error: error.message,
        teacherId,
        startDate,
        endDate,
      });
      throw error;
    }
  }

  /**
   * Check if teacher is absent on a specific date (for a specific period or whole day)
   * @param {string} teacherId - Teacher ID
   * @param {Date} date - Date to check
   * @param {number} period - Optional period number (1-8). If not provided, checks whole day
   * @returns {Promise<boolean>} True if teacher is absent
   */
  async isTeacherAbsent(teacherId, date, period = null) {
    try {
      // Normalize date to start of day
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const attendance = await Attendance.findOne({
        teacher: teacherId,
        date: normalizedDate,
      });

      if (!attendance) {
        // No attendance record = present
        return false;
      }

      if (period !== null) {
        // Check specific period
        const isAbsent = attendance.absentPeriods.includes(period);
        logger.debug('Teacher absence check for period', {
          teacherId,
          date: normalizedDate.toISOString().split('T')[0],
          period,
          isAbsent,
        });
        return isAbsent;
      } else {
        // Check whole day
        const isAbsent = attendance.status === 'absent' || attendance.absentPeriods.length === 8;
        logger.debug('Teacher absence check for whole day', {
          teacherId,
          date: normalizedDate.toISOString().split('T')[0],
          isAbsent,
        });
        return isAbsent;
      }
    } catch (error) {
      logger.error('Failed to check teacher absence', {
        error: error.message,
        teacherId,
        date,
        period,
      });
      throw error;
    }
  }

  /**
   * Get all absent teachers for a specific date
   * @param {Date} date - Date to query
   * @returns {Promise<Array>} Array of absent teachers
   */
  async getAbsentTeachers(date) {
    try {
      // Normalize date to start of day
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const records = await Attendance.find({
        date: normalizedDate,
        status: 'absent',
      }).populate('teacher', 'name subjects');

      logger.info('Absent teachers found', {
        date: normalizedDate.toISOString().split('T')[0],
        count: records.length,
      });

      return records.map((record) => record.teacher);
    } catch (error) {
      logger.error('Failed to get absent teachers', {
        error: error.message,
        date,
      });
      throw error;
    }
  }

  /**
   * Get attendance statistics for a date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Object>} Attendance statistics
   */
  async getAttendanceStats(startDate, endDate) {
    try {
      const normalizedStartDate = new Date(startDate);
      normalizedStartDate.setHours(0, 0, 0, 0);

      const normalizedEndDate = new Date(endDate);
      normalizedEndDate.setHours(23, 59, 59, 999);

      const records = await Attendance.find({
        date: {
          $gte: normalizedStartDate,
          $lte: normalizedEndDate,
        },
      });

      const stats = {
        total: records.length,
        present: records.filter((r) => r.status === 'present' && r.absentPeriods.length === 0).length,
        absent: records.filter((r) => r.status === 'absent' || r.absentPeriods.length === 8).length,
        partiallyAbsent: records.filter((r) => r.absentPeriods.length > 0 && r.absentPeriods.length < 8).length,
      };

      logger.info('Attendance statistics calculated', stats);

      return stats;
    } catch (error) {
      logger.error('Failed to get attendance statistics', {
        error: error.message,
        startDate,
        endDate,
      });
      throw error;
    }
  }

  /**
   * Get teacher's schedule with attendance status for a specific date
   * @param {string} teacherId - Teacher ID
   * @param {Date} date - Date to check
   * @returns {Promise<Object>} Schedule with attendance status
   */
  async getScheduleWithAttendance(teacherId, date) {
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Get teacher
      const Teacher = (await import('../models/Teacher.js')).default;
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        throw new Error('Teacher not found');
      }

      // Get day of week
      const dayOfWeek = normalizedDate.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = dayNames[dayOfWeek];

      // Get teacher's timetable for the day
      const Timetable = (await import('../models/Timetable.js')).default;
      const schedule = await Timetable.find({
        teacher: teacherId,
        day,
      }).sort({ period: 1 });

      // Get attendance record
      const attendance = await Attendance.findOne({
        teacher: teacherId,
        date: normalizedDate,
      });

      const absentPeriods = attendance ? attendance.absentPeriods : [];

      // Build schedule with attendance status
      const scheduleWithStatus = schedule.map((entry) => ({
        period: entry.period,
        class: entry.class,
        subject: entry.subject,
        startTime: entry.startTime,
        endTime: entry.endTime,
        isAbsent: absentPeriods.includes(entry.period),
      }));

      logger.info('Schedule with attendance retrieved', {
        teacherId,
        teacherName: teacher.name,
        date: normalizedDate.toISOString().split('T')[0],
        totalPeriods: scheduleWithStatus.length,
        absentPeriods: absentPeriods.length,
      });

      return {
        teacher: {
          _id: teacher._id,
          name: teacher.name,
          subjects: teacher.subjects,
        },
        date: normalizedDate.toISOString().split('T')[0],
        day,
        schedule: scheduleWithStatus,
        absentPeriods,
      };
    } catch (error) {
      logger.error('Failed to get schedule with attendance', {
        error: error.message,
        teacherId,
        date,
      });
      throw error;
    }
  }
}

export default new AttendanceService();

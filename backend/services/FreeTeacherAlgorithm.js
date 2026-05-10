import Teacher from '../models/Teacher.js';
import Timetable from '../models/Timetable.js';
import Attendance from '../models/Attendance.js';
import Substitution from '../models/Substitution.js';
import logger from '../utils/logger.js';

class FreeTeacherAlgorithm {
  /**
   * Find free teachers for a specific period, day, and date
   * Algorithm:
   * 1. Get all teachers
   * 2. Exclude teachers scheduled for the period/day
   * 3. Exclude teachers marked absent for the date (full day or specific period)
   * 4. Exclude teachers already assigned as substitutes for the period/date
   * 
   * @param {number} period - Period number (1-8)
   * @param {string} day - Day of week (Monday-Friday)
   * @param {Date} date - Date to check for absence and substitutions
   * @returns {Promise<Array>} Array of free teachers
   */
  async findFreeTeachers(period, day, date) {
    try {
      // Normalize date to start of day
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Step 1: Get all teachers
      const allTeachers = await Teacher.find();
      const allTeacherIds = allTeachers.map((t) => t._id.toString());

      // Step 2: Get teachers scheduled for this period and day
      const scheduledEntries = await Timetable.find({ period, day });
      const scheduledTeacherIds = scheduledEntries.map((entry) =>
        entry.teacher.toString()
      );

      // Step 3: Get teachers marked absent for this date (full day or specific period)
      const absentRecords = await Attendance.find({
        date: normalizedDate,
      });
      
      const absentTeacherIds = absentRecords
        .filter(record => {
          // Include if full day absent
          if (record.status === 'absent') {
            return true;
          }
          // Include if absent for this specific period
          if (record.absentPeriods && record.absentPeriods.includes(period)) {
            return true;
          }
          return false;
        })
        .map((record) => record.teacher.toString());

      // Step 4: Get teachers already assigned as substitutes for this period and date
      const substitutionRecords = await Substitution.find({
        date: normalizedDate,
        period,
      });
      const assignedSubstituteIds = substitutionRecords.map((record) =>
        record.substituteTeacher.toString()
      );

      // Combine all excluded teacher IDs
      const excludedTeacherIds = new Set([
        ...scheduledTeacherIds,
        ...absentTeacherIds,
        ...assignedSubstituteIds,
      ]);

      // Filter free teachers
      const freeTeachers = allTeachers.filter(
        (teacher) => !excludedTeacherIds.has(teacher._id.toString())
      );

      logger.info('Free teachers found', {
        period,
        day,
        date: normalizedDate.toISOString().split('T')[0],
        totalTeachers: allTeachers.length,
        scheduled: scheduledTeacherIds.length,
        absent: absentTeacherIds.length,
        assignedSubstitutes: assignedSubstituteIds.length,
        excluded: excludedTeacherIds.size,
        freeTeachers: freeTeachers.length,
      });

      return freeTeachers;
    } catch (error) {
      logger.error('Failed to find free teachers', {
        error: error.message,
        period,
        day,
        date,
      });
      throw error;
    }
  }

  /**
   * Check if a specific teacher is free for a period, day, and date
   * @param {string} teacherId - Teacher ID
   * @param {number} period - Period number (1-8)
   * @param {string} day - Day of week (Monday-Friday)
   * @param {Date} date - Date to check
   * @returns {Promise<boolean>} True if teacher is free
   */
  async isTeacherFree(teacherId, period, day, date) {
    try {
      // Normalize date to start of day
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Check if teacher is scheduled for this period and day
      const scheduledEntry = await Timetable.findOne({
        teacher: teacherId,
        period,
        day,
      });

      if (scheduledEntry) {
        logger.debug('Teacher is scheduled', {
          teacherId,
          period,
          day,
          class: scheduledEntry.class,
        });
        return false;
      }

      // Check if teacher is absent for this date (full day or specific period)
      const absentRecord = await Attendance.findOne({
        teacher: teacherId,
        date: normalizedDate,
      });

      if (absentRecord) {
        // Check if full day absent
        if (absentRecord.status === 'absent') {
          logger.debug('Teacher is absent (full day)', {
            teacherId,
            date: normalizedDate.toISOString().split('T')[0],
          });
          return false;
        }
        
        // Check if absent for this specific period
        if (absentRecord.absentPeriods && absentRecord.absentPeriods.includes(period)) {
          logger.debug('Teacher is absent (specific period)', {
            teacherId,
            period,
            date: normalizedDate.toISOString().split('T')[0],
          });
          return false;
        }
      }

      // Check if teacher is already assigned as substitute for this period and date
      const substitutionRecord = await Substitution.findOne({
        substituteTeacher: teacherId,
        date: normalizedDate,
        period,
      });

      if (substitutionRecord) {
        logger.debug('Teacher is already assigned as substitute', {
          teacherId,
          period,
          date: normalizedDate.toISOString().split('T')[0],
          forClass: substitutionRecord.class,
        });
        return false;
      }

      // Teacher is free
      logger.debug('Teacher is free', {
        teacherId,
        period,
        day,
        date: normalizedDate.toISOString().split('T')[0],
      });

      return true;
    } catch (error) {
      logger.error('Failed to check if teacher is free', {
        error: error.message,
        teacherId,
        period,
        day,
        date,
      });
      throw error;
    }
  }

  /**
   * Get detailed availability information for a teacher
   * @param {string} teacherId - Teacher ID
   * @param {Date} date - Date to check
   * @returns {Promise<Object>} Availability details for all periods
   */
  async getTeacherAvailability(teacherId, date) {
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const dayOfWeek = normalizedDate.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = dayNames[dayOfWeek];

      // Check if teacher is absent
      const isAbsent = await Attendance.findOne({
        teacher: teacherId,
        date: normalizedDate,
        status: 'absent',
      });

      if (isAbsent) {
        return {
          teacherId,
          date: normalizedDate.toISOString().split('T')[0],
          day,
          isAbsent: true,
          periods: [],
        };
      }

      // Get teacher's schedule for the day
      const schedule = await Timetable.find({
        teacher: teacherId,
        day,
      });

      // Get substitution assignments for the day
      const substitutions = await Substitution.find({
        substituteTeacher: teacherId,
        date: normalizedDate,
      });

      // Build availability for each period (1-8)
      const periods = [];
      for (let period = 1; period <= 8; period++) {
        const scheduled = schedule.find((s) => s.period === period);
        const substituting = substitutions.find((s) => s.period === period);

        periods.push({
          period,
          isFree: !scheduled && !substituting,
          isScheduled: !!scheduled,
          isSubstituting: !!substituting,
          scheduledClass: scheduled ? scheduled.class : null,
          substitutingClass: substituting ? substituting.class : null,
        });
      }

      return {
        teacherId,
        date: normalizedDate.toISOString().split('T')[0],
        day,
        isAbsent: false,
        periods,
      };
    } catch (error) {
      logger.error('Failed to get teacher availability', {
        error: error.message,
        teacherId,
        date,
      });
      throw error;
    }
  }
}

export default new FreeTeacherAlgorithm();

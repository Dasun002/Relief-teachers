import Substitution from '../models/Substitution.js';
import Teacher from '../models/Teacher.js';
import Timetable from '../models/Timetable.js';
import AttendanceService from './AttendanceService.js';
import FreeTeacherAlgorithm from './FreeTeacherAlgorithm.js';
import logger from '../utils/logger.js';

class SubstitutionService {
  /**
   * Allocate substitute teacher with validation
   * @param {Object} data - Substitution data
   * @returns {Promise<Object>} Created substitution record
   */
  async allocateSubstitute(data) {
    try {
      const { absentTeacherId, substituteTeacherId, class: className, period, date, subject } = data;

      // Normalize date
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Get day of week
      const dayOfWeek = normalizedDate.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = dayNames[dayOfWeek];

      // Check if substitution already exists for this absent teacher, date, and period
      const existingSubstitution = await Substitution.findOne({
        absentTeacher: absentTeacherId,
        date: normalizedDate,
        period: parseInt(period)
      });

      if (existingSubstitution) {
        throw new Error('A substitution already exists for this teacher and period. Use the "Change Substitute" feature to modify it.');
      }

      // Validate absent teacher is actually absent for this specific period
      const periodNum = parseInt(period);
      const isAbsent = await AttendanceService.isTeacherAbsent(absentTeacherId, normalizedDate, periodNum);
      if (!isAbsent) {
        throw new Error(`Teacher is not marked absent for period ${periodNum}. Please mark attendance first.`);
      }

      // Validate substitute teacher is free
      const isFree = await FreeTeacherAlgorithm.isTeacherFree(
        substituteTeacherId,
        period,
        day,
        normalizedDate
      );
      if (!isFree) {
        throw new Error('Selected teacher is not available during this period');
      }

      // Validate teachers exist
      const absentTeacher = await Teacher.findById(absentTeacherId);
      const substituteTeacher = await Teacher.findById(substituteTeacherId);

      if (!absentTeacher) {
        throw new Error('Absent teacher not found');
      }
      if (!substituteTeacher) {
        throw new Error('Substitute teacher not found');
      }

      // Create substitution record
      const substitution = new Substitution({
        absentTeacher: absentTeacherId,
        substituteTeacher: substituteTeacherId,
        class: className,
        period: parseInt(period),
        date: normalizedDate,
        subject,
      });

      await substitution.save();

      // Populate teacher details
      await substitution.populate('absentTeacher', 'name subjects');
      await substitution.populate('substituteTeacher', 'name subjects');

      logger.info('Substitute allocated', {
        absentTeacher: absentTeacher.name,
        substituteTeacher: substituteTeacher.name,
        class: className,
        period,
        date: normalizedDate.toISOString().split('T')[0],
      });

      return substitution;
    } catch (error) {
      logger.error('Failed to allocate substitute', {
        error: error.message,
        data,
      });
      throw error;
    }
  }

  /**
   * Update existing substitution with new substitute teacher
   * @param {string} substitutionId - Substitution ID
   * @param {string} newSubstituteId - New substitute teacher ID
   * @returns {Promise<Object>} Updated substitution record
   */
  async updateSubstitute(substitutionId, newSubstituteId) {
    try {
      // Find existing substitution
      const substitution = await Substitution.findById(substitutionId);
      if (!substitution) {
        throw new Error('Substitution not found');
      }

      // Get day of week
      const dayOfWeek = substitution.date.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = dayNames[dayOfWeek];

      // Validate new substitute teacher is free
      const isFree = await FreeTeacherAlgorithm.isTeacherFree(
        newSubstituteId,
        substitution.period,
        day,
        substitution.date
      );
      if (!isFree) {
        throw new Error('Selected teacher is not available during this period');
      }

      // Update substitution
      substitution.substituteTeacher = newSubstituteId;
      await substitution.save();

      // Populate teacher details
      await substitution.populate('absentTeacher', 'name subjects');
      await substitution.populate('substituteTeacher', 'name subjects');

      logger.info('Substitute updated', {
        substitutionId,
        newSubstituteId,
      });

      return substitution;
    } catch (error) {
      logger.error('Failed to update substitute', {
        error: error.message,
        substitutionId,
        newSubstituteId,
      });
      throw error;
    }
  }

  /**
   * Get substitutions by date
   * @param {Date} date - Date to query
   * @returns {Promise<Array>} Substitution records
   */
  async getSubstitutionsByDate(date) {
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const substitutions = await Substitution.find({ date: normalizedDate })
        .populate('absentTeacher', 'name subjects')
        .populate('substituteTeacher', 'name subjects')
        .sort({ period: 1, class: 1 });

      logger.info('Substitutions found by date', {
        date: normalizedDate.toISOString().split('T')[0],
        count: substitutions.length,
      });

      return substitutions;
    } catch (error) {
      logger.error('Failed to get substitutions by date', {
        error: error.message,
        date,
      });
      throw error;
    }
  }

  /**
   * Get substitutions by class and date
   * @param {string} className - Class name
   * @param {Date} date - Date to query
   * @returns {Promise<Array>} Substitution records
   */
  async getSubstitutionsByClass(className, date) {
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      const substitutions = await Substitution.find({
        class: className,
        date: normalizedDate,
      })
        .populate('absentTeacher', 'name subjects')
        .populate('substituteTeacher', 'name subjects')
        .sort({ period: 1 });

      logger.info('Substitutions found by class', {
        class: className,
        date: normalizedDate.toISOString().split('T')[0],
        count: substitutions.length,
      });

      return substitutions;
    } catch (error) {
      logger.error('Failed to get substitutions by class', {
        error: error.message,
        className,
        date,
      });
      throw error;
    }
  }

  /**
   * Get coverage status for an absent teacher
   * Shows which periods have substitute coverage and which don't
   * @param {string} teacherId - Teacher ID
   * @param {Date} date - Date to check
   * @returns {Promise<Object>} Coverage status
   */
  async getCoverageStatus(teacherId, date) {
    try {
      const normalizedDate = new Date(date);
      normalizedDate.setHours(0, 0, 0, 0);

      // Get day of week
      const dayOfWeek = normalizedDate.getDay();
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const day = dayNames[dayOfWeek];

      // Get teacher
      const teacher = await Teacher.findById(teacherId);
      if (!teacher) {
        throw new Error('Teacher not found');
      }

      // Check if teacher is absent
      const isAbsent = await AttendanceService.isTeacherAbsent(teacherId, normalizedDate);
      if (!isAbsent) {
        return {
          teacherId,
          teacherName: teacher.name,
          date: normalizedDate.toISOString().split('T')[0],
          day,
          isAbsent: false,
          periods: [],
          coverageComplete: true,
        };
      }

      // Get teacher's schedule for the day
      const schedule = await Timetable.find({
        teacher: teacherId,
        day,
      }).sort({ period: 1 });

      // Get substitutions for this teacher and date
      const substitutions = await Substitution.find({
        absentTeacher: teacherId,
        date: normalizedDate,
      }).populate('substituteTeacher', 'name subjects');

      // Build coverage status for each scheduled period
      const periods = schedule.map((entry) => {
        const substitution = substitutions.find((s) => s.period === entry.period);

        return {
          period: entry.period,
          class: entry.class,
          subject: entry.subject,
          startTime: entry.startTime,
          endTime: entry.endTime,
          hasCoverage: !!substitution,
          substituteTeacher: substitution
            ? {
                id: substitution.substituteTeacher._id,
                name: substitution.substituteTeacher.name,
              }
            : null,
        };
      });

      const coverageComplete = periods.every((p) => p.hasCoverage);

      logger.info('Coverage status retrieved', {
        teacherId,
        teacherName: teacher.name,
        date: normalizedDate.toISOString().split('T')[0],
        totalPeriods: periods.length,
        coveredPeriods: periods.filter((p) => p.hasCoverage).length,
        coverageComplete,
      });

      return {
        teacherId,
        teacherName: teacher.name,
        date: normalizedDate.toISOString().split('T')[0],
        day,
        isAbsent: true,
        periods,
        coverageComplete,
      };
    } catch (error) {
      logger.error('Failed to get coverage status', {
        error: error.message,
        teacherId,
        date,
      });
      throw error;
    }
  }

  /**
   * Delete substitution
   * @param {string} substitutionId - Substitution ID
   * @returns {Promise<Object>} Deleted substitution
   */
  async deleteSubstitution(substitutionId) {
    try {
      const substitution = await Substitution.findByIdAndDelete(substitutionId);
      if (!substitution) {
        throw new Error('Substitution not found');
      }

      logger.info('Substitution deleted', { substitutionId });
      return substitution;
    } catch (error) {
      logger.error('Failed to delete substitution', {
        error: error.message,
        substitutionId,
      });
      throw error;
    }
  }
}

export default new SubstitutionService();

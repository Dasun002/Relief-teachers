import Timetable from '../models/Timetable.js';
import Teacher from '../models/Teacher.js';
import logger from '../utils/logger.js';

class TimetableService {
  /**
   * Find timetable entries by class
   * @param {string} className - Class name (e.g., "6A")
   * @param {string} day - Optional day filter
   * @returns {Promise<Array>} Timetable entries
   */
  async findByClass(className, day = null) {
    try {
      const query = { class: className };
      if (day) {
        query.day = day;
      }

      const entries = await Timetable.find(query)
        .populate('teacher', 'name subjects')
        .populate('alternateTeachers', 'name subjects')
        .sort({ day: 1, period: 1 });

      logger.info('Timetable entries found by class', {
        className,
        day,
        count: entries.length,
      });

      return entries;
    } catch (error) {
      logger.error('Failed to find timetable by class', {
        error: error.message,
        className,
        day,
      });
      throw error;
    }
  }

  /**
   * Find timetable entries by teacher
   * @param {string} teacherId - Teacher ID
   * @param {string} day - Optional day filter
   * @returns {Promise<Array>} Timetable entries
   */
  async findByTeacher(teacherId, day = null) {
    try {
      const query = { teacher: teacherId };
      if (day) {
        query.day = day;
      }

      const entries = await Timetable.find(query)
        .populate('teacher', 'name subjects')
        .populate('alternateTeachers', 'name subjects')
        .sort({ day: 1, period: 1 });

      logger.info('Timetable entries found by teacher', {
        teacherId,
        day,
        count: entries.length,
      });

      return entries;
    } catch (error) {
      logger.error('Failed to find timetable by teacher', {
        error: error.message,
        teacherId,
        day,
      });
      throw error;
    }
  }

  /**
   * Find timetable entries by period
   * @param {number} period - Period number (1-8)
   * @param {string} day - Day of week
   * @returns {Promise<Array>} Timetable entries
   */
  async findByPeriod(period, day) {
    try {
      const entries = await Timetable.find({ period, day })
        .populate('teacher', 'name subjects')
        .populate('alternateTeachers', 'name subjects')
        .sort({ class: 1 });

      logger.info('Timetable entries found by period', {
        period,
        day,
        count: entries.length,
      });

      return entries;
    } catch (error) {
      logger.error('Failed to find timetable by period', {
        error: error.message,
        period,
        day,
      });
      throw error;
    }
  }

  /**
   * Bulk import timetable entries with upsert logic
   * Prevents duplicates by checking (teacher, class, day, period) combination
   * @param {Array} entries - Array of timetable entry objects
   * @returns {Promise<Object>} Import result with counts
   */
  async bulkImport(entries) {
    try {
      let imported = 0;
      let updated = 0;
      let skipped = 0;
      const errors = [];

      for (const entry of entries) {
        try {
          // Validate entry
          const validationResult = this.validateEntry(entry);
          if (!validationResult.valid) {
            errors.push({
              entry,
              error: validationResult.error,
            });
            continue;
          }

          // Check if this exact entry already exists (teacher, class, day, period)
          // This prevents duplicates from the XML file
          const existing = await Timetable.findOne({
            teacher: entry.teacher,
            class: entry.class,
            day: entry.day,
            period: entry.period,
          });

          if (existing) {
            // Entry already exists, skip it
            skipped++;
            logger.debug('Skipping duplicate entry', {
              teacher: entry.teacher,
              class: entry.class,
              day: entry.day,
              period: entry.period,
            });
            continue;
          }

          // Create new entry
          const timetableEntry = new Timetable(entry);
          await timetableEntry.save();
          imported++;

        } catch (error) {
          errors.push({
            entry,
            error: error.message,
          });
        }
      }

      logger.info('Bulk import completed', { imported, updated, skipped, errors: errors.length });

      return {
        imported,
        updated,
        skipped,
        errors,
        total: entries.length,
      };
    } catch (error) {
      logger.error('Bulk import failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Validate timetable entry
   * @param {Object} entry - Timetable entry object
   * @returns {Object} Validation result
   */
  validateEntry(entry) {
    const required = ['class', 'period', 'day', 'teacher', 'subject', 'startTime', 'endTime'];
    const missing = required.filter((field) => !entry[field]);

    if (missing.length > 0) {
      return {
        valid: false,
        error: `Missing required fields: ${missing.join(', ')}`,
      };
    }

    // Validate class format
    if (!/^(6|7|8|9|10|11|12|13)[A-C]$/.test(entry.class)) {
      return {
        valid: false,
        error: 'Invalid class format. Must be 6A-13C',
      };
    }

    // Validate period
    if (entry.period < 1 || entry.period > 8) {
      return {
        valid: false,
        error: 'Period must be between 1 and 8',
      };
    }

    // Validate day
    const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    if (!validDays.includes(entry.day)) {
      return {
        valid: false,
        error: 'Day must be a weekday (Monday-Friday)',
      };
    }

    // Validate time format
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    if (!timeRegex.test(entry.startTime) || !timeRegex.test(entry.endTime)) {
      return {
        valid: false,
        error: 'Time must be in HH:mm format (24-hour)',
      };
    }

    return { valid: true };
  }

  /**
   * Get all timetable entries
   * @returns {Promise<Array>} All timetable entries
   */
  async getAll() {
    try {
      const entries = await Timetable.find()
        .populate('teacher', 'name subjects')
        .populate('alternateTeachers', 'name subjects')
        .sort({ day: 1, period: 1, class: 1 });

      return entries;
    } catch (error) {
      logger.error('Failed to get all timetable entries', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete all timetable entries (for testing/reset)
   * @returns {Promise<Object>} Delete result
   */
  async deleteAll() {
    try {
      const result = await Timetable.deleteMany({});
      logger.info('All timetable entries deleted', { count: result.deletedCount });
      return result;
    } catch (error) {
      logger.error('Failed to delete timetable entries', { error: error.message });
      throw error;
    }
  }
}

export default new TimetableService();

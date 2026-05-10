import TimetableService from '../services/TimetableService.js';
import { parseAndValidateXML } from '../services/xmlParser.js';
import { transformTimetableData } from '../services/timetableTransformer.js';
import Teacher from '../models/Teacher.js';
import logger from '../utils/logger.js';

/**
 * Get timetable with filters
 * GET /api/timetable
 * Query params: class, teacher, day, period
 */
const getTimetable = async (req, res) => {
  try {
    const { class: className, teacher: teacherId, day, period } = req.query;

    let entries = [];

    // Query based on provided filters
    if (className && day) {
      entries = await TimetableService.findByClass(className, day);
    } else if (className) {
      entries = await TimetableService.findByClass(className);
    } else if (teacherId && day) {
      entries = await TimetableService.findByTeacher(teacherId, day);
    } else if (teacherId) {
      entries = await TimetableService.findByTeacher(teacherId);
    } else if (period && day) {
      entries = await TimetableService.findByPeriod(parseInt(period), day);
    } else {
      // No specific filters, return all
      entries = await TimetableService.getAll();
    }

    res.status(200).json({
      success: true,
      data: {
        timetable: entries,
        count: entries.length,
      },
    });
  } catch (error) {
    logger.error('Get timetable error', { error: error.message });

    res.status(500).json({
      success: false,
      error: {
        code: 'DATABASE_ERROR',
        message: 'Failed to retrieve timetable',
      },
    });
  }
};

/**
 * Import timetable from XML file
 * POST /api/timetable/import
 * Expects multipart/form-data with 'file' field
 */
const importTimetable = async (req, res) => {
  try {
    logger.info('=== IMPORT TIMETABLE STARTED ===');
    logger.info('File received', { hasFile: !!req.file });
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file uploaded. Please upload an XML file.',
        },
      });
    }

    // Validate file type
    if (!req.file.originalname.endsWith('.xml')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid file type. Only XML files are allowed.',
        },
      });
    }

    logger.info('Processing XML file upload', {
      filename: req.file.originalname,
      size: req.file.size,
    });

    // Parse XML file
    const xmlString = req.file.buffer.toString('utf-8');
    const parsedXML = await parseAndValidateXML(xmlString);

    // Transform XML data to our database format
    const transformedData = transformTimetableData(parsedXML);

    // Process teachers first - ensure they exist in database
    const teacherMap = {};
    for (const teacherData of transformedData.teachers) {
      try {
        // Find or create teacher
        let teacher = await Teacher.findOne({ name: teacherData.name });
        
        if (!teacher) {
          // Create new teacher with default subject if not exists
          teacher = new Teacher({
            name: teacherData.name,
            subjects: ['General'], // Default subject, can be updated later
          });
          await teacher.save();
          logger.info('Created new teacher during import', { name: teacherData.name });
        }
        
        teacherMap[teacherData.ascId] = teacher._id;
      } catch (error) {
        logger.warn('Failed to process teacher', {
          teacher: teacherData.name,
          error: error.message,
        });
      }
    }

    // Transform timetable entries to include actual teacher IDs
    const timetableEntries = [];
    const periodMap = {};
    
    // Create period lookup map
    transformedData.periods.forEach((p) => {
      periodMap[p.period] = p;
    });

    // Process timetable entries
    for (const entry of transformedData.timetableEntries) {
      const teacherId = teacherMap[entry.teacherAscId];
      
      if (!teacherId) {
        logger.warn('Teacher not found for timetable entry', {
          teacherAscId: entry.teacherAscId,
          class: entry.class,
        });
        continue;
      }

      // Get period info from the entry (already assigned by transformer)
      const periodInfo = periodMap[entry.period];
      
      if (!periodInfo) {
        logger.warn('Period not found for timetable entry', {
          period: entry.period,
          class: entry.class,
          day: entry.day,
        });
        continue;
      }

      // Format times to ensure HH:mm format
      const formatTime = (time) => {
        if (!time) return null;
        const parts = time.split(':');
        if (parts.length !== 2) return time;
        const formatted = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
        return formatted;
      };
      
      const formattedStartTime = formatTime(periodInfo.startTime);
      const formattedEndTime = formatTime(periodInfo.endTime);
      
      timetableEntries.push({
        class: entry.class,
        period: entry.period,
        day: entry.day,
        teacher: teacherId,
        subject: entry.subject,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        alternateTeachers: entry.alternateTeacherIds
          .map((id) => teacherMap[id])
          .filter((id) => id),
      });
    }

    // Bulk import timetable entries
    const importResult = await TimetableService.bulkImport(timetableEntries);

    logger.info('Timetable import completed', {
      imported: importResult.imported,
      updated: importResult.updated,
      errors: importResult.errors.length,
    });

    res.status(200).json({
      success: true,
      data: {
        message: 'Timetable imported successfully',
        summary: {
          imported: importResult.imported,
          updated: importResult.updated,
          errors: importResult.errors.length,
          total: importResult.total,
        },
        errors: importResult.errors.slice(0, 10), // Return first 10 errors
      },
    });
  } catch (error) {
    logger.error('Import timetable error', { error: error.message, stack: error.stack });

    // Handle specific error types
    if (error.message.includes('parse') || error.message.includes('Invalid XML')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_XML',
          message: `Failed to parse XML file: ${error.message}`,
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'IMPORT_FAILED',
        message: 'Failed to import timetable',
        details: error.message,
      },
    });
  }
};

export { getTimetable, importTimetable };

import logger from '../utils/logger.js';

/**
 * Parse teachers from aSc Timetables XML
 * @param {Object} teachersData - Teachers section from parsed XML
 * @returns {Array} Array of teacher objects
 */
const parseTeachers = (teachersData) => {
  try {
    if (!teachersData || !teachersData.teacher) {
      return [];
    }

    // Ensure teacher is always an array
    const teachers = Array.isArray(teachersData.teacher)
      ? teachersData.teacher
      : [teachersData.teacher];

    return teachers.map((teacher) => ({
      ascId: teacher.id,
      name: teacher.name || `${teacher.firstname || ''} ${teacher.lastname || ''}`.trim(),
      firstname: teacher.firstname || '',
      lastname: teacher.lastname || '',
      short: teacher.short || '',
    }));
  } catch (error) {
    logger.error('Failed to parse teachers', { error: error.message });
    throw new Error(`Teacher parsing failed: ${error.message}`);
  }
};

/**
 * Parse classes from aSc Timetables XML
 * @param {Object} classesData - Classes section from parsed XML
 * @returns {Array} Array of class objects
 */
const parseClasses = (classesData) => {
  try {
    if (!classesData || !classesData.class) {
      return [];
    }

    // Ensure class is always an array
    const classes = Array.isArray(classesData.class)
      ? classesData.class
      : [classesData.class];

    return classes.map((cls) => ({
      ascId: cls.id,
      name: cls.name,
      short: cls.short || cls.name,
      teacherId: cls.teacherid || null,
      grade: parseInt(cls.grade) || null,
    }));
  } catch (error) {
    logger.error('Failed to parse classes', { error: error.message });
    throw new Error(`Class parsing failed: ${error.message}`);
  }
};

/**
 * Parse subjects from aSc Timetables XML
 * @param {Object} subjectsData - Subjects section from parsed XML
 * @returns {Array} Array of subject objects
 */
const parseSubjects = (subjectsData) => {
  try {
    if (!subjectsData || !subjectsData.subject) {
      return [];
    }

    // Ensure subject is always an array
    const subjects = Array.isArray(subjectsData.subject)
      ? subjectsData.subject
      : [subjectsData.subject];

    return subjects.map((subject) => ({
      ascId: subject.id,
      name: subject.name,
      short: subject.short || subject.name,
    }));
  } catch (error) {
    logger.error('Failed to parse subjects', { error: error.message });
    throw new Error(`Subject parsing failed: ${error.message}`);
  }
};

/**
 * Format time string to HH:mm format (24-hour with leading zeros)
 * @param {string} time - Time string (e.g., "7:40" or "07:40")
 * @returns {string} Formatted time (e.g., "07:40")
 */
const formatTimeToHHmm = (time) => {
  if (!time) return null;
  
  const parts = time.split(':');
  if (parts.length !== 2) return time;
  
  const hours = parts[0].padStart(2, '0');
  const minutes = parts[1].padStart(2, '0');
  
  const formatted = `${hours}:${minutes}`;
  console.log(`formatTimeToHHmm: "${time}" -> "${formatted}"`);
  
  return formatted;
};

/**
 * Parse periods from aSc Timetables XML
 * @param {Object} periodsData - Periods section from parsed XML
 * @returns {Array} Array of period objects
 */
const parsePeriods = (periodsData) => {
  try {
    if (!periodsData || !periodsData.period) {
      return [];
    }

    // Ensure period is always an array
    const periods = Array.isArray(periodsData.period)
      ? periodsData.period
      : [periodsData.period];

    return periods.map((period) => ({
      period: parseInt(period.period),
      name: period.name,
      short: period.short || period.name,
      startTime: formatTimeToHHmm(period.starttime),
      endTime: formatTimeToHHmm(period.endtime),
    }));
  } catch (error) {
    logger.error('Failed to parse periods', { error: error.message });
    throw new Error(`Period parsing failed: ${error.message}`);
  }
};

/**
 * Parse day definitions from aSc Timetables XML
 * @param {Object} daysdefsData - Days definitions section from parsed XML
 * @returns {Object} Map of day definition IDs to day names
 */
const parseDayDefinitions = (daysdefsData) => {
  try {
    if (!daysdefsData || !daysdefsData.daysdef) {
      return {};
    }

    // Ensure daysdef is always an array
    const daysdefs = Array.isArray(daysdefsData.daysdef)
      ? daysdefsData.daysdef
      : [daysdefsData.daysdef];

    const dayMap = {};
    daysdefs.forEach((daysdef) => {
      dayMap[daysdef.id] = {
        name: daysdef.name,
        short: daysdef.short,
        days: daysdef.days,
      };
    });

    return dayMap;
  } catch (error) {
    logger.error('Failed to parse day definitions', { error: error.message });
    throw new Error(`Day definition parsing failed: ${error.message}`);
  }
};

/**
 * Convert aSc day pattern to array of day names
 * @param {string} dayPattern - Day pattern like "10000,01000,00100,00010,00001"
 * @returns {Array} Array of day names
 */
const convertDayPatternToDays = (dayPattern) => {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const patterns = dayPattern.split(',');
  const days = [];

  patterns.forEach((pattern) => {
    for (let i = 0; i < pattern.length && i < 5; i++) {
      if (pattern[i] === '1') {
        days.push(dayNames[i]);
      }
    }
  });

  return days;
};

/**
 * Parse cards from aSc Timetables XML
 * Cards map lessons to specific periods and days
 * @param {Object} cardsData - Cards section from parsed XML
 * @returns {Array} Array of card objects
 */
const parseCards = (cardsData) => {
  try {
    if (!cardsData || !cardsData.card) {
      return [];
    }

    // Ensure card is always an array
    const cards = Array.isArray(cardsData.card)
      ? cardsData.card
      : [cardsData.card];

    return cards.map((card) => ({
      lessonId: card.lessonid,
      period: parseInt(card.period),
      days: card.days, // Binary pattern like "10000" for Monday
      weeks: card.weeks,
      terms: card.terms,
      classroomIds: card.classroomids || '',
    }));
  } catch (error) {
    logger.error('Failed to parse cards', { error: error.message });
    throw new Error(`Card parsing failed: ${error.message}`);
  }
};

/**
 * Parse lessons from aSc Timetables XML and transform to timetable entries
 * @param {Object} lessonsData - Lessons section from parsed XML
 * @param {Object} lookupMaps - Maps for teachers, classes, subjects, periods, days
 * @returns {Array} Array of timetable entry objects
 */
const parseLessons = (lessonsData, lookupMaps) => {
  try {
    if (!lessonsData || !lessonsData.lesson) {
      return [];
    }

    // Ensure lesson is always an array
    const lessons = Array.isArray(lessonsData.lesson)
      ? lessonsData.lesson
      : [lessonsData.lesson];

    const lessonsMap = {};

    lessons.forEach((lesson) => {
      try {
        // Get class IDs (can be multiple for combined classes)
        const classIds = lesson.classids ? lesson.classids.split(',') : [];
        
        // Get teacher IDs (can be multiple)
        const teacherIds = lesson.teacherids ? lesson.teacherids.split(',') : [];
        
        // Get subject
        const subjectId = lesson.subjectid;
        const subject = lookupMaps.subjects[subjectId];
        
        // Get day definition
        const daysdefId = lesson.daysdefid;
        const daysDef = lookupMaps.days[daysdefId];
        
        if (!daysDef) {
          logger.warn(`Day definition not found for lesson ${lesson.id}`);
          return;
        }

        // Get periods per card (how many periods this lesson occupies)
        const periodsPerCard = parseInt(lesson.periodspercard) || 1;

        // Store lesson info in map for later use with cards
        lessonsMap[lesson.id] = {
          classIds,
          teacherIds,
          subject: subject ? subject.name : 'Unknown',
          periodsPerCard,
          daysDef,
        };
      } catch (error) {
        logger.warn(`Failed to parse lesson ${lesson.id}`, { error: error.message });
      }
    });

    return lessonsMap;
  } catch (error) {
    logger.error('Failed to parse lessons', { error: error.message });
    throw new Error(`Lesson parsing failed: ${error.message}`);
  }
};

/**
 * Transform aSc Timetables XML to our database format
 * @param {Object} parsedXML - Parsed XML object
 * @returns {Object} Transformed data ready for database import
 */
const transformTimetableData = (parsedXML) => {
  try {
    const timetable = parsedXML.timetable;

    // Parse all sections
    const teachers = parseTeachers(timetable.teachers);
    const classes = parseClasses(timetable.classes);
    const subjects = parseSubjects(timetable.subjects);
    const periods = parsePeriods(timetable.periods);
    const dayDefinitions = parseDayDefinitions(timetable.daysdefs);
    const cards = parseCards(timetable.cards);

    // Create lookup maps
    const lookupMaps = {
      teachers: {},
      classes: {},
      subjects: {},
      periods: {},
      days: dayDefinitions,
    };

    teachers.forEach((t) => (lookupMaps.teachers[t.ascId] = t));
    classes.forEach((c) => (lookupMaps.classes[c.ascId] = c));
    subjects.forEach((s) => (lookupMaps.subjects[s.ascId] = s));
    periods.forEach((p) => (lookupMaps.periods[p.period] = p));

    // Parse lessons (returns a map of lesson ID to lesson data)
    const lessonsMap = parseLessons(timetable.lessons, lookupMaps);

    // Create timetable entries from cards
    const timetableEntries = [];
    
    cards.forEach((card) => {
      const lesson = lessonsMap[card.lessonId];
      if (!lesson) {
        logger.warn(`Lesson not found for card: ${card.lessonId}`);
        return;
      }

      // Convert day pattern to day name
      const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      const dayPattern = card.days;
      let dayName = null;
      
      for (let i = 0; i < dayPattern.length && i < 5; i++) {
        if (dayPattern[i] === '1') {
          dayName = dayNames[i];
          break;
        }
      }

      if (!dayName) {
        logger.warn(`Could not determine day for card: ${card.lessonId}, pattern: ${dayPattern}`);
        return;
      }

      // Create entries for each class and teacher combination
      lesson.classIds.forEach((classId) => {
        const classInfo = lookupMaps.classes[classId];
        if (!classInfo) {
          logger.warn(`Class not found: ${classId}`);
          return;
        }

        lesson.teacherIds.forEach((teacherId, teacherIndex) => {
          const teacherInfo = lookupMaps.teachers[teacherId];
          if (!teacherInfo) {
            logger.warn(`Teacher not found: ${teacherId}`);
            return;
          }

          timetableEntries.push({
            class: classInfo.name,
            period: card.period,
            day: dayName,
            teacherAscId: teacherId,
            teacherName: teacherInfo.name,
            subject: lesson.subject,
            periodsPerCard: lesson.periodsPerCard,
            isCombinedClass: lesson.classIds.length > 1,
            alternateTeacherIds: teacherIndex === 0 ? lesson.teacherIds.slice(1) : [],
            lessonId: card.lessonId,
          });
        });
      });
    });

    logger.info('Timetable data transformed successfully', {
      teachersCount: teachers.length,
      classesCount: classes.length,
      subjectsCount: subjects.length,
      periodsCount: periods.length,
      cardsCount: cards.length,
      timetableEntriesCount: timetableEntries.length,
    });

    return {
      teachers,
      classes,
      subjects,
      periods,
      cards,
      timetableEntries,
      summary: {
        teachersCount: teachers.length,
        classesCount: classes.length,
        subjectsCount: subjects.length,
        periodsCount: periods.length,
        cardsCount: cards.length,
        timetableEntriesCount: timetableEntries.length,
      },
    };
  } catch (error) {
    logger.error('Timetable transformation failed', { error: error.message });
    throw error;
  }
};

export {
  parseTeachers,
  parseClasses,
  parseSubjects,
  parsePeriods,
  parseDayDefinitions,
  parseCards,
  parseLessons,
  transformTimetableData,
  convertDayPatternToDays,
  formatTimeToHHmm,
};

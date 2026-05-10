import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import {
  parseTeachers,
  parseClasses,
  parseSubjects,
  parsePeriods,
  parseDayDefinitions,
  parseCards,
  parseLessons,
  transformTimetableData,
  convertDayPatternToDays,
  formatTimeToHHmm
} from './timetableTransformer.js';

// Mock logger
jest.mock('../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Timetable Transformer', () => {
  describe('formatTimeToHHmm', () => {
    it('should format single digit hours', () => {
      expect(formatTimeToHHmm('7:40')).toBe('07:40');
      expect(formatTimeToHHmm('8:20')).toBe('08:20');
    });

    it('should keep double digit hours unchanged', () => {
      expect(formatTimeToHHmm('10:30')).toBe('10:30');
      expect(formatTimeToHHmm('12:50')).toBe('12:50');
    });

    it('should format single digit minutes', () => {
      expect(formatTimeToHHmm('10:5')).toBe('10:05');
      expect(formatTimeToHHmm('8:5')).toBe('08:05');
    });

    it('should handle null or invalid input', () => {
      expect(formatTimeToHHmm(null)).toBe(null);
      expect(formatTimeToHHmm('invalid')).toBe('invalid');
    });
  });

  describe('convertDayPatternToDays', () => {
    it('should convert Monday pattern', () => {
      const result = convertDayPatternToDays('10000');
      expect(result).toEqual(['Monday']);
    });

    it('should convert Tuesday pattern', () => {
      const result = convertDayPatternToDays('01000');
      expect(result).toEqual(['Tuesday']);
    });

    it('should convert multiple days pattern', () => {
      const result = convertDayPatternToDays('10000,01000,00100');
      expect(result).toEqual(['Monday', 'Tuesday', 'Wednesday']);
    });

    it('should convert all weekdays pattern', () => {
      const result = convertDayPatternToDays('11111');
      expect(result).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
    });
  });

  describe('parseTeachers', () => {
    it('should parse single teacher', () => {
      const teachersData = {
        teacher: {
          id: 't1',
          name: 'John Doe',
          firstname: 'John',
          lastname: 'Doe',
          short: 'JD'
        }
      };

      const result = parseTeachers(teachersData);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ascId: 't1',
        name: 'John Doe',
        firstname: 'John',
        lastname: 'Doe',
        short: 'JD'
      });
    });

    it('should parse multiple teachers', () => {
      const teachersData = {
        teacher: [
          { id: 't1', name: 'John Doe', firstname: 'John', lastname: 'Doe', short: 'JD' },
          { id: 't2', name: 'Jane Smith', firstname: 'Jane', lastname: 'Smith', short: 'JS' }
        ]
      };

      const result = parseTeachers(teachersData);
      
      expect(result).toHaveLength(2);
      expect(result[0].ascId).toBe('t1');
      expect(result[1].ascId).toBe('t2');
    });

    it('should handle missing teacher data', () => {
      const result = parseTeachers(null);
      expect(result).toEqual([]);
    });
  });

  describe('parseClasses', () => {
    it('should parse single class', () => {
      const classesData = {
        class: {
          id: 'c1',
          name: '6A',
          short: '6A',
          grade: '6'
        }
      };

      const result = parseClasses(classesData);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        ascId: 'c1',
        name: '6A',
        short: '6A',
        teacherId: null,
        grade: 6
      });
    });

    it('should parse multiple classes', () => {
      const classesData = {
        class: [
          { id: 'c1', name: '6A', short: '6A', grade: '6' },
          { id: 'c2', name: '6B', short: '6B', grade: '6' }
        ]
      };

      const result = parseClasses(classesData);
      
      expect(result).toHaveLength(2);
    });
  });

  describe('parsePeriods', () => {
    it('should parse periods with time formatting', () => {
      const periodsData = {
        period: [
          { period: '1', name: '1', short: '1', starttime: '7:40', endtime: '8:20' },
          { period: '2', name: '2', short: '2', starttime: '8:30', endtime: '9:10' }
        ]
      };

      const result = parsePeriods(periodsData);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        period: 1,
        name: '1',
        short: '1',
        startTime: '07:40',
        endTime: '08:20'
      });
      expect(result[1]).toEqual({
        period: 2,
        name: '2',
        short: '2',
        startTime: '08:30',
        endTime: '09:10'
      });
    });
  });

  describe('parseCards', () => {
    it('should parse single card', () => {
      const cardsData = {
        card: {
          lessonid: 'lesson1',
          period: '5',
          days: '10000',
          weeks: '1',
          terms: '1',
          classroomids: ''
        }
      };

      const result = parseCards(cardsData);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        lessonId: 'lesson1',
        period: 5,
        days: '10000',
        weeks: '1',
        terms: '1',
        classroomIds: ''
      });
    });

    it('should parse multiple cards', () => {
      const cardsData = {
        card: [
          { lessonid: 'lesson1', period: '1', days: '10000', weeks: '1', terms: '1' },
          { lessonid: 'lesson1', period: '2', days: '01000', weeks: '1', terms: '1' },
          { lessonid: 'lesson2', period: '5', days: '10000', weeks: '1', terms: '1' }
        ]
      };

      const result = parseCards(cardsData);
      
      expect(result).toHaveLength(3);
      expect(result[0].period).toBe(1);
      expect(result[1].period).toBe(2);
      expect(result[2].period).toBe(5);
    });

    it('should handle missing cards data', () => {
      const result = parseCards(null);
      expect(result).toEqual([]);
    });
  });

  describe('transformTimetableData', () => {
    it('should transform complete timetable data with correct period assignments', () => {
      const parsedXML = {
        timetable: {
          teachers: {
            teacher: { id: 't1', name: 'John Doe', firstname: 'John', lastname: 'Doe', short: 'JD' }
          },
          classes: {
            class: { id: 'c1', name: '6A', short: '6A', grade: '6' }
          },
          subjects: {
            subject: { id: 's1', name: 'Mathematics', short: 'Math' }
          },
          periods: {
            period: [
              { period: '1', name: '1', short: '1', starttime: '7:40', endtime: '8:20' },
              { period: '5', name: '5', short: '5', starttime: '10:50', endtime: '11:30' }
            ]
          },
          daysdefs: {
            daysdef: { id: 'd1', name: 'Monday', short: 'Mo', days: '10000' }
          },
          lessons: {
            lesson: {
              id: 'lesson1',
              classids: 'c1',
              subjectid: 's1',
              teacherids: 't1',
              periodspercard: '1',
              daysdefid: 'd1'
            }
          },
          cards: {
            card: [
              { lessonid: 'lesson1', period: '5', days: '10000', weeks: '1', terms: '1' }
            ]
          }
        }
      };

      const result = transformTimetableData(parsedXML);

      expect(result.teachers).toHaveLength(1);
      expect(result.classes).toHaveLength(1);
      expect(result.subjects).toHaveLength(1);
      expect(result.periods).toHaveLength(2);
      expect(result.cards).toHaveLength(1);
      expect(result.timetableEntries).toHaveLength(1);

      // Verify the timetable entry has correct period from card
      const entry = result.timetableEntries[0];
      expect(entry.period).toBe(5); // Should be period 5, not period 1
      expect(entry.class).toBe('6A');
      expect(entry.day).toBe('Monday');
      expect(entry.subject).toBe('Mathematics');
    });

    it('should create multiple entries for multiple cards', () => {
      const parsedXML = {
        timetable: {
          teachers: {
            teacher: { id: 't1', name: 'John Doe', firstname: 'John', lastname: 'Doe', short: 'JD' }
          },
          classes: {
            class: { id: 'c1', name: '6A', short: '6A', grade: '6' }
          },
          subjects: {
            subject: { id: 's1', name: 'Mathematics', short: 'Math' }
          },
          periods: {
            period: [
              { period: '1', name: '1', short: '1', starttime: '7:40', endtime: '8:20' },
              { period: '2', name: '2', short: '2', starttime: '8:30', endtime: '9:10' },
              { period: '5', name: '5', short: '5', starttime: '10:50', endtime: '11:30' }
            ]
          },
          daysdefs: {
            daysdef: { id: 'd1', name: 'Any day', short: 'X', days: '10000,01000' }
          },
          lessons: {
            lesson: {
              id: 'lesson1',
              classids: 'c1',
              subjectid: 's1',
              teacherids: 't1',
              periodspercard: '1',
              daysdefid: 'd1'
            }
          },
          cards: {
            card: [
              { lessonid: 'lesson1', period: '1', days: '10000', weeks: '1', terms: '1' },
              { lessonid: 'lesson1', period: '2', days: '01000', weeks: '1', terms: '1' },
              { lessonid: 'lesson1', period: '5', days: '10000', weeks: '1', terms: '1' }
            ]
          }
        }
      };

      const result = transformTimetableData(parsedXML);

      expect(result.timetableEntries).toHaveLength(3);
      
      // Verify each entry has correct period
      expect(result.timetableEntries[0].period).toBe(1);
      expect(result.timetableEntries[0].day).toBe('Monday');
      
      expect(result.timetableEntries[1].period).toBe(2);
      expect(result.timetableEntries[1].day).toBe('Tuesday');
      
      expect(result.timetableEntries[2].period).toBe(5);
      expect(result.timetableEntries[2].day).toBe('Monday');
    });

    it('should handle multiple teachers for same lesson', () => {
      const parsedXML = {
        timetable: {
          teachers: {
            teacher: [
              { id: 't1', name: 'John Doe', firstname: 'John', lastname: 'Doe', short: 'JD' },
              { id: 't2', name: 'Jane Smith', firstname: 'Jane', lastname: 'Smith', short: 'JS' }
            ]
          },
          classes: {
            class: { id: 'c1', name: '6A', short: '6A', grade: '6' }
          },
          subjects: {
            subject: { id: 's1', name: 'Mathematics', short: 'Math' }
          },
          periods: {
            period: { period: '1', name: '1', short: '1', starttime: '7:40', endtime: '8:20' }
          },
          daysdefs: {
            daysdef: { id: 'd1', name: 'Monday', short: 'Mo', days: '10000' }
          },
          lessons: {
            lesson: {
              id: 'lesson1',
              classids: 'c1',
              subjectid: 's1',
              teacherids: 't1,t2', // Multiple teachers
              periodspercard: '1',
              daysdefid: 'd1'
            }
          },
          cards: {
            card: { lessonid: 'lesson1', period: '1', days: '10000', weeks: '1', terms: '1' }
          }
        }
      };

      const result = transformTimetableData(parsedXML);

      // Should create entries for both teachers
      expect(result.timetableEntries).toHaveLength(2);
      expect(result.timetableEntries[0].teacherAscId).toBe('t1');
      expect(result.timetableEntries[1].teacherAscId).toBe('t2');
    });
  });
});

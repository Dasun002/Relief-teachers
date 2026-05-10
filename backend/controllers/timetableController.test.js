import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { importTimetable, getTimetable } from './timetableController.js';
import TimetableService from '../services/TimetableService.js';
import { parseAndValidateXML } from '../services/xmlParser.js';
import { transformTimetableData } from '../services/timetableTransformer.js';
import Teacher from '../models/Teacher.js';

// Mock dependencies
jest.mock('../services/TimetableService.js');
jest.mock('../services/xmlParser.js');
jest.mock('../services/timetableTransformer.js');
jest.mock('../models/Teacher.js');
jest.mock('../utils/logger.js', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Timetable Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockReq = {
      query: {},
      file: null
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
  });

  describe('getTimetable', () => {
    it('should return all timetable entries when no filters provided', async () => {
      const mockEntries = [
        { class: '6A', period: 1, day: 'Monday', subject: 'Math' },
        { class: '6B', period: 2, day: 'Tuesday', subject: 'English' }
      ];

      TimetableService.getAll.mockResolvedValue(mockEntries);

      await getTimetable(mockReq, mockRes);

      expect(TimetableService.getAll).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          timetable: mockEntries,
          count: 2
        }
      });
    });

    it('should filter by class when class parameter provided', async () => {
      mockReq.query = { class: '6A' };
      const mockEntries = [
        { class: '6A', period: 1, day: 'Monday', subject: 'Math' }
      ];

      TimetableService.findByClass.mockResolvedValue(mockEntries);

      await getTimetable(mockReq, mockRes);

      expect(TimetableService.findByClass).toHaveBeenCalledWith('6A');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should filter by teacher when teacher parameter provided', async () => {
      mockReq.query = { teacher: 'teacher123' };
      const mockEntries = [
        { teacher: 'teacher123', period: 1, day: 'Monday' }
      ];

      TimetableService.findByTeacher.mockResolvedValue(mockEntries);

      await getTimetable(mockReq, mockRes);

      expect(TimetableService.findByTeacher).toHaveBeenCalledWith('teacher123');
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });

    it('should handle database errors', async () => {
      TimetableService.getAll.mockRejectedValue(new Error('Database error'));

      await getTimetable(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to retrieve timetable'
        }
      });
    });
  });

  describe('importTimetable', () => {
    const mockXMLBuffer = Buffer.from('<?xml version="1.0"?><timetable></timetable>');
    
    beforeEach(() => {
      mockReq.file = {
        originalname: 'timetable.xml',
        size: 1024,
        buffer: mockXMLBuffer
      };
    });

    it('should successfully import timetable from XML', async () => {
      const mockParsedXML = { timetable: { teachers: [], classes: [] } };
      const mockTransformedData = {
        teachers: [
          { ascId: 't1', name: 'John Doe' }
        ],
        periods: [
          { period: 1, startTime: '07:40', endTime: '08:20' }
        ],
        timetableEntries: [
          {
            class: '6A',
            period: 1,
            day: 'Monday',
            teacherAscId: 't1',
            subject: 'Math'
          }
        ]
      };

      parseAndValidateXML.mockResolvedValue(mockParsedXML);
      transformTimetableData.mockReturnValue(mockTransformedData);
      
      Teacher.findOne.mockResolvedValue({
        _id: 'teacher123',
        name: 'John Doe'
      });

      TimetableService.bulkImport.mockResolvedValue({
        imported: 1,
        updated: 0,
        errors: [],
        total: 1
      });

      await importTimetable(mockReq, mockRes);

      expect(parseAndValidateXML).toHaveBeenCalled();
      expect(transformTimetableData).toHaveBeenCalled();
      expect(TimetableService.bulkImport).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            message: 'Timetable imported successfully'
          })
        })
      );
    });

    it('should reject non-XML files', async () => {
      mockReq.file.originalname = 'timetable.txt';

      await importTimetable(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid file type. Only XML files are allowed.'
        }
      });
    });

    it('should handle missing file', async () => {
      mockReq.file = null;

      await importTimetable(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'No file uploaded. Please upload an XML file.'
        }
      });
    });

    it('should handle XML parsing errors', async () => {
      parseAndValidateXML.mockRejectedValue(new Error('Invalid XML format'));

      await importTimetable(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'INVALID_XML',
          message: expect.stringContaining('Failed to parse XML file')
        }
      });
    });

    it('should create new teachers if they do not exist', async () => {
      const mockParsedXML = { timetable: { teachers: [], classes: [] } };
      const mockTransformedData = {
        teachers: [
          { ascId: 't1', name: 'New Teacher' }
        ],
        periods: [
          { period: 1, startTime: '07:40', endTime: '08:20' }
        ],
        timetableEntries: []
      };

      parseAndValidateXML.mockResolvedValue(mockParsedXML);
      transformTimetableData.mockReturnValue(mockTransformedData);
      
      // Teacher doesn't exist
      Teacher.findOne.mockResolvedValue(null);
      
      // Mock teacher creation
      const mockNewTeacher = {
        _id: 'newteacher123',
        name: 'New Teacher',
        subjects: ['General'],
        save: jest.fn().mockResolvedValue(true)
      };
      Teacher.mockImplementation(() => mockNewTeacher);

      TimetableService.bulkImport.mockResolvedValue({
        imported: 0,
        updated: 0,
        errors: [],
        total: 0
      });

      await importTimetable(mockReq, mockRes);

      expect(Teacher.findOne).toHaveBeenCalledWith({ name: 'New Teacher' });
      expect(mockNewTeacher.save).toHaveBeenCalled();
    });

    it('should format times to HH:mm format', async () => {
      const mockParsedXML = { timetable: { teachers: [], classes: [] } };
      const mockTransformedData = {
        teachers: [
          { ascId: 't1', name: 'John Doe' }
        ],
        periods: [
          { period: 1, startTime: '7:40', endTime: '8:20' } // Single digit hours
        ],
        timetableEntries: [
          {
            class: '6A',
            period: 1,
            day: 'Monday',
            teacherAscId: 't1',
            subject: 'Math'
          }
        ]
      };

      parseAndValidateXML.mockResolvedValue(mockParsedXML);
      transformTimetableData.mockReturnValue(mockTransformedData);
      
      Teacher.findOne.mockResolvedValue({
        _id: 'teacher123',
        name: 'John Doe'
      });

      let capturedEntries;
      TimetableService.bulkImport.mockImplementation((entries) => {
        capturedEntries = entries;
        return Promise.resolve({
          imported: 1,
          updated: 0,
          errors: [],
          total: 1
        });
      });

      await importTimetable(mockReq, mockRes);

      // Check that times were formatted with leading zeros
      expect(capturedEntries[0].startTime).toBe('07:40');
      expect(capturedEntries[0].endTime).toBe('08:20');
    });

    it('should use correct period from transformed data', async () => {
      const mockParsedXML = { timetable: { teachers: [], classes: [] } };
      const mockTransformedData = {
        teachers: [
          { ascId: 't1', name: 'John Doe' }
        ],
        periods: [
          { period: 1, startTime: '07:40', endTime: '08:20' },
          { period: 2, startTime: '08:30', endTime: '09:10' },
          { period: 5, startTime: '10:50', endTime: '11:30' }
        ],
        timetableEntries: [
          {
            class: '6A',
            period: 5, // Should use period 5, not period 1
            day: 'Monday',
            teacherAscId: 't1',
            subject: 'Math'
          }
        ]
      };

      parseAndValidateXML.mockResolvedValue(mockParsedXML);
      transformTimetableData.mockReturnValue(mockTransformedData);
      
      Teacher.findOne.mockResolvedValue({
        _id: 'teacher123',
        name: 'John Doe'
      });

      let capturedEntries;
      TimetableService.bulkImport.mockImplementation((entries) => {
        capturedEntries = entries;
        return Promise.resolve({
          imported: 1,
          updated: 0,
          errors: [],
          total: 1
        });
      });

      await importTimetable(mockReq, mockRes);

      // Verify the entry uses period 5, not period 1
      expect(capturedEntries[0].period).toBe(5);
      expect(capturedEntries[0].startTime).toBe('10:50');
      expect(capturedEntries[0].endTime).toBe('11:30');
    });
  });
});

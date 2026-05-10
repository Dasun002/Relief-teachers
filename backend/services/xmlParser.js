import xml2js from 'xml2js';
import logger from '../utils/logger.js';

/**
 * Parse XML string to JavaScript object
 * @param {string} xmlString - XML content as string
 * @returns {Promise<Object>} Parsed XML as JavaScript object
 */
const parseXML = async (xmlString) => {
  try {
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      trim: true,
    });

    const result = await parser.parseStringPromise(xmlString);
    logger.info('XML parsed successfully');
    return result;
  } catch (error) {
    logger.error('XML parsing failed', { error: error.message });
    throw new Error(`Failed to parse XML: ${error.message}`);
  }
};

/**
 * Validate XML structure for aSc Timetables format
 * @param {Object} parsedXML - Parsed XML object
 * @returns {boolean} True if valid
 */
const validateXMLStructure = (parsedXML) => {
  try {
    if (!parsedXML.timetable) {
      throw new Error('Invalid XML: Missing timetable root element');
    }

    const timetable = parsedXML.timetable;

    // Check for required sections
    const requiredSections = ['teachers', 'classes', 'subjects', 'periods', 'lessons'];
    const missingSections = requiredSections.filter(section => !timetable[section]);

    if (missingSections.length > 0) {
      throw new Error(`Invalid XML: Missing required sections: ${missingSections.join(', ')}`);
    }

    logger.info('XML structure validated successfully');
    return true;
  } catch (error) {
    logger.error('XML validation failed', { error: error.message });
    throw error;
  }
};

/**
 * Parse XML file and validate structure
 * @param {string} xmlString - XML content as string
 * @returns {Promise<Object>} Validated parsed XML
 */
const parseAndValidateXML = async (xmlString) => {
  try {
    // Parse XML
    const parsedXML = await parseXML(xmlString);

    // Validate structure
    validateXMLStructure(parsedXML);

    return parsedXML;
  } catch (error) {
    logger.error('XML parsing and validation failed', { error: error.message });
    throw error;
  }
};

export { parseXML, validateXMLStructure, parseAndValidateXML };

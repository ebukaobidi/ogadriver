import { createWorker } from 'tesseract.js';

/**
 * Heuristic: does OCR text look like a driver's license (not a random photo)?
 */
export const looksLikeDriversLicense = (text) => {
  if (!text || typeof text !== 'string') return false;
  const normalized = text.replace(/\s+/g, ' ').toUpperCase();

  const strongSignals = [
    /DRIVER['']?S?\s*LICEN[CS]E/i,
    /\bFRSC\b/i,
    /\bNIGERIA\b.*LICEN/i,
    /\bLICEN[CS]E\s*(NO|NUMBER|#)\b/i,
    /\bDL\s*(NO|NUMBER|#)\b/i,
    /\bCLASS\s*[A-Z0-9]+\b/i,
    /\bFEDERAL\s+ROAD\s+SAFETY\b/i,
  ];

  const weakSignals = [
    /\bLICEN[CS]E\b/i,
    /\bEXP(?:IRY|\.|\s+DATE)?\b/i,
    /\bVALID\s+(?:UNTIL|TILL|TO)\b/i,
    /\bDOB\b|\bDATE\s+OF\s+BIRTH\b/i,
    /\bSEX\b|\bGENDER\b/i,
    /\bBLOOD\s*GROUP\b/i,
  ];

  if (strongSignals.some((re) => re.test(normalized))) {
    return true;
  }

  const weakHits = weakSignals.filter((re) => re.test(normalized)).length;
  // Require several license-like fields so random photos fail
  return weakHits >= 3;
};

/**
 * Parses extracted text to find potential expiration dates on a driver's license.
 * @param {string} text - OCR text extracted from license image.
 * @returns {object} - { extractedDate: Date|null, rawString: string|null, isExpired: boolean }
 */
export const parseExpiryDateFromText = (text) => {
  if (!text) return { extractedDate: null, rawString: null, isExpired: false };

  // Common patterns on Driver's Licenses (FRSC, international, etc.)
  const patterns = [
    /(?:EXP(?:IRY|\.|\s+DATE)?|VALID(?:\s+UNTIL|\s+TILL|\s+TO)?|VAL(?:IDITY)?|TO)[\s.:/\-]*([0-9]{1,2}[\/\-.][0-9]{1,2}[\/\-.][0-9]{2,4})/i,
    /(?:EXP(?:IRY|\.|\s+DATE)?|VALID(?:\s+UNTIL|\s+TILL|\s+TO)?|VAL(?:IDITY)?|TO)[\s.:/\-]*([0-9]{1,2}\s+(?:JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[a-z]*[\s,.\-]+[0-9]{2,4})/i,
    /(?:EXP(?:IRY|\.|\s+DATE)?|VALID(?:\s+UNTIL|\s+TILL|\s+TO)?|VAL(?:IDITY)?|TO)[\s.:/\-]*([0-9]{4}[\/\-.][0-9]{1,2}[\/\-.][0-9]{1,2})/i,
    // FRSC-style often prints dates near EXP without perfect labels after OCR noise
    /(?:EXP|EXPIRES|VALID)[^\d]{0,12}([0-9]{2}[\/\-.][0-9]{2}[\/\-.][0-9]{4})/i,
    /([0-9]{2}[\/\-.][0-9]{2}[\/\-.](?:202[0-9]|203[0-9]))/g,
  ];

  let detectedDateStr = null;

  for (const regex of patterns) {
    const match = text.match(regex);
    if (match && match[1]) {
      detectedDateStr = match[1].trim();
      break;
    }
  }

  if (!detectedDateStr) {
    return { extractedDate: null, rawString: null, isExpired: false };
  }

  let parsedDate = null;

  // Handle "12 MAY 2026" style
  const monthNameMatch = detectedDateStr.match(
    /^([0-9]{1,2})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[\s,.-]+([0-9]{2,4})$/i
  );
  if (monthNameMatch) {
    const months = {
      JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06',
      JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12',
    };
    const day = monthNameMatch[1].padStart(2, '0');
    const mon = months[monthNameMatch[2].toUpperCase().slice(0, 3)];
    let year = monthNameMatch[3];
    if (year.length === 2) year = `20${year}`;
    parsedDate = new Date(`${year}-${mon}-${day}T12:00:00`);
  } else if (detectedDateStr.includes('/') || detectedDateStr.includes('-') || detectedDateStr.includes('.')) {
    const parts = detectedDateStr.split(/[\/\-.]/).map((p) => p.trim());
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        parsedDate = new Date(`${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}T12:00:00`);
      } else if (parts[2].length === 4 || parts[2].length === 2) {
        // Prefer DD-MM-YYYY (Nigeria / FRSC)
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        const day = parts[0].padStart(2, '0');
        const mon = parts[1].padStart(2, '0');
        parsedDate = new Date(`${year}-${mon}-${day}T12:00:00`);
      }
    }
  }

  if (!parsedDate || isNaN(parsedDate.getTime())) {
    parsedDate = new Date(detectedDateStr);
  }

  if (isNaN(parsedDate.getTime())) {
    return { extractedDate: null, rawString: detectedDateStr, isExpired: false };
  }

  const now = new Date();
  // End of expiry day still counts as valid
  parsedDate.setHours(23, 59, 59, 999);
  const isExpired = parsedDate < now;

  return {
    extractedDate: parsedDate,
    rawString: detectedDateStr,
    isExpired,
  };
};

/**
 * Format Date as YYYY-MM-DD for API expiry_date.
 */
export const formatDateYmd = (date) => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return null;
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Scans an image file using Tesseract OCR and evaluates license authenticity + expiration.
 * @param {File|Blob|string} imageSource - The image to process.
 * @param {function} onProgress - Optional progress callback (percent 0-100).
 * @returns {Promise<object>} - Analysis results.
 */
export const scanLicenseImage = async (imageSource, onProgress = null) => {
  let worker = null;
  try {
    worker = await createWorker('eng', 1, {
      logger: onProgress
        ? (m) => {
            if (m.status === 'recognizing text' && typeof m.progress === 'number') {
              onProgress(Math.round(m.progress * 100));
            }
          }
        : undefined,
    });

    // Slightly favor accuracy for ID documents
    await worker.setParameters({
      tessedit_pageseg_mode: '6',
    });

    const ret = await worker.recognize(imageSource);
    const text = ret.data.text || '';
    const isLicense = looksLikeDriversLicense(text);
    const { extractedDate, rawString, isExpired } = parseExpiryDateFromText(text);

    const looksValid =
      isLicense &&
      !!extractedDate &&
      !isExpired &&
      (ret.data.confidence == null || ret.data.confidence >= 35);

    return {
      success: true,
      text,
      extractedDate,
      rawDateString: rawString,
      expiryYmd: formatDateYmd(extractedDate),
      isExpired: !!isExpired,
      isLicense,
      looksValid,
      confidence: ret.data.confidence,
      // Fail closed when OCR cannot prove a valid unexpired license
      rejectionReason: !isLicense
        ? 'not_license'
        : !extractedDate
          ? 'no_expiry'
          : isExpired
            ? 'expired'
            : (ret.data.confidence != null && ret.data.confidence < 35)
              ? 'low_confidence'
              : null,
    };
  } catch (error) {
    console.error('OCR scanning error:', error);
    return {
      success: false,
      error: error.message || 'OCR processing failed',
      isExpired: false,
      isLicense: false,
      looksValid: false,
      rejectionReason: 'ocr_error',
    };
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
};

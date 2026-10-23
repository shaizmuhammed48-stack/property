/**
 * Kerala Estates — Google Sheets bridge for the Next.js application.
 *
 * Deploy this file as a Google Apps Script web app bound to (or configured
 * with) the property spreadsheet. See README.md for deployment steps.
 *
 * Security model
 *  - Public actions: ping, list/properties, addEnquiry/createEnquiry.
 *  - Admin actions: enquiries/listEnquiries, updateEnquiry/updateEnquiryStatus.
 *    These require the shared ADMIN_TOKEN stored in Script Properties and sent
 *    by the Next.js server only. No admin role or token is ever exposed to the
 *    browser.
 *  - Apps Script web apps do not expose custom request headers reliably, so
 *    the Next server sends the token in an authenticated POST body (or in the
 *    query string for read-only GET requests).
 */

var STATUSES = ['New', 'Contacted', 'Interested', 'Closed'];

var PROPERTY_HINTS = [
  'id', 'propertyid', 'name', 'propertyname', 'title', 'project',
  'price', 'prize', 'amount', 'rate', 'cost', 'value',
  'city', 'district', 'location', 'landmark', 'bedrooms', 'bathrooms',
  'area', 'imageurl', 'cardimage', 'cardimageurl', 'imagelink', 'propertyimage',
  'picture', 'photo', 'gallery', 'features', 'description'
];

var ENQUIRY_HINTS = [
  'id', 'enquiryid', 'leadid', 'buyername', 'name', 'buyer',
  'phone', 'mobile', 'email', 'propertyid', 'propertyname',
  'preferredlocation', 'location', 'budget', 'message', 'status', 'createdat'
];

var ENQUIRY_FIELDS = {
  id: ['id', 'enquiryid', 'leadid', 'reference'],
  buyerName: ['buyername', 'name', 'buyer', 'fullname', 'clientname'],
  phone: ['phone', 'phonenumber', 'mobile', 'whatsapp', 'contact'],
  email: ['email', 'emailaddress', 'mail'],
  propertyId: ['propertyid', 'property', 'propertyref', 'projectid'],
  propertyName: ['propertyname', 'projectname'],
  preferredLocation: ['preferredlocation', 'location', 'preferredarea', 'area'],
  budget: ['budget', 'pricerange', 'budgetrange'],
  propertyType: ['propertytype', 'type', 'preferredpropertytype'],
  bedrooms: ['bedrooms', 'bhk', 'preferredbedrooms', 'beds'],
  message: ['message', 'notes', 'note', 'requirement', 'comments'],
  status: ['status', 'enquirystatus', 'stage', 'leadstatus'],
  createdAt: ['createdat', 'enquirydate', 'timestamp', 'submittedat', 'dateadded'],
  source: ['source', 'channel', 'leadsource']
};

var ENQUIRY_DISPLAY = {
  id: 'Enquiry ID',
  buyerName: 'Buyer Name',
  phone: 'Phone',
  email: 'Email',
  propertyId: 'Property ID',
  propertyName: 'Property Name',
  preferredLocation: 'Preferred Location',
  budget: 'Budget',
  propertyType: 'Property Type',
  bedrooms: 'Bedrooms',
  message: 'Message',
  status: 'Status',
  createdAt: 'Created At',
  source: 'Source'
};

/* --------------------------------------------------------------------------
 * Web app entry points
 * ------------------------------------------------------------------------ */

function doGet(e) {
  return route_(e, 'GET');
}

function doPost(e) {
  return route_(e, 'POST');
}

function route_(e, method) {
  try {
    var params = (e && e.parameter) || {};
    var body = parseBody_(e);
    var action = String(body.action || params.action || '').trim();

    switch (action) {
      case 'ping':
        return json_({
          ok: true,
          data: {
            service: 'Kerala Estates Sheets Bridge',
            version: '1.0.0',
            time: new Date().toISOString(),
            spreadsheetConfigured: Boolean(getSpreadsheetId_()),
            adminTokenConfigured: Boolean(getAdminToken_())
          }
        });

      case 'list':
      case 'properties':
        return json_({ ok: true, data: listProperties_() });

      case 'enquiries':
        requireAdmin_(e, body);
        return json_({ ok: true, data: listEnquiries_() });

      case 'listEnquiries':
        requireAdmin_(e, body);
        return json_({ ok: true, data: listEnquiries_() });

      case 'addEnquiry':
        if (method !== 'POST') {
          throw appError_('method_not_allowed', 'addEnquiry requires POST.');
        }
        return json_({ ok: true, data: createEnquiry_(normalizeEnquiryBody_(body)) });

      case 'createEnquiry':
        if (method !== 'POST') {
          throw appError_('method_not_allowed', 'createEnquiry requires POST.');
        }
        return json_({ ok: true, data: createEnquiry_(body) });

      case 'updateEnquiry':
        if (method !== 'POST') {
          throw appError_('method_not_allowed', 'updateEnquiry requires POST.');
        }
        requireAdmin_(e, body);
        return json_({
          ok: true,
          data: {
            enquiry: updateEnquiryByRow_(
              body.row !== undefined ? body.row : params.row,
              normalizeStatusLabel_(body.status !== undefined ? body.status : params.status)
            )
          }
        });

      case 'updateEnquiryStatus':
        if (method !== 'POST') {
          throw appError_('method_not_allowed', 'updateEnquiryStatus requires POST.');
        }
        requireAdmin_(e, body);
        return json_({
          ok: true,
          data: { enquiry: updateEnquiryStatus_(body.id, body.status) }
        });

      default:
        throw appError_(
          'unknown_action',
          'Unknown action. Use ping, list/properties, enquiries/listEnquiries, addEnquiry/createEnquiry or updateEnquiry/updateEnquiryStatus.'
        );
    }
  } catch (error) {
    var code = error && error.code ? error.code : 'server_error';
    var message =
      error && error.publicMessage
        ? error.publicMessage
        : error && error.message
          ? error.message
          : 'The property bridge could not complete the request.';
    try {
      Logger.log('[kerala-estates] ' + (error && error.stack ? error.stack : message));
    } catch (ignored) {
      // Logging must never mask the original error.
    }
    return json_({ ok: false, error: { code: code, message: message } });
  }
}

/* --------------------------------------------------------------------------
 * Configuration and auth
 * ------------------------------------------------------------------------ */

function getSpreadsheetId_() {
  return String(PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID') || '').trim();
}

function getAdminToken_() {
  return String(PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN') || '').trim();
}

function getSpreadsheet_() {
  var id = getSpreadsheetId_();
  if (id) return SpreadsheetApp.openById(id);
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (!active) {
    throw appError_(
      'spreadsheet_not_configured',
      'Set the SPREADSHEET_ID Script Property, or bind this script to the spreadsheet.'
    );
  }
  return active;
}

function requireAdmin_(e, body) {
  var expected = getAdminToken_();
  if (!expected) {
    throw appError_(
      'admin_not_configured',
      'Set the ADMIN_TOKEN Script Property before using admin actions.'
    );
  }

  var token = body && body.adminToken ? String(body.adminToken) : '';
  if (!token && e && e.parameter && e.parameter.adminToken) {
    token = String(e.parameter.adminToken);
  }
  if (!token && e && e.headers) {
    var auth = e.headers.Authorization || e.headers.authorization || '';
    if (auth) token = String(auth).replace(/^Bearer\s+/i, '');
  }

  if (!safeEqual_(token.trim(), expected)) {
    throw appError_('unauthorized', 'The admin token is missing or invalid.');
  }
}

function safeEqual_(left, right) {
  left = String(left || '');
  right = String(right || '');
  if (left.length !== right.length) return false;
  var difference = 0;
  for (var i = 0; i < left.length; i += 1) {
    difference |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return difference === 0;
}

/* --------------------------------------------------------------------------
 * Sheet detection and reading
 * ------------------------------------------------------------------------ */

function getHeaders_(sheet) {
  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  var values = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  return values.map(function (value) {
    return String(value).trim();
  });
}

function normalizeKey_(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function hasAny_(keys, aliases) {
  for (var i = 0; i < aliases.length; i += 1) {
    if (keys.indexOf(aliases[i]) !== -1) return true;
  }
  return false;
}

function scoreHeaders_(keys, hints) {
  var score = 0;
  for (var i = 0; i < hints.length; i += 1) {
    if (keys.indexOf(hints[i]) !== -1) score += 1;
  }
  return score;
}

/**
 * Finds the most likely property or enquiry tab by inspecting every tab's
 * header row. It deliberately does not assume a tab name.
 */
function detectSheet_(kind, excludeSheetName) {
  var spreadsheet = getSpreadsheet_();
  var sheets = spreadsheet.getSheets();
  var best = null;
  var excluded = excludeSheetName ? normalizeKey_(excludeSheetName) : '';

  for (var i = 0; i < sheets.length; i += 1) {
    var sheet = sheets[i];
    if (excluded && normalizeKey_(sheet.getName()) === excluded) continue;

    var headers = getHeaders_(sheet);
    var keys = headers.map(normalizeKey_);

    var qualifies = false;
    if (kind === 'property') {
      qualifies =
        hasAny_(keys, ['price', 'prize', 'amount', 'value', 'cost', 'rate', 'askingprice', 'sellingprice']) &&
        hasAny_(keys, ['name', 'propertyname', 'project', 'title', 'projectname']);
    } else {
      qualifies =
        hasAny_(keys, ['phone', 'mobile', 'whatsapp', 'email', 'enquiryid', 'leadid', 'enquirydate']) &&
        hasAny_(keys, ['name', 'buyername', 'buyer', 'fullname', 'clientname']);
    }

    if (!qualifies) continue;

    var score = scoreHeaders_(keys, kind === 'property' ? PROPERTY_HINTS : ENQUIRY_HINTS);
    if (!best || score > best.score) {
      best = { sheet: sheet, headers: headers, score: score };
    }
  }

  return best ? best.sheet : null;
}

function getPropertySheet_() {
  var sheet = detectSheet_('property');
  if (!sheet) {
    throw appError_(
      'property_sheet_not_found',
      'No tab with property name and price columns could be detected.'
    );
  }
  return sheet;
}

function detectEnquirySheet_() {
  return detectSheet_('enquiry');
}

function getEnquirySheet_(createIfMissing) {
  var sheet = detectEnquirySheet_();
  if (sheet) return sheet;

  if (!createIfMissing) {
    throw appError_(
      'enquiry_sheet_not_found',
      'No enquiry tab could be detected. Submit one website enquiry first, or create an Enquiries tab.'
    );
  }

  var spreadsheet = getSpreadsheet_();
  sheet = spreadsheet.insertSheet('Enquiries');
  var headers = Object.keys(ENQUIRY_FIELDS).map(function (key) {
    return ENQUIRY_DISPLAY[key];
  });
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  return sheet;
}

function cellToJson_(value) {
  if (value instanceof Date) return value.toISOString();
  if (value === null || value === undefined) return '';
  return value;
}

/**
 * Google Sheets stores in-cell pictures as `=IMAGE("https://…")` formulas.
 * getValues() returns an empty string for those cells, so recover the URL
 * from the formula when the value is blank.
 */
function formulaImageUrl_(formula) {
  var raw = String(formula || '').trim();
  if (!raw) return '';
  var match = raw.match(/(?:IMAGE|HYPERLINK)\s*\(\s*["']([^"']+)["']/i);
  if (match && match[1]) return match[1];
  return '';
}

function readSheetData_(sheet) {
  var lastRow = sheet.getLastRow();
  var lastColumn = Math.max(sheet.getLastColumn(), 1);
  if (lastRow < 1) {
    return { headers: [], records: [], rowNumbers: [] };
  }

  var range = sheet.getRange(1, 1, lastRow, lastColumn);
  var values = range.getValues();
  var formulas = range.getFormulas();
  var headers = values[0].map(function (value) {
    return String(value).trim();
  });

  var records = [];
  var rowNumbers = [];

  for (var rowIndex = 1; rowIndex < values.length; rowIndex += 1) {
    var row = values[rowIndex];
    var blank = true;
    for (var columnIndex = 0; columnIndex < row.length; columnIndex += 1) {
      if (String(row[columnIndex]).trim() !== '') {
        blank = false;
        break;
      }
    }
    if (blank) continue;

    var record = {};
    for (var i = 0; i < headers.length; i += 1) {
      if (!headers[i]) continue;
      var cellValue = cellToJson_(row[i]);
      if (String(cellValue).trim() === '') {
        var fromFormula = formulaImageUrl_(formulas[rowIndex] && formulas[rowIndex][i]);
        if (fromFormula) cellValue = fromFormula;
      }
      record[headers[i]] = cellValue;
    }
    records.push(record);
    rowNumbers.push(rowIndex + 1);
  }

  return { headers: headers, records: records, rowNumbers: rowNumbers };
}

function listProperties_() {
  var sheet = getPropertySheet_();
  var data = readSheetData_(sheet);
  return {
    sheet: sheet.getName(),
    headers: data.headers,
    rows: data.records
  };
}

function listEnquiries_() {
  var sheet = detectEnquirySheet_();
  if (!sheet) return { sheet: null, headers: [], rows: [] };
  var data = readSheetData_(sheet);
  return {
    sheet: sheet.getName(),
    headers: data.headers,
    rows: data.records
  };
}

function fieldValue_(record, headers, field) {
  var index = findHeaderIndex_(headers, field);
  if (index < 0) return '';
  return record[headers[index]];
}

/* --------------------------------------------------------------------------
 * Header mapping and enquiry creation
 * ------------------------------------------------------------------------ */

function findHeaderIndex_(headers, field) {
  var aliases = ENQUIRY_FIELDS[field] || [field];
  var normalized = headers.map(normalizeKey_);
  for (var i = 0; i < aliases.length; i += 1) {
    var index = normalized.indexOf(normalizeKey_(aliases[i]));
    if (index !== -1) return index;
  }
  return -1;
}

function ensureEnquiryHeaders_(sheet) {
  var headers = getHeaders_(sheet);
  var changed = false;

  Object.keys(ENQUIRY_FIELDS).forEach(function (field) {
    if (findHeaderIndex_(headers, field) === -1) {
      headers.push(ENQUIRY_DISPLAY[field]);
      sheet.getRange(1, headers.length).setValue(ENQUIRY_DISPLAY[field]);
      changed = true;
    }
  });

  if (changed) sheet.setFrozenRows(1);
  return headers;
}

function safeCell_(value) {
  if (typeof value !== 'string') return value;
  if (/^[=+\-@\t\r]/.test(value)) return "'" + value;
  return value;
}

function normalizePhone_(value) {
  return String(value || '').replace(/[^\d]/g, '').slice(-10);
}

function validateEnquiry_(body) {
  var name = String(body.buyerName || '').trim();
  if (!name) throw appError_('validation_failed', 'Full name is required.');
  if (name.length > 80) throw appError_('validation_failed', 'Full name is too long.');

  var phone = String(body.phone || '').trim();
  var digits = phone.replace(/[^\d]/g, '');
  if (digits.length < 10 || digits.length > 15) {
    throw appError_('validation_failed', 'Enter a valid phone number with 10–15 digits.');
  }

  var email = String(body.email || '').trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw appError_('validation_failed', 'Enter a valid email address.');
  }
  if (email.length > 160) throw appError_('validation_failed', 'Email is too long.');

  var message = String(body.message || '').trim();
  if (message.length > 1200) throw appError_('validation_failed', 'Message is too long.');

  return {
    buyerName: name,
    phone: phone,
    email: email,
    propertyId: String(body.propertyId || '').trim(),
    propertyName: String(body.propertyName || '').trim(),
    preferredLocation: String(body.preferredLocation || '').trim().slice(0, 120),
    budget: String(body.budget || '').trim().slice(0, 60),
    propertyType: String(body.propertyType || '').trim().slice(0, 60),
    bedrooms: String(body.bedrooms || '').trim().slice(0, 20),
    message: message
  };
}

function createEnquiry_(body) {
  var input = validateEnquiry_(body);
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw appError_('busy', 'The enquiry desk is busy. Please try again in a moment.');
  }

  try {
    var sheet = getEnquirySheet_(true);
    var headers = ensureEnquiryHeaders_(sheet);
    var data = readSheetData_(sheet);

    var duplicate = findRecentDuplicate_(data, input);
    if (duplicate) {
      return { enquiry: duplicate, duplicate: true };
    }

    var id = 'ENQ-' + Date.now().toString(36).toUpperCase() + '-' +
      Utilities.getUuid().slice(0, 4).toUpperCase();
    var createdAt = new Date().toISOString();

    var valuesByField = {
      id: id,
      buyerName: input.buyerName,
      phone: input.phone,
      email: input.email,
      propertyId: input.propertyId,
      propertyName: input.propertyName,
      preferredLocation: input.preferredLocation,
      budget: input.budget,
      propertyType: input.propertyType,
      bedrooms: input.bedrooms,
      message: input.message,
      status: 'New',
      createdAt: createdAt,
      source: 'website'
    };

    var row = headers.map(function (header) {
      var normalized = normalizeKey_(header);
      var field = null;
      Object.keys(ENQUIRY_FIELDS).forEach(function (candidate) {
        if (field) return;
        var aliases = ENQUIRY_FIELDS[candidate].map(normalizeKey_);
        if (aliases.indexOf(normalized) !== -1) field = candidate;
      });
      if (!field) return '';
      return safeCell_(valuesByField[field]);
    });

    sheet.appendRow(row);

    var record = {};
    for (var i = 0; i < headers.length; i += 1) {
      if (headers[i]) record[headers[i]] = cellToJson_(row[i]);
    }
    return { enquiry: record, duplicate: false };
  } finally {
    lock.releaseLock();
  }
}

function findRecentDuplicate_(data, input) {
  var headers = data.headers;
  var createdAtIndex = findHeaderIndex_(headers, 'createdAt');
  if (createdAtIndex < 0) return null;

  var phoneKey = normalizePhone_(input.phone);
  var cutoff = Date.now() - 10 * 60 * 1000;

  for (var i = 0; i < data.records.length; i += 1) {
    var record = data.records[i];
    var recordPhone = normalizePhone_(fieldValue_(record, headers, 'phone'));
    if (!recordPhone || recordPhone !== phoneKey) continue;

    var recordProperty = String(fieldValue_(record, headers, 'propertyId') || '').trim();
    if (recordProperty !== input.propertyId) continue;

    var created = Date.parse(String(fieldValue_(record, headers, 'createdAt') || ''));
    if (!isNaN(created) && created > cutoff) return record;
  }

  return null;
}

function normalizeEnquiryBody_(body) {
  return {
    buyerName: String(body.buyerName || body.name || '').trim(),
    phone: body.phone || '',
    email: body.email || '',
    propertyId: body.general ? '' : body.propertyId || body.id || '',
    propertyName: body.general ? '' : body.propertyName || '',
    preferredLocation: body.preferredLocation || '',
    budget: body.budget || '',
    propertyType: body.propertyType || '',
    bedrooms: body.bedrooms || '',
    message: String(body.message || '').replace(/^\[general enquiry\]\s*/i, '')
  };
}

function normalizeStatusLabel_(value) {
  var key = normalizeKey_(value);
  if (key === 'new') return 'New';
  if (key === 'contacted') return 'Contacted';
  if (key === 'interested' || key === 'inprogress') return 'Interested';
  if (key === 'closed') return 'Closed';
  return String(value || '').trim();
}

function updateEnquiryByRow_(rowValue, status) {
  var row = Number(rowValue);
  if (!row || row < 2) {
    throw appError_('validation_failed', 'A valid sheet row is required.');
  }

  var sheet = getEnquirySheet_(false);
  var data = readSheetData_(sheet);
  var index = data.rowNumbers.indexOf(row);
  if (index === -1) {
    throw appError_('enquiry_not_found', 'No enquiry exists at that row.');
  }

  var id = String(fieldValue_(data.records[index], data.headers, 'id') || '').trim();
  if (!id) {
    throw appError_('enquiry_sheet_invalid', 'The enquiry row has no ID column value.');
  }

  return updateEnquiryStatus_(id, status);
}

function updateEnquiryStatus_(id, status) {
  var enquiryId = String(id || '').trim();
  if (!enquiryId) throw appError_('validation_failed', 'An enquiry ID is required.');

  var nextStatus = String(status || '').trim();
  if (STATUSES.indexOf(nextStatus) === -1) {
    throw appError_('validation_failed', 'Status must be New, Contacted, Interested or Closed.');
  }

  var lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) {
    throw appError_('busy', 'The enquiry desk is busy. Please try again in a moment.');
  }

  try {
    var sheet = getEnquirySheet_(false);
    var data = readSheetData_(sheet);
    var idIndex = findHeaderIndex_(data.headers, 'id');
    var statusIndex = findHeaderIndex_(data.headers, 'status');
    if (idIndex < 0) {
      throw appError_('enquiry_sheet_invalid', 'The enquiry tab has no ID column.');
    }

    if (statusIndex < 0) {
      statusIndex = data.headers.length;
      sheet.getRange(1, statusIndex + 1).setValue(ENQUIRY_DISPLAY.status);
      data.headers.push(ENQUIRY_DISPLAY.status);
      sheet.setFrozenRows(1);
    }

    for (var i = 0; i < data.records.length; i += 1) {
      var record = data.records[i];
      var recordId = String(fieldValue_(record, data.headers, 'id') || '').trim();
      if (recordId.toLowerCase() !== enquiryId.toLowerCase()) continue;

      sheet.getRange(data.rowNumbers[i], statusIndex + 1).setValue(nextStatus);
      var updated = {};
      for (var key in record) {
        if (Object.prototype.hasOwnProperty.call(record, key)) updated[key] = record[key];
      }
      updated[data.headers[statusIndex]] = nextStatus;
      return updated;
    }

    throw appError_('enquiry_not_found', 'No enquiry with that ID exists in the sheet.');
  } finally {
    lock.releaseLock();
  }
}

/* --------------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------------ */

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    var parsed = JSON.parse(e.postData.contents);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (error) {
    // Allow form-encoded posts to fall back to e.parameter.
    return {};
  }
}

function appError_(code, message) {
  var error = new Error(message);
  error.code = code;
  error.publicMessage = message;
  return error;
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

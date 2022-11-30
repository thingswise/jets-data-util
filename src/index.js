// Thingswise Analytic Platform
// Copyright (C) 2015-2018  Thingswise, LLC
/**
 * data-util
 */

const Path = require('path');

(function (global) {
  const TW = global.TW || (global.TW = {});

  TW.ERROR_HEADING = '[TW.ERROR]:';

  // --- file helper functions ---

  const XLSX = require('xlsx');

  function readXlsxToJSON(xlsxFile) {
    const workbook = XLSX.readFile(xlsxFile);
    const first_sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[first_sheet_name];
    return XLSX.utils.sheet_to_json(worksheet, { raw: true });
  }

  function convertXlsxToJSON(xlsxData) {
    const workbook = XLSX.read(xlsxData, { type: 'base64' });
    const first_sheet_name = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[first_sheet_name];
    return XLSX.utils.sheet_to_json(worksheet, { raw: true });
  }

  // --- base conversion utility functions ---
  function convertBase(baseFrom, baseTo) {
    return function (num) {
      return parseInt(num, baseFrom).toString(baseTo);
    };
  }

  const bin2dec = convertBase(2, 10);
  const bin2hex = convertBase(2, 16);
  const dec2bin = convertBase(10, 2);
  const dec2hex = convertBase(10, 16);
  const hex2bin = convertBase(16, 2);
  const hex2dec = convertBase(16, 10);

  // --- simple JSONPath utility functions ---

  function checkArrayIndex(field) {
    // isNaturalNumberRegex = /(?:0|[1-9]\d*)/;
    const isNaturalNumberRegex = /^-?\d+$/;
    // for simple match test
    const hasQuoteRegex = /["']/;
    // for simple match test

    // check if the field contains a quote at all
    if (hasQuoteRegex.test(field)) { // for simple match test
      // contains at least one quote
      // now check if it has the properly matching quotes
      const result = field.match(/(["'])((?:\\{2})*|(?:.*?[^\\](?:\\{2})*))\1/);
      // 1st element: fully-matched string including the quotes
      // 2nd element: the matched quote, either single quote ' or the double quote
      // 3nd element: the content within the quotes
      // 4th element: {index: n} - the position of the first matching character, either ' or "  // 5th element: {input: 'the input string'}

      if (result == null) {
        // does not have balanced quotes - invalid field expression
        throw ('unbalanced quote');
      }
      if (result[0] !== field) {
        throw ('extra or invalid characters');
      }
      return { field: result[2], type: 'key' };
    }
    // contains no quote
    // now check if it is an integer number
    try {
      field = eval(field.toString());
    } catch (ex) {
      throw ('non integer in array indexing');
    }
    if (field == null) {
      throw ('non integer in array indexing');
    }
    field = field.toString();
    if (!isNaturalNumberRegex.test(field)) {
      throw ('non integer in array indexing');
    }
    return { field, type: 'index' };
  }

  function checkJsonFieldString(field) {
    // var jsonStringRegex = new RegExp(/([^"\\\\]*|\\\\["\\\\bfnrt\/]|\\\\u[0-9a-f]{4})*/);
    // use a strict version
    const result = field.match(/([^"\\]*)/);
    if (result == null) {
      throw ('invalid json field string "' + field + '"');
    }
    if (result[0] === field) {
      return { field, type: 'key' };
    }
    throw ('invalid json field string "' + field + '"');
  }

  function extractBracketedContent(field) {
    const result = field.match(/^((?:[^\[]*)+)(?:\[(.*?)\])?$/);
    const fields = [];
    if (result == null || result[0] !== field || result[1] === '') {
      throw (`invalid json field string in ${field}`);
    }
    fields.push({ field: result[1], type: 'key' });
    if (!isEmpty(result[2])) {
      const arrayField = checkArrayIndex(result[2]);
      fields.push(arrayField);
    }
    return fields;
  }

  function createSimpleJSONPathMap(exp) {
    const fields1 = parseSimpleJSONPathExpression(exp.trim());
    if (fields1.length === 0) {
      return [];
    }

    const fieldMap = [];
    const map = [];
    fields1.forEach((fd) => {
      const result = extractBracketedContent(fd);
      result.forEach((rs) => {
        fieldMap.push(rs);
      });
    });

    fieldMap.forEach((fm) => {
      const result = checkJsonFieldString(fm.field);
      if (fm.type === 'key') {
        map.push(fm.field);
      } else if (fm.type === 'index') {
        map.push(Number(fm.field));
      }
    });
    return map;
  }

  function parseSimpleJSONPathExpression(exp) {
    const out = exp.split(/[\s \t]*\.[\s \t]*(?=(?:[^"\\]*(?:\\.|"(?:[^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g);
    // splitting 'a.b.c["a.b"].e[0]'
    // into: [ 'a', 'b', 'c["a.b"]', 'e[0]' ]
    const result = [];

    for (let i = 0; i < out.length; i++) {
      result.push(out[i].trim().replace(/""/g, '"'));
    }
    return result;
  }

  // --- general helper functions ---
  function objectToString(o) {
    return Object.prototype.toString.call(o);
  }

  function isArray(o) {
    return Array.isArray(o);
  }

  function isBoolean(o) {
    return typeof o === 'boolean';
  }

  function isDate(o) {
    return isObject(o) && objectToString(o) === '[object Date]';
  }

  function isDateString(s) {
    if (s == null || !isString(s)) return false;
    const date = new Date(s);
    return (date !== 'Invalid Date') && !isNaN(date);
  }

  function isError(o) {
    return isObject(o) && (objectToString(o) === '[object Error]' || o instanceof Error);
  }

  function isFunction(o) {
    return typeof o === 'function';
  }

  function isNull(o) {
    return o === null;
  }

  function isNoU(o) {
    return o == null;
  }

  function isNumber(o) {
    return typeof o === 'number';
  }

  function isObject(o) {
    return typeof o === 'object' && o !== null;
  }

  function isJson(o) {
    return isPrimitive(o) || isObject(o) || isArray(o);
  }

  function isPrimitive(o) {
    return o === null ||
            typeof o === 'string' ||
            typeof o === 'number' ||
            typeof o === 'boolean' ||
            typeof o === 'symbol' ||
            typeof o === 'undefined';
  }

  function isRegExp(o) {
    return isObject(o) && objectToString(o) === '[object RegExp]';
  }

  function isString(o) {
    return typeof o === 'string';
  }

  function isSymbol(o) {
    return typeof o === 'symbol';
  }

  function isUndefined(o) {
    return o === void 0;
  }

  function cloneObject(object) {
    if (!isObject(object)) {
      return object;
    }
    return JSON.parse(JSON.stringify(object));
  }

  function isEmpty(value) {
    return Boolean(typeof value === 'undefined') ||
            value === null ||
            Boolean(Array.isArray(value) && value.length === 0) ||
            Boolean(typeof value === 'string' && value === '') ||
            Boolean(typeof value === 'object' && value.length != null && value.length === 0) ||
            Boolean(typeof value === 'object' && Object.keys(value).length === 0);
  }

  function isTwError(str) {
    return !isEmpty(str) && isString(str) && str.search(TW.ERROR_HEADING) === 0;
  }

  // --- general utility ---
  function toArrayOfKeys(obj) {
    if (!(obj instanceof Object)) {
      return [];
    }
    return Object.keys(obj);
  }

  function toArrayOfValues(obj, keyName) {
    if (!(obj instanceof Object)) {
      return [];
    }
    const values = [];
    Object.keys(obj).forEach((key) => {
      if (!keyName || keyName === key) values.push(obj[key]);
    });
    return values;
  }

  function arrayToObjectByKey(key, array) {
    if (isEmpty(key) || isEmpty(array)) return null;
    const object = {};
    for (let i = 0; i < array.length; i++) {
      const v = array[i][key];
      if (v) {
        object[v] = array[i];
      }
    }
    return object;
  }

  // only merge at the top level
  function mergeObjectTopInto(obj1, obj2) {
    // the order of this few statements below is significant
    if (isEmpty(obj2)) return obj1;
    if (!isObject(obj1)) return obj2;
    if (!isObject(obj2)) return obj2;
    const obj = obj2;
    const keys = Object.keys(obj);
    for (const x in obj1) {
      if (keys.indexOf(x) === -1) {
        obj[x] = obj1[x];
      }
    }
    return obj;
  }

  // --- SQL functions ---
  const SQL = require('alasql');

  // transform: tw.sql('SELECT COLUMN xValueToArray(t._, "account") FROM ? t'),
  // transform: tw.sql('SELECT COLUMN xValueToArray(t._, "dev-key", true) FROM ? t'),
  SQL.fn.xValueToArray = function (tuple, fields, includeStringifiedTuple) {
    if (isNoU(tuple) || !isObject(tuple)) return [];
    if (isString(fields)) {
      fields = [fields];
    }
    const arr = [];
    for (let i = 0; i < fields.length; i++) {
      if (isString(fields[i]) && tuple.hasOwnProperty(fields[i])) {
        arr.push(tuple[fields[i]]);
      }
    }
    if (includeStringifiedTuple) {
      arr.push(JSON.stringify(tuple));
    }
    return arr;
  };

  // transform: tw.sql('SELECT COLUMN xStringToObject(t._, {devicedata: true}, true) FROM ? t'),

  SQL.fn.xStringToObject = function (tuple, fields, extract) {
    if (isNoU(tuple) || !isObject(tuple)) return [];
    // expecting a signle string designating the name of the field to be extracted from typle
    // or an object of the form {field1: true, field2: false, ...} where field names are the
    // fields to be extracted from the tuple and the boolean values if a string to object converstion is to perform
    if (isString(fields)) {
      fields = {};
      fields[fields] = false;
    }
    const obj = {};
    for (const k in fields) {
      if (fields.hasOwnProperty(k) && tuple.hasOwnProperty(k)) {
        let v = tuple[k];
        if (fields[k] === true && !isEmpty(v) && isString(v)) {
          try {
            v = JSON.parse(v);
          } catch (ex) {
            v = `failed to parse ${v} error=${ex.stack ? ex.stack : ex}`;
          }
        }
        if (extract === true) {
          for (var k1 in v) {
            if (v.hasOwnProperty(k1)) {
              obj[k1] = v[k1];
            }
          }
        } else {
          obj[k1] = v;
        }
      }
    }
    return obj;
  };

  // transform: tw.sql('SELECT COLUMN xParseJSON(column_name) FROM ? t'),

  SQL.fn.xParseJSON = function (data) {
    if (isNoU(data) || !isString(data)) return {};
    let obj;
    try {
      obj = JSON.parse(data);
    } catch (ex) {
      const v = `failed to parse ${data} error=${ex.stack ? ex.stack : ex}`;
    }
    return obj;
  };

  // --- data field handlers ---
  function number(decimal) {
    if (!isNoU(decimal) && (isNaN(decimal) || Number(decimal) < 0)) return '[TW.ERROR]: number() invalid fixed decimal point value, expecting a positive number';
    return function (v) {
      if (v != null) {
        if (isNaN(v)) {
          v = String(v).replace(/[',"]/g, '');
          v = isNaN(v) ? null : +v;
        }
        if (v != null) {
          if (decimal != null) {
            v = Number(v).toFixed(decimal);
          } else {
            v = Number(v);
          }
        }
      }
      return v;
    };
  }

  function string() {
    return function (v) { return `${v}`; };
  }

  // Note: ISO 8601 allows "[+-]hhmm" but Javascript Date function misinterpretes +hh as +00hh not as +hh00
  const timezoneRegex = new RegExp('(?:(?:\\d{1,2}[:]\\d{1,2}(?:[:]\\d{1,2})?){1}(?:.\\d{3})?)([Zz]|(?:[\+\-]\\d{2}(?:[:]?\\d{2})?)|(?: GMT[\\-\\+]\\d{4})|(?: [A-Z]{2,4}))');
  function hasTimezone(d) {
    const result = timezoneRegex.exec(d);
    return !isNoU(result) && !isEmpty(result[1]);
  }

  function epoch(tzOffset) {
    if (!isNoU(tzOffset) && (!isString(tzOffset) || /[\+\-]\d{4}/.test(tzOffset) === false)) return '[TW.ERROR]: DataStage epoch() configuration error: invalid value, expecting a string in the format of "[+-]hhmm"';
    return function (v) {
      let offset = tzOffset;
      if (isString(v) && !isNaN(v)) {
        v = Number(v);
        v = Number(v.toFixed(3)) * 1000;
        offset = 0;
      }
      let d = new Date(v);
      if (!isNoU(offset) && !hasTimezone(v)) {
        // create a local date time without the timezone because it is incorrect
        d = new Date(`${d.toDateString()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}.${d.getMilliseconds()}${offset}`);
      }
      const t = (Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds())) / 1000.0;
      if (isNaN(t)) return null;
      return Number(t.toFixed(3));
    };
  }

  function getTimestamp() {
    return function () {
      return Math.floor(Date.now() / 1000);
    };
  }

  function notBeforeOrAfter(before, after) {
    if (!isNoU(before) && isNaN(before)) return '[TW.ERROR]: DataStage validateTimestamp() configuration error: invalid before value, expecting a number in seconds';
    if (!isNoU(after) && isNaN(after)) return '[TW.ERROR]: DataStage validateTimestamp() configuration error: invalid after value, expecting a number in seconds';
    const getEpoch = epoch();
    return function (t, ctxt, msg) {
      if (isNaN(t)) return null;
      const t0 = Date.now() / 1000;
      if ((!isNoU(before) && t - t0 > before) || (!isNoU(after) && t0 - t > after)) {
        if (!isNoU(ctxt)) {
          ctxt.appendError(`notBeforeOrAfter() check failed: now=${new Date(t0 * 1000)}, timestamp=${new Date(t * 1000)}, timestamp must be ${!isNoU(before) ? `not before ${new Date((t0 - before) * 1000)}` : ''}${!isNoU(after) ? ` not after ${new Date((t0 + after) * 1000)}` : ''}${!isNoU(msg) ? ` - ${msg}` : ''}`);
        }
        return null;
      }
      return t;
    };
  }

  function trim() {
    return function (v) { return (`${v}`).trim(); };
  }

  function requiredRange(min, max, lower, upper) {
    if (!isNoU(min) && !isString(min) && isNaN(min)) return `[TW.ERROR]: DataStage requiredRange() configuration error: invalid min (${min}) value, expecting string or number`;
    if (!isNoU(max) && !isString(max) && isNaN(max)) return `[TW.ERROR]: DataStage requiredRange() configuration error: invalid max (${max}) value, expecting string or number`;
    if (!isNoU(lower) && !isString(lower) && isNaN(lower)) return `[TW.ERROR]: DataStage requiredRange() configuration error: invalid lower (${lower}) value, expecting string or number`;
    if (!isNoU(upper) && !isString(upper) && isNaN(upper)) return `[TW.ERROR]: DataStage requiredRange() configuration error: invalid upper (${lower}) value, expecting string or number`;
    if (min != null && max != null && min > max) return `[TW.ERROR]: DataStage requiredRange() configuration error: min (${min}) is greater than max (${max})`;
    if (min != null && lower != null && min < lower) return `[TW.ERROR]: DataStage requiredRange() configuration error: min (${min}) is less than lower (${lower})`;
    if (max != null && upper != null && max > upper) return `[TW.ERROR]: DataStage requiredRange() configuration error: max (${max}) is greater than upper (${upper})`;
    return function (v, ctxt, msg) {
      if ((min != null && v < min) && (lower != null && v > lower)) {
        return min;
      }
      if ((max != null && v > max) && (upper != null && v < upper)) {
        return max;
      }
      if ((min != null && v < min) || (max != null && v > max)) {
        if (!isNoU(ctxt)) {
          ctxt.appendError(`requiredRange() check failed: v=${v}, expecting (${lower != null ? lower : (min != null ? min : '-')}, ${upper != null ? upper : (max != null ? max : '-')})${!isNoU(msg) ? ` - ${msg}` : ''}`);
        }
        return null;
      }
      return v;
    };
  }

  function required() {
    return function (v) { return (v != null && v !== 'undefined' && v !== '') ? v : null; };
  }

  function checkNumber(v, decimal) {
    if (v != null) {
      if (String(v) === "") {
        v = null;
      } else
      if (isNaN(v)) {
        v = String(v).replace(/[',"]/g, '');
        v = isNaN(v) ? null : +v;
      }
      if (v != null) {
        if (decimal != null) {
          v = Number(v).toFixed(decimal);
        }
        v = Number(v);
      }
    }
    return v;
  }

  function requiredNumber(decimal) {
    if (!isNoU(decimal) && (isNaN(decimal) || Number(decimal) < 0)) return '[TW.ERROR]: number() invalid fixed decimal point value, expecting a positive number';
    return function (v) {
      return checkNumber(v, decimal);
    };
  }

  function requiredUnsignedNumber(decimal) {
    if (!isNoU(decimal) && (isNaN(decimal) || Number(decimal) < 0)) return '[TW.ERROR]: number() invalid fixed decimal point value, expecting a positive number';
    return function (v) {
      if ((v = checkNumber(v, decimal)) != null) {
        if (v < 0) {
          v = null;
        }
      }
      return v;
    };
  }

  function requiredString(len, minLen, maxLen) {
    if (!isEmpty(len) && !isNumber(len)) return `[TW.ERROR]: DataStage requiredString() configuration error: invalid first arguement, ${len}, expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength`;
    if (!isEmpty(minLen) && !isNumber(minLen)) return `[TW.ERROR]: DataStage requiredString() configuration error: invalid second arguement, ${minLen}, expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength`;
    if (!isEmpty(maxLen) && !isNumber(maxLen)) return `[TW.ERROR]: DataStage requiredString() configuration error: invalid third arguement, ${maxLen}, expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength`;
    if (!isEmpty(maxLen) && !isNumber(minLen)) {
      if (maxLen < minLen) return `[TW.ERROR]: DataStage requiredString() configuration error: invalid second and third arguement, ${minLen} and ${maxLen}, expecting third arguement > second argement`;
    }
    if (maxLen === minLen) {
      len = minLen;
      minLen = null;
      maxLen = null;
    }

    if (isEmpty(len) && isEmpty(minLen) && isEmpty(maxLen)) {
      return function (v) { return v; };
    } else if (!isEmpty(len)) {
      return function (v) {
        if (v != null && len(v) !== len) {
          return null;
        }
        return v;
      };
    } else if (isEmpty(maxLen) && !isEmpty(minLen)) {
      return function (v) {
        if (v != null && len(v) < minLen) {
          return null;
        }
        return v;
      };
    } else if (!isEmpty(maxLen) && isEmpty(minLen)) {
      return function (v) {
        if (v != null && len(v) > maxLen) {
          return null;
        }
        return v;
      };
    }
    return function (v) {
      if (v != null && (len(v) < len || len(v) > maxLen)) {
        return null;
      }
      return v;
    };
  }

  function requiredAlphanumeric(len, minLen, maxLen) {
    if (!isEmpty(len) && !isNumber(len)) return `[TW.ERROR]: DataStage requiredAlphanumeric() configuration error: invalid first arguement, ${len}, expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength`;
    if (!isEmpty(minLen) && !isNumber(minLen)) return `[TW.ERROR]: DataStage requiredAlphanumeric() configuration error: invalid second arguement, ${minLen}, expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength`;
    if (!isEmpty(maxLen) && !isNumber(maxLen)) return `[TW.ERROR]: DataStage requiredAlphanumeric() configuration error: invalid third arguement, ${maxLen}, expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength`;
    if (!isEmpty(maxLen) && isNumber(minLen) || isEmpty(maxLen) && !isNumber(minLen)) {
      if (maxLen < minLen) return '[TW.ERROR]: DataStage requiredAlphanumeric() configuration error: only one of second (minLength) and third (maxLength) arguements are present, expecting both or just the first arguement (fixedLength)';
    }
    if (!isEmpty(maxLen) && !isNumber(minLen)) {
      if (maxLen < minLen) return `[TW.ERROR]: DataStage requiredAlphanumeric() configuration error: invalid second and third arguement, ${minLen} and ${maxLen}, expecting third arguement > second argement`;
    }
    if (maxLen === minLen) {
      len = maxLen;
      minLen = null;
      maxLen = null;
    }
    let regex;
    if (isEmpty(len) && isEmpty(minLen) && isEmpty(maxLen)) {
      regex = new RegExp('^[a-z0-9]+$', 'i');
    } else if (!isEmpty(len)) {
      regex = new RegExp(`^[a-z0-9]{${len}}$`, 'i');
    } else {
      regex = new RegExp(`^[a-z0-9]{${len},${maxLen}}$`, 'i');
    }
    return function (v) { return regex.test(v) ? v : null; };
  }

  function requiredValue(value) {
    return function (v) { return v === value ? v : null; };
  }

  function requiredMac() {
    // var regex = /^([0-9A-F]{2}[:-]){5}([0-9A-F]{2})$/;
    const regex = /^([0-9A-F]{2}){6}$/;
    return function (v) {
      v = v.replace(/[:-]/g, '');
      return regex.test(v) ? v : null;
    };
  }

  function requiredCapLetters(len, maxLen) {
    if (!isEmpty(len) && !isNumber(len)) return `[TW.ERROR]: DataStage requiredCapLetters() configuration error: invalid first arguement, ${len}, expecting arguements ([[Number, Number]]) as fixedLength or minLength, maxLength`;
    if (!isEmpty(maxLen) && !isNumber(maxLen)) return `[TW.ERROR]: DataStage requiredCapLetters() configuration error: invalid second arguement, ${maxLen}, expecting arguements ([[Number, Number]]) as length or minLength, maxLength`;
    if (maxLen < len) return `[TW.ERROR]: DataStage requiredCapLetters() configuration error: invalid first and second arguement, ${len} and ${maxLen}, expecting second arguement > first argement`;
    if (maxLen === len) maxLen = null;
    let regex;
    if (isEmpty(len)) {
      regex = new RegExp('^[A-Z]+$', ''); // can't have 'g' here otherwise the alternate test will fail
    } else if (isEmpty(maxLen)) {
      regex = new RegExp(`^[A-Z]{${len}}$`, '');
    } else {
      regex = new RegExp(`^[A-Z]{${len},${maxLen}}$`, '');
    }
    return function (v) { return regex.test(v) ? v : null; };
  }

  function requiredPattern(pattern, flag) {
    if (!isNoU(pattern) && !isString(pattern)) return `[TW.ERROR]: DataStage requiredPattern() configuration error: invalid first arguement, ${pattern}, expecting a regex string`;
    if (!isNoU(flag) || !isString(flag)) return `[TW.ERROR]: DataStage requiredPattern() configuration error: invalid second arguement, ${pattern}, expecting a regex flag e.g. "i" or "g""`;
    const regex = new RegExp(pattern, flag);
    return function (v) { return regex.test(v) ? v : null; };
  }

  function tensor(v) {
    return isObject(v) && ("dimensions" in v) && Array.isArray(v["dimensions"]) && ("data" in v) && Array.isArray(v["data"]) ? v : null;
  }

  function bytes(v) {
    return v["type"] === "base64" && (v["data"] === "" || v["data"]) ? v : null;
  }

  function _json(v) {
    return v["type"] === "json" && ((("data" in v) && isJson(v["data"])) || isJson(v)) ? v : null;
  }

  function dropTuple(target, message, quiet) {
    return {
      action: 'drop-tuple', target: target || null, message: message || null, quiet: quiet || false
    };
  }

  function dropField(target, message, quiet) {
    return {
      action: 'drop-field', target: target || null, message: message || null, quiet: quiet || false
    };
  }

  function useDefault(target, message, quiet) {
    return {
      action: 'use-default', target: target || null, message: message || null, quiet: quiet || false
    };
  }

  function sql(v) {
    return { sql: v };
  }

  // --- data tuple parsers ---

  function json() {
    return function (d) { return d; };
  }

  function regexSplitWithCapture(d, regex) {
    const out = d.split(regex);
    const result = [];
    for (let i = 0; i < out.length; i++) {
      if (i % 2 === 0 && out[i].length === 0) {
        continue; // split with regex with cature leave extra empty entries
      }
      result.push(out[i]);
    }
    return result;
  }

  function regexSplitWithCapture1(d, regex) {
    const out = d.split(regex);
    const result = [];
    for (let i = 0; i < out.length; i++) {
      if (i % 3 === 0 && out[i].length === 0) {
        continue; // split with regex with cature leave extra empty entries
      }
      if (i % 3 === 1 && out[i] == null) {
        if (out[i + 1] != null) {
          continue;
        } else {
          out[i] = '';
        }
      }
      if (i % 3 === 2 && out[i] == null) {
        continue;
      }
      result.push(out[i]);
    }
    return result;
  }

  function logDebugMessage(context, message, data) {
    if (context.debug && context.log) {
      let msg = "(debug:true)";
      if (context.logHeading) {
        msg += context.logHeading;
      }
      msg += message;
      msg += JSON.stringify(data, null, 2);
      context.log(msg);
    }
  }

  function parseJSON(field) {
    if (!isNoU(field) && !isString(field)) return `[TW.ERROR]: DataStage parseJSON() configuration error: invalid first arguement, ${field}, expecting a string`;
    let inPlace = false;
    if (!isNoU(field) && field[0] === '.') {
      inPlace = true;
      field = field.substring(1);
    }
    return function (d, context) {
      logDebugMessage(context, "parseJSON input data: ", d);
      context._lastSourceDataParseType = 'JSON';
      if (isNoU(d)) {
        context.appendError('failed to parse JSON for empty input');
        return null;
      }
      if (!isNoU(field) && isNoU(d[field])) {
        context.appendError('failed to parse JSON for empty input');
        return null;
      }
      try {
        if (inPlace) {
          if (isString(d[field])) {
            d[field] = JSON.parse(d[field]);
          }
          return d;
          /* see comment blow
                    d[field] = JSON.parse(d[field]);
                    return d;
                    */
        }

        if (field != null) {
          if (isString(d[field])) {
            return JSON.parse(d[field]);
          }
          return d[field];
        }
        if (isString(d)) {
          return JSON.parse(d);
        }
        return d;


        /* sometime the cache automatically convert the serialized JSON in to object by itself (in Cassandra) so this check if it is a string...
                    return field ? JSON.parse(d[field]) : JSON.parse(d);
                    */

        /* old stuff
                    var data = field ? d[field] : d;
                    data = (data[data.length-1] === ',') ? data.splice(length - 1, 1) : data;
                    return JSON.parse(data);
                    */
      } catch (ex) {
        context.appendError(`failed to parse JSON for ${field ? d[field] : d}, err=${ex.stack ? ex.stack : ex}`);
        return null;
      }
    };
  }

  function parseCSV() {
    const regex = /[\ \t]*,[\ \t]*/g;
    return function (d, context) {
      logDebugMessage(context, "parseCSV input data: ", d);
      context._lastSourceDataParseType = 'CSV';
      const result = d.split(regex);
      return result;
    };
  }

  function parseStringArray() {
    return function (d, context) {
      logDebugMessage(context, "parseStringArray input data: ", d);
      return d;
    };
  }

  function parseEscapedDoubleQuotedCSV() {
    const regex = /[\ \t]*"((?:[^"]|"")*)"[\ \t]*,?[\ \t]*/g;
    return function (d, context) {
      logDebugMessage(context, "parseEscapedDoubleQuotedCSV input data: ", d);
      context._lastSourceDataParseType = 'CSV';
      const out = d.split(regex);
      const result = [];
      for (let i = 0; i < out.length; i++) {
        if (i % 2 === 0 && out[i].length === 0) {
          continue; // split with regex with cature leave extra empty entries
        }
        result.push(out[i].replace(/""/g, '"'));
      }
      return result;
    };
  }

  function parseDoubleQuotedCSV() {
    const regex = /[\ \t]*"(.*?)"[\ \t]*,?[\ \t]*/g;
    return function (d, context) {
      logDebugMessage(context, "parseDoubleQuotedCSV input data: ", d);
      context._lastSourceDataParseType = 'CSV';
      const result = regexSplitWithCapture(d, regex);
      return result;
    };
  }

  function parseMixedDoubleQuotedCSV0() {
    const regex = /[\ \t]*(?:"(.*?)"|([^",]*))[\ \t]*,?[\ \t]*/g;
    return function (d, context) {
      logDebugMessage(context, "parseDoubleQuotedCSV input data: ", d);
      context._lastSourceDataParseType = 'CSV';
      const result = regexSplitWithCapture1(d, regex);
      return result;
    };
  }

  function parseMixedDoubleQuotedCSV() {
    const regex = /[\s \t]*\,[\s \t]*(?=(?:[^"\\]*(?:\\.|"(?:[^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g;
    // splitting ' a ,b," a,bc,",d,"e-f" , "a""b",, a
    // into: [ 'a', 'b', ' a,bc,', 'd', 'e-f', 'a"b', null, a ]
    return function (d, context) {
      logDebugMessage(context, "parseMixedDoubleQuotedCSV input data: ", d);
      context._lastSourceDataParseType = 'CSV';
      const out = d.split(regex);
      const result = [];
      for (let i = 0; i < out.length; i++) {
        if (out[i].length == 0) {
          result.push(null);
        } else {
          const res = out[i].trim().replace(/^"|"$/g, '').replace(/""/g, '"');
          result.push(res);
        }
      }
      return result;
    };
  }

  function parseSingleQuotedCSV() {
    const regex = /[\ \t]*'(.*?)'[\ \t]*,?[\ \t]*/g;
    return function (d, context) {
      logDebugMessage(context, "parseSingleQuotedCSV input data: ", d);
      context._lastSourceDataParseType = 'CSV';
      const result = regexSplitWithCapture(d, regex);
      return result;
    };
  }

  function parseSpaceOrTabSeparatedValues() {
    const regex = /[\ \t]/g;
    return function (d, context) {
      logDebugMessage(context, "parseSpaceOrTabSeparatedValues input data: ", d);
      context._lastSourceDataParseType = 'CSV';
      const result = d.split(regex);
      return result;
    };
  }

  function parseCharSeparatedValues(c) {
    if (isNoU(c) || !isString(c)) return '[TW.ERROR]: DataStage parse() configuration error: invalid character value, expecting a character';
    const regex = new RegExp(`[\\ \\t]*${c}[\\ \\t]*`, 'g');
    return function (d, context) {
      logDebugMessage(context, "parseCharSeparatedValues input data: ", d);
      context._lastSourceDataParseType = 'CSV';
      const result = d.split(regex);
      logDebugMessage(context, "parseCharSeparatedValues input data: ", result);
      return result;
    };
  }

  function noop() {
    return function (data, context, brantext) {
    };
  }

  function done(dataKey, leastStatus) {
    if (!isEmpty(dataKey) && !isString(dataKey)) return `[TW.ERROR]: DataStage done() configuration error: invalid first arguement, ${dataKey}, expecting a string`;
    if (!isEmpty(leastStatus) && ['failed', 'partial', 'success'].indexOf(leastStatus) === -1) return 'DataStage done() configuration error: invalid second arguement, expecting a one of ["failed", "partial", "success"]';
    leastStatus = leastStatus || 'success';
    return function (data, context, brantext) {
      let err = null;
      if (!context.assertStatus(leastStatus)) err = `last status=${context.lastStatus} does not satisfy the least status=${leastStatus}`;
      if (dataKey && !context.assertData(dataKey)) err = `expecting data key=${dataKey} is not available at the last stage=${context.stage}`;
      context.end(err, (dataKey === '' || dataKey === 'none') ? [] : (dataKey) ? context.getData(dataKey) : data); // by default return the data received from previous step
      // context.end(err, (isEmpty(dataKey)) ? [] : (dataKey != '') ? context.getData(dataKey) : data);
    };
  }

  function log(dataKey, msg) {
    if (!isEmpty(dataKey) && !isString(dataKey) && !isArray(dataKey)) {
      return `[TW.ERROR]: DataStage log() configuration error: invalid first arguement, ${dataKey}, expecting a string`;
    }

    let keyArr = [];
    if (isArray(dataKey)) {
      dataKey.forEach((k) => {
        if (!isString(k)) return `[TW.ERROR]: DataStage log() configuration error: invalid data key in the arry of the first arguement, ${k}, expecting a string`;
      });
      keyArr = dataKey;
    } else if (!isEmpty(dataKey)) {
      keyArr.push(dataKey);
    }
    return function (data, context, brantext) {
      const dataArr = [];
      if (keyArr.length === 0) {
        dataArr.push({ name: 'inflight data', value: data });
      } else {
        keyArr.forEach((k) => {
          dataArr.push({ name: k, value: context.getData(k) });
        });
      }
      dataArr.forEach((d) => {
        console.log('----------------');
        console.log(msg ? `${msg} >>>>>` : '', `scope=${context.scope} project=${context.project} stream=${context.stream} topology=${context.topology} dataStage=${context.stage} dataKey=${d.name}:\n`, JSON.stringify(d.value, null, 2));
      });
      return data;
    };
  }

  // print the source tag and device ID for initial monitoring
  function logFields(msg, fields, dataKey) {
    if (!isEmpty(dataKey) && !isString(dataKey)) {
      return `[TW.ERROR]: DataStage logFields() configuration error: invalid last arguement, ${dataKey}, expecting a string`;
    }
    if (!isEmpty(msg) && !isString(msg)) {
      return `[TW.ERROR]: DataStage logFields() configuration error: invalid first arguement, ${msg}, expecting a string`;
    }
    if (!isEmpty(fields) && (!isString(fields) && !isArray(fields))) {
      return `[TW.ERROR]: DataStage logFields() configuration error: invalid second arguement, ${fields}, expecting a string or an array of strings`;
    }
    let keyArr = [];
    if (isArray(fields)) {
      fields.forEach((k) => {
        if (!isString(k)) return `[TW.ERROR]: DataStage logFields() configuration error: invalid data key in the arry of the last arguement, ${k}, expecting a string`;
      });
      keyArr = fields;
    } else if (!isEmpty(fields)) {
      keyArr.push(fields);
    }
    msg = msg || '';
    return function (data, context, brantext) {
      const KeyArr = [];
      let dataset;
      if (!isEmpty(dataKey)) {
        dataset = context.getData(dataKey);
      } else {
        dataset = data;
      }
      if (isEmpty(dataset)) return;

      let str = `=--> ${msg} `;
      keyArr.forEach((f, i) => {
        if (i > 0) str += '; ';
        str += `${f}=`;
        dataset.forEach((d, j) => {
          if (j > 0) str += ', ';
          str += d[f];
        });
      });
      console.log(str);
      return data;
    };
  }

  function joining(dataKey) {
    if (dataKey && !isString(dataKey)) return `[TW.ERROR]: DataStage joining() configuration error: invalid first arguement, ${dataKey}, expecting a string`;
    return function (data, context, brantext) {
      context.joining((dataKey === '') ? [] : (dataKey) ? context.getData(dataKey) : data, brantext);
    };
  }

  // Returns a psudo-random integer between min and max
  // Using Math.round() will give you a non-uniform distribution!
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function padding(str, len) {
    if (!isString(str)) str = str.toString();
    if (str.length >= len) return str;
    const padding = '000000000000000000000000';
    return padding.substring(0, len - str.length) + str;
  }

  function routeToErrorStage(errTargetStage) {
    if (!isString(errTargetStage)) return `[TW.ERROR]: routeToErrorStage error: invalid stage, ${errTargetStage}, expecting a string to a data stage`;
    return function (errTag, errMsg, errTuple, context) {
      context.appendError(`${errTag}: ${errMsg}`);
      if (errTargetStage != null) {
        const data = [{
          data: JSON.stringify(errTuple),
          error: errMsg,
          message: errTag
        }];
        context.feed(data, errTargetStage, context, null);
      }
    };
  }

  function toErrorDumpFormat() {
    return function (data, context) {
      if (!isArray(data)) {
        data = [data];
      }
      if (isEmpty(data)) {
        return data;
      }
      // expecting data in the form [{data: origina_message, error: error_message, message: user_message}]
      const ts = getTimestamp();
      data.forEach((d, i) => {
        data[i] = { timestamp: ts(), msg: d };
      });
      return data;
    };
  }

  function readInt64BE(buffer, offset) {
    let low = buffer.readUInt32BE(offset + 4);
    if (low < 0) low += 4294967296;
    return buffer.readUInt32BE(offset) * 4294967296.0 + low;
  }

  function readInt64LE(buffer, offset) {
    let high = buffer.readUInt32LE(offset + 4);
    if (high < 0) high += 4294967296;
    return high * 4294967296.0 + buffer.readUInt32LE(offset);
  }

  function writeInt64LE(buffer, offset, value) {
    const high = parseInt(value / 4294967296);
    const low = parseInt(value % 4294967296);
    buffer.writeUInt32LE(high, offset + 4);
    buffer.writeUInt32LE(low, offset);
    return parseInt(high * 4294967296.0 + low);
  }

  function writeInt64BE(buffer, offset, value) {
    const high = parseInt(value / 4294967296);
    const low = parseInt(value % 4294967296);
    buffer.writeUInt32BE(low, offset + 4);
    buffer.writeUInt32BE(high, offset);
    return parseInt(high * 4294967296.0 + low);
  }

  function dumpBuffer(buffer) {
    let s = '';
    for (let i = 0; i < buffer.length; i++) {
      if (i % 16 === 0) s += `${padding(i.toString(16), 8)} `;
      if (i % 8 === 0) s += ' ';
      s += `${(buffer[i] < 16 ? '0' : '') + buffer[i].toString(16).toUpperCase()} `;
      if (i % 16 === 15) s += '\r\n';
    }
    return s;
  }

  // === spec parser ===
  // based on IEC 61131-3
  const dataTypes = ['SINT', 'INT', 'DINT', 'LINT', 'USINT', 'UINT', 'UDINT', 'ULINT', 'REAL', 'LREAL', 'STRING', 'ALNUM', 'MAC', 'TIMESTAMP', 'TENSOR', 'BYTES', 'JSON'];
  const policies = ['drop-tuple', 'drop-field', 'use-default'];

  function processFieldSpecs(specs, tzOffset, notBefore, notAfter, errorQueue, dataType) {
    let fields = [];
    if (!isArray(specs)) {
      return ('[TW.ERROR]: invalid source field specs: invalid arguement: specs is not an array');
    }
    if (!isEmpty(notBefore) && ((isNaN(notBefore) || notBefore < 0))) {
      return (`[TW.ERROR]: invalid source field specs: invalid arguement notBefore, ${sf.notBefore} expecting empty or a positive integer as seconds`);
    }
    if (!isEmpty(notAfter) && ((isNaN(notAfter) || notAfter < 0))) {
      return (`[TW.ERROR]: invalid source field specs: invalid arguement notAfter, ${sf.notAfter} expecting empty or a positive integer as seconds`);
    }

    function addFn(fn, f, i) {
      if (!isFunction(fn)) {
        throw (`invalid source field specs: failed to create handler in entry ${i}: ${fn}`);
      }
      f.handlers.push(fn);
    }

    function addRange(sf, f, i) {
      if (!isEmpty(sf.max) && isNaN(sf.max)) {
        throw (`invalid source field specs: invalid field max, ${sf.max} in entry ${i} expecting empty or a number`);
      }
      if (!isEmpty(sf.min) && isNaN(sf.min)) {
        throw (`invalid source field specs: invalid field min, ${sf.min} in entry ${i} expecting empty or a number`);
      }
      if (!isEmpty(sf.upper) && isNaN(sf.upper)) {
        throw (`invalid source field specs: invalid field upper, ${sf.upper} in entry ${i} expecting empty or a number`);
      }
      if (!isEmpty(sf.lower) && isNaN(sf.lower)) {
        throw (`invalid source field specs: invalid field lower, ${sf.lower} in entry ${i} expecting empty or a number`);
      }

      if (sf.min != null || sf.max != null) {
        addFn(requiredRange(sf.min, sf.max, sf.lower, sf.upper), f, i);
      }
    }

    function addPolicy(sf, f, i, msg) {
      if (!isEmpty(sf.policy)) {
        sf.policy = sf.policy.toString().trim();
        if (policies.indexOf(sf.policy) === -1) {
          throw (`invalid source field specs: invalid field policy, ${sf.policy} in entry ${i} expecting empty or one of [${policies.join(', ')}]`);
        }
      }
      if (!isEmpty(sf.errorQueue)) {
        sf.errorQueue = sf.errorQueue.toString().trim();
      }

      sf.errorQueue = sf.errorQueue || errorQueue || null;
      if (!isEmpty(sf.errorQueue)) {
        if (!isString(sf.errorQueue)) {
          throw (`invalid source field specs: invalid errorQueue, ${sf.errorQueue} in entry ${i} expecting empty or a string representing an error queue name`);
        } else {
          sf.errorQueue = sf.errorQueue.trim();
        }
      } else {
        sf.errorQueue = sf.errorQueue || errorQueue;
      }

      if (!isEmpty(sf.errorMsg)) {
        sf.errorMsg = sf.errorMsg.toString().trim();
      }
      sf.errorMsg = sf.errorMsg || msg;

      if (!isEmpty(sf.errorQuiet)) {
        sf.errorQuiet = (sf.errorQuiet.toString().trim().toLowerCase() === 'true');
      } else {
        sf.errorQuiet = false;
      }

      switch (sf.policy) {
        case 'drop-tuple':
          f.policy = dropTuple(sf.errorQueue, sf.errorMsg, sf.errorQuiet);
          break;
        case 'drop-field':
          f.policy = dropField(sf.errorQueue, sf.errorMsg, sf.errorQuiet);
          break;
        case 'use-default':
          f.policy = useDefault(sf.errorQueue, sf.errorMsg, sf.errorQuiet);
          break;
        default:
      }
    }

    function addJsonPathMap(sf, f, i) {
      if (isEmpty(sf.jsonField)) {
      } else {
        sf.jsonField = sf.jsonField.toString().trim();
      }

      const out = sf.jsonField.split(/[\s \t]*;[\s \t]*(?=(?:[^"\\]*(?:\\.|"(?:[^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g);
      // splitting ' a.b.c ; x.y.z '
      // into: [ 'a.b.c', 'x.y.z']
      const paths = [];
      for (let x = 0; x < out.length; x++) {
        paths.push(out[x].trim().replace(/""/g, '"'));
      }

      f.sourceMap = [];
      paths.forEach((path) => {
        f.sourceMap.push(createSimpleJSONPathMap(path)); // createSimpleJSONMap() would throw exception
      });
    }

    fields = [];
    for (let i = 0; i < specs.length; i++) {
      var sf = specs[i];
      // skipping fields that are not present for a cerntain data formats
      switch (dataType) {
        case 'CSV':
          if (!isEmpty(sf.csvAbsence) && sf.csvAbsence.toString().trim().toLowerCase() === 'true') {
            delete specs[i];
            continue;
          }
          break;
        case 'JSON':
          if (isEmpty(sf.jsonField)) {
            delete specs[i];
            continue;
          }
          break;
        default:
      }

      if (isEmpty(sf.name)) {
        throw (`invalid source field specs: missing name in entry ${i}`);
      }

      if (!isEmpty(sf.type)) {
        sf.type = sf.type.toString().trim();
        if (dataTypes.indexOf(sf.type) === -1) {
          const regex = new RegExp(/regex\((.*)\)$/);
          const s = regex.exec(sf.type);
          if (s != null) {
            try {
              new RegExp(s[1]);
            } catch (e) {
              throw (`invalid source field specs: invalid regex expression, ${sf.type} in entry ${i}`);
            }
            sf.type = 'REGEX';
            sf.regex = s[1];
          } else {
            throw (`invalid source field specs: unsupported type, ${sf.type} in entry ${i} expecting empty or one of [${dataTypes.join(', ')}]`);
          }
        }
      }

      const f = {};
      f.name = sf.name;
      f.handlers = [];

      switch (sf.type) {
        case 'SINT':
        case 'INT':
        case 'DINT':
        case 'LINT':
          addFn(requiredNumber(0), f, i);
          addRange(sf, f, i);
          addPolicy(sf, f, i, 'non-integer');
          break;
        case 'USINT':
        case 'UINT':
        case 'UDINT':
        case 'ULINT':
          addFn(requiredNumber(0), f, i);
          addRange(sf, f, i);
          addPolicy(sf, f, i, 'non-unsigned-integer');
          break;
        case 'REAL':
        case 'LREAL':
          if (!isEmpty(sf.decimals)) {
            if (isNaN(sf.decimals) || sf.decimals > 12 || sf.decimals < 0) {
              throw (`invalid source field specs: invalid field decimals, ${sf.decimals} in entry ${i} expecting empty or a positive integer not greater than 8`);
            } else {
              sf.decimals = Number(sf.decimals);
            }
          } else {
            sf.decimals = 6;
          }
          addFn(requiredNumber(Number(sf.decimals)), f, i);
          addRange(sf, f, i);
          addPolicy(sf, f, i, 'non-number');
          break;
        case 'STRING':
          if (!isEmpty(sf.fixedLen)) {
            if (isNaN(sf.fixedLen) || sf.fixedLen < 0 || sf.fixedLen > 1024) {
              throw (`invalid source field specs: invalid field length, ${sf.fixedLen} in entry ${i} expecting empty or a positive integer not greater than 1024`);
            } else {
              sf.fixedLen = Number(sf.fixedLen);
            }
          } else {
            sf.fixedLen = null;
          }

          if (!isEmpty(sf.minLen)) {
            if (isNaN(sf.minLen) || sf.minLen < 0 || sf.minLen > 1024) {
              throw (`invalid source field specs: invalid field minLen, ${sf.minLen} in entry ${i} expecting empty or a positive integer not greater than 1024`);
            } else {
              sf.minLen = Number(sf.minLen);
            }
          } else {
            sf.minLen = null;
          }

          if (!isEmpty(sf.maxLen)) {
            if (isNaN(sf.maxLen) || sf.maxLen < 0 || sf.maxLen > 1024) {
              throw (`invalid source field specs: invalid field maxLen, ${sf.maxLen} in entry ${i} expecting empty or a positive integer not greater than 1024`);
            } else {
              sf.maxLen = Number(sf.maxLen);
            }
          } else {
            sf.maxLen = null;
          }

          addPolicy(sf, f, i, 'missing or invalid string length');
          if (sf.fixedLen != null || sf.minLen != null || sf.maxLen != null || f.policy != null) { // don't need a handler function otherwise
            addFn(requiredString(sf.fixedLen, sf.minLen, sf.maxLen), f, i);
          }
          break;
        case 'ALNUM':
          if (!isEmpty(sf.fixedLen)) {
            if (isNaN(sf.fixedLen) || sf.fixedLen < 0 || sf.fixedLen > 1024) {
              throw (`invalid source field specs: invalid field length, ${sf.fixedLen} in entry ${i} expecting empty or a positive integer not greater than 1024`);
            } else {
              sf.fixedLen = Number(sf.fixedLen);
            }
          } else {
            sf.fixedLen = null;
          }

          if (!isEmpty(sf.minLen)) {
            if (isNaN(sf.minLen) || sf.minLen < 0 || sf.minLen > 1024) {
              throw (`invalid source field specs: invalid field minLen, ${sf.minLen} in entry ${i} expecting empty or a positive integer not greater than 1024`);
            } else {
              sf.minLen = Number(sf.minLen);
            }
          } else {
            sf.minLen = null;
          }

          if (!isEmpty(sf.maxLen)) {
            if (isNaN(sf.maxLen) || sf.maxLen < 0 || sf.maxLen > 1024) {
              throw (`invalid source field specs: invalid field maxLen, ${sf.maxLen} in entry ${i} expecting empty or a positive integer not greater than 1024`);
            } else {
              sf.maxLen = Number(sf.maxLen);
            }
          } else {
            sf.maxLen = null;
          }
          addFn(requiredAlphanumeric(sf.fixedLen, sf.minLen, sf.maxLen), f, i);
          addPolicy(sf, f, i, 'missing or invalid length alnum');
          break;
        case 'MAC':
          addPolicy(sf, f, i, 'non-MAC');
          break;
        case 'TIMESTAMP':
          addFn(epoch(tzOffset), f, i);
          if (!isEmpty(notAfter) || !isEmpty(notBefore)) {
            addFn(notBeforeOrAfter(notBefore, notAfter), f, i);
          }
          addPolicy(sf, f, i, 'missing or invalid timestamp');
          break;
        case 'REGEX':
          addFn(requiredPattern(sf.regex), f, i, `not matching pattern of ${sf.regex}`);
          break;
        case 'TENSOR':
          addFn(tensor, f, i);
          break;
        case 'BYTES':
          addFn(bytes, f, i);
          break;
        case 'JSON':
          addFn(_json, f, i);
          break;
        default:
          if (dataType === 'binary') {
            throw (`[TW.ERROR]: invalid source field specs: empty type, ${sf.type} in entry ${i} expecting one of [${dataTypes.join(', ')}] for binary data`);
          } else {
            console.log(`invalid source field specs: empty type, ${sf.type} in entry ${i} expecting one of [${dataTypes.join(', ')}]`);
          }
          break;
      }

      if (dataType === 'JSON') {
        addJsonPathMap(sf, f, i);
      }

      fields.push(f);
    }
    // console.log(fields);
    return fields;
  }

  // return the caller module path, equivalent to __dirname in the caller module but don't want the caller to provide it
  const StackTrace = require('stack-trace');
  function getCallerModulePath() {
    const trace = StackTrace.get();
    if (!isEmpty(trace) && trace.length >= 4) {
      return Path.dirname(trace[3].getFileName());
    }
    return '';
  }

  function fieldSpecsFromXLSX(xlsxspecs, tzOffset, notBefore, notAfter, errorQueue, dataType, inputType) {
    let specs;
    if (inputType === 'base64') {
      specs = convertXlsxToJSON(xlsxspecs, 'base64');
    } else { // assuming 'file'
      specs = readXlsxToJSON(Path.join(getCallerModulePath(), xlsxspecs));
    }
    if (isEmpty(specs)) {
      return (`[TW.ERROR]: Empty XLSX specs from: ${xlsxspecs}`);
    }

    try {
      return processFieldSpecs(specs, tzOffset, notBefore, notAfter, errorQueue, dataType);
    } catch (ex) {
      return (`[TW.ERROR]: ${ex.stack ? ex.stack : ex}`);
    }
  }

  function fieldSpecsForCSVFromXLSX(xlsxspecs, tzOffset, notBefore, notAfter, errorQueue, inputType) {
    return fieldSpecsFromXLSX(xlsxspecs, tzOffset, notBefore, notAfter, errorQueue, 'CSV', inputType);
  }

  function fieldSpecsForJSONFromXLSX(xlsxspecs, tzOffset, notBefore, notAfter, errorQueue, inputType) {
    return fieldSpecsFromXLSX(xlsxspecs, tzOffset, notBefore, notAfter, errorQueue, 'JSON', inputType);
  }

  function pe(o) {
    console.log(o);
    process.exit(100);
  }

  function digitalTwinContext(streams, models) {
    return {
      /*
       * Creates digital twin class utility corresponding to specific model.
       * @param package_name package name
       * @param model_name model name
       * @returns object instance providing the following methods/fields:
       * {{addEntryPoint, getDeviceKey, getScope, metadataStore, primaryDomain, prepareMetadataRequest}}
       */
      digitalTwinClass(package_name, model_name) {
        return this.digitalTwinClassByFQN(`{${package_name}}${model_name}`);
      },

      /*
       * Creates digital twin class utility corresponding to specific model.
       * @param model_fqn fully qualified model name
       * @return object instance providing the following methods/fields:
       * {{addEntryPoint, getDeviceKey, getScope, metadataStore, primaryDomain, prepareMetadataRequest}}
       */
      digitalTwinClassByFQN(model_fqn) {
        if (!(model_fqn in models)) {
          throw Error(`model '${model_fqn}' doesn't exist in the context`);
        }
        const model = models[model_fqn];
        return {
          /*
           * Adds entry point to project configuration. Extends streams array with HTTP POST and reference to
           * specified engine_config.
           * @param engine_config engine configuration
           * @param stream_name stream name
           * @param keys access keys
           */
          addEntryPoint(engine_config, stream_name, keys, entry = null, protocol = 'HTTP', content_type='application/json') {
            if (streams.find(s => s.name === stream_name)) {
              throw Error(`stream with name '${stream_name}' is already defined`);
            }
            if (protocol === 'HTTP') {
              streams.push({
                name: stream_name,
                state: 'enabled',
                protocol: 'HTTP',
                method: 'POST',
                keys: keys,
                engine: engine_config,
                entry: entry || stream_name
              });            
            } else
            if (protocol === 'MQTT') {
              streams.push({
                name: stream_name,
                state: 'enabled',
                protocol: 'MQTT',
                method: 'PUBLISH',
                "content-type": content_type,
                batchCount: 1,
                keys: keys,
                engine: engine_config,
                entry: entry || stream_name
              });
            } else
            if (protocol === 'MQTTS') {
              streams.push({
                name: stream_name,
                state: 'enabled',
                protocol: 'MQTTS',
                method: 'PUBLISH',
                "content-type": content_type,
                batchCount: 1,
                keys: keys,
                engine: engine_config,
                entry: entry || stream_name
              });
            } else {
              throw Error(`Unsupported protocol ${protocol}`);
            }
          },
          /*
           * Retrieves device key for specified data object according to 'key' fields specified in models configuration.
           * @param data data object
           * @return {string} device key
           */
          getDeviceKey(data) {
            if (model.key in data) {
              const scope = this.getScope();
              return scope ? `${scope.getDeviceKey(data)}|${data[model.key]}` : data[model.key];
            }
            throw Error(`key '${model.key}' is missing in data object: ${JSON.stringify(data)}`);
          },
          /*
           * Returns digital twin class instance corresponding to parent model configured by 'scope' field.
           * @return {*} parent digital twin class instance
           */
          getScope() {
            return model.scope ? digitalTwinContext(streams, models).digitalTwinClassByFQN(model.scope) : null;
          },
          metadataStore: 'digitalTwinService',
          /*
           * PrepareMetadataRequest returns function which prepares metadata request: it will get `deviceId` from
           * the input tuples (per the Device DT model) and prepare DT request.
           * @param domain mangled domain name
           * @return
           */
          prepareMetadataRequest(domain_mangled_name) {
              const that = this;
              const scope = that.getScope();
              return function(data) {
                  const req = [];
                  data[0].forEach(function (d) {
                      req.push({
                          key: that.getDeviceKey(d),
                          domain: domain_mangled_name,
                          scope: scope != null ? scope.getDeviceKey(d) : null,
                          data: d
                      });
                  });
                  return req;
              };
          },
          analyticsService: {
            name: 'metricUpdate',
            protocol: 'http',
            resource: 'metrics',
            method: 'POST',
            binding: 'metricUpdate'
          },
          key: model.key
        };
      }
    };
  }

  TW.util = {
    isArray,
    isBoolean,
    isDate,
    isDateString,
    isError,
    isFunction,
    isNull,
    isNoU,
    isNumber,
    isObject,
    isPrimitive,
    isRegExp,
    isString,
    isSymbol,
    isUndefined,
    isEmpty,
    isTwError,
    isJson,
    cloneObject,
    arrayToObjectByKey,
    mergeObjectTopInto,
    log,
    logFields,
    SQL,
    number,
    bin2dec,
    bin2hex,
    dec2bin,
    dec2hex,
    hex2bin,
    hex2dec,
    epoch,
    getTimestamp,
    notBeforeOrAfter,
    trim,
    required,
    requiredString,
    requiredNumber,
    requiredUnsignedNumber,
    requiredAlphanumeric,
    requiredMac,
    requiredCapLetters,
    requiredValue,
    requiredPattern,
    dropTuple,
    dropField,
    useDefault,
    range: requiredRange,
    requiredRange,
    sql,
    joining,
    noop,
    done,
    getRandomInt,
    padding,
    readInt64BE,
    readInt64LE,
    parseJSON,
    parseStringArray,
    parseCSV,
    parseEscapedDoubleQuotedCSV,
    parseDoubleQuotedCSV,
    parseMixedDoubleQuotedCSV,
    parseSingleQuotedCSV,
    parseSpaceOrTabSeparatedValues,
    parseCharSeparatedValues,
    processFieldSpecs,
    routeToErrorStage,
    toErrorDumpFormat,
    fieldSpecsForCSVFromXLSX,
    fieldSpecsForJSONFromXLSX,
    dumpBuffer,
    pe,
    digitalTwinContext
  };
}(module.exports || this));

console.log(`pid=${process.pid} loading jets-data-util completed`);

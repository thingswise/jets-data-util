'use strict';var _typeof='function'==typeof Symbol&&'symbol'==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&'function'==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?'symbol':typeof a},Path=require('path');(function(global){function readXlsxToJSON(a){var b=XLSX.readFile(a),c=b.SheetNames[0],d=b.Sheets[c];return XLSX.utils.sheet_to_json(d,{raw:!0})}function convertXlsxToJSON(a){var b=XLSX.read(a,{type:'base64'}),c=b.SheetNames[0],d=b.Sheets[c];return XLSX.utils.sheet_to_json(d,{raw:!0})}function convertBase(a,b){return function(c){return parseInt(c,a).toString(b)}}function checkArrayIndex(field){var isNaturalNumberRegex=/^-?\d+$/,hasQuoteRegex=/["']/;if(hasQuoteRegex.test(field)){var result=field.match(/(["'])((?:\\{2})*|(?:.*?[^\\](?:\\{2})*))\1/);if(null==result)throw'unbalanced quote';if(result[0]!==field)throw'extra or invalid characters';return{field:result[2],type:'key'}}try{field=eval(field.toString())}catch(a){throw'non integer in array indexing'}if(null==field)throw'non integer in array indexing';if(field=field.toString(),!isNaturalNumberRegex.test(field))throw'non integer in array indexing';return{field:field,type:'index'}}function checkJsonFieldString(a){var b=a.match(/([^"\\]*)/);if(null==b)throw'invalid json field string';if(b[0]===a)return{field:a,type:'key'};throw'invalid json field string'}function extractBracketedContent(a){var b=a.match(/^((?:[^\[]*)+)(?:\[(.*?)\])?$/);if(fields=[],null==b||b[0]!==a||''===b[1])throw'invalid json field string in '+a;if(fields.push({field:b[1],type:'key'}),!isEmpty(b[2])){var c=checkArrayIndex(b[2]);fields.push(c)}return fields}function createSimpleJSONPathMap(a){var b=parseSimpleJSONPathExpression(a.trim());if(0===b.length)return[];var c=[],d=[];return b.forEach(function(a){var b=extractBracketedContent(a);b.forEach(function(a){c.push(a)})}),c.forEach(function(a){checkJsonFieldString(a.field);'key'===a.type?d.push(a.field):'index'===a.type&&d.push(+a.field)}),d}function parseSimpleJSONPathExpression(a){for(var b=a.split(/[\s \t]*\.[\s \t]*(?=(?:[^"\\]*(?:\\.|"(?:[^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g),c=[],d=0;d<b.length;d++)c.push(b[d].trim().replace(/""/g,'"'));return c}function objectToString(a){return Object.prototype.toString.call(a)}function isArray(a){return Array.isArray(a)}function isBoolean(a){return'boolean'==typeof a}function isDate(a){return isObject(a)&&'[object Date]'===objectToString(a)}function isDateString(a){if(null==a||!isString(a))return!1;var b=new Date(a);return'Invalid Date'!==b&&!isNaN(b)}function isError(a){return isObject(a)&&('[object Error]'===objectToString(a)||a instanceof Error)}function isFunction(a){return'function'==typeof a}function isNull(a){return null===a}function isNoU(a){return null==a}function isNumber(a){return'number'==typeof a}function isObject(a){return'object'===('undefined'==typeof a?'undefined':_typeof(a))&&null!==a}function isPrimitive(a){return null===a||'string'==typeof a||'number'==typeof a||'boolean'==typeof a||'symbol'===('undefined'==typeof a?'undefined':_typeof(a))||'undefined'==typeof a}function isRegExp(a){return isObject(a)&&'[object RegExp]'===objectToString(a)}function isString(a){return'string'==typeof a}function isSymbol(a){return'symbol'===('undefined'==typeof a?'undefined':_typeof(a))}function isUndefined(a){return void 0===a}function cloneObject(a){if(null===a||'object'!==('undefined'==typeof a?'undefined':_typeof(a)))return a;var b=a.constructor();for(var c in a)b[c]=cloneObject(a[c]);return b}function isEmpty(a){return!('undefined'!=typeof a)||null===a||!!(Array.isArray(a)&&0===a.length)||!('string'!=typeof a||''!==a)||!('object'!==('undefined'==typeof a?'undefined':_typeof(a))||null==a.length||0!==a.length)||!('object'!==('undefined'==typeof a?'undefined':_typeof(a))||0!==Object.keys(a).length)}function isTwError(a){return!isEmpty(a)&&isString(a)&&0===a.search(TW.ERROR_HEADING)}function toArrayOfKeys(a){return a instanceof Object?Object.keys(a):[]}function toArrayOfValues(a,b){if(!(a instanceof Object))return[];var c=[];return Object.keys(a).forEach(function(d){b&&b!==d||c.push(a[d])}),c}function arrayToObjectByKey(a,b){if(isEmpty(a)||isEmpty(b))return null;for(var c,d={},e=0;e<b.length;e++)c=b[e][a],c&&(d[c]=b[e]);return d}function mergeObjectTopInto(a,b){if(isEmpty(b))return a;if(!isObject(a))return b;if(!isObject(b))return b;var c=b,d=Object.keys(c);for(var e in a)-1===d.indexOf(e)&&(c[e]=a[e]);return c}function number(a){return!isNoU(a)&&(isNaN(a)||0>+a)?'[TW.ERROR]: number() invalid fixed decimal point value, expecting a positive number':function(b){return null!=b&&(isNaN(b)&&(b=b.replace(/[',"]/g,''),b=isNaN(b)?null:+b),null!=b&&(null==a?b=+b:b=(+b).toFixed(a))),b}}function string(){return function(a){return''+a}}function hasTimezone(a){var b=timezoneRegex.exec(a);return!isNoU(b)&&!isEmpty(b[1])}function epoch(a){return isNoU(a)||isString(a)&&!1!==/[\+\-]\d{4}/.test(a)?function(b){var c=a;isString(b)&&!isNaN(b)&&(b=+b,b=1e3*+b.toFixed(3),c=0);var e=new Date(b);isNoU(c)||hasTimezone(b)||(e=new Date(e.toDateString()+' '+e.getHours()+':'+e.getMinutes()+':'+e.getSeconds()+'.'+e.getMilliseconds()+c));var d=Date.UTC(e.getUTCFullYear(),e.getUTCMonth(),e.getUTCDate(),e.getUTCHours(),e.getUTCMinutes(),e.getUTCSeconds(),e.getUTCMilliseconds())/1e3;return isNaN(d)?null:+d.toFixed(3)}:'[TW.ERROR]: DataStage epoch() configuration error: invalid value, expecting a string in the format of "[+-]hhmm"'}function getTimestamp(){return function(){return _Mathfloor(Date.now()/1e3)}}function notBeforeOrAfter(a,b){if(!isNoU(a)&&isNaN(a))return'[TW.ERROR]: DataStage validateTimestamp() configuration error: invalid before value, expecting a number in seconds';if(!isNoU(b)&&isNaN(b))return'[TW.ERROR]: DataStage validateTimestamp() configuration error: invalid after value, expecting a number in seconds';epoch();return function(c,d,e){if(isNaN(c))return null;var f=Date.now()/1e3;return!isNoU(a)&&c-f>a||!isNoU(b)&&f-c>b?(isNoU(d)||d.appendError('notBeforeOrAfter() check failed: now='+new Date(1e3*f)+', timestamp='+new Date(1e3*c)+', timestamp must be '+(isNoU(a)?'':'not before '+new Date(1e3*(f-a)))+(isNoU(b)?'':' not after '+new Date(1e3*(f+b)))+(isNoU(e)?'':' - '+e)),null):c}}function trim(){return function(a){return(''+a).trim()}}function requiredRange(a,b,c,d){return isNoU(a)||isString(a)||!isNaN(a)?isNoU(b)||isString(b)||!isNaN(b)?isNoU(c)||isString(c)||!isNaN(c)?isNoU(d)||isString(d)||!isNaN(d)?null!=a&&null!=b&&a>b?'[TW.ERROR]: DataStage requiredRange() configuration error: min ('+a+') is greater than max ('+b+')':null!=a&&null!=c&&a<c?'[TW.ERROR]: DataStage requiredRange() configuration error: min ('+a+') is less than lower ('+c+')':null!=b&&null!=d&&b>d?'[TW.ERROR]: DataStage requiredRange() configuration error: max ('+b+') is greater than upper ('+d+')':function(e,f,g){return null!=a&&e<a&&null!=c&&e>c?a:null!=b&&e>b&&null!=d&&e<d?b:null!=a&&e<a||null!=b&&e>b?(isNoU(f)||f.appendError('requiredRange() check failed: v='+e+', expecting ('+(null==c?null==a?'-':a:c)+', '+(null==d?null==b?'-':b:d)+')'+(isNoU(g)?'':' - '+g)),null):e}:'[TW.ERROR]: DataStage requiredRange() configuration error: invalid upper ('+c+') value, expecting string or number':'[TW.ERROR]: DataStage requiredRange() configuration error: invalid lower ('+c+') value, expecting string or number':'[TW.ERROR]: DataStage requiredRange() configuration error: invalid max ('+b+') value, expecting string or number':'[TW.ERROR]: DataStage requiredRange() configuration error: invalid min ('+a+') value, expecting string or number'}function required(){return function(a){return null!=a&&'undefined'!==a&&''!==a?a:null}}function checkNumber(a,b){return null!=a&&(isNaN(a)&&(a=a.replace(/[',"]/g,''),a=isNaN(a)?null:+a),null!=a&&(null!=b&&(a=(+a).toFixed(b)),a=+a)),a}function requiredNumber(a){return!isNoU(a)&&(isNaN(a)||0>+a)?'[TW.ERROR]: number() invalid fixed decimal point value, expecting a positive number':function(b){return checkNumber(b,a)}}function requiredUnsignedNumber(a){return!isNoU(a)&&(isNaN(a)||0>+a)?'[TW.ERROR]: number() invalid fixed decimal point value, expecting a positive number':function(b){return null!=(b=checkNumber(b,a))&&0>b&&(b=null),b}}function requiredString(a,b,c){return isEmpty(a)||isNumber(a)?isEmpty(b)||isNumber(b)?isEmpty(c)||isNumber(c)?isEmpty(c)||isNumber(b)||!(c<b)?(c===b&&(a=b,b=null,c=null),isEmpty(a)&&isEmpty(b)&&isEmpty(c))?function(a){return a}:isEmpty(a)?isEmpty(c)&&!isEmpty(b)?function(c){return null!=c&&a(c)<b?null:c}:!isEmpty(c)&&isEmpty(b)?function(b){return null!=b&&a(b)>c?null:b}:function(b){return null!=b&&(a(b)<a||a(b)>c)?null:b}:function(b){return null!=b&&a(b)!==a?null:b}:'[TW.ERROR]: DataStage requiredString() configuration error: invalid second and third arguement, '+b+' and '+c+', expecting third arguement > second argement':'[TW.ERROR]: DataStage requiredString() configuration error: invalid third arguement, '+c+', expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength':'[TW.ERROR]: DataStage requiredString() configuration error: invalid second arguement, '+b+', expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength':'[TW.ERROR]: DataStage requiredString() configuration error: invalid first arguement, '+a+', expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength'}function requiredAlphanumeric(a,b,c){if(!isEmpty(a)&&!isNumber(a))return'[TW.ERROR]: DataStage requiredAlphanumeric() configuration error: invalid first arguement, '+a+', expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength';if(!isEmpty(b)&&!isNumber(b))return'[TW.ERROR]: DataStage requiredAlphanumeric() configuration error: invalid second arguement, '+b+', expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength';if(!isEmpty(c)&&!isNumber(c))return'[TW.ERROR]: DataStage requiredAlphanumeric() configuration error: invalid third arguement, '+c+', expecting arguements ([[Number, Number, Number]]) as fixedLength, minLength and maxLength';if((!isEmpty(c)&&isNumber(b)||isEmpty(c)&&!isNumber(b))&&c<b)return'[TW.ERROR]: DataStage requiredAlphanumeric() configuration error: only one of second (minLength) and third (maxLength) arguements are present, expecting both or just the first arguement (fixedLength)';if(!isEmpty(c)&&!isNumber(b)&&c<b)return'[TW.ERROR]: DataStage requiredAlphanumeric() configuration error: invalid second and third arguement, '+b+' and '+c+', expecting third arguement > second argement';c===b&&(a=c,b=null,c=null);var d;return d=isEmpty(a)&&isEmpty(b)&&isEmpty(c)?/^[a-z0-9]+$/i:isEmpty(a)?new RegExp('^[a-z0-9]{'+a+','+c+'}$','i'):new RegExp('^[a-z0-9]{'+a+'}$','i'),function(a){return d.test(a)?a:null}}function requiredValue(a){return function(b){return b===a?b:null}}function requiredMac(){var a=/^([0-9A-F]{2}){6}$/;return function(b){return b=b.replace(/[:-]/g,''),a.test(b)?b:null}}function requiredCapLetters(a,b){if(!isEmpty(a)&&!isNumber(a))return'[TW.ERROR]: DataStage requiredCapLetters() configuration error: invalid first arguement, '+a+', expecting arguements ([[Number, Number]]) as fixedLength or minLength, maxLength';if(!isEmpty(b)&&!isNumber(b))return'[TW.ERROR]: DataStage requiredCapLetters() configuration error: invalid second arguement, '+b+', expecting arguements ([[Number, Number]]) as length or minLength, maxLength';if(b<a)return'[TW.ERROR]: DataStage requiredCapLetters() configuration error: invalid first and second arguement, '+a+' and '+b+', expecting second arguement > first argement';b===a&&(b=null);var c;return c=isEmpty(a)?/^[A-Z]+$/:isEmpty(b)?new RegExp('^[A-Z]{'+a+'}$',''):new RegExp('^[A-Z]{'+a+','+b+'}$',''),function(a){return c.test(a)?a:null}}function requiredPattern(a,b){if(!isNoU(a)&&!isString(field))return'[TW.ERROR]: DataStage requiredPattern() configuration error: invalid first arguement, '+a+', expecting a regex string';if(!isNoU(b)||!isString(b))return'[TW.ERROR]: DataStage requiredPattern() configuration error: invalid second arguement, '+a+', expecting a regex flag e.g. "i" or "g""';var c=new RegExp(a,b);return function(a){return c.test(a)?a:null}}function dropTuple(a,b,c){return{action:'drop-tuple',target:a||null,message:b||null,quiet:c||!1}}function dropField(a,b,c){return{action:'drop-field',target:a||null,message:b||null,quiet:c||!1}}function useDefault(a,b,c){return{action:'use-default',target:a||null,message:b||null,quiet:c||!1}}function sql(a){return{sql:a}}function json(){return function(a){return a}}function regexSplitWithCapture(a,b){for(var c=a.split(b),d=[],e=0;e<c.length;e++)(0!=e%2||0!==c[e].length)&&d.push(c[e]);return d}function regexSplitWithCapture1(a,b){for(var c=a.split(b),d=[],e=0;e<c.length;e++)if(0!=e%3||0!==c[e].length){if(1==e%3&&null==c[e])if(null!=c[e+1])continue;else c[e]='';(2!=e%3||null!=c[e])&&d.push(c[e])}return d}function parseJSON(a){if(!isNoU(a)&&!isString(a))return'[TW.ERROR]: DataStage parseJSON() configuration error: invalid first arguement, '+a+', expecting a string';var b=!1;return isNoU(a)||'.'!==a[0]||(b=!0,a=a.substring(1)),function(c,d){if(d._lastSourceDataParseType='JSON',isNoU(c))return d.appendError('failed to parse JSON for empty input'),null;if(!isNoU(a)&&isNoU(c[a]))return d.appendError('failed to parse JSON for empty input'),null;try{return b?(isString(c[a])&&(c[a]=JSON.parse(c[a])),c):null==a?isString(c)?JSON.parse(c):c:isString(c[a])?JSON.parse(c[a]):c[a]}catch(b){return d.appendError('failed to parse JSON for '+(a?c[a]:c)+', err='+(b.stack?b.stack:b)),null}}}function parseCSV(){var a=/[\ \t]*,[\ \t]*/g;return function(b,c){return c._lastSourceDataParseType='CSV',b.split(a)}}function parseStringArray(){return function(a){return a}}function parseEscapedDoubleQuotedCSV(){var a=/[\ \t]*"((?:[^"]|"")*)"[\ \t]*,?[\ \t]*/g;return function(b,c){c._lastSourceDataParseType='CSV';for(var d=b.split(a),e=[],f=0;f<d.length;f++)(0!=f%2||0!==d[f].length)&&e.push(d[f].replace(/""/g,'"'));return e}}function parseDoubleQuotedCSV(){var a=/[\ \t]*"(.*?)"[\ \t]*,?[\ \t]*/g;return function(b,c){return c._lastSourceDataParseType='CSV',regexSplitWithCapture(b,a)}}function parseMixedDoubleQuotedCSV0(){var a=/[\ \t]*(?:"(.*?)"|([^",]*))[\ \t]*,?[\ \t]*/g;return function(b,c){return c._lastSourceDataParseType='CSV',regexSplitWithCapture1(b,a)}}function parseMixedDoubleQuotedCSV(){var a=/[\s \t]*\,[\s \t]*(?=(?:[^"\\]*(?:\\.|"(?:[^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g;return function(b,c){c._lastSourceDataParseType='CSV';for(var d=b.split(a),e=[],f=0;f<d.length;f++)e.push(d[f].trim().replace(/^"|"$/g,'').replace(/""/g,'"'));return e}}function parseSingleQuotedCSV(){var a=/[\ \t]*'(.*?)'[\ \t]*,?[\ \t]*/g;return function(b,c){return c._lastSourceDataParseType='CSV',regexSplitWithCapture(b,a)}}function parseSpaceOrTabSeparatedValues(){var a=/[\ \t]/g;return function(b,c){return c._lastSourceDataParseType='CSV',b.split(a)}}function parseCharSeparatedValues(a){if(isNoU(a)||!isString(a))return'[TW.ERROR]: DataStage parse() configuration error: invalid character value, expecting a character';var b=new RegExp('[\\ \\t]*'+a+'[\\ \\t]*','g');return function(a,c){return c._lastSourceDataParseType='CSV',a.split(b)}}function noop(){return function(){}}function done(a,b){return isEmpty(a)||isString(a)?isEmpty(b)||-1!==['failed','partial','success'].indexOf(b)?(b=b||'success',function(c,d){var e=null;d.assertStatus(b)||(e='last status='+d.lastStatus+' does not satisfy the least status='+b),a&&!d.assertData(a)&&(e='expecting data key='+a+' is not available at the last stage='+d.stage),d.end(e,''===a||'none'===a?[]:a?d.getData(a):c)}):'DataStage done() configuration error: invalid second arguement, expecting a one of ["failed", "partial", "success"]':'[TW.ERROR]: DataStage done() configuration error: invalid first arguement, '+a+', expecting a string'}function log(a,b){if(!isEmpty(a)&&!isString(a)&&!isArray(a))return'[TW.ERROR]: DataStage log() configuration error: invalid first arguement, '+a+', expecting a string';var c=[];return isArray(a)?(a.forEach(function(a){if(!isString(a))return'[TW.ERROR]: DataStage log() configuration error: invalid data key in the arry of the first arguement, '+a+', expecting a string'}),c=a):!isEmpty(a)&&c.push(a),function(a,e){var d=[];return 0===c.length?d.push({name:'inflight data',value:a}):c.forEach(function(a){d.push({name:a,value:e.getData(a)})}),d.forEach(function(a){console.log('----------------'),console.log(b?b+' >>>>>':'','scope='+e.scope+' project='+e.project+' stream='+e.stream+' topology='+e.topology+' dataStage='+e.stage+' dataKey='+a.name+':\n',JSON.stringify(a.value,null,2))}),a}}function logFields(a,b,c){if(!isEmpty(c)&&!isString(c))return'[TW.ERROR]: DataStage logFields() configuration error: invalid last arguement, '+c+', expecting a string';if(!isEmpty(a)&&!isString(a))return'[TW.ERROR]: DataStage logFields() configuration error: invalid first arguement, '+a+', expecting a string';if(!isEmpty(b)&&!isString(b)&&!isArray(b))return'[TW.ERROR]: DataStage logFields() configuration error: invalid second arguement, '+b+', expecting a string or an array of strings';var d=[];return isArray(b)?(b.forEach(function(a){if(!isString(a))return'[TW.ERROR]: DataStage logFields() configuration error: invalid data key in the arry of the last arguement, '+a+', expecting a string'}),d=b):!isEmpty(b)&&d.push(b),a=a||'',function(b,e){var g=void 0;if(g=isEmpty(c)?b:e.getData(c),!isEmpty(g)){var h='=--> '+a+' ';return d.forEach(function(a,b){0<b&&(h+='; '),h+=a+'=',g.forEach(function(b,c){0<c&&(h+=', '),h+=b[a]})}),console.log(h),b}}}function joining(a){return a&&!isString(a)?'[TW.ERROR]: DataStage joining() configuration error: invalid first arguement, '+a+', expecting a string':function(b,c,d){c.joining(''===a?[]:a?c.getData(a):b,d)}}function getRandomInt(a,b){return _Mathfloor(Math.random()*(b-a+1))+a}function padding(a,b){if(isString(a)||(a=a.toString()),a.length>=b)return a;return'000000000000000000000000'.substring(0,b-a.length)+a}function routeToErrorStage(a){return isString(a)?function(b,c,d,e){if(e.appendError(b+': '+c),null!=a){var f=[{data:JSON.stringify(d),error:c,message:b}];e.feed(f,a,e,null)}}:'[TW.ERROR]: routeToErrorStage error: invalid stage, '+a+', expecting a string to a data stage'}function toErrorDumpFormat(){return function(a){if(isArray(a)||(a=[a]),isEmpty(a))return a;var b=getTimestamp();return a.forEach(function(c,e){a[e]={timestamp:b(),msg:c}}),a}}function readInt64BE(a,b){var c=a.readUInt32BE(b+4);return 0>c&&(c+=4294967296),4294967296*a.readUInt32BE(b)+c}function readInt64LE(a,b){var c=a.readUInt32LE(b+4);return 0>c&&(hight+=4294967296),4294967296*c+a.readUInt32LE(b)}function writeInt64LE(a,b,c){var d=parseInt(c/4294967296),e=parseInt(c%4294967296);return a.writeUInt32LE(d,b+4),a.writeUInt32LE(e,b),parseInt(4294967296*d+e)}function writeInt64BE(a,b,c){var d=parseInt(c/4294967296),e=parseInt(c%4294967296);return a.writeUInt32BE(e,b+4),a.writeUInt32BE(d,b),parseInt(4294967296*d+e)}function dumpBuffer(a){for(var b='',c=0;c<a.length;c++)0==c%16&&(b+=padding(c.toString(16),8)+' '),0==c%8&&(b+=' '),b+=(16>a[c]?'0':'')+a[c].toString(16).toUpperCase()+' ',15==c%16&&(b+='\r\n');return b}function processFieldSpecs(a,b,c,d,e,g){function h(a,b,c){if(!isFunction(a))throw'invalid source field specs: failed to create handler in entry '+c+': '+a;b.handlers.push(a)}function j(a,b,c){if(!isEmpty(a.max)&&isNaN(a.max))throw'invalid source field specs: invalid field max, '+a.max+' in entry '+c+' expecting empty or a number';if(!isEmpty(a.min)&&isNaN(a.min))throw'invalid source field specs: invalid field min, '+a.min+' in entry '+c+' expecting empty or a number';if(!isEmpty(a.upper)&&isNaN(a.upper))throw'invalid source field specs: invalid field upper, '+a.upper+' in entry '+c+' expecting empty or a number';if(!isEmpty(a.upper)&&isNaN(a.lower))throw'invalid source field specs: invalid field lower, '+a.lower+' in entry '+c+' expecting empty or a number';(null!=a.min||null!=a.max)&&h(requiredRange(a.min,a.max,a.lower,a.upper),b,c)}function k(a,b,c,d){if(!isEmpty(a.policy)&&(a.policy=a.policy.toString().trim(),-1===policies.indexOf(a.policy)))throw'invalid source field specs: invalid field policy, '+a.policy+' in entry '+c+' expecting empty or one of ['+policies.join(', ')+']';if(isEmpty(a.errorQueue)||(a.errorQueue=a.errorQueue.toString().trim()),a.errorQueue=a.errorQueue||e||null,!!isEmpty(a.errorQueue))a.errorQueue=a.errorQueue||e;else if(!isString(a.errorQueue))throw'invalid source field specs: invalid errorQueue, '+a.errorQueue+' in entry '+c+' expecting empty or a string representing an error queue name';else a.errorQueue=a.errorQueue.trim();switch(isEmpty(a.errorMsg)||(a.errorMsg=a.errorMsg.toString().trim()),a.errorMsg=a.errorMsg||d,a.errorQuiet=!isEmpty(a.errorQuiet)&&'true'===a.errorQuiet.toString().trim().toLowerCase(),a.policy){case'drop-tuple':b.policy=dropTuple(a.errorQueue,a.errorMsg,a.errorQuiet);break;case'drop-field':b.policy=dropField(a.errorQueue,a.errorMsg,a.errorQuiet);break;case'use-default':b.policy=useDefault(a.errorQueue,a.errorMsg,a.errorQuiet);break;default:}}function l(a,b){sourceMap=[],isEmpty(a.jsonField)||(a.jsonField=a.jsonField.toString().trim());for(var c=a.jsonField.split(/[\s \t]*;[\s \t]*(?=(?:[^"\\]*(?:\\.|"(?:[^"\\]*\\.)*[^"\\]*"))*[^"]*$)/g),d=[],e=0;e<c.length;e++)d.push(c[e].trim().replace(/""/g,'"'));b.sourceMap=[],d.forEach(function(a){b.sourceMap.push(createSimpleJSONPathMap(a))})}var m=[];if(!isArray(a))return'[TW.ERROR]: invalid source field specs: invalid arguement: specs is not an array';if(!isEmpty(c)&&(isNaN(c)||0>c))return'[TW.ERROR]: invalid source field specs: invalid arguement notBefore, '+sf.notBefore+' expecting empty or a positive integer as seconds';if(!isEmpty(d)&&(isNaN(d)||0>d))return'[TW.ERROR]: invalid source field specs: invalid arguement notAfter, '+sf.notAfter+' expecting empty or a positive integer as seconds';m=[];for(var p,q=0;q<a.length;q++){switch(p=a[q],g){case'CSV':if(!isEmpty(p.csvAbsence)&&'true'===p.csvAbsence.toString().trim().toLowerCase()){delete a[q];continue}break;case'JSON':if(isEmpty(p.jsonField)){delete a[q];continue}break;default:}if(isEmpty(p.name))throw'invalid source field specs: missing name in entry '+q;if(!isEmpty(p.type)&&(p.type=p.type.toString().trim(),-1===dataTypes.indexOf(p.type))){var n=new RegExp(/regex\((.*)\)$/),o=n.exec(p.type);if(null!=o){try{new RegExp(o[1])}catch(a){throw'invalid source field specs: invalid regex expression, '+p.type+' in entry '+q}p.type='REGEX',p.regex=o[1]}else throw'invalid source field specs: unsupported type, '+p.type+' in entry '+q+' expecting empty or one of ['+dataTypes.join(', ')+']'}var i={name:p.name,handlers:[]};switch(p.type){case'SINT':case'INT':case'DINT':case'LINT':h(requiredNumber(0),i,q),j(p,i,q),k(p,i,q,'non-integer');break;case'USINT':case'UINT':case'UDINT':case'ULINT':h(requiredNumber(0),i,q),j(p,i,q),k(p,i,q,'non-unsigned-integer');break;case'REAL':case'LREAL':if(!!isEmpty(p.decimals))p.decimals=6;else if(isNaN(p.decimals)||12<p.decimals||0>p.decimals)throw'invalid source field specs: invalid field decimals, '+p.decimals+' in entry '+q+' expecting empty or a positive integer not greater than 8';else p.decimals=+p.decimals;h(requiredNumber(+p.decimals),i,q),j(p,i,q),k(p,i,q,'non-number');break;case'STRING':if(!!isEmpty(p.fixedLen))p.fixedLen=null;else if(isNaN(p.fixedLen)||0>p.fixedLen||1024<p.fixedLen)throw'invalid source field specs: invalid field length, '+p.fixedLen+' in entry '+q+' expecting empty or a positive integer not greater than 1024';else p.fixedLen=+fixedLen;if(!!isEmpty(p.minLen))p.minLen=null;else if(isNaN(p.minLen)||0>p.minLen||1024<p.minLen)throw'invalid source field specs: invalid field minLen, '+p.minLen+' in entry '+q+' expecting empty or a positive integer not greater than 1024';else p.minLen=+p.minLen;if(!!isEmpty(p.maxLen))p.maxLen=null;else if(isNaN(p.maxLen)||0>p.maxLen||1024<p.maxLen)throw'invalid source field specs: invalid field maxLen, '+p.maxLen+' in entry '+q+' expecting empty or a positive integer not greater than 1024';else p.maxLen=+p.maxLen;k(p,i,q,'missing or invalid string length'),(null!=p.fixedLen||null!=p.minLen||null!=p.maxLen||null!=i.policy)&&h(requiredString(p.fixedLen,p.minLen,p.maxLen),i,q);break;case'ALNUM':if(!!isEmpty(p.fixedLen))p.fixedLen=null;else if(isNaN(p.fixedLen)||0>p.fixedLen||1024<p.fixedLen)throw'invalid source field specs: invalid field length, '+p.fixedLen+' in entry '+q+' expecting empty or a positive integer not greater than 1024';else p.fixedLen=+fixedLen;if(!!isEmpty(p.minLen))p.minLen=null;else if(isNaN(p.minLen)||0>p.minLen||1024<p.minLen)throw'invalid source field specs: invalid field minLen, '+p.minLen+' in entry '+q+' expecting empty or a positive integer not greater than 1024';else p.minLen=+p.minLen;if(!!isEmpty(p.maxLen))p.maxLen=null;else if(isNaN(p.maxLen)||0>p.maxLen||1024<p.maxLen)throw'invalid source field specs: invalid field maxLen, '+p.maxLen+' in entry '+q+' expecting empty or a positive integer not greater than 1024';else p.maxLen=+p.maxLen;h(requiredAlphanumeric(p.fixedLen,p.minLen,p.maxLen),i,q),k(p,i,q,'missing or invalid length alnum');break;case'MAC':k(p,i,q,'non-MAC');break;case'TIMESTAMP':h(epoch(b),i,q),isEmpty(d)&&isEmpty(c)||h(notBeforeOrAfter(c,d),i,q),k(p,i,q,'missing or invalid timestamp');break;case'REGEX':h(requirePattern(p.regex),i,q,'not matching pattern of '+p.regex);default:if('binary'===g)throw'[TW.ERROR]: invalid source field specs: empty type, '+p.type+' in entry '+q+' expecting one of ['+dataTypes.join(', ')+'] for binary data';else console.log('invalid source field specs: empty type, '+p.type+' in entry '+q+' expecting one of ['+dataTypes.join(', ')+']');}'JSON'===g&&l(p,i,q),m.push(i)}return m}function getCallerModulePath(){var a=StackTrace.get();return!isEmpty(a)&&4<=a.length?Path.dirname(a[3].getFileName()):''}function fieldSpecsFromXLSX(a,b,c,d,e,f,g){var h;if(h='base64'===g?convertXlsxToJSON(a,'base64'):readXlsxToJSON(Path.join(getCallerModulePath(),a)),isEmpty(h))return'[TW.ERROR]: Empty XLSX specs from: '+xlsxpecs;try{return processFieldSpecs(h,b,c,d,e,f)}catch(a){return'[TW.ERROR]: '+(a.stack?a.stack:a)}}function fieldSpecsForCSVFromXLSX(a,b,c,d,e,f){return fieldSpecsFromXLSX(a,b,c,d,e,'CSV',f)}function fieldSpecsForJSONFromXLSX(a,b,c,d,e,f){return fieldSpecsFromXLSX(a,b,c,d,e,'JSON',f)}function pe(a){console.log(a),process.exit(100)}function digitalTwinContext(a,b){return{digitalTwinClass:function digitalTwinClass(a,b){return this.digitalTwinClassByFQN('{'+a+'}'+b)},digitalTwinClassByFQN:function digitalTwinClassByFQN(c){if(!(c in b))throw Error('model \''+c+'\' doesn\'t exist in the context');var d=b[c];return{addEntryPoint:function addEntryPoint(b,c,d){if(a.find(function(a){return a.name===c}))throw Error('stream with name \''+c+'\' is already defined');a.push({name:c,state:'enabled',protocol:'HTTP',method:'POST',keys:d,engine:b})},getDeviceKey:function getDeviceKey(a){if(d.key in a){var b=this.getScope();return b?b.getDeviceKey(a)+'|'+a[d.key]:a[d.key]}throw Error('key \''+d.key+'\' is missing in data object: '+JSON.stringify(a))},getScope:function getScope(){return d.scope?digitalTwinContext(a,b).digitalTwinClassByFQN(d.scope):null},metadataStore:'digitalTwinService',primaryDomain:d.primary_domain?d.primary_domain.mangled_name:null,prepareMetadataRequest:function prepareMetadataRequest(a){var b=[],c=this;return a.forEach(function(a){b.push({key:c.getDeviceKey(a),domain:c.primaryDomain})}),b},analyticsService:{name:'metricUpdate',protocol:'http',resource:'metrics',method:'POST',binding:'metricUpdate'}}}}}var _Mathfloor=Math.floor,TW=global.TW||(global.TW={});TW.ERROR_HEADING='[TW.ERROR]:';var XLSX=require('xlsx'),bin2dec=convertBase(2,10),bin2hex=convertBase(2,16),dec2bin=convertBase(10,2),dec2hex=convertBase(10,16),hex2bin=convertBase(16,2),hex2dec=convertBase(16,10),SQL=require('alasql');SQL.fn.xValueToArray=function(a,b,c){if(isNoU(a)||!isObject(a))return[];isString(b)&&(b=[b]);for(var d=[],e=0;e<b.length;e++)isString(b[e])&&a.hasOwnProperty(b[e])&&d.push(a[b[e]]);return c&&d.push(JSON.stringify(a)),d},SQL.fn.xStringToObject=function(a,b,c){if(isNoU(a)||!isObject(a))return[];isString(b)&&(b={},b[b]=!1);var d={};for(var f in b)if(b.hasOwnProperty(f)&&a.hasOwnProperty(f)){var g=a[f];if(!0===b[f]&&!isEmpty(g)&&isString(g))try{g=JSON.parse(g)}catch(a){g='failed to parse '+g+' error='+(a.stack?a.stack:a)}if(!0===c)for(var e in g)g.hasOwnProperty(e)&&(d[e]=g[e]);else d[e]=g}return d},SQL.fn.xParseJSON=function(a){if(isNoU(a)||!isString(a))return{};var b;try{b=JSON.parse(a)}catch(b){v='failed to parse '+a+' error='+(b.stack?b.stack:b)}return b};var timezoneRegex=/(?:(?:\d{1,2}[:]\d{1,2}(?:[:]\d{1,2})?){1}(?:.\d{3})?)([Zz]|(?:[+-]\d{2}(?:[:]?\d{2})?)|(?: GMT[\-\+]\d{4})|(?: [A-Z]{2,4}))/,dataTypes=['SINT','INT','DINT','LINT','USINT','UINT','UDINT','ULINT','REAL','LREAL','STRING','ALNUM','MAC','TIMESTAMP'],policies=['drop-tuple','drop-field','use-default'],StackTrace=require('stack-trace');TW.util={isArray:isArray,isBoolean:isBoolean,isDate:isDate,isDateString:isDateString,isError:isError,isFunction:isFunction,isNull:isNull,isNoU:isNoU,isNumber:isNumber,isObject:isObject,isPrimitive:isPrimitive,isRegExp:isRegExp,isString:isString,isSymbol:isSymbol,isUndefined:isUndefined,isEmpty:isEmpty,isTwError:isTwError,cloneObject:cloneObject,arrayToObjectByKey:arrayToObjectByKey,mergeObjectTopInto:mergeObjectTopInto,log:log,logFields:logFields,SQL:SQL,number:number,bin2dec:bin2dec,bin2hex:bin2hex,dec2bin:dec2bin,dec2hex:dec2hex,hex2bin:hex2bin,hex2dec:hex2dec,epoch:epoch,getTimestamp:getTimestamp,notBeforeOrAfter:notBeforeOrAfter,trim:trim,required:required,requiredString:requiredString,requiredNumber:requiredNumber,requiredUnsignedNumber:requiredUnsignedNumber,requiredAlphanumeric:requiredAlphanumeric,requiredMac:requiredMac,requiredCapLetters:requiredCapLetters,requiredValue:requiredValue,requiredPattern:requiredPattern,dropTuple:dropTuple,dropField:dropField,useDefault:useDefault,range:requiredRange,requiredRange:requiredRange,sql:sql,joining:joining,noop:noop,done:done,getRandomInt:getRandomInt,padding:padding,readInt64BE:readInt64BE,readInt64LE:readInt64LE,parseJSON:parseJSON,parseStringArray:parseStringArray,parseCSV:parseCSV,parseEscapedDoubleQuotedCSV:parseEscapedDoubleQuotedCSV,parseDoubleQuotedCSV:parseDoubleQuotedCSV,parseMixedDoubleQuotedCSV:parseMixedDoubleQuotedCSV,parseSingleQuotedCSV:parseSingleQuotedCSV,parseSpaceOrTabSeparatedValues:parseSpaceOrTabSeparatedValues,parseCharSeparatedValues:parseCharSeparatedValues,routeToErrorStage:routeToErrorStage,toErrorDumpFormat:toErrorDumpFormat,fieldSpecsForCSVFromXLSX:fieldSpecsForCSVFromXLSX,fieldSpecsForJSONFromXLSX:fieldSpecsForJSONFromXLSX,dumpBuffer:dumpBuffer,pe:pe,digitalTwinContext:digitalTwinContext}})(module.exports||void 0),console.log('pid='+process.pid+' loading jets-data-util completed');
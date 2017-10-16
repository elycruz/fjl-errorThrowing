'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.errorIfNotTypesThrower = exports.errorIfNotTypeThrower = exports.getErrorIfNotTypesThrower = exports.getErrorIfNotTypeThrower = exports.version = undefined;

var _version = require('./generated/version');

Object.defineProperty(exports, 'version', {
    enumerable: true,
    get: function get() {
        return _version.version;
    }
});

var _fjl = require('fjl');

/**
 * Error message template function.
 * @typedef {Function} errorMessageCall
 * @param tmplContext {TemplateContext}
 * @returns {String}
 */

/**
 * @typedef {Object} TemplateContext
 */

/**
 * Used to ensure value matches passed in type.
 * @typedef {Function} errorIfNotType
 * @param valueName {String}
 * @param value {Any}
 * @param type {String|Function} - Constructor name or constructor.
 * @throws {Error} - If value doesn't match type.
 * @returns {Undefined}
 */

/**
 * Used to ensure a value matches one of one or more types passed in.
 * @typedef {Function} errorIfNotTypes
 * @param valueName {String}
 * @param value {Any}
 * @param valueTypes {...(String|Function)} - Constructor names or constructors.
 * @throws {Error} - If value doesn't match type.
 * @returns {Undefined}
 */

var

/**
 * Resolves/normalizes a type name from either a string or a constructor.
 * @private
 * @function module:fjlErrorThrowing.getTypeName
 * @param type {Function|String} - String or function representing a type.
 * @returns {String}
 * @private
 */
getTypeName = function getTypeName(type) {
    if ((0, _fjl.isString)(type)) {
        return type;
    } else if ((0, _fjl.isFunction)(type)) {
        return type.name;
    }
    throw Error('`fjl.error.getTypeName` only accepts strings and/or constructors.  ' + 'Value type received: ' + (0, _fjl.typeOf)(type) + ';  Value: ' + type);
},


/**
 * Pretty prints an array of types/type-strings for use by error messages;
 * Outputs "`SomeTypeName`, ..." from [SomeType, 'SomeTypeName', etc...]
 * @private
 * @function module:fjlErrorThrowing.multiTypesToString
 * @param types {Array|TypesArray}
 * @return {String}
 * @private
 */
multiTypesToString = function multiTypesToString(types) {
    return (0, _fjl.length)(types) ? (0, _fjl.intercalate)(', ', (0, _fjl.map)(function (type) {
        return '`' + getTypeName(type) + '`';
    }, types)) : '';
},


/**
 * Prints a message from an object.  Object signature:
 * {contextName, valueName, value, expectedTypeName, foundTypeName, messageSuffix}
 * @function module:fjlErrorThrowing.defaultErrorMessageCall
 * @param tmplContext {Object|TemplateContext} - Object to use in error template.
 * @returns {string}
 * @private
 */
defaultErrorMessageCall = function defaultErrorMessageCall(tmplContext) {
    var contextName = tmplContext.contextName,
        valueName = tmplContext.valueName,
        value = tmplContext.value,
        expectedTypeName = tmplContext.expectedTypeName,
        foundTypeName = tmplContext.foundTypeName,
        messageSuffix = tmplContext.messageSuffix,
        isMultiTypeNames = (0, _fjl.isArray)(expectedTypeName),
        typesCopy = isMultiTypeNames ? 'of type' : 'of one of the types',
        typesToMatchCopy = isMultiTypeNames ? multiTypesToString(expectedTypeName) : expectedTypeName;

    return (contextName ? '`' + contextName + '.' : '`') + (valueName + '` is not ' + typesCopy + ': ' + typesToMatchCopy + '.  ') + ('Type received: ' + foundTypeName + '.  Value: ' + value + ';') + ('' + (messageSuffix ? '  ' + messageSuffix + ';' : ''));
},


/**
 * Returns a function that can be used to ensure that values are of a given type.
 *   Also throws informative error messages containing the value types, names, expected type names,
 *   etc.
 * @function module:fjlErrorThrowing.getErrorIfNotTypeThrower
 * @param contextName {String} - Name of context to attribute errors if thrown.
 * @param errorMessageCall {Function|errorMessageCall} - Template function (takes an info-object and returns a printed string).
 * @returns {Function|errorIfNotType}
 */
getErrorIfNotTypeThrower = function getErrorIfNotTypeThrower(contextName, errorMessageCall) {
    return function (valueName, value, ValueType) {
        var messageSuffix = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

        var expectedTypeName = getTypeName(ValueType),
            foundTypeName = (0, _fjl.typeOf)(value);
        if ((0, _fjl._isType)(expectedTypeName, value)) {
            return;
        }
        throw new Error(errorMessageCall({ contextName: contextName, valueName: valueName, value: value, expectedTypeName: expectedTypeName, foundTypeName: foundTypeName, messageSuffix: messageSuffix }));
    };
},


/**
 * Returns a function that can be used to ensure that a value is of one or more given types.
 *   The returned function is used in cases where informative error messages
 *   containing the value types, names, expected type names, are-required/should-be-used etc.
 * @function module:fjlErrorThrowing.getErrorIfNotTypesThrower
 * @param contextName {String} - Name of context to attribute errors if thrown.
 * @param errorMessageCall {Function|errorMessageCall} - Template function (takes an info-object and returns a printed string).
 * @returns {Function|errorIfNotTypes}
 */
getErrorIfNotTypesThrower = function getErrorIfNotTypesThrower(contextName, errorMessageCall) {
    return function (valueName, value) {
        for (var _len = arguments.length, valueTypes = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
            valueTypes[_key - 2] = arguments[_key];
        }

        var expectedTypeNames = valueTypes.map(getTypeName),
            matchFound = expectedTypeNames.some(function (ValueType) {
            return (0, _fjl._isType)(ValueType, value);
        }),
            foundTypeName = (0, _fjl.typeOf)(value);
        if (matchFound) {
            return;
        }
        throw new Error(errorMessageCall({
            contextName: contextName, valueName: valueName, value: value,
            expectedTypeName: expectedTypeNames, foundTypeName: foundTypeName
        }));
    };
},


/**
 * Returns a function that can be used to ensure that values are of a given type.
 * This function is the same as `getErrorIfNotTypeThrower` except it
 * doesn't expect and `errorMessageCall` or template function (uses a default-ly defined one)
 *   Also throws informative error messages containing the value types, names, expected type names, etc.
 * @function module:fjlErrorThrowing.errorIfNotTypeThrower
 * @param contextName {String} - Name of context to attribute errors if thrown.
 * @returns {Function|errorIfNotType}
 */
errorIfNotTypeThrower = function errorIfNotTypeThrower(contextName) {
    return getErrorIfNotTypeThrower(contextName, defaultErrorMessageCall);
},


/**
 * Returns a function that can be used to ensure that a value is of one or more given types.
 * This function is the same as `getErrorIfNotTypesThrower` except it
 * doesn't expect an `errorMessageCall` or template function (uses a default-ly defined one)
 *   The returned function is used in cases where informative error messages
 *   containing the value types, names, expected type names, are-required/should-be-used etc.
 * @function module:fjlErrorThrowing.errorIfNotTypesThrower
 * @param contextName {String} - Name of context to attribute errors if thrown.
 * @returns {Function|errorIfNotTypes}
 */
errorIfNotTypesThrower = function errorIfNotTypesThrower(contextName) {
    return getErrorIfNotTypesThrower(contextName, defaultErrorMessageCall);
};

exports.getErrorIfNotTypeThrower = getErrorIfNotTypeThrower;
exports.getErrorIfNotTypesThrower = getErrorIfNotTypesThrower;
exports.errorIfNotTypeThrower = errorIfNotTypeThrower;
exports.errorIfNotTypesThrower = errorIfNotTypesThrower;
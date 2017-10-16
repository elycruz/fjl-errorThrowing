'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getErrorIfNotTypesThrower = exports.getErrorIfNotTypeThrower = exports.errorIfNotTypes = exports.errorIfNotType = exports.errorIfNotTypes$ = exports.errorIfNotType$ = exports.getErrorIfNotTypesThrower$ = exports.getErrorIfNotTypeThrower$ = exports.defaultErrorMessageCall = exports.multiTypesToString = exports.getTypeName = exports.version = undefined;

var _version = require('./generated/version');

Object.defineProperty(exports, 'version', {
    enumerable: true,
    get: function get() {
        return _version.version;
    }
});

var _fjl = require('fjl');

/**
 * @typedef {*} Any - Synonym for 'any value'.
 */

/**
 * @typedef {Object<value, valueName, expectedTypeName, foundTypeName, messageSuffix>} TemplateContext
 * @description Template context used for error message renderers (functions that take a context obj and return a string).
 * @property value {Any}
 * @property valueName {String}
 * @property expectedTypeName {String} - Expected name of constructor of `value`;  E.g., usually `SomeConstructor.name`;
 * @property foundTypeName {String} - Found types name;  E.g., `FoundConstructor.name`;
 * @property [messageSuffix=null] {Any} - Message suffix (sometimes an extra hint or instructions for
 *  directing user to fix where his/her error has occurred).  Optional.
 */

/**
 * Error message template function.
 * @typedef {Function} errorMessageCall
 * @param tmplContext {TemplateContext}
 * @returns {String}
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
getTypeName = exports.getTypeName = function getTypeName(type) {
    if ((0, _fjl.isString)(type)) {
        return type;
    } else if ((0, _fjl.isFunction)(type)) {
        return type.name;
    }
    throw Error('`fjlErrorThrowing.getTypeName` only accepts strings and/or constructors.  ' + 'Value type received: ' + (0, _fjl.typeOf)(type) + ';  Value: ' + type);
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
multiTypesToString = exports.multiTypesToString = function multiTypesToString(types) {
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
defaultErrorMessageCall = exports.defaultErrorMessageCall = function defaultErrorMessageCall(tmplContext) {
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
 * Gets the error message thrower seeded with passed in errorMessage template call.
 * @function module:fjlErrorThrowing.getErrorIfNotTypeThrower$
 * @param errorMessageCall {Function|errorMessageCall}
 * @returns {Function|errorIfNotType}
 */
getErrorIfNotTypeThrower$ = exports.getErrorIfNotTypeThrower$ = function getErrorIfNotTypeThrower$(errorMessageCall) {
    return function (contextName, valueName, value, ValueType) {
        var messageSuffix = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;

        var expectedTypeName = getTypeName(ValueType),
            foundTypeName = (0, _fjl.typeOf)(value);
        if ((0, _fjl._isType)(expectedTypeName, value)) {
            return;
        }
        throw new Error(errorMessageCall({ contextName: contextName, valueName: valueName, value: value, expectedTypeName: expectedTypeName, foundTypeName: foundTypeName, messageSuffix: messageSuffix }));
    };
},


/**
 * Gets the error message thrower seeded with passed in errorMessage template call.
 * @function module:fjlErrorThrowing.getErrorIfNotTypesThrower$
 * @param errorMessageCall {Function|errorMessageCall}
 * @returns {Function|errorIfNotTypes}
 */
getErrorIfNotTypesThrower$ = exports.getErrorIfNotTypesThrower$ = function getErrorIfNotTypesThrower$(errorMessageCall) {
    return function (contextName, valueName, value) {
        for (var _len = arguments.length, valueTypes = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
            valueTypes[_key - 3] = arguments[_key];
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
 * Checks that passed in `value` is of given `type`.  Throws an error if value
 * is not of given `type`.  This is the un-curried version.  For the curried version
 * see `module:fjlErrorThrowing.errorIfNotType`.
 * @function module:fjlErrorThrowing.errorIfNotType$
 * @param contextName {String} - Name of context to attribute errors if thrown.
 * @param valueName {String} - String rep of value.
 * @param value {Any}
 * @param type {String|Function} - Type's name or type itself.
 * @param [messageSuffix=null] {String} - Optional.
 * @returns {undefined}
 * @uncurried
 */
errorIfNotType$ = exports.errorIfNotType$ = getErrorIfNotTypeThrower$(defaultErrorMessageCall),


/**
 * Checks that passed in `value` is of one of the given `types`.  Throws an error if value
 *  is not of one of the given `types`.  This is the un-curried version.  For the curried version
 * see `module:fjlErrorThrowing.errorIfNotTypes`.
 * @type {Function|module:fjlErrorThrowing.errorIfNotTypes}
 * @function module:fjlErrorThrowing.errorIfNotTypes$
 * @param contextName {String} - Name of context to attribute errors if thrown.
 * @param valueName {String} - String rep of value.
 * @param value {Any}
 * @param types {...(String|Function)} - One or more type names or types themselves.
 * @returns {undefined}
 * @uncurried
 */
errorIfNotTypes$ = exports.errorIfNotTypes$ = getErrorIfNotTypesThrower$(defaultErrorMessageCall),


/**
 * Checks that passed in `value` is of given `type`.  Throws an error if value
 * is not of given `type`.  Curried.
 * @function module:fjlErrorThrowing.errorIfNotType
 * @param contextName {String} - Name of context to attribute errors if thrown.
 * @param valueName {String} - String rep of value.
 * @param value {Any}
 * @param type {String|Function} - Type's name or type itself.
 * @param [messageSuffix=null] {String} - Optional.
 * @returns {undefined}
 * @curried
 */
errorIfNotType = exports.errorIfNotType = (0, _fjl.curry)(errorIfNotType$),


/**
 * Checks that passed in `value` is of one of the given `types`.  Throws an error if value
 *  is not of one of the given `types`.  Curried.
 * @function module:fjlErrorThrowing.errorIfNotTypes
 * @param contextName {String} - Name of context to attribute errors if thrown.
 * @param valueName {String} - String rep of value.
 * @param value {Any}
 * @param types {...(String|Function)} - Type's name or type itself.
 * @returns {undefined}
 * @curried
 */
errorIfNotTypes = exports.errorIfNotTypes = (0, _fjl.curry4)(errorIfNotTypes$),


/**
 * Returns a function that can be used to ensure that values are of a given type.
 *   Also throws informative error messages containing the value types, names, expected type names,
 *   etc.
 * @function module:fjlErrorThrowing.getErrorIfNotTypeThrower
 * @param errorMessageCall {Function|errorMessageCall} - Template function (takes an info-object and returns a printed string).
 * @returns {Function|errorIfNotType} - Returns a function with the same signature as `errorIfNotType` though curried.
 */
getErrorIfNotTypeThrower = exports.getErrorIfNotTypeThrower = function getErrorIfNotTypeThrower(errorMessageCall) {
    return (0, _fjl.curry)(getErrorIfNotTypeThrower$(errorMessageCall));
},


/**
 * Returns a function that can be used to ensure that a value is of one or more given types.
 *   The returned function is used in cases where informative error messages
 *   containing the value types, names, expected type names, are-required/should-be-used etc.
 * @function module:fjlErrorThrowing.getErrorIfNotTypesThrower
 * @param errorMessageCall {Function|errorMessageCall} - Template function (takes an info-object and returns a printed string).
 * @returns {Function|errorIfNotTypes} - Returns a function with the same signature as `errorIfNotTypes` though curried.
 */
getErrorIfNotTypesThrower = exports.getErrorIfNotTypesThrower = function getErrorIfNotTypesThrower(errorMessageCall) {
    return (0, _fjl.curry4)(getErrorIfNotTypesThrower$(errorMessageCall));
};
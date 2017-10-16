/**
 * @module fjlErrorThrowing
 */
import {
    typeOf,
    _isType as isType,
    map, length, intercalate,
    isString, isArray, isFunction,
    curry, curry4
} from 'fjl';

/**
 * @memberOf module:fjlErrorThrowing
 * @property version {String}
 */
export {version} from './generated/version';

/**
 * @typedef {*} Any
 * @typedef {Object<value, valueName, expectedTypeName, foundTypeName>} TemplateContext
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

export const

    /**
     * Resolves/normalizes a type name from either a string or a constructor.
     * @private
     * @function module:fjlErrorThrowing.getTypeName
     * @param type {Function|String} - String or function representing a type.
     * @returns {String}
     * @private
     */
    getTypeName = type => {
        if (isString(type)) { return type; }
        else if (isFunction(type)) { return type.name; }
        throw Error('`fjl.error.getTypeName` only accepts strings and/or constructors.  ' +
            'Value type received: ' + typeOf(type) + ';  Value: ' + type);
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
    multiTypesToString = types => length(types) ?
             intercalate(', ', map(type => `\`${getTypeName(type)}\``, types)) : '',

    /**
     * Prints a message from an object.  Object signature:
     * {contextName, valueName, value, expectedTypeName, foundTypeName, messageSuffix}
     * @function module:fjlErrorThrowing.defaultErrorMessageCall
     * @param tmplContext {Object|TemplateContext} - Object to use in error template.
     * @returns {string}
     * @private
     */
    defaultErrorMessageCall = tmplContext => {
        const {
            contextName, valueName, value, expectedTypeName,
            foundTypeName, messageSuffix
        } = tmplContext,
            isMultiTypeNames = isArray(expectedTypeName),
            typesCopy = isMultiTypeNames ? 'of type' : 'of one of the types',
            typesToMatchCopy = isMultiTypeNames ? multiTypesToString(expectedTypeName) : expectedTypeName;
        return (contextName ? `\`${contextName}.` : '`') +
            `${valueName}\` is not ${typesCopy}: ${typesToMatchCopy}.  ` +
            `Type received: ${foundTypeName}.  Value: ${value};` +
            `${messageSuffix ?  '  ' + messageSuffix + ';' : ''}`;
    },

    getErrorIfNotTypeThrower$ = errorMessageCall => (contextName, valueName, value, ValueType, messageSuffix = null) => {
        const expectedTypeName = getTypeName(ValueType),
            foundTypeName = typeOf(value);
        if (isType(expectedTypeName, value)) { return; }
        throw new Error(errorMessageCall(
            {contextName, valueName, value, expectedTypeName, foundTypeName, messageSuffix}
        ));
    },

    getErrorIfNotTypesThrower$ = errorMessageCall => (contextName, valueName, value, ...valueTypes) => {
        const expectedTypeNames = valueTypes.map(getTypeName),
            matchFound = expectedTypeNames.some(ValueType => isType(ValueType, value)),
            foundTypeName = typeOf(value);
        if (matchFound) { return; }
        throw new Error(
            errorMessageCall({
                contextName, valueName, value,
                expectedTypeName: expectedTypeNames, foundTypeName
            })
        );
    },

    errorIfNotType$ = getErrorIfNotTypeThrower$(defaultErrorMessageCall),

    errorIfNotTypes$ = getErrorIfNotTypesThrower$(defaultErrorMessageCall),

    /**
     * Returns a function that can be used to ensure that values are of a given type.
     * This function is the same as `getErrorIfNotTypeThrower` except it
     * doesn't expect and `errorMessageCall` or template function (uses a default-ly defined one)
     *   Also throws informative error messages containing the value types, names, expected type names, etc.
     * @function module:fjlErrorThrowing.errorIfNotType
     * @param contextName {String} - Name of context to attribute errors if thrown.
     * @returns {Function|errorIfNotType}
     */
    errorIfNotType = curry(errorIfNotType$),

    /**
     * Returns a function that can be used to ensure that a value is of one or more given types.
     * This function is the same as `getErrorIfNotTypesThrower` except it
     * doesn't expect an `errorMessageCall` or template function (uses a default-ly defined one)
     *   The returned function is used in cases where informative error messages
     *   containing the value types, names, expected type names, are-required/should-be-used etc.
     * @function module:fjlErrorThrowing.errorIfNotTypes
     * @param contextName {String} - Name of context to attribute errors if thrown.
     * @returns {Function|errorIfNotTypes}
     */
    errorIfNotTypes = curry4(errorIfNotTypes$),

    /**
     * Returns a function that can be used to ensure that values are of a given type.
     *   Also throws informative error messages containing the value types, names, expected type names,
     *   etc.
     * @function module:fjlErrorThrowing.getErrorIfNotTypeThrower
     * @param errorMessageCall {Function|errorMessageCall} - Template function (takes an info-object and returns a printed string).
     * @returns {Function|errorIfNotType}
     */
    getErrorIfNotTypeThrower = errorMessageCall => curry(getErrorIfNotTypeThrower$(errorMessageCall)),

    /**
     * Returns a function that can be used to ensure that a value is of one or more given types.
     *   The returned function is used in cases where informative error messages
     *   containing the value types, names, expected type names, are-required/should-be-used etc.
     * @function module:fjlErrorThrowing.getErrorIfNotTypesThrower
     * @param errorMessageCall {Function|errorMessageCall} - Template function (takes an info-object and returns a printed string).
     * @returns {Function|errorIfNotTypes}
     */
    getErrorIfNotTypesThrower = errorMessageCall => curry4(getErrorIfNotTypesThrower$(errorMessageCall))
;

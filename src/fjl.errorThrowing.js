/**
 * @module fjlErrorThrowing
 */
import {
    typeOf, isset,
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
 * @description Checks whether a value is of given type.
 * @typedef {Function} TypeChecker
 * @param Type {Function|String} - a Type constructor or it's name.
 * @returns {Boolean}
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

    isCheckableType = type => isString(type) || isFunction(type),

    errorIfNotCheckableType = (contextName, type) => {
        if (!isCheckableType(type)) {
            throw new Error (`${contextName} expects Types to be checked against to be of type \`String\` or \`Function\`.` +
                `  Type received \`${typeOf(type)}\`.  Value \`${type}\`.`);
        }
        return type;
    },

    /**
     * Resolves/normalizes a type name from either a string or a constructor.
     * @private
     * @function module:fjlErrorThrowing.getTypeName
     * @param type {Function|String} - String or function representing a type.
     * @returns {String}
     * @private
     */
    getTypeName = type =>
        errorIfNotCheckableType('getTypeName', type) && isString(type) ? type : type.name,

    /**
     * Returns a boolean indicating whether given value matches given type.
     * @function module:fjlErrorThrowing.defaultTypeChecker$
     * @param Type {String|Function|Class} - Type name, constructor and/or class.
     * @param value {*}
     * @returns {Boolean}
     */
    defaultTypeChecker$ = (Type, value) => isType(getTypeName(Type), value) || (
        isFunction(Type) && isset(value) && value instanceof Type),

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

    /**
     * Gets the error message thrower seeded with passed in errorMessage template call.
     * @function module:fjlErrorThrowing.getErrorIfNotTypeThrower$
     * @param errorMessageCall {Function|errorMessageCall}
     * @param typeChecker {TypeChecker|Function} - Function<Type, value>:Boolean
     * @returns {Function|errorIfNotType}
     */
    getErrorIfNotTypeThrower$ = (errorMessageCall, typeChecker = defaultTypeChecker$) => (contextName, valueName, value, ValueType, messageSuffix = null) => {
        const expectedTypeName = getTypeName(ValueType),
            foundTypeName = typeOf(value);
        if (typeChecker(ValueType, value)) { return; } // Value matches type
        throw new Error(errorMessageCall(
            {contextName, valueName, value, expectedTypeName, foundTypeName, messageSuffix}
        ));
    },

    /**
     * Gets the error message thrower seeded with passed in errorMessage template call.
     * @function module:fjlErrorThrowing.getErrorIfNotTypesThrower$
     * @param errorMessageCall {Function|errorMessageCall}
     * @param typeChecker {TypeChecker|Function} - Function<Type, value>:Boolean
     * @returns {Function|errorIfNotTypes}
     */
    getErrorIfNotTypesThrower$ = (errorMessageCall, typeChecker = defaultTypeChecker$) => (contextName, valueName, value, ...valueTypes) => {
        const expectedTypeNames = valueTypes.map(getTypeName),
            matchFound = valueTypes.some(ValueType => typeChecker(ValueType, value)),
            foundTypeName = typeOf(value);
        if (matchFound) { return; }
        throw new Error(
            errorMessageCall({
                contextName, valueName, value,
                expectedTypeName: expectedTypeNames, foundTypeName
            })
        );
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
    errorIfNotType$ = getErrorIfNotTypeThrower$(defaultErrorMessageCall),

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
    errorIfNotTypes$ = getErrorIfNotTypesThrower$(defaultErrorMessageCall),

    /**
     * Same as `defaultTypeChecker$` except curried:
     *  "Returns a boolean indicating whether given value matches given type".
     * @curried
     * @function module:fjlErrorThrowing.defaultTypeChecker
     * @param Type {String|Function|Class} - Type name, constructor and/or class.
     * @param value {*}
     * @returns {Boolean}
     */
    defaultTypeChecker = curry(defaultTypeChecker$),

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
    errorIfNotType = curry(errorIfNotType$),

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
    errorIfNotTypes = curry4(errorIfNotTypes$),

    /**
     * Returns a function that can be used to ensure that values are of a given type.
     *   Also throws informative error messages containing the value types, names, expected type names,
     *   etc.
     * @function module:fjlErrorThrowing.getErrorIfNotTypeThrower
     * @param errorMessageCall {Function|errorMessageCall} - Template function (takes an info-object and returns a printed string).
     * @returns {Function|errorIfNotType} - Returns a function with the same signature as `errorIfNotType` though curried.
     */
    getErrorIfNotTypeThrower = errorMessageCall => curry(getErrorIfNotTypeThrower$(errorMessageCall)),

    /**
     * Returns a function that can be used to ensure that a value is of one or more given types.
     *   The returned function is used in cases where informative error messages
     *   containing the value types, names, expected type names, are-required/should-be-used etc.
     * @function module:fjlErrorThrowing.getErrorIfNotTypesThrower
     * @param errorMessageCall {Function|errorMessageCall} - Template function (takes an info-object and returns a printed string).
     * @returns {Function|errorIfNotTypes} - Returns a function with the same signature as `errorIfNotTypes` though curried.
     */
    getErrorIfNotTypesThrower = errorMessageCall => curry4(getErrorIfNotTypesThrower$(errorMessageCall))
;

export default {
    defaultTypeChecker$,
    defaultTypeChecker,
    getTypeName,
    multiTypesToString,
    defaultErrorMessageCall,
    errorIfNotType$,
    errorIfNotType,
    errorIfNotTypes$,
    errorIfNotTypes,
    getErrorIfNotTypeThrower$,
    getErrorIfNotTypeThrower,
    getErrorIfNotTypesThrower$,
    getErrorIfNotTypesThrower
};

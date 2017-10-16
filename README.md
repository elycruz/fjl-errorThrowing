# fjl-errorThrowing
=======
Error throwing helpers.  In particular for when a type doesn't match an expected type (or one of one or more types).

## Install 
`npm install elycruz/fjl-errorThrowing`

## Methods
- `errorIfNotType<contextName, valueName, value, type, messageSuffix=null> {Undefined}` - 
    Curried.  Throws an error when your `value` doesn't match given `type`.
- `errorIfNotTypes<contextName, valueName, value, ...types> : {Undefined}` - 
    Curried.  Throws an error when your `value` doesn't match one of the given `types` passed in.
- `getErrorIfNotTypeThrower<messageTmplFunction> : errorIfNotType` - Gives an `errorIfNotType` 
    function (curried version) that uses the passed message template function to generate the error message string.
- `getErrorIfNotTypesThrower<messageTmplFunction> : errorIfNotTypes` - Gives an `errorIfNotTypes` 
    function (curried version) that uses the passed message template function to generate the error message string.

**Note**: For un-curried versions of the methods above access them with a trailing '$' character;  
    Example `errorIfNotType$(...)`

## Docs
More extensive docs can be found in './jsdocs' folder.
Docs will go up somewhere later. @todo

### Types:
```
// Template Context used by `messageTmplFunction`:
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
```

### Usage 
@todo add more extensive usage examples
```
import {
    getErrorIfNotTypeThrower, // For passing your own error string renderer
    getErrorIfNotTypesThrower, // For passing your own error string renderer
    errorIfNotType,
    errorIfNotTypes
} from 'fjl-errorThrowing';

const errorIfNotFunction = (valueName, value) => 
    errorIfNotType('', valueName, value, Function);
    
function someFunc (fn) {
    errorIfNotFunction(fn); // Will throw well detailed error if passed in value is not a Function
    // Do something here ...
}

someFunc(_ => 1 + 1);  // No error here
someFunc(99);   // Error here type doesn't match expected type.
```

## Tests
`npm test`

## Todos:
- [ ] - Update jsdoc blocks to show proper method signatures.
- [ ] - Add doc blocks to all methods/functions even ones not specified in api.

# fjl-errorThrowing

Error throwing helpers.  In particular for when a type doesn't match an expected type (or one of one or more expected types).

## Install 
`npm install fjl-error-throwing`

## Methods
### `errorIfNotType<type, contextName, valueName, value, messageSuffix=null> {Undefined}` -
    Curried.  Throws an error when your `value` doesn't match given `type`.

### `errorIfNotTypes<types, contextName, valueName, value> : {Undefined}` -
    Curried.  Throws an error when your `value` doesn't match one of the given `types` passed in.

### `getErrorIfNotTypeThrower<messageTmplFunction, typeChecker> : errorIfNotType` - Gives an `errorIfNotType`
    function (curried version) that uses the passed message template function to generate the error message string.

### `getErrorIfNotTypesThrower<messageTmplFunction, typeChecker> : errorIfNotTypes` - Gives an `errorIfNotTypes`
    function (curried version) that uses the passed message template function to generate the error message string.

**Note**: For un-curried versions of the methods above access them with a trailing '$' character;  
    Example `errorIfNotType$(...)`

## Docs
More extensive docs can be found in './jsdocs' folder.
Docs will go up somewhere later. @todo

### Types:
```
TemplateContext     {Object<value, valueName, expectedTypeName, foundTypeName, messageSuffix>}
Type                {String|Function} - Constructor name or constructor itself.
TypesArray          {Array<Type>}
TypeChecker         {Function<Type, Any>}
ErrorMessageCall    {Function<TemplateContext>}
ErrorIfNotType
ErrorIfNotTypes
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

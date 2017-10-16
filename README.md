# fjl-errorThrowing
=======
Error throwing helpers.

## Install 
`npm install elycruz/fjl-errorThrowing`

## Methods
- `errorIfNotType<contextName, valueName, value, type, messageSuffix=null>`
- `errorIfNotTypes<contextName, valueName, value, ...types>`
- `getErrorIfNotTypeThrower<messageTmplFunction> : errorIfNotType` - Allows you to inject a message template.
- `getErrorIfNotTypesThrower<messageTmplFunction> : errorIfNotTypes` - Allows you to inject a message template.

**Note**: For un-curried versions access them with trailing '$';  Example `errorIfNotType$(...)`

### Types:
@todo

### Usage 
@todo add more extensive usage examples
```
import {
    getErrorIfNotTypeThrower,
    getErrorIfNotTypesThrower,
    errorIfNotType,
    errorIfNotTypes
} from 'fjl-errorThrowing';

@todo examples here

```

## Tests
`npm test`

## Todos:
- [ ] - Update jsdoc blocks to show proper method signatures.
- [ ] - Add doc blocks to all methods/functions even ones not specified in api.

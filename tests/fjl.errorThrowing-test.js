import {expect, assert} from 'chai';
import {
    getTypeName,
    multiTypesToString,
    defaultErrorMessageCall,
    getErrorIfNotTypeThrower,
    getErrorIfNotTypesThrower,
    errorIfNotType,
    errorIfNotTypes
} from '../src/fjl.errorThrowing';

const log = console.log.bind(console);

describe ('#fjl.errorThrowing', function () {

    describe ('#getTypeName', function () {
        it ('should return the type name of the assumed type/type-name passed in', function () {
            expect(getTypeName(String)).to.equal('String');
            expect(getTypeName('String')).to.equal('String');
        });
        it ('should throw an error when receiving anything other than a string or ' +
            'a constructor as it\'s first parameter', function () {
            assert.throws(getTypeName, Error);
            assert.throws(_ => getTypeName(null), Error);
        });
    });

    describe ('#multiTypesToString', function () {
        it ('should return all types/type-names in passed in array surrounded by ' +
            'back-tick characters in a string', function () {
            const
                // Test subjects
                someTypeCtors = [Array, String, Function, Object, Boolean],
                someTypeNames = someTypeCtors.map(x => x.name),
                mixedTypeVals = someTypeCtors.concat(someTypeNames),
                mixedTypeNames = someTypeNames.concat(someTypeNames),

                // Expected
                expectedOutput = someTypeCtors.map(x => `\`${x.name}\``).join(', '),

                // Results
                strFromTypeNames = multiTypesToString(someTypeNames),
                strFromTypeCtors = multiTypesToString(someTypeCtors),
                strFromMixed = multiTypesToString(mixedTypeVals);

            // log(expectedOutput, strFromMixed);

            // Ensure outputs are equal
            expect([strFromTypeNames, strFromTypeCtors, strFromMixed]
                .every(x => x.indexOf(expectedOutput) === 0))
                .to.equal(true);

            expect(strFromMixed.split(', ')
                .every((x, ind) => x === `\`${mixedTypeNames[ind]}\``))
                .to.equal(true);

        });

        it ('should return an empty string when receiving an empty array', function () {
            expect(multiTypesToString([])).to.equal('');
        });
    });

    describe ('#defaultErrorMessageCall', function () {
        it ('should return a string when receiving a value', function () {
            expect(typeof defaultErrorMessageCall(0)).to.equal('string');
        });
        it ('should be able to compose it\'s string using props from passed in context', function () {
            const result = defaultErrorMessageCall({
                contextName: 'hello',
                valueName: 'someString',
                value: 'hello world',
                expectedTypeName: 'String',
                foundTypeName: 'String'
            });
            expect(typeof result).to.equal('string');
            expect(result).to.equal(
                    '`hello.someString` is not of one of the types: String.  ' +
                    'Type received: String.  Value: hello world;'
                );
        });
        it ('should throw an error when receiving `null` or `undefined`', function () {
            assert.throws(defaultErrorMessageCall, Error);
            assert.throws(_ => defaultErrorMessageCall(null), Error);
        });
    });

    describe ('#getErrorIfNotTypeThrower', function () {
        it ('should return a function', function () {
            const result = getErrorIfNotTypeThrower(defaultErrorMessageCall)('SomeContext');
            expect(result).to.be.instanceOf(Function);
        });
        it ('It\'s returned function should throw an error when not able to match' +
            'value to passed in type', function () {
            assert.throws(
                _ => getErrorIfNotTypeThrower(defaultErrorMessageCall)('SomeContext')(
                    'someValueName', 'someValue', Array
                ), Error
            );
        });
        it ('It\'s returned function should not throw an error when passed in value ' +
            'matches passed in type', function () {
            expect(getErrorIfNotTypeThrower(defaultErrorMessageCall)('SomeContext')(
                    'someValueName', 'someValue'.split(''), Array
                )
            ).to.equal(undefined); // should return undefined
        });
    });

    describe ('#getErrorIfNotTypesThrower', function () {
        it ('should return a function', function () {
            const result = getErrorIfNotTypesThrower(defaultErrorMessageCall)('SomeContext');
            expect(result).to.be.instanceOf(Function);
        });
        it ('It\'s returned function should throw an error when not able to match' +
            'value to passed in type', function () {
            assert.throws(
                _ => getErrorIfNotTypesThrower(defaultErrorMessageCall)('SomeContext')(
                    'someValueName', 'someValue', Array, Function, Boolean
                ), Error);
        });
        it ('It\'s returned function should not throw an error when passed in value ' +
            'matches passed in type', function () {
            expect(getErrorIfNotTypesThrower(defaultErrorMessageCall)('SomeContext')(
                'someValueName', 'someValue'.split(''), Function, Array, Boolean
            )).to.equal(undefined); // should return undefined
        });
    });

    describe ('#errorIfNotType', function () {
        it ('should return a function', function () {
            const result = errorIfNotType('SomeContext');
            expect(result).to.be.instanceOf(Function);
        });
        it ('It\'s returned function should throw an error when not able to match' +
            'value to passed in type', function () {
            assert.throws(
                _ => errorIfNotType('SomeContext')(
                    'someValueName', 'someValue', Array
                ), Error
            );
        });
        it ('It\'s returned function should not throw an error when passed in value ' +
            'matches passed in type', function () {
            expect(errorIfNotType('SomeContext')(
                'someValueName', 'someValue'.split(''), Array
                )
            ).to.equal(undefined); // should return undefined
        });
    });

    describe ('#errorIfNotTypes', function () {
        it ('should return a function', function () {
            const result = errorIfNotTypes('SomeContext');
            expect(result).to.be.instanceOf(Function);
        });
        it ('It\'s returned function should throw an error when not able to match' +
            'value to passed in type', function () {
            assert.throws(
                _ => errorIfNotTypes('SomeContext')(
                    'someValueName', 'someValue', Array, Function, Boolean
                ), Error);
        });
        it ('It\'s returned function should not throw an error when passed in value ' +
            'matches passed in type', function () {
            expect(errorIfNotTypes('SomeContext')(
                'someValueName', 'someValue'.split(''), Function, Array, Boolean
            )).to.equal(undefined); // should return undefined
        });
    });

});

const
    fjlErrorThrowing = require('../dist/cjs/fjl.errorThrowing'),
    {expect} = require('chai');

describe ('fjl-error-throwing', function () {
    it ('should have reached this point with no errors', function () {
        expect(!!fjlErrorThrowing, true);
    });
});

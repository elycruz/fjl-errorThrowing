import * as fjlErrorThrowing from '../dist/es6-module/fjl.errorThrowing';
import {expect} from 'chai';

describe ('fjl-error-throwing', function () {
    it ('should have reached this point with no errors', function () {
        expect(!!fjlErrorThrowing, true);
    });
});

const assert = require('chai').assert;
const utils = require('../src/index').TW.util;

describe('Test Jets Data Utils', () => {
    it('isEmpty test', () => {
        assert.isTrue(utils.isEmpty({}));
        assert.isFalse(utils.isEmpty({a: false}));
        assert.isTrue(utils.isEmpty(''));
        assert.isFalse(utils.isEmpty('a'));
        assert.isTrue(utils.isEmpty([]));
        assert.isFalse(utils.isEmpty([0, 1, 2]));
    });

    it('digitalTwinContext test', () => {
        const dtCtx = utils.digitalTwinContext({}, []);
        assert.throws(() => dtCtx.digitalTwinClass('pkg1', 'class1'), /doesn't exist in the context/);
    });

    it('isArray test', () => {
       assert.isTrue(utils.isArray([0, 1]));
       assert.isFalse(utils.isArray({}));
        assert.isFalse(utils.isArray(''))
    });
});
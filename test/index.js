const assert = require('chai').assert;
const utils = require('../src/index').TW.util;

describe('Test Jets Data Utils', () => {
    describe('isEmpty', () => {
        it('should return true for empty object', () => { assert.isTrue(utils.isEmpty({})) } );
        it('should return false for non-empty object', () => { assert.isFalse(utils.isEmpty({a: false})) });
        it('should return true for empty string', () => { assert.isTrue(utils.isEmpty('')) });
        it('should return false for non-empty string', () => { assert.isFalse(utils.isEmpty('a')) });
        it('should return true for empty array', () => { assert.isTrue(utils.isEmpty([])) });
        it('should return false for non-empty array', () => { assert.isFalse(utils.isEmpty([0, 1, 2])) });
    });

    describe('digitalTwinContext', () => {
        const models = {
            "{thingswise.com/example}World": {
                "key": "world",
                "primary_domain": {
                    "mangled_name": "thingswise_com__example___World__Primary",
                    "fields": {}
                },
                "secondary_domains": {},
                "operational_domains": {},
                "level": 0
            }
        };
        const streams = [];
        const dtCtx = utils.digitalTwinContext(streams, models);
        it('should throw error for non-existing model', () => {
            assert.throws(() => dtCtx.digitalTwinClass('pkg1', 'class1'), /doesn't exist in the context/);
        });
        it("shouldn't throw error for exising model", () => {dtCtx.digitalTwinClass('thingswise.com/example', 'World')});
        const worldClass = dtCtx.digitalTwinClass('thingswise.com/example', 'World');
        it('addEntryPoint should add entry to streams', () => {
            worldClass.addEntryPoint({}, "input1", "key1");
            assert(streams.length === 1);
        });
        it('getDeviceKey should return key field value', () => {
            assert(worldClass.getDeviceKey({ 'world': 'world1' }) === 'world1')
        });
        it('getScope should return null for World class', () => {
            assert.isNull(worldClass.getScope())
        });
        it('prepareMetadataRequest should return request with key field value', () => {
            const request = worldClass.prepareMetadataRequest([{ 'world': 'world1' }]);
            assert(request[0].key === 'world1');
        });
    });

    describe('isArray', () => {
        it('should return true for an array', () => { assert.isTrue(utils.isArray([0, 1])) });
        it('should return false for an object', () => { assert.isFalse(utils.isArray({})) });
        it('should return false for a string', () => { assert.isFalse(utils.isArray('')) });
    });

    describe('processFieldSpecs', () => {
        it('should return field specs', () => {
            const specs = utils.processFieldSpecs([{
                "name": "InletPressure",
                "desc": " 进口压力",
                "unit": "(MPa)",
                "type": " UINT",
                "min": 0,
                "max": 100,
                "lower": -0.01,
                "policy": "drop-field",
                "jsonField": "values[\"0\"]"
            }], "+0800", 5000, 5000, 'error-message-dump', 'CSV');
            assert.isNotEmpty(specs);
        })
    });
});
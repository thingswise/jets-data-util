// Thingswise Analytic Platform
// Copyright (C) 2015-2018  Thingswise, LLC 
const assert = require('assert');
const du = require('../src/index').TW.util;


describe('data-util', function () {

    beforeEach(function (done) {
        done(null);
    });

    describe('aladb tests', function () {
        const tests = [
            {
                type: 'normal simple inner join test',
                input: {
                    array1: [
                        {'a-1': '11', 'a-2': 'a-12', 'a-3': 'a-13'},
                        {'a-1': '21', 'a-2': 'a-22', 'a-3': 'a-23'},
                        {'a-1': '31', 'a-2': 'a-32', 'a-3': 'a-33'},
                        {'a-1': '41', 'a-2': 'a-42', 'a-3': 'a-43'},
                        {'a-1': '51', 'a-2': 'a-52', 'a-3': 'a-53'},
                        {'a-1': '61', 'a-2': 'a-62', 'a-3': 'a-63'}
                    ],
                    array2: [
                        {'b-1': '11', 'b-2': 'b-12', 'b-3': 'b-13'},
                        {'b-1': '21', 'b-2': 'b-22', 'b-3': 'b-23'},
                        {'b-1': '31', 'b-2': 'b-32', 'b-3': 'b-33'},
                        {'b-1': '41', 'b-2': 'b-42', 'b-3': 'b-43'},
                        {'b-1': '51', 'b-2': 'b-52', 'b-3': 'b-53'},
                        {'b-1': '61', 'b-2': 'b-62', 'b-3': 'b-63'}
                    ],
                },
                output:
                    [
                        {
                            "a-1": "11",
                            "a-2": "a-12",
                            "a-3": "a-13",
                            "ab-2": "b-12",
                            "ab-3": "b-13"
                        },
                        {
                            "a-1": "21",
                            "a-2": "a-22",
                            "a-3": "a-23",
                            "ab-2": "b-22",
                            "ab-3": "b-23"
                        },
                        {
                            "a-1": "31",
                            "a-2": "a-32",
                            "a-3": "a-33",
                            "ab-2": "b-32",
                            "ab-3": "b-33"
                        },
                        {
                            "a-1": "41",
                            "a-2": "a-42",
                            "a-3": "a-43",
                            "ab-2": "b-42",
                            "ab-3": "b-43"
                        },
                        {
                            "a-1": "51",
                            "a-2": "a-52",
                            "a-3": "a-53",
                            "ab-2": "b-52",
                            "ab-3": "b-53"
                        },
                        {
                            "a-1": "61",
                            "a-2": "a-62",
                            "a-3": "a-63",
                            "ab-2": "b-62",
                            "ab-3": "b-63"
                        }
                    ],
                statement: "SELECT a.[a-1], a.[a-2], a.[a-3], b.[b-2] as [ab-2], b.[b-3] as [ab-3] FROM ? a JOIN ? b on a.[a-1]=b.[b-1]",
                timeout: 10000 // for 1,000,000 pure query iteration, it takes 6421ms, i.e. 6us per operation
            },
            {
                type: 'missing a simple inner join test',
                input: {
                    array1: [
                        {'a-1': '11', 'a-2': 'a-12', 'a-3': 'a-13'},
                        {'a-1': '21', 'a-2': 'a-22', 'a-3': 'a-23'},
                        {'a-1': '31', 'a-2': 'a-32', 'a-3': 'a-33'},
                        {'a-1': '41', 'a-2': 'a-42', 'a-3': 'a-43'},
                        {'a-1': '61', 'a-2': 'a-62', 'a-3': 'a-63'}
                    ],
                    array2: [
                        {'b-1': '11', 'b-2': 'b-12', 'b-3': 'b-13'},
                        {'b-1': '21', 'b-2': 'b-22', 'b-3': 'b-23'},
                        {'b-1': '31', 'b-2': 'b-32', 'b-3': 'b-33'},
                        {'b-1': '41', 'b-2': 'b-42', 'b-3': 'b-43'},
                        {'b-1': '51', 'b-2': 'b-52', 'b-3': 'b-53'},
                        {'b-1': '61', 'b-2': 'b-62', 'b-3': 'b-63'}
                    ],
                },
                output:
                    [
                        {
                            "a-1": "11",
                            "a-2": "a-12",
                            "a-3": "a-13",
                            "ab-2": "b-12",
                            "ab-3": "b-13"
                        },
                        {
                            "a-1": "21",
                            "a-2": "a-22",
                            "a-3": "a-23",
                            "ab-2": "b-22",
                            "ab-3": "b-23"
                        },
                        {
                            "a-1": "31",
                            "a-2": "a-32",
                            "a-3": "a-33",
                            "ab-2": "b-32",
                            "ab-3": "b-33"
                        },
                        {
                            "a-1": "41",
                            "a-2": "a-42",
                            "a-3": "a-43",
                            "ab-2": "b-42",
                            "ab-3": "b-43"
                        },
                        {
                            "a-1": "61",
                            "a-2": "a-62",
                            "a-3": "a-63",
                            "ab-2": "b-62",
                            "ab-3": "b-63"
                        }
                    ],
                statement: "SELECT a.[a-1], a.[a-2], a.[a-3], b.[b-2] as [ab-2], b.[b-3] as [ab-3] FROM ? a JOIN ? b on a.[a-1]=b.[b-1]",
                timeout: 10000
            },
            {
                type: 'missing b simple inner join test',
                input: {
                    array1: [
                        {'a-1': '11', 'a-2': 'a-12', 'a-3': 'a-13'},
                        {'a-1': '21', 'a-2': 'a-22', 'a-3': 'a-23'},
                        {'a-1': '31', 'a-2': 'a-32', 'a-3': 'a-33'},
                        {'a-1': '41', 'a-2': 'a-42', 'a-3': 'a-43'},
                        {'a-1': '51', 'a-2': 'a-52', 'a-3': 'a-53'},
                        {'a-1': '61', 'a-2': 'a-62', 'a-3': 'a-63'}
                    ],
                    array2: [
                        {'b-1': '11', 'b-2': 'b-12', 'b-3': 'b-13'},
                        {'b-1': '21', 'b-2': 'b-22', 'b-3': 'b-23'},
                        {'b-1': '31', 'b-2': 'b-32', 'b-3': 'b-33'},
                        {'b-1': '41', 'b-2': 'b-42', 'b-3': 'b-43'},
                        {'b-1': '51', 'b-2': 'b-52', 'b-3': 'b-53'},
                        {'b-1': '71', 'b-2': 'b-62', 'b-3': 'b-63'}
                    ],
                },
                output:
                    [
                        {
                            "a-1": "11",
                            "a-2": "a-12",
                            "a-3": "a-13",
                            "ab-2": "b-12",
                            "ab-3": "b-13"
                        },
                        {
                            "a-1": "21",
                            "a-2": "a-22",
                            "a-3": "a-23",
                            "ab-2": "b-22",
                            "ab-3": "b-23"
                        },
                        {
                            "a-1": "31",
                            "a-2": "a-32",
                            "a-3": "a-33",
                            "ab-2": "b-32",
                            "ab-3": "b-33"
                        },
                        {
                            "a-1": "41",
                            "a-2": "a-42",
                            "a-3": "a-43",
                            "ab-2": "b-42",
                            "ab-3": "b-43"
                        },
                        {
                            "a-1": "51",
                            "a-2": "a-52",
                            "a-3": "a-53",
                            "ab-2": "b-52",
                            "ab-3": "b-53"
                        }
                    ],
                statement: "SELECT a.[a-1], a.[a-2], a.[a-3], b.[b-2] as [ab-2], b.[b-3] as [ab-3] FROM ? a JOIN ? b on a.[a-1]=b.[b-1]",
                timeout: 10000
            },
            {
                type: 'missing a field simple inner join test',
                input: {
                    array1: [
                        {'a-1': '11', 'a-2': 'a-12', 'a-3': 'a-13'},
                        {'a-1': '21', 'a-3': 'a-23'},
                        {'a-1': '31', 'a-2': 'a-32', 'a-3': 'a-33'},
                        {'a-1': '41', 'a-2': 'a-42', 'a-3': 'a-43'},
                        {'a-1': '51', 'a-2': 'a-52', 'a-3': 'a-53'}
                    ],
                    array2: [
                        {'b-1': '11', 'b-2': 'b-12', 'b-3': 'b-13'},
                        {'b-1': '21', 'b-2': 'b-22', 'b-3': 'b-23'},
                        {'b-1': '31', 'b-2': 'b-32', 'b-3': 'b-33'},
                        {'b-1': '41', 'b-2': 'b-42', 'b-3': 'b-43'},
                        {'b-1': '51', 'b-2': 'b-52', 'b-3': 'b-53'}
                    ],
                },
                output:
                    [
                        {
                            "a-1": "11",
                            "a-2": "a-12",
                            "a-3": "a-13",
                            "ab-2": "b-12",
                            "ab-3": "b-13"
                        },
                        {
                            "a-1": "21",
                            "a-2": "-",
                            "a-3": "a-23",
                            "ab-2": "b-22",
                            "ab-3": "b-23"
                        },
                        {
                            "a-1": "31",
                            "a-2": "a-32",
                            "a-3": "a-33",
                            "ab-2": "b-32",
                            "ab-3": "b-33"
                        },
                        {
                            "a-1": "41",
                            "a-2": "a-42",
                            "a-3": "a-43",
                            "ab-2": "b-42",
                            "ab-3": "b-43"
                        },
                        {
                            "a-1": "51",
                            "a-2": "a-52",
                            "a-3": "a-53",
                            "ab-2": "b-52",
                            "ab-3": "b-53"
                        }
                    ],
                statement: "SELECT a.[a-1], COALESCE(a.[a-2], '-') as [a-2], a.[a-3], b.[b-2] as [ab-2], b.[b-3] as [ab-3] FROM ? a JOIN ? b on a.[a-1]=b.[b-1]",
                timeout: 10000
            }
        ];
        const that = this;
        tests.forEach(function (t) {
            if (t.disabled) return true;
            that.timeout(t.timeout);
            it(t.type, function (done) {
                if (t.setup) t.setup();

                const query = du.SQL.compile(t.statement);
                const result = query([t.input.array1, t.input.array2]);
                console.log(JSON.stringify(result, null, 2));
                assert.deepEqual(result, t.output);
                done();
            });
        });
    });
});

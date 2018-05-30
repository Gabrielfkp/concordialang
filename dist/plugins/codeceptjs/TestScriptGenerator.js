"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mustache_1 = require("mustache");
const dedent = require('dedent-js');
/**
 * Generate test scripts for CodeceptJS.
 *
 * Uses [Mustache](https://github.com/janl/mustache.js/) for this purpose.
 */
class TestScriptGenerator {
    constructor(mapper) {
        this.mapper = mapper;
        this.template =
            dedent `// Generated with ❤ by Concordia
        // source: {{{sourceFile}}}
        //
        // THIS IS A GENERATED FILE - MODIFICATIONS CAN BE LOST !

        Feature("{{feature.name}}");

        {{#testcases}}
        Scenario("{{scenario}} | {{name}}", (I) => {
            {{#convertedCommands}}
            {{{.}}}
            {{/convertedCommands}}
        });

        {{/testcases}}`;
    }
    generate(ats) {
        // console.log( 'FROM', ats.sourceFile );
        let obj = Object.assign({}, ats); // spread to do a deep clone
        for (let test of obj.testcases || []) {
            test.convertedCommands = [];
            for (let cmd of test.commands || []) {
                test.convertedCommands.push(this.mapper.map(cmd));
            }
        }
        return mustache_1.render(this.template, obj); // mustache's renderer
    }
}
exports.TestScriptGenerator = TestScriptGenerator;

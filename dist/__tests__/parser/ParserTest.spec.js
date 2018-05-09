"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NodeTypes_1 = require("../../modules/req/NodeTypes");
const Parser_1 = require("../../modules/parser/Parser");
const Options_1 = require("../../modules/app/Options");
const LexerBuilder_1 = require("../../modules/lexer/LexerBuilder");
const path_1 = require("path");
/**
 * @author Thiago Delgado Pinto
 */
describe('ParserTest', () => {
    let parser = new Parser_1.Parser(); // under test
    const options = new Options_1.Options(path_1.resolve(process.cwd(), 'dist/'));
    let lexer = (new LexerBuilder_1.LexerBuilder()).build(options, 'en');
    beforeEach(() => {
        lexer.reset();
    });
    it('detects the language', () => {
        [
            '#language:en'
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.language).toBeDefined();
        expect(doc.language.value).toBe("en");
    });
    it('detect a feature with tags', () => {
        [
            '#language:en',
            '',
            '@important @hello( world )',
            'feature: my feature'
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.feature).toBeDefined();
        expect(doc.feature.name).toBe("my feature");
        expect(doc.feature.tags).toBeDefined();
        expect(doc.feature.tags).toHaveLength(2);
        let tagNames = doc.feature.tags.map(v => v.name);
        expect(tagNames).toEqual(["important", "hello"]);
        expect(doc.feature.tags[1].content).toEqual(["world"]);
    });
    it('detects a background', () => {
        [
            '#language:en',
            '',
            '@important',
            'feature: my feature',
            ' \t',
            'background:',
            '  given something',
            '    and another thing',
            '  when anything happens',
            '    and other thing happens',
            '    but other thing does not happen',
            '  then the result is anything',
            '    and another result could also happen',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.feature).toBeDefined();
        expect(doc.feature.name).toBe("my feature");
        expect(doc.feature.background).toBeDefined();
        expect(doc.feature.background.sentences).toHaveLength(7);
    });
    it('detects a variant background of a feature', () => {
        [
            '#language:en',
            '',
            'feature: my feature',
            ' \t',
            'variant background:',
            '  given something',
            '    and another thing',
            '  when anything happens',
            '    and other thing happens',
            '    but other thing does not happen',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.feature).toBeDefined();
        expect(doc.feature.name).toBe("my feature");
        expect(doc.feature.variantBackground).toBeDefined();
        expect(doc.feature.variantBackground.sentences).toHaveLength(5);
    });
    it('detects a scenario without tags', () => {
        [
            '#language:en',
            '',
            '@important',
            'feature: my feature',
            ' \t',
            'scenario: hello',
            '  given something',
            '    and another thing',
            '  when anything happens',
            '    and other thing happens',
            '    but other thing does not happen',
            '  then the result is anything',
            '    and another result could also happen',
            '',
            'this must be recognized as text'
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.language).toBeDefined();
        expect(doc.language.value).toBe("en");
        expect(doc.feature).toBeDefined();
        expect(doc.feature.name).toBe("my feature");
        expect(doc.feature.scenarios).toBeDefined();
        expect(doc.feature.scenarios).toHaveLength(1);
        expect(doc.feature.scenarios[0].name).toBe("hello");
    });
    it('detects test cases with tags and sentences', () => {
        [
            '#language:en',
            '',
            'Feature: my feature',
            '',
            'Scenario: hello',
            '',
            '@feature( my feature )',
            '@scenario( hello )',
            'Test Case: hello',
            '  Given that I see in the url "/login"',
            '  When I fill <#username> with ""',
            '    And I fill <#password> with "bobp4ss"',
            '    And I click "Enter"',
            '  Then I see "Username must have at least 2 characters."'
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.testCases).toBeDefined();
        expect(doc.testCases).toHaveLength(1);
        let testCase = doc.testCases[0];
        expect(testCase.name).toBe("hello");
        let tagNames = testCase.tags.map(v => v.name);
        expect(tagNames).toEqual(["feature", "scenario"]);
        expect(testCase.sentences).toBeDefined();
        expect(testCase.sentences).toHaveLength(5);
    });
    it('detects a variant background of a scenario', () => {
        [
            '#language:en',
            '',
            'feature: my feature',
            '',
            'Scenario: hello',
            '',
            'Variant Background:',
            '  given something',
            '    and another thing',
            '  when anything happens',
            '    and other thing happens',
            '    but other thing does not happen',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.feature).toBeDefined();
        expect(doc.feature.name).toBe("my feature");
        expect(doc.feature.scenarios).toHaveLength(1);
        expect(doc.feature.scenarios[0].variantBackground).toBeDefined();
        expect(doc.feature.scenarios[0].variantBackground.sentences).toHaveLength(5);
    });
    it('detects a regex block and its regexes', () => {
        [
            '#language:en',
            '',
            'Regular Expressions:',
            '  - "name" is "[A-Za-z .\']{2,50}"',
            '  - "number" is "[0-9]+(\.[0-9]+)?"'
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.regexBlock).not.toBeNull();
        expect(doc.regexBlock.items).toHaveLength(2);
        expect(doc.regexBlock.items[0].nodeType).toBe(NodeTypes_1.NodeTypes.REGEX);
        expect(doc.regexBlock.items[1].nodeType).toBe(NodeTypes_1.NodeTypes.REGEX);
    });
    it('detects a constant block and its constants', () => {
        [
            '#language:en',
            '',
            'Constants:',
            '  - "welcome_msg" is "Welcome!"',
            '  - "pi" is 3.1416'
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.constantBlock).not.toBeNull();
        expect(doc.constantBlock.items).toHaveLength(2);
        expect(doc.constantBlock.items[0].nodeType).toBe(NodeTypes_1.NodeTypes.CONSTANT);
        expect(doc.constantBlock.items[1].nodeType).toBe(NodeTypes_1.NodeTypes.CONSTANT);
    });
    it('detects a database with its properties', () => {
        [
            '#language:en',
            '',
            'Database: My DB',
            '  - type is "mysql"',
            '  - name is "mydb"',
            '  - username is "root"',
            '  - password is ""'
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.databases).toHaveLength(1);
        let db = doc.databases[0];
        expect(db.name).toBe('My DB');
        expect(db.items).toHaveLength(4);
        expect(db.items[0].nodeType).toBe(NodeTypes_1.NodeTypes.DATABASE_PROPERTY);
        expect(db.items[1].nodeType).toBe(NodeTypes_1.NodeTypes.DATABASE_PROPERTY);
        expect(db.items[2].nodeType).toBe(NodeTypes_1.NodeTypes.DATABASE_PROPERTY);
        expect(db.items[3].nodeType).toBe(NodeTypes_1.NodeTypes.DATABASE_PROPERTY);
    });
    it('detects a ui element with its properties', () => {
        [
            '#language:en',
            '',
            'Feature: foo',
            '',
            'UI Element: Full Name',
            '  - id is "#fullname"',
            '  - minlength is 2',
            '    otherwise I must see "Please inform at least two characters at Full Name."',
            '    and I must see {Full Name} with the color "red"',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.feature.uiElements).toHaveLength(1);
        let uie = doc.feature.uiElements[0];
        expect(uie.name).toBe('Full Name');
        expect(uie.items).toHaveLength(2);
        expect(uie.items[0].nodeType).toBe(NodeTypes_1.NodeTypes.UI_PROPERTY);
        expect(uie.items[1].nodeType).toBe(NodeTypes_1.NodeTypes.UI_PROPERTY);
        expect(uie.items[1].otherwiseSentences).toHaveLength(2);
        expect(uie.items[1].otherwiseSentences[0].nodeType == NodeTypes_1.NodeTypes.STEP_OTHERWISE);
        expect(uie.items[1].otherwiseSentences[1].nodeType == NodeTypes_1.NodeTypes.STEP_AND);
    });
    it('detects a global ui element with its properties', () => {
        [
            '#language:en',
            '',
            'Feature: foo',
            '',
            '@global',
            'UI Element: Full Name',
            '  - id is "#fullname"',
            '  - minlength is 2',
            '    otherwise I must see "Please inform at least two characters at Full Name."',
            '    and I must see {Full Name} with the color "red"',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        expect(doc.feature.uiElements).toHaveLength(0);
        expect(doc.uiElements).toHaveLength(1);
        let uie = doc.uiElements[0];
        expect(uie.name).toBe('Full Name');
        expect(uie.items).toHaveLength(2);
        expect(uie.items[0].nodeType).toBe(NodeTypes_1.NodeTypes.UI_PROPERTY);
        expect(uie.items[1].nodeType).toBe(NodeTypes_1.NodeTypes.UI_PROPERTY);
        expect(uie.items[1].otherwiseSentences).toHaveLength(2);
        expect(uie.items[1].otherwiseSentences[0].nodeType == NodeTypes_1.NodeTypes.STEP_OTHERWISE);
        expect(uie.items[1].otherwiseSentences[1].nodeType == NodeTypes_1.NodeTypes.STEP_AND);
    });
    it('detects a database with its properties, and a ui element with is properties', () => {
        [
            '#language:en',
            '',
            'Feature: foo',
            '',
            'Database: My DB',
            '  - type is "mysql"',
            '',
            '@global',
            'UI Element: Full Name',
            '  - id is "#fullname"',
            '',
            'UI Element: Birth Date',
            '  - id is "#birth"',
        ].forEach((val, index) => lexer.addNodeFromLine(val, index + 1));
        let doc = {};
        parser.analyze(lexer.nodes(), doc);
        expect(parser.errors()).toEqual([]);
        // Database
        expect(doc.databases).toHaveLength(1);
        let db = doc.databases[0];
        expect(db.name).toBe('My DB');
        expect(db.items).toHaveLength(1);
        expect(db.items[0].nodeType).toBe(NodeTypes_1.NodeTypes.DATABASE_PROPERTY);
        // Global UI Element
        expect(doc.uiElements).toHaveLength(1);
        let uie = doc.uiElements[0];
        expect(uie.name).toBe('Full Name');
        expect(uie.items).toHaveLength(1);
        expect(uie.items[0].nodeType).toBe(NodeTypes_1.NodeTypes.UI_PROPERTY);
        // Local UI Element
        expect(doc.feature.uiElements).toHaveLength(1);
        let featureUIE = doc.feature.uiElements[0];
        expect(featureUIE.name).toBe('Birth Date');
        expect(featureUIE.items).toHaveLength(1);
        expect(featureUIE.items[0].nodeType).toBe(NodeTypes_1.NodeTypes.UI_PROPERTY);
    });
});
//# sourceMappingURL=ParserTest.spec.js.map
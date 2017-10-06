import { NLPTrainer } from '../../modules/nlp/NLPTrainer';
import { EnglishKeywordDictionary } from '../../modules/dict/EnglishKeywordDictionary';
import { KeywordDictionaryLoader } from '../../modules/dict/KeywordDictionaryLoader';
import { Lexer } from "../../modules/lexer/Lexer";
import { KeywordDictionary } from "../../modules/dict/KeywordDictionary";
import { NodeTypes } from "../../modules/req/NodeTypes";
import { JsonKeywordDictionaryLoader } from '../../modules/dict/JsonKeywordDictionaryLoader';
import { NLP } from '../../modules/nlp/NLP';

/**
 * @author Thiago Delgado Pinto
 */
describe( 'LexerTest', () => {

    let loader: KeywordDictionaryLoader = new JsonKeywordDictionaryLoader(
        { 'en': new EnglishKeywordDictionary() }
    );

    let lexer: Lexer = new Lexer( new NLP(), new NLPTrainer(), 'en', loader ); // under test

    // Helper function
    function assertLineExpectations( lines: any[] ) {
        lines.forEach( ( val, index ) => lexer.addNodeFromLine( val.l, index + 1 ) );
        
        expect( lexer.errors().length ).toBe( 0 );

        let expectations = lines
            .filter( val => val.e !== null ) // only the defined expectations
            .map( val => val.e ); // return the expectations

        lexer.nodes().forEach( ( node, index ) =>
            expect( node.nodeType ).toBe( expectations[ index ] ) ); // same index as the expectation
    }


    beforeEach( () => {
        lexer.reset();
    } );

    it( 'ignores empty lines', () => {
        expect( lexer.addNodeFromLine( '', 1 ) ).toBeFalsy();
    } );

    it( 'detects correctly in english', () => {
        let lines = 
        [
            { l: '#language:en', e: NodeTypes.LANGUAGE },
            { l: '', e: null },
            { l: 'import "somefile"', e: NodeTypes.IMPORT },
            { l: '', e: null },
            { l: '@important', e: NodeTypes.TAG },
            { l: 'Feature: my feature', e: NodeTypes.FEATURE },
            { l: '  As a user', e: NodeTypes.TEXT },
            { l: '  I would to like to login', e: NodeTypes.TEXT },
            { l: '  In order to access the system', e: NodeTypes.TEXT },
            { l: ' \t', e: null },
            { l: 'Scenario: hello', e: NodeTypes.SCENARIO },
            { l: '  Given something', e: NodeTypes.STEP_GIVEN },
            { l: '    and another thing', e: NodeTypes.STEP_AND },
            { l: '  When anything happens', e: NodeTypes.STEP_WHEN },
            { l: '    and other thing happens', e: NodeTypes.STEP_AND },
            { l: '    but other thing does not happen', e: NodeTypes.STEP_AND },
            { l: '  Then the result is anything', e: NodeTypes.STEP_THEN },
            { l: '    and another result could also happen', e: NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Test Case: my test case', e: NodeTypes.TEST_CASE },
            { l: '  Given that I see the url "/login"', e: NodeTypes.STEP_GIVEN },
            { l: '  When I fill "#username" with ""', e: NodeTypes.STEP_WHEN },
            { l: '    And I fill "#password" with "bobp4ss"', e: NodeTypes.STEP_AND },
            { l: '    And I click "Enter"', e: NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Constants:', e: NodeTypes.CONSTANT_BLOCK },
            { l: '  - "msg" is "hello"', e: NodeTypes.CONSTANT },
            { l: '  - "max_name_size" is 60', e: NodeTypes.CONSTANT },
            { l: '  - "pi" is 3.14', e: NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'Regular Expressions:', e: NodeTypes.REGEX_BLOCK },
            { l: '  - "name" is "[A-Za-z]{2,60}"', e: NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'Table: users', e: NodeTypes.TABLE },
            { l: '  | column1 | column2 |', e: NodeTypes.TABLE_ROW },
            { l: '  | value1 | value2 |', e: NodeTypes.TABLE_ROW },            
            { l: '', e: null },            
            { l: 'this must be recognized as text', e: NodeTypes.TEXT }
        ];

        assertLineExpectations( lines );
    } );


    it( 'detects correctly in portuguese', () => {
        let lines = 
        [
            { l: '#language:pt', e: NodeTypes.LANGUAGE },
            { l: '', e: null },
            { l: 'importe "somefile"', e: NodeTypes.IMPORT },
            { l: '', e: null },
            { l: '@importante', e: NodeTypes.TAG },
            { l: 'Característica: my feature', e: NodeTypes.FEATURE },
            { l: '  Como um user', e: NodeTypes.TEXT },
            { l: '  Eu gostaria de to login', e: NodeTypes.TEXT },
            { l: '  Para to access the system', e: NodeTypes.TEXT },            
            { l: ' \t', e: null },
            { l: 'Cenário: hello', e: NodeTypes.SCENARIO },
            { l: '  dado something', e: NodeTypes.STEP_GIVEN },
            { l: '    e another thing', e: NodeTypes.STEP_AND },
            { l: '  quando anything happens', e: NodeTypes.STEP_WHEN },
            { l: '    e other thing happens', e: NodeTypes.STEP_AND },
            { l: '    mas other thing does not happen', e: NodeTypes.STEP_AND },
            { l: '  então the result is anything', e: NodeTypes.STEP_THEN },
            { l: '    e another result could also happen', e: NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Caso de Teste: my test case', e: NodeTypes.TEST_CASE },
            { l: '  Dado que vejo a url "/login"', e: NodeTypes.STEP_GIVEN },
            { l: '  Quando preencho "#username" com ""', e: NodeTypes.STEP_WHEN },
            { l: '  E preencho "#password" com "bobp4ss"', e: NodeTypes.STEP_AND },
            { l: '  E clico "Enter"', e: NodeTypes.STEP_AND },
            { l: '', e: null },
            { l: 'Constantes:', e: NodeTypes.CONSTANT_BLOCK },
            { l: '  - "msg" é "hello"', e: NodeTypes.CONSTANT },
            { l: '  - "max_name_size" é 60', e: NodeTypes.CONSTANT },
            { l: '  - "pi" é 3.14', e: NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'Expressões Regulares:', e: NodeTypes.REGEX_BLOCK },
            { l: '  - "nome" é "[A-Za-z]{2,60}"', e: NodeTypes.CONSTANT },
            { l: '', e: null },
            { l: 'Tabela: users', e: NodeTypes.TABLE },
            { l: '  | column1 | column2 |', e: NodeTypes.TABLE_ROW },
            { l: '  | value1 | value2 |', e: NodeTypes.TABLE_ROW },
            { l: '', e: null },
            { l: 'isso must be recognized as text', e: NodeTypes.TEXT }
        ];

        assertLineExpectations( lines );
    } );

} );
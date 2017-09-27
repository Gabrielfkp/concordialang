import { Expressions } from '../../modules/req/Expressions';
import { NodeTypes } from "../../modules/req/NodeTypes";
import { RegexLexer } from "../../modules/lexer/RegexLexer";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'RegexLexerTest', () => {
    
    let words = [ 'is' ];
    let keyword = NodeTypes.REGEX;
    let lexer = new RegexLexer( words ); // under test

    // IMPORTANT: Since the lexer under test inherits from another lexer and 
    // there are tests for the parent class, few additional tests are necessary.    

    it( 'detects correctly with a text value', () => {
        let value = '/[0-9]/';
        let line = `- "foo" is "${value}"`;
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                content: value
            }
        );        
    } );

    it( 'detects correctly even with the regular expression has quotes', () => {
        let line = `- "foo" is "\\"bar"`;
        let r = lexer.analyze( line, 1 );
        expect( r ).not.toBeNull();
        expect( r.nodes[ 0 ] ).toEqual(
            {
                nodeType: keyword,
                location: { line: 1, column: 1 },
                name: "foo",
                content: '\\"bar'
            }
        );        
    } );    

} );
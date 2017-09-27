import { TokenTypes } from '../../modules/req/TokenTypes';
import { StepThenLexer } from "../../modules/lexer/StepThenLexer";

/**
 * @author Thiago Delgado Pinto
 */
describe( 'StepThenLexerTest', () => {

    let words = [ 'then' ];
    let lexer = new StepThenLexer( words );
    // IMPORTANT: This lexer inherits from StartingKeywordLexer
    // and StartingKeywordLexerTest checks many important aspects 
    // that does not need to be repeated here.

    it( 'detects correctly', () => {
        let line = "  \t  \t Then \t the world and everybody on it \t";
        let r = lexer.analyze( line, 1 );
        expect( r ).toBeDefined();
        let node = r.nodes[ 0 ];
        // Location
        expect( node.location.line ).toBe( 1 );
        expect( node.location.column ).toBe( 8 );
        // Keyword
        expect( node.keyword ).toBe( TokenTypes.STEP_THEN );
        // Content
        expect( node.content ).toBe( 'the world and everybody on it' );
    } );

} );
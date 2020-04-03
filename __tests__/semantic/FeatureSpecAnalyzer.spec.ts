import { resolve } from 'path';

import { Document } from '../../modules/ast/Document';
import { AugmentedSpec } from '../../modules/req/AugmentedSpec';
import { FeatureSSA } from '../../modules/semantic/FeatureSSA';
import { Parser } from '../../modules/parser/Parser';
import { Lexer } from '../../modules/lexer/Lexer';
import { Options } from '../../modules/app/Options';
import { LexerBuilder } from '../../modules/lexer/LexerBuilder';
import { SpecFilter } from '../../modules/selection/SpecFilter';

describe( 'FeatureSpecAnalyzer', () => {

    const analyzer = new FeatureSSA(); // under test

    let parser = new Parser();
    const options: Options = new Options( resolve( process.cwd(), 'dist/' ) );
    let lexer: Lexer = ( new LexerBuilder() ).build( options, 'en' );

    beforeEach( () => {
        lexer.reset();
    } );

    it( 'does not criticize when everything is ok', () => {
        [
            'feature: my feature 1',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc1: Document = {};
        parser.analyze( lexer.nodes(), doc1 );

        lexer.reset();

        [
            'feature: my feature 2',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );
        let doc2: Document = {};
        parser.analyze( lexer.nodes(), doc2 );


        let spec = new AugmentedSpec( '.' );
        spec.addDocument( doc1 );
        spec.addDocument( doc2 );
        const graph = ( new SpecFilter( spec ) ).graph();

        let errors = [];
        analyzer.analyze( graph, spec, errors );
        expect( errors ).toHaveLength( 0 );
    } );


    it( 'criticizes duplicated names', () => {

        [
            'feature: my feature 1',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );

        const doc1: Document = {
            fileInfo: {
                path: 'f1.feature',
                hash: ''
            }
        };
        parser.analyze( lexer.nodes(), doc1 );

        lexer.reset();

        [
            'feature: my feature 1',
        ].forEach( ( val, index ) => lexer.addNodeFromLine( val, index + 1 ) );

        const doc2: Document = {
            fileInfo: {
                path: 'f2.feature',
                hash: ''
            }
        };

        parser.analyze( lexer.nodes(), doc2 );


        let spec = new AugmentedSpec( '.' );
        spec.addDocument( doc1 );
        spec.addDocument( doc2 );
        const graph = ( new SpecFilter( spec ) ).graph();

        let errors = [];
        analyzer.analyze( graph, spec, errors );
        expect( errors ).toHaveLength( 1 );
        expect( errors[ 0 ].message ).toMatch( /duplicated/ui );
    } );

} );
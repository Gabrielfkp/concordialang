import { TCGen } from "../../modules/testcase/TCGen";
import { SimpleCompiler } from "../../modules/util/SimpleCompiler";
import { Document, FileInfo, Variant, TestCase } from "../../modules/ast";
import { AugmentedSpec } from "../../modules/req/AugmentedSpec";
import { LocatedException } from "../../modules/error/LocatedException";
import { PreTestCaseGenerator, GenContext } from "../../modules/testscenario/PreTestCaseGenerator";
import { SpecFilter } from "../../modules/selection/SpecFilter";
import { BatchSpecificationAnalyzer } from "../../modules/semantic/BatchSpecificationAnalyzer";
import { TestPlanner } from "../../modules/testcase/TestPlanner";
import { JustOneInvalidMix } from "../../modules/testcase/DataTestCaseMix";
import { IndexOfEachStrategy } from "../../modules/selection/CombinationStrategy";
import { TestScenario } from "../../modules/testscenario/TestScenario";
import { LongLimits } from "../../modules/testdata/limits/LongLimits";

describe( 'TCGenTest', () => {

    let gen: TCGen; // under test

    const LANGUAGE = 'pt';
    const SEED = 'concordia';
    let preTCGen: PreTestCaseGenerator;
    let cp: SimpleCompiler;


    beforeEach( () => {
        cp = new SimpleCompiler( LANGUAGE );

        preTCGen = new PreTestCaseGenerator(
            cp.nlpRec.variantSentenceRec,
            cp.langLoader,
            cp.language,
            SEED
        );

        gen = new TCGen( preTCGen );
    } );

    afterEach( () => {
        cp = null;
        preTCGen = null;
        gen = null;
    } );


    it( 'generates invalid values and oracles based on UI Element properties', async () => {

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho {A}',
                '    E eu preencho <b> com "foo"',
                ' Então eu devo ver "x"',
                'Elemento de IU: A',
                ' - valor mínimo é 5',
                '   Caso contrário, eu devo ver a mensagem "bar"' // <<< oracle
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [],
        warnings: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        const testPlanMakers: TestPlanner[] = [
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanner( new JustOneInvalidMix(), new IndexOfEachStrategy( 0 ), SEED )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];

        let ts = new TestScenario();
        ts.steps = variant1.sentences;

        const testCases = await gen.generate( ts, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( testCases ).toHaveLength( 1 );

        const tc: TestCase = testCases[ 0 ];

        // Content + Comment
        const lines = tc.sentences.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
        const value1 = LongLimits.MIN;
        const comment = '# {A}, inválido: menor valor aplicável';

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com ' + value1 + ' ' + comment,
                'E eu preencho <b> com "foo"',
                'Então eu devo ver a mensagem "bar" # de <a>' // << Then replaced with the oracle
            ]
        );

        expect( tc.shouldFail ).toBeFalsy();

    } );



    it( 'indicates that should fail when no Otherwise is declared and has Then sentence withou state', async () => {

        let spec = new AugmentedSpec( '.' );

        let doc1: Document = cp.addToSpec( spec,
            [
                '#language:pt',
                'Feature: Feature 1',
                'Scenario: Foo',
                'Variant: Foo',
                '  Quando eu preencho {A}',
                '    E eu preencho <b> com "foo"',
                ' Então eu devo ver "x"',
                'Elemento de IU: A',
                ' - valor mínimo é 5'
            ],
            { path: 'doc1.feature', hash: 'doc1' } as FileInfo
        );

        const specFilter = new SpecFilter( spec );
        const batchSpecAnalyzer = new BatchSpecificationAnalyzer();
        let errors: LocatedException[] = [],
        warnings: LocatedException[] = [];

        await batchSpecAnalyzer.analyze( specFilter.graph(), spec, errors );

        // expect( doc1.fileErrors ).toEqual( [] );
        // expect( doc2.fileErrors ).toEqual( [] );

        const testPlanMakers: TestPlanner[] = [
            // new TestPlanMaker( new AllValidMix(), new SingleRandomOfEachStrategy( SEED ) )
            new TestPlanner( new JustOneInvalidMix(), new IndexOfEachStrategy( 0 ), SEED )
        ];

        const ctx1 = new GenContext( spec, doc1, errors, warnings );
        const variant1: Variant = doc1.feature.scenarios[ 0 ].variants[ 0 ];

        let ts = new TestScenario();
        ts.steps = variant1.sentences;

        const testCases = await gen.generate( ts, ctx1, testPlanMakers );
        expect( errors ).toHaveLength( 0 );
        expect( testCases ).toHaveLength( 1 );

        const tc: TestCase = testCases[ 0 ];

        // Content + Comment
        const lines = tc.sentences.map( s => s.content + ( ! s.comment ? '' : ' #' + s.comment ) );
        const value1 = LongLimits.MIN;
        const comment = '# {A}, inválido: menor valor aplicável';

        expect( lines ).toEqual(
            [
                'Quando eu preencho <a> com ' + value1 + ' ' + comment,
                'E eu preencho <b> com "foo"',
                'Então eu devo ver "x"' // << same Then statement
            ]
        );

        expect( tc.shouldFail ).toBeTruthy();

        // ---

        // let docGen = new TCDocGen( '.testcase' );
        // let newDoc = docGen.generate( doc1, testCases );
        // let linesGen = new TestCaseFileGenerator( cp.langLoader, cp.language );
        // let fileLines = linesGen.createLinesFromDoc( newDoc, errors );
        // console.log( fileLines );

    } );

} );
import { TestScriptGenerationOptions } from '../../../modules/ts/TestScriptGeneration';
import { TestCaseGenerationOptions } from '../../../modules/tc/TestCaseOptions';
import { AbstractTestScript } from '../../../modules/ts/AbstractTestScript';
import { TestScriptExecutionOptions } from '../../../modules/ts/TestScriptExecution';
import { CodeceptJS } from "../../../plugins/codeceptjs/CodeceptJS";

//import * as fs from 'fs';
import { fs, vol } from 'memfs';

/**
 * @author Matheus Eller Fagundes
 * @author Thiago Delgado Pinto
 */
describe( 'CodeceptJSTest', () => {

    let plugin: CodeceptJS = new CodeceptJS( fs ); // under test

    // @see https://facebook.github.io/jest/docs/en/asynchronous.html#promises
    it( 'generate files with the right file names', () => {

        let expectedFileNames: string[] = [
            'add-product-to-the-shopping-cart.js',
            'remove-product-from-the-shopping-cart.js'
        ];

        const outputDir = './output';
        const file1 = expectedFileNames[ 0 ];
        const file2 = expectedFileNames[ 1 ];
        const json = {
            file1: '1',
            file2: '2'
        };
        vol.fromJSON( json, '.' );

        let scripts: AbstractTestScript[] = [
            {
                feature: { name: 'Add Product to the Shopping Cart' },
                scenarios: [
                    { name: 'Scenario 1' }
                ],
                testcases: []
            } as AbstractTestScript,

            {
                feature: { name: 'Remove Product from the Shopping Cart' },
                scenarios: [
                    { name: 'Scenario 1' }
                ],
                testcases: []
            } as AbstractTestScript,            
        ];

        let options: TestScriptGenerationOptions = new TestScriptGenerationOptions();
        options.scriptDir = outputDir;

        let promises: Promise< string >[] = plugin.generateCode( scripts, options );
        return Promise.all( promises )
            .then( ( fileNames: string[] ) => {
                expect( fileNames ).toEqual( expectedFileNames );
            } );
    } );
    
    
    it( 'should execute code', () => {
        let options: TestScriptExecutionOptions = new TestScriptExecutionOptions();
        options.resultDir = './output';
        plugin.executeCode( options );
    } );
    
} );

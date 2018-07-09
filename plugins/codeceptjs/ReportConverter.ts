import { TestMethodResult, TestScriptExecutionResult, TestSuiteResult } from '../../modules/testscript/TestScriptExecution';
import { DefaultInstrumentationReader } from '../../modules/plugin/InstrumentationReader';
import { Location } from '../../modules/ast/Location';
import * as fs from 'fs';
import * as readline from 'readline';
import { promisify } from 'util';
import { FileInstrumentationReader } from '../../modules/plugin/FileInstrumentationReader';

/**
 * Converts a CodeceptJS execution result to Concordia's format.
 */
export class ReportConverter {

    private readonly _instrumentator: FileInstrumentationReader;

    constructor( private _fs: any = fs, private _encoding = 'utf-8' ) {
        this._instrumentator = new FileInstrumentationReader(
            new DefaultInstrumentationReader(), _fs, _encoding );
    }

    /**
     * Reads a execution result file and converts it to the expected Concordia's format.
     *
     * @param resultFilePath Path to a file with the test results of CodeceptJS.
     * @param pluginConfigFilePath Path to the plugin configuration file.
     */
    public async convertFrom(
        resultFilePath: string,
        pluginConfigFilePath: string
    ): Promise< TestScriptExecutionResult > {

        const source: any = await this.readJsonFile( resultFilePath );

        let pluginConfig = {};
        try {
            pluginConfig = await this.readJsonFile( pluginConfigFilePath );
        } catch ( e ) {
            // will stay with empty plug-in info
        }

        let result: TestScriptExecutionResult = new TestScriptExecutionResult();

        source.resultFilePath = resultFilePath;
        this.fillMetadata( source, result );
        this.fillStatus( source, result );
        await this.fillResults( source, result );
        this.fillPluginInfo( pluginConfig, result );

        return result;
    }

    /**
     * Fills test result metadata.
     *
     * @param source The CodeceptJS' result in JSON format.
     * @param result The Concordia's result to fill.
     */
    private fillMetadata( source: any, result: TestScriptExecutionResult ): void {
        result.sourceFile = source.resultFilePath;
    }

    /**
     * Fills test result status.
     *
     * @param source The CodeceptJS' result in JSON format.
     * @param result The Concordia's result to fill.
     */
    private fillStatus( source: any, result: TestScriptExecutionResult ): void {
        result.started = source.stats.start;
        result.finished = source.stats.end;
        result.durationMs = source.stats.duration;

        // Because of a bug in CodeceptJS JSON's counting
        let failed = source.stats.failures;
        if ( failed === source.stats.tests && source.stats.passes > 0 ) {
            failed -= source.stats.passes;
        }

        result.total = {
            tests: source.stats.tests,
            passed: source.stats.passes,
            failed: failed,
            skipped: 0,
            error: 0,
            unknown: 0
        };
    }

    /**
     * Fills plugin's info.
     *
     * @param source The CodeceptJS plugin configuration.
     * @param result The Concordia's result to fill.
     */
    private fillPluginInfo( pluginConfig: any, result: TestScriptExecutionResult ): void {
        result.plugin = {
            description: pluginConfig.description,
            name: pluginConfig.name,
            targets: pluginConfig.targets,
            version: pluginConfig.version
        };
    }

    /**
     * Fills execution results.
     *
     * @param source The CodeceptJS' result in JSON format.
     * @param result The Concordia's result to fill.
     */
    private async fillResults( source: any, result: TestScriptExecutionResult ): Promise< void > {

        if ( ! result.results ) {
            result.results = [];
        }

        // Creates a TestMethodResult for each CodeceptJS' test method report.
        for ( let method of source.tests || [] ) {

            let testMethodResult: TestMethodResult = new TestMethodResult();
            testMethodResult.name = method.title;
            testMethodResult.status = this.isObjectEmpty( method.err ) ? 'passed' : 'failed';
            testMethodResult.durationMs = method.duration;

            if ( 'failed' === testMethodResult.status ) {

                const scriptLocation: Location = this.extractScriptLocationFromStackTrace( method.err.stack );

                let specLocation: Location;
                if ( !! scriptLocation ) {
                    specLocation = await this.extractSpecLocationFromScriptLocation( scriptLocation );
                }

                testMethodResult.exception = {
                    type: ! method.err.params ? undefined : method.err.params.type,
                    message: method.err.message,
                    stackTrace: method.err.stack,

                    scriptLocation: scriptLocation,
                    specLocation: specLocation
                };
            }

            // Pushes a TestMethodResult to its correspondent TestSuiteResult.
            const suiteName: string = method.fullTitle.indexOf( ':' ) >= 0
                ? method.fullTitle.split( ':' )[0] //fullTitle format is 'feature: test'
                : method.fullTitle;

            this.pushTestMethodResult( result, testMethodResult, suiteName );
        }
    }

    /**
     * Pushes a Test Method Result to a Test Script Execution Result.
     *
     * @param result The Concordia's result to fill.
     * @param testMethodResult TestMethodResult to be pushed.
     * @param suiteName Test Suite Result name.
     */
    private pushTestMethodResult(
        result: TestScriptExecutionResult,
        testMethodResult: TestMethodResult,
        suiteName: string
    ): void {

        // Finds the correspondent test suite.
        let testSuiteResult: TestSuiteResult =
            result.results.find( ( suite: TestSuiteResult ) => suite.suite === suiteName );

        // If the test suite doesn't exists, creates a new one.
        if ( ! testSuiteResult ) {
            testSuiteResult = new TestSuiteResult();
            testSuiteResult.suite = suiteName;
            testSuiteResult.methods = [];
            result.results.push( testSuiteResult );
        }

        // Finally, pushes the method result to the correct suite.
        testSuiteResult.methods.push( testMethodResult );
    }

    /**
     * Verifies if a object is empty.
     * @param obj Object to be verified.
     */
    private isObjectEmpty( obj: object ): boolean {
        return Object.keys( obj ).length === 0 && obj.constructor === Object;
    }

    /**
     * Extract script location from a stack trace.
     *
     * @param stackTrace Stack trace.
     */
    public extractScriptLocationFromStackTrace( stackTrace: string ): Location | null {

        // Extract file name and line, e.g., 'path/to/file.js:15:7'
        const regex = /(?:\()([^(]+.js)\:(\d+)\:(\d+)(?:\))/gm;
        const r = regex.exec( stackTrace );
        if ( ! r || ! r[ 1 ] ) {
            return null;
        }
        const [ _, path, lin, col ] = r;

        return {
            filePath: path,
            line: parseInt( lin ),
            column: parseInt( col )
        };
    }

    /**
     * Extract specification location from a script file.
     *
     * @param scriptFile Script file.
     */
    private async extractSpecLocationFromScriptLocation( scriptLoc: Location ): Promise< Location > {
        return await this._instrumentator.retrieveSpecLocation( scriptLoc );
    }

    private async readJsonFile( path: string ): Promise< any > {
        const readFileAsync = promisify( this._fs.readFile );
        const content = await readFileAsync( path, this._encoding );
        return JSON.parse( content.toString() );
    }

}

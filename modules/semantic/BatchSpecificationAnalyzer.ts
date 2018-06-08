import { TableSSA } from './TableSSA';
import { DatabaseSSA } from './DatabaseSSA';
import { FeatureSSA } from './FeatureSSA';
import { ImportSSA } from './ImportSSA';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';
import { Spec } from "../ast/Spec";
import { TestCaseSSA } from './TestCaseSSA';
import { SemanticException } from './SemanticException';
import { ConstantSSA } from './ConstantSSA';
import { UIElementSSA } from './UIElementSSA';
import Graph = require( 'graph.js/dist/graph.full.js' );
import { Options } from '../app/Options';
import { BeforeAllSSA } from './BeforeAllSSA';
import { AfterAllSSA } from './AfterAllSSA';

/**
 * Executes many semantic analyzers to a specification in batch.
 *
 * @author Thiago Delgado Pinto
 */
export class BatchSpecificationAnalyzer extends SpecificationAnalyzer {

    private readonly _analyzers: SpecificationAnalyzer[];

    constructor() {
        super();

        // Order is relevant!
        this._analyzers = [
            new ImportSSA(),
            new UIElementSSA(), // needed before other global declarations
            new FeatureSSA(),
            new ConstantSSA(),
            new DatabaseSSA(),
            new TableSSA(),
            new TestCaseSSA(), // TODO: change the SSA to receive a dictionary loader, according to the analyzed doc
            new BeforeAllSSA(),
            new AfterAllSSA()
        ];
    }

    public async analyze(
        graph: Graph,
        spec: Spec,
        errors: SemanticException[]
    ): Promise< void > {

        // Important to guarantee that all documents are mapped
        spec.clearCache();
        spec.mapAllDocuments();

        for ( let analyzer of this._analyzers ) {
            await analyzer.analyze( graph, spec, errors );
        }
    }

}
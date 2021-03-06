import Graph = require('graph.js/dist/graph.full.js');

import { AugmentedSpec } from '../req/AugmentedSpec';
import { SemanticException } from './SemanticException';
import { SpecificationAnalyzer } from './SpecificationAnalyzer';

/**
 * Executes semantic analysis of Tables in a specification.
 *
 * Checkings:
 * - duplicated names
 *
 * @author Thiago Delgado Pinto
 */
export class TableSSA extends SpecificationAnalyzer {

     /** @inheritDoc */
    public async analyze(
        graph: Graph,
        spec: AugmentedSpec,
        errors: SemanticException[]
    ): Promise< void > {
        this._checker.checkDuplicatedNamedNodes( spec.tables(), errors, 'table' );
    }

}
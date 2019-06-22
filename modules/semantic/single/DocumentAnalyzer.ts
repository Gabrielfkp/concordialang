import { Document } from '../../ast/Document';
import { SemanticException } from '../SemanticException';

/**
 * Document analyzer.
 *
 * @author Thiago Delgado Pinto
 */
export interface DocumentAnalyzer {

    analyze( doc: Document, errors: SemanticException[] );

}
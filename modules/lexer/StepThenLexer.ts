import { StepThen } from "../ast/Step";
import { NodeTypes } from "../req/NodeTypes";
import { StartingKeywordLexer } from './StartingKeywordLexer';

/**
 * Detects a Then node.
 *
 * @author Thiago Delgado Pinto
 */
export class StepThenLexer extends StartingKeywordLexer< StepThen > {

    constructor( words: string[] ) {
        super( words, NodeTypes.STEP_THEN );
    }

    /** @inheritDoc */
    suggestedNextNodeTypes(): string[] {
        return [ NodeTypes.STEP_AND ];
    }

}
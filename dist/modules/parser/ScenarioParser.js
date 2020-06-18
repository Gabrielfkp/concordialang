"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SyntacticException_1 = require("./SyntacticException");
/**
 * Scenario parser
 *
 * @author Thiago Delgado Pinto
 */
class ScenarioParser {
    /** @inheritDoc */
    analyze(node, context, it, errors) {
        // Checks if a feature has been declared before it
        if (!context.doc.feature) {
            let e = new SyntacticException_1.SyntacticException('A scenario must be declared after a feature.', node.location);
            errors.push(e);
            return false;
        }
        // Prepare the feature to receive the scenario
        let feature = context.doc.feature;
        if (!feature.scenarios) {
            feature.scenarios = [];
        }
        // Adds the scenario to the feature
        feature.scenarios.push(node);
        // Adjust the context
        context.resetInValues();
        context.inScenario = true;
        context.currentScenario = node;
        return true;
    }
}
exports.ScenarioParser = ScenarioParser;

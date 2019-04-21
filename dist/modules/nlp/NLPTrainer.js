"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const deepcopy = require("deepcopy");
const TypeChecking_1 = require("../util/TypeChecking");
const NLPTrainingDataConversor_1 = require("./NLPTrainingDataConversor");
const BaseTrainingExamples_1 = require("./BaseTrainingExamples");
/**
 * NLP trainer.
 *
 * @author Thiago Delgado Pinto
 */
class NLPTrainer {
    constructor(_langLoader) {
        this._langLoader = _langLoader;
        this.LANGUAGE_INTENT_SEPARATOR = ':';
        this.ALL_INTENTS = '*';
        this._trainedIntents = [];
    }
    canBeTrained(language) {
        return this._langLoader.has(language);
    }
    isIntentTrained(language, intent) {
        return this._trainedIntents.indexOf(this.joinLanguageAndIntent(language, intent)) >= 0
            || this._trainedIntents.indexOf(this.joinLanguageAndIntent(language, this.ALL_INTENTS)) >= 0;
    }
    joinLanguageAndIntent(language, intent) {
        return (language + this.LANGUAGE_INTENT_SEPARATOR + (intent || this.ALL_INTENTS))
            .toLowerCase();
    }
    trainNLP(nlp, language, intentNameFilter) {
        if (!this.canBeTrained(language)) {
            return false;
        }
        if (this.isIntentTrained(language, intentNameFilter)) {
            return true;
        }
        let content = deepcopy(this._langLoader.load(language));
        // Add base training sentences;
        if (TypeChecking_1.isDefined(intentNameFilter)) {
            // console.log( 'INTENT DEFINED:', intentNameFilter );
            let example = content.training.find(ex => ex.intent === intentNameFilter);
            const baseIntentExample = BaseTrainingExamples_1.BASE_TRAINING_EXAMPLES.find(ex => ex.intent === intentNameFilter);
            if (TypeChecking_1.isDefined(example) && TypeChecking_1.isDefined(baseIntentExample)) {
                // console.log( intentNameFilter );
                // console.log( 'BEFORE' );
                // console.log( example.sentences.length );
                // Concat with base training sentences
                example.sentences = baseIntentExample.sentences.concat(example.sentences);
                // console.log( 'AFTER' );
                // console.log( example.sentences.length );
            }
        }
        else {
            // console.log( 'INTENT NOT DEFINED' );
            // Concat with base training sentences
            for (const baseEx of BaseTrainingExamples_1.BASE_TRAINING_EXAMPLES) {
                if (this.isIntentTrained(language, baseEx.intent)) {
                    // console.log( '-> base intent already trained:', baseEx.intent );
                    continue;
                }
                // console.log( '-> base intent untrained:', baseEx.intent );
                let example = content.training.find(ex => ex.intent === baseEx.intent);
                if (!example) {
                    continue;
                }
                // console.log( baseEx.intent );
                // console.log( 'BEFORE' );
                // console.log( example.sentences.length );
                example.sentences = baseEx.sentences.concat(example.sentences);
                // console.log( 'AFTER' );
                // console.log( example.sentences.length );
                this._trainedIntents.push(this.joinLanguageAndIntent(language, baseEx.intent));
            }
        }
        // Copy "ui_element_type" from "testcase" to "ui"
        if (TypeChecking_1.isDefined(content.nlp["testcase"])
            && TypeChecking_1.isDefined(content.nlp["testcase"]["ui_element_type"])
            && TypeChecking_1.isDefined(content.nlp["ui"]
                && !TypeChecking_1.isDefined(content.nlp["ui"]["ui_element_type"]))) {
            content.nlp["ui"]["ui_element_type"] = content.nlp["testcase"]["ui_element_type"];
        }
        let conversor = new NLPTrainingDataConversor_1.NLPTrainingDataConversor();
        let converted = conversor.convert(content.nlp || {}, content.training || []);
        nlp.train(language, converted, intentNameFilter);
        return true;
    }
}
exports.NLPTrainer = NLPTrainer;

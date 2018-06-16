"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const NLPTrainingDataConversor_1 = require("../../modules/nlp/NLPTrainingDataConversor");
const NLP_1 = require("../../modules/nlp/NLP");
const Entities_1 = require("../../modules/nlp/Entities");
/**
 * @author Thiago Delgado Pinto
 */
describe('NLPTest', () => {
    let nlp; // under test
    function fakeTrainingData() {
        let conversor = new NLPTrainingDataConversor_1.NLPTrainingDataConversor();
        let data = conversor.convert({}, []);
        return data;
    }
    function recog(text, expected, expectedEntity, debug = false) {
        let r = nlp.recognize('en', text);
        if (debug) {
            console.log('text:', '"' + text + '"', '\nexpected:', '"' + expected + '"', '\nresult:', r);
        }
        if (null === expected) {
            expect(
            // not recognized
            null === r
                // or not a constant
                || !r.entities.find(e => e.entity === expectedEntity)).toBeTruthy();
        }
        else {
            expect(r.entities).toHaveLength(1);
            expect(r.entities[0].entity).toBe(expectedEntity);
            expect(r.entities[0].value).toBe(expected);
        }
        return r;
    }
    beforeEach(() => {
        nlp = new NLP_1.NLP();
    });
    it('starts untrained in any language', () => {
        expect(nlp.isTrained('en')).toBeFalsy();
        expect(nlp.isTrained('pt')).toBeFalsy();
    });
    it('can be trained in a language', () => {
        nlp.train('en', fakeTrainingData());
        expect(nlp.isTrained('en')).toBeTruthy();
        nlp.train('pt', fakeTrainingData());
        expect(nlp.isTrained('pt')).toBeTruthy();
    });
    it('cannot recognize any entity if not trained', () => {
        expect(nlp.isTrained('en')).toBeFalsy();
        let r = nlp.recognize('en', ' "hello" ');
        expect(r.entities).toHaveLength(0);
    });
    describe('simple entities', () => {
        beforeEach(() => {
            nlp.train('en', fakeTrainingData());
        });
        describe('value', () => {
            function recogValue(text, expected, debug = false) {
                return recog(text, expected, Entities_1.Entities.VALUE, debug);
            }
            it('between quotes', () => {
                recogValue(' "foo" ', 'foo');
            });
            it('with escaped quotes', () => {
                recogValue(' "foo and \\\"bar\\\"" ', 'foo and \\\"bar\\\"');
            });
            // documenting a current limitation
            it('still does not recognize a string that ends with escaped backslash', () => {
                recogValue(' "this is not recognized \\"', null);
            });
            it('more than one value', () => {
                let r = nlp.recognize('en', ' prop is "foo" or "bar" ');
                expect(r.entities).toHaveLength(2);
                expect(r.entities[0].entity).toBe(Entities_1.Entities.VALUE);
                expect(r.entities[0].value).toBe('foo');
                expect(r.entities[1].entity).toBe(Entities_1.Entities.VALUE);
                expect(r.entities[1].value).toBe('bar');
            });
        });
        describe('number', () => {
            function recogNumber(text, expected, debug = false) {
                return recog(text, expected, Entities_1.Entities.NUMBER, debug);
            }
            it('positive integer', () => {
                recogNumber(' 3 ', '3');
            });
            it('positive double', () => {
                recogNumber(' 3.14159 ', '3.14159');
            });
            it('negative integer', () => {
                recogNumber(' -3 ', '-3');
            });
            it('negative double', () => {
                recogNumber(' -3.14159 ', '-3.14159');
            });
            describe('does not recognize inside a string', () => {
                it('positive integer', () => {
                    recogNumber(' "3" ', null);
                });
                it('positive integer with spaces around', () => {
                    recogNumber(' " 3 " ', null);
                });
                it('positive double', () => {
                    recogNumber(' "3.14159" ', null);
                });
                it('positive double with spaces around', () => {
                    recogNumber(' " 3.14159 " ', null);
                });
                it('negative integer', () => {
                    recogNumber(' "-3" ', null);
                });
                it('negative double', () => {
                    recogNumber(' "-3.14159" ', null);
                });
            });
        });
        describe('ui_element', () => {
            function recogElement(text, expected, debug = false) {
                return recog(text, expected, Entities_1.Entities.UI_ELEMENT, debug);
            }
            describe('recognizes', () => {
                it('single character', () => {
                    recogElement(' {a} ', 'a');
                });
                it('single word', () => {
                    recogElement(' {foo} ', 'foo');
                });
                it('words', () => {
                    recogElement(' {foo bar} ', 'foo bar');
                });
                it('word with number', () => {
                    recogElement(' {x1} ', 'x1');
                });
            });
            describe('does not recognize', () => {
                it('number', () => {
                    recogElement(' {1} ', null);
                });
                it('starting with a number', () => {
                    recogElement(' {1a} ', null);
                });
            });
        });
        describe('ui_literal', () => {
            function recogLiteral(text, expected, debug = false) {
                return recog(text, expected, Entities_1.Entities.UI_LITERAL, debug);
            }
            describe('recognizes', () => {
                it('single character', () => {
                    recogLiteral(' <x> ', 'x');
                });
                it('single word', () => {
                    recogLiteral(' <foo> ', 'foo');
                });
                it('words', () => {
                    recogLiteral(' <foo bar> ', 'foo bar');
                });
                it('id notation', () => {
                    recogLiteral(' <#foo> ', '#foo');
                });
                it('name notation', () => {
                    recogLiteral(' <@foo> ', '@foo');
                });
                it('css notation', () => {
                    recogLiteral(' <.foo> ', '.foo');
                });
                it('xpath notation', () => {
                    recogLiteral(' <//foo> ', '//foo');
                });
                it('mobile name notation', () => {
                    recogLiteral(' <~foo> ', '~foo');
                });
                it('long, escaped CSS selectors', () => {
                    recogLiteral(' <#js-repo-pjax-container \> div.container.new-discussion-timeline.experiment-repo-nav \> div.repository-content \> div.release-show \> div \> div.release-body.commit.open.float-left \> div.my-4 \> h2>', '#js-repo-pjax-container \> div.container.new-discussion-timeline.experiment-repo-nav \> div.repository-content \> div.release-show \> div \> div.release-body.commit.open.float-left \> div.my-4 \> h2');
                });
                it('xpath with brackets, quotes, at', () => {
                    recogLiteral('<//*[@id="event-1684412635"]/span[2]/a>', '//*[@id="event-1684412635"]/span[2]/a');
                });
            });
            describe('does not recognize', () => {
                it('number', () => {
                    recogLiteral(' <1> ', null);
                });
                it('starting with a number', () => {
                    recogLiteral(' <1a> ', null);
                });
            });
        });
        describe('query', () => {
            function recogQuery(text, expected, debug = false) {
                return recog(text, expected, Entities_1.Entities.QUERY, debug);
            }
            it('in uppercase', () => {
                recogQuery(' "SELECT foo FROM bar" ', 'SELECT foo FROM bar');
            });
            it('in lowercase', () => {
                recogQuery(' "select foo FROM bar" ', 'select foo FROM bar');
            });
            it('with spaces before select', () => {
                recogQuery(' "  SELECT foo FROM bar" ', 'SELECT foo FROM bar');
            });
        });
        describe('constant', () => {
            function recogConstant(text, expected, debug = false) {
                return recog(text, expected, Entities_1.Entities.CONSTANT, debug);
            }
            describe('recognizes', () => {
                it('a single word', () => {
                    recogConstant(' [foo] ', 'foo');
                });
                it('words', () => {
                    recogConstant(' [foo bar] ', 'foo bar');
                });
                it('words with numbers', () => {
                    recogConstant(' [foo 1 bar 2] ', 'foo 1 bar 2');
                });
            });
            describe('should not recognize', () => {
                it('starting with a number', () => {
                    recogConstant(' [1foo] ', null);
                });
                it('a number', () => {
                    recogConstant(' [1] ', null);
                });
                it('words with spaces around', () => {
                    recogConstant(' [  foo bar  ] ', null);
                });
            });
        });
        describe('value list', () => {
            function recogValueList(text, expected, debug = false) {
                return recog(text, expected, Entities_1.Entities.VALUE_LIST, debug);
            }
            it('does not recognize an empty list', () => {
                let r = nlp.recognize('en', ' [] ');
                expect(r.entities).toHaveLength(0);
            });
            it('single number', () => {
                recogValueList(' [1] ', '[1]');
            });
            it('numbers', () => {
                recogValueList(' [1, 2] ', '[1, 2]');
            });
            it('strings', () => {
                recogValueList(' [ "alice", "bob" ] ', '[ "alice", "bob" ]');
            });
            it('strings with escaped strings', () => {
                recogValueList(' [ "alice say \\\"hello\\\"" ] ', '[ "alice say \\\"hello\\\"" ]');
            });
            it('strings and numbers mixed', () => {
                recogValueList(' [ "alice", 1, "bob", 2 ] ', '[ "alice", 1, "bob", 2 ]');
                recogValueList(' [ 1, "alice", 2, "bob", 3, 4, "bob", "joe" ] ', '[ 1, "alice", 2, "bob", 3, 4, "bob", "joe" ]');
            });
        });
    });
});

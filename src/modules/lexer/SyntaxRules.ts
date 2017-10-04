/**
 * Syntax rules.
 * 
 * @author Thiago Delgado Pinto
 */

 // This syntax rule will be the default for all UI Actions.
const DEFAULT_UI_ACTION_SYNTAX_RULE = {

    // Minimal number of targets it accepts (has precedence over all min values).
    minTargets: 1,
    // Maximal number of targets it accepts (has precedence over all max values).
    maxTargets: 1,

    // Accepted targets (NLP entities).
    //   When "maxTargets" is 1 and "targets" has more than one element, it accepts one OR another.
    //   When "maxTargets" > 1, the minimal of each target should be configured.
    targets: [ "element", "value" ],

    // Minimal and maximal values of each target.
    //   They will be considered only if they appear in "targets".
    //   If they do, they will should be *disconsidered* if:
    //     - min > minTargets
    //     - max > maxTargets
    element: { min: 1, max: 999 },
    value: { min: 1, max: 999 },
    number: { min: 1, max: 999 },

    // Other action or actions that must be used together.
    mustBeUsedWith: []    
};


// Syntax rules for the supported UI Actions
const UI_ACTIONS_SYNTAX_RULES = [
    { name: "append" },
    { name: "attachFile" },
    { name: "check", maxTargets: 999 },
    { name: "clear", maxTargets: 999 },
    { name: "click", maxTargets: 999 },
    { name: "close" },
    { name: "doubleClick" },
    { name: "drag", mustBeUsedWith: [ "drop" ] },
    { name: "drop", mustBeUsedWith: [ "drag" ] },
    { name: "fill", maxTargets: 999, value: { min: 0, max: 1 } },
    { name: "hide", maxTargets: 999 },
    { name: "move", minTargets: 1, maxTargets: 3, targets: [ "element", "number" ], element: { min: 1, max: 1 }, number: { min: 0, max: 2 } },
    { name: "open" },
    { name: "press", targets: [ "value" ], maxTargets: 5 },
    { name: "refresh" },
    //...
];


 // This syntax rule will be the default for all the properties of UI Elements.
 const DEFAULT_UI_ELEMENT_PROPERTY_SYNTAX_RULE = {
    
        // Minimal number of targets it accepts (has precedence over all min values).
        minTargets: 1,
        // Maximal number of targets it accepts (has precedence over all max values).
        maxTargets: 1,
    
        // Accepted targets (NLP entities).
        //   When "maxTargets" is 1 and "targets" has more than one element, it accepts one OR another.
        //   When "maxTargets" > 1, the minimal of each target should be configured.
        targets: [ "value" ],
    
        // Minimal and maximal values of each target.
        //   They will be considered only if they appear in "targets".
        //   If they do, they will should be *disconsidered* if:
        //     - min > minTargets
        //     - max > maxTargets
        value: { min: 1, max: 1 },
        ui_element_type: { min: 1, max: 1 },
        number: { min: 1, max: 1 },    
        script: { min: 1, max: 1 },
        datatype: { min: 1, max: 1 },
    
        // Other action or actions that must be used together.
        mustBeUsedWith: []    
    };

// Syntax rules for the supported properties of UI Elements
const UI_ELEMENT_PROPERTIES_SYNTAX_RULES = [
    { name: "id", targets: [ "value" ] },
    { name: "type", targets: [ "ui_element_type" ] },
    { name: "datatype", targets: [ "datatype" ] }, // e.g. string, integer, ...
    { name: "value", targets: [ "value", "number" ] },
    { name: "minlength", targets: [ "number" ] },
    { name: "maxlength", targets: [ "number" ] },
    { name: "minvalue", targets: [ "number" ] },
    { name: "maxvalue", targets: [ "value", "number" ] },
    { name: "format", targets: [ "value" ] },
];
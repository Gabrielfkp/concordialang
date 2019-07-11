/**
 * Language symbols.
 *
 * @author Thiago Delgado Pinto
 */
export abstract class Symbols {

    // prefixes

    static COMMENT_PREFIX = '#';
    static IMPORT_PREFIX = '"';
    static TAG_PREFIX = '@';
    static LANGUAGE_PREFIX = '#';
    static PY_STRING_PREFIX = '"""';
    static TABLE_PREFIX = '|';
    static LIST_ITEM_PREFIX = '-';
    static UI_ELEMENT_PREFIX = '{';
    static UI_LITERAL_PREFIX = '<';
    static CONSTANT_PREFIX = '[';

    // sufixes
    static IMPORT_SUFFIX = '"';
    static UI_LITERAL_SUFFIX = '>';
    static UI_ELEMENT_SUFFIX = '}';
    static CONSTANT_SUFFIX = ']';

    // separators

    static LANGUAGE_SEPARATOR = ':';
    static TITLE_SEPARATOR = ':';
    static TABLE_CELL_SEPARATOR = '|';
    static IMPORT_SEPARATOR = ',';
    static REGEX_SEPARATOR = ':';
    static TAG_VALUE_SEPARATOR = ',';
    static VALUE_SEPARATOR = ',';

    static FEATURE_TO_UI_ELEMENT_SEPARATOR = ':';
    static UI_PROPERTY_REF_SEPARATOR = '|';

    // wrappers

    static VALUE_WRAPPER = '"';
    static COMMAND_WRAPPER = "'";
}
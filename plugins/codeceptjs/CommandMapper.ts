import { ATSCommand } from "../../modules/testscript/AbstractTestScript";
import { render } from "mustache";

/**
 * Command comparison
 *
 * @author Thiago Delgado Pinto
 */
export enum CmdCmp {
    ONE_VALUE,
    ONE_VALUE_SAME_TARGET_TYPE,
    ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER,
    ONE_VALUE_SAME_OPTION,
    ONE_VALUE_SAME_OPTION_SAME_MODIFIER,
    ONE_VALUE_OR_ARRAY,
    ONE_VALUE_ONE_NUMBER_SAME_TARGET_TYPE,
    ONE_VALUE_ONE_NUMBER_SAME_OPTION,
    ONE_VALUE_TWO_NUMBERS_SAME_OPTION,
    ONE_VALUE_SAME_MODIFIER,
    ONE_VALUE_TWO_NUMBERS,
    ONE_VALUE_THREE_NUMBERS,

    ONE_NUMBER,

    ONE_TARGET,
    ONE_TARGET_ONE_VALUE,
    ONE_TARGET_ONE_NUMBER,
    ONE_TARGET_TWO_NUMBERS_SAME_OPTION,
    ONE_TARGET_SAME_TARGET_TYPE,
    ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER,
    ONE_TARGET_ONE_VALUE_ONE_OPTION_SAME_MODIFIER,
    ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER,
    ONE_TARGET_SAME_OPTION,
    ONE_TARGET_SAME_MODIFIER,

    SAME_TARGET_TYPE,
    SAME_OPTION,

    TWO_TARGETS,

    TWO_VALUES_SAME_OPTION,

    TWO_NUMBERS,
    TWO_NUMBERS_SAME_OPTION
}

/**
 * Command configuration
 *
 * @author Thiago Delgado Pinto
 */
export interface CmdCfg {
    action: string,
    comp: CmdCmp,
    modifier?: string,
    options?: string[],
    targetType?: string,
    template: string,
    valuesAsNonArray?: boolean,
    singleQuotedValues?: boolean,
    singleQuotedTargets?: boolean
}

/**
 * Command mapper
 *
 * @author Thiago Delgado Pinto
 */
export class CommandMapper {

    constructor( protected commands: CmdCfg[] ) {
    }

    /**
     * Converts an abstract test script command into one or more lines of code.
     *
     * @param cmd Abstract test script command
     */
    map( cmd: ATSCommand ): string[] {

        let cmdCfg = this.commands.find( cfg => this.areCompatible( cfg, cmd ) );
        if ( ! cmdCfg ) {
            return [ this.makeCommentWithCommand( cmd ) ];
        }
        return this.makeCommands( cmdCfg, cmd );
    }

    /**
     * Make one or more lines of code from the given command configuration and
     * abstract test script command.
     *
     * @param cfg Command configuration
     * @param cmd Abstract test script command
     * @returns Lines of code.
     */
    makeCommands( cfg: CmdCfg, cmd: ATSCommand ): string[] {

        // singleQuotedTargets defaults to true if undefined
        if ( undefined === cfg.singleQuotedTargets ) {
            cfg.singleQuotedTargets = true;
        }

        const COMMENT_TEMPLATE = ' // ({{{location.line}}},{{{location.column}}}){{#comment}} {{{comment}}}{{/comment}}';

        if ( !! cmd[ "db" ] && cmd.action === 'connect' ) {

            const values = {
                value: [ '"' + cmd.values[ 0 ] + '"', JSON.stringify( cmd[ "db" ]  ) ],
                location : cmd.location,
                comment: cmd.comment,
            };
            const template = cfg.template + COMMENT_TEMPLATE;

            return [ render( template, values ) ];
        }

        const template = cfg.template + COMMENT_TEMPLATE;

        const values = {
            target   : ! cmd.targets ? '' : this.targetsToParameters( cmd.targets, cfg.singleQuotedTargets ),
            value    : ! cmd.values ? '' : this.valuesToParameters( cmd.values, cfg.valuesAsNonArray, cfg.singleQuotedValues ),
            location : cmd.location,
            comment  : cmd.comment,
            modifier : cmd.modifier,
            options  : cmd.options,
        }

        return [ render( template, values ) ];
    }

    /**
     * Make a code comment with the data of a abstract test script command.
     *
     * @param cmd Abstract test script command
     */
    makeCommentWithCommand( cmd: ATSCommand ): string {
        let s = '// ';
        for ( let prop in cmd ) {
            let val = cmd[ prop ];
            if ( Array.isArray( val ) ) {
                if ( 0 === val.length ) {
                    val = '[]';
                } else {
                    val = '[ "' + val.join( '", "' ) + '" ]';
                }
            } else if ( undefined === val ) {
                continue;
            } else {
                val = '"' + ( val || '' ) + '"';
            }
            s += prop.substr( 0, 1 ).toUpperCase() + prop.substr( 1 ) + ': ' + val + '  ';
        }
        return s;
    }

    /**
     * Returns true whether the command configuration is compatible with the
     * given abstract test script command.
     *
     * @param cfg Command configuration
     * @param cmd Abstract test script command
     */
    areCompatible( cfg: CmdCfg, cmd: ATSCommand ): boolean {

        if ( cfg.action !== cmd.action ) {
            return false;
        }

        function isNumber( x ): boolean {
            return 'number' === typeof x || ! isNaN( parseInt( x ) );
        }

        function sameTargetTypes( cfg: CmdCfg, cmd: ATSCommand ): boolean {
            return ( cmd.targetTypes || [] ).indexOf( cfg.targetType ) >= 0;
        }

        function includeOptions( from: CmdCfg, into: ATSCommand ): boolean {
            let targetOptions = into.options || [];
            for ( let o of from.options || [] ) {
                if ( targetOptions.indexOf( o ) < 0 ) {
                    return false; // not found
                }
            }
            return true; // all options of cfg were found at cmd
        }

        const valuesCount = ( cmd.values || [] ).length;
        const targetsCount = ( cmd.targets || [] ).length;

        switch( cfg.comp ) {

            case CmdCmp.ONE_VALUE: return 1 === valuesCount;

            case CmdCmp.ONE_VALUE_SAME_TARGET_TYPE: {
                return 1 === valuesCount && sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER: {
                return 1 === valuesCount && sameTargetTypes( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.ONE_VALUE_SAME_OPTION: {
                return 1 === valuesCount && includeOptions( cfg, cmd );
            }

            case CmdCmp.ONE_VALUE_SAME_OPTION_SAME_MODIFIER: {
                return 1 === valuesCount && includeOptions( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.ONE_VALUE_OR_ARRAY: return valuesCount >= 1;

            case CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_TARGET_TYPE: {
                const ok = 2 === valuesCount && isNumber( cmd.values[ 1 ] ) &&
                    sameTargetTypes( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_VALUE_ONE_NUMBER_SAME_OPTION: {
                const ok = 2 === valuesCount && isNumber( cmd.values[ 1 ] ) &&
                    includeOptions( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_VALUE_TWO_NUMBERS_SAME_OPTION: {
                const ok = 3 === valuesCount && isNumber( cmd.values[ 1 ] ) &&
                    isNumber( cmd.values[ 2 ] ) && includeOptions( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                    cmd.values[ 2 ] = Number( cmd.values[ 2 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_VALUE_SAME_MODIFIER: {
                return 1 === valuesCount && cmd.modifier === cfg.modifier;
            }

            case CmdCmp.ONE_VALUE_TWO_NUMBERS: {
                const ok = 3 === valuesCount && isNumber( cmd.values[ 1 ] ) &&
                    isNumber( cmd.values[ 2 ] );
                if ( ok ) {
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                    cmd.values[ 2 ] = Number( cmd.values[ 2 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_VALUE_THREE_NUMBERS: {
                const ok = 4 === valuesCount && isNumber( cmd.values[ 1 ] ) &&
                    isNumber( cmd.values[ 2 ] ) && isNumber( cmd.values[ 3 ] );
                if ( ok ) {
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                    cmd.values[ 2 ] = Number( cmd.values[ 2 ] );
                    cmd.values[ 3 ] = Number( cmd.values[ 3 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_NUMBER: {
                const ok = 1 === valuesCount && isNumber( cmd.values[ 0 ] );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_TARGET: return 1 === targetsCount;

            case CmdCmp.ONE_TARGET_ONE_VALUE: {
                return 1 === targetsCount && 1 === valuesCount;
            }

            case CmdCmp.ONE_TARGET_ONE_NUMBER: {
                const ok = 1 === targetsCount && 1 === valuesCount &&
                    isNumber( cmd.values[ 0 ] );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_TARGET_TWO_NUMBERS_SAME_OPTION: {
                const ok = 1 === targetsCount && 2 === valuesCount &&
                    isNumber( cmd.values[ 0 ] ) && isNumber( cmd.values[ 1 ] ) &&
                    includeOptions( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                }
                return ok;
            }

            case CmdCmp.ONE_TARGET_SAME_TARGET_TYPE: {
                return 1 === targetsCount && sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.ONE_TARGET_SAME_TARGET_TYPE_SAME_OPTION_SAME_MODIFIER: {
                return 1 === targetsCount && sameTargetTypes( cfg, cmd ) &&
                    includeOptions( cfg, cmd ) && cfg.modifier === cmd.modifier;
            }

            case CmdCmp.ONE_TARGET_ONE_VALUE_ONE_OPTION_SAME_MODIFIER: {
                return 1 === targetsCount && 1 === valuesCount &&
                    includeOptions( cfg, cmd ) && cfg.modifier === cmd.modifier;
            }

            case CmdCmp.ONE_TARGET_ONE_VALUE_SAME_TARGET_TYPE_SAME_MODIFIER: {
                return 1 === targetsCount && 1 === valuesCount && sameTargetTypes( cfg, cmd ) &&
                    cfg.modifier === cmd.modifier;
            }

            case CmdCmp.ONE_TARGET_SAME_OPTION: {
                return 1 === targetsCount && includeOptions( cfg, cmd );
            }

            case CmdCmp.ONE_TARGET_SAME_MODIFIER: {
                return 1 === targetsCount && cfg.modifier === cmd.modifier;
            }

            case CmdCmp.SAME_TARGET_TYPE: {
                return 0 === targetsCount && 0 === valuesCount && sameTargetTypes( cfg, cmd );
            }

            case CmdCmp.SAME_OPTION: {
                return 0 === targetsCount && 0 === valuesCount && includeOptions( cfg, cmd );
            }

            case CmdCmp.TWO_TARGETS: {
                return 2 === targetsCount;
            }

            case CmdCmp.TWO_VALUES_SAME_OPTION: {
                return 2 == valuesCount && includeOptions( cfg, cmd );
            }

            case CmdCmp.TWO_NUMBERS: {
                let ok = 2 == valuesCount && isNumber( cmd.values[ 0 ] ) &&
                    isNumber( cmd.values[ 1 ] );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                }
                return ok;
            }

            case CmdCmp.TWO_NUMBERS_SAME_OPTION: {
                let ok = 2 == valuesCount && isNumber( cmd.values[ 0 ] ) &&
                    isNumber( cmd.values[ 1 ] ) && includeOptions( cfg, cmd );
                if ( ok ) {
                    cmd.values[ 0 ] = Number( cmd.values[ 0 ] );
                    cmd.values[ 1 ] = Number( cmd.values[ 1 ] );
                }
                return ok;
            }
        }

        return false;
    }

    /**
     * Convert targets to function parameters.
     *
     * @param targets Targets to convert, usually UI literals.
     * @param singleQuotedTargets Whether the targets should be wrapped with single quotes.
     */
    private targetsToParameters( targets: string[] | any[], singleQuotedTargets?: boolean ): string {

        if ( 0 === targets.length ) {
            return '';
        }

        const areStrings = 'string' === typeof targets[ 0 ];
        if ( areStrings ) {
            let strTargets: string[] = targets as string[];
            if ( 1 === targets.length ) {
                return this.convertSingleTarget( strTargets[ 0 ], singleQuotedTargets );
            }
            return strTargets
                .map( v => this.convertSingleTarget( v, singleQuotedTargets ) )
                .join( ', ' );
        }

        function valueReplacer( key, value ) {
            if ( typeof value === 'string' && value.charAt( 0 ) === '@' ) {
                return { name: value.substr( 1 ) };
            }
            return value;
        }

        const content = JSON.stringify( targets, valueReplacer );
        // remove [ and ]
        return content.substring( 1, content.length - 1 );
    }

    private convertSingleTarget( target: string, singleQuotedTargets: boolean ): string {
        return ! singleQuotedTargets
            ? target.charAt( 0 ) === '@' ? `{name: "${target.substr(1)}"}` : `"${target}"`
            : target.charAt( 0 ) === '@' ? `{name: '${target.substr(1)}'}` : `'${target}'`;
    }

    /**
     * Convert values to function parameters.
     *
     * @param values Values to convert.
     * @param valueAsNonArrayWhenGreaterThanOne Whether wants to convert an
     *      array to single values when its size is greater than one.
     * @param singleQuotedValues Whether is desired to use single quotes.
     */
    private valuesToParameters(
        values: any[],
        valueAsNonArrayWhenGreaterThanOne: boolean = false,
        singleQuotedValues: boolean = false
    ): string {
        if ( 0 === values.length ) {
            return '';
        }
        if ( 1 === values.length ) {
            return this.convertSingleValue( values[ 0 ], singleQuotedValues );
        }
        const joint = values
            .map( v => this.convertSingleValue( v, singleQuotedValues ) )
            .join( ', ' );
        if ( ! valueAsNonArrayWhenGreaterThanOne ) {
            return '[' + joint + ']';
        }
        return joint;
    }

    private convertSingleValue( value: any, singleQuotedValues: boolean = false ) {
        if ( typeof value === 'string' ) {
            return singleQuotedValues ? `'${value}'` : `"${value}"`;
        }
        return value;
    }

    // private sameValues( a: string[], b: string[] ): boolean {
    //     if ( a === b || ( ! a && ! b ) ) {
    //         return true;
    //     }
    //     if ( ( ! a && !! b ) || ( !! a && ! b ) ) {
    //         return false;
    //     }
    //     let aa = Array.isArray( a ) ? a.sort() : [];
    //     let bb = Array.isArray( b ) ? b.sort() : [];
    //     if ( 0 === aa.length && 0 === b.length ) {
    //         return true;
    //     }
    //     return a.join('').toLowerCase() === b.join('').toLowerCase();
    // }

}
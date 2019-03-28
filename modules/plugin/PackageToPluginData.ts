import { PluginData } from "./PluginData";


export class PackageToPluginData {

    constructor( private readonly _packageProperty: string ) {
    }

    public convert( pkg: any ): PluginData | undefined {

        const prop = pkg[ this._packageProperty ];
        if ( ! prop ) {
            return; // undefined
        }

        let data: PluginData = {
            // From the package object
            name: pkg.name,
            description: pkg.description,
            version: pkg.version,
            // authors: this.packageAuthorToAuthors( pkg.author ).concat( this.packageContributorsToAuthors( pkg.contributors ) ),
            authors: this.packageAuthorToAuthors( pkg.author ),
            file: pkg.main,

            // From the custom property
            isFake: prop.isFake,
            targets: prop.targets,
            class: prop.class,
            install: prop.install,
            uninstall: prop.uninstall,
            serve: prop.serve
        };

        return data;
    }

    public packageAuthorToAuthors( author: any ): string[] {
        const authorStr = this.packageAuthorToString( author );
        if ( ! authorStr ) {
            return [];
        }
        return [ authorStr ];
    }

    // public packageContributorsToAuthors( contributors: any[] ): string[] {
    //     if ( ! contributors ) {
    //         return [];
    //     }
    //     return contributors.map( c => this.packageAuthorToString( c ) );
    // }

    public packageAuthorToString( author: any ): string | undefined {
        if ( ! author ) {
            return; // undefined
        }
        switch ( typeof author ) {
            case 'string': return author;
            case 'object': {
                const email = ! author.email ? '' : ( ' <' + author.email + '>' );
                return ( author.name || '' ) + email;
            }
            default: return; // undefined
        }
    }

}
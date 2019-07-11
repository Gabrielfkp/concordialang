import { NLPResult } from "./NLPResult";
import { NLPEntity } from "./NLPEntity";

export class NLPUtil {

    entitiesNamed( name: string, nlpResult: NLPResult ): NLPEntity[] {
        return nlpResult.entities.filter( e => name === e.entity );
    }

    hasEntityNamed( name: string, nlpResult: NLPResult ): boolean {
        return this.entitiesNamed( name, nlpResult ).length > 0;
    }

    /**
     * Returns true if the NLPResult has all the informed entity names.
     *
     * @param names
     * @param nlpResult
     */
    hasEntitiesNamed( names: string[], nlpResult: NLPResult ): boolean {
        return names.every( name => this.hasEntityNamed( name, nlpResult ) );
    }

    entityNamed( name: string, nlpResult: NLPResult ): NLPEntity | null {
        return nlpResult.entities.find( e => name === e.entity ) || null;
    }

    valuesOfEntitiesNamed( name: string, nlpResult: NLPResult ): string[] {
        return nlpResult.entities.filter( e => name === e.entity ).map( e => e.value );
    }

}
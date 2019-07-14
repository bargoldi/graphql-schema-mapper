import { FragmentMap } from "./fragment-map.model";
import { SelectionSetNode } from 'graphql';
import { graphqlSchemaUtils } from "./graphql-schema.utils";

export class GraphQLSchemaDelegator {
    constructor(private delegationName = 'delegation', private endpoint: string,
        private fieldsMapping: { [key: string]: string },
    ) {
    }

    public executeDelegationFetch() {

    }

    public convertQuery(selectionSet: SelectionSetNode, fragments: FragmentMap) {
        const queryFields = [];

        const value = graphqlSchemaUtils.findFieldNode({ selectionSet, fragments }, 'value');

        const entityFieldNodes = [];

        if (value) {
            entityFieldNodes.push(
                ...graphqlSchemaUtils.extractFieldNodes({
                    selectionSet: value ? value.selectionSet : null,
                    fragments,
                    relevantTypes: ['Bombline', 'MibMtb']
                })
            )
        }

        for (const field of entityFieldNodes) {
            const mappedField = this.fieldsMapping[field.name.value];

            if (mappedField) {
                queryFields.push(`${field.name.value}:${mappedField}`);
            }
        }

        return  
        `

        `;  
    }
}
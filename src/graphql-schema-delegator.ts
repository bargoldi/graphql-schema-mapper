import { FragmentMap } from "./fragment-map.model";
import { HttpLink } from 'apollo-link-http';
import * as fetch from 'node-fetch';
import { execute, ApolloLink, createOperation } from 'apollo-link';
import { SelectionSetNode, GraphQLResolveInfo, parse } from 'graphql';
import { graphqlSchemaUtils } from "./graphql-schema.utils";
import { DelegationParams } from "./query-params.model";

export class GraphQLSchemaDelegator {
    constructor(private delegationName = 'delegation', private endpoint: string,
        private operationsMapping: { [key: string]: string },
        private fieldsMapping: { [key: string]: string },
    ) {
    }

    public executeDelegationFetch(operation: string, info: GraphQLResolveInfo, parameters: DelegationParams) {
        const entitiesNode = graphqlSchemaUtils.findFieldNode({
            selectionSet: { selections: info.fieldNodes } as any,
            fragments: info.fragments
        }, this.operationsMapping[operation]);

        const query = this.convertQuery(entitiesNode && entitiesNode.selectionSet, info.fragments);

        return this.executeOperation(query, this.getHttpLink(parameters.headers), this.operationsMapping[operation], parameters.queryVariables);
    }

    public executeOperation(query: string, httpLink: HttpLink, operation: string, queryVariables: any) {
        return execute(httpLink, createOperation({}, {
            operationName: operation,
            query: parse(query),
            variables: queryVariables
        }))
    }

    public convertQuery(operation: string, selectionSet: SelectionSetNode, fragments: FragmentMap) {
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

        return `
            query ${this.operationsMapping[operation]}() {

            }
        `;
    }

    getHttpLink(headers) {
        const serviceContext = (operation, forward) => {
            operation.setContext(context => {
                context = {
                    ...context,
                    headers: {
                        ...context.headers,
                        headers
                    }
                }

                return context;
            });

            return forward(operation);
        }

        return ApolloLink.from([serviceContext, new HttpLink({
            uri: this.endpoint,
            fetch,
            credentials: 'include',
            includeExtensions: true
        })])
    }
}
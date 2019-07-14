import { FragmentDefinitionNode } from 'graphql';

export interface FragmentMap {
    [fragmentName: string]: FragmentDefinitionNode
}
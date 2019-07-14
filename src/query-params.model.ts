import { FieldNode } from 'graphql';
import { FragmentMap } from "./fragment-map.model";

export interface DelegationParams<T = any> {
    fieldNode?: FieldNode;
    fragments?: FragmentMap;
    queryVariables?: T;
    extensions?: any;
    headers?: any;
}

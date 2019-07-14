import { FragmentMap } from "./fragment-map.model";
import { SelectionSetNode, FieldNode } from 'graphql';

class GraphQLSchemaUtils {
  public findFieldNode({ selectionSet, fragments }: { selectionSet?: SelectionSetNode, fragments: FragmentMap }, fieldName: string) {
    if (!selectionSet) {
      return null;
    }

    return this.extractFieldNodes({ selectionSet, fragments }).find(fieldNode => {
      return fieldNode.name ? fieldNode.name.value === fieldName : false
    })
  }

  public extractFieldNodes({ selectionSet, fragments, relevantTypes }: {
    selectionSet: SelectionSetNode, fragments: FragmentMap, relevantTypes?: string[]
  }): FieldNode[] {
    const operationFieldNodes: FieldNode[] = [];

    for (const selection of selectionSet.selections) {
      switch (selection.kind) {
        case 'Field': {
          operationFieldNodes.push(selection)

          break;
        }
        case 'FragmentSpread': {
          operationFieldNodes.push(...this.extractFieldNodes({ selectionSet: fragments[selection.name.value].selectionSet, fragments, relevantTypes }))
        }
        case 'InlineFragment': {
          let relevantField = true;

          // check that the fragment type is relevant
          if (relevantTypes && !(relevantTypes as any).includes(selection.typeCondition.name.value)) {
            relevantField = false;
          }

          if (relevantField) {
            operationFieldNodes.push(...this.extractFieldNodes({ selectionSet: selection.selectionSet, fragments, relevantTypes }));
          }
        }
      }
    }

    return operationFieldNodes;
  }

  public containsTypeSpread({ selectionSet, fragments, relevantTypes }: {
    selectionSet: SelectionSetNode, fragments: FragmentMap, relevantTypes: string[]
  }): boolean {
    let typeFound = false;

    for (const selection of selectionSet.selections) {
      switch (selection.kind) {
        case 'Field': {
          break;
        }
        case 'FragmentSpread': {
          typeFound = typeFound || this.containsTypeSpread({ selectionSet: fragments[selection.name.value].selectionSet, fragments, relevantTypes })
        }
        case 'InlineFragment': {
          // check that the fragment type is relevant
          if (!(relevantTypes as any).includes(selection.typeCondition.name.value)) {
            typeFound = true;
          }

          typeFound = typeFound || this.containsTypeSpread({ selectionSet: fragments[selection.name.value].selectionSet, fragments, relevantTypes })
        }
      }
    }

    return typeFound
  }
}

export const graphqlSchemaUtils = new GraphQLSchemaUtils();

import { resolveSelections } from '../graphql-info/resolve-selections';
import { GraphQLResolveInfo } from 'graphql';

export function getSelectedFields(
  info: GraphQLResolveInfo,
  relationPropertyName: string,
  fieldsType = ['*.*'],
) {
  const myFields = resolveSelections(
    [{ field: info.fieldName, selections: fieldsType }],
    info,
  );
  return myFields.map((field) => `${relationPropertyName}.${field}`);
}

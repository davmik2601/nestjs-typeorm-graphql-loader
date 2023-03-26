import { resolveSelections } from '../graphql-info/resolve-selections';
import { GraphQLResolveInfo } from 'graphql';
import { EntityTarget, getRepository } from 'typeorm';

export function getSelectedFields(
  info: GraphQLResolveInfo,
  entityClass: EntityTarget<any>,
  relationPropertyName: string,
  fieldsType = ['*.*'],
) {
  const myFields = resolveSelections(
    [{ field: info.fieldName, selections: fieldsType }],
    info,
  );
  const selectedFields = myFields.map(
    (field) => `${relationPropertyName}.${field}`,
  );

  console.log('selectedFields ------> ', selectedFields);

  const attributes = getRepository(entityClass).metadata.columns.map(
    (column) => `${relationPropertyName}.${column.propertyName}`,
  );

  console.log('attributes ------> ', attributes);

  const diff = selectedFields.filter((field) => !attributes.includes(field));

  console.log('diff ------> ', selectedFields);

  const common = diff.length
    ? attributes.filter(
      (attr) => selectedFields.includes(attr) || attr.startsWith('_'),
    )
    : selectedFields.filter((field) => attributes.includes(field));

  console.log('common ------> ', common);

  return common;
}

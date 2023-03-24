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
    (column) => column.propertyName,
  );

  console.log('attributes ------> ', attributes);

  const commonFields = selectedFields.filter((field) =>
    attributes.includes(field),
  );

  console.log('attributes ------> ', commonFields);

  return commonFields;
}

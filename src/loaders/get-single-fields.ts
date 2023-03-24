import { resolveSelections } from '../graphql-info/resolve-selections';
import { GraphQLResolveInfo } from 'graphql';
import {EntityTarget, getRepository} from "typeorm";

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
  const selectedFields = myFields.map((field) => `${relationPropertyName}.${field}`);

  const attributes = getRepository(entityClass).metadata;

  console.log('attributes ------> ', attributes);

  return selectedFields;
}

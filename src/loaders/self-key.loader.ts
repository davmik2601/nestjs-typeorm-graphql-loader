import {GraphQLResolveInfo} from 'graphql';
import {groupBy} from 'lodash';
import type {Connection} from 'typeorm';
import type {RelationMetadata} from 'typeorm/metadata/RelationMetadata';
import type {SelfKeyFunc} from '../interfaces/typeorm-loader-handler.interface';
import {getSelectedFields} from './get-single-fields';
import {TypeormLoaderOptions} from "../interfaces/typeorm-loader.interface";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DataLoader = require('dataloader');

/**
 * A common loader for loading entities by their own key.
 */
export class SelfKeyDataloader<V> extends DataLoader<any, V[]> {
  constructor(
    info: GraphQLResolveInfo,
    relation: RelationMetadata,
    connection: Connection,
    selfKeyFunc: SelfKeyFunc,
    options: TypeormLoaderOptions,
  ) {
    super(async (ids) => {
      const columns = relation.inverseRelation?.joinColumns;

      if (!columns || columns.length === 0) {
        throw new Error(
          `No relational columns has been found for: ${relation.propertyName}`,
        );
      }

      let query = connection.createQueryBuilder<V>(
        relation.type,
        relation.propertyName,
      );

      await Promise.all(
        columns.map((column) => {
          const key = `${relation.propertyName}_${column.propertyName}`;
          const selectedFields = getSelectedFields(
            info,
            relation.type,
            relation.propertyName,
          );

          query.select([
            ...selectedFields,
            `${relation.propertyName}.${column.propertyPath}`,
          ]);

          if (options?.polymorphic) {
            query = query.andWhere(
              `${relation.propertyName}.entityType = :entityType`,
              {entityType: options.polymorphic.entityType}
            )
          }

          query = query.andWhere(
            `${relation.propertyName}.${column.propertyPath} IN (:...${key})`,
            {[key]: ids},
          );
        }),
      );

      const entities = groupBy(await query.getMany(), selfKeyFunc);

      return ids.map((id) => entities[id] ?? []);
    });
  }
}

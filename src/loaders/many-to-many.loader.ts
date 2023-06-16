import {GraphQLResolveInfo} from 'graphql';
import type {Connection} from 'typeorm';
import type {RelationMetadata} from 'typeorm/metadata/RelationMetadata';
import {SelfKeyFunc} from '../interfaces/typeorm-loader-handler.interface';
import {getSelectedFields} from './get-single-fields';
import {Dictionary, keyBy} from 'lodash';
import {getConnection} from 'typeorm';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DataLoader = require('dataloader');

/**
 * A common loader to handle to many relations.
 */
export class ManyToManyDataloader<V> extends DataLoader<any, V> {
  constructor(
    info: GraphQLResolveInfo,
    relation: RelationMetadata,
    connection: Connection,
    selfKeyFunc: SelfKeyFunc,
    parent: any,
  ) {
    const parentMetadata = getConnection().getMetadata(parent.constructor);

    super(async (ids) => {
      const selectedFields = getSelectedFields(
        info,
        relation.type,
        relation.propertyName,
      );

      const data = await connection
        .createQueryBuilder<V>(parentMetadata.target, parentMetadata.targetName)
        .whereInIds(ids)
        .leftJoinAndSelect(
          `${parentMetadata.targetName}.${relation.propertyName}`,
          relation.propertyName,
        )
        .select([
          ...selectedFields,
          `${parentMetadata.targetName}.${parentMetadata.primaryColumns[0].propertyName}`,
        ])
        .getMany();

      console.log(data);

      const entities = keyBy(
        data,
        parentMetadata.primaryColumns[0].propertyName,
      ) as Dictionary<V>;

      return ids.map((id) => entities[id][relation.propertyName] || []);
    });
  }
}

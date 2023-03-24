import { GraphQLResolveInfo } from 'graphql';
import type { Connection } from 'typeorm';
import type { RelationMetadata } from 'typeorm/metadata/RelationMetadata';
import { directLoader } from './direct.loader';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DataLoader = require('dataloader');

/**
 * A common loader to handle to many relations.
 */
export class ToManyDataloader<V> extends DataLoader<any, V> {
  constructor(
    info: GraphQLResolveInfo,
    relation: RelationMetadata,
    connection: Connection,
  ) {
    super(
      directLoader(info, relation, connection, (entity) =>
        relation.inverseEntityMetadata.primaryColumns[0].getEntityValue(entity),
      ),
    );
  }
}

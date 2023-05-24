import {GraphQLResolveInfo} from 'graphql';
import type {Connection} from 'typeorm';
import type {RelationMetadata} from 'typeorm/metadata/RelationMetadata';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DataLoader = require('dataloader');

import {directLoader} from './direct.loader';

/**
 * A common loader to handle to one relations.
 */
export class ToOneDataloader<V> extends DataLoader<any, V> {
  constructor(
    info: GraphQLResolveInfo,
    relation: RelationMetadata,
    connection: Connection,
  ) {
    super(
      directLoader(
        info,
        relation,
        connection,
        relation.inverseEntityMetadata.primaryColumns[0].propertyName,
      ),
    );
  }
}

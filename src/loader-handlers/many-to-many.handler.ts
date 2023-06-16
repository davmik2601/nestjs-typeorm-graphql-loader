import type {RelationMetadata} from 'typeorm/metadata/RelationMetadata';

import {handler} from './callback-handler.handler';
import type {Context} from '../interfaces/context.interface';
import {GraphQLResolveInfo} from 'graphql';
import {SelfKeyFunc} from '../interfaces/typeorm-loader-handler.interface';
import {ManyToManyDataloader} from '../loaders/many-to-many.loader';

export async function handleManyToMany<V>(
  selfKeyFunc: SelfKeyFunc,
  parent: any,
  context: Context,
  info: GraphQLResolveInfo,
  relation: RelationMetadata,
): Promise<any> {
  return handler(
    context,
    relation,
    relation.entityMetadata.primaryColumns,
    (connection): any =>
      new ManyToManyDataloader<V>(
        info,
        relation,
        connection,
        selfKeyFunc,
        parent,
      ),
    async (dataloader, columns) => {
      return dataloader.load(columns[0].getEntityValue(parent));
    },
  );
}

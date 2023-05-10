import type { RelationMetadata } from 'typeorm/metadata/RelationMetadata';

import { handler } from './callback-handler.handler';
import type { Context } from '../interfaces/context.interface';
import type { ForeignKeyFunc } from '../interfaces/typeorm-loader-handler.interface';
import { ToManyDataloader } from '../loaders';
import { GraphQLResolveInfo } from 'graphql';

export async function handleToMany<V>(
  foreignKeyFunc: ForeignKeyFunc,
  parent: any,
  context: Context,
  info: GraphQLResolveInfo,
  relation: RelationMetadata,
): Promise<any> {
  return handler(
    context,
    relation,
    relation.inverseEntityMetadata.primaryColumns,
    (connection): any => new ToManyDataloader<V>(info, relation, connection),
    async (dataloader) => {
      return dataloader.loadMany(foreignKeyFunc(parent));
    },
  );
}
